import request from '@/utils/request'

// 获取不良处理记录列表
export function getIqcDefectProcessingList(params) {
  return request({
    url: '/base/adverse/handler/notice/list',
    method: 'get',
    params
  })
}

// 获取不良处理记录详情
export function getIqcDefectProcessingById(id) {
  return request({
    url: `/base/inventory/info//${id}`,
    method: 'get'
  })
}

// 新增不良处理记录
export function addIqcDefectProcessing(data) {
  return request({
    url: '/base/adverse/handler/notice',
    method: 'post',
    data
  })
} 
// 修改不良处理记录
export function updateIqcDefectProcessing(data) {
  return request({
    url: '/base/adverse/handler/notice',
    method: 'put',
    data
  })
}

// 删除不良处理记录
export function deleteIqcDefectProcessing(id) {
  return request({
    url: `/base/adverse/handler/notice/${id}`,
    method: 'delete'
  })
}
 

 

// 获取不良处理通知详情
export function getDefectHandlerNoticeInfo(id) {
  return request({
    url: `/base/adverse/handler/notice/info/${id}`,
    method: 'get'
  })
}
// 不良处理通知会审
export function defectHandlerNoticeFieldState(data) {
  return request({
    url: '/base/adverse/handler/notice/field/state',
    method: 'put',
    data
  })
}

// 不良处理通知处理状态更新
export function defectHandlerNoticeHandlerState(data) {
  return request({
    url: '/base/adverse/handler/notice/handler/state',
    method: 'post',
    data
  })
}

// 获取ECN人员列表
export function getDefectHandlerPersonnelList(params) {
  return request({
    url: '/base/adverse/handler/notice/personnel/list',
    method: 'get',
    params
  })
}

// ECN人员管理编辑
export function editDefectHandlerPersonnel(data) {
  return request({
    url: '/base/adverse/handler/notice/personnel/edit',
    method: 'put',
    data
  })
}