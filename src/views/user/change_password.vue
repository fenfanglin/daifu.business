<template>
	<div class="app-container">
		<el-form ref="form" :model="form" :rules="rules" label-width="150px" class="mt20">
			<el-row>
				<el-col>
					<el-form-item label="后台登录密码" prop="password">
						<el-input v-model="form.password" class="w210px" />
					</el-form-item>
					<el-form-item v-if="user.is_google_auth" label="谷歌安全码" prop="google_code">
						<el-input v-model="form.google_code" class="w210px" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div class="form-footer">
			<el-button type="primary" @click="submitForm">修改密码</el-button>
		</div>
	</div>
</template>

<script>
export default {
	name: "user_change_password",
	data() {
		return {
			user: {},
			form: {},
			
			// 表单校验
			rules: {
				password: [
					{ required: true, message: "登录密码不能为空", trigger: "blur" }
				],
				google_code: [
					{ required: true, message: "谷歌安全码不能为空", trigger: "blur" }
				],
			},
		}
	},
	computed: {
		
	},
	created() {
		this.getUserInfo();
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		/** 提交按钮 */
		submitForm() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "user/change_password",
						data: that.form,
					}).then(res => {
						that.defined.setChangeData(true);
						that.$modal.msgSuccess(res.msg);
						that.close();
					});
				}
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