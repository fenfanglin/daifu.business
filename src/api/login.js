import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid, google_code) {
  const data = {
    username,
    pwd: password,
    code,
    uuid,
    google_code
  }
  return request({
    url: '/login/index',
    method: 'post',
    data
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/index/get_userinfo',
    method: 'post'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/login/captcha',
    method: 'post'
  })
}