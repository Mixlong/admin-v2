import request from '@/utils/request';

// 列表
export function schedulingList (query) {
  return request ({
    url: '/scheduling/plan/list',
    method: 'get',
    params: query,
  });
}

// 创建
export function schedulingCreate (data) {
  return request ({
    url: '/scheduling/plan/create',
    method: 'post',
    data
  });
}

// 修改
export function schedulingEdit (data) {
  return request ({
    url: '/scheduling/plan/edit',
    method: 'put',
    data
  });
}

export function schedulingOperation (data) {
  return request ({
    url: '/scheduling/plan/operation',
    method: 'put',
    data
  });
}

// 产线编号
export function schedulingProduct () {
  return request ({
    url: '/scheduling/plan/product',
    method: 'get'
  });
}

// 获取销售订单号
export function  getScheDulingPlanList() {
  return request ({
    url: '/scheduling/plan/order/list',
    method: 'get'
  });
}

// 导出参数
export function exportConfig(query) {
  return request({
    url: '/scheduling/plan/export/list',
    method: 'get',
    params: query
  })
}