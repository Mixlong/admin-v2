import request from '@/utils/request'

// 获取设备成本列表
export function getDeviceCostList(params) {
  return request({
    url: '/cost/device/list',
    method: 'get',
    params
  })
}

// 获取设备成本详情
export function getDeviceCostById(id) {
  return request({
    url: `/cost/device/info/${id}`,
    method: 'get'
  })
}

// 编辑设备成本
export function updateDeviceCost(data) {
  return request({
    url: '/cost/edit/device',
    method: 'put',
    data
  })
}

// 批量删除设备成本
export function batchDeleteDeviceCost(data) {
  return request({
    url: '/cost/del/device',
    method: 'put',
    data
  })
}
 

// 删除成本项
export function deleteCostItem(id) {
  return request({
    url: `/device-cost/cost-item/${id}`,
    method: 'delete'
  })
}

// 批量导入设备成本
export function importDeviceCost(data) {
  return request({
    url: '/cost/device/import',
    method: 'put',
    data
  })
}

// 下载导入模板
export function downloadTemplate() {
  return request({
    url: '/cost/device/template',
    method: 'get',
    responseType: 'blob'
  })
}

// 导出设备成本数据
export function exportDeviceCost(params) {
  return request({
    url: '/device-cost/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 新增设备成本
export function addDeviceCost(data) {
  return request({
    url: '/cost/add/device',
    method: 'post',
    data
  })
}