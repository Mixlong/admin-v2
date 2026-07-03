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

// 获取所有可能包含 token 的 URL (支持无界微前端及 iframe 环境)
function getPossibleUrls() {
  const urls = []
  if (window.location && window.location.href) {
    urls.push(window.location.href)
  }
  // 无界主应用 location (如果是无界微前端环境)
  if (window.$wujie && window.$wujie.location && window.$wujie.location.href) {
    urls.push(window.$wujie.location.href)
  }
  try {
    if (window.top && window.top.location && window.top.location.href) {
      urls.push(window.top.location.href)
    }
  } catch (e) {}
  try {
    if (window.parent && window.parent.location && window.parent.location.href) {
      urls.push(window.parent.location.href)
    }
  } catch (e) {}
  // 过滤空值并去重
  return [...new Set(urls.filter(Boolean))]
}

// 清理特定 URL 中的 token 参数
function cleanUrlToken(urlStr, paramKey) {
  try {
    const url = new URL(urlStr)
    // 1. 处理 query 中的参数
    url.searchParams.delete(paramKey)
    // 2. 处理 hash 中的参数 (兼容 [?&#] 三种前缀形式的清理)
    if (url.hash) {
      url.hash = url.hash.replace(new RegExp(`[?&#]${paramKey}=[^&#]*`), '')
    }
    // 3. 处理 pathname 异常格式的参数
    const cleanedPath = url.pathname.replace(new RegExp(`&${paramKey}=[^/&#?]*`), '')
    if (cleanedPath !== url.pathname) {
      url.pathname = cleanedPath
    }
    // 4. 清理残留的多余符号
    let result = url.toString()
    result = result.replace(/[?&]+$/, '')
    return result
  } catch (e) {
    return urlStr
  }
}

// 从 URL 中读取 token 并写入 Cookie，供外部跳转时携带认证
export function syncTokenFromUrl(paramKey = 'ddsToken') {
  console.log('[Auth] 🔍 开始查找token，参数名:', paramKey)
  const possibleUrls = getPossibleUrls()
  console.log('[Auth] 待查找的 URL 列表:', possibleUrls)

  for (const urlStr of possibleUrls) {
    try {
      let token = ''
      const url = new URL(urlStr)

      // 1. 尝试从标准 query 参数获取
      token = url.searchParams.get(paramKey) || ''

      // 2. 尝试从 hash 中获取（Vue Router hash 模式）
      if (!token && url.hash) {
        const hashIndex = url.hash.indexOf('?')
        const hashAmpIndex = url.hash.indexOf('&')

        if (hashIndex > -1) {
          const hashQuery = url.hash.substring(hashIndex + 1)
          const hashParams = new URLSearchParams(hashQuery)
          token = hashParams.get(paramKey) || ''
        }

        if (!token && hashAmpIndex > -1) {
          const hashQuery = url.hash.substring(hashAmpIndex + 1)
          const hashParams = new URLSearchParams(hashQuery)
          token = hashParams.get(paramKey) || ''
        }
      }

      // 3. 兜底：使用正则从整个 URL 中匹配
      if (!token) {
        const regex = new RegExp(`[?&#]${paramKey}=([^&#]+)`)
        const match = urlStr.match(regex)
        token = match && match[1] ? decodeURIComponent(match[1]) : ''
      }

      if (token) {
        console.log(`[Auth] ✅ 在 URL [${urlStr.substring(0, 60)}...] 中成功找到 token`)
        setToken(token)
        console.log('[Auth] ✅ Token已写入Cookie，验证:', !!getToken())
        window.__URL_TOKEN_SYNCED__ = true

        // 清理当前窗口 URL
        const cleanedCurrent = cleanUrlToken(window.location.href, paramKey)
        if (cleanedCurrent !== window.location.href) {
          window.history.replaceState({}, document.title, cleanedCurrent)
        }

        // 尝试清理顶层窗口 URL (防跨域保护)
        try {
          if (window.top && window.top.location && window.top.location.href) {
            const cleanedTop = cleanUrlToken(window.top.location.href, paramKey)
            if (cleanedTop !== window.top.location.href) {
              window.top.history.replaceState({}, window.top.document.title, cleanedTop)
            }
          }
        } catch (e) {}

        // 尝试清理父级窗口 URL (防跨域保护)
        try {
          if (window.parent && window.parent.location && window.parent.location.href) {
            const cleanedParent = cleanUrlToken(window.parent.location.href, paramKey)
            if (cleanedParent !== window.parent.location.href) {
              window.parent.history.replaceState({}, window.parent.document.title, cleanedParent)
            }
          }
        } catch (e) {}

        console.log('[Auth] ✅ URL已清理')
        return true
      }
    } catch (err) {
      console.warn('[Auth] 解析 URL 匹配 Token 失败:', urlStr, err)
    }
  }

  // 4. 终极兜底：直接匹配当前窗口 href 作为防线
  try {
    const regex = new RegExp(`[?&#]${paramKey}=([^&#]+)`)
    const match = window.location.href.match(regex)
    const token = match && match[1] ? decodeURIComponent(match[1]) : ''
    if (token) {
      console.log('[Auth] 终极正则兜底匹配成功')
      setToken(token)
      window.__URL_TOKEN_SYNCED__ = true
      return true
    }
  } catch (e) {
    console.error('[Auth] 终极正则兜底匹配出错:', e)
  }

  console.log(`[Auth] ❌ 未找到参数 [${paramKey}] 对应的 token`)
  return false
}
