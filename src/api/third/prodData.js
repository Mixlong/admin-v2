
import request from '@/utils/request'

export function materialList(params) {
    return request({
        url: '/production/scheduling/material/list',
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

