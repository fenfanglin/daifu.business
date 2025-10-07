import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    modelStatus:[
      { value: 1, label: '启用' },
      { value: -1, label: '禁用' },
    ],
    modelStatus2:[
      { value: 1, label: '开启' },
      { value: -1, label: '关闭' },
    ],
    modelStatus3:[
      { value: -1, label: '未处理' },
      { value: 1, label: '已处理' },
    ],
    modelStatus4:[
      { value: 1, label: '人工转账' },
      { value: 2, label: '三方转账' },
    ],
    verifyStatus:[
      { value: -1, label: '待认证' },
      { value: 1, label: '已认证' },
      { value: 2, label: '不通过' },
    ],
    channelType:[
      { value: 1, label: '网银' },
      { value: 2, label: '数字货币' },
      { value: 3, label: '支付宝' },
      { value: 4, label: '四方平台' },
    ],
    rmbType:[
      { value: 1, label: '钱包编号' },
      { value: 2, label: '手机号' },
    ],
    alipayPType:[
      { value: 1, label: '下单回调' },
      { value: 2, label: '只监控订单' },
    ],
    orderStatus:[
      { value: -1, label: '未支付' },
      { value: 1, label: '成功，未回调' },
      { value: 2, label: '成功，已回调' },
      // { value: -2, label: '生成订单失败' },
    ],
    notifyType:[
      { value: 1, label: '手机短信' },
      { value: 2, label: '手机应用' },
      { value: 3, label: '微信公众号' },
    ],
    notifyStatus:[
      { value: 1, label: '成功' },
      { value: -1, label: '未处理' },
    ],
    randomAmount:[
      { value: -1, label: '关闭' },
      { value: 1, label: '加随机金额' },
      { value: 2, label: '减随机金额' },
    ],
    rechargeType:[
      { value: 1, label: 'Usdt' },
    ],
    rechargeStatus:[
      { value: -1, label: '未支付' },
      { value: 1, label: '成功' },
      // { value: -2, label: '生成订单失败' },
    ],
    moneyLogType:[
      { value: 1, label: '充值' },
      { value: 2, label: '订单费用' },
      { value: 3, label: '总后台操作' },
    ],
    withdrawType:[
      { value: 1, label: '银行卡' },
      { value: 2, label: 'Usdt' },
      { value: 3, label: '支付宝' },
    ],
    withdrawStatus:[
      { value: -1, label: '未审核' },
      { value: 1, label: '成功' },
      { value: 2, label: '审核失败' },
    ],
    withdrawLogType:[
      { value: 1, label: '订单金额' },
      { value: 2, label: '商户提现' },
      { value: 3, label: '代理操作' },
    ],
    successType:[
      { value: 1, label: '自动回调' },
      { value: 2, label: '手动回调' },
    ],
    accountType:[
      { value: 1, label: '银行卡' },
      { value: 2, label: 'USDT' },
      { value: 3, label: '支付宝' },
      { value: 4, label: '数字RMB' },
    ],
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const google_code = userInfo.google_code
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid, google_code).then(res => {
          setToken(res.data.token)
          commit('SET_TOKEN', res.data.token)

          // res.data.token = ''

          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          // console.log(res)
          setUser(res.data)
          // const user = res.data.user
          // const avatar = (user.avatar == "" || user.avatar == null) ? require("@/assets/images/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;
          if (res.data.role && res.data.role.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', res.data.role)
            commit('SET_PERMISSIONS', Object.values(res.data.permissions))
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_NAME', res.data.name)
          // commit('SET_AVATAR', res.data.avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        // logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          removeToken()
          removeUser()
          resolve()
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        removeUser()
        resolve()
      })
    }
  }
}

export default user
