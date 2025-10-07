<template>
	<div class="app-container">
		<el-form ref="form" :model="form" :rules="rules" label-width="150px" class="mt20">
			<el-row>
				<el-col v-if="form.is_bind == 0">
					<el-form-item label="">
						手机打开Google Authenticator（谷歌身份验证器），扫描二维码
					</el-form-item>
					<el-form-item label="">
						<div class="qrcode" ref="qrCodeUrl"></div>
					</el-form-item>
					<el-form-item label="">
						不能扫码？点击 查看密钥 手动添加
					</el-form-item>
					<el-form-item label="谷歌安全码" prop="google_code">
						<el-input v-model="form.google_code" class="w210px" />
					</el-form-item>
				</el-col>
				<el-col v-else>
					<el-form-item label="">
						您已绑定谷歌身份验证器
					</el-form-item>
					<el-form-item v-if="form.allow_unbind == 1" label="谷歌安全码" prop="google_code">
						<el-input v-model="form.google_code" class="w210px" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div v-if="form.is_bind == 0" class="form-footer">
			<el-button type="primary" @click="submitFormBind">绑定</el-button>
		</div>
		<div v-else-if="form.allow_unbind == 1" class="form-footer">
			<el-button type="primary" @click="submitFormUnbind">解绑</el-button>
		</div>
	</div>
</template>

<script>
export default {
	name: "user_google_auth",
	data() {
		return {
			user: this.getUser(),
			form: {},
			
			// 表单校验
			rules: {
				google_code: [
					{ required: true, message: "谷歌安全码不能为空", trigger: "blur" }
				],
			},
		}
	},
	computed: {
		
	},
	created() {
		this.view();
	},
	methods: {
		view() {
			let that = this
			
			that.request({
				url: "user/google_auth_view",
			}).then(res => {
				that.form = res.data
				if (that.form.is_bind == 0 && that.form.qrcode) {
					setTimeout(function() {
						var qrcode = new that.qrCode(that.$refs.qrCodeUrl, {
							text: that.form.qrcode,
							width: 200,
							height: 200,
							// colorDark: '#000000',
							// colorLight: '#ffffff',
							correctLevel: that.qrCode.CorrectLevel.M
						})
					}, 100)
				}
			});
			
		},
		// 表单重置
		reset() {
			this.form = {}
			
			this.resetForm("form")
		},
		/** 提交按钮 */
		submitFormBind() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "user/google_auth_bind",
						data: that.form,
					}).then(res => {
						that.$modal.msgSuccess(res.msg)
						that.updateUserInfo()
					});
				}
			});
		},
		/** 提交按钮 */
		submitFormUnbind() {
			let that = this
			
			if (that.form.allow_unbind == 1) {
				that.$refs["form"].validate(valid => {
					if (valid) {
						that.request({
							url: "user/google_auth_unbind",
							data: that.form,
						}).then(res => {
							that.$modal.msgSuccess(res.msg)
							that.updateUserInfo()
						});
					}
				});
			} else {
				that.$confirm("系统不允许解绑谷歌身份验证，请联系后台管理员！", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
				}).then(function() {
					that.reset()
				}).catch(() => {
					that.reset()
				})
			}
		},
		updateUserInfo() {
			let that = this
			
			that.request({
				url: "index/get_userinfo"
			}).then(res => {
				that.setUser(res.data)
				
				that.defined.setChangeData(true)
				that.close()
			});
		},
		// 取消按钮
		close() {
			this.$tab.closePage();
		},
	}
};
</script>
<style lang="scss">
	.qrcode {
		width: 200px;
		height: 200px;
	}
	
	.form-footer {
		margin-left: 140px;
	}
	
	.note {
		margin-left: 10px;
	}
</style>