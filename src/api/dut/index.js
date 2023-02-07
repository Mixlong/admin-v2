/*
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-31 16:01:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/api/dut/index.js
 */
import request from '@/utils/request';

export function listDut (params) {
  return request ({
    url: '/dut/list',
    method: 'get',
    params,
  });
}

export function addDut (data) {
  return request ({
    url: '/dut',
    method: 'post',
    data,
  });
}

export function updateDut (data) {
  return request ({
    url: '/dut',
    method: 'put',
    data,
  });
}

export function authDut (data) {
  return request ({
    url: '/dut/auth',
    method: 'put',
    data,
  });
}


 