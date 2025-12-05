import request from '@/utils/request'

/**
 * 分页查询售后问题处理列表
 */
export function afterProblemList(params) {
  return request({
    url: '/after/problem/list',
    method: 'get',
    params
  })
}

/**
 * 查询售后问题处理详情
 */
export function afterProblemDetail(id) {
  return request({
    url: `/after/problem/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增售后问题处理
 */
export function afterProblemAdd(data) {
  return request({
    url: '/after/problem/add',
    method: 'post',
    data
  })
}

/**
 * 修改售后问题处理
 */
export function afterProblemUpdate(data) {
  return request({
    url: '/after/problem/update',
    method: 'put',
    data
  })
}

/**
 * 删除售后问题处理
 */
export function afterProblemDelete(id) {
  return request({
    url: `/after/problem/delete/${id}`,
    method: 'delete'
  })
}

