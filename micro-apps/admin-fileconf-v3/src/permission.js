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

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()

  // 微前端环境下直接放行，不需要认证
  if (window.__POWERED_BY_WUJIE__) {
    console.log('🔓 微前端环境，直接放行访问')
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    next()
  } else {
    // 独立运行时的权限控制（保持原逻辑）
    console.log("🚀 ~ getToken:", getToken())
    if (getToken()) {
      to.meta.title && useSettingsStore().setTitle(to.meta.title)
      /* has token*/
      if (to.path === '/login') {
        next({ path: '/' })
        NProgress.done()
      } else if (isWhiteList(to.path)) {
        next()
      } else {
        next()
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
  }
})

router.afterEach(() => {
  NProgress.done()
})
