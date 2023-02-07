
import { SET_CATEGORYLIST, SET_COMPUTERLIST } from '../mutationsTypes';
import { GET_CATEGORYLIST, GET_COMPUTERLIST } from '../actionsTypes';

const state = {
    // 品类
    categoryList: [],
    // 型号
    computerList: []
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
                console.log(res)
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
    mutations,
    actions
}