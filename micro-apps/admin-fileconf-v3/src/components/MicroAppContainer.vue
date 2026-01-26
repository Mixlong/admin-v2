<template>
  <div class="micro-app-container">
    <!-- Wujie 微应用容器 -->
    <WujieVue
      v-if="microAppConfig.url && !reloading"
      :key="microAppKey"
      :name="microAppName"
      :url="microAppUrl"
      :sync="false"
      :alive="true"
      :fiber="false"
      :degrade="false"
      :plugins="wujiePlugins"
      :props="microAppProps"
      width="100%"
      height="100%"
      class="wujie-container"
      @beforeLoad="handleBeforeLoad"
      @beforeMount="handleBeforeMount"
      @afterMount="handleAfterMount"
      @beforeUnmount="handleBeforeUnmount"
      @afterUnmount="handleAfterUnmount"
    />

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32">
        <Loading />
      </el-icon>
      <span class="loading-text">正在加载...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-icon :size="48" color="#F56C6C">
        <CircleClose />
      </el-icon>
      <p class="error-text">页面加载失败</p>
      <el-button type="primary" @click="reloadMicroApp">重新加载</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { Loading, CircleClose } from '@element-plus/icons-vue'
import WujieVue from 'wujie-vue3'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const microAppConfig = ref({})
const loading = ref(true)
const reloading = ref(false)
const isNavigatingFromV2 = ref(false)

const microAppName = computed(() => 'admin-v2')

const microAppUrl = computed(() => {
  if (!microAppConfig.value.url) return ''

  const baseUrl = microAppConfig.value.url
  let subPath = route.meta?.microAppPath || microAppConfig.value.props?.subPath || route.path

  if (!subPath.startsWith('/')) {
    subPath = '/' + subPath
  }

  let fullUrl = `${baseUrl}#${subPath}`

  const query = route.query
  if (query && Object.keys(query).length > 0) {
    const queryString = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    fullUrl += `?${queryString}`
  }

  return fullUrl
})

const microAppKey = computed(() => {
  const path = route.path
  const queryStr = JSON.stringify(route.query)
  return `v2-${path}-${queryStr}`
})

const microAppProps = computed(() => {
  return {
    userInfo: {
      id: userStore.id,
      name: userStore.name,
      nickName: userStore.nickName,
      avatar: userStore.avatar,
      roles: userStore.roles,
      permissions: userStore.permissions
    },
    token: userStore.token || '',
    permissions: userStore.permissions || [],
    roles: userStore.roles || [],
    currentRoute: {
      path: route.path,
      query: route.query,
      params: route.params,
      fullPath: route.fullPath
    },
    jump: (path, query, params) => {
      if (typeof path === 'object') {
        router.push(path)
      } else {
        router.push({ path, query, params })
      }
    }
  }
})

const buildCssIgnores = () => {
  return [
    /at\.alicdn\.com/ // iconfont CDN (avoid CORS fetch errors)
  ]
}

const wujiePlugins = computed(() => {
  return [
    {
      cssIgnores: buildCssIgnores()
    }
  ]
})

function initMicroApp() {
  console.log('🔧 [MicroAppContainer] initMicroApp 开始')
  console.log('🔧 [MicroAppContainer] route.meta:', route.meta)
  console.log('🔧 [MicroAppContainer] route.meta.microApp:', route.meta?.microApp)
  
  if (route.meta && route.meta.microApp) {
    microAppConfig.value = route.meta.microApp
    console.log('🔧 [MicroAppContainer] 使用路由 meta 配置:', microAppConfig.value)
  } else {
    const v2Url = import.meta.env.VITE_V2_URL || 'http://192.168.2.8:2025'
    microAppConfig.value = {
      name: 'admin-v2',
      url: v2Url,
      props: {
        subPath: route.meta?.microAppPath || route.path
      }
    }
    console.log('🔧 [MicroAppContainer] 使用默认配置:', microAppConfig.value)
  }

  loading.value = false
  console.log('🔧 [MicroAppContainer] initMicroApp 完成, loading:', loading.value)
}

function handleBeforeLoad() {
  loading.value = true
}

function handleBeforeMount() {}

function handleAfterMount() {
  loading.value = false
  syncDataToMicroApp()
}

function handleBeforeUnmount() {}

function handleAfterUnmount() {}

function syncDataToMicroApp() {
  const data = {
    user: {
      token: userStore.token,
      id: userStore.id,
      name: userStore.name,
      nickName: userStore.nickName,
      avatar: userStore.avatar,
      roles: userStore.roles,
      permissions: userStore.permissions
    },
    route: {
      path: route.path,
      query: route.query,
      params: route.params
    },
    timestamp: Date.now()
  }

  if (window.$wujie && window.$wujie.bus) {
    window.$wujie.bus.$emit('main-store-sync', data)
  }
}

async function reloadMicroApp() {
  reloading.value = true
  await nextTick()
  initMicroApp()
  setTimeout(() => {
    reloading.value = false
  }, 100)
}

watch(
  () => route.fullPath,
  () => {
    if (isNavigatingFromV2.value) {
      isNavigatingFromV2.value = false
      return
    }

    if (route.meta?.microApp) {
      microAppConfig.value = route.meta.microApp
    } else {
      initMicroApp()
    }

    setTimeout(() => {
      if (!window.$wujie?.bus) return

      const targetPath = route.meta?.microAppPath || route.path
      const navData = {
        name: route.name,
        path: targetPath,
        query: route.query,
        params: route.params,
        fullPath: route.fullPath
      }

      try {
        window.$wujie.bus.$emit('navigate-to', navData)
      } catch (e) {
        // ignore navigation errors
      }
    }, 100)
  },
  { immediate: true }
)

watch(
  () => userStore.token,
  () => {
    if (microAppConfig.value.url && !loading.value) {
      syncDataToMicroApp()
    }
  }
)

onMounted(() => {
  console.log('🎯 [MicroAppContainer] 组件已挂载')
  console.log('🎯 [MicroAppContainer] 当前路由:', route.path)
  console.log('🎯 [MicroAppContainer] 路由 meta:', route.meta)
  initMicroApp()
  console.log('🎯 [MicroAppContainer] 微应用配置:', microAppConfig.value)
  console.log('🎯 [MicroAppContainer] 微应用 URL:', microAppUrl.value)

  if (window.$wujie && window.$wujie.bus) {
    window.$wujie.bus.$on('sub-app-jump', data => {
      if (typeof data === 'string') {
        router.push(data)
      } else if (data.path) {
        router.push({ path: data.path, query: data.query, params: data.params })
      }
    })

    window.$wujie.bus.$on('sub-app-route-change', data => {
      const currentPath = route.path
      const v2Path = data.path

      if (currentPath !== v2Path) {
        isNavigatingFromV2.value = true
        router.push({ path: v2Path, query: data.query || {}, params: data.params || {} })
          .catch(err => {
            if (err.name !== 'NavigationDuplicated') {
              // ignore
            }
            isNavigatingFromV2.value = false
          })
      }
    })
  }
})

onUnmounted(() => {
  if (window.$wujie && window.$wujie.bus) {
    window.$wujie.bus.$off('sub-app-jump')
    window.$wujie.bus.$off('sub-app-route-change')
  }
})
</script>

<style lang="scss" scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #606266;

    .loading-text,
    .error-text {
      margin-top: 16px;
      font-size: 14px;
    }
  }

  .error-container {
    .error-text {
      margin-bottom: 16px;
      color: #f56c6c;
    }
  }
}

.wujie-container {
  width: 100%;
  height: 100%;
}
</style>
