import request from '@/utils/request';

export function listCategory (query) {
  return request ({
    url: '/category/list',
    method: 'get',
    params: query,
  });
}

export function listType () {
  return request ({
    url: '/category/type',
    method: 'get',
  });
}

export function detailCategory (query) {
  return request ({
    url: '/category/' + query,
    method: 'get',
  });
}

export function authCategory (data) {
  return request ({
    url: '/category/auth',
    method: 'put',
    data: data,
  });
}

export function addCategory (data) {
  return request ({
    url: '/category',
    method: 'post',
    data: data,
  });
}

export function editCategory (data) {
  return request ({
    url: '/category',
    method: 'put',
    data: data,
  });
}

export function typeCategory (data) {
  return request ({
    url: '/category/dict',
    method: 'get',
    params: data,
  });
}
