import request from '@/utils/request'

// 获取质量异常列表
export function getQualityIssueList(params) {
  return request({
    url: '/base/quality/issue/list',
    method: 'get',
    params
  })
}

// 获取质量异常详情
export function getQualityIssueById(id) {
  return request({
    url: `/base/quality/issue/info/${id}`,
    method: 'get'
  })
}

// 新增质量异常
export function addQualityIssue(data) {
  return request({
    url: '/base/quality/issue',
    method: 'post',
    data
  })
}

// 修改质量异常
export function updateQualityIssue(data) {
  return request({
    url: '/base/quality/issue',
    method: 'put',
    data
  })
}

// 订单查询接口
export function getOrderList(params) {
  return request({
    url: '/order/management/order/list',
    method: 'get',
    params
  })
}

// 删除质量异常
export function deleteQualityIssue(id) {
  return request({
    url: `/base/quality/issue/${id}`,
    method: 'delete'
  })
}

// 修改质量异常状态
export function updateQualityIssueStatus(data) {
  return request({
    url: '/base/quality/issue/status',
    method: 'post',
    data
  })
}

// 导出质量异常数据
export function exportQualityIssue(params) {
  return request({
    url: '/base/quality/issue/export',
    method: 'get',
    params
  })
}

 