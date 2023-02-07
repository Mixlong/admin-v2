/*
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-06-16 10:17:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/js/index.js
 */
import request from '@/utils/request';

export function jsfuncAdd(data) {
  return request({
    url: '/js/func/public',
    method: 'post',
    data: data,
  });
}

export function jsfuncUpdate(data) {
  return request({
    url: '/js/func/public',
    method: 'put',
    data: data,
  });
}

export function jsfuncBaseAdd(data) {
  return request({
    url: '/js/func/base',
    method: 'post',
    data: data,
  });
}
export function jsfuncBaseUpdate(data) {
  return request({
    url: '/js/func/base',
    method: 'put',
    data: data,
  });
}


// 列表

export function funcList(data) {
  return request({
    url: '/js/func/public/list',
    method: 'get',
    params: data,
  });
}

// 删除
export function funcDelete(data) {
  return request({
    url: '/js/func/public/auth',
    method: 'put',
    data: data,
  });
}

export function funcBaseList(data) {
  return request({
    url: '/js/func/base/list',
    method: 'get',
    params: data,
  });
}


export function funcBaseDir(data) {
  return request({
    url: '/js/func/dir',
    method: 'put',
    data: data,
  });
}



