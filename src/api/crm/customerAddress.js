import request from '@/utils/request'

/**
 * 分页查询客户收货地址列表
 */
export function listCustomerAddress(query) {
  return request({
    url: '/third/customer/address/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取客户收货地址详情
 */
export function getCustomerAddress(id) {
  return request({
    url: `/third/customer/address/info/${id}`,
    method: 'get'
  })
}

/**
 * 新增客户收货地址
 */
export function addCustomerAddress(data) {
  return request({
    url: '/third/customer/address/add',
    method: 'post',
    data: data
  })
}

/**
 * 修改客户收货地址
 */
export function updateCustomerAddress(data) {
  return request({
    url: '/third/customer/address/update',
    method: 'put',
    data: data
  })
}

/**
 * 批量删除客户收货地址
 */
export function deleteCustomerAddress(ids) {
  return request({
    url: `/third/customer/address/delete/${ids}`,
    method: 'delete'
  })
}

