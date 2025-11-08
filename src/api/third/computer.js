import request from '@/utils/request';

// 查询仪表列表
export function listComputer (query) {
  return request ({
    url: '/computer/list',
    method: 'get',
    params: query,
  });
}

// 查询仪表详情
export function detailComputer (query) {
  return request ({
    url: '/computer/' + query,
    method: 'get',
  });
}

export function listModelDict (query) {
  return request ({
    url: '/computer/dict/list',
    method: 'get',
    params: query,
  });
}

// 启用/禁用仪表
export function authComputer (data) {
  return request ({
    url: '/computer/auth',
    method: 'put',
    data,
  });
}

// 创建仪表
export function addComputer (data) {
  return request ({
    url: '/computer',
    method: 'post',
    data,
  });
}

// 编辑仪表
export function editComputer (data) {
  return request ({
    url: '/computer',
    method: 'put',
    data,
  });
}

export function selectComputer (data) {
  return request ({
    url: '/computer/select',
    method: 'post',
    data,
  });
}

// 启用、禁用
export function changeStatus (data) {
  return request ({
    url: '/computer/operation',
    method: 'put',
    data
  });
}

// 根据名称获取型号
export function computerName (name) {
  return request ({
    url: `/computer/name/${name}`,
    method: 'get'
  });
}

// 包装信息初审
export function packagingFirstAudit(data) {
  return request({
    url: '/model/config/packaging/first/audit',
    method: 'put',
    data
  });
}

// 包装信息终审
export function packagingFinalAudit(data) {
  return request({
    url: '/model/config/packaging/final/audit',
    method: 'put',
    data
  });
}

// 规格书初审
export function specificationFirstAudit(data) {
  return request({
    url: '/model/config/specification/first/audit',
    method: 'put',
    data
  });
}

// 规格书终审
export function specificationFinalAudit(data) {
  return request({
    url: '/model/config/specification/final/audit',
    method: 'put',
    data
  });
}

// 获取型号简单列表（用于BIST关联型号选择）
export function getModelSimpleList(isBist,categoryId) {
  return request({
    url: '/model/config/simple/list',
    method: 'get',
    params: { isBist,categoryId }
  });
}

