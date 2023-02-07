import request from '@/utils/request';

// 模块列表
export function moduleList (query) {
  return request ({
    url: '/pucs/module/list',
    method: 'get',
    params: query,
  });
}

// 模块详情
export function moduleDetail (query) {
  return request ({
    url: '/pucs/module/detail/' + query,
    method: 'get',
  });
}

// 新增模块
export function addModule (data) {
  return request ({
    url: '/pucs/module',
    method: 'post',
    data,
  });
}
//   修改模块
export function updateModule (data) {
  return request ({
    url: '/pucs/module',
    method: 'put',
    data,
  });
}

//   修改模块
export function  deleteModule (data) {
  return request ({
    url: '/pucs/module/auth',
    method: 'put',
    data,
  });
}

export function  moduleDictList( ) {
  return request ({
    url: '/pucs/module/dict/list',
    method: 'get',
   
  });
}

 