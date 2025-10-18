import variables from "@/assets/styles/element-variables.scss";
import defaultSettings from "@/settings";

const { showSettings, tagsView, fixedHeader, sidebarLogo, dynamicTitle } =
  defaultSettings;

const storageSetting = JSON.parse(localStorage.getItem("layout-setting")) || "";

const state = {
  title: "",
  theme: storageSetting.theme || "#409EFF",
  showSettings,
  tagsView:
    storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  fixedHeader:
    storageSetting.fixedHeader === undefined
      ? fixedHeader
      : storageSetting.fixedHeader,
  sidebarLogo:
    storageSetting.sidebarLogo === undefined
      ? sidebarLogo
      : storageSetting.sidebarLogo,
  dynamicTitle:
    storageSetting.dynamicTitle === undefined
      ? dynamicTitle
      : storageSetting.dynamicTitle,
};

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    Object.hasOwn(state, key) && (state[key] = value);
  },
};

const actions = {
  changeSetting({ commit }, data) {
    commit("CHANGE_SETTING", data);
  },
  // 设置网页标题
  setTitle({ commit, state }, title) {
    state.title = title;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
