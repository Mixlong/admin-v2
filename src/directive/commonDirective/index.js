import Vue from 'vue'
import noDataDisplay from "./noDataDisplay";

const install = Vue => {
  Vue.directive('noData', noDataDisplay)
}

Vue.use(install)

export default install
