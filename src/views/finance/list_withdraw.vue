<template>
	<div class="app-container">
		<el-row v-if="user.type == 3" :gutter="40" class="panel-group-withdraw">
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{user.allow_withdraw}}</div>
						<div class="card-panel-text">商户余额</div>
<!--						<div class="card-panel-btn">-->
<!--							<el-button type="primary" icon="el-icon-s-finance" size="medium" @click="handleEditWithdraw">提现</el-button>-->
<!--						</div>-->
					</div>
				</div>
			</el-col>
		</el-row>

		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<!-- <el-form-item class="mr10">
				<el-input v-model="queryParams.order_no" placeholder="订单号" clearable/>
			</el-form-item> -->
			<!-- <el-form-item class="mr10">
				<el-input v-model="queryParams.account" placeholder="卡号/U地址" clearable/>
			</el-form-item> -->
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="提交时间开始"
					end-placeholder="提交时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
<!--			<el-form-item class="mr10">-->
<!--				<el-select v-model="queryParams.status" placeholder="状态" clearable>-->
<!--					<el-option v-for="item in withdrawStatus" :key="item.value" :label="item.label" :value="item.value" />-->
<!--				</el-select>-->
<!--			</el-form-item>-->
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['order:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

    <el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
      <el-table-column label="商户id" prop="sub_business_id" fixed="left" min-width="15%" />
      <el-table-column label="类型" prop="type_str" min-width="17%" />
      <el-table-column label="发生金额" min-width="20%">
        <template slot-scope="scope">
          <span v-if="scope.row.money >= 0" class="text-success">{{scope.row.money}}</span>
          <span v-else class="text-danger">{{scope.row.money}}</span>
        </template>
      </el-table-column>
      <el-table-column label="发生前余额" prop="money_before" min-width="20%" />
      <el-table-column label="发生后余额" prop="money_after" min-width="20%" />
      <el-table-column label="时间" prop="create_time" min-width="30%" />
      <el-table-column label="备注" prop="remark" width="400" />
    </el-table>

		<pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/>

		<el-dialog title="提现" :visible.sync="openWithdraw" width="400px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="formWithdraw" :rules="rules" label-width="0">
				<div class="withdraw_logo">
					<img src="@/assets/images/wallet.png">
				</div>
				<el-row>
					<el-form-item label="">
						<el-input-number v-model="formWithdraw.amount" placeholder="0.00" :controls="false" class="text-left w100" />
					</el-form-item>
					<el-form-item label="">
						<el-select v-model="formWithdraw.type" placeholder="提现方式" class="w100">
							<el-option v-for="item in withdrawType" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<div v-if="formWithdraw.type == 1">
						<el-form-item label="">
							<el-input v-model="formWithdraw.name" placeholder="账户姓名" maxlength="20" />
						</el-form-item>
						<el-form-item label="">
							<el-input v-model="formWithdraw.account" placeholder="银行卡号" maxlength="30" />
						</el-form-item>
						<el-form-item label="">
							<el-input v-model="formWithdraw.bank_name" placeholder="银行名称" maxlength="20" />
						</el-form-item>
					</div>
					<div v-else-if="formWithdraw.type == 2">
						<el-form-item label="">
							<el-input v-model="formWithdraw.account" placeholder="Usdt钱包地址" maxlength="50" />
						</el-form-item>
					</div>
					<div v-else-if="formWithdraw.type == 3">
						<el-form-item label="">
							<el-input v-model="formWithdraw.name" placeholder="支付宝姓名" maxlength="20" />
						</el-form-item>
						<el-form-item label="">
							<el-input v-model="formWithdraw.account" placeholder="支付宝账号" maxlength="255" />
						</el-form-item>
					</div>
				</el-row>

				<!-- <div class="withdraw_note text-danger">
					1、务必转账于金额一致，擅自修改金额会导致提现失败。<br>
					2、请在订单有效时间转账，超过时间会导致提现不到账。<br>
					3、提现不到账请联系客服。<br>
				</div> -->
			</el-form>
			<div slot="footer" class="dialog-footer dialog-footer-withdraw">
				<el-button type="primary" @click="submitFormWithdraw">提交订单</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="120px">
				<el-row>
					<el-form-item label="商户">
						<el-input v-model="form.sub_business_name" :disabled="true" />
					</el-form-item>
					<div v-if="form.type == 1">
						<el-form-item label="账户姓名">
							<el-input v-model="form.name" :disabled="true" />
						</el-form-item>
						<el-form-item label="银行卡号">
							<el-input v-model="form.account" :disabled="true" />
						</el-form-item>
						<el-form-item label="银行名称">
							<el-input v-model="form.bank_name" :disabled="true" />
						</el-form-item>
					</div>
					<div v-else-if="form.type == 2">
						<el-form-item label="Usdt钱包地址">
							<el-input v-model="form.account" :disabled="true" />
						</el-form-item>
					</div>
					<div v-else-if="form.type == 3">
						<el-form-item label="支付宝姓名">
							<el-input v-model="form.name" :disabled="true" />
						</el-form-item>
						<el-form-item label="支付宝账号">
							<el-input v-model="form.account" :disabled="true" />
						</el-form-item>
					</div>
					<el-form-item label="提现金额">
						<el-input v-model="form.amount" :disabled="true" />
					</el-form-item>
					<el-form-item label="审核">
						<el-radio-group v-model="form.status">
							<el-radio :label="1">成功</el-radio>
							<el-radio :label="2">失败</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="form.remark" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitFormVerify">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "finance_list_withdraw", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],

			// 是否显示弹出层
			open: false,
			openWithdraw: false,

			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				order_no: "",
				status: "",
				create_time: [],
			},
			// 表单参数
			title: "",
			form: {},
			formWithdraw: {},
			detail: {},
			setting: {},

			// 表单校验
			rules: {

			},
		}
	},
	computed: {
		withdrawStatus() {
			return this.$store.getters.withdrawStatus
		},
		withdrawType() {
			return this.$store.getters.withdrawType
		},
	},
	created() {
		this.getUserInfo();
		this.getList();
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		/** 查询列表 */
		getList() {
			let that = this

			that.loading = true;
			that.request({
				url: "withdraw/list",
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
			this.openWithdraw = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {}
			this.formWithdraw = {}

			this.resetForm("form");
			this.resetForm("formWithdraw");
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
		handleView(row) {
			let that = this

			that.reset();
			that.request({
				url: "withdraw/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.detail = res.data;
				that.openDetail = true;
			});
		},
		handleEditWithdraw() {
			let that = this

			that.reset();
			that.request({
				url: "withdraw/get_setting",
				data: {},
			}).then(res => {
				that.setting = res.data;
				that.openWithdraw = true;
				that.formWithdraw.amount = that.user.allow_withdraw
			});
		},
		handleEditVerify(row) {
			let that = this

			that.reset();
			that.request({
				url: "withdraw/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.open = true;
			});
		},
		submitFormWithdraw: function() {
			let that = this

			that.request({
				url: "withdraw/submit",
				data: that.formWithdraw,
			}).then(res => {
				that.cancel()
				that.loading = true;

				setTimeout(function() {
					that.$modal.msgSuccess("成功");
					that.getUserInfo();
					that.getList();
					that.loading = false;
				}, 1500);
			});
		},
		submitFormVerify: function() {
			let that = this

			that.request({
				url: "withdraw/verify",
				data: that.form,
			}).then(res => {
				that.cancel()
				that.getList();
			});
		},

		/** 导出按钮操作 */
		handleExport() {
			let that = this;

			that.exportExcel("withdraw/export", this.queryParams, "充值记录").then(res => {

			});
		},
	}
};
</script>
<style lang="scss">
.panel-group-withdraw {
	.card-panel-col {
		margin-bottom: 32px;
	}

	.card-panel {
		position: relative;
		display: flex;
		// cursor: pointer;
		font-size: 12px;
		overflow: hidden;
		color: #666;
		background: #f6faff;
		// box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
		// border-color: rgba(0, 0, 0, .05);
		border: 0;
		border-radius: 5px;

		.card-panel-description {
			position: relative;
			float: left;
			text-align: left;
			margin: 35px;
			width: 100%;

			.card-panel-num {
				font-size: 30px;
				margin-bottom: 30px;
			}

			.card-panel-text {
				line-height: 18px;
				color: rgba(0, 0, 0, 0.45);
				font-size: 16px;
			}

			.card-panel-btn {
				position: absolute;
				bottom: -8px;
				right: 0;
			}
		}
	}
}

@media (max-width:550px) {
	.card-panel-description {
		display: none;
	}

	.card-panel-icon-wrapper {
		float: none !important;
		width: 100%;
		height: 100%;
		margin: 0 !important;
	}
}

.withdraw_logo {
	text-align: center;
	margin-bottom: 40px;

	img {
		width: 150px;
	}
}

.withdraw_note {
	line-height: 1.8;
}

.dialog-footer-withdraw {
	margin-top: 50px;
	margin-bottom: 20px;
}
</style>
