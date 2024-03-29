import { SET_CATEGORYLIST, SET_COMPUTERLIST } from '../mutationsTypes';
import { GET_CATEGORYLIST, GET_COMPUTERLIST } from '../actionsTypes';

const state = {
    // 品类
    categoryList: [],
    // 型号
    computerList: [],
    // 数据管理审核状态
    statusOptions: {
        0: "待上传",
        1: "待初审",
        2: "已审核",
        3: "未通过",
        4: "待终审",
    },
}

const getters = {
    isCheckType() {
        return ({ status }) => {
            let type = null;
            switch (status) {
                case 0:
                    type = "success";
                    break;
                case 1:
                case 4:
                    type = "danger";
                    break;
                default:
                    type = "info";
                    break;
            }
            return type;
        };
    },
}

const mutations = {
    [SET_CATEGORYLIST](state, { categoryList }) {
        state.categoryList = categoryList
    },
    [SET_COMPUTERLIST](state, { computerList }) {
        state.computerList = computerList
    }
}

const actions = {
    [GET_CATEGORYLIST]({ commit }, { params }) {
        return new Promise((resolve, reject) => {
            axios.get('/category/dict', {
                params
            }).then(res => {
                commit({
                    type: 'SET_CATEGORYLIST',
                    categoryList: res.data
                })
            }).catch(err => {
                console.log(err)
            })
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}