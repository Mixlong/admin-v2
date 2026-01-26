/**
 * 样品管理 API
 */
import request from '@/utils/request'

// 分页查询
export function getSampleList(params) {
  return request({
    url: '/sample/management/page',
    method: 'get',
    params: { p: params.pageNum, l: params.pageSize, ...params }
  })
}

// 查询详情
export function getSampleDetail(id) {
  return request({ url: `/sample/management/detail/${id}`, method: 'get' })
}

// 新增
export function createSample(data) {
  return request({ url: '/sample/management/add', method: 'post', data })
}

// 修改
export function updateSample(data) {
  return request({ url: '/sample/management/update', method: 'put', data })
}

// 删除
export function deleteSample(id) {
  return request({ url: `/sample/management/delete/${id}`, method: 'delete' })
}

// 导出
export function exportSample(params) {
  return request({
    url: '/sample/management/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 完成流程节点
export function completeProcess(data) {
  return request({ url: '/sample/management/complete-process', method: 'put', params: data })
}

// 暂停
export function pauseSample(id) {
  return request({ url: `/sample/management/pause/${id}`, method: 'put' })
}

// 恢复
export function resumeSample(id) {
  return request({ url: `/sample/management/resume/${id}`, method: 'put' })
}

// 取消
export function cancelSample(id) {
  return request({ url: `/sample/management/cancel/${id}`, method: 'put' })
}

// 批量添加发货记录
export function batchAddDeliveryRecord(sampleManagementId, data) {
  return request({
    url: '/sample/management/batch-add-delivery-record',
    method: 'post',
    params: { sampleManagementId },
    data
  })
}

// 获取流程进展列表
export function getProcessList(sampleManagementId) {
  return request({ url: `/sample/management/process-list/${sampleManagementId}`, method: 'get' })
}

// 获取发货记录列表
export function getDeliveryRecordList(sampleManagementId) {
  return request({ url: `/sample/management/delivery-record-list/${sampleManagementId}`, method: 'get' })
}
