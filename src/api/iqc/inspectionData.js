import request from '@/utils/request'

// 获取来料记录列表
export function getIqcInspectionDataList(params) {
  return request({
    url: '/base/inventory/info/list',
    method: 'get',
    params
  })
}

// 获取来料记录详情
export function getIqcInspectionDataById(id) {
  return request({
    url: `/base/inventory/info/info/${id}`,
    method: 'get'
  })
}

// 新增来料记录
export function addIqcInspectionData(data) {
  return request({
    url: '/base/inventory/info',
    method: 'post',
    data
  })
}

// 修改来料记录
export function updateIqcInspectionData(data) {
  return request({
    url: '/base/inventory/info',
    method: 'put',
    data
  })
}

// 删除来料记录
export function deleteIqcInspectionData(id) {
  return request({
    url: `/base/inventory/info/${id}`,
    method: 'delete'
  })
}

// 删除来料记录
export function getDetailInfo(id) {
  return request({
    url: `/base/inventory/info/info/${id}`,
    method: 'get'
  })
}