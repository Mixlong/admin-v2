import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

// vxe-table（表格）
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

// FormCreate 表单生成器
import formCreate from '@form-create/element-ui'
import FormGroupTitle from '@/components/FormCreate/FormGroupTitle.vue'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// 微前端 Wujie
import WujieVue from 'wujie-vue3'
import { setupApp, preloadApp, bus } from 'wujie'
import useUserStore from '@/store/modules/user'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { getConfigKey } from '@/api/system/config'
import {
  parseTime,
  resetForm,
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels
} from '@/utils/ruoyi'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from '@/components/Editor'
// 文件上传组件
import FileUpload from '@/components/FileUpload'
// 图片上传组件
import ImageUpload from '@/components/ImageUpload'
// 图片预览组件
import ImagePreview from '@/components/ImagePreview'
// 字典标签组件
import DictTag from '@/components/DictTag'
// 智能搜索表单组件
import SearchBar from '@/components/SearchBar'
// 页面容器组件
import PageContainer from '@/components/PageContainer'
// 表格操作组件
import TableActions from '@/components/TableActions'
// 远程选择器组件（品类、型号、用户、客户）
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import CategoryModelSelect from '@/components/RemoteSelect/CategoryModelSelect.vue'
// 详情展示组件
import DetailView from '@/components/DetailView/index.vue'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.getConfigKey = getConfigKey
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('SearchBar', SearchBar)
app.component('PageContainer', PageContainer)
app.component('TableActions', TableActions)
app.component('RemoteSelect', RemoteSelect)
app.component('CategoryModelSelect', CategoryModelSelect)
app.component('DetailView', DetailView)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('SvgIcon', SvgIcon)

// 注册 FormCreate（带全局配置）
app.use(formCreate, {
  // 全局表单配置
  form: {
    labelWidth: '100px',
    size: 'small'  // 全局设置表单组件大小
  },
  row: {
    gutter: 20
  },
  submitBtn: false,
  resetBtn: false
})

// 注册自定义组件
formCreate.component('FormGroupTitle', FormGroupTitle)
formCreate.component('Editor', Editor)
formCreate.component('RemoteSelect', RemoteSelect)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'small'
})

// 注册 vxe-table + vxe-pc-ui
app.use(VxeUI)
app.use(VXETable)

// 注册 Wujie 微前端
app.use(WujieVue)

// 配置微前端全局设置
import { MICRO_APP_CONFIG } from '@/config/microApps'

const buildCssIgnores = () => {
  return [
    /at\.alicdn\.com/ // iconfont CDN (avoid CORS fetch errors)
  ]
}

// 为每个启用的微应用配置生命周期
Object.entries(MICRO_APP_CONFIG).forEach(([appName, config]) => {
  if (config.enabled) {
    setupApp({
      name: appName,
      url: config.url,
      alive: config.alive,
      exec: true,
      // 关闭 iframe 降级模式，允许子应用遮罩覆盖全屏
      degrade: false,
      // 关闭路由同步
      sync: false,
      plugins: [
        {
          // 仅忽略易触发 CORS 的 iconfont 样式
          cssIgnores: buildCssIgnores(config.url)
        }
      ],
      fetch: (url, options) => {
        // 自定义 fetch，添加认证信息
        const userStore = useUserStore()
        const token = userStore.token
        if (token) {
          options = options || {}
          options.headers = options.headers || {}
          options.headers['Authorization'] = 'Bearer ' + token
        }
        return window.fetch(url, options)
      },
      props: {
        // 动态获取用户信息
        get token() {
          const userStore = useUserStore()
          return userStore.token
        },
        get userInfo() {
          const userStore = useUserStore()
          return {
            id: userStore.id,
            name: userStore.name,
            nickName: userStore.nickName,
            avatar: userStore.avatar,
            roles: userStore.roles,
            permissions: userStore.permissions
          }
        },
        jump: path => {
          console.log('🔗 子应用请求跳转:', path)
          router.push(path)
        }
      }
    })

    console.log(`✅ 微应用 ${appName} 配置完成 (degrade: true)`)
  }
})

// 挂载全局 Wujie 工具
window.$wujie = {
  setupApp,
  preloadApp,
  bus
}

// 监听子应用(V2)的登录过期事件
bus.$on('session-expired', (data) => {
  console.log('🔐 V3 收到登录过期通知:', data)
  const userStore = useUserStore()
  userStore.logOut().then(() => {
    router.push('/login')
  })
})

app.mount('#app')
