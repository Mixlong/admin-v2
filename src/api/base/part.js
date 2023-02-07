import request from '@/utils/request'

export function listPartInfo(query) {
  return request({
    url: '/partinfo/list',
    method: 'get',
    params: query
  })
}

export function exportPartInfo(query) {
  return request({
    url: '/partinfo/export/list',
    method: 'get',
    params: query
  })
}



