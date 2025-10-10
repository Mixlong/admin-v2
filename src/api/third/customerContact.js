import request from '@/utils/request'

// 客户联系人管理API

/**
 * 新增客户联系人
 * @param {Object} customerContact - 客户联系人信息
 * @returns {Promise}
 */
export function addCustomerContact(customerContact) {
  return request({
    url: '/third/customer/contact',
    method: 'post',
    data: customerContact
  })
}

/**
 * 修改客户联系人
 * @param {Object} customerContact - 客户联系人信息
 * @returns {Promise}
 */
export function updateCustomerContact(customerContact) {
  return request({
    url: '/third/customer/contact',
    method: 'put',
    data: customerContact
  })
}

/**
 * 删除客户联系人
 * @param {string|Array} ids - 联系人ID，可以是单个ID或ID数组
 * @returns {Promise}
 */
export function deleteCustomerContact(ids) {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `/third/customer/contact/${idsStr}`,
    method: 'delete'
  })
}

/**
 * 获取客户联系人详情
 * @param {string} id - 联系人ID
 * @returns {Promise}
 */
export function getCustomerContact(id) {
  return request({
    url: `/third/customer/contact/${id}`,
    method: 'get'
  })
}

/**
 * 分页获取客户联系人列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getCustomerContactList(params) {
  return request({
    url: '/third/customer/contact/list',
    method: 'get',
    params
  })
}

/**
 * 根据客户ID获取联系人列表
 * @param {string} customerId - 客户ID
 * @returns {Promise}
 */
export function getContactsByCustomerId(customerId) {
  return request({
    url: `/third/customer/contact/customer/${customerId}`,
    method: 'get'
  })
}

/**
 * 批量删除客户联系人
 * @param {Array} ids - 联系人ID数组
 * @returns {Promise}
 */
export function batchDeleteCustomerContact(ids) {
  return request({
    url: '/third/customer/contact/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 导出客户联系人
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export function exportCustomerContact(params) {
  return request({
    url: '/third/customer/contact/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入客户联系人
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise}
 */
export function importCustomerContact(formData) {
  return request({
    url: '/third/customer/contact/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载导入模板
 * @returns {Promise}
 */
export function downloadCustomerContactTemplate() {
  return request({
    url: '/third/customer/contact/template',
    method: 'get',
    responseType: 'blob'
  })
}
