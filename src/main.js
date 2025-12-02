import Vue from 'vue';

import Cookies from 'js-cookie';
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
import VersionChecker from '@/utils/versionChecker';
import VersionUpdateDialog from '@/components/VersionUpdateDialog.vue';
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import { syncTokenFromUrl } from '@/utils/auth'

// 处理外部携带 token 的场景，优先写入 Cookie，并标记外部跳转（10分钟有效）
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

Vue.prototype.$ELEMENT = { size: Cookies.get('size') || 'mini', zIndex: 3000 };
Vue.config.productionTip = false;

Vue.use(plugins)
Vue.use(MainComponent)
Vue.use(TypedSelectLoadMore)
Vue.component('IntelligentSearchForm', IntelligentSearchForm) // 全局注册组件
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

// 🆕 初始化版本更新检查
import VersionCheckPlugin from '@/plugins/versionCheck'
Vue.use(VersionCheckPlugin, {
  autoCheck: true,        // 自动检查更新
  interval: 30 * 60 * 1000  // 检查间隔：30分钟
})

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

// Vue.use(VueNativeSock, WS, {
//   // 启用Vuex集成,store的值为你的vuex
//   store: store,
//   // 数据发送/接收使用使用json格式
//   format: 'json',
//   // 开启自动重连
//   reconnection: true,
//   // 尝试重连的次数
//   reconnectionAttempts: 5,
//   // 重连间隔时间
//   reconnectionDelay: 3000,
//   // 将数据进行序列化，由于启用了json格式的数据传输这里需要进行重写
//   passToStoreHandler: function (eventName, event) {
//     if (!eventName.startsWith('SOCKET_')) {
//       return;
//     }
//
//     let method = 'commit';
//     let target = eventName.toUpperCase();
//     let msg = event;
//     if (this.format === 'json' && event.data) {
//       msg = JSON.parse(event.data);
//       /* if (msg.mutation) {
//         target = [msg.namespace || '', msg.mutation].filter((e) => !!e).join('/');
//       } else if (msg.action) {
//         method = 'dispatch';
//         target = [msg.namespace || '', msg.action].filter((e) => !!e).join('/');
//       }*/
//     }
//     this.store[method](target, msg);
//     this.store.state.socket.message = msg;
//   },
// });

new Vue({
  el: "#app",
  router,
  store,
  created() {
    window.Vue = Vue
    
    // 挂载版本检查调试工具到全局（方便开发调试）
    window.$version = {
      // 手动检查更新（弹出通知）
      check: () => this.checkVersionUpdate(true),
      
      // 打开版本历史弹窗（查看所有版本）
      open: () => {
        this.$root.$emit('open-version-history')
      },
      
      // 清除版本历史（用于测试）
      clear: () => {
        VersionChecker.clearVersionHistory()
        sessionStorage.clear()
        this.$message.success('已清除版本历史，刷新页面后会重新检测')
      },
      
      // 切换到远程模式
      useRemote: (url) => {
        VersionChecker.useRemoteExcel(url)
        this.$message.success('已切换到远程模式')
      },
      
      // 切换到本地模式
      useLocal: () => {
        VersionChecker.useLocalExcel()
        this.$message.success('已切换到本地模式')
      },
      
      // 查看当前配置
      info: () => {
        console.log('📋 当前配置:')
        console.log('- Excel URL:', VersionChecker.getExcelFileUrl())
        console.log('- 本地存储:', localStorage.getItem('app_latest_version'))
      }
    }
    
    // 页面加载后自动检查版本更新已由 VersionCheckPlugin 插件自动处理
    // 无需在这里重复调用，避免弹窗出现2次
    
    // 监听全局版本历史打开事件
    this.$root.$on('open-version-history', () => {
      console.log('📚 打开版本历史弹窗')
    })
    
    // 设置路由清理监听 - 已禁用，避免干扰表单输入
    // if (process.env.NODE_ENV === 'development') {
    //   let lastCleanupTime = 0
      
    //   this.$router.afterEach((to, from) => {
    //     const now = Date.now()
        
    //     // 只有距离上次清理超过2分钟才执行清理
    //     if (now - lastCleanupTime > 120000) {
    //       console.log('🔄 路由变化，执行智能清理:', from.path, '->', to.path)
    //       setTimeout(() => {
    //         if (window.performanceMonitor) {
    //           window.performanceMonitor.performCleanup()
    //           lastCleanupTime = now
    //         }
    //       }, 2000) // 延长等待时间，让页面先稳定
    //     } else {
    //       console.log('🔄 路由变化，跳过清理 (距离上次清理不足2分钟):', from.path, '->', to.path)
    //     }
    //   })
    // }
  },
  methods: {
    /**
     * 检查版本更新
     * @param {Boolean} force - 是否强制检查（忽略时间间隔）
     */
    async checkVersionUpdate(force = false) {
      try {
        console.log('🔍 开始检查版本更新...')
        const newVersion = await VersionChecker.checkUpdate(force)
        
        if (newVersion) {
          console.log('🎊 发现新版本:', newVersion.version)
          this.showVersionDialog(newVersion)
        } else {
          console.log('✅ 当前已是最新版本')
          if (force) {
            this.$message.info('当前已是最新版本')
          }
        }
      } catch (error) {
        console.error('❌ 版本检查失败:', error)
        if (force) {
          this.$message.error('版本检查失败，请稍后重试')
        }
      }
    },
    
    /**
     * 显示版本更新弹窗
     */
    showVersionDialog(versionInfo) {
      // 检查本次登录是否已提示过
      const sessionKey = `version_shown_${versionInfo.version}`
      if (sessionStorage.getItem(sessionKey)) {
        console.log('⏭️ 本次登录已提示过此版本，跳过显示')
        return
      }
      
      // 创建弹窗实例
      const DialogConstructor = Vue.extend(VersionUpdateDialog)
      const instance = new DialogConstructor({
        propsData: {
          visible: true,
          versionInfo: versionInfo
        }
      })
      
      instance.$mount()
      document.body.appendChild(instance.$el)
      
      // 监听确认事件
      instance.$on('confirm', (data) => {
        console.log('✅ 用户已查看版本:', data.versionInfo.version)
        
        // 标记版本为已查看
        VersionChecker.markVersionViewed(data.versionInfo)
        
        // 如果勾选了"本次登录不再提示"
        if (data.dontShowAgain) {
          sessionStorage.setItem(sessionKey, 'true')
          console.log('📝 已设置本次登录不再提示')
        }
        
        // 销毁实例
        this.destroyDialogInstance(instance)
      })
      
      // 监听关闭事件
      instance.$on('close', (data) => {
        console.log('⏭️ 用户关闭了弹窗')
        
        // 如果勾选了"本次登录不再提示"
        if (data.dontShowAgain) {
          sessionStorage.setItem(sessionKey, 'true')
          console.log('📝 已设置本次登录不再提示')
        }
        
        // 销毁实例
        this.destroyDialogInstance(instance)
      })
    },
    
    /**
     * 销毁弹窗实例
     */
    destroyDialogInstance(instance) {
      setTimeout(() => {
        instance.$destroy()
        if (instance.$el && instance.$el.parentNode) {
          document.body.removeChild(instance.$el)
        }
      }, 300)
    }
  },
  render: h => h(App)
})
