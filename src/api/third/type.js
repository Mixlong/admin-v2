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



/**
 * 送样软件属性
 */

export function sampleTypeList(params) {
  return request({
    url: "/type/sample/list",
    method: "get",
    params
  })
}

export function sampleTypeSave(data) {
  return request({
    url: '/type/sample/save',
    method: 'post',
    data
  })
}

export function sampleTypeEdit(data) {
  return request({
    url: '/type/sample/update',
    method: 'put',
    data
  })
}

export function sampleTypeDel(data) {
  return request({
    url: '/type/sample/delete',
    method: 'delete',
    data
  })
}

