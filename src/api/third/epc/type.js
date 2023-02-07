import request from '@/utils/request'

export function listType(params) {
  return request({
    url: '/project/third/list',
    method: 'get',
    params
  })
}

export function listRoleType() {
  return request({
    url: '/project/third/role/list',
    method: 'get'
  })
}


export function detailType(query) {
  return request({
    url: '/project/third/' + query,
    method: 'get',
  })
}

export function authType(data) {
  return request({
    url: '/project/third/auth',
    method: 'put',
    data
  })
}

export function addType(data) {
  return request({
    url: '/project/third',
    method: 'post',
    data
  })
}

export function editType(data) {
  return request({
    url: '/project/third',
    method: 'put',
    data
  })
}

