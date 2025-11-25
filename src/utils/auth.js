import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 从 URL 中读取 token 并写入 Cookie，供外部跳转时携带认证
export function syncTokenFromUrl(paramKey = 'token') {
  try {
    const url = new URL(window.location.href)
    const token = url.searchParams.get(paramKey) || ''
    if (token) {
      setToken(token)
      // 去掉地址栏中的 token，避免泄露/重复处理
      url.searchParams.delete(paramKey)
      window.history.replaceState({}, document.title, url.toString())
    }
  } catch (e) {
    // 兼容旧浏览器或 URL 解析失败时的兜底
    const match = window.location.href.match(new RegExp(`[?&]${paramKey}=([^&#]+)`))
    const token = match && match[1] ? decodeURIComponent(match[1]) : ''
    if (token) {
      setToken(token)
    }
  }
}
