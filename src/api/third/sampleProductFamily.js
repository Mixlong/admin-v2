import request from '@/utils/request';

// 查询仪表列表
export function sampleListComputer (params) {
  return request ({
    url: '/sample/computer/list',
    method: 'get',
    params,
  });
}

// 查询仪表详情
export function detailSampleComputer (query) {
  return request ({
    url: '/sample/computer/' + query,
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
export function authSampleComputer (data) {
  return request ({
    url: '/sample/computer/auth',
    method: 'put',
    data,
  });
}

// 创建仪表
export function addSampleComputer (data) {
  return request ({
    url: '/sample/computer',
    method: 'post',
    data,
  });
}

// 编辑仪表
export function editSampleComputer (data) {
  return request ({
    url: '/sample/computer',
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
export function changeSampleStatus (data) {
  return request ({
    url: '/sample/computer/operation',
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

// 样品转生产
export function sampleToProduct (data) {
  return request ({
    url: '/sample/computer/to/product',
    method: 'put',
    data
  });
}