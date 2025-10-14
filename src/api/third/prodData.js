
import request from '@/utils/request'

export function materialList(params) {
    return request({
        url: '/production/scheduling/material/list',
        method: 'get',
        params
    })
}

// 新的物料列表接口
export function getMaterialList(params) {
    return request({
        url: '/production/scheduling/material/code/list',
        method: 'get',
        params
    })
}

export function materialUpdate(data) {
    return request({
        url: '/production/scheduling/update/material',
        method: 'put',
        data
    })
}

