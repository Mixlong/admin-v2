import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

// 增加本地存储兜底，避免浏览器阻止Cookie或路径不匹配导致读取失败
export function getToken() {
  return Cookies.get(TokenKey) || localStorage.getItem(TokenKey) || sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  Cookies.set(TokenKey, token, { path: '/' })
  try {
    localStorage.setItem(TokenKey, token)
    sessionStorage.setItem(TokenKey, token)
  } catch (e) {
    console.warn('[Auth] 无法写入本地存储:', e)
  }
  return token
}

export function removeToken() {
  Cookies.remove(TokenKey, { path: '/' })
  try {
    localStorage.removeItem(TokenKey)
    sessionStorage.removeItem(TokenKey)
  } catch (e) {
    console.warn('[Auth] 无法移除本地存储:', e)
  }
}

// 从 URL 中读取 token 并写入 Cookie，供外部跳转时携带认证
export function syncTokenFromUrl(paramKey = 'ddsToken') {
  console.log('[Auth] 🔍 开始查找token，参数名:', paramKey)
  console.log('[Auth] 完整URL:', window.location.href)

  try {
    let token = ''
    let hasExternalParam = false
    const url = new URL(window.location.href)

    // 1. 尝试从标准query参数获取
    token = url.searchParams.get(paramKey) || ''
    hasExternalParam = hasExternalParam || url.searchParams.has(paramKey)
    console.log('[Auth] 从query获取:', token ? '✅ 找到' : '❌ 未找到')

    // 2. 如果没有，尝试从hash中获取（Vue Router hash模式）
    if (!token && url.hash) {
      console.log('[Auth] 尝试从hash获取...')
      // hash格式: #/path?param=value 或 #/path&param=value (错误格式)
      const hashIndex = url.hash.indexOf('?')
      const hashAmpIndex = url.hash.indexOf('&')

      // 处理正确格式: #/path?param=value
      if (hashIndex > -1) {
        const hashQuery = url.hash.substring(hashIndex + 1)
        console.log('[Auth] hash中的query:', hashQuery)
        const hashParams = new URLSearchParams(hashQuery)
        token = hashParams.get(paramKey) || ''
        hasExternalParam = hasExternalParam || hashParams.has(paramKey)
        console.log('[Auth] 从hash的?后获取:', token ? '✅ 找到' : '❌ 未找到')
      }

      // 处理错误格式: #/path&param=value (兼容DigiSmart的错误格式)
      if (!token && hashAmpIndex > -1) {
        const hashQuery = url.hash.substring(hashAmpIndex + 1)
        console.log('[Auth] hash中的&参数:', hashQuery)
        const hashParams = new URLSearchParams(hashQuery)
        token = hashParams.get(paramKey) || ''
        hasExternalParam = hasExternalParam || hashParams.has(paramKey)
        console.log('[Auth] 从hash的&后获取:', token ? '✅ 找到' : '❌ 未找到')
      }
    }

    // 3. 兜底：使用正则从整个URL中匹配
    if (!token) {
      console.log('[Auth] 使用正则兜底匹配...')
      const regex = new RegExp(`[?&#]${paramKey}=([^&#]+)`)
      const match = window.location.href.match(regex)
      token = match && match[1] ? decodeURIComponent(match[1]) : ''
      hasExternalParam = hasExternalParam || !!match
      console.log('[Auth] 正则匹配结果:', token ? '✅ 找到' : '❌ 未找到')
    }

    if (token) {
      console.log('[Auth] ✅ 成功找到token，长度:', token.length)
      console.log('[Auth] Token前30字符:', token.substring(0, 30))
      setToken(token)
      console.log('[Auth] ✅ Token已写入Cookie，验证:', !!getToken())

      // 清理URL中的token
      // 处理query参数
      url.searchParams.delete(paramKey)

      // 处理hash中的token
      if (url.hash) {
        // 移除 ?param=value 格式
        url.hash = url.hash.replace(new RegExp(`[?&]${paramKey}=[^&#]*`), '')
        // 移除 &param=value 格式（错误格式）
        url.hash = url.hash.replace(new RegExp(`&${paramKey}=[^&#]*`), '')
      }

      // 清理 pathname 中类似 /redirect&ddsToken=xxx 的异常格式
      const cleanedPath = url.pathname.replace(new RegExp(`&${paramKey}=[^/&#?]*`), '')
      if (cleanedPath !== url.pathname) {
        url.pathname = cleanedPath
      }

      window.history.replaceState({}, document.title, url.toString())
      console.log('[Auth] ✅ URL已清理')
      return true
    }

    if (hasExternalParam) {
      console.log('[Auth] ✅ 检测到外部跳转参数但未成功解析token')
      return true
    }

    console.log('[Auth] ❌ 未找到token')
    return false
  } catch (e) {
    console.error('[Auth] ❌ Token同步失败:', e)
    // 最终兜底
    const regex = new RegExp(`[?&#]${paramKey}=([^&#]+)`)
    const match = window.location.href.match(regex)
    const token = match && match[1] ? decodeURIComponent(match[1]) : ''
    if (token) {
      console.log('[Auth] 兜底逻辑成功获取token')
      setToken(token)
      return true
    } else {
      const hasParam = !!match
      if (hasParam) {
        console.log('[Auth] 兜底逻辑检测到外部跳转参数但无token')
      }
      console.log('[Auth] ❌ 未找到token')
      return hasParam
    }
  }
}
