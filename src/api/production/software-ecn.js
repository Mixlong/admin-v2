import request from '@/utils/request'

// 查询软件ECR/N列表
export function listSoftwareEcn(query) {
  return request({
    url: '/bom/software/list',
    method: 'get',
    params: query
  })
}

// 查询软件ECR/N详细
export function getSoftwareEcn(id) {
  return request({
    url: '/bom/software/detail/' + id,
    method: 'get'
  })
}

// 新增软件ECR/N
export function addSoftwareEcn(data) {
  return request({
    url: '/bom/software',
    method: 'post',
    data: data
  })
}

// 修改软件ECR/N
export function updateSoftwareEcn(data) {
  return request({
    url: '/bom/software',
    method: 'put',
    data: data
  })
}

// 删除软件ECR/N  
export function delSoftwareEcn(id) {
  return request({
    url: '/bom/software/' + id,
    method: 'delete'
  })
}

// 审核软件ECR/N（启用/禁用）
export function auditSoftwareEcn(data) {
  return request({
    url: '/bom/software/auth',
    method: 'put',
    data: data
  })
}

// 批量删除软件ECR/N
export function delSoftwareEcnBatch(ids) {
  return request({
    url: '/bom/software/' + ids,
    method: 'delete'
  })
}

// 导出软件ECR/N
export function exportSoftwareEcn(query) {
  return request({
    url: '/bom/software/export',
    method: 'get',
    params: query
  })
}

// 获取软件ECR/N状态统计
export function getSoftwareEcnStats() {
  return request({
    url: '/bom/software/stats',
    method: 'get'
  })
}

// 软件ECN审核相关API
// 初审
export function softwareEcnFirstState(data) {
  return request({
    url: '/bom/software/first/state',
    method: 'put',
    data
  })
}

// 会审
export function softwareEcnFieldState(data) {
  return request({
    url: '/bom/software/field/state',
    method: 'put',
    data
  })
}

// 终审
export function softwareEcnSecondState(data) {
  return request({
    url: '/bom/software/second/state',
    method: 'put',
    data
  })
}

// ECN人员管理
export function softwareEcnPersonnelEdit(data) {
  return request({
    url: '/bom/software/personnel/edit',
    method: 'put',
    data
  })
}

// ECN人员列表
export function softwareEcnPersonnelList(params) {
  return request({
    url: '/bom/software/personnel/list',
    method: 'get',
    params
  })
}