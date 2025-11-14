import request from '@/utils/request'

// 查询试产申请列表
export function trialApplyList(params) {
  return request({
    url: '/trial/apply/list',
    method: 'get',
    params
  })
}

// 查询试产申请详情
export function trialApplyDetail(id) {
  return request({
    url: `/trial/apply/detail/${id}`,
    method: 'get'
  })
}

// 新增试产申请
export function trialApplyAdd(data) {
  return request({
    url: '/trial/apply/add',
    method: 'post',
    data
  })
}

// 修改试产申请
export function trialApplyUpdate(data) {
  return request({
    url: '/trial/apply/update',
    method: 'put',
    data
  })
}

// 删除试产申请
export function trialApplyDelete(id) {
  return request({
    url: `/trial/apply/delete/${id}`,
    method: 'delete'
  })
}

// 初审
export function trialApplyFirstAudit(data) {
  return request({
    url: '/trial/apply/first/audit',
    method: 'put',
    data
  })
}

// 会审
export function trialApplySecondAudit(data) {
  return request({
    url: '/trial/apply/second/audit',
    method: 'put',
    data
  })
}

// 会审字段状态更新
export function trialApplyFieldState(data) {
  return request({
    url: '/trial/apply/field/state',
    method: 'put',
    data
  })
}

// PMC审
export function trialApplyThirdAudit(data) {
  return request({
    url: '/trial/apply/third/audit',
    method: 'put',
    data
  })
}

// 终审
export function trialApplyFinalAudit(data) {
  return request({
    url: '/trial/apply/final/audit',
    method: 'put',
    data
  })
}

// 启用/禁用
export function trialApplyAuth(data) {
  return request({
    url: '/trial/apply/auth',
    method: 'put',
    data
  })
}

// 人员管理编辑
export function trialApplyPersonnelEdit(data) {
  return request({
    url: '/trial/apply/personnel/edit',
    method: 'put',
    data
  })
}

// 获取人员列表
export function trialApplyPersonList(params) {
  return request({
    url: '/trial/apply/personnel/list',
    method: 'get',
    params
  })
}
