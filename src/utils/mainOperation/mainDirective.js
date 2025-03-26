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
// 引入组件库
import VueEasytable from "vue-easytable";
// 测试
import ellipsisPlugings from "@/directive/commonDirective/myDirectives";
import dataV from '@jiaminghi/data-view'
import VueSeamlessScroll from 'vue-seamless-scroll';

Vue.use(ellipsisPlugings);
Vue.use(Print);
Vue.use(commonDiective);
Vue.use(permission);
Vue.use(minMaxValue);
Vue.use(VueClipboard);
Vue.use(vuescroll);
Vue.use(commonSelect);
Vue.use(Element);
Vue.use(VueMeta);
Vue.use(VueEasytable);
Vue.use(VueViewer, {
  defaultOptions: {
    zIndex: 9999
  },
});
Vue.use(dataV);
Vue.use(VueSeamlessScroll);