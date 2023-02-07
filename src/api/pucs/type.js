/*
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-06-11 09:18:32
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/pucs/type.js
 */
import request from '@/utils/request';

export function listType(query) {
  return request({
    url: '/pucs/type/list',
    method: 'get',
    params: query,
  });
}

export function addType(query) {
  return request({
    url: '/pucs/type',
    method: 'post',
    data: query,
  });
}

export function updateType(query) {
  return request({
    url: '/pucs/type',
    method: 'put',
    data: query,
  });
}

export function authType(query) {
  return request({
    url: '/pucs/type/auth',
    method: 'put',
    data: query,
  });
}

export function typeDict(query) {
  return request({
    url: '/pucs/type/dict',
    method: 'get',
    params: query,
  });
}


