import { login, logout, getInfo } from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { setSharedToken, removeSharedToken, syncUserInfo } from '@/utils/microAppAuth';
import { getCachedAdminV3Info } from '@/utils/adminV3Cache';
import { projectLisReceiveRemind, remindMum } from '@/api/third/project';
import { taskNotice } from '@/api/third/task';

import { MessageBox } from 'element-ui';
import router from '@/router';

function resolveAvatar(avatar) {
  if (typeof avatar !== 'string' || avatar.trim() === '') {
    return require('@/assets/image/profile.jpg')
  }

  const avatarUrl = avatar.trim()
  return avatarUrl.startsWith('http')
    ? avatarUrl
    : process.env.VUE_APP_BASE_API + avatarUrl
}

function applyUserInfo(commit, dispatch, res) {
  const user = res.user;
  const avatar = resolveAvatar(user.avatar)

  if (res.roles && res.roles.length > 0) {
    commit('SET_ROLES', res.roles);
    commit('SET_PERMISSIONS', res.permissions);
  } else {
    commit('SET_ROLES', ['ROLE_DEFAULT']);
  }
  commit('SET_NAME', user.userName);
  commit('SET_AVATAR', avatar);
  commit('SET_ID', user.userId);
  commit('SET_NICK_NAME', user.nickName);
  commit('SET_READ_NUM', res.readNum);

  console.log('GetInfo用户数据:', user);
  console.log('用户部门信息:', user.dept);

  if (user.dept) {
    console.log('正在存储部门信息:', user.dept.deptId, user.dept.deptName);
    commit('SET_DEPT_ID', user.dept.deptId);
    commit('SET_DEPT_NAME', user.dept.deptName);
  } else {
    console.warn('API返回的用户数据中没有dept字段');
  }

  const userInfo = {
    userId: user.userId,
    userName: user.userName,
    nickName: user.nickName,
    avatar: avatar,
    roles: res.roles,
    permissions: res.permissions
  };
  syncUserInfo(userInfo);
  dispatch('SyncStoreToMicroApp');
}

const user = {
  state: {
    token: getToken(),
    userId: undefined,
    nickName: undefined,
    readNum: 0,
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    taskOverdueNum: 0,
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_ID: (state, userId) => {
      state.userId = userId;
    },
    SET_NICK_NAME: (state, nickName) => {
      state.nickName = nickName;
    },
    SET_READ_NUM: (state, readNum) => {
      state.readNum = readNum;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions;
    },
    SET_TASKNUM: (state, data) => {
      state.taskOverdueNum = data;
    },
    SET_DEPT_ID: (state, deptId) => {
      console.log('SET_DEPT_ID mutation执行:', deptId);
      state.deptId = deptId;
    },
    SET_DEPT_NAME: (state, deptName) => {
      console.log('SET_DEPT_NAME mutation执行:', deptName);
      state.deptName = deptName;
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then(res => {
            setToken(res.token);
            setSharedToken(res.token); // 同步token到微应用
            commit('SET_TOKEN', res.token);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        const cachedInfo = getCachedAdminV3Info(state.token);
        if (cachedInfo && cachedInfo.user) {
          console.log('[GetInfo] 复用 ADMIN_V3_GET_INFO_CACHE');
          applyUserInfo(commit, dispatch, cachedInfo);
          resolve(cachedInfo);
          return;
        }

        getInfo(state.token)
          .then(res => {
            applyUserInfo(commit, dispatch, res);

            // 因不知是否有用，暂时注释
            
            // setTimeout(() => {
            //   dispatch('ReceiveRemind');
            //   dispatch('TaskNum');
            // }, 2000);
            // setInterval(() => {
            //   dispatch('TaskNum');
            // }, 10000)
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit('SET_ID', undefined);
            commit('SET_TOKEN', '');
            commit('SET_ROLES', []);
            commit('SET_PERMISSIONS', []);
            removeToken();

            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '');
        removeToken();
        resolve();
      });
    },
    // 未读消息
    ReceiveRemind({ commit }) {
      return new Promise(resolve => {
        remindMum().then(res => {
          let { data } = res;
          openHtml(data);

          resolve(res);
        });
      });
    },
    
    // 同步store数据到微应用
    SyncStoreToMicroApp({ state }) {
      // 检查是否有必要同步
      if (!state.token) {
        console.log('⚠️  无token，跳过同步')
        return
      }
      
      const storeData = {
        user: {
          token: state.token,
          id: state.userId,
          name: state.name,
          nickName: state.nickName,
          avatar: state.avatar,
          roles: state.roles,
          permissions: state.permissions
        },
        timestamp: Date.now(),
        source: 'auto-sync'  // 标识这是自动同步
      }
      
      console.log('📤 主应用自动同步store数据到微应用:', storeData)
      
      // 通过无界bus发送数据
      setTimeout(() => {
        if (window.$wujie && window.$wujie.bus) {
          try {
            window.$wujie.bus.$emit('main-store-sync', storeData)
            console.log('✅ store数据同步发送成功')
          } catch (error) {
            console.error('❌ store数据同步发送失败:', error)
          }
        } else {
          console.warn('⚠️  无界bus不可用，同步失败')
        }
      }, 100)
    },
    
    /**任务数量 */
    TaskNum({ commit }) {
      return new Promise(resolve => {
        taskNotice().then(res => {
          let { data } = res;
          commit('SET_TASKNUM', data)
          resolve(res);
        });
      });
    },
  },
};
function openHtml(data) {
  let content = '';
  if (data.paperNum) {
    let nameList = '';
    for (let key of data.paperList) {
      nameList += `<div class='text-blue'>  ${key}</div>`;
    }
    nameList = `<div>${nameList}</div>`;
    content += `<div>
    您有<span class='text-red'>${data.paperNum}</span>未读提醒</div>
    ${nameList}
  `;
  }
  if (data.projectNum) {
    let nameList = '';
    for (let key of data.projectList) {
      nameList += `<div class='text-blue'>  ${key}</div>`;
    }
    nameList = `<div>${nameList}</div>`;
    content += `<div class='margin-top-xs'>
    您有<span class='text-red'>${data.projectNum}</span>个任务未完成
     
  </div>
  ${nameList}
  `;
  }
  if (content == '') {
    return;
  }
  MessageBox.confirm(`<div>${content}</div>`, '消息提示', {
    showClose: true,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '前往处理',
    showCancelButton: false,
    customClass: 'paper-alert',
    closeOnPressEscape: false,
    closeOnClickModal: false,
  }).then(() => {
    router.push({
      path: '/prodData/paper',
    });
  });
}

export default user;
