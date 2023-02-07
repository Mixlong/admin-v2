import request from '@/utils/request'

// 查询仪表列表
export function demandList(query) {
    return request({
        url: '/demand/list',
        method: 'get',
        params: query
    })
}


export function demandAdd(query) {
    return request({
        url: '/demand',
        method: 'post',
        data: query
    })
}

export function demandUpdate(query) {
    return request({
        url: '/demand',
        method: 'put',
        data: query
    })
}


export function demandAuth(query) {
    return request({
        url: '/demand/auth',
        method: 'put',
        data: query
    })
}

export function demandState(query) {
    return request({
        url: '/demand/state',
        method: 'put',
        data: query
    })
}
