import Vue from "vue";

import Print from "vue-print-nb";
import commonDiective from "@/directive/commonDirective";
import permission from "@/directive/permission";
import minMaxValue from "@/directive/input";
import VueClipboard from "vue-clipboard2";
import vuescroll from "vue-scroll";
import commonSelect from "@/directive/commonDirective/select";
import Element from "element-ui";
import VueViewer from "v-viewer";
// 头部标签组件
import VueMeta from 'vue-meta'
// 测试
import ellipsisPlugings from "@/directive/commonDirective/myDirectives";
import VueSeamlessScroll from 'vue-seamless-scroll';

// 确定 Element UI 尺寸配置 - 全局固定为 mini（不依赖 Cookie）
const elementSize = 'mini';
console.log('🎨 Element UI 尺寸配置:', { elementSize });

// 先设置 $ELEMENT 原型（某些组件可能直接读取）
Vue.prototype.$ELEMENT = { size: elementSize, zIndex: 3000 };

Vue.use(ellipsisPlugings);
Vue.use(Print);
Vue.use(commonDiective);
Vue.use(permission);
Vue.use(minMaxValue);
Vue.use(VueClipboard);
Vue.use(vuescroll);
Vue.use(commonSelect);
// Element UI 配置 - 使用 mini 尺寸
Vue.use(Element, {
  size: elementSize,
  zIndex: 3000
});
console.log('✅ Element UI 已注册，size:', elementSize);
Vue.use(VueMeta);
Vue.use(VueViewer, {
  defaultOptions: {
    zIndex: 9999
  },
});
Vue.use(VueSeamlessScroll);
