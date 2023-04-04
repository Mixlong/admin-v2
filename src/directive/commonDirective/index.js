import { NoData } from './noDataDisplay';
import PreInput from './perInput';

const install = Vue => {
  Vue.prototype.$MyData = function (val) {
    return val + '1233'
  };
  Vue.directive('NoData', NoData);
  Vue.directive('PreInput', PreInput);
}

if (window.Vue) {
  window['NoData'] = NoData;
  Vue.use(install)
}

export default install