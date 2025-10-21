<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item label="关键词" label-width="56px" class="mr20">
				<el-input v-model="queryParams.keyword" placeholder="消息" clearable />
			</el-form-item>
			<el-form-item label="添加时间" label-width="70px" class="mr20">
				<el-date-picker v-model="queryParams.create_time" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<!-- <el-form-item v-if="user.center_id == 0" label="所属代理" label-width="70px" class="mr20">
        <el-select v-model="queryParams.center_id" placeholder="请选择所属代理" clearable>
          <el-option v-for="item in centerListOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item> -->
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['bot_batch:save:add']">群发</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column align="center" type="selection" width="55" />
			<!-- <el-table-column align="center" label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column align="center" label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" />
			<el-table-column align="center" label="接收商户ID" prop="receive" />
			<el-table-column align="center" label="消息" prop="message" />
			<el-table-column align="center" label="图片">
				<template slot-scope="scope">
					<img :src="scope.row.photo" alt="图片" style="max-width: 100px" v-if="scope.row.photo" />
				</template>
			</el-table-column>
			<!-- <el-table-column align="center" label="所属代理" prop="center_name" :show-overflow-tooltip="true" /> -->
			<el-table-column align="center" label="创建时间" prop="create_time" min-width="140" />
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="接收商户">
						<el-radio-group v-model="form.business_type">
							<el-radio v-for="item in getMessageAgentBusiness" :key="item.value" :label="item.value">
								{{ item.label }}
							</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="" v-show="
							form.business_type === 2 || form.business_type === 3
						">
						<el-checkbox-group v-model="form.card_business_ids">
							<el-checkbox v-for="item in form.business_type === 3
									? card_business_info
									: business_info" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
						</el-checkbox-group>
					</el-form-item>
					<el-form-item label="消息">
						<el-input v-model="form.message" maxlength="50" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<el-form-item label="图片">
						<ImageUploadOneOss :limit="1" v-model="form.photo"></ImageUploadOneOss>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">发送</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'bot_batch_list', // 路由上 '/' 换成 '_'
	data() {
		return {
			user: this.getUser(),
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,

			centerListOption: [],
			optionRole: [],

			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				keyword: '',
				type: '',
				center_id: '',
				create_time: []
			},
			// 表单参数
			form: {},

			business_info: [],
			card_business_info: [],

			// 表单校验
			rules: {
				name: [
					{
						required: true,
						message: '代理名称不能为空',
						trigger: 'blur'
					}
				],
				phone: [
					{
						required: true,
						pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
						message: '请输入正确的电话号码',
						trigger: 'blur'
					}
				],
				email: [
					{
						type: 'email',
						message: '请输入正确的邮箱地址',
						trigger: ['blur', 'change']
					}
				]
			}
		}
	},
	computed: {
		getMessageBusiness() {
			return this.$store.getters.getMessageBusiness
		},
		getMessageAgentBusiness() {
			return this.$store.getters.getMessageAgentBusiness
		}
	},
	created() {
		this.getList()
		this.getBusiness()
		this.getCardBusiness()
		// console.log("==============================================================")
		// var user = getUser()
		// console.log("user", user)

		// const obj = { name: 'ryan' }
		// Cookies.set('user', JSON.stringify(obj))
		// var user = JSON.parse(Cookies.get('user'))
		// console.log("user", user)
	},
	methods: {
		indexMethod(index) {
			return (
				index + this.queryParams.limit * (this.queryParams.page - 1) + 1
			)
		},
		/** 查询列表 */
		getList() {
			let that = this

			that.loading = true
			that.request({
				url: 'bot_batch/list',
				data: that.queryParams
			}).then(res => {
				that.list = res.data.list
				that.total = res.data.total
				that.loading = false
			})
		},
		getBusiness() {
			let that = this
			that.request({
				url: 'bot_batch/get_business',
				data: {}
			})
				.then(res => {
					that.business_info = res.data // 赋值商户信息
				})
				.catch(error => {
					console.error('Failed to fetch business data:', error)
				})
		},
		getCardBusiness() {
			let that = this
			that.request({
				url: 'bot_batch/get_card_business',
				data: {}
			})
				.then(res => {
					that.card_business_info = res.data // 赋值商户信息
				})
				.catch(error => {
					console.error('Failed to fetch business data:', error)
				})
		},
		// 取消按钮
		cancel() {
			this.open = false
			this.reset()
		},
		// 表单重置
		reset() {
			this.form = {
				card_business_ids: [],
				business_type: 1
			}
			this.resetForm('form')
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.page = 1
			this.getList()
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.queryParams = {
				page: 1,
				limit: this.queryParams.limit,
				keyword: '',
				status: '',
				center_id: '',
				create_time: []
			}
			this.resetForm('queryForm')
			this.getList()
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.no)
			this.single = selection.length != 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.getBusiness()
			this.getCardBusiness()
			this.reset()
			this.open = true
			this.title = '添加'
		},
		/** 提交按钮 */
		submitForm: function () {
			let that = this

			that.$refs['form'].validate(valid => {
				if (valid) {
					that.request({
						url: 'bot_batch/save',
						data: that.form
					}).then(res => {
						that.open = false
						that.getList()

						if (that.form.id != undefined) {
							that.$modal.msgSuccess('编辑成功')
						} else {
							that.$modal.msgSuccess('新增成功')
						}
					})
				}
			})
		}
	}
}
</script>
