import request from '@/utils/request'

// 获取维修记录列表
export function getMaintenanceRecordList(params) {
  return request({
    url: '/base/repair/record/list',
    method: 'get',
    params
  })
}

// 获取维修记录详情
export function getMaintenanceRecordById(id) {
  return request({
    url: `/base/repair/record/info/${id}`,
    method: 'get'
  })
}

// 新增维修记录
export function addMaintenanceRecord(data) {
  return request({
    url: '/base/repair/record',
    method: 'post',
    data
  })
}

// 修改维修记录
export function updateMaintenanceRecord(data) {
  return request({
    url: '/base/repair/record',
    method: 'put',
    data
  })
}

// 删除维修记录
export function deleteMaintenanceRecord(id) {
  return request({
    url: `/base/repair/record/${id}`,
    method: 'delete'
  })
}

// 导出维修记录数据
export function exportMaintenanceRecord(params) {
  return request({
    url: '/base/repair/record/export',
    method: 'get',
    params
  })
}

// ==================== 外协维修记录相关接口 ====================

// 获取外协维修记录列表
export function getOutsourcingRecordList(params) {
  return request({
    url: '/base/repair/record/list/outsourcing',
    method: 'get',
    params
  })
}

// 导出外协维修记录数据
export function exportOutsourcingRecord(params) {
  return request({
    url: '/base/repair/record/export/outsourcing',
    method: 'get',
    params
  })
}