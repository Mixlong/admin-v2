/*
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-06 14:57:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/home/index.js
 */
import request from '@/utils/request';

export function taskConfig(data) {
  return request({
    url: '/home/task/config',
    method: 'get',
    params: data,
  });
}

export function taskProject(data) {
  return request({
    url: '/home/task/project',
    method: 'get',
    params: data,
  });
}

export function taskSale(data) {
  return request({
    url: '/home/task/sale',
    method: 'get',
    params: data,
  });
}

export function taskSample(data) {
  return request({
    url: '/home/task/sample',
    method: 'get',
    params: data,
  });
}


export function homeEmphasis(query) {
  return request({
    url: '/home/emphasis',
    method: 'get',
    params: query
  })
}

// 生产计划表
export function homeProduction(params) {
  return request({
    url: '/home/production',
    method: 'get',
    params
  })
}