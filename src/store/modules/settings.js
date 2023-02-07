// import variables from '@/assets/styles/element-variables.scss'
import defaultSettings from '@/settings'

const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

const state = {
  // theme: variables.theme,
  showSettings: showSettings,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  customImage: localStorage.getItem("themeImageFile") ? localStorage.getItem("themeImageFile") : '0',
  themeImageCount: 18,
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
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

