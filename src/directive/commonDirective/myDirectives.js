/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-07-20 09:50:38
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-07-21 11:35:10
 * @FilePath: \FILECONF-UI\src\directive\commonDirective\myDirectives.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const renderHTMLDirective = (el, binding) => {
    if(binding.value !== "") {
        el.innerHTML = binding.value;
    } else {
        el.innerHTML = "---"
    }
}

const createRenderHTMLDirective = () => {
    return {
        inserted: renderHTMLDirective,
        update: renderHTMLDirective
    }
}

const install = (Vue) => {
    Vue.globalFn = (count) => count;
    Vue.$globalProperty = "我是全局属性";
    Vue.prototype.$myGlobalProperty = "我是实例属性"
    Vue.prototype.$myTip = (tipValue) => tipValue
    Vue.directive('ellipsis', createRenderHTMLDirective())
    Vue.filter("capitalize", (value, ...args) => {
        console.log(args)
        if(value === "") return;
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    })
}

export default install