import request from '@/utils/request'

// 品类不良统计报表
export function getCategoryReport(params) {
  return request({
    url: '/base/inventory/info/report/category',
    method: 'get',
    params
  })
}

// 每日不良统计报表
export function getDailyReport(params) {
  return request({
    url: '/base/inventory/info/report/daily',
    method: 'get',
    params
  })
}

// 每月不良统计报表
export function getMonthlyReport(params) {
  return request({
    url: '/base/inventory/info/report/monthly',
    method: 'get',
    params
  })
}

// 供应商不良统计报表
export function getSupplierReport(params) {
  return request({
    url: '/base/inventory/info/report/supplier',
    method: 'get',
    params
  })
}

// 供应商列表
export function getSupplierList(params) {
  return request({
    url: '/base/inventory/info/supplier/list',
    method: 'get',
    params
  })
}
 