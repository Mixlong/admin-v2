import request from '@/utils/request'

// 分页查询客户要求列表
export function getCustomerRequirementList(params) {
  return request({
    url: '/base/customer/requirement/list',
    method: 'get',
    params
  })
}

// 获取客户要求详情
export function getCustomerRequirementInfo(id) {
  return request({
    url: `/base/customer/requirement/info/${id}`,
    method: 'get'
  })
}

// 新增客户要求
export function addCustomerRequirement(data) {
  return request({
    url: '/base/customer/requirement',
    method: 'post',
    data
  })
}

// 修改客户要求
export function updateCustomerRequirement(data) {
  return request({
    url: '/base/customer/requirement',
    method: 'put',
    data
  })
}

// 删除客户要求
export function deleteCustomerRequirement(id) {
  return request({
    url: `/base/customer/requirement/${id}`,
    method: 'delete'
  })
}



