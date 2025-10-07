<template>
	<div class="app-container">
		<el-row :gutter="40" class="panel-group-system-card">
			<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
				<div class="card-panel">
					<div v-if="is_binding_jqk" class="card-panel-description">
						<div class="card-panel-num">{{ jqk_business_name }}</div>
						<div class="card-panel-text">您已绑定JQK系统账号</div>
						<div class="card-panel-btn">
							<el-button type="primary" size="medium" @click="loginJqk">登录JQK系统</el-button>
						</div>
					</div>
					<div v-else class="card-panel-description">
						<div class="card-panel-error text-danger">您未绑定JQK系统账号</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export default {
	name: 'user_binding_system',
	data() {
		return {
			user: this.getUser(),
			form: {},
			jqk_business_id: '',
			jqk_business_name: '',
			is_binding_jqk: true,

			// 表单校验
			rules: {

			}
		}
	},
	computed: {},
	created() {
		this.view()
	},
	methods: {
		view() {
			let that = this

			that.request({
				url: "user/get_bind_jqk",
				data: {
					no: that.user.no,
				},
			}).then(res => {
				that.jqk_business_id = res.data.jqk_business_id;
				that.jqk_business_name = res.data.jqk_business_name;
				that.is_binding_jqk = res.data.jqk_business_id > 0;
			});
		},
		loginJqk() {
			let that = this
			that.request({
				url: "user/login_jqk",
				data: {

				},
				checkRepeatSubmit: true,
			}).then(res => {
				let href = res.data.href
				window.open(href, '_blank')
			});
		},
		// 取消按钮
		close() {
			this.$tab.closePage()
		}
	}
}
</script>
<style lang="scss">
.panel-group-system-card {
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
		height: 144px;

		.card-panel-description {
			position: relative;
			float: left;
			text-align: left;
			margin: 35px;
			width: 100%;

			.card-panel-num {
				font-size: 30px;
				margin-bottom: 30px;
				height: 26px;
			}

			.card-panel-text {
				line-height: 18px;
				color: rgba(0, 0, 0, 0.45);
				font-size: 16px;
			}

			.card-panel-error {
				line-height: 74px;
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
</style>
