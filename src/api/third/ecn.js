/*
 * @Author: your name
 * @Date: 2021-05-07 16:07:30
 * @LastEditTime: 2021-05-07 18:47:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/third/ecn.js
 */
import request from '@/utils/request'
 

// 查询仪表列表
export function bomAdd(query) {
    return request({
        url: '/bom',
        method: 'post',
        data: query
    })
}


export function bomUpdate(query) {
    return request({
        url: '/bom',
        method: 'put',
        data: query
    })
}

 
export function bomDetail(query) {
    return request({
        url: '/bom/detail/' + query,
        method: 'get',

    })
}

export function bomList(query) {
    return request({
        url: '/bom/list',
        method: 'get',
        params: query
    })
}
 
export function bomAuth(query) {
    return request({
        url: '/bom/auth',
        method: 'put',
        data: query
    })
}
 