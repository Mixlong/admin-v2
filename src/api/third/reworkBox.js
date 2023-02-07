import request from '@/utils/request';

export function reworkList(params) {
  return request({
    url: '/rework/list',
    method: 'get',
    params
  });
}

export function reworkAdd(data) {
  return request({
    url: '/rework/save',
    method: 'post',
    data
  });
}

export function remorkUpdate(data) {
  return request({
    url: '/rework/update',
    method: 'put',
    data
  });
}

export function remorkProgress(data) {
  return request({
    url: '/rework/process',
    method: 'put',
    data
  });
}

export function reworkBoxList(params) {
  return request({
    url: '/rework/box/list',
    method: 'get',
    params
  });
}

export function reworkOrderList(params) {
  return request({
    url: '/rework/order/list',
    method: 'get',
    params
  });
}

export function reworkDel(id) {
  return request({
    url: '/rework/delete/' + id,
    method: 'delete'
  });
}

