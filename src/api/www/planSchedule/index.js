import request from '@/utils/request';

// 列表
export function schedulingList(params) {
  return request({
    url: '/production/scheduling/list',
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