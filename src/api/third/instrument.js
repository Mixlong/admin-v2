import request from '@/utils/request';

export function instrumentList (query) {
  return request ({
    url: '/instrument/list',
    method: 'get',
    params: query,
  });
}

export function instrumentAdd (query) {
  return request ({
    url: '/instrument',
    method: 'post',
    data: query,
  });
}
export function instrumentExport (query) {
  return request ({
    url: '/instrument/export',
    method: 'get',
    params: query,
  });
}

export function instrumentUpdate (query) {
  return request ({
    url: '/instrument',
    method: 'put',
    data: query,
  });
}
export function instrumentAuth (query) {
  return request ({
    url: '/instrument/auth',
    method: 'put',
    data: query,
  });
}

export function instrumentState (query) {
  return request ({
    url: '/instrument/state',
    method: 'put',
    data: query,
  });
}
