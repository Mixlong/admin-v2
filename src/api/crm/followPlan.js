import request from '@/utils/request'

/**
 * 跟进计划管理API
 */

/**
 * 获取跟进计划列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFollowPlanList(params) {
  return request({
    url: '/third/follow/plan/list',
    method: 'get',
    params
  })
}

/**
 * 新增跟进计划
 * @param {Object} data - 跟进计划信息
 * @returns {Promise}
 */
export function addFollowPlan(data) {
  return request({
    url: '/third/follow/plan',
    method: 'post',
    data
  })
}

/**
 * 修改跟进计划
 * @param {Object} data - 跟进计划信息
 * @returns {Promise}
 */
export function updateFollowPlan(data) {
  return request({
    url: '/third/follow/plan',
    method: 'put',
    data
  })
}

/**
 * 删除跟进计划
 * @param {string|Array} ids - 跟进计划ID，可以是单个ID或ID数组
 * @returns {Promise}
 */
export function deleteFollowPlan(ids) {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `/third/follow/plan/${idsStr}`,
    method: 'delete'
  })
}

/**
 * 获取跟进计划详情
 * @param {string} id - 跟进计划ID
 * @returns {Promise}
 */
export function getFollowPlanDetail(id) {
  return request({
    url: `/third/follow/plan/info/${id}`,
    method: 'get'
  })
}

/**
 * 完成跟进计划
 * @param {string} id - 跟进计划ID
 * @returns {Promise}
 */
export function updateFollowPlanState(id, planState) {
  return request({
    url: `/third/follow/plan/state/${id}/${planState}`,
    method: 'put'
  })
}

/**
 * 批量完成跟进计划
 * @param {Array} ids - 跟进计划ID数组
 * @returns {Promise}
 */
export function batchCompleteFollowPlan(ids) {
  return request({
    url: '/third/follow/plan/batch/complete',
    method: 'put',
    data: { ids }
  })
}

/**
 * 获取跟进计划统计信息
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFollowPlanStats(params) {
  return request({
    url: '/third/follow/plan/stats',
    method: 'get',
    params
  })
}

/**
 * 根据项目ID获取跟进计划列表
 * @param {string} projectId - 项目ID
 * @returns {Promise}
 */
export function getFollowPlansByProjectId(projectId) {
  return request({
    url: `/third/follow/plan/project/${projectId}`,
    method: 'get'
  })
}

/**
 * 根据执行人获取跟进计划列表
 * @param {string} assignee - 执行人
 * @returns {Promise}
 */
export function getFollowPlansByAssignee(assignee) {
  return request({
    url: `/third/follow/plan/assignee/${assignee}`,
    method: 'get'
  })
}
