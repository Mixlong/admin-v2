import request from '@/utils/request'

export function filterIpAdd(query) {
    return request({
        url: '/filter/ip',
        method: 'post',
        data: query
    })
}


export function filterIpUpdate(query) {
    return request({
        url: '/filter/ip',
        method: 'put',
        data: query
    })
}
export function filterIpAuth(query) {
    return request({
        url: '/filter/ip/auth',
        method: 'put',
        data: query
    })
}

export function filterIpDelete(query) {
    return request({
        url: '/filter/ip/auth',
        method: 'delete',
        data: query
    })
}



export function filterIpList(query) {
    return request({
        url: '/filter/ip/list/',
        method: 'get',
        params: query
    })
}

