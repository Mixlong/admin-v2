import request from '@/utils/request';

// 模块列表
export function pucsList(query) {
  return request({
    url: '/pucs/list',
    method: 'get',
    params: query,
  });
}

export function updatePucs(data) {
  return request({
    url: '/pucs/update',
    method: 'put',
    data,
  });
}
export function updateDut(data) {
  return request({
    url: '/pucs/update/dut',
    method: 'put',
    data,
  });
}
export function updateFactory(data) {
  return request({
    url: '/pucs/update/factory',
    method: 'put',
    data,
  });
}

export function pucsAuth(data) {
  return request({
    url: '/pucs/auth/status',
    method: 'put',
    data,
  });
}

export function authLine(data) {
  return request({
    url: '/pucs/auth/line',
    method: 'put',
    data,
  });
}
export function pucsDetail(id) {
  return request({
    url: '/pucs/detail/' + id,
    method: 'get',
  });
}

export function dutSend(data) {
  return request({
    url: '/pucs/dut/send',
    method: 'post',
    data,
  });
}


export function pucsLoad(data) {
  return request({
    url: '/pucs/load',
    method: 'post',
    data,
  });
}
export function pucsState(data) {
  return request({
    url: '/pucs/state',
    method: 'put',
    data,
  });
}
export function getFileName(data) {
  return request({
    url: '/file/' + data,
    method: 'get'
  });
}

export function pucsLoadInfo(data) {
  return request({
    url: '/pucs/load/' + data,
    method: 'get',
  });
}


export function pucsDict() {
  return request({
    url: '/pucs/dict',
    method: 'get'
  });
}

export function pucsVersion() {
  return request({
    url: '/pucs/version',
    method: 'get'
  });
}


