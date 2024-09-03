import { NoData } from './noDataDisplay';
import PreInput from './perInput';
import debounce from './debounce';

const install = Vue => {
  Vue.directive('NoData', NoData);
  Vue.directive('PreInput', PreInput);
  Vue.directive('debounce', debounce);
}

if (window.Vue) {
  window['NoData'] = NoData;
  window['debounce'] = debounce;
  Vue.use(install)
}

export default install