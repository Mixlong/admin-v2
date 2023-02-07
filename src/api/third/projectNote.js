import request from '@/utils/request'

export function listProjectNote(query) {
  return request({
    url: '/project/note/list',
    method: 'get',
    params: query
  })
}

export function readProjectNote(query) {
  return request({
    url: '/project/note/read',
    method: 'get',
    params: query
  })
}

export function checkReadProjectNote(query) {
  return request({
    url: '/project/note/check/read',
    method: 'get',
    params: query
  })
}



export function editProjectNote(data) {
  return request({
    url: '/project/note',
    method: 'put',
    data: data
  })
}


export function addProjectNote(data) {
  return request({
    url: '/project/note',
    method: 'post',
    data: data
  })
}

export function delProjectNote(data) {
  return request({
    url: '/project/note/del',
    method: 'delete',
    data: data
  })
}

