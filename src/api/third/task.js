import request from '@/utils/request';

export function taskManage (query) {
  return request ({
    url: '/task/manage',
    method: 'post',
    data: query,
  });
}

export function taskDelete (query) {
  return request ({
    url: '/task/manage/auth',
    method: 'put',
    data: query,
  });
}
export function taskCount (query) {
  return request ({
    url: '/task/manage/count/' + query,
    method: 'get',
    data: query,
  });
}
export function manageMember (query) {
  return request ({
    url: '/task/manage',
    method: 'put',
    data: query,
  });
}

export function manageList (query) {
  return request ({
    url: '/task/manage/list',
    method: 'get',
    params: query,
  });
}
export function manageListLog (id, query) {
  return request ({
    url: '/task/manage/log/' + id,
    method: 'get',
    params: query,
  });
}

export function principalList (query) {
  return request ({
    url: '/task/manage/principal/list',
    method: 'get',
    params: query,
  });
}
export function projectList (query) {
  return request ({
    url: '/task/manage/project/list',
    method: 'get',
    params: query,
  });
}

export function taskDictDept (query) {
  return request ({
    url: '/task/manage/dict/dept/user',
    method: 'get',
    params: query,
  });
}
export function taskDeptList (query) {
  return request ({
    url: '/task/manage/dept/list',
    method: 'get',
    params: query,
  });
}

export function manageSort (query) {
  return request ({
    url: '/task/manage/sort',
    method: 'put',
    data: query,
  });
}

export function myCreateTask (query) {
  return request ({
    url: '/task/manage/my/create/list',
    method: 'get',
    params: query,
  });
}

export function taskManageLogAdd (query) {
  return request ({
    url: '/task/manage/progress',
    method: 'post',
    data: query,
  });
}

export function taskManageLogUpdate (query) {
  return request ({
    url: '/task/manage/progress',
    method: 'put',
    data: query,
  });
}

export function taskProgress (id,query) {
  return request ({
    url: '/task/manage/progress/' + id,
    method: 'get',
    params: query,
  });
}


export function taskNotice (id,query) {
  return request ({
    url: '/task/manage/notice',
    method: 'get',
    params: query,
  });
}
