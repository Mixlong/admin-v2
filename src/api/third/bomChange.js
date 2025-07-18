import request from '@/utils/request'

// 获取订单BOM变更通知列表
export function getBomOrderChangeList(query) {
  return request({
    url: '/bom/order/list',
    method: 'get',
    params: query
  })
}

// 新增订单BOM变更通知
export function addBomOrderChange(data) {
  return request({
    url: '/bom/order',
    method: 'post',
    data: data
  })
}

// 更新订单BOM变更通知
export function updateBomOrderChange(data) {
  return request({
    url: '/bom/order',
    method: 'put',
    data: data
  })
}

// 启用/禁用订单BOM变更通知
export function authBomOrderChange(data) {
  return request({
    url: '/bom/order/auth',
    method: 'put',
    data: data
  })
}

// 订单变更审核
export function auditBomOrderChange(data) {
  return request({
    url: '/bom/order/change/state',
    method: 'put',
    data: data
  })
}

// 获取订单BOM变更详情
export function getBomOrderChangeDetail(id) {
  return request({
    url: `/bom/order/detail/${id}`,
    method: 'get'
  })
}

// 获取订单BOM变更详情
export function getBomOrderFieldState(data) {
  return request({
    url: `/bom/order/field/state`,
    method: 'put',
    data
  })
}

// 初审接口
export function bomOrderFirstState(data) {
  return request({
    url: '/bom/order/first/state',
    method: 'put',
    data: data
  })
}

// 终审接口
export function bomOrderSecondState(data) {
  return request({
    url: '/bom/order/second/state',
    method: 'put',
    data: data
  })
}

// 系统变更审核接口
export function bomOrderSystemState(data) {
  return request({
    url: '/bom/order/system/state',
    method: 'put',
    data: data
  })
}

// 订单变更审核接口
export function bomOrderChangeState(data) {
  return request({
    url: '/bom/order/change/state',
    method: 'put',
    data: data
  })
}

// 工单变更审核接口
export function bomOrderWorkState(data) {
  return request({
    url: '/bom/order/work/state',
    method: 'put',
    data: data
  })
}
