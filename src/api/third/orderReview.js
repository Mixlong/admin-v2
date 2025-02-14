import request from '@/utils/request';

export function judgeOrderList(params) {
    return request({
        url: '/judge/order/list',
        method: 'get',
        params
    });
}

export function judgeOrderCreate(data) {
    return request({
        url: '/judge/order/create',
        method: 'post',
        data
    });
}

export function judgeOrderEdit(data) {
    return request({
        url: '/judge/order/edit',
        method: 'put',
        data
    });
}

export function judgeOrderDetail(params) {
    return request({
        url: '/judge/order/detail',
        method: 'get',
        params
    });
}

export function judgeOrderAuth(data) {
    return request({
        url: '/judge/order/auth',
        method: 'put',
        data
    });
}

export function judgeOrderReviewList(params) {
    return request({
        url: '/judge/order/review/list',
        method: 'get',
        params
    });
}

export function judgeEditOrder(data) {
    return request({
        url: '/judge/order/edit',
        method: 'get',
        params
    });
}

export function judgeDeleteOrder(data) {
    return request({
        url: '/judge/order/delete',
        method: 'delete',
        data
    });
}