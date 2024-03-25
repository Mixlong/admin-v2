import request from '@/utils/request';

// 列表
export function schedulingList(params) {
  return request({
    url: '/production/scheduling/list',
    method: 'get',
    params
  });
}

// 日志
export function schedulingLog(params) {
  return request({
    url: '/production/scheduling/log',
    method: 'get',
    params
  });
}

// 创建
export function schedulingCreate(data) {
  return request({
    url: '/production/scheduling/save',
    method: 'post',
    data
  });
}

// 修改
export function schedulingEdit(data) {
  return request({
    url: '/production/scheduling/update',
    method: 'put',
    data
  });
}

// 删除
export function schedulingDel(id) {
  return request({
    url: '/production/scheduling/delete/' + id,
    method: 'put'
  });
}

// 方案版本列表
export function scheduleVersion() {
  return request({
    url: "/production/scheduling/version",
    method: 'get'
  })
}

// 生成生产资料
export function createDataFile(id) {
  return request({
    url: `/production/scheduling/create/product/${id}`,
    method: 'post'
  })
}

// 下载生产资料
export function downloadDataFile(id) {
  return request({
    url: `/production/scheduling/download/product/${id}`,
    method: 'post'
  })
}

// 下载资料清单
export function createDataDetail(id) {
  return request({
    url: `/production/scheduling/create/detail/${id}`,
    method: 'post'
  })
}

// 外发生产文件
export function sendProd(id) {
  return request({
    url: `/production/scheduling/send/product/${id}`,
    method: 'post'
  })
}

// 获取资料清单
export function proSecDetail(id) {
  return request({
    url: "/production/scheduling/create/detail/" + id,
    method: 'get'
  })
}




