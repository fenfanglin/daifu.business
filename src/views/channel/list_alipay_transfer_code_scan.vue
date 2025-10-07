<template>
	<div v-if="check_channel == false" class="app-container">
		<div class="page-message">
			<h2>{{channel_error}}</h2>
			<p>
				请联系后台管理员开启通道
			</p>
		</div>
	</div>
	<div v-else class="app-container">
		<el-form ref="form" label-width="300px" class="mt20">
			<el-row>
				<el-col v-if="data.qrcode_url">
					<el-form-item label="">
						<div class="notice text-danger">
							使用在线的支付宝收款账号扫码领取
						</div>
					</el-form-item>
					<el-form-item label="">
						<div class="amount">
							<span class="name">{{data.payer_name}}</span><span class="text">转账</span><span class="icon">￥</span><span class="num">{{data.pay_amount}}</span>
						</div>
					</el-form-item>
					<el-form-item label="">
						<el-image :src="data.qrcode_url" class="qrcode" fit="contain"></el-image>
					</el-form-item>
				</el-col>
				<el-col v-else>
					<el-form-item label="">
						<div class="notice text-danger">
							使用在线的支付宝收款账号扫码领取
						</div>
					</el-form-item>
					<el-form-item label="">
						<div class="amount">
							
						</div>
					</el-form-item>
					<el-form-item label="">
						<div class="no_qrcode">
							没有转账码<br>
							{{reload_timeout}}秒后自动获取
						</div>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div class="form-footer footer-setting">
			<el-button v-if="data.no" type="primary" @click="scanedCode">下一个</el-button>
			<!-- <el-button @click="close">关闭</el-button> -->
		</div>
	</div>
</template>

<script>
// import img1 from '@/assets/1.jpg'
// import img2 from '@/assets/2.jpg'
// import img3 from '@/assets/3.jpg'
// import img4 from '@/assets/4.jpg'

export default {
	name: "channel_list_alipay_transfer_code_scan",
	data() {
		return {
			channel_id: 116,
			check_channel: true,
			channel_error: '',
			
			data: {
				no: '',
				qrcode_url: '',
				pay_amount: 0,
				payer_name: '',
				
				// no: '123123',
				// qrcode_url: img4,
				// pay_amount: 100,
				// payer_name: 'AAA',
			},
			
			reload_timeout: -1,
			
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
		let that = this
		
		that.request({
			url: "user/check_channel",
			data: {channel_id: that.channel_id},
		}).then(res => {
			if (res.data.status != 1) {
				that.check_channel = false
				that.channel_error = res.data.msg
			} else {
				that.check_channel = true
				that.getCode();
				that.autoReload();
			}
		});
		
	},
	beforeDestroy() {
		clearInterval(this.interval)
	},
	methods: {
		getCode() {
			let that = this
			
			// that.loadingShow();
			that.request({
				url: "channel_alipay_transfer_code/get_code",
				data: {
					
				},
			}).then(res => {
				// that.loadingClose();
				console.log(res)
				if (res.data == undefined) {
					that.data = {
						no: '',
						qrcode_url: '',
						pay_amount: 0,
						payer_name: '',
					}
					
					that.reload_timeout = 10
				} else {
					that.data = res.data
					
					that.reload_timeout = -1
				}
			}).catch(() => {
				that.reload_timeout = 10
			});
		},
		/** 下一个按钮 */
		scanedCode() {
			let that = this
			
			that.loadingShow();
			
			that.request({
				url: "channel_alipay_transfer_code/scaned_code",
				data: that.data,
			}).then(res => {
				that.loadingClose();
				that.getCode()
			}).catch(() => {
				that.loadingClose();
			});
		},
		// 取消按钮
		close() {
			this.$tab.closePage();
		},
		autoReload() {
			let that = this
			
			that.interval = setInterval(function() {
				
				if (that.reload_timeout >= 0) {
					that.reload_timeout--
				}
				
				if (that.reload_timeout == 0) {
					that.getCode()
				}
				
			}, 1000)
		},
		
	}
};
</script>
<style lang="scss">
	.notice {
		font-size: 24px;
	}
	.amount {
		height: 50px;
		.name {
			vertical-align: bottom;
			font-size: 46px;
		}
		.text {
			vertical-align: bottom;
			font-size: 22px;
			line-height: 24px;
			margin-left: 6px;
			margin-right: 6px;
		}
		.icon {
			vertical-align: bottom;
			font-size: 25px;
			line-height: 24px;
			margin-right: -2px;
		}
		.num {
			vertical-align: bottom;
			font-size: 46px;
		}
	}
	.qrcode {
		height: 500px;
		width: 372px;
		background-color: #eee;
	}
	.no_qrcode {
		height: 500px;
		width: 372px;
		background-color: #eee;
		font-size: 30px;
		line-height: 45px;
		text-align: center;
		padding-top: 180px;
	}
	.footer-setting {
		margin-left: 290px !important;
	}
	
	.note {
		margin-left: 10px;
	}
</style>