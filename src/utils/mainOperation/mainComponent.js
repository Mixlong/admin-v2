import Vue from 'vue'

import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DrUpload from '@/components/Upload'
import Tooltip from '@/components/Tooltip'
import ModalStyle from '@/components/ModalStyle'
import PreviewImg from '@/components/PreviewImg'
import SelectLoadMore from '@/components/selectLoadMore'

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('DrUpload', DrUpload)
Vue.component('Tooltip', Tooltip)
Vue.component('ModalStyle', ModalStyle)
Vue.component('preview-img', PreviewImg)
Vue.component('select-loadMore', SelectLoadMore)
