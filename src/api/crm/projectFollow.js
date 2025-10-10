import request from '@/utils/request'

/**
 * 项目跟进管理API
 */

/**
 * 根据客户ID查询项目跟进列表
 * @param {string} customerId - 客户ID
 * @returns {Promise}
 */
export function getProjectFollowByCustomerId(customerId) {
  return request({
    url: `/third/project/follow/customer/${customerId}`,
    method: 'get'
  })
}

/**
 * 获取项目跟进列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectFollowList(params) {
  return request({
    url: '/third/project/follow/list',
    method: 'get',
    params: {
      p: params.pageNum || params.p || 1,
      l: params.pageSize || params.l || 10,
      customerId: params.customerId,
      projectName: params.projectName,
      projectNode: params.projectNode,
      productType: params.productType
    }
  })
}

/**
 * 新增项目跟进
 * @param {Object} data - 项目跟进信息
 * @returns {Promise}
 */
export function addProjectFollow(data) {
  return request({
    url: '/third/project/follow',
    method: 'post',
    data
  })
}

/**
 * 修改项目跟进
 * @param {Object} data - 项目跟进信息
 * @returns {Promise}
 */
export function updateProjectFollow(data) {
  return request({
    url: '/third/project/follow',
    method: 'put',
    data
  })
}

/**
 * 删除项目跟进
 * @param {string|Array} ids - 项目跟进ID，可以是单个ID或ID数组
 * @returns {Promise}
 */
export function deleteProjectFollow(ids) {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `/third/project/follow/${idsStr}`,
    method: 'delete'
  })
}

/**
 * 获取项目跟进详情
 * @param {string} id - 项目跟进ID
 * @returns {Promise}
 */
export function getProjectFollowDetail(id) {
  return request({
    url: `/third/project/follow/info/${id}`,
    method: 'get'
  })
}