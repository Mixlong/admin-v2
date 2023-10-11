/*
 * @Author: your name
 * @Date: 2021-05-06 16:36:24
 * @LastEditTime: 2021-06-09 18:38:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/third/emphasis.js
 */
import request from '@/utils/request'

// 查询仪表列表
export function emphasisAdd(query) {
    return request({
        url: '/emphasis',
        method: 'post',
        data: query
    })
}


export function emphasisUpdate(query) {
    return request({
        url: '/emphasis',
        method: 'put',
        data: query
    })
}

export function emphasisDelete(query) {
    return request({
        url: '/emphasis/del/' + query,
        method: 'delete',

    })
}

export function emphasisDetail(query) {
    return request({
        url: '/emphasis/detail/' + query,
        method: 'get',

    })
}

export function emphasisList(params) {
    return request({
        url: '/emphasis/list',
        method: 'get',
        params
    })
}

export function emphasisSort(query) {
    return request({
        url: '/emphasis/sort',
        method: 'put',
        data: query
    })
}
export function emphasisLogList(query) {
    return request({
        url: '/emphasis/log/list/' + query,
        method: 'get',
    })
}



export function emphasislogAdd(data) {
    return request({
        url: '/emphasis/log',
        method: 'post',
        data
    })
}

export function emphasislogUpdate(data) {
    return request({
        url: '/emphasis/log',
        method: 'put',
        data
    })
}

export function emphasislogComplete(data) {
    return request({
        url: '/emphasis/complete',
        method: 'put',
        data
    })
}

export function emphasisDel(query) {
    return request({
        url: '/emphasis/del/' + query,
        method: 'delete',
        params: query
    })
}





