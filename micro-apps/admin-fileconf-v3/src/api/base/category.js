import request from '@/utils/request'

// 品类列表
export function listCategory(query) {
  return request({
    url: '/category/list',
    method: 'get',
    params: query
  })
}

// 品类字典（全部）
export function typeCategory(query) {
  return request({
    url: '/category/dict',
    method: 'get',
    params: query
  })
}

// 品类详情
export function getCategory(id) {
  return request({
    url: '/category/' + id,
    method: 'get'
  })
}

// 新增品类
export function addCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

// 修改品类
export function updateCategory(data) {
  return request({
    url: '/category',
    method: 'put',
    data
  })
}

// 型号列表
export function listModel(query) {
  return request({
    url: '/computer/list',
    method: 'get',
    params: query
  })
}

// 型号字典
export function typeModel(query) {
  return request({
    url: '/computer/dict',
    method: 'get',
    params: query
  })
}

// 品类+型号联合字典（品类包含 computerList）
export function typeCategoryWithModels() {
  return request({
    url: '/file/category/computer',
    method: 'get'
  })
}
