import request from '@/utils/request'

export function orderWorkList(params) {
    return request({
        url: '/order/work/list',
        method: 'get',
        params
    })
}

export function orderWorkErpCreate(data) {
    return request({
        url: '/order/work/erp/create',
        method: 'post',
        data
    })
}
