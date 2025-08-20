import request from '@/utils/request'

// 查询排产列表
export function listScheduling(query) {
  return request({
    url: '/production/scheduling/list',
    method: 'get',
    params: query
  })
}

// 查询排产详细
export function getScheduling(id) {
  return request({
    url: '/production/scheduling/' + id,
    method: 'get'
  })
}

// 新增排产
export function addScheduling(data) {
  return request({
    url: '/production/scheduling',
    method: 'post',
    data: data
  })
}

// 修改排产
export function updateScheduling(data) {
  return request({
    url: '/production/scheduling',
    method: 'put',
    data: data
  })
}

// 删除排产
export function delScheduling(id) {
  return request({
    url: '/production/scheduling/' + id,
    method: 'delete'
  })
}

// 导出排产
export function exportScheduling(query) {
  return request({
    url: '/production/scheduling/export',
    method: 'get',
    params: query
  })
}

// 批量删除排产
export function batchDelScheduling(ids) {
  return request({
    url: '/production/scheduling/batch/' + ids,
    method: 'delete'
  })
}

// 更新排产状态
export function updateSchedulingStatus(id, status) {
  return request({
    url: '/production/scheduling/status',
    method: 'put',
    data: {
      id,
      status
    }
  })
}

// 获取排产统计信息
export function getSchedulingStatistics(query) {
  return request({
    url: '/production/scheduling/statistics',
    method: 'get',
    params: query
  })
}

// 检查订单号是否存在
export function checkOrderNumber(orderNumber, id) {
  return request({
    url: '/production/scheduling/checkOrderNumber',
    method: 'get',
    params: {
      orderNumber,
      id
    }
  })
}

// 获取可用的订单列表
export function getAvailableOrders(query) {
  return request({
    url: '/production/scheduling/availableOrders',
    method: 'get',
    params: query
  })
}

// 生成排产计划
export function generateSchedulingPlan(data) {
  return request({
    url: '/production/scheduling/generatePlan',
    method: 'post',
    data: data
  })
}

// 更新每日计划
export function updateDailyPlan(schedulingId, dailyPlan) {
  return request({
    url: '/production/scheduling/dailyPlan',
    method: 'put',
    data: {
      schedulingId,
      dailyPlan
    }
  })
}

// 获取排产进度
export function getSchedulingProgress(id) {
  return request({
    url: '/production/scheduling/progress/' + id,
    method: 'get'
  })
}

// 完成排产
export function completeScheduling(id, data) {
  return request({
    url: '/production/scheduling/complete/' + id,
    method: 'put',
    data: data
  })
}

// 暂停/恢复排产
export function pauseResumeScheduling(id, action) {
  return request({
    url: '/production/scheduling/' + action + '/' + id,
    method: 'put'
  })
}

// 取消排产
export function cancelScheduling(id, reason) {
  return request({
    url: '/production/scheduling/cancel/' + id,
    method: 'put',
    data: {
      reason
    }
  })
}