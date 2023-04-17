import request from '@/utils/request';

/**
 *  模块管理
 */

export function testProductList(params) {
    return request({
        url: '/test/product/list',
        method: 'get',
        params,
    })
}

export function taskProductAuth(data) {
    return request({
        url: '/test/product/auth',
        method: 'put',
        data,
    })
}

export function testProductAdd(data) {
    return request({
        url: '/test/product',
        method: 'post',
        data,
    })
}

export function testProductEdit(data) {
    return request({
        url: '/test/product',
        method: 'put',
        data,
    })
}


/**
 *  用例库
 */

export function testCaseList(params) {
    return request({
        url: '/test/case/list',
        method: 'get',
        params,
    })
}

export function taskCaseAuth(data) {
    return request({
        url: '/test/case/auth',
        method: 'put',
        data,
    })
}

export function testCaseAdd(data) {
    return request({
        url: '/test/case',
        method: 'post',
        data,
    })
}

export function testCaseEdit(data) {
    return request({
        url: '/test/case',
        method: 'put',
        data,
    })
}

export function testCaseState(data) {
    return request({
        url: '/test/case/state',
        method: 'put',
        data,
    })
}

/**
 * 测试任务
 */

export function taskList(params) {
    return request({
        url: '/task/list',
        method: 'get',
        params
    })
}

export function taskInfo(id) {
    return request({
        url: '/task/info/' + id,
        method: 'get'
    })
}

export function taskAuth(data) {
    return request({
        url: '/task/auth',
        method: 'put',
        data,
    })
}

export function taskSave(data) {
    return request({
        url: '/task/save',
        method: 'post',
        data,
    })
}

export function taskUpdate(data) {
    return request({
        url: '/task/update',
        method: 'put',
        data,
    })
}

export function taskState(data) {
    return request({
        url: '/task/state',
        method: 'put',
        data,
    })
}

export function taskComplete(id) {
    return request({
        url: '/task/complete/' + id,
        method: 'put'
    })
}



/**
 * BUG管理
 */

export function testBugList(params) {
    return request({
        url: '/bug/list',
        method: 'get',
        params
    })
}
