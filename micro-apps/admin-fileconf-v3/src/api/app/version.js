import request from '@/utils/request'

// 版本列表
export function getVersionList(params) {
  // 转换分页参数：pageNum -> p, pageSize -> l
  const { pageNum, pageSize, ...rest } = params || {}
  return request({
    url: '/app/version/list',
    method: 'get',
    params: {
      p: pageNum || 1,
      l: pageSize || 10,
      ...rest
    }
  })
}

// 版本详情
export function getVersionDetail(id) {
  return request({
    url: `/app/version/detail/${id}`,
    method: 'get'
  })
}

// 新建版本
export function createVersion(data) {
  return request({
    url: '/app/version/add',
    method: 'post',
    data
  })
}

// 编辑版本
export function updateVersion(data) {
  return request({
    url: '/app/version/update',
    method: 'put',
    data
  })
}

// 删除版本
export function deleteVersion(id) {
  return request({
    url: `/app/version/delete/${id}`,
    method: 'delete'
  })
}

// 发布版本
export function publishVersion(id) {
  return request({
    url: `/app/version/publish/${id}`,
    method: 'post'
  })
}

// 禁用版本
export function disableVersion(id) {
  return request({
    url: `/app/version/disable/${id}`,
    method: 'post'
  })
}

// 检查更新（App端调用）
export function checkVersion(params) {
  return request({
    url: '/app/version/check',
    method: 'get',
    params
  })
}
