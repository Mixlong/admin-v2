import request from '@/utils/request'

// 查询仪表列表
export function listCustomer(query) {
  return request({
    url: '/customer/list',
    method: 'get',
    params: query
  })
}

// 查询仪表详情
export function detailCustomer(query) {
  return request({
    url: '/customer/' + query,
    method: 'get',
  })
}

export function listModelDict(query) {
  return request({
    url: '/customer/dict/list',
    method: 'get',
    params: query
  })
}

// 启用/禁用仪表
export function authCustomer(data) {
  return request({
    url: '/customer/auth',
    method: 'put',
    data: data
  })
}

// 创建仪表
export function addCustomer(data) {
  return request({
    url: '/customer',
    method: 'post',
    data: data
  })
}

// 编辑仪表
export function editCustomer(data) {
  return request({
    url: '/customer',
    method: 'put',
    data: data
  })
}
