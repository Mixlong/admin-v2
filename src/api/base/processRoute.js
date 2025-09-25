import request from '@/utils/request'

// 查询工艺路线列表
export function listProcessRoute(query) {
  return request({
    url: '/base/processRoute/list',
    method: 'get',
    params: query
  })
}

// 查询工艺路线详细
export function getProcessRoute(id) {
  return request({
    url: `/base/processRoute/${id}`,
    method: 'get'
  })
}

// 新增工艺路线
export function addProcessRoute(data) {
  return request({
    url: '/base/processRoute',
    method: 'post',
    data: data
  })
}

// 修改工艺路线
export function updateProcessRoute(data) {
  return request({
    url: '/base/processRoute',
    method: 'put',
    data: data
  })
}

// 删除工艺路线
export function delProcessRoute(ids) {
  return request({
    url: `/base/processRoute/${ids}`,
    method: 'delete'
  })
}