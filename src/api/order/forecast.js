import request from '@/utils/request';

/**
 * 获取预测订单列表
 * @param {Object} params
 */
export function getForecastList(params) {
  return request({
    url: '/order/forecast/list',
    method: 'get',
    params,
  });
}

/**
 * 获取预测订单详情
 * @param {string|number} id
 */
export function getForecastInfo(id) {
  return request({
    url: `/order/forecast/${id}`,
    method: 'get',
  });
}

/**
 * 新增预测订单
 * @param {Object} data
 */
export function createForecast(data) {
  return request({
    url: '/order/forecast',
    method: 'post',
    data,
  });
}

/**
 * 更新预测订单
 * @param {Object} data
 */
export function updateForecast(data) {
  return request({
    url: '/order/forecast',
    method: 'put',
    data,
  });
}

/**
 * 删除预测订单
 * @param {string|number} id
 */
export function deleteForecast(id) {
  return request({
    url: `/order/forecast/${id}`,
    method: 'delete',
  });
}
