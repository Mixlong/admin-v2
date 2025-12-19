import request from '@/utils/request'

// 查询操作日志列表
export function list(query) {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  })
}

// 删除操作日志
export function delOperlog(operId) {
  return request({
    url: '/monitor/operlog/' + operId,
    method: 'delete'
  })
}

// 清空操作日志
export function cleanOperlog() {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete'
  })
}

// 导出操作日志
export function exportOperlog(query) {
  return request({
    url: '/monitor/operlog/export',
    method: 'get',
    params: query
  })
}

// 获取业务操作历史（带变更详情）
export function getOperLogHistory(businessId) {
  return request({
    url: `/monitor/operlog/history/${businessId}`,
    method: 'get'
  })
}

// 添加操作日志
export function addOperLog(data) {
  return request({
    url: '/monitor/operlog',
    method: 'post',
    data: data
  })
}