import request from '@/utils/request';

export function  fileList (data) {
  return request ({
    url: '/computer/file/list',
    method: 'get',
    params: data,
  });
}

 
export function fileAuth (data) {
  return request ({
    url: '/computer/file/auth',
    method: 'put',
    data: data,
  });
}

export function fileUpdate (data) {
  return request ({
    url: '/computer/file',
    method: 'post',
    data: data,
  });
}
export function fileAdd (data) {
  return request ({
    url: '/computer/file',
    method: 'post',
    data: data,
  });
}
