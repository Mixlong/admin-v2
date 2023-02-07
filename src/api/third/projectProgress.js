import request from '@/utils/request'

export function listProjectProgress(query) {
  return request({
    url: '/project/progress/list',
    method: 'get',
    params: query
  })
}



export function editProjectProgress(data) {
  return request({
    url: '/project/progress',
    method: 'put',
    data: data
  })
}


export function addProjectProgress(data) {
  return request({
    url: '/project/progress',
    method: 'post',
    data: data
  })
}

export function delProjectProgress(data) {
  return request({
    url: '/project/progress/del',
    method: 'delete',
    data: data
  })
}
