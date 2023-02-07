import request from '@/utils/request';

export function toolList (query) {
  return request ({
    url: '/tool/list',
    method: 'get',
    params: query,
  });
}

export function toolDetail (id) {
  return request ({
    url: '/tool/' + id,
    method: 'get',
  });
}

export function toolAdd (query) {
  return request ({
    url: '/tool',
    method: 'post',
    data: query,
  });
}

export function toolUpdate (query) {
  return request ({
    url: '/tool',
    method: 'put',
    data: query,
  });
}

export function toolLend (query) {
  return request ({
    url: '/tool/lend',
    method: 'put',
    data: query,
  });
}
export function toolDelete (query) {
  return request ({
    url: '/tool/waste/' + query,
    method: 'put',
    data: query,
  });
}

export function toolReturn (query) {
  return request ({
    url: '/tool/return',
    method: 'put',
    data: query,
  });
}
