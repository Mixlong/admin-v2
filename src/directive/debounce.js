import Vue from 'vue'
Vue.directive('throttle', {
    bind: (el, binding) => {
        console.log(binding.value)
        let throttleTime = binding.value
        if(!throttleTime) {
            throttleTime = 2000
        }
        let cbFun = null
        el.addEventListener('click', event => {
            if(!cbFun) {
                cbFun = setTimeout(() => {
                    cbFun = null
                }, throttleTime);
            } else {
                event && event.stopImmediatePropagation()
            }
        }, true)
    }
})