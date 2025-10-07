<template>
  <div class="app-container">
    <div class="wiki-preview-body markdown-body">
      <h4>接口参数配置：</h4>
      <p class="pl-6">
        商户编号：{{ user.id }}<br>
        商户密钥：{{ user.secret_key }}<br>
      </p>
      <h4>下单演示：</h4>
      <p class="pl-6">
        <el-button type="primary" @click="handleEditDemo">测试下单</el-button>
      </p>
    </div>

    <el-dialog title="测试下单" :visible.sync="openDemo" width="400px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <div class="demo_logo">
          <img src="@/assets/images/wallet6.png">
        </div>
        <el-row>
          <el-form-item label="">
            <el-select v-model="form.account_type" placeholder="收款方式" class="w100">
              <el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <!--          银行卡-->
          <div v-if="form.account_type===1">
            <el-form-item label="">
              <el-input v-model="form.bank" prop="bank" placeholder="请输入银行" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="form.branch" placeholder="请输入银行支行" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="form.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="form.account" placeholder="请输入卡号" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          USDT-->
          <div v-if="form.account_type===2">
            <el-form-item label="">
              <el-input v-model="form.account" placeholder="请输入钱包地址" autocomplete="off"/>
            </el-form-item>
          </div>
          <!--          支付宝-->
          <div v-if="form.account_type===3">
            <el-form-item label="">
              <el-input v-model="form.account_name" placeholder="请输入姓名" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="">
              <el-input v-model="form.account" placeholder="请输入账号" autocomplete="off"/>
            </el-form-item>
          </div>
          <el-form-item label="">
            <el-input v-model="form.amount" type="number" placeholder="请输入金额" autocomplete="off"
                      @change="changeAmount"/>
          </el-form-item>
          <div v-if="form.account_type ===2">
            <el-form-item label="">
              <el-input v-model="form.usdt_amount" placeholder="USDT金额" autocomplete="off" disabled/>
              <p style="margin-top: 0;margin-bottom: -20px"> 换算汇率约为 <span class="text-danger"
              >{{ usdt_rate }}</span> 资料由 OKX 提供</p>
            </el-form-item>
          </div>
          <el-form-item label="">
            <el-input v-model="form.out_trade_no" placeholder="请输入商户订单号" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="form.notify_url" placeholder="请输入回调地址" autocomplete="off"/>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer dialog-footer-demo">
        <el-button type="primary" @click="submitFormDemo">提交订单</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import variables from '@/assets/styles/markdown.css'

export default {
  name: 'system_setting',
  data() {
    return {
      user: {},
      form: {},
      usdt_rate: 0,

      // 表单校验
      rules: {
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' }
        ],
        google_code: [
          { required: true, message: '谷歌安全码不能为空', trigger: 'blur' }
        ]
      },

      openDemo: false,
      alipayName: [116]
    }
  },
  computed: {
    accountType() {
      return this.$store.getters.accountType
    }
  },
  created() {
    // console.log('this.user', this.user)
    // this.view();

    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      this.user = await this.userInfo()
      console.log('this.user', this.user)
    },
    view() {
      let that = this

      that.request({
        url: 'google_auth/view'
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
      })

    },
    /** 提交按钮 */
    submitForm() {
      let that = this

      that.$refs['form'].validate(valid => {
        if (valid) {
          that.request({
            url: 'admin/change_password',
            data: that.form
          }).then(res => {
            that.defined.setChangeData(true)
            that.$modal.msgSuccess(res.msg)
            that.close()
          })
        }
      })
    },
    // 取消按钮
    close() {
      this.$tab.closePage()
    },

    // 表单重置
    reset() {
      this.form = {}

      this.resetForm('form')
    },
    // 取消按钮
    cancel() {
      this.openDemo = false
      this.reset()
    },
    handleEditDemo() {
      let that = this
      that.reset()
      that.openDemo = true
      this.getUsdtRate()
    },
    submitFormDemo: function() {
      let that = this

      that.request({
        url: 'demo/pay',
        data: that.form
      }).then(res => {
        if (res.code == 200) {
          that.cancel()
          that.$router.push({ path: '/order/list_all' });
        }
      })
    },
    getUsdtRate() {
      let that = this

      that.request({
        url: 'option/get_usdt_rate',
        data: {}
      }).then(res => {
        that.usdt_rate = res.data
      })
    },
    changeAmount() {
      let that = this
      if (that.form.account_type === 2) {
        var num = that.form.amount / that.usdt_rate
        that.form.usdt_amount = num.toFixed(2)
        that.$set(this.form, this.form.usdt_amount, num.toFixed(2))
      }
    }
  }
}
</script>
<style lang="scss">
.demo_logo {
  text-align: center;
  margin-bottom: 40px;

  img {
    width: 100px;
  }
}

.dialog-footer-demo {
  margin-top: 50px;
  margin-bottom: 20px;
}
</style>
