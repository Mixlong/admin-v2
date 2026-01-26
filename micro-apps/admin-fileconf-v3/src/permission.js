import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = path => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

/**
 * 获取第一个可访问的路由路径
 * @param {Array} routes 路由列表
 * @returns {string|null} 第一个可访问的路由路径
 */
function getFirstAccessibleRoute(routes) {
  for (const route of routes) {
    // 跳过隐藏的路由
    if (route.hidden) continue
    // 如果有子路由，递归查找
    if (route.children && route.children.length > 0) {
      // 如果有 redirect，直接使用
      if (route.redirect && route.redirect !== 'noRedirect') {
        return route.redirect
      }
      // 否则查找第一个可见的子路由
      const childPath = getFirstAccessibleRoute(route.children)
      if (childPath) {
        // 拼接完整路径
        const parentPath = route.path.startsWith('/') ? route.path : `/${route.path}`
        const fullPath = childPath.startsWith('/') ? childPath : `${parentPath}/${childPath}`
        return fullPath.replace(/\/+/g, '/')
      }
    } else if (route.path) {
      // 叶子节点路由
      return route.path.startsWith('/') ? route.path : `/${route.path}`
    }
  }
  return null
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log('🔄 [permission] 路由守卫触发, to:', to.path, 'from:', from.path)
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        console.log('🔄 [permission] roles 为空，重新获取用户信息和路由')
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore()
          .getInfo()
          .then(() => {
            isRelogin.show = false
            usePermissionStore()
              .generateRoutes()
              .then(accessRoutes => {
                console.log('🚀 ~ accessRoutes:', accessRoutes)
                // 根据roles权限生成可访问的路由表
                accessRoutes.forEach(route => {
                  if (!isHttp(route.path)) {
                    router.addRoute(route) // 动态添加可访问路由表
                  }
                })
                console.log('🔄 [permission] 动态路由添加完成，添加 404 路由')
                // 动态路由添加完成后，添加 404 路由作为兜底
                // 先移除可能存在的 404 路由，再重新添加
                if (router.hasRoute('NotFound')) {
                  router.removeRoute('NotFound')
                }
                router.addRoute({
                  path: '/:pathMatch(.*)*',
                  name: 'NotFound',
                  component: () => import('@/views/error/404'),
                  hidden: true
                })
                
                // 如果目标是根路径，跳转到第一个可访问的路由
                if (to.path === '/') {
                  const firstRoute = getFirstAccessibleRoute(accessRoutes)
                  console.log('🔄 [permission] 首页重定向到第一个路由:', firstRoute)
                  if (firstRoute) {
                    next({ path: firstRoute, replace: true })
                    return
                  }
                }
                
                console.log('🔄 [permission] 重新导航到:', to.path)
                next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
              })
          })
          .catch(err => {
            useUserStore()
              .logOut()
              .then(() => {
                ElMessage.error(err)
                next({ path: '/' })
              })
          })
      } else {
        // 如果已登录且访问根路径，跳转到第一个可访问的路由
        if (to.path === '/') {
          const permissionStore = usePermissionStore()
          const firstRoute = getFirstAccessibleRoute(permissionStore.addRoutes)
          console.log('🔄 [permission] 已登录用户访问根路径，重定向到:', firstRoute)
          if (firstRoute) {
            next({ path: firstRoute, replace: true })
            return
          }
        }
        next()
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
