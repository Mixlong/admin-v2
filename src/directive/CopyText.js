import Vue from "vue";
import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

const CopyText = Vue.directive("CopyText", {
  bind: (el, binding) => {
    const { value, modifiers } = binding;
    if(value !== "" && modifiers.copy) {
        // console.log(this)
        // this.$copyText(value).then(() => {
            Vue.msgSuccess("复制成功")
        // })
    }
  },
});

const install = (Vue) => {
  Vue.directive("CopyText", CopyText);
};

if (window.Vue) {
  window["CopyText"] = CopyText;
  Vue.use(install);
}

export default install;
