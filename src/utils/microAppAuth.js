/**
 * 微应用认证工具
 * 处理主应用与微应用之间的token共享
 */

import { getToken, setToken, removeToken } from '@/utils/auth'
import Cookies from 'js-cookie'

// Cookie配置
const COOKIE_CONFIG = {
  domain: process.env.NODE_ENV === 'development' 
    ? '.local.yourdomain.com'  // 开发环境域名
    : '.yourdomain.com',       // 生产环境域名
  path: '/',
  secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
  sameSite: 'lax'
}

/**
 * 设置共享token
 * @param {string} token 
 */
export function setSharedToken(token) {
  // 设置到localStorage (主应用使用)
  setToken(token)
  
  // 设置到共享Cookie (微应用使用)
  Cookies.set('Admin-Token', token, COOKIE_CONFIG)
  Cookies.set('shared-token', token, COOKIE_CONFIG)
}

/**
 * 获取共享token
 * @returns {string|null}
 */
export function getSharedToken() {
  // 优先从localStorage获取
  let token = getToken()
  
  // 如果localStorage没有，尝试从Cookie获取
  if (!token) {
    token = Cookies.get('Admin-Token') || Cookies.get('shared-token')
    if (token) {
      // 同步到localStorage
      setToken(token)
    }
  }
  
  return token
}

/**
 * 移除共享token
 */
export function removeSharedToken() {
  // 移除localStorage
  removeToken()
  
  // 移除共享Cookie
  Cookies.remove('Admin-Token', COOKIE_CONFIG)
  Cookies.remove('shared-token', COOKIE_CONFIG)
}

/**
 * 同步用户信息到微应用
 * @param {object} userInfo 
 */
export function syncUserInfo(userInfo) {
  const userData = {
    ...userInfo,
    timestamp: Date.now()
  }
  
  // 设置到Cookie供微应用使用
  Cookies.set('user-info', JSON.stringify(userData), COOKIE_CONFIG)
}

/**
 * 获取共享用户信息
 * @returns {object|null}
 */
export function getSharedUserInfo() {
  try {
    const userInfo = Cookies.get('user-info')
    return userInfo ? JSON.parse(userInfo) : null
  } catch (error) {
    console.warn('解析用户信息失败:', error)
    return null
  }
}

/**
 * 为微应用准备认证数据
 * @returns {object}
 */
export function prepareMicroAppAuth() {
  return {
    token: getSharedToken(),
    userInfo: getSharedUserInfo(),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]')
  }
}

/**
 * 监听token变化并同步
 */
export function watchTokenChange() {
  // 监听storage变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'Admin-Token') {
      if (e.newValue) {
        setSharedToken(e.newValue)
      } else {
        removeSharedToken()
      }
    }
  })
  
  // 定期检查token是否变化
  let lastToken = getToken()
  setInterval(() => {
    const currentToken = getToken()
    if (currentToken !== lastToken) {
      if (currentToken) {
        setSharedToken(currentToken)
      } else {
        removeSharedToken()
      }
      lastToken = currentToken
    }
  }, 1000)
}