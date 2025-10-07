<template>
	<div class="app-container">
		<el-form ref="form" :model="form" :rules="rules" label-width="300px" class="mt20">
			<el-row>
				<el-col>
					<el-form-item v-if="form.user_type === 1" label="自动更新Usdt汇率" prop="usdt_rate_type">
						<el-switch v-model="form.usdt_rate_type" active-value="1" inactive-value="2"></el-switch>
						<el-tooltip class="item ml20" effect="dark" :content="form.usdt_rate_type_note" placement="right">
							<i class="el-icon-question"></i>
						</el-tooltip>
					</el-form-item>
					<el-form-item v-if="form.user_type === 1 && form.usdt_rate_type != 1" label="Usdt手动汇率" prop="usdt_rate">
						<el-input-number v-model="form.usdt_rate" :controls="false" class="text-left" />
					</el-form-item>
					<el-form-item label="允许多台电脑同时登录" prop="multiple_login">
						<el-switch v-model="form.multiple_login" active-value="1" inactive-value="-1"></el-switch>
					</el-form-item>
          <el-form-item label="新订单声音提醒" prop="audio_loop" v-if="form.user_type !== 3">
            <el-switch
              style="display: block;margin-top: 7px"
              v-model="form.audio_loop"
              active-text="重复"
              inactive-text="单次"
              :active-value = "1"
              :inactive-value = "-1"
            >
            </el-switch>
          </el-form-item>
					<el-form-item label="登录ip白名单" prop="login_ip">
						<el-input type="textarea" v-model="form.login_ip" :rows="5" resize="none" maxlength="500" show-word-limit class="w400px" placeholder="每行输入一个ip" />
					</el-form-item>

					<el-form-item v-if="form.is_google_auth" label="谷歌安全码" prop="google_code">
						<el-input v-model="form.google_code" class="w210px" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div class="form-footer footer-setting">
			<el-button type="primary" @click="submitForm">保存设置</el-button>
			<el-button @click="close">关闭</el-button>
		</div>
	</div>
</template>

<script>
export default {
	name: "user_setting",
	data() {
		return {
			form: {},

			// 表单校验
			rules: {

			},
		}
	},
	computed: {
		randomAmount() {
			return this.$store.getters.randomAmount
		},
	},
	created() {
		this.view();
	},
	methods: {
		view() {
			let that = this

			that.loading = true;
			that.request({
				url: "user/view_setting",
				data: {},
			}).then(res => {
				that.form = res.data;
				that.loading = false;
			});
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
		/** 提交按钮 */
		submitForm() {
			let that = this

			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "user/save_setting",
						data: that.form,
					}).then(res => {
            that.updateUserInfo();
						that.defined.setChangeData(true);
						that.$modal.msgSuccess(res.msg);
						that.close();
            window.location.reload(true);
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

	.footer-setting {
		margin-left: 290px !important;
	}

	.note {
		margin-left: 10px;
	}
</style>
