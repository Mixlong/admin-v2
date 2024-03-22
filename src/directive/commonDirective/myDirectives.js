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