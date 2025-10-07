<template>
	<div class="app-container">
		<el-row :gutter="40" class="panel-group-recharge">
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{user.money}}</div>
						<div class="card-panel-text">账户余额</div>
						<div class="card-panel-btn">
							<el-button type="primary" icon="el-icon-s-finance" size="medium" @click="handleEditRecharge">余额充值</el-button>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.order_no" placeholder="订单号" clearable/>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-input v-model="queryParams.account" placeholder="卡号/U地址" clearable/>
			</el-form-item> -->
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="创建时间开始"
					end-placeholder="创建时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in rechargeStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['order:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		
		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<!-- <el-table-column label="订单号" prop="order_no" width="250" fixed="left" :show-overflow-tooltip="true" /> -->
			<el-table-column label="商户id" prop="business_id" width="120" />
			<el-table-column label="充值通道" prop="recharge_type_str" width="150" />
			<el-table-column label="充值账号" prop="account" :show-overflow-tooltip="true" />
			<el-table-column label="下单时间" prop="create_time" width="220" />
			<el-table-column label="支付时间" prop="success_time" width="220" />
			<el-table-column label="充值金额" prop="post_amount" width="150" />
			<el-table-column label="Usdt金额" prop="usdt_amount" width="150" />
			<el-table-column label="状态" width="140">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作"  :fixed="is_mobile ? null : 'right'" width="150">
				<template slot-scope="scope">
					<el-button v-if="scope.row.recharge_type != -1" type="primary" class="tb-button" icon="el-icon-search" @click="handleView(scope.row)" plain>查看</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/>
		
		<el-dialog title="余额充值" :visible.sync="openRecharge" width="400px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="0">
				<div class="recharge_logo">
					<img src="@/assets/images/wallet.png">
				</div>
				<el-row>
					<el-form-item label="">
						<el-input-number v-model="form.amount" placeholder="人民币" :controls="false" class="w174px text-left" @change="changeAmount" />
						<el-input-number v-model="form.amount_usdt" placeholder="USDT" :controls="false" class="w174px text-left ml10" disabled />
					</el-form-item>
					<!-- <el-form-item label="">
						<el-input v-model="form.remark" placeholder="备注" maxlength="255" show-word-limit>
						</el-input>
					</el-form-item> -->
					<!-- <el-form-item label="">
						<el-select v-model="form.recharge_type" placeholder="充值方式" class="w100">
							<el-option v-for="item in rechargeType" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item> -->
				</el-row>
				<div class="recharge_note">
					换算汇率约为 <span class="text-danger">{{setting.usdt_rate}}</span> 资料由 OKX 提供
				</div>
				
				<!-- <div class="recharge_note text-danger">
					1、务必转账于金额一致，擅自修改金额会导致充值失败。<br>
					2、请在订单有效时间转账，超过时间会导致充值不到账。<br>
					3、充值不到账请联系客服。<br>
				</div> -->
			</el-form>
			<div slot="footer" class="dialog-footer dialog-footer-recharge">
				<el-button type="primary" @click="submitFormRecharge">提交订单</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog title="订单信息" :visible.sync="openDetail" width="700px" append-to-body :close-on-click-modal="false">
			<el-table ref="multipleTable2" border empty-text="没有相关数据" :data="detail.info">
				<el-table-column label="内容" prop="title" :show-overflow-tooltip="true" min-width="30"/>
				<el-table-column label="信息" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span v-if="scope.row.check == 'usdt_trade'" class="pointer text-primary" @click="goUsdtTrade(scope.row.value)">{{ scope.row.value }}</span>
						<span v-else-if="scope.row.check == 'image'">
							<img :src="scope.row.value" slot="reference" class="show-image" />
						</span>
						<span v-else :class="scope.row.class">{{ scope.row.value }}</span>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "finance_list_recharge", // 路由上 '/' 换成 '_'
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
			openRecharge: false,
			openDetail: false,
			
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
			form: {
				recharge_type: 1,
			},
			detail: {},
			setting: {},
			
			// 表单校验
			rules: {
				
			},
		}
	},
	computed: {
		rechargeStatus() {
			return this.$store.getters.rechargeStatus
		},
		rechargeType() {
			return this.$store.getters.rechargeType
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
				url: "recharge/list",
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
			this.openRecharge = false;
			this.openDetail = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {}
			
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
				url: "recharge/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.detail = res.data;
				that.openDetail = true;
			});
		},
		handleEditRecharge() {
			let that = this
			
			that.reset();
			that.request({
				url: "recharge/get_setting",
				data: {},
			}).then(res => {
				that.setting = res.data;
				that.openRecharge = true;
			});
		},
		changeAmount() {
			let that = this
			
			var num = new Number(that.form.amount / that.setting.usdt_rate);
			
			that.form.amount_usdt = num.toFixed(2)
		},
		submitFormRecharge: function() {
			let that = this
			
			that.request({
				url: "recharge_usdt/pay",
				data: that.form,
			}).then(res => {
				if (res.code == 200) {
					this.getList()
					that.cancel()
					
					// window.open(res.data.pay_url, '_blank')
					that.handleView(res.data)
				}
			});
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("recharge/export", this.queryParams, "充值").then(res => {
				
			});
		},
	}
};
</script>
<style lang="scss">
.panel-group-recharge {
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

.recharge_logo {
	text-align: center;
	margin-bottom: 40px;
	
	img {
		width: 150px;
	}
}

.recharge_note {
	line-height: 1.8;
}

.dialog-footer-recharge {
	margin-top: 50px;
	margin-bottom: 20px;
}
.show-image{
	width: 200px;
	height: 200px;
}
</style>