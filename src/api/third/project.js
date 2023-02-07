import request from '@/utils/request';

export function projectProgressUpdate (data) {
  return request ({
    url: '/project/progress',
    method: 'put',
    data,
  });
}

export function projectProgressAdd (data) {
  return request ({
    url: '/project/progress',
    method: 'post',
    data,
  });
}

export function listProject (query) {
  return request ({
    url: '/project/list',
    method: 'get',
    params: query,
  });
}

export function dictPmProject () {
  return request ({
    url: '/project/dict/pm',
    method: 'get',
  });
}
export function detailInfoProject (id) {
  return request ({
    url: '/project/' + id,
    method: 'get',
  });
}
export function dictNameProject () {
  return request ({
    url: '/project/dict/name',
    method: 'get',
  });
}
export function dictNameProject2 (params) {
  return request ({
    url: '/project/dict/name2',
    method: 'get',
    params
  });
}

export function authProject (data) {
  return request ({
    url: '/project/auth',
    method: 'put',
    data: data,
  });
}

export function addProject (data) {
  return request ({
    url: '/project',
    method: 'post',
    data: data,
  });
}

export function editProject (data) {
  return request ({
    url: '/project',
    method: 'put',
    data: data,
  });
}

export function editProjectPlan (data) {
  return request ({
    url: '/project/plan',
    method: 'put',
    data: data,
  });
}
export function sortProject (data) {
  return request ({
    url: '/project/sort',
    method: 'put',
    data: data,
  });
}

export function addProjectProgress (data) {
  return request ({
    url: '/project/progress',
    method: 'post',
    data: data,
  });
}

export function deleteProject (data) {
  return request ({
    url: '/project/del',
    method: 'delete',
    data: data,
  });
}
export function detailProject (query) {
  return request ({
    url: '/project/detail/list',
    method: 'get',
    params: query,
  });
}

export function exportProject (query) {
  return request ({
    url: '/project/export/list',
    method: 'get',
    params: query,
  });
}

export function getWorkList (query) {
  return request ({
    url: '/project/work/list',
    method: 'get',
    params: query,
  });
}

// 小纸条
export function addProjectPaper (data) {
  return request ({
    url: '/paper',
    method: 'post',
    data,
  });
}

export function updateProjectPaper (data) {
  return request ({
    url: '/paper',
    method: 'put',
    data,
  });
}

export function listSend (params) {
  return request ({
    url: '/paper/list/send',
    method: 'get',
    params,
  });
}

export function listReceive (params) {
  return request ({
    url: '/paper/list/receive',
    method: 'get',
    params,
  });
}

export function paperOver (data) {
  return request ({
    url: '/paper/over',
    method: 'put',
    data,
  });
}

export function paperRead (data) {
  return request ({
    url: '/paper/read',
    method: 'put',
    data,
  });
}

export function detailSend (id) {
  return request ({
    url: '/paper/detail/send/' + id,
    method: 'get',
  });
}

export function detailReceive (id) {
  return request ({
    url: '/project/paper/detail/receive/' + id,
    method: 'get',
  });
}

export function paperAuth (data) {
  return request ({
    url: '/paper/auth',
    method: 'put',
    data,
  });
}

export function projectListUrser (id) {
  return request ({
    url: '/project/list/user/' + id,
    method: 'get',
  });
}
export function projectLisReceiveRemind (id) {
  return request ({
    url: '/paper/list/receive/remind',
    method: 'get',
  });
}

export function remindMum () {
  return request ({
    url: '/paper/remind/num',
    method: 'get',
  });
}

export function authReceive (data) {
  return request ({
    url: '/paper/auth/receive',
    method: 'put',
    data,
  });
}
