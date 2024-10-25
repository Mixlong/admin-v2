import request from '@/utils/request'

// 接口加密列表
export function apiKeyList(params) {
  return request({
    url: '/key/list',
    method: 'get',
    params
  })
}

// 新增接口加密
export function addKeySave(data) {
  return request({
    url: '/key/save',
    method: 'post',
    data
  })
}

// 修改参数配置
export function updateKeyApi(data) {
  return request({
    url: '/key/update',
    method: 'put',
    data
  })
}