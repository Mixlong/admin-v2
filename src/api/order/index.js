import request from '@/utils/request';

// 列表
export function orderList(query) {
  return request({
    url: '/order/management/so/list',
    method: 'get',
    params: query,
  });
}
export function addOrder(data) {
  return request({
    url: '/order/management/create',
    method: 'post',
    data,
  });
}
export function updateOrder(data) {
  return request({
    url: '/order/management',
    method: 'put',
    data,
  });
}

// 修改日志
export function orderEditLog(params) {
  return request({
    url: '/order/management/log',
    method: 'get',
    params,
  });
}

// 列表
export function deleteOrder(data) {
  return request({
    url: '/order/del',
    method: 'delete',
    data,
  });
}

//box

// 列表
export function boxList(query) {
  return request({
    url: '/order/box/list',
    method: 'get',
    params: query,
  });
}
export function addBox(data) {
  return request({
    url: '/order/box',
    method: 'post',
    data,
  });
}
export function updateBox(data) {
  return request({
    url: '/order/box',
    method: 'put',
    data,
  });
}
// 列表
export function deleteBox(data) {
  return request({
    url: '/order/box/del',
    method: 'delete',
    data,
  });
}

// 新增收货地址
export function addAddress(data) {
  return request({
    url: '/so/address',
    method: 'post',
    data
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/so/customer',
    method: 'post',
    data
  });
}
// 修改客户
export function editCustomer(data) {
  return request({
    url: '/so/customer',
    method: 'put',
    data
  });
}

// 禁用、启用
export function authCustomer(data) {
  return request({
    url: '/so/customer/auth',
    method: 'put',
    data
  });
}


// 收货地址集合
export function addressList(id) {
  return request({
    url: '/so/address/list/' + id,
    method: 'get'
  })
}

// 获取erp编码
export function getErpList(params) {
  return request({
    url: '/computer/erp/list',
    method: 'get',
    params
  })
}

// 根据erp编码获取品类和型号信息
export function getErpManage(no) {
  return request({
    url: '/order/management/erp/' + no,
    method: 'get'
  })
}

// 芯片类型，发货方式
export function getOrderProcess(params) {
  return request({
    url: '/order/management/process',
    method: 'get',
    params
  })
}

// 客户
export function getOrderCusList(params) {
  return request({
    url: '/so/customer/list',
    method: 'get',
    params
  })
}

export function getCustomerList(params) {
  return request({
    url: '/so/customer/admin/list',
    method: 'get',
    params
  })
}

// 订单详情
export function getOrderDetail(id) {
  return request({
    url: '/order/management/detail/' + id,
    method: 'get'
  })
}

// 取消订单
export function orderCancel(id) {
  return request({
    url: '/order/management/cancel/' + id,
    method: 'get'
  })
}

// 审核
export function orderAuth(id) {
  return request({
    url: '/order/management/auth/' + id,
    method: 'get'
  })
}

