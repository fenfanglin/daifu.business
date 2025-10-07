<template>
	<div class="dashboard-editor-container">
		<el-row :gutter="40" class="panel-group">
			<el-col class="card-panel-col">
				<div class="card-panel panel-top">
					<div class="card-panel-description">
						<div class="card-panel-text font20">
							上次登录
						</div>
						<div class="card-panel-text mt10">
							登录IP：{{data.log.ip}}，登录地址：{{data.log.area}}，登录时间：{{data.log.create_time}}
						</div>
					</div>
				</div>
			</el-col>
		</el-row>

		<el-row :gutter="40" class="panel-group">
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.today_amout}}</div>
						<div class="card-panel-text">
							今日订单出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.yesterday_amout}}</div>
						<div class="card-panel-text">
							昨日订单出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col v-if="user.type == 1" :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div v-if="user.money >= 500" class="card-panel-num text-success">{{user.money}}</div>
						<div v-else class="card-panel-num text-danger">{{user.money}}</div>
						<div class="card-panel-text">
							账户余额
						</div>
						<div class="card-panel-btn">
							<el-button type="primary" icon="el-icon-s-finance" size="medium" @click="goRecharge">余额充值</el-button>
						</div>
					</div>
				</div>
			</el-col>
			<el-col v-if="user.type == 3" :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num text-success">{{user.allow_withdraw}}</div>
						<div class="card-panel-text">
							余额
						</div>
<!--						<div class="card-panel-btn">-->
<!--							<el-button type="primary" icon="el-icon-s-finance" size="medium" @click="goWithdraw">提现</el-button>-->
<!--						</div>-->
					</div>
				</div>
			</el-col>
			<el-col v-if="user.type == 1" :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.today_fee}}</div>
						<div class="card-panel-text">
							今日费用
						</div>
					</div>
				</div>
			</el-col>
			<el-col v-if="user.type == 1" :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.yesterday_fee}}</div>
						<div class="card-panel-text">
							昨日费用
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.total_amount}}</div>
						<div class="card-panel-text">
							累计订单出金
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div class="card-panel-description">
						<div class="card-panel-num">{{data.info.total_order}}</div>
						<div class="card-panel-text">
							累计订单量
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export default {
	name: 'index',
	components: {

	},
	data() {
		return {
			user: {},
			data: {
				log: {},
				info: {},
			},
		}
	},
	created() {
		this.getUserInfo();
		this.loadInfo();
	},
	methods: {
		async getUserInfo() {
			let that = this

			that.user = await that.userInfo()
			that.setUser(that.user)

			if ((that.user.type == 1) && that.user.money_notify) {
				that.$confirm("账户余额低，请及时充值，以免影响正常使用！", "提示", {
					confirmButtonText: "马上充值",
					cancelButtonText: "取消",
					type: "warning",
					closeOnClickModal: false,
					closeOnPressEscape: false,
				}).then(function() {
					that.goRecharge()
				}).catch(() => {

				})
			}
		},
		loadInfo() {
			let that = this

			that.loading = true;
			that.request({
				url: "index/index",
				data: {},
			}).then(res => {
				that.data = res.data;
				that.loading = false;
			});
		},
		goRecharge() {
			this.$router.push({
				path: '/finance/list_recharge',
				query: {}
			})
		},
		goWithdraw() {
			this.$router.push({
				path: '/finance/list_withdraw',
				query: {}
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
	padding: 32px;
	// background-color: rgb(240, 242, 245);
	background-color: #f6faff;
	position: relative;
	min-height: calc(100vh - 80px);
}

.panel-group {
	.card-panel-col {
		margin-bottom: 32px;
	}

	.card-panel {
		// cursor: pointer;
		font-size: 12px;
		position: relative;
		display: flex;
		overflow: hidden;
		color: #666;
		background: #fff;
		box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
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
		// display: none;

		.card-panel-num {
			margin-bottom: 10px !important;
		}
	}

	.card-panel-icon-wrapper {
		float: none !important;
		width: 100%;
		height: 100%;
		margin: 0 !important;
	}
}
</style>
