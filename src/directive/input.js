/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:03
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-02-27 09:48:36
 * @FilePath: \FILECONF-UI\src\directive\input.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from "vue"

const minMaxValue = Vue.directive('minMaxValue', {
    inserted(el, params) {
        el.querySelector("input").addEventListener("focusout", (event) => {
            let nature = params.value
            let value = event.target.value

            if (value != '' && value != undefined) {
                if (nature.min != undefined) {
                    value = value < nature.min ? nature.min : value
                }
                if (nature.max != undefined) {
                    value = value > nature.max ? nature.max : value
                }
                event.target.value = value
                el.querySelector("input").dispatchEvent(new Event("input"))
            }
        })
    }
})


const install = function (Vue) {
    Vue.directive('minMaxValue', minMaxValue)
}

if (window.Vue) {
    window['minMaxValue'] = minMaxValue
    Vue.use(install); // eslint-disable-line
}

export default install
