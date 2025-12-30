import request from '@/utils/request'

// 分页查询来料入库列表
export function getIncomingMaterialList(params) {
  return request({
    url: '/base/incoming/material/list',
    method: 'get',
    params
  })
}

// 查询来料入库详情
export function getIncomingMaterialDetail(id) {
  return request({
    url: `/base/incoming/material/detail/${id}`,
    method: 'get'
  })
}

// 新增来料入库
export function addIncomingMaterial(data) {
  return request({
    url: '/base/incoming/material/add',
    method: 'post',
    data
  })
}

// 修改来料入库
export function updateIncomingMaterial(data) {
  return request({
    url: '/base/incoming/material/update',
    method: 'put',
    data
  })
}

// 删除来料入库
export function deleteIncomingMaterial(id) {
  return request({
    url: `/base/incoming/material/delete/${id}`,
    method: 'delete'
  })
}
