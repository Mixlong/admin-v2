/**
 * 智慧大屏
 */
import request from '@/utils/request';

// 今日生产情况
export function getScreenTodayProgress() {
  return request({
    url: '/screen/today/progress',
    method: 'get'
  })
}

// 生产资料准备情况
export function getScreenProductionMeans() {
    return request({
      url: '/screen/production/means',
      method: 'get'
    })
  }