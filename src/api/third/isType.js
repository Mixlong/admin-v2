import request from '@/utils/request';

export function listManagement(params) {
    return request({
        url: '/order/management/list',
        method: 'get',
        params
    });
}

// 审核
export function detailCategory(data) {
    return request({
        url: '/order/management/review',
        method: 'put',
        data
    });
}

// 禁用，启用
export function authManagement(data) {
    return request({
        url: '/order/management/auth?id=' + data.id,
        method: 'put',
        data
    });
}

// 编辑
export function listEdit(id, data) {
    return request({
        url: '/order/management/edit/' + id,
        method: 'put',
        data
    });
}

//   创建
export function listCreate(data) {
    return request({
        url: '/order/management',
        method: 'post',
        data
    });
}

export function listCustomers(params) {
    return request({
        url: '/customer/third/list',
        method: 'get',
        params
    })
}

// 查询所有用户
export function dictUserList() {
    return request({
        url: '/system/user/list/user',
        method: 'get'
    });
}

// 根据品类id获取型号
export function listModelDict (id) {
  return request ({
    url: '/computer/dict/list/' + id,
    method: 'get'
  });
}

// 根据品类名称获取型号
export function listModelNameDict (name) {
    return request ({
      url: '/computer/category/name/' + name,
      method: 'get'
    });
  }