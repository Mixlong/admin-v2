import request from '@/utils/request';

// 销售订单列表
export function getTestDeviceList(params) {
    return request({
        url: '/test/device/list',
        method: 'get',
        params
    })
}

// 获取详情
export function getTestDeviceDetail(id) {
    return request({
        url: '/test/device/detail' + id,
        method: 'get'
    })
}

// 删除
export function getTestDeviceDel(id) {
    return request({
        url: '/test/device/del/' + id,
        method: 'delete'
    })
}

// 更新
export function getTestDeviceUpdate(data) {
    return request({
        url: '/test/device',
        method: 'put',
        data
    })
}

// 创建
export function getTestDeviceCreate(data) {
    return request({
        url: '/test/device',
        method: 'post',
        data
    })
}

// 创建计划
export function getTestDevicePlanCreate(data) {
    return request({
        url: '/test/device/plan',
        method: 'post',
        data
    })
}

// 更新计划
export function getTestDevicePlanUpdate(data) {
    return request({
        url: '/test/device/plan',
        method: 'put',
        data
    })
}