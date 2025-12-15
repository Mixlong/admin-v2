import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}

// ==================== 无需权限的公开接口 ====================

// 查询字典数据列表（无需权限）
export function listDataPublic(query) {
  return request({
    url: '/system/dict/data/public/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细（无需权限）
export function getDataPublic(dictCode) {
  return request({
    url: '/system/dict/data/public/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息（无需权限）
export function getDictsPublic(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新增字典数据（无需权限）
export function addDataPublic(data) {
  return request({
    url: '/system/dict/data/public/add',
    method: 'post',
    data: data
  })
}

// 修改字典数据（无需权限）
export function updateDataPublic(data) {
  return request({
    url: '/system/dict/data/public/update',
    method: 'put',
    data: data
  })
}

// 删除字典数据（无需权限）
export function delDataPublic(dictCode) {
  return request({
    url: '/system/dict/data/public/delete/' + dictCode,
    method: 'delete'
  })
}
