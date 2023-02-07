import request from '@/utils/request';
// 模块列表
export function listSoft (query) {
  return request ({
    url: '/pucs/soft/list',
    method: 'get',
    params: query,
  });
}

export function addSoft (data) {
  return request ({
    url: '/pucs/soft',
    method: 'post',
    data,
  });
}

export function updateSoft (data) {
  return request ({
    url: '/pucs/soft',
    method: 'put',
    data,
  });
}

export function authSoft (data) {
  return request ({
    url: '/pucs/soft/auth',
    method: 'put',
    data,
  });
}

export function deleteSoft (data) {
  return request ({
    url: '/pucs/soft/del',
    method: 'delete',
    data,
  });
}

export function detailSoft (id) {
  return request ({
    url: '/pucs/soft/detail/' + id,
    method: 'get',
  });
}

// 类型字典
export function typeDictList() {
  return request({
    url: '/pucs/type/dict',
    method: 'get'
  })
}

// 模块字典
export function moduleDictList(params) {
  return request({
    url: '/pucs/type/dict/module',
    method: 'get',
    params
  })
}

// 模块字典
export function moduleIotLog(data) {
  return request({
    url: '/pucs/soft/iot/log',
    method: 'post',
    data
  })
}

// 获取日志内容
export function moduleIotLogDetail(id) {
  return request({
    url: '/pucs/soft/iot/log/' + id,
    method: 'get'
  })
}
