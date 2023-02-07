/*
 * @Author: your name
 * @Date: 2021-04-23 17:07:10
 * @LastEditTime: 2021-05-07 09:31:48
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/directive/input.js
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
