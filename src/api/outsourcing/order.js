import request from '@/utils/request'

/**
 * 分页查询外协订单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.p - 页码
 * @param {Number} params.l - 每页大小
 * @param {String} params.purchaseOrderCode - 采购单号
 */
export function getOutsourcingOrderList(params) {
  return request({
    url: '/outsourcing/order/list',
    method: 'get',
    params
 })
}

/**
 * 新增外协订单
 * @param {Object} data - 采购信息
 * @param {String} data.purchaseOrderCode - 采购单号
 * @param {String} data.address - 生产地点
 * @param {String} data.purchaseOrderImg - 采购订单图
 * @param {String} data.purchaseOrderImgName - 采购订单图文件名
 */
export function addOutsourcingOrder(data) {
  return request({
    url: '/outsourcing/order/add',
    method: 'post',
    data
  })
}

/**
 * 发布外协订单
 * @param {String} id - 订单ID
 */
export function publishOrder(id) {
  return request({
    url: `/outsourcing/order/publish/${id}`,
    method: 'put'
  })
}

/**
 * 撤销外协订单
 * @param {String} id - 订单ID
 */
export function cancelOrder(id) {
  return request({
    url: `/outsourcing/order/cancel/${id}`,
    method: 'put'
  })
}

/**
 * 删除外协订单
 * @param {String} id - 订单ID
 */
export function deleteOrder(id) {
  return request({
    url: `/outsourcing/order/${id}`,
    method: 'delete'
  })
}

/**
 * 编辑外协订单
 * @param {Object} data - 订单信息
 * @param {String} data.id - 订单ID
 * @param {String} data.address - 生产地点
 * @param {String} data.purchaseOrderImg - 采购订单图
 */
export function updateOrder(data) {
  return request({
    url: '/outsourcing/order/update',
    method: 'put',
    data
  })
}
