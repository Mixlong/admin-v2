import Vue from 'vue';

import Cookies from 'js-cookie';
import App from './App';
import store from '@/store';
import router from '@/router';
import plugins from './plugins' // plugins

// import './assets/styles/element-variables.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/styles/index.scss'; // global css
import '@/assets/styles/ruoyi.scss'; // ruoyi css
import 'normalize.css/normalize.css'; // a modern alternative to CSS resets
import "viewerjs/dist/viewer.css";

import '@/assets/icons'; // icon
import '@/permission'; // permission control

import '@/utils/sticky';
import '@/utils/mainOperation/mainDirective'
import '@/utils/mainOperation/mainComponent'
import '@/utils/mainOperation/mainFn'
// import VueNativeSock from 'vue-native-websocket';

Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'success' });
};

Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'error' });
};

Vue.prototype.msgInfo = function (msg) {
  this.$message.info(msg);
};

Vue.prototype.$ELEMENT = { size: Cookies.get('size') || 'mini', zIndex: 6666 };
Vue.config.productionTip = false;

Vue.use(plugins)

// Vue.use(VueNativeSock, WS, {
//   // 启用Vuex集成,store的值为你的vuex
//   store: store,
//   // 数据发送/接收使用使用json格式
//   format: 'json',
//   // 开启自动重连
//   reconnection: true,
//   // 尝试重连的次数
//   reconnectionAttempts: 5,
//   // 重连间隔时间
//   reconnectionDelay: 3000,
//   // 将数据进行序列化，由于启用了json格式的数据传输这里需要进行重写
//   passToStoreHandler: function (eventName, event) {
//     if (!eventName.startsWith('SOCKET_')) {
//       return;
//     }
//
//     let method = 'commit';
//     let target = eventName.toUpperCase();
//     let msg = event;
//     if (this.format === 'json' && event.data) {
//       msg = JSON.parse(event.data);
//       /* if (msg.mutation) {
//         target = [msg.namespace || '', msg.mutation].filter((e) => !!e).join('/');
//       } else if (msg.action) {
//         method = 'dispatch';
//         target = [msg.namespace || '', msg.action].filter((e) => !!e).join('/');
//       }*/
//     }
//     this.store[method](target, msg);
//     this.store.state.socket.message = msg;
//   },
// });

new Vue({
  el: "#app",
  router,
  store,
  created() {
    window.Vue = Vue
  },
  render: h => h(App)
})
