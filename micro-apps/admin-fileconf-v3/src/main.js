import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { getConfigKey } from "@/api/system/config"
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'
import { initMainAppSync } from '@/utils/mainAppSync'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'

let app = null

function render(props = {}) {
  const { container } = props
  
  console.log('🔍 RuoYi-Vue3微应用接收到的props:', props)
  
  // 打印token信息
  if (props && props.token) {
    console.log('🔑 RuoYi-Vue3收到token:', props.token)
  }
  
  // 打印subPath信息
  if (props && props.subPath) {
    console.log('🛣️  RuoYi-Vue3收到subPath:', props.subPath)
  }
  
  app = createApp(App)

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

  app.use(router)
  app.use(store)
  app.use(plugins)
  app.use(elementIcons)
  app.component('svg-icon', SvgIcon)

  directive(app)

  // 使用element-plus 并且设置全局的大小
  app.use(ElementPlus, {
    locale: locale,
    // 支持 large、default、small
    size: Cookies.get('size') || 'default'
  })

  const mountElement = container ? container.querySelector('#app') : '#app'
  app.mount(mountElement)
  
  // 判断是否在无界环境内
  const isInWujie = window.__POWERED_BY_WUJIE__
  console.log('🔍 是否在无界环境:', isInWujie)
  
  if (isInWujie) {
    // 在无界环境内 - 微前端模式
    console.log('🔗 初始化主应用数据同步')
    initMainAppSync()
    
    // 优先从props获取subPath，其次从URL参数获取
    let subPath = props?.subPath
    if (!subPath) {
      const urlParams = new URLSearchParams(window.location.search)
      subPath = urlParams.get('subPath')
    }
    
    console.log('🛣️  获取到的subPath:', subPath, '来源:', props?.subPath ? 'props' : 'URL参数')
    
    if (subPath && subPath !== 'index') {
      // 如果有特定的子路径，导航到对应路由
      const targetPath = `/${subPath}`
      console.log('🧭 RuoYi-Vue3导航到:', targetPath)
      
      setTimeout(() => {
        router.push(targetPath).catch(err => {
          console.warn('路由导航失败:', err)
        })
      }, 100)
    } else {
      console.log('📍 无特定子路径，保持当前路由')
    }
  } else {
    // 独立运行模式 - 按照正常路由规则
    console.log('🏠 独立运行模式，使用默认路由')
    // 可以设置默认路由，比如首页
    // router.push('/').catch(err => console.warn('默认路由跳转失败:', err))
  }
}

// 独立运行
if (!window.__POWERED_BY_WUJIE__) {
  render()
}

// 微前端环境下的生命周期
window.__WUJIE_MOUNT = render
window.__WUJIE_UNMOUNT = () => {
  app?.unmount()
  app = null
}
