/**
 * 微前端应用配置
 * V3 作为主应用，管理所有子应用
 */

/**
 * 获取微应用URL
 * 根据环境返回不同的V2地址
 */
function getMicroAppUrl() {
  const env = import.meta.env.MODE
  
  if (env === 'development') {
    // 开发环境 - 使用本地V2地址
    return 'http://192.168.2.11:2025'
  } else if (env === 'staging') {
    // 测试环境 - V2 部署在同域名下的 /admin-v3 路径
    return 'http://test-cloud.riding-evolved.com/admin-v3/'
  } else {
    // 生产环境
    return 'http://config-admin-api.riding-evolved.com/admin-v3/'
  }
}

/**
 * 微应用配置
 * 
 * 配置说明：
 * - name: 应用唯一标识
 * - url: 应用访问地址
 * - alive: 是否保活（切换路由时不销毁）
 * - enabled: 是否启用该应用
 * - description: 应用描述
 * - version: 应用版本（Vue 2/3）
 * - framework: 构建工具（Webpack/Vite）
 */
export const MICRO_APP_CONFIG = {
  // V2 主系统（作为子应用接入）
  'admin-v2': {
    name: 'admin-v2',
    url: getMicroAppUrl(),
    alive: true,
    enabled: true,
    basePath: '/notice-not',
    description: '迪太云 V2 管理系统（Vue 2 + Webpack）',
    version: 'vue2',
    framework: 'webpack'
  }
}

/**
 * 获取已启用的微应用列表
 */
export function getEnabledMicroApps() {
  return Object.entries(MICRO_APP_CONFIG)
    .filter(([_, config]) => config.enabled)
    .reduce((acc, [key, config]) => {
      acc[key] = config
      return acc
    }, {})
}

/**
 * 检查微应用是否启用
 */
export function isMicroAppEnabled(appName) {
  return MICRO_APP_CONFIG[appName]?.enabled || false
}

/**
 * 解析微应用配置
 * @param {string} component - 组件标识，格式: micro:应用名:子路径
 * @param {string} routePath - 路由路径
 */
export function parseMicroAppConfig(component, routePath) {
  console.log('🔍 解析微应用配置:', { component, routePath })

  // 格式: micro:应用名:子路径
  // 例如: micro:admin-v2:index
  const parts = component.split(':')
  const appName = parts[1]
  const subPath = parts[2] || ''

  const config = MICRO_APP_CONFIG[appName]
  
  if (!config) {
    console.warn(`❌ 未找到微应用配置: ${appName}`)
    return null
  }

  if (!config.enabled) {
    console.warn(`⚠️ 微应用未启用: ${appName}`)
    return null
  }

  // 为每个子路径创建唯一实例名称
  const uniqueName = subPath ? `${appName}-${subPath}` : appName

  const result = {
    ...config,
    name: uniqueName,
    alive: config.alive,
    props: {
      subPath,
      routePath,
      appName, // 原始应用名
      timestamp: Date.now()
    }
  }

  console.log('✅ 解析成功:', result)
  return result
}

/**
 * 根据路由路径判断是否为微应用路由
 */
export function isMicroAppRoute(path) {
  const enabledApps = getEnabledMicroApps()
  return Object.values(enabledApps).some(config => 
    path.startsWith(config.routePrefix)
  )
}

/**
 * 根据路由路径获取微应用名称
 */
export function getMicroAppNameByPath(path) {
  const enabledApps = getEnabledMicroApps()
  for (const [appName, config] of Object.entries(enabledApps)) {
    if (path.startsWith(config.routePrefix)) {
      return appName
    }
  }
  return null
}

/**
 * 获取微应用配置
 */
export function getMicroAppConfig(appName) {
  return MICRO_APP_CONFIG[appName] || null
}

// 开发环境打印配置信息
if (import.meta.env.MODE === 'development') {
  console.log('📦 微前端配置信息:', {
    v2Url: getMicroAppUrl(),
    environment: import.meta.env.MODE,
    enabledApps: Object.keys(getEnabledMicroApps()),
    allApps: Object.keys(MICRO_APP_CONFIG)
  })
}

export default {
  MICRO_APP_CONFIG,
  getEnabledMicroApps,
  isMicroAppEnabled,
  parseMicroAppConfig,
  isMicroAppRoute,
  getMicroAppNameByPath,
  getMicroAppConfig
}
