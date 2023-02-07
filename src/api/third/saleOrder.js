import request from '@/utils/request';

// 销售订单列表
export function getSaleOrderList(params) {
    return request({
        url: '/so/order/list',
        method: 'get',
        params
    })
}

// 获取详情
export function getSaleOrderDetail(id) {
    return request({
        url: '/so/order/detail' + id,
        method: 'get'
    })
}

// 删除
export function getSaleOrderDel(data) {
    return request({
        url: '/so/order/del',
        method: 'delete',
        data
    })
}

// 更新
export function getSaleOrderUpdate(data) {
    return request({
        url: '/so/order',
        method: 'put',
        data
    })
}

// 创建
export function getSaleOrderCreate(data) {
    return request({
        url: '/so/order',
        method: 'post',
        data
    })
}

// 更新状态
export function getSaleState(data) {
    return request({
        url: '/so/order/state',
        method: 'put',
        data
    })
}