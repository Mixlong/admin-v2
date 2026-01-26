# 微前端集成指南

## 架构概述

本项目采用 **Wujie（无界）** 微前端框架，实现 V3 作为主应用，V2 作为子应用的集成方案。

### 技术栈

- **主应用 (V3)**: Vue 3 + Vite + Element Plus + Wujie-Vue3
- **子应用 (V2)**: Vue 2 + Webpack + Element UI + Wujie-Vue2

### 架构特点

- ✅ V3 作为主应用，统一管理路由、权限、用户信息
- ✅ V2 作为子应用，保持独立运行能力
- ✅ 统一配置开关，灵活控制子应用启用/禁用
- ✅ 支持多个子应用并存
- ✅ 子应用保活（切换路由不销毁）
- ✅ 主子应用数据同步（Token、用户信息、权限）

---

## 一、主应用配置 (V3)

### 1.1 安装依赖

```bash
cd micro-apps/admin-fileconf-v3
npm install wujie-vue3
```

### 1.2 微应用配置文件

**文件**: `micro-apps/admin-fileconf-v3/src/config/microApps.js`

```javascript
/**
 * 微前端应用配置
 * V3 作为主应用，管理所有子应用
 */

export const MICRO_APP_CONFIG = {
  // V2 主系统（作为子应用接入）
  'admin-v2': {
    name: 'admin-v2',
    url: getMicroAppUrl(8080, '/v2', '/v2'),
    alive: true,
    enabled: true, // 🔧 开关：是否启用 V2 子应用
    description: '迪太云 V2 管理系统（Vue 2 + Webpack）',
    version: 'vue2',
    framework: 'webpack',
    routePrefix: '/v2'
  },
  
  // 其他微应用示例
  'ruoyi-admin': {
    name: 'ruoyi-admin',
    url: getMicroAppUrl(3002, '/ruoyi', '/ruoyi'),
    alive: true,
    enabled: false, // 🔧 开关：默认不启用
    description: 'RuoYi 管理系统模块',
    version: 'vue3',
    framework: 'vite',
    routePrefix: '/ruoyi'
  }
}
```

**配置说明**:
- `enabled`: 控制子应用是否启用（统一开关）
- `alive`: 是否保活（切换路由时不销毁）
- `routePrefix`: 路由前缀，用于区分不同子应用

### 1.3 主应用初始化

**文件**: `micro-apps/admin-fileconf-v3/src/main.js`

```javascript
import WujieVue from 'wujie-vue3'
import { setupApp, preloadApp, bus } from 'wujie'

// 注册 Wujie 微前端
app.use(WujieVue)

// 配置微前端全局设置
const { MICRO_APP_CONFIG } = await import('@/config/microApps')

// 为每个启用的微应用配置生命周期
Object.entries(MICRO_APP_CONFIG).forEach(([appName, config]) => {
  if (config.enabled) {
    setupApp({
      name: appName,
      url: config.url,
      alive: config.alive,
      exec: true,
      fetch: (url, options) => {
        // 自定义 fetch，添加认证信息
        const token = store.getters.token
        if (token) {
          options = options || {}
          options.headers = options.headers || {}
          options.headers['Authorization'] = 'Bearer ' + token
        }
        return window.fetch(url, options)
      },
      props: {
        jump: (path) => {
          console.log('🔗 子应用请求跳转:', path)
          router.push(path)
        }
      }
    })
    
    console.log(`✅ 微应用 ${appName} 配置完成`)
  }
})
```

### 1.4 路由配置

**文件**: `micro-apps/admin-fileconf-v3/src/router/index.js`

```javascript
import MicroAppContainer from '@/components/MicroAppContainer.vue'

export const constantRoutes = [
  // ... 其他路由
  
  // V2 子应用路由（微前端）
  {
    path: '/v2',
    component: Layout,
    hidden: true,
    children: [
      {
        path: ':pathMatch(.*)*',
        name: 'AdminV2',
        component: MicroAppContainer,
        meta: {
          title: 'V2系统',
          microApp: 'micro:admin-v2:index'
        }
      }
    ]
  }
]
```

### 1.5 微应用容器组件

**文件**: `micro-apps/admin-fileconf-v3/src/components/MicroAppContainer.vue`

已创建完成，包含以下功能：
- 微应用加载、挂载、卸载生命周期管理
- 主子应用数据同步（Token、用户信息、权限）
- 路由导航同步
- 错误处理和重新加载

---

## 二、子应用配置 (V2)

### 2.1 安装依赖

```bash
cd /Users/dragons/Desktop/project/FILECONF-UI
npm install wujie-vue2
```

### 2.2 主入口文件配置

**文件**: `src/main.js`

需要添加以下内容：

```javascript
import WujieVue from 'wujie-vue2'

Vue.use(WujieVue)

// 微前端生命周期钩子
if (window.__POWERED_BY_WUJIE__) {
  let instance = null
  
  window.__WUJIE_MOUNT = () => {
    console.log('🚀 V2 子应用开始挂载')
    instance = new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })
  }
  
  window.__WUJIE_UNMOUNT = () => {
    console.log('👋 V2 子应用开始卸载')
    if (instance) {
      instance.$destroy()
      instance = null
    }
  }
  
  // 监听主应用的数据同步
  window.$wujie?.bus.$on('main-store-sync', (data) => {
    console.log('📥 V2 收到主应用数据:', data)
    if (data.user && data.user.token) {
      store.dispatch('SetToken', data.user.token)
      // 可以根据需要同步其他数据
    }
  })
  
  // 监听主应用的路由导航
  window.$wujie?.bus.$on('navigate-to', (path) => {
    console.log('🧭 V2 收到导航指令:', path)
    // 移除路由前缀后跳转
    const targetPath = path.replace('/admin-v2', '')
    if (targetPath && router.currentRoute.path !== targetPath) {
      router.push(targetPath)
    }
  })
} else {
  // 独立运行模式
  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  })
}
```

### 2.3 Vue Config 配置

**文件**: `vue.config.js`

已配置完成，包含：
- 允许跨域访问的 headers
- `disableHostCheck: true`
- `host: '0.0.0.0'` 允许外部访问

### 2.4 路由配置

**文件**: `src/router/index.js`

需要确保路由使用 `hash` 模式（Wujie 推荐）：

```javascript
export default new Router({
  mode: 'hash', // 使用 hash 模式
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
```

---

## 三、启动和测试

### 3.1 启动子应用 (V2)

```bash
cd /Users/dragons/Desktop/project/FILECONF-UI
npm run dev
```

V2 将在 `http://192.168.2.15:8080` 启动（根据本机IP）

### 3.2 启动主应用 (V3)

```bash
cd micro-apps/admin-fileconf-v3
npm run dev
```

V3 将在 `http://localhost:5173` 启动

### 3.3 访问测试

1. 访问 V3 主应用: `http://localhost:5173`
2. 登录后，访问 V2 子应用路由: `http://localhost:5173/v2/xxx`
3. V2 子应用将在 V3 的容器中加载

---

## 四、开关管理

### 4.1 启用/禁用子应用

编辑 `micro-apps/admin-fileconf-v3/src/config/microApps.js`:

```javascript
export const MICRO_APP_CONFIG = {
  'admin-v2': {
    // ...
    enabled: true, // 改为 false 即可禁用
  }
}
```

### 4.2 动态检查

```javascript
import { isMicroAppEnabled } from '@/config/microApps'

if (isMicroAppEnabled('admin-v2')) {
  // V2 子应用已启用
}
```

---

## 五、数据同步

### 5.1 主应用 → 子应用

主应用通过 `window.$wujie.bus` 发送数据：

```javascript
window.$wujie.bus.$emit('main-store-sync', {
  user: {
    token: userStore.token,
    name: userStore.name,
    roles: userStore.roles
  }
})
```

### 5.2 子应用 → 主应用

子应用通过 `window.$wujie.bus` 发送数据：

```javascript
window.$wujie?.bus.$emit('sub-app-event', {
  type: 'logout',
  data: {}
})
```

主应用监听：

```javascript
window.$wujie.bus.$on('sub-app-event', (data) => {
  console.log('收到子应用事件:', data)
})
```

---

## 六、路由跳转

### 6.1 主应用跳转到子应用

```javascript
// V3 主应用
router.push('/v2/system/user')
```

### 6.2 子应用跳转到主应用

```javascript
// V2 子应用
window.$wujie?.props.jump('/index')
```

### 6.3 子应用内部跳转

```javascript
// V2 子应用
this.$router.push('/system/user')
```

---

## 七、常见问题

### 7.1 子应用加载失败

**原因**: 子应用未启动或端口不正确

**解决**: 
1. 确保子应用已启动
2. 检查 `microApps.js` 中的端口配置
3. 检查网络和 CORS 配置

### 7.2 Token 同步失败

**原因**: 主子应用的 Token 存储方式不一致

**解决**:
1. 统一使用 Cookie 或 LocalStorage
2. 在子应用中监听 `main-store-sync` 事件
3. 手动同步 Token 到子应用的 store

### 7.3 样式冲突

**原因**: 主子应用的全局样式互相影响

**解决**:
1. Wujie 默认使用 Shadow DOM 隔离样式
2. 如果需要共享样式，可以在主应用中定义全局样式
3. 避免使用全局选择器（如 `*`、`body`）

### 7.4 路由重复

**原因**: 主子应用的路由名称冲突

**解决**:
1. 为子应用路由添加前缀（如 `v2-`）
2. 使用 `routePrefix` 区分不同子应用

---

## 八、部署配置

### 8.1 开发环境

- V3: `http://localhost:5173`
- V2: `http://192.168.2.15:8080`

### 8.2 测试环境

- V3: `http://test-admin.riding-evolved.com`
- V2: `http://test-admin.riding-evolved.com/v2`

### 8.3 生产环境

- V3: `http://config-admin-api.riding-evolved.com`
- V2: `http://config-admin-api.riding-evolved.com/v2`

**注意**: 需要在 Nginx 中配置反向代理，将 `/v2` 路径代理到 V2 应用。

---

## 九、性能优化

### 9.1 预加载

在用户登录后预加载常用子应用：

```javascript
import { preloadApp } from 'wujie'

preloadApp({
  name: 'admin-v2',
  url: 'http://192.168.2.15:8080'
})
```

### 9.2 保活模式

设置 `alive: true` 可以让子应用在切换路由时不销毁，提升性能。

### 9.3 按需加载

只在需要时加载子应用，避免首屏加载过多资源。

---

## 十、总结

本项目采用 Wujie 微前端框架，实现了 V3 作为主应用、V2 作为子应用的集成方案。通过统一配置开关，可以灵活控制子应用的启用/禁用。主子应用之间通过事件总线进行数据同步和路由跳转，实现了良好的解耦和复用。

**关键文件**:
- `micro-apps/admin-fileconf-v3/src/config/microApps.js` - 微应用配置
- `micro-apps/admin-fileconf-v3/src/components/MicroAppContainer.vue` - 微应用容器
- `micro-apps/admin-fileconf-v3/src/main.js` - 主应用初始化
- `src/main.js` - 子应用生命周期钩子

**下一步**:
1. 更新 V2 的 `src/main.js`，添加微前端生命周期钩子
2. 测试主子应用集成
3. 配置生产环境的 Nginx 反向代理
