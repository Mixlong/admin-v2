import request from '@/utils/request'

// 客户列表
export function getCustomerList(params) {
  return request({
    url: '/so/customer/admin/list',
    method: 'get',
    params
  })
}

// 客户详情
export function getCustomer(id) {
  return request({
    url: '/so/customer/' + id,
    method: 'get'
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/so/customer',
    method: 'post',
    data
  })
}

// 修改客户
export function updateCustomer(data) {
  return request({
    url: '/so/customer',
    method: 'put',
    data
  })
}

// 删除客户
export function delCustomer(id) {
  return request({
    url: '/so/customer/' + id,
    method: 'delete'
  })
}
