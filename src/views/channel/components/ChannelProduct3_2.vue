<template>
	<div class="app-container">
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5" class="text-danger">
				
			</el-col>
		</el-row>
		<el-row :gutter="10" class="mb20">
			<!-- <el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['channel_product:save3:add']">新增</el-button>
			</el-col> -->
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-upload2" @click="open2 = true" v-hasPermi="['channel_product:import3']">导入</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" icon="el-icon-delete" @click="handleDeleteDisable" v-hasPermi="['channel_product:delete_disable']">删除已付款</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<el-table-column label="图片名称" prop="account" />
			<el-table-column label="金额" prop="amount" width="120" />
			<el-table-column label="拉单次数" prop="num" width="120" />
			<el-table-column label="状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="120" fixed="right">
				<template slot-scope="scope">
					<!-- <el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel_product:save3:edit']" plain>编辑</el-button> -->
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel_product:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="图片名称">
						<el-input-number v-model="form.account" :controls="false" class="w210px text-left" disabled />
					</el-form-item>
					<el-form-item label="实付金额">
						<el-input-number v-model="form.amount" :controls="false" class="w210px text-left" />
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
		
		<el-dialog title="导入" :visible.sync="open2" width="800px" height="800px" append-to-body :close-on-click-modal="false" :before-close="closeImport">
			<channel-product3-import :data-no="dataNo" v-if="open2" @closeImport="closeImport" />
		</el-dialog>
	</div>
</template>

<script>
import ChannelProduct3Import from './ChannelProduct3Import_2.vue'

export default {
	components: {
		ChannelProduct3Import,
	},
	props: {
		dataNo: {
			type: String,
			default: ''
		},
	},
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
			open2: false,
			
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
	},
	created() {
		let that = this
		
		that.getUserInfo();
		that.getList();
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
				url: "channel_product/list",
				data: {
					channel_account_no: that.dataNo
				},
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
				name: undefined,
				account: undefined,
				qrcode: undefined,
				amount: 0,
				status: 1,
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
				url: "channel_product/view",
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
			
			that.form.channel_account_no = that.dataNo
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					
					that.request({
						url: "channel_product/save3",
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
					url: "channel_product/delete",
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
		handleDeleteDisable(row) {
			let that = this;
			
			that.$confirm("是否确认删除所有已付款?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "channel_product/delete_disable",
					data: {
						channel_account_no: that.dataNo,
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
					url: "channel_product/enable",
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
					url: "channel_product/disable",
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
		resolveQR(event) {
			let that = this;
			
			const result = that.qrDecode(event.file)
			result.then(res => {
				if (res.data) {
					// console.log(res.data);
					that.form.qrcode = res.data
					// console.log('that.form', that.form);
					that.$message.success("识别二维码成功!")
				} else {
					// console.log(res);
					that.$message.error("识别二维码失败, 请重新上传")
				}
			})
			.catch(err => {
				that.$message.error(JSON.stringify(err));
			});
		},
		handleQrcode() {
			let that = this;
			
			console.log('handleQrcode that.qrcode', that.form.qrcode)
		},
		closeImport() {
			let that = this
			
			that.open2 = false
			that.getList()
		},
	}
};
</script>
<style scoped lang="scss">
.qrcode_image {
	width: 50px;
}
</style>