/**
 * 子应用接收主应用store数据同步
 */
import useUserStore from '@/store/modules/user'
import { setToken } from '@/utils/auth'
import router from '@/router'

// 初始化主应用数据同步监听
export function initMainAppSync() {
  // 只在无界环境下初始化
  if (!window.__POWERED_BY_WUJIE__) {
    console.log('⚠️  非无界环境，跳过主应用数据同步初始化')
    return
  }

  console.log('🔗 初始化主应用数据同步监听')

  // 监听主应用发送的store数据
  if (window.$wujie && window.$wujie.bus) {
    window.$wujie.bus.$on('main-store-sync', (storeData) => {
      const syncType = storeData.source || 'manual'
      console.log(`📦 子应用接收到主应用store数据 [${syncType}]:`, storeData)
      syncMainAppData(storeData, syncType)
    })

    // 监听导航事件
    window.$wujie.bus.$on('navigate-to', (targetPath) => {
      console.log('🧭 子应用接收到导航指令:', targetPath)
      // 处理路由跳转
      if (router && targetPath) {
        router.push(targetPath).catch(err => {
          console.warn('路由跳转失败:', err)
        })
      }
    })

    console.log('✅ 主应用数据同步监听器初始化完成')
  } else {
    console.warn('⚠️  无界bus未找到，数据同步可能异常')
  }
}

// 同步主应用数据到子应用store
function syncMainAppData(storeData, syncType = 'manual') {
  try {
    const userStore = useUserStore()

    console.log(`🔄 开始同步主应用数据 [${syncType}]:`, storeData)

    if (storeData.user) {
      // 同步token
      if (storeData.user.token && storeData.user.token !== userStore.token) {
        setToken(storeData.user.token)
        userStore.token = storeData.user.token
        console.log('✅ 同步token成功:', storeData.user.token)
      }

      // 同步用户信息
      if (storeData.user.id) userStore.id = storeData.user.id
      if (storeData.user.name) userStore.name = storeData.user.name
      if (storeData.user.nickName) userStore.nickName = storeData.user.nickName
      if (storeData.user.avatar) userStore.avatar = storeData.user.avatar
      if (storeData.user.roles) userStore.roles = storeData.user.roles
      if (storeData.user.permissions) userStore.permissions = storeData.user.permissions

      console.log(`✅ 子应用store数据同步完成 [${syncType}]:`, {
        token: userStore.token,
        id: userStore.id,
        name: userStore.name,
        nickName: userStore.nickName,
        roles: userStore.roles?.length,
        permissions: userStore.permissions?.length
      })

      // 通知同步完成
      window.microAppDataSynced = true

      // 如果是首次同步用户数据，生成路由权限
      if (storeData.user.roles && storeData.user.roles.length > 0) {
        generatePermissionRoutes()
      }

      // 发送同步完成事件
      if (window.$wujie && window.$wujie.bus) {
        window.$wujie.bus.$emit('data-sync-complete', {
          success: true,
          timestamp: Date.now()
        })
      }
    }
  } catch (error) {
    console.error('❌ 同步主应用数据失败:', error)

    // 发送同步失败事件
    if (window.$wujie && window.$wujie.bus) {
      window.$wujie.bus.$emit('data-sync-complete', {
        success: false,
        error: error.message,
        timestamp: Date.now()
      })
    }
  }
}

// 生成权限路由
async function generatePermissionRoutes() {
  try {
    const { isHttp } = await import('@/utils/validate')
    const usePermissionStore = (await import('@/store/modules/permission')).default

    console.log('🔄 开始生成权限路由')
    const permissionStore = usePermissionStore()

    const accessRoutes = await permissionStore.generateRoutes()
    console.log('✅ 权限路由生成完成，路由数量:', accessRoutes.length)

    // 动态添加路由
    accessRoutes.forEach(route => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    console.log('✅ 动态路由添加完成')
  } catch (error) {
    console.error('生成权限路由失败:', error)
  }
}

// 向主应用发送子应用状态
export function sendStatusToMainApp(status) {
  if (window.$wujie && window.$wujie.bus) {
    window.$wujie.bus.$emit('micro-app-status', {
      appName: 'ruoyi-admin',
      status: status,
      timestamp: Date.now()
    })
  }
}

// 向主应用发送认证错误
export function sendAuthErrorToMainApp(errorData) {
  if (window.__POWERED_BY_WUJIE__ && window.$wujie && window.$wujie.bus) {
    console.log('📤 向主应用发送认证错误:', errorData)
    window.$wujie.bus.$emit('micro-app-auth-error', {
      ...errorData,
      appName: 'ruoyi-admin',
      timestamp: Date.now()
    })
  } else {
    console.warn('⚠️  无法向主应用发送认证错误，非微前端环境或bus不可用')
  }
}