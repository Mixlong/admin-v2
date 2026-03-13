<template>
  <div class="micro-app-container">
    <!-- 无界微应用容器 -->
    <WujieVue v-if="microAppConfig.url && !reloading" :key="microAppKey" :name="microAppConfig.name" :url="microAppUrl"
      :sync="true" :alive="true" :props="microAppProps" :style="{ width: '100%', height: '100%' }" :plugins="wujiePlugins" @beforeLoad="handleBeforeLoad" @beforeMount="handleBeforeMount"
      @afterMount="handleAfterMount" @beforeUnmount="handleBeforeUnmount" @afterUnmount="handleAfterUnmount"
      @activated="handleActivated" @deactivated="handleDeactivated" class="wujie-container" />

    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <i class="el-icon-loading loading-spinner"></i>
      <span class="loading-text">正在加载微应用...</span>
    </div>
  </div>
</template>

<script>
import { createVxeStyleBridgePlugin, syncVxeStylesFromIframe } from '@/plugins/wujieStyleBridge'

export default {
  name: 'MicroAppContainer',
  data() {
    return {
      microAppConfig: {},
      loading: true,
      reloading: false,
      currentSubPath: '',
      storeUnwatch: null,  // 存储取消监听函数
      syncTimer: null,     // 防抖计时器
      // 无界插件配置（默认开启 vxe-table 样式桥接，需接受样式污染风险）
      wujiePlugins: [createVxeStyleBridgePlugin()]
    }
  },
  computed: {
    // 传递给微应用的属性
    microAppProps() {
      const subPath = this.microAppConfig.props?.subPath
      console.log('传递给微应用的subPath:', subPath)

      return {
        userInfo: this.$store.state.user || {},
        token: this.$store.getters.token || '',
        permissions: this.$store.state.user?.permissions || [],
        roles: this.$store.state.user?.roles || [],
        // 当前路由信息
        currentRoute: {
          path: this.$route.path,
          query: this.$route.query,
          params: this.$route.params
        },
        // 子路径信息
        subPath: subPath,
        // 自定义配置
        ...this.microAppConfig.props
      }
    },

    // 计算微应用完整URL
    microAppUrl() {
      if (!this.microAppConfig.url) return ''

      const baseUrl = this.microAppConfig.url
      const subPath = this.microAppConfig.props?.subPath
      const cacheToken = this.microAppConfig.props?.timestamp || ''

      // 通过URL参数传递路由信息
      if (subPath) {
        const fullUrl = cacheToken
          ? `${baseUrl}?subPath=${subPath}&t=${cacheToken}`
          : `${baseUrl}?subPath=${subPath}`
        console.log('微应用URL构建:', { baseUrl, subPath, fullUrl })
        return fullUrl
      }

      console.log('微应用URL构建(无子路径):', baseUrl)
      return baseUrl
    },

    // 为每个不同的subPath生成唯一的key，确保组件重新渲染
    microAppKey() {
      const subPath = this.microAppConfig.props?.subPath || 'default'
      const cacheToken = this.microAppConfig.props?.timestamp || 'stable'
      return `${this.microAppConfig.name}-${subPath}-${cacheToken}`
    }
  },
  created() {
    this.initMicroApp()
    this.setupStoreWatcher()
  },
  beforeDestroy() {
    // 清理store监听器
    if (this.storeUnwatch) {
      this.storeUnwatch()
      this.storeUnwatch = null
    }

    // 清理防抖计时器
    if (this.syncTimer) {
      clearTimeout(this.syncTimer)
      this.syncTimer = null
    }
  },
  watch: {
    '$route'() {
      // 路由变化时检查是否需要重新初始化
      this.handleRouteChange()
    }
  },
  methods: {
    // 初始化微应用配置
    initMicroApp() {
      const route = this.$route

      console.log('初始化微应用:', route.meta)

      // 从路由meta中获取微应用配置
      if (route.meta && route.meta.microApp) {
        // route.meta.microApp 已经是解析后的配置对象，直接使用
        if (typeof route.meta.microApp === 'object' && route.meta.microApp.name) {
          this.microAppConfig = route.meta.microApp
          this.currentSubPath = this.microAppConfig.props?.subPath || ''
          this.loading = false
          console.log('微应用配置:', this.microAppConfig)
        } else if (typeof route.meta.microApp === 'string') {
          // 如果是字符串，需要解析
          const { parseMicroAppConfig } = require('@/config/microApps')
          this.microAppConfig = parseMicroAppConfig(route.meta.microApp, route.path)

          if (this.microAppConfig) {
            this.currentSubPath = this.microAppConfig.props?.subPath || ''
            this.loading = false
            console.log('🔧 解析后的微应用配置:', this.microAppConfig)
            console.log('🛣️  解析后的subPath:', this.microAppConfig.props?.subPath)
          } else {
            console.error('解析微应用配置失败')
            this.$message.error('微应用配置错误')
          }
        } else {
          console.error('微应用配置格式错误:', route.meta.microApp)
          this.$message.error('微应用配置格式错误')
        }
      } else {
        console.warn('未找到微应用配置，尝试API获取')
        // 兼容旧版本配置方式
        this.getMicroAppConfigFromAPI()
      }
    },

    // 从API获取微应用配置（兼容方案）
    async getMicroAppConfigFromAPI() {
      try {
        // 可以根据路由path或name查询微应用配置
        const path = this.$route.path
        const response = await this.$http.get(`/system/microApp/config`, {
          params: { path }
        })

        if (response.data && response.data.code === 200) {
          this.microAppConfig = response.data.data
        }
      } catch (error) {
        console.error('获取微应用配置失败:', error)
        this.$message.error('微应用加载失败')
      }
    },

    // 微应用生命周期事件
    handleBeforeLoad() {
      this.loading = true
      console.log(`微应用 ${this.microAppConfig.name} 开始加载`)
    },

    handleBeforeMount() {
      console.log(`微应用 ${this.microAppConfig.name} 开始挂载`)
    },

    handleAfterMount() {
      this.loading = false
      console.log(`微应用 ${this.microAppConfig.name} 挂载完成`)

      // 立即同步store数据到微应用
      this.syncStoreToMicroApp()

      // 延迟再次同步，确保数据传递成功
      setTimeout(() => {
        this.syncStoreToMicroApp()
      }, 100)

      // 确保微应用导航到正确的路由
      this.navigateToCorrectRoute()

      // 监听子应用的认证错误事件
      this.setupAuthErrorListener()

      // 通知父应用微应用已加载
      this.$emit('micro-app-mounted', {
        name: this.microAppConfig.name,
        route: this.$route
      })

      // ⏬ 兜底同步 vxe 样式到主应用
      this.syncVxeStylesFromIframe()
    },

    // 同步store数据到微应用
    syncStoreToMicroApp() {
      console.log('同步store数据到微应用')

      // 匹配子应用的store字段结构 (Pinia格式)
      const storeData = {
        user: {
          token: this.$store.getters.token,
          id: this.$store.state.user.userId,        // Vue3子应用使用id
          name: this.$store.state.user.name,        // 用户名 userName
          nickName: this.$store.state.user.nickName,
          avatar: this.$store.state.user.avatar,
          roles: this.$store.state.user.roles,
          permissions: this.$store.state.user.permissions
        },
        timestamp: Date.now()
      }

      console.log('发送store数据到微应用:', storeData)

      // 通过无界的bus发送store数据同步事件
      setTimeout(() => {
        if (window.$wujie && window.$wujie.bus) {
          window.$wujie.bus.$emit('main-store-sync', storeData)
        }
      }, 100)
    },

    // 导航到正确的路由
    navigateToCorrectRoute() {
      const subPath = this.microAppConfig.props?.subPath
      if (subPath) {
        const targetPath = `/ruoyi-test/${subPath}`
        console.log('主应用发送导航指令:', targetPath)

        // 通过无界的bus发送导航事件
        setTimeout(() => {
          if (window.$wujie && window.$wujie.bus) {
            window.$wujie.bus.$emit('navigate-to', targetPath)
          }
        }, 300)
      }
    },

    // 处理路由变化
    handleRouteChange() {
      const newMicroAppConfig = this.$route.meta?.microApp
      const newSubPath = newMicroAppConfig?.props?.subPath

      // 只有当微应用配置发生变化时才重新初始化
      if (!newMicroAppConfig || newMicroAppConfig.name !== this.microAppConfig.name) {
        console.log('微应用配置变化，重新初始化')
        this.initMicroApp()
      } else if (newSubPath !== this.currentSubPath) {
        console.log('SubPath变化，发送路由导航指令:', this.currentSubPath, '->', newSubPath)
        this.currentSubPath = newSubPath
        this.navigateToCorrectRoute()
      }
    },

    // 微应用激活时的处理
    handleActivated() {
      console.log(`微应用 ${this.microAppConfig.name} 被激活`)
      // 激活时重新导航到正确的路由
      this.navigateToCorrectRoute()
      // 再次兜底同步样式
      this.syncVxeStylesFromIframe()
    },

    // 微应用失活时的处理
    handleDeactivated() {
      console.log(`微应用 ${this.microAppConfig.name} 被失活`)
    },

    // 重新加载微应用
    async reloadMicroApp() {
      const newSubPath = this.$route.meta?.microApp?.props?.subPath

      // 如果subPath发生变化，重新加载微应用
      if (newSubPath !== this.currentSubPath) {
        console.log('SubPath变化，重新加载微应用:', this.currentSubPath, '->', newSubPath)

        this.reloading = true
        this.currentSubPath = newSubPath

        // 等待当前微应用卸载
        await this.$nextTick()

        // 重新初始化
        this.initMicroApp()

        // 延迟结束重载状态
        setTimeout(() => {
          this.reloading = false
        }, 100)
      }
    },

    handleBeforeUnmount() {
      console.log(`微应用 ${this.microAppConfig.name} 开始卸载`)
    },

    handleAfterUnmount() {
      console.log(`微应用 ${this.microAppConfig.name} 卸载完成`)
    },

    // 设置store变化监听器
    setupStoreWatcher() {
      console.log('🔍 设置store变化监听器')

      // 使用$store.watch监听用户相关状态变化
      this.storeUnwatch = this.$store.watch(
        // getter函数，返回需要监听的状态
        (state, getters) => ({
          token: getters.token,
          userId: state.user.userId,
          name: state.user.name,
          nickName: state.user.nickName,
          avatar: state.user.avatar,
          roles: state.user.roles,
          permissions: state.user.permissions
        }),
        // 回调函数，当状态变化时执行
        (newVal, oldVal) => {
          console.log('📦 检测到store变化:', {
            new: newVal,
            old: oldVal
          })

          // 防抖处理，避免频繁同步
          if (this.syncTimer) {
            clearTimeout(this.syncTimer)
          }

          this.syncTimer = setTimeout(() => {
            // 只有在微应用已挂载时才同步
            if (this.microAppConfig.name && !this.loading) {
              console.log('🔄 store变化触发自动同步')
              this.$store.dispatch('SyncStoreToMicroApp')
            }
          }, 300) // 300ms防抖
        },
        // 选项：立即执行和深度监听
        {
          immediate: false,  // 不立即执行，避免重复同步
          deep: true         // 深度监听对象变化
        }
      )

      console.log('✅ store监听器设置完成')
    },

    // 设置认证错误监听器
    setupAuthErrorListener() {
      console.log('🔐 设置子应用认证错误监听器')

      if (window.$wujie && window.$wujie.bus) {
        window.$wujie.bus.$on('micro-app-auth-error', (errorData) => {
          console.log('🚨 收到子应用认证错误:', errorData)
          this.handleAuthError(errorData)
        })
      }
    },

    // 处理认证错误
    handleAuthError(errorData) {
      const { code, message } = errorData

      console.log(`🔐 处理认证错误 [${code}]:`, message)

      if (code === 4003) {
        // 特殊错误，只显示通知
        this.$notify.error({
          title: '系统提示',
          message: message
        })
      } else if (code === 401 || code === 3001) {
        // token过期，需要重新登录
        this.$confirm(
          '登录状态已过期，您可以继续留在该页面，或者重新登录',
          '系统提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 执行登出并跳转到登录页
          this.$store.dispatch('LogOut').then(() => {
            this.$router.push('/login').catch(() => {
              // 如果路由跳转失败，直接刷新页面
              location.href = '/index'
            })
          })
        }).catch(() => {
          console.log('用户取消重新登录')
        })
      }
    },

    // 从当前微应用 iframe 同步 vxe 样式到主应用
    syncVxeStylesFromIframe() {
      this.$nextTick(() => {
        const iframe = this.$el?.querySelector?.('iframe')
        if (iframe && iframe.contentWindow) {
          syncVxeStylesFromIframe(iframe.contentWindow)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.micro-app-container {
  width: 100%;
  /* 减去header高度 */
  overflow: hidden;
  position: relative;

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #606266;

    .loading-spinner {
      font-size: 28px;
      animation: rotating 2s linear infinite;
    }

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
    }
  }
}


// 确保微应用完全填充容器
.wujie-container {
  width: 100%;
  height: 100%;
}

:deep(.wujie) {
  width: 100% !important;
  height: 100% !important;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
