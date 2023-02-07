import request from '@/utils/request';

export function addFactory (data) {
  return request ({
    url: '/factory',
    method: 'post',
    data,
  });
}

export function updateFactory (data) {
  return request ({
    url: '/factory',
    method: 'put',
    data,
  });
}

export function authFactory (data) {
  return request ({
    url: '/factory/auth',
    method: 'put',
    data,
  });
}

export function listFactory (params) {
  return request ({
    url: '/factory/list',
    method: 'get',
    params,
  });
}


export function dictFactory (params) {
  return request ({
    url: '/factory/dict/list',
    method: 'get',
    params,
  });
}
 