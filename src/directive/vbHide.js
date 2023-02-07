/*
 * @Author: your name
 * @Date: 2021-06-01 11:35:05
 * @LastEditTime: 2021-06-01 15:19:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/directive/visibile.js
 */
import Vue from "vue"

const minMaxValue = Vue.directive('vbHide', {
    inserted(el, params) {
         
    }
})

const install = function (Vue) {
    Vue.directive('vbHide', minMaxValue)
}

if (window.Vue) {
    window['vbHide'] = minMaxValue
    Vue.use(install); // eslint-disable-line
}

export default install
