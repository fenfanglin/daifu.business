<template>
	<div class="app-container">
		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<!-- <el-table-column label="ID" prop="id" :show-overflow-tooltip="true" fixed="left" width="60" /> -->
			<el-table-column label="通道" prop="channel_name" :show-overflow-tooltip="true" min-width="200" />
			<el-table-column label="费率" prop="rate" :show-overflow-tooltip="true" min-width="140" />
			<el-table-column label="随机金额" min-width="100">
				<template slot-scope="scope">
					<span :class="scope.row.random_amount_class">{{scope.row.random_amount_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="随机金额浮动" min-width="150">
				<template slot-scope="scope">
					<span>{{scope.row.random_amount_min}} - {{scope.row.random_amount_max}}</span>
				</template>
			</el-table-column>
			<el-table-column label="回调" min-width="150">
				<template slot-scope="scope">
					<span :class="scope.row.notify_amount_class">{{scope.row.notify_amount_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="180" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['pay_setting:save:edit']" plain>编辑</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['pay_setting:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- <pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/> -->

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="通道">
						<el-input v-model="form.channel_name" :disabled="true" />
					</el-form-item>
					<el-form-item label="费率">
						<el-input v-model="form.rate" :disabled="true" />
					</el-form-item>
					<el-form-item label="随机金额">
						<el-radio-group v-model="form.random_amount">
							<el-radio label="-1">关闭</el-radio>
							<el-radio label="1">加随机金额</el-radio>
							<el-radio label="2">减随机金额</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="随机金额浮动">
						<el-input-number v-model="form.random_amount_min" :controls="false" class="w210px text-left" />
						<el-input-number v-model="form.random_amount_max" :controls="false" class="w210px text-left ml10" />
					</el-form-item>
					<el-form-item label="回调">
						<el-radio-group v-model="form.notify_amount">
							<el-radio label="1">实付金额</el-radio>
							<el-radio label="2">提交金额</el-radio>
						</el-radio-group>
					</el-form-item>
					<!-- <el-form-item v-if="form.is_auth_when_edit_account" label="谷歌验证码">
						<el-input v-model="form.google_code" autocomplete="off" class="w210px" />
					</el-form-item> -->
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
	name: "user_pay_setting", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
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
			title: "",
			// 是否显示弹出层
			open: false,
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				keyword: "",
				type: "",
				status: "",
				create_time: [],
			},
			// 表单参数
			form: {},
			
			// 表单校验
			rules: {
				name: [
					{ required: true, message: "代理名称不能为空", trigger: "blur" }
				],
				phone: [
					{
						required: true,
						pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
						message: "请输入正确的电话号码",
						trigger: "blur",
					}
				],
				email: [
					{
						type: "email",
						message: "请输入正确的邮箱地址",
						trigger: ["blur", "change"],
					}
				],
			},
		}
	},
	computed: {
		modelStatus2() {
			return this.$store.getters.modelStatus2
		},
		channelType() {
			return this.$store.getters.channelType
		},
	},
	created() {
		let that = this
		
		that.getUserInfo();
		that.getList();
	},
	beforeDestroy() {
		// clearInterval(this.interval)
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "pay_setting/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.loading = false;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				
			};
			this.resetForm("form");
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.page = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.queryParams = {
				page: 1,
				limit: this.queryParams.limit,
				keyword: "",
				status: "",
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.no)
			this.single = selection.length != 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加";
			this.form.is_auth_when_edit_account = this.user.is_auth_when_edit_account
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "pay_setting/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.open = true;
				that.title = "编辑";
			});
		},
		/** 提交按钮 */
		submitForm: function() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "pay_setting/save",
						data: that.form,
					}).then(res => {
						that.open = false;
						that.getList();
						
						if (that.form.id != undefined) {
							that.$modal.msgSuccess("编辑成功");
						} else {
							that.$modal.msgSuccess("新增成功");
						}
					});
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			let that = this;
			
			const ids = row.no || this.ids;
			
			that.$confirm("是否确认删除?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "pay_setting/delete",
					data: {
						ids,
					},
				}).then(res => {
					that.$modal.msgSuccess("删除成功");
					that.getList();
				});
			}).catch(() => {
				
			})
		},
		/** 状态编辑按钮 */
		handleStatusChange(row) {
			switch (row.status) {
				case "1":
					this.enable(row);
					break;
				case "-1":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 更多操作触发 */
		handleCommand(command, row) {
			switch (command) {
				case "enable":
					this.enable(row);
					break;
				case "disable":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 开启 */
		enable(row) {
			let that = this;
			
			that.$confirm("是否确认开启此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "pay_setting/enable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("开启成功");
					that.getList();
				}).catch(() => {
					row.status = "-1";
				})
			}).catch(() => {
				row.status = "-1";
			})
		},
		/** 关闭 */
		disable(row) {
			let that = this;
			
			that.$confirm("是否确认关闭此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "pay_setting/disable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("关闭成功");
					that.getList();
				}).catch(() => {
					row.status = "1";
				})
			}).catch(() => {
				row.status = "1";
			})
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("pay_setting/export", this.queryParams, "管理员").then(res => {
				
			});
		},
	}
};
</script>
