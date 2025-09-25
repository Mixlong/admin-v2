import request from '@/utils/request'

// 获取供应商字典列表
export function getSupplierDict() {
  return request({
    url: '/system/dict/data/type/cable_suppliers',
    method: 'get'
  })
}

// 添加供应商字典
export function addSupplierDict(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: {
      ...data,
      dictType: 'cable_suppliers'
    }
  })
}

// 更新供应商字典
export function updateSupplierDict(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: {
      ...data,
      dictType: 'cable_suppliers'
    }
  })
}

// 删除供应商字典
export function deleteSupplierDict(dictCode) {
  return request({
    url: `/system/dict/data/${dictCode}`,
    method: 'delete'
  })
}

// 获取线缆成本列表
export function getCableCostList(params) {
  return request({
    url: '/cost/cable/list',
    method: 'get',
    params
  })
}

// 删除线缆成本
export function deleteCableCosts(ids) {
  return request({
    url: '/cost/del/cable',
    method: 'put',
    data: ids.map(id => ({
      id:id+'',
      status: 1,
      why: '用户手动删除'
    }))
  })
}

// 新增线缆成本
export function addCableCost(data) {
  return request({
    url: '/cost/save/cable',
    method: 'put',
    data
  })
}

// 更新线缆成本
export function updateCableCost(data) {
  return request({
    url: '/cost/edit/cable',
    method: 'put',
    data
  })
}

// 根据ID获取线缆成本详情
export function getCableCostById(id) {
  return request({
    url: `/cost/cable/info/${id}`,
    method: 'get'
  })
}

// 获取供应商列表
export function getSupplierList() {
  return request({
    url: '/cable-cost/suppliers',
    method: 'get'
  })
}

// 新增供应商
export function addSupplier(data) {
  return request({
    url: '/cable-cost/supplier',
    method: 'post',
    data
  })
}

// 编辑供应商
export function updateSupplier(data) {
  return request({
    url: '/cable-cost/supplier',
    method: 'put',
    data
  })
}

// 删除供应商
export function deleteSupplier(id) {
  return request({
    url: `/cable-cost/supplier/${id}`,
    method: 'delete'
  })
}

// 批量导入线缆成本
export function importCableCost(data) {
  return request({
    url: '/cost/cable/import',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载导入模板
export function downloadCableCostTemplate() {
  return request({
    url: '/cable-cost/template',
    method: 'get',
    responseType: 'blob'
  })
}

// 导出线缆成本数据
export function exportCableCost(params) {
  return request({
    url: '/cable-cost/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}