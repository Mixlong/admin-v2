import request from '@/utils/request'

export function schemeTypeList(params) {
    return request({
        url: '/scheme/type/list',
        method: 'get',
        params
    })
}

// 属性列表
export function schemeTypePtList(params) {
    return request({
        url: '/scheme/type/property/list',
        method: 'get',
        params
    })
}

// 已选属性列表
export function schemeTypePtPick(params) {
    return request({
        url: '/scheme/type/property/pick',
        method: 'get',
        params
    })
}

// 详情
export function schemeTypeInfo(id) {
    return request({
        url: '/scheme/type/info/' + id,
        method: 'get'
    })
}

// 保存
export function schemeTypeSave(data) {
    return request({
        url: '/scheme/type/save',
        method: 'post',
        data
    })
}

// 修改
export function schemeTypeUpdate(data) {
    return request({
        url: '/scheme/type/update',
        method: 'put',
        data
    })
}








