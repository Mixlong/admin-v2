
import Cookies from 'js-cookie'

const EXTERNAL_FLAG_KEY = 'isFromExternal'
const EXTERNAL_EXPIRE_KEY = 'isFromExternal_expire'
const DEFAULT_EXTERNAL_DURATION = 10 * 60 * 1000 // 10分钟

const readExternalFlag = () => {
  try {
    const expireAt = Number(sessionStorage.getItem(EXTERNAL_EXPIRE_KEY) || 0)
    if (expireAt && Date.now() > expireAt) {
      sessionStorage.removeItem(EXTERNAL_FLAG_KEY)
      sessionStorage.removeItem(EXTERNAL_EXPIRE_KEY)
      return false
    }
    return sessionStorage.getItem(EXTERNAL_FLAG_KEY) === 'true'
  } catch (e) {
    console.warn('[App] 读取外部跳转标记失败:', e)
    return false
  }
}

const persistExternalFlag = (value, duration = DEFAULT_EXTERNAL_DURATION) => {
  try {
    if (value) {
      sessionStorage.setItem(EXTERNAL_FLAG_KEY, 'true')
      sessionStorage.setItem(EXTERNAL_EXPIRE_KEY, String(Date.now() + duration))
    } else {
      sessionStorage.removeItem(EXTERNAL_FLAG_KEY)
      sessionStorage.removeItem(EXTERNAL_EXPIRE_KEY)
    }
  } catch (e) {
    console.warn('[App] 写入外部跳转标记失败:', e)
  }
}

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false,
  },
  device: 'desktop',
  size: 'mini',
  isFromExternal: readExternalFlag(),
}

const mutations = {
  TOGGLE_SIDEBAR: (state) => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_EXTERNAL_FLAG: (state, { value, duration, persist = true } = {}) => {
    state.isFromExternal = !!value
    if (persist && typeof value !== 'undefined') {
      persistExternalFlag(state.isFromExternal, duration || DEFAULT_EXTERNAL_DURATION)
    }
  },
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setExternalFlag({ commit }, { value, duration } = {}) {
    commit('SET_EXTERNAL_FLAG', { value, duration })
  },
  clearExternalFlag({ commit }) {
    commit('SET_EXTERNAL_FLAG', { value: false })
  },
  initExternalFlag({ commit }) {
    commit('SET_EXTERNAL_FLAG', { value: readExternalFlag(), persist: false })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
