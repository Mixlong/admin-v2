import request from '@/utils/request';

export function computerList (data) {
  return request ({
    url: '/home/computer/list',
    method: 'get',
    params: data,
  });
}

export function computerDir (data) {
  return request ({
    url: '/home/computer/dir',
    method: 'get',
    params: data,
  });
}

export function computerAuth (data) {
  return request ({
    url: '/home/computer/auth',
    method: 'put',
    data: data,
  });
}

export function computerUpdate (data) {
  return request ({
    url: '/home/computer',
    method: 'put',
    data: data,
  });
}
export function computerAdd (data) {
  return request ({
    url: '/home/computer',
    method: 'post',
    data: data,
  });
}
