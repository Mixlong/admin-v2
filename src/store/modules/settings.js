/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-10-24 18:10:06
 * @FilePath: \FILECONF-UI\src\store\modules\settings.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import variables from '@/assets/styles/element-variables.scss'
import defaultSettings from '@/settings'

const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

const state = {
  theme: variables.theme,
  showSettings,
  tagsView,
  fixedHeader,
  sidebarLogo,
  customImage: localStorage.getItem("themeImageFile") ? localStorage.getItem("themeImageFile") : '0',
  themeImageCount: 18,
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    Object.hasOwn(state, key) && (state[key] = value);
  },
  CHANGE_CUSTOMIMAGE: (state, data) => {
    state.customImage = data
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  changeThemeImage({ commit }, data) {
    localStorage.setItem("themeImageFile", data);
    commit('CHANGE_CUSTOMIMAGE', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

