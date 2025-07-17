import request from '@/utils/request'

// 出库料记录列表
export function materialHouseList(params) {
  return request({
    url: '/materials/house/list',
    method: 'get',
    params
  })
}

// 导出出库料记录
export function materialHouseExport(params) {
  return request({
    url: '/materials/house/export',
    method: 'get',
    params
  })
}