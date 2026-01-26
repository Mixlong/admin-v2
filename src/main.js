import Vue from 'vue';
import App from './App';
import store from '@/store';
import router from '@/router';
import plugins from './plugins' // plugins
import WujieVue from 'wujie-vue2'; // 无界微前端

// 全局表单输入修复补丁（解决 loading 卡死、输入框禁用等问题）
// import '@/plugins/fixFormBlock';

// import './assets/styles/element-variables.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/styles/index.scss'; // global css
import '@/assets/styles/ruoyi.scss'; // ruoyi css
import 'normalize.css/normalize.css'; // a modern alternative to CSS resets
// 延迟加载非必需CSS
import "viewerjs/dist/viewer.css";
// import "vue-easytable/libs/theme-default/index.css";
import '@/assets/icons'; // icon
import '@/permission'; // permission control

import '@/utils/sticky';
import '@/utils/mainOperation/mainDirective'
import MainComponent from '@/utils/mainOperation/mainComponent';
import '@/utils/mainOperation/mainFn'
import directives from '@/directives'
// import VueNativeSock from 'vue-native-websocket';
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore';
import IntelligentSearchForm from '@/components/IntelligentSearchForm'; // 会自动解析到 index.js
import { syncTokenFromUrl } from '@/utils/auth'

// 处理外部携带 token 的场景,优先写入 Cookie，并标记外部跳转（10分钟有效）
const isExternalJump = syncTokenFromUrl()
store.dispatch('app/initExternalFlag')
if (isExternalJump) {
  store.dispatch('app/setExternalFlag', { value: true })
}
Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'success' });
};

Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'error' });
};

Vue.prototype.msgInfo = function (msg) {
  this.$message.info(msg);
};

Vue.prototype.msgWarning = function (msg) {
  this.$message.warning(msg);
};

// 注意：$ELEMENT 已在 mainDirective.js 中设置，这里不再重复设置
// Vue.prototype.$ELEMENT = { size: 'mini', zIndex: 3000 };
Vue.config.productionTip = false;

Vue.use(plugins)
Vue.use(MainComponent)
Vue.use(TypedSelectLoadMore)
Vue.use(IntelligentSearchForm)
Vue.use(directives) // 注册自定义指令
Vue.use(WujieVue) // 注册无界组件

// 微应用预加载（已禁用以避免多余iframe）
// import { preloadApp } from 'wujie'

// 在用户登录后预加载常用微应用（已禁用）
const preloadMicroApps = () => {
  console.log('🚫 微应用预加载已禁用，避免多余iframe')
  // const hostname = window.location.hostname;
  // preloadApp({
  //   name: 'ruoyi-admin',
  //   url: process.env.NODE_ENV === 'development' 
  //     ? `http://${hostname}:3002` 
  //     : 'https://ruoyi-admin.yourdomain.com'
  // })
}

// 将预加载函数挂载到Vue原型，方便在权限获取后调用
Vue.prototype.$preloadMicroApps = preloadMicroApps

// 初始化微应用token同步
import { watchTokenChange } from '@/utils/microAppAuth'
watchTokenChange()

// 🆕 版本检查插件（手动触发模式，不自动加载）
import VersionCheckPlugin from '@/plugins/versionCheck'
Vue.use(VersionCheckPlugin)

// ==================== 微前端生命周期钩子 ====================
if (window.__POWERED_BY_WUJIE__) {
  console.log('🚀 V2 作为子应用运行')
  
  // 🔧 修复 Element UI Popper 定位问题
  import('@/utils/wujiePopperFix').then(({ initPopperFix }) => {
    initPopperFix()
  })
  
  // 添加微前端标识类，用于CSS高度修复
  document.documentElement.classList.add('wujie-micro-app')
  document.body.classList.add('wujie-micro-app')

  // 强制子应用默认组件尺寸
  Vue.prototype.$ELEMENT = { size: 'mini', zIndex: 3000 }
  
  // 动态加载 Element UI 完整样式（确保在微前端环境下样式正确加载）
  const loadElementUIStyles = () => {
    // 检查是否已加载
    if (document.getElementById('element-ui-style-cdn')) {
      console.log('📦 Element UI 样式已存在，跳过加载')
      return
    }
    
    // 移除可能存在的旧样式链接
    const oldLinks = document.querySelectorAll('link[href*="element-ui"]')
    oldLinks.forEach(link => {
      if (!link.id || !link.id.includes('cdn')) {
        link.remove()
      }
    })
    
    // 加载完整的 Element UI 样式 - 使用 CDN
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/index.css'
    link.id = 'element-ui-style-cdn'
    // 插入到 head 最前面，确保优先级
    document.head.insertBefore(link, document.head.firstChild)
    console.log('📦 动态加载 Element UI 完整样式 (CDN)')
    
    // 加载 iconfont 图标
    if (!document.getElementById('iconfont-style-cdn')) {
      const iconLink = document.createElement('link')
      iconLink.rel = 'stylesheet'
      iconLink.href = 'https://at.alicdn.com/t/font_2553510_ho5w4lrqzs.css'
      iconLink.id = 'iconfont-style-cdn'
      document.head.appendChild(iconLink)
    }
  }
  
  // 注入 V2 自定义样式
  const injectCustomStyles = () => {
    // 检查是否已注入
    if (document.getElementById('v2-custom-style-enhanced')) {
      return
    }
    
    // 移除旧的自定义样式
    const oldStyle = document.getElementById('v2-custom-style')
    if (oldStyle) oldStyle.remove()
    
    const customStyle = document.createElement('style')
    customStyle.id = 'v2-custom-style-enhanced'
    customStyle.textContent = `
      /* V2 自定义 Element UI 样式 - 高优先级 */
      
      /* Dialog 圆角和阴影 - 最重要 */
      .el-dialog {
        transform: none !important;
        left: 0 !important;
        position: relative !important;
        margin: 0 auto !important;
        border-radius: 10px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,.3) !important;
        overflow: hidden !important;
      }
      .el-dialog__wrapper {
        overflow: auto !important;
      }
      .el-dialog__header {
        border-radius: 10px 10px 0 0 !important;
        background: #fff !important;
      }
      .el-dialog__body {
        padding: 20px !important;
      }
      .el-dialog__footer {
        border-radius: 0 0 10px 10px !important;
      }
      
      /* Message Box 圆角 */
      .el-message-box {
        border-radius: 10px !important;
        overflow: hidden !important;
      }
      
      /* Popover 圆角 */
      .el-popover {
        border-radius: 6px !important;
      }
      
      /* Card 圆角 */
      .el-card {
        border-radius: 6px !important;
      }
      
      /* 面包屑 */
      .el-breadcrumb__inner,
      .el-breadcrumb__inner a {
        font-weight: 400 !important;
      }
      
      /* 上传组件 */
      .el-upload input[type="file"] {
        display: none !important;
      }
      .el-upload__input {
        display: none !important;
      }
      
      /* 日期范围选择器 */
      .el-range-editor.el-input__inner {
        display: inline-flex !important;
      }
      .el-range-separator {
        box-sizing: content-box !important;
      }
      
      /* 图片预览器 */
      .el-image-viewer__img {
        max-width: 70vw !important;
        max-height: 70vh !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* 表格样式 */
      .el-table {
        border-radius: 6px !important;
      }
      .el-table th {
        background-color: #f5f7fa !important;
      }
      .el-table td, .el-table th {
        padding: 8px 0 !important;
      }
      
      /* 按钮样式 */
      .el-button {
        border-radius: 4px !important;
      }
      .el-button--mini {
        padding: 7px 10px !important;
      }
      
      /* 输入框圆角 */
      .el-input__inner {
        border-radius: 4px !important;
      }
      .el-textarea__inner {
        border-radius: 4px !important;
      }
      
      /* Select 下拉框 */
      .el-select-dropdown {
        border-radius: 4px !important;
      }
      
      /* 分页样式 */
      .el-pagination {
        margin-top: 15px !important;
        text-align: right !important;
      }
      .el-pagination button {
        border-radius: 4px !important;
      }
      .el-pager li {
        border-radius: 4px !important;
      }
      
      /* 表单样式 */
      .el-form-item__label {
        font-weight: normal !important;
      }
      .el-form-item__error {
        min-width: 150px !important;
        text-align: left !important;
      }
      
      /* 下拉菜单 */
      .el-dropdown-menu {
        border-radius: 4px !important;
      }
      .el-dropdown-menu a {
        display: block !important;
      }
      
      /* Tabs 标签页 */
      .el-tabs__header {
        margin-bottom: 15px !important;
      }
      
      /* Tag 标签 */
      .el-tag {
        border-radius: 4px !important;
      }
      
      /* Tooltip */
      .el-tooltip__popper {
        max-width: 50% !important;
        font-size: 14px !important;
        line-height: 25px !important;
        border-radius: 4px !important;
      }
      
      /* 滚动条样式 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 2px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(144, 147, 153, 0.3);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #888;
      }
      
      /* ===== 用户管理页面卡片样式 ===== */
      @keyframes user-card-pulse {
        0%, 50%, 100% {
          box-shadow: 0 0 8px 6px #42e573;
        }
      }
      
      .userList-box {
        max-height: calc(100vh - 350px);
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .navbar-wrap-gg {
        padding: 40px 20px 30px 20px;
        will-change: transform;
        display: inline-block;
        position: relative;
        vertical-align: top;
        text-align: center;
      }
      
      .navbar-wrap-gg.work-end .bg {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        animation: user-card-pulse 0.8s infinite;
      }
      
      .navbar-wrap-gg .footer-content {
        position: absolute;
        visibility: hidden;
        opacity: 0;
        bottom: 15px;
        left: 50%;
        width: 80%;
        display: flex;
        transform: translate(-50%, 0);
        transition: all 0.5s 0.1s;
      }
      
      .navbar-wrap-gg .footer-content > .el-button {
        flex: 1;
        height: 30px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 13px;
        cursor: pointer;
      }
      
      .navbar-wrap-gg .footer-content > .el-button:nth-child(2) {
        border-radius: 5px;
        background: rgb(24, 144, 255);
        color: #fff;
        border-color: rgb(24, 144, 255);
      }
      
      .navbar-wrap-gg .all-content {
        position: absolute;
        top: 0px;
        left: 300px;
        visibility: hidden;
        overflow-y: scroll;
        transition: all 0.4s;
        height: 0;
        cursor: pointer;
      }
      
      .navbar-wrap-gg .all-content .all-li {
        min-width: 80px;
        border-bottom: 1px solid #e6ebf5;
        padding: 10px 0;
        line-height: normal;
        font-size: 13px;
        white-space: nowrap;
      }
      
      .navbar-wrap-gg .all-content .all-li:hover {
        background-color: #1890ff;
        color: #fff;
      }
      
      .navbar-wrap-gg .all-content.all-content-active {
        visibility: visible;
        height: 300px;
      }
      
      .navbar-wrap-gg .navbar {
        display: inline-block;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        color: #383838;
        transition: 0.24s 0.2s;
        background: transparent;
      }
      
      .navbar-wrap-gg .navbar .cover {
        position: relative;
        z-index: 102;
        cursor: pointer;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: transparent;
        box-sizing: border-box;
        overflow: hidden;
        padding: 20px;
        vertical-align: middle;
      }
      
      .navbar-wrap-gg .navbar .cover img {
        width: 100%;
        border-radius: 100%;
        border: 1px solid #ccc;
      }
      
      .navbar-wrap-gg .navbar .title-style {
        padding-top: 20px;
        color: #666;
        height: 80px;
        font-size: 14px;
        line-height: 20px;
        max-width: 190px;
        overflow: hidden;
      }
      
      .navbar-wrap-gg:hover {
        background: rgba(255, 255, 255, 0.75);
      }
      
      .navbar-wrap-gg:hover .footer-content {
        visibility: visible;
        opacity: 1;
      }
      
      .navbar-wrap-gg .menu {
        list-style: none;
        padding: 0;
        margin: 0;
        position: absolute;
        top: -75px;
        left: -75px;
        border: 150px solid transparent;
        cursor: default;
        border-radius: 50%;
        transform: scale(0);
        transition: transform 1.4s 0.07s;
        z-index: -1;
      }
      
      .navbar-wrap-gg:hover .menu {
        transition: transform 0.4s 0.08s, z-index 0s 0.5s;
        transform: scale(1);
        z-index: 100;
      }
      
      .navbar-wrap-gg .menu li {
        position: absolute;
        top: 100px;
        left: -100px;
        transform-origin: 100px -100px;
        transition: all 0.3s 0.1s;
      }
      
      .navbar-wrap-gg:hover .menu li {
        transition: all 0.5s;
      }
      
      .navbar-wrap-gg .menu li a {
        transition: 0.6s;
        width: 45px;
        height: 60px;
        border-radius: 50%;
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 60%;
        text-decoration: none;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: flex-start;
      }
      
      .navbar-wrap-gg .menu li a span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 80px;
      }
      
      .navbar-wrap-gg:hover .menu li:nth-child(1) { transition-delay: 0.02s; transform: rotate(29deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(1) a { transition-delay: 0.04s; transform: rotate(-29deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(2) { transition-delay: 0.04s; transform: rotate(64deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(2) a { transition-delay: 0.08s; transform: rotate(-64deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(3) { transition-delay: 0.06s; transform: rotate(99deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(3) a { transition-delay: 0.12s; transform: rotate(-99deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(4) { transition-delay: 0.08s; transform: rotate(134deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(4) a { transition-delay: 0.16s; transform: rotate(-134deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(5) { transition-delay: 0.1s; transform: rotate(169deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(5) a { transition-delay: 0.2s; transform: rotate(-169deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(6) { transition-delay: 0.12s; transform: rotate(204deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(6) a { transition-delay: 0.24s; transform: rotate(-204deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(7) { transition-delay: 0.14s; transform: rotate(239deg); }
      .navbar-wrap-gg:hover .menu li:nth-child(7) a { transition-delay: 0.28s; transform: rotate(-239deg); }
      
      /* ===== 微前端环境高度修复 ===== */
      .wujie-micro-app .app-container,
      .wujie-micro-app .dashboard-editor-container {
        min-height: calc(100vh - 104px) !important;
        height: auto !important;
      }
      
      /* 通用页面容器高度 */
      .config-overview-container {
        min-height: calc(100vh - 84px) !important;
      }
    `
    // 插入到 head 末尾，确保覆盖其他样式
    document.head.appendChild(customStyle)
    console.log('📦 注入 V2 自定义样式（增强版）')
  }
  
  // 初始化样式
  const initStyles = () => {
    loadElementUIStyles()
    // 延迟注入自定义样式，确保在 Element UI 样式之后
    setTimeout(injectCustomStyles, 50)
  }
  
  // 立即加载样式
  initStyles()
  
  // DOM加载完成后再次确保样式正确
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initStyles, 100)
    })
  } else {
    setTimeout(initStyles, 100)
  }
  
  // 监听样式变化，防止被覆盖
  const styleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // 检查是否有新的样式节点被添加
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'STYLE' || node.tagName === 'LINK') {
            // 重新注入自定义样式以确保优先级
            setTimeout(injectCustomStyles, 10)
          }
        })
      }
    })
  })
  
  // 开始观察 head 元素
  styleObserver.observe(document.head, { childList: true })
  
  let instance = null
  
  // 子应用挂载
  window.__WUJIE_MOUNT = () => {
    console.log('🚀 V2 子应用开始挂载')
    // 确保样式加载
    initStyles()
    // 确保标识类存在
    document.documentElement.classList.add('wujie-micro-app')
    document.body.classList.add('wujie-micro-app')
    
    // 重新设置 Element UI 全局配置（确保在子应用中生效）
    Vue.prototype.$ELEMENT = { size: 'mini', zIndex: 3000 }
    
    instance = new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })
    // 挂载完成后再次确保样式
    setTimeout(initStyles, 200)
  }
  
  // 子应用卸载
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
      // 使用 setToken 函数而不是 vuex action
      const { setToken } = require('@/utils/auth')
      setToken(data.user.token)
      // 同步用户信息到 vuex
      if (data.user.name) {
        store.commit('SET_NAME', data.user.name)
      }
      if (data.user.avatar) {
        store.commit('SET_AVATAR', data.user.avatar)
      }
      if (data.user.roles) {
        store.commit('SET_ROLES', data.user.roles)
      }
      if (data.user.permissions) {
        store.commit('SET_PERMISSIONS', data.user.permissions)
      }
    }
  })
  
  // 监听主应用的路由导航
  window.$wujie?.bus.$on('navigate-to', (data) => {
    console.log('🧭 V2 收到导航指令:', data)

    // 处理字符串格式（向后兼容）
    if (typeof data === 'string') {
      const targetPath = data.replace('/admin-v2', '').replace('/v2', '')
      if (targetPath && router.currentRoute.path !== targetPath) {
        console.log('🔀 V2 跳转到路径:', targetPath)
        router.push({ path: targetPath }).catch(err => {
          console.warn('路由跳转失败:', err)
        })
      }
      return
    }

    // 处理对象格式 - 优先使用name进行路由导航
    if (data && typeof data === 'object') {
      const query = data.query || {}
      const params = data.params || {}

      // 优先使用name导航（更准确，不会出错）
      if (data.name) {
        const routeConfig = { name: data.name }
        if (Object.keys(query).length > 0) routeConfig.query = query
        if (Object.keys(params).length > 0) routeConfig.params = params

        console.log('🔀 V2 使用name跳转:', routeConfig)
        router.push(routeConfig).catch(err => {
          console.warn('name路由跳转失败:', err)
          // 降级到path导航
          fallbackToPathNavigation(data, query, params)
        })
      } else {
        // 没有name时使用path导航
        fallbackToPathNavigation(data, query, params)
      }
    }
  })

  // path导航降级方法
  function fallbackToPathNavigation(data, query, params) {
    let targetPath = data.path || data.fullPath || ''
    targetPath = targetPath.replace('/admin-v2', '').replace('/v2', '')

    if (targetPath && router.currentRoute.path !== targetPath) {
      const routeConfig = { path: targetPath }
      if (Object.keys(query).length > 0) routeConfig.query = query
      if (Object.keys(params).length > 0) routeConfig.params = params

      console.log('🔀 V2 使用path跳转:', routeConfig)
      router.push(routeConfig).catch(err => {
        console.warn('路由跳转失败:', err)
      })
    }
  }
  
  // 通知主应用子应用已准备就绪
  window.$wujie?.bus.$emit('sub-app-ready', {
    name: 'admin-v2',
    timestamp: Date.now()
  })
} else {
  // 独立运行模式
  console.log('🚀 V2 独立运行模式')
  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  })
}

// 初始化性能监控 - 已禁用，避免干扰表单输入
// import performanceMonitor from '@/utils/performanceMonitor'
// import { startAutoFix, addKeyboardShortcut } from '@/utils/emergencyFix'

// if (process.env.NODE_ENV === 'development') {
//   // 将性能监控器挂载到全局，供路由清理使用
//   window.performanceMonitor = performanceMonitor
  
//   performanceMonitor.startMonitoring()
  
//   // 启动自动修复
//   setTimeout(() => {
//     startAutoFix()
//     addKeyboardShortcut() // 添加快捷键 Ctrl+Shift+F
//   }, 5000) // 5秒后开始自动检测
// }
