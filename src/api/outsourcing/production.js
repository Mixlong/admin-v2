import request from '@/utils/request'

/**
 * 分页查询外协生产列表
 * @param {Object} params - 查询参数
 */
export function getOutsourcingProductionList(params) {
  return request({
    url: '/outsourcing/production/list',
    method: 'get',
    params
  })
}

/**
 * 获取外协生产详情
 * @param {String} id - 主键ID
 */
export function getOutsourcingProductionDetail(id) {
  return request({
    url: `/outsourcing/production/${id}`,
    method: 'get'
  })
}

/**
 * 新增外协生产
 * @param {Object} data - 外协生产对象
 */
export function addOutsourcingProduction(data) {
  return request({
    url: '/outsourcing/production/add',
    method: 'post',
    data
  })
}

/**
 * 修改外协生产
 * @param {Object} data - 外协生产对象
 */
export function updateOutsourcingProduction(data) {
  return request({
    url: '/outsourcing/production/update',
    method: 'put',
    data
  })
}

/**
 * 删除外协生产
 * @param {String} id - 主键ID
 */
export function deleteOutsourcingProduction(id) {
  return request({
    url: `/outsourcing/production/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 初审
 * @param {String} id - 主键ID
 */
export function firstAudit(id) {
  return request({
    url: `/outsourcing/production/first-audit/${id}`,
    method: 'put'
  })
}

/**
 * 终审
 * @param {String} id - 主键ID
 */
export function finalAudit(id) {
  return request({
    url: `/outsourcing/production/final-audit/${id}`,
    method: 'put'
  })
}
