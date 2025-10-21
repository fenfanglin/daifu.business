<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item label="关键词" label-width="56px" class="mr20">
				<el-input v-model="queryParams.keyword" placeholder="群聊名称/商户ID" clearable />
			</el-form-item>
			<el-form-item label="状态" label-width="40px" class="mr20">
				<el-select v-model="queryParams.status" placeholder="请选择运行状态" clearable>
					<el-option v-for="item in modelStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
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
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['bot_operator:save:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" icon="el-icon-delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['bot_operator:delete']">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['bot_operator:export']">导出</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column align="center" type="selection" width="55" />
			<!-- <el-table-column align="center" label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column align="center" label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" />
			<!--      <el-table-column align="center" label="商户ID" prop="business_id" :show-overflow-tooltip="true" fixed="left" />-->
			<el-table-column align="center" label="TG用户名" prop="operator" />
			<!-- <el-table-column align="center" label="所属代理" prop="center_name" :show-overflow-tooltip="true" /> -->
			<el-table-column align="center" label="状态" width="100">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.status" active-value="1" inactive-value="-1" @change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column align="center" label="创建时间" prop="create_time" min-width="140" />
			<el-table-column align="center" label="操作" width="200" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['bot_operator:save:edit']" plain>编辑</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['bot_operator:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="TG用户名">
						<el-input v-model="form.operator" maxlength="50" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<el-form-item label="状态">
						<el-radio-group v-model="form.status">
							<el-radio v-for="item in modelStatus" :label="item.value">{{ item.label }}</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'bot_operator_list', // 路由上 '/' 换成 '_'
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
				status: '',
				center_id: '',
				create_time: []
			},
			// 表单参数
			form: {},
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
		modelStatus() {
			return this.$store.getters.modelStatus
		}
	},
	created() {
		this.getList()
		this.getCenterListOption()

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
				url: 'bot_operator/list',
				data: that.queryParams
			}).then(res => {
				that.list = res.data.list
				that.total = res.data.total
				that.loading = false
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
				name: undefined,
				phone: undefined,
				status: 1,
				center_id: undefined,
				role_id: undefined
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
			this.reset()
			this.open = true
			this.title = '添加'

			this.getOptionRole(0)
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this

			that.reset()
			that.request({
				url: 'bot_operator/view',
				data: {
					no: row.no
				}
			}).then(res => {
				that.form = res.data
				that.open = true
				that.title = '编辑'
			})
		},
		/** 提交按钮 */
		submitForm: function () {
			let that = this

			that.$refs['form'].validate(valid => {
				if (valid) {
					that.request({
						url: 'bot_operator/save',
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
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			let that = this

			const ids = row.no || this.ids

			that.$confirm('是否确认删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(function () {
					that.request({
						url: 'bot_operator/delete',
						data: {
							ids
						}
					}).then(res => {
						that.$modal.msgSuccess('删除成功')
						that.getList()
					})
				})
				.catch(() => { })
		},
		/** 状态编辑按钮 */
		handleStatusChange(row) {
			switch (row.status) {
				case '1':
					this.enable(row)
					break
				case '-1':
					this.disable(row)
					break
				default:
					break
			}
		},
		/** 更多操作触发 */
		handleCommand(command, row) {
			switch (command) {
				case 'enable':
					this.enable(row)
					break
				case 'disable':
					this.disable(row)
					break
				default:
					break
			}
		},
		/** 启用 */
		enable(row) {
			let that = this

			that.$confirm('是否确认启用此账号?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(function () {
					that.request({
						url: 'bot_operator/enable',
						data: {
							no: row.no
						}
					})
						.then(res => {
							that.$modal.msgSuccess('启用成功')
							that.getList()
						})
						.catch(() => {
							row.status = '-1'
						})
				})
				.catch(() => {
					row.status = '-1'
				})
		},
		/** 禁用 */
		disable(row) {
			let that = this

			that.$confirm('是否确认禁用此账号?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(function () {
					that.request({
						url: 'bot_operator/disable',
						data: {
							no: row.no
						}
					})
						.then(res => {
							that.$modal.msgSuccess('禁用成功')
							that.getList()
						})
						.catch(() => {
							row.status = '1'
						})
				})
				.catch(() => {
					row.status = '1'
				})
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this

			that.exportExcel(
				'bot_operator/export',
				this.queryParams,
				'管理员'
			).then(res => { })
		},
		getCenterListOption() {
			let that = this

			// if (that.user.center_id == 0) {
			// 	that.request({
			// 		url: "center/list_option",
			// 	}).then(res => {
			// 		that.centerListOption = res.data
			// 	});
			// }
		},
		// 上传文件
		async singleFileChange(file, fileList) {
			let that = this

			const isOverSize = 5 * 1024 * 1024
			const fileTypeArray = ['image/jpeg', 'image/png', 'image/jpg']
			if (file.size > isOverSize) {
				// that.formData = { ...that.formData }
				fileList.pop()
				return that.$message({
					message: '图片大小不超过5M',
					type: 'warning'
				})
			}
			if (!fileTypeArray.find(type => type === file.raw.type)) {
				// that.formData = { ...that.formData }
				fileList.pop()
				return that.$message({
					message: '格式为JPG、JPEG、PNG',
					type: 'warning'
				})
			}

			that.upload(file, url => {
				if (url) {
					that.form.image = url
				}
			})
		},
		/** 上传成功 */
		imgSuccess(res, file, fileList) {
			// this.fileList = fileList;
			// //这里我是用一个fileList数组存取，当保存的时候进行图片路径处理
			// console.log("--------------------------------------------------------")
			// console.log(res)
		},
		/** 上传失败 */
		imgError(res) {
			this.$message({
				type: 'error',
				message: '附件上传失败'
			})
		},
		/** 删除图片 */
		imgRemove(file, fileList) {
			this.fileList = fileList
		},
		/** 附件上传图片预览事件，这个就是将路径直接放进一个弹窗显示出来就可以了 */
		handlePictureCardPreview(file) {
			this.dialogImageUrl = file.url
			this.dialogVisible = true
		}
	}
}
</script>
