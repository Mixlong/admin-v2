import request from '@/utils/request'

export function listType(params) {
  return request({
    url: '/version/list',
    method: 'get',
    params
  })
}

export function listRoleType() {
  return request({
    url: '/version/role/list',
    method: 'get'
  })
}


export function detailType(query) {
  return request({
    url: '/version/' + query,
    method: 'get',
  })
}

export function authType(data) {
  return request({
    url: '/version/auth',
    method: 'put',
    data
  })
}

export function addType(data) {
  return request({
    url: '/version/save',
    method: 'post',
    data
  })
}

export function editType(data) {
  return request({
    url: '/version/update',
    method: 'put',
    data
  })
}

