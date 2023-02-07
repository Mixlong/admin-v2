import request from '@/utils/request';

//  列表
export function dictList (query) {
  return request ({
    url: '/computer/dict/list',
    method: 'get',
    params: query,
  });
}
