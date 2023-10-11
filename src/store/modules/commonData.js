/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-10-10 19:32:47
 * @FilePath: \FILECONF-UI\src\store\modules\commonData.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

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