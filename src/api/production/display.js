import request from '@/utils/request'

/**
 * 获取生产计划详情列表
 * @param {Object} params - 查询参数
 * @param {string} params.date - 生产日期 (格式: yyyy-MM-dd)
 * @returns {Promise}
 */
export function getProductionMaterialList(params) {
  return request({
    url: '/production/scheduling/material/info/list',
    method: 'get',
    params
  })
}
