import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
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
    url: '/captchaImage',
    method: 'get'
  })
}

// 发送短信验证码
export function getSmsSend(data) {
  return request({
    url: '/sms/send',
    method: 'post',
    data
  })
}

// 验证手机验证码
export function getSmsVerify(data) {
  return request({
    url: '/sms/verify',
    method: 'post',
    data
  })
}

// 获取接收验证码的用户
export function getSmsUser() {
  return request({
    url: '/sms/user',
    method: 'get'
  })
}