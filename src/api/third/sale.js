import request from '@/utils/request';

export function saleList(query) {
    return request({
        url: '/sale/list',
        method: 'get',
        params: query,
    });
}

export function saleDetail(query) {
    return request({
        url: '/sale/detail/' + query,
        method: 'get',
        params: query,
    });
}

export function saleAuth(query) {
    return request({
        url: '/sale/auth/',
        method: 'put',
        data: query,
    });
}

export function saleUpdate(query) {
    return request({
        url: '/sale',
        method: 'put',
        data: query,
    });
}

export function saleAdd(query) {
    return request({
        url: '/sale',
        method: 'post',
        data: query,
    });
}

export function saleState(query) {
    return request({
        url: '/sale/state',
        method: 'put',
        data: query,
    });
}