import cache from '../plugins/cache'

export const ADMIN_V3_GET_INFO_CACHE_KEY = 'ADMIN_V3_GET_INFO_CACHE'
export const ADMIN_V3_GET_ROUTERS_CACHE_KEY = 'ADMIN_V3_GET_ROUTERS_CACHE'

function readCache(key) {
  try {
    return cache.local.getJSON(key)
  } catch (error) {
    console.warn(`[admin-v3-cache] 解析缓存失败: ${key}`, error)
    return null
  }
}

function isCacheTokenMatched(cacheData, token) {
  return Boolean(cacheData && cacheData.token && token && cacheData.token === token)
}

function getCacheResponse(key, token) {
  const cacheData = readCache(key)
  if (!isCacheTokenMatched(cacheData, token)) {
    return null
  }

  return cacheData.response || null
}

export function getCachedAdminV3Info(token) {
  return getCacheResponse(ADMIN_V3_GET_INFO_CACHE_KEY, token)
}

export function getCachedAdminV3Routers(token) {
  return getCacheResponse(ADMIN_V3_GET_ROUTERS_CACHE_KEY, token)
}
