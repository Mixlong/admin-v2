/*
 * @Author: your name
 * @Date: 2021-05-28 15:47:22
 * @LastEditTime: 2021-06-01 13:53:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/third/fct.js
 */


import request from '@/utils/request'


// 查询仪表列表
export function fctCabinet(query) {
    return request({
        url: '/fct/cabinet/deliver/list',
        method: 'get',
        params: query,
		isToken: false
    })
}

export function fctExportList(query) {
    return request({
        url: '/fct/cabinet/deliver/list/export',
        method: 'get',
        params: query,
		isToken: false
    })
}
 