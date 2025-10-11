<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.id" placeholder="商户ID" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="账号/名称" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in modelStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="注册时间开始"
					end-placeholder="注册时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item> -->
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['business:save:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['business:export']">导出</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column label="商户编号" prop="id" :show-overflow-tooltip="true" fixed="left" width="100" />
			<el-table-column label="商户密钥" prop="secret_key" width="350" />
			<el-table-column label="登录账号" prop="username" :show-overflow-tooltip="true" />
			<el-table-column label="名称" prop="realname" :show-overflow-tooltip="true" />
			<el-table-column label="转账方式" prop="card_type_str" :show-overflow-tooltip="true" />
			<el-table-column label="单笔控制" prop="amount_range" :show-overflow-tooltip="true" />
			<el-table-column label="订单费率" prop="order_rate" :show-overflow-tooltip="true" />
			<el-table-column label="固定费用" prop="commission" :show-overflow-tooltip="true" />
			<el-table-column label="余额" prop="allow_withdraw" :show-overflow-tooltip="true" />
			<el-table-column label="更新时间" prop="update_time" min-width="120" />
			<el-table-column label="状态" width="120">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.status" active-value="1" inactive-value="-1" @change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="340" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['business:save:edit']" plain>编辑</el-button>
					<el-button type="primary" class="tb-button" icon="el-icon-s-finance" @click="handleEditWithdraw(scope.row)" v-hasPermi="['business:save_withdraw']" plain>充值</el-button>
					<el-button type="primary" class="tb-button" icon="el-icon-lock" @click="handleEditPassword(scope.row)" v-hasPermi="['business:change_password']" plain>密码</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['business:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="商户账号">
						<el-input v-model="form.username" maxlength="20" show-word-limit autocomplete="off" :disabled="form.id > 0" />
					</el-form-item>
					<el-form-item label="密码">
						<el-input v-model="form.password" maxlength="20" show-word-limit autocomplete="off" />
					</el-form-item>
					<el-form-item label="商户名称">
						<el-input v-model="form.realname" maxlength="20" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item>
					<el-form-item label="转账方式">
						<el-radio-group v-model="form.card_type" @change="zhuanzhang">
							<el-radio v-for="item in modelStatus4" :label="item.value">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="工作室" v-show="form.card_type==2">
						<el-select v-model="form.card_business_ids" @change="$forceUpdate();">
							<el-option v-for="item in optionCardBusiness2" :key="item.index" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>

					<el-form-item label="工作室" v-show="form.card_type==1">
						<el-checkbox-group v-model="form.card_business_ids">
							<el-checkbox v-for="item in optionCardBusiness1" :key="item.index" :label="item.id" :value="item.id">{{item.name}}</el-checkbox>
						</el-checkbox-group>
					</el-form-item>
					<el-form-item label="订单费率">
						<el-input-number v-model="form.order_rate" :controls="false" />
						<p style="color: red; margin-top: 0px; margin-bottom: 0px">注：费率为千分位，例如：千分之三则填0.003</p>
					</el-form-item>
					<el-form-item label="固定费用">
						<el-input-number v-model="form.commission" :controls="false" />
						<p style="color: red; margin-top: 0px; margin-bottom: 0px">注：每笔订单固定扣除费用</p>
					</el-form-item>
					<el-form-item label="单笔控制">
						<el-input-number v-model="form.min_amount" :controls="false" class="w210px text-left" />
						<el-input-number v-model="form.max_amount" :controls="false" class="w210px text-left ml10" />
					</el-form-item>
					<!-- <el-form-item label="电话">
						<el-input v-model="form.phone" maxlength="11" show-word-limit autocomplete="off">
						</el-input>
					</el-form-item> -->
					<!-- <el-form-item label="认证">
						<el-radio-group v-model="form.verify_status">
							<el-radio v-for="item in verifyStatus" :label="item.value">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item> -->
					<el-form-item label="登录ip白名单">
						<el-input type="textarea" v-model="form.login_ip" :rows="5" />
					</el-form-item>
					<!-- <el-form-item label="谷歌密钥">
						<el-input v-model="form.google_secret_key" maxlength="32" show-word-limit />
					</el-form-item> -->
					<el-form-item label="状态">
						<el-radio-group v-model="form.status">
							<el-radio v-for="item in modelStatus" :label="item.value">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog title="商户余额" :visible.sync="openWithdraw" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="商户账号">
						<el-input v-model="form.username" maxlength="20" show-word-limit autocomplete="off" :disabled="form.id > 0" />
					</el-form-item>
					<el-form-item label="商户余额">
						<el-input v-model="form.allow_withdraw" maxlength="20" show-word-limit autocomplete="off" :disabled="form.id > 0" />
					</el-form-item>
					<el-form-item label="操作">
						<el-radio-group v-model="withdraw_type">
							<el-radio :label="1">增加</el-radio>
							<el-radio :label="-1">减少</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="金额">
						<el-input-number v-model="form.amount" :controls="false" />
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="form.remark" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitFormWithdraw">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog :title="title" :visible.sync="openPassword" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item label="商户账号">
						<el-input v-model="form.username" maxlength="20" show-word-limit autocomplete="off" :disabled="form.id > 0" />
					</el-form-item>
					<el-form-item label="密码">
						<el-input v-model="form.password" maxlength="20" show-word-limit autocomplete="off" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitFormPassword">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
export default {
	name: "business_list_all", // 路由上 '/' 换成 '_'
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
			title: "",
			// 是否显示弹出层
			open: false,
			openPassword: false,
			openWithdraw: false,

			withdraw_type: 1,

			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				keyword: "",
				verify_status: "",
				status: "",
				create_time: [],
			},
			// 表单参数
			form: {},

			optionCardBusiness: [],
			optionCardBusiness1: [],
			optionCardBusiness2: [],
			optionChannelBusiness: [],

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
		modelStatus() {
			return this.$store.getters.modelStatus
		},
		modelStatus4() {
			return this.$store.getters.modelStatus4
		},
		verifyStatus() {
			return this.$store.getters.verifyStatus
		},
	},
	created() {
		this.getList();
		this.getOptionCardBusiness();
		// this.getOptionChannelBusiness();
	},
	methods: {

		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			let that = this

			that.loading = true;
			that.request({
				url: "business/list",
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
			this.openPassword = false;
			this.openWithdraw = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				card_business_ids: [],
				min_amount: 0.01,
				max_amount: 999999.99,
			}

			this.formPassword = {}

			this.resetForm("form");
			this.resetForm("formPassword");
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
				center_id: "",
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
			this.form.status = 1;
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this
			that.reset();
			that.open = true;

			// that.getOptionCardBusiness();
			// 重新加载卡商
			that.getOptionChannelBusiness();

			that.$nextTick(async () => {
				await that.request({
					url: "business/view",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.form = res.data;
					if (that.form.card_type == '2') {
						if (that.form.card_business_ids.includes(',')) {
							that.form.card_business_ids = ''
						} else {
							that.form.card_business_ids = Number(that.form.card_business_ids)
						}
					} else if (that.form.card_type == '1') {

						that.form.card_business_ids = that.form.card_business_ids

						// that.form.card_business_ids = that.form.card_business_ids.split(",")
					}

					that.title = "编辑";
				});
			})
		},
		handleEditPassword(row) {
			let that = this

			that.reset();
			that.request({
				url: "business/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.openPassword = true;
				that.title = "密码";
			});
		},
		handleEditWithdraw(row) {
			let that = this

			that.reset();
			that.request({
				url: "business/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.form.remark = '';
				that.withdraw_type = 1;
				that.openWithdraw = true;
			});
		},
		/** 提交按钮 */
		submitForm: function () {
			let that = this

			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "business/save",
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
		submitFormPassword: function () {
			let that = this

			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "business/change_password",
						data: that.form,
					}).then(res => {
						that.cancel();
						that.getList();

						that.$modal.msgSuccess("成功");
					});
				}
			});
		},
		submitFormWithdraw: function () {
			let that = this

			that.$refs["form"].validate(valid => {
				if (valid) {
					let form = that.form
					form.withdraw_type = that.withdraw_type

					that.request({
						url: "business/save_withdraw",
						data: form,
					}).then(res => {
						that.cancel();
						that.loading = true;

						setTimeout(function () {
							that.$modal.msgSuccess("成功");
							that.getList();
							that.loading = false;
						}, 1500);

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
			}).then(function () {
				that.request({
					url: "business/delete",
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
		/** 启用 */
		enable(row) {
			let that = this;

			that.$confirm("是否确认启用此账号?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function () {
				that.request({
					url: "business/enable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("启用成功");
					that.getList();
				}).catch(() => {
					row.status = "-1";
				})
			}).catch(() => {
				row.status = "-1";
			})
		},
		/** 禁用 */
		disable(row) {
			let that = this;

			that.$confirm("是否确认禁用此账号?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function () {
				that.request({
					url: "business/disable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("禁用成功");
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

			that.exportExcel("business/export", this.queryParams, "管理员").then(res => {

			});
		},
		zhuanzhang(value) {
			let that = this;
			console.log('value', value);

			if (value == 1) {
				that.form.card_business_ids = []
			} else if (value == 2) {
				that.form.card_business_ids = ''
			}
		},
		async getOptionCardBusiness() {
			let that = this;
			that.optionCardBusiness1 = []
			that.optionCardBusiness2 = []
			// that.$nextTick(()=>{
			await that.request({
				url: "option/card_business",
				data: {},
			}).then(res => {
				that.optionCardBusiness = res.data
				for (let i = 0; i < that.optionCardBusiness.length; i++) {
					if (that.optionCardBusiness[i].card_type == '1') {
						that.optionCardBusiness1.push(that.optionCardBusiness[i])
					} else {
						that.optionCardBusiness2.push(that.optionCardBusiness[i])
					}

				}

			});
			// })
		},
		getOptionChannelBusiness() {
			let that = this;

			that.request({
				url: "option/channel",
				data: {},
			}).then(res => {
				that.optionChannelBusiness = res.data
			});
		},
	}
};
</script>
<style lang="scss">
.rate_note {
	line-height: 1.8;
}
</style>
