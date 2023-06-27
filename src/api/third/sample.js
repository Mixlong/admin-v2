import request from '@/utils/request';

export function sampleList(query) {
  return request({
    url: '/sample/list',
    method: 'get',
    params: query,
  });
}

export function sampleDetail(query) {
  return request({
    url: '/sample/detail/' + query,
    method: 'get',
    params: query,
  });
}

export function sampleAdd(query) {
  return request({
    url: '/sample',
    method: 'post',
    data: query,
  });
}

export function sampleUpdate(query) {
  return request({
    url: '/sample',
    method: 'put',
    data: query,
  });
}

export function sampleAuth(query) {
  return request({
    url: '/sample/auth',
    method: 'put',
    data: query,
  });
}

export function sampleState(query) {
  return request({
    url: '/sample/state',
    method: 'put',
    data: query,
  });
}

// 获取送样单号列表
export function sampleNumberList(params) {
  return request({
    url: '/sample/number/list',
    method: 'get',
    params
  });
}

// 获取送样单号列表
export function sampleNumber() {
  return request({
    url: '/sample/number',
    method: 'get'
  });
}



// 线缆台账
export function sampleCable_list(params) {
  return request({
    url: '/sample/cable/list',
    method: 'get',
    params,
  });
}

export function sampleCable_add(data) {
  return request({
    url: '/sample/cable',
    method: 'post',
    data
  });
}

export function sampleCable_update(data) {
  return request({
    url: '/sample/cable',
    method: 'put',
    data,
  });
}

export function sampleCable_log(query, params) {
  return request({
    url: '/sample/cable/log/' + query,
    method: 'get',
    params
  });
}

export function sampleCable_action(data) {
  return request({
    url: '/sample/cable/action',
    method: 'put',
    data
  });
}

// 配件台账
export function sampleParts_list(params) {
  return request({
    url: '/sample/parts/list',
    method: 'get',
    params,
  });
}

export function sampleParts_add(data) {
  return request({
    url: '/sample/parts',
    method: 'post',
    data
  });
}

export function sampleParts_update(data) {
  return request({
    url: '/sample/parts',
    method: 'put',
    data,
  });
}

export function sampleParts_log(query, params) {
  return request({
    url: '/sample/parts/log/' + query,
    method: 'get',
    params
  });
}

export function sampleParts_action(data) {
  return request({
    url: '/sample/parts/action',
    method: 'put',
    data
  });
}


//样品台账
export function specification_add(data) {
  return request({
    url: '/sample/specification',
    method: 'post',
    data
  });
}

export function specification_update(data) {
  return request({
    url: '/sample/specification',
    method: 'put',
    data,
  });
}

export function specification_action(data) {
  return request({
    url: '/sample/specification/action',
    method: 'put',
    data
  });
}

export function specification_detail(query) {
  return request({
    url: '/sample/specification/detail' + query,
    method: 'get',
    data: query,
  });
}


export function specification_list(params) {
  return request({
    url: '/sample/specification/list',
    method: 'get',
    params
  });
}

export function specification_log(query, params) {
  return request({
    url: '/sample/specification/log/' + query,
    method: 'get',
    params
  });
}

export function listCustomer(query) {
  return request({
    url: '/sample/list/customer',
    method: 'get',
    params: query,
  });
}


// 组装料台账
export function material_add(data) {
  return request({
    url: '/sample/material',
    method: 'post',
    data
  });
}

export function material_update(data) {
  return request({
    url: '/sample/material',
    method: 'put',
    data,
  });
}

export function material_action(data) {
  return request({
    url: '/sample/material/action',
    method: 'put',
    data
  });
}

export function material_detail(query) {
  return request({
    url: '/sample/material/detail' + query,
    method: 'get',
    data: query
  });
}


export function material_list(params) {
  return request({
    url: '/sample/material/list',
    method: 'get',
    params
  });
}

export function material_log(query, params) {
  return request({
    url: '/sample/material/log/' + query,
    method: 'get',
    params
  });
}


//送样申请

export function sampleApply(query) {
  return request({
    url: '/sample/apply/save',
    method: 'post',
    isToken: false,
    data: query
  });
}


export function sampleApplyList(query) {
  return request({
    url: '/sample/apply/list',
    method: 'get',
    params: query,
  });
}



export function sampleApplyState(query) {
  return request({
    url: '/sample/apply/state',
    method: 'put',
    data: query,
  });
}


export function sampleApplyAuth(query) {
  return request({
    url: '/sample/apply/auth',
    method: 'put',
    data: query,
  });
}


// 获取图片列表
export function sampleImgList() {
  return request({
    url: 'sample/apply/img/list',
    method: 'get',
    isToken: false
  });
}
