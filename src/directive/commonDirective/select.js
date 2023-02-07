import Vue from "vue"

const loadMore = Vue.directive('loadMore', {
    bind(el, binding) {
        let select_dom = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        select_dom.addEventListener('scroll', function () {
            let height = this.scrollHeight - this.scrollTop <= this.clientHeight;
            if (height) {
                binding.value()
            }
        })
    }
})

const install = function (Vue) {
    Vue.directive('loadMore', loadMore)
}

if (window.Vue) {
    window['loadMore'] = loadMore
    Vue.use(install); // eslint-disable-line
}

export default install
