import IntelligentSearchForm from './index.vue'

// 为组件提供 install 方法，用于 Vue.use() 注册
IntelligentSearchForm.install = function (Vue) {
    Vue.component(IntelligentSearchForm.name, IntelligentSearchForm)
}

// 支持直接通过 import 使用
export default IntelligentSearchForm
