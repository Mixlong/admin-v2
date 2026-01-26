import SvgIcon from '@/components/SvgIcon'

// 全局注册 svg-icon 组件
export default function installIcons(app) {
  app.component('svg-icon', SvgIcon)
}

// 自动导入所有 svg 图标
const req = import.meta.glob('./svg/*.svg', { eager: true })
