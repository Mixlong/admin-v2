import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

// 增加本地存储兜底，避免浏览器阻止Cookie或路径不匹配导致读取失败
export function getToken() {
  return Cookies.get(TokenKey) || localStorage.getItem(TokenKey) || sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  Cookies.set(TokenKey, token, { path: '/' })  // ⭐ 关键：Cookie 在整个域名下可用
  try {
    localStorage.setItem(TokenKey, token)
    sessionStorage.setItem(TokenKey, token)
  } catch (e) {
    console.warn('[Auth] 无法写入本地存储:', e)
  }
  return token
}

export function removeToken() {
  Cookies.remove(TokenKey, { path: '/' })  // ⭐ 必须一致：删除时的 path 要和设置时一致
  try {
    localStorage.removeItem(TokenKey)
    sessionStorage.removeItem(TokenKey)
  } catch (e) {
    console.warn('[Auth] 无法移除本地存储:', e)
  }
}
