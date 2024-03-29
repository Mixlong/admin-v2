
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
