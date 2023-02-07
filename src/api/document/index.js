import request from '@/utils/request';

//  新增api标题
export function addApi (data) {
  return request ({
    url: '/api',
    method: 'post',
    data,
  });
}

export function updateApi (data) {
  return request ({
    url: '/api',
    method: 'put',
    data,
  });
}
export function addList (params) {
  return request ({
    url: '/api/list',
    method: 'get',
    params,
  });
}

export function docDetail (params) {
  return request ({
    url: '/api/doc/' + params,
    method: 'get',
    params,
  });
}

export function docAdd (data) {
  return request ({
    url: '/api/doc',
    method: 'post',
    data,
  });
}

export function docUpdate (data) {
  return request ({
    url: '/api/doc',
    method: 'put',
    data,
  });
}

export function apiAuth (data) {
  return request ({
    url: '/api/del/' + data,
    method: 'delete',
  });
}
