import { defineStore } from 'pinia'
import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import MicroAppContainer from '@/components/MicroAppContainer.vue'
import { MICRO_APP_CONFIG } from '@/config/microApps'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            resolve(rewriteRoutes)
          })
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    
    // appType: null 或 1 表示微前端组件，2 表示本地 V3 组件
    const isMicroApp = route.appType == null || route.appType === 1
    const isLocalV3 = route.appType === 2
    const hasChildren = route.children && route.children.length
    
    console.log('[filterAsyncRouter] 路由:', route.path, 'appType:', route.appType, 'isMicroApp:', isMicroApp, 'isLocalV3:', isLocalV3, 'hasChildren:', hasChildren)
    
    if (isLocalV3 && !hasChildren && route.component && typeof route.component === 'string') {
      // V3 本地组件，使用 loadView 加载（跳过 Layout/ParentView/InnerLink）
      if (route.component !== 'Layout' && route.component !== 'ParentView' && route.component !== 'InnerLink') {
        console.log('[filterAsyncRouter] 设置V3本地组件:', route.path, route.component)
        route.component = loadView(route.component)
      }
    } else if (isMicroApp && !hasChildren) {
      // 微前端路由，使用 MicroAppContainer
      console.log('[filterAsyncRouter] 设置微前端组件:', route.path)
      route.component = MicroAppContainer
      route.meta = route.meta || {}
      const v2Config = MICRO_APP_CONFIG['admin-v2']
      if (v2Config) {
        const basePath = v2Config.basePath || ''
        let microPath = route.path
        if (basePath && microPath.startsWith(basePath)) {
          microPath = microPath.slice(basePath.length) || '/'
        }
        if (!microPath.startsWith('/')) {
          microPath = `/${microPath}`
        }
        route.meta.microAppPath = microPath
        route.meta.microApp = {
          name: v2Config.name,
          url: v2Config.url,
          props: {
            subPath: route.meta.microAppPath
          }
        }
        console.log('[filterAsyncRouter] 微前端配置:', route.meta.microApp)
      }
    } else if (isMicroApp && hasChildren) {
      // 微前端父级路由
      if (route.component !== 'Layout') {
        route.component = ParentView
      }
    }
    
    // 处理字符串类型的特殊组件
    if (route.component) {
      if (typeof route.component === 'string') {
        // Layout ParentView 组件特殊处理
        if (route.component === 'Layout') {
          route.component = Layout
        } else if (route.component === 'ParentView') {
          route.component = ParentView
        } else if (route.component === 'InnerLink') {
          route.component = InnerLink
        } else {
          // 所有其他字符串组件都需要转换，无论是否为 V3 本地组件
          const loadedComponent = loadView(route.component)
          if (loadedComponent) {
            route.component = loadedComponent
          } else {
            // 如果加载失败，使用 ParentView 作为后备
            console.warn('[filterAsyncRouter] 组件加载失败，使用 ParentView 作为后备:', route.path, route.component)
            route.component = ParentView
          }
        }
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    if (lastRouter && !el.path.startsWith('/')) {
      el.path = `${lastRouter.path}/${el.path}`.replace(/\/{2,}/g, '/')
    }
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      // appType: null 或 1 表示微前端组件，2 表示本地 V3 组件
      const isMicroApp = el.appType == null || el.appType === 1
      const isLocalV3 = el.appType === 2
      const hasChildren = el.children && el.children.length
      
      console.log('[filterChildren] 路由:', el.path, 'appType:', el.appType, 'isMicroApp:', isMicroApp, 'isLocalV3:', isLocalV3)
      
      if (isLocalV3 && !hasChildren && el.component && typeof el.component === 'string') {
        // V3 本地组件，使用 loadView 加载
        console.log('[filterChildren] 设置V3本地组件:', el.path, el.component)
        el.component = loadView(el.component)
      } else if (isMicroApp && !hasChildren) {
        // 微前端路由，使用 MicroAppContainer
        console.log('[filterChildren] 设置微前端组件:', el.path)
        el.component = MicroAppContainer
        el.meta = el.meta || {}
        const v2Config = MICRO_APP_CONFIG['admin-v2']
        if (v2Config) {
          const basePath = v2Config.basePath || ''
          let microPath = el.path
          if (basePath && microPath.startsWith(basePath)) {
            microPath = microPath.slice(basePath.length) || '/'
          }
          if (!microPath.startsWith('/')) {
            microPath = `/${microPath}`
          }
          el.meta.microAppPath = microPath
          el.meta.microApp = {
            name: v2Config.name,
            url: v2Config.url,
            props: {
              subPath: el.meta.microAppPath
            }
          }
        }
      }
      children.push(el)
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res
  // 移除可能的 .vue 后缀和 views/ 前缀
  let normalizedView = view
  if (normalizedView.endsWith('.vue')) {
    normalizedView = normalizedView.slice(0, -4)
  }
  if (normalizedView.startsWith('views/')) {
    normalizedView = normalizedView.slice(6)
  }
  
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === normalizedView) {
      res = () => modules[path]()
      break
    }
  }
  
  if (!res) {
    console.error('[loadView] 未找到组件:', view, '-> 标准化后:', normalizedView, '可用路径:', Object.keys(modules).map(p => p.split('views/')[1]?.split('.vue')[0]).filter(Boolean))
    // 返回 null 而不是 undefined，让调用方处理
    return null
  }
  
  return res
}

export default usePermissionStore
