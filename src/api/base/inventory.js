import request from '@/utils/request'

// 获取来料编码列表
export function getInventoryList(params) {
  return request({
    url: '/base/inventory/info/list',
    method: 'get',
    params
  })
}

// 获取供应商列表
export function getSuppliersList(params) {
  return request({
    url: '/base/inventory/suppliers',
    method: 'get',
    params
  })
}

// 导出来料记录
export function exportInventoryInfo(params) {
  return request({
    url: '/base/inventory/info/export',
    method: 'get',
    params
    // 注意：不设置responseType，因为返回的是JSON格式包含文件ID
  })
}
