import request from '@/utils/request'

// 获取出货订单列表
export function getShipmentOrderList(params) {
  return request({
    url: '/shipment/order/list',
    method: 'get',
    params
  })
}

// 获取出货订单详情
export function getShipmentOrderById(id) {
  return request({
    url: `/shipment/order/info/${id}`,
    method: 'get'
  })
}

// 新增出货订单
export function addShipmentOrder(data) {
  return request({
    url: '/shipment/order/add',
    method: 'post',
    data
  })
}

// 编辑出货订单
export function updateShipmentOrder(data) {
  return request({
    url: '/shipment/order/edit',
    method: 'put',
    data
  })
}

// 删除出货订单
export function deleteShipmentOrder(ids) {
  return request({
    url: '/shipment/order/delete',
    method: 'delete',
    data: ids
  })
}

// 批量删除出货订单
export function batchDeleteShipmentOrder(ids) {
  return request({
    url: '/shipment/order/batch/delete',
    method: 'delete',
    data: ids
  })
}

// 获取客户列表（字典）
export function getCustomerDict() {
  return request({
    url: '/system/dict/data/type/customer_name',
    method: 'get'
  })
}

// 获取订单状态字典
export function getOrderStatusDict() {
  return request({
    url: '/system/dict/data/type/order_status',
    method: 'get'
  })
}

// 导出出货订单
export function exportShipmentOrder(params) {
  return request({
    url: '/shipment/order/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
