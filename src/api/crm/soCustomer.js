import request from '@/utils/request'

/**
 * 销售订单客户管理API
 */

/**
 * 新增销售订单客户
 * @param {Object} soCustomer - 销售订单客户信息
 * @returns {Promise}
 */
export function addSoCustomer(soCustomer) {
  return request({
    url: '/so/customer',
    method: 'post',
    data: soCustomer
  })
}

/**
 * 修改销售订单客户
 * @param {Object} soCustomer - 销售订单客户信息
 * @returns {Promise}
 */
export function updateSoCustomer(soCustomer) {
  return request({
    url: '/so/customer',
    method: 'put',
    data: soCustomer
  })
}

/**
 * 删除销售订单客户
 * @param {string} customerId - 客户ID
 * @returns {Promise}
 */
export function deleteSoCustomer(customerId) {
  return request({
    url: `/so/customer/delete/${customerId}`,
    method: 'delete'
  })
}

/**
 * 获取销售订单客户详情
 * @param {string} id - 客户ID
 * @returns {Promise}
 */
export function getSoCustomerDetail(id) {
  return request({
    url: `/so/customer/info/${id}`,
    method: 'get'
  })
}

/**
 * 分页查询销售订单客户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getSoCustomerList(params) {
  return request({
    url: '/so/customer/list',
    method: 'get',
    params
  })
}

/**
 * 导出销售订单客户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportSoCustomer(params) {
  return request({
    url: '/so/customer/export',
    method: 'post',
    data: params
  })
}

/**
 * 销售订单客户模板下载
 * @returns {Promise}
 */
export function downloadSoCustomerTemplate() {
  return request({
    url: '/so/customer/importTemplate',
    method: 'post'
  })
}

/**
 * 批量导入销售订单客户
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise}
 */
export function importSoCustomer(formData) {
  return request({
    url: '/so/customer/importData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取销售订单客户字典数据
 * @param {string} dictType - 字典类型
 * @returns {Promise}
 */
export function getSoCustomerDict(dictType) {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get'
  })
}

/**
 * 根据客户名称模糊查询销售订单客户
 * @param {string} name - 客户名称
 * @returns {Promise}
 */
export function searchSoCustomerByName(name) {
  return request({
    url: '/so/customer/search',
    method: 'get',
    params: { name }
  })
}

/**
 * 根据客户编号查询销售订单客户
 * @param {string} no - 客户编号
 * @returns {Promise}
 */
export function getSoCustomerByNo(no) {
  return request({
    url: '/so/customer/no',
    method: 'get',
    params: { no }
  })
}

/**
 * 启用/禁用销售订单客户
 * @param {string} id - 客户ID
 * @param {number} status - 状态（0启用 1禁用）
 * @returns {Promise}
 */
export function changeSoCustomerStatus(id, status) {
  return request({
    url: '/so/customer/changeStatus',
    method: 'put',
    data: { id, status }
  })
}
