import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import user from './modules/user';
import tagsView from './modules/tagsView';
import permission from './modules/permission';
import settings from './modules/settings';
import socket from './modules/socket';
import commonData from './modules/commonData';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings,
    socket,
    commonData
  },
  getters,
});

export default store;
