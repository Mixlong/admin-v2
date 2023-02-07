import request from '@/utils/request'

export function listType(query) {
  return request({
    url: '/type/list',
    method: 'get',
    params: query
  })
}

export function listRoleType() {
  return request({
    url: '/type/role/list',
    method: 'get'
  })
}


export function detailType(query) {
  return request({
    url: '/type/' + query,
    method: 'get',
  })
}

export function authType(data) {
  return request({
    url: '/type/auth',
    method: 'put',
    data: data
  })
}

export function addType(data) {
  return request({
    url: '/type',
    method: 'post',
    data: data
  })
}

export function editType(data) {
  return request({
    url: '/type',
    method: 'put',
    data: data
  })
}

