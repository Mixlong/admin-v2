/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-07-20 10:03:53
 * @FilePath: \FILECONF-UI\src\utils\mainOperation\mainDirective.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'

import Print from 'vue-print-nb'
import commonDiective from '@/directive/commonDirective'
import permission from '@/directive/permission'
import minMaxValue from '@/directive/input'
import VueClipboard from 'vue-clipboard2'
import vuescroll from 'vue-scroll'
import commonSelect from '@/directive/commonDirective/select'
import '@/directive/debounce'
import Element from 'element-ui';

// 测试

import ellipsisPlugings from "@/directive/commonDirective/myDirectives";

Vue.use(ellipsisPlugings)

Vue.use(Print)
Vue.use(commonDiective)
Vue.use(permission)
Vue.use(minMaxValue)
Vue.use(VueClipboard)
Vue.use(vuescroll)
Vue.use(commonSelect)
Vue.use(Element)