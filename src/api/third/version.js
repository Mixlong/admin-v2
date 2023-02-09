import request from '@/utils/request';

// 查询仪表列表
export function listComputer(params) {
  return request({
    url: '/version/manage/list',
    method: 'get',
    params,
  });
}

// 查询仪表详情
export function detailComputer(query) {
  return request({
    url: '/computer/' + query,
    method: 'get',
  });
}

export function listModelDict(query) {
  return request({
    url: '/computer/dict/list',
    method: 'get',
    params: query,
  });
}

// 启用/禁用仪表
export function authComputer(data) {
  return request({
    url: '/version/manage/auth',
    method: 'put',
    data
  });
}

// 创建仪表
export function addComputer(data) {
  return request({
    url: '/version/manage/save',
    method: 'post',
    data
  });
}

// 编辑仪表
export function editComputer(data) {
  return request({
    url: '/version/manage/update',
    method: 'put',
    data
  });
}

export function selectComputer(data) {
  return request({
    url: '/computer/select',
    method: 'post',
    data: data,
  });
}

// 启用、禁用
export function changeStatus(data) {
  return request({
    url: '/version/manage/operation',
    method: 'put',
    data
  });
}

// 根据名称获取型号
export function computerName(name) {
  return request({
    url: `/computer/name/${name}`,
    method: 'get'
  });
}

