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

// 生产计划状态修改
export function homeProductionStatus(data) {
  return request({
    url: '/home/production/status',
    method: 'post',
    data
  })
}

// 产品型号责任人
export function responsibleList(params) {
  return request({
    url: '/responsible/list',
    method: 'get',
    params
  })
}

// 编辑产品型号责任人
export function responsibleEdit(data) {
  return request({
    url: '/responsible/edit',
    method: 'put',
    data
  })
}

// 生产计划状态修改
export function prodScheduleUpdate(data) {
  return request({
    url: '/production/scheduling/update/material',
    method: 'put',
    data
  })
}

// 修改人员管理
export function responsibleUpdate(data) {
  return request({
    url: '/production/personnel/edit',
    method: 'put',
    data
  })
}

// 获取对应人员
export function responsiblePersonnel(params) {
  return request({
    url: '/production/personnel/map',
    method: 'get',
    params
  })
}

// 人员管理
export function responsiblePersonnelList(params) {
  return request({
    url: '/production/personnel/list',
    method: 'get',
    params
  })
}