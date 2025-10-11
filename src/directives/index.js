/**
 * Vue 指令统一管理
 */

import FormScrollError from './form-scroll-error';
import InputFix from './input-fix';

// 所有指令
const directives = {
  'form-scroll-error': FormScrollError,
  'input-fix': InputFix
};

/**
 * 安装所有指令
 * @param {Vue} Vue - Vue 构造函数
 */
const install = function(Vue) {
  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key]);
  });
};

// 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...directives
};