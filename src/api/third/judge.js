/*
 * @Author: your name
 * @Date: 2021-05-18 17:39:58
 * @LastEditTime: 2021-05-18 18:59:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/third/udge.js
 */


import request from '@/utils/request'

export function judgeList(query) {
    return request({
        url: '/judge/order/list',
        method: 'get',
        params: query
    })
}


export function judgeAdd(query) {
    return request({
        url: '/judge/order',
        method: 'post',
        data: query
    })
}

export function judgeUpdate(query) {
    return request({
        url: '/judge/order',
        method: 'put',
        data: query
    })
}


export function judgeAuth(query) {
    return request({
        url: '/judge/order/auth',
        method: 'put',
        data: query
    })
}


export function judgeoOderAdd(query) {
    return request({
        url: '/judge/order/detail',
        method: 'post',
        data: query
    })
}

export function judgeOrderUpdate(query) {
    return request({
        url: '/judge/order/detail',
        method: 'put',
        data: query
    })
}


export function judgeOrderState(query) {
    return request({
        url: '/judge/order/detail/state',
        method: 'put',
        data: query
    })
}


