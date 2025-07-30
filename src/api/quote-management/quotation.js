import request from '@/utils/request'

/**
 * 获取报价单列表
 * @param {Object} params 查询参数
 * @param {number} params.current 当前页码
 * @param {number} params.size 每页条数
 * @param {string} params.model 产品型号（可选）
 * @param {string} params.standardSpec 标准规格（可选）
 * @param {number} params.quotationType 报价方式（可选）1人民币 2美元
 * @param {number} params.customerType 客户类型（可选）
 * @returns {Promise} 返回报价单列表
 */
export function getQuotationList(params) {
  return request({
    url: '/cost/quotation/list',
    method: 'get',
    params
  })
}

/**
 * 获取报价单详情
 * @param {string} id 报价单ID
 * @returns {Promise} 返回报价单详情
 */
export function getQuotationDetail(id) {
  return request({
    url: `/cost/quotation/${id}`,
    method: 'get'
  })
}

/**
 * 创建报价单
 * @param {Object} data 报价单数据
 * @param {string} data.model 产品型号
 * @param {string} data.standardSpec 标准规格
 * @param {number} data.quotationType 报价方式 1人民币 2美元
 * @param {number} data.customerType 客户类型
 * @param {number} data.exchangeRate 汇率
 * @param {number} data.productTaxRate 产品税率
 * @param {number} data.afterSalesRate 售后费用
 * @param {string} data.remark 备注
 * @param {Array} data.list 报价单产品列表
 * @returns {Promise} 返回创建结果
 */
export function createQuotation(data) {
  return request({
    url: '/cost/quotation',
    method: 'post',
    data
  })
}

/**
 * 更新报价单
 * @param {string} id 报价单ID
 * @param {Object} data 报价单数据
 * @returns {Promise} 返回更新结果
 */
export function updateQuotation(id, data) {
  return request({
    url: `/cost/quotation/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除报价单
 * @param {string|Array} ids 报价单ID或ID数组
 * @returns {Promise} 返回删除结果
 */
export function deleteQuotation(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/cost/quotation',
    method: 'delete',
    data: idArray
  })
}

/**
 * 批量删除报价单
 * @param {Array} ids 报价单ID数组
 * @returns {Promise} 返回删除结果
 */
export function batchDeleteQuotation(ids) {
  return request({
    url: '/cost/quotation/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 复制报价单
 * @param {string} id 报价单ID
 * @param {Object} data 复制参数
 * @returns {Promise} 返回复制结果
 */
export function copyQuotation(id, data = {}) {
  return request({
    url: `/cost/quotation/${id}/copy`,
    method: 'post',
    data
  })
}

/**
 * 获取报价方式字典
 * @returns {Promise} 返回报价方式选项
 */
export function getQuotationTypes() {
  return request({
    url: '/dict/quotation_type',
    method: 'get'
  })
}

/**
 * 获取客户类型字典
 * @returns {Promise} 返回客户类型选项
 */
export function getCustomerTypes() {
  return request({
    url: '/system/dict/data/type/gross_profit_rate',
    method: 'get'
  })
}

/**
 * 获取产品税率字典
 * @returns {Promise} 返回产品税率选项
 */
export function getProductTaxRates() {
  return request({
    url: '/system/dict/data/type/product_tax_rate',
    method: 'get'
  })
}

/**
 * 获取售后费用字典
 * @returns {Promise} 返回售后费用选项
 */
export function getAfterSalesRates() {
  return request({
    url: '/system/dict/data/type/after_sales_rate',
    method: 'get'
  })
}

/**
 * 根据品类查询设备成本
 * @param {string} categoryId 品类ID
 * @returns {Promise} 返回设备成本列表
 */
export function getDeviceCostByCategory(categoryId) {
  return request({
    url: '/cost/device/category/list',
    method: 'get',
    params: {
      categoryId
    }
  })
}

/**
 * 获取成本类型字典
 * @returns {Promise} 返回成本类型选项
 */
export function getCostCategoryDict() {
  return request({
    url: '/system/dict/data/type/cost_category',
    method: 'get'
  })
}

/**
 * 获取成本项字典
 * @returns {Promise} 返回成本项选项
 */
export function getCostProjectDict() {
  return request({
    url: '/system/dict/data/type/cost_project',
    method: 'get'
  })
}

/**
 * 获取供应商字典
 * @returns {Promise} 返回供应商选项
 */
export function getSupplierDict() {
  return request({
    url: '/system/dict/data/type/cable_suppliers',
    method: 'get'
  })
}

/**
 * 根据临时key查询报价单列表
 * @param {string} key 报价单临时key
 * @returns {Promise} 返回报价单列表
 */
export function getQuotationListByKey(key) {
  return request({
    url: '/cost/quotation/list',
    method: 'get',
    params: {
      key: key
    }
  })
}

/**
 * 获取品类列表
 * @returns {Promise} 返回品类列表
 */
export function getCategoryList() {
  return request({
    url: '/category/third/list',
    method: 'get'
  })
}

/**
 * 创建/更新报价单
 * @param {Object} data 报价单数据
 * @returns {Promise} 返回创建/更新结果
 */
export function saveQuotation(data) {
  return request({
    url: '/cost/add/quotation',
    method: 'put',
    data
  })
}
//报价单导出
export function exportQuotation(data) {
  return request({
    url: '/cost/quotation/export',
    method: 'get',
    params: data,
  })
}

//删除报价单 (根据key)
export function deleteQuotationByKey(key) {
  return request({
    url: '/cost/del/quotation',
    method: 'put',
    data: { key }
  })
}