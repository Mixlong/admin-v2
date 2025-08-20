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

// 生产资料准备情况 - 新接口
export function getProductionMaterialsAlerts() {
  return request({
    url: '/production/alerts/production/materials',
    method: 'get'
  })
}

// 获取排产调度数据
export function getProductionScheduling() {
  return request({
    url: '/production/alerts/production/scheduling',
    method: 'get'
  })
}

// 获取直通率趋势数据
export function getThroughRateTrend() {
  return request({
    url: '/production/alerts/throughRate/trend',
    method: 'get'
  })
}

// 获取今日直通率
export function getThroughRateToday() {
  return request({
    url: '/production/alerts/throughRate/today',
    method: 'get'
  })
}

// 获取今日生产进度
export function getProductionRateToday() {
  return request({
    url: '/production/alerts/production/rate/today',
    method: 'get'
  })
}

// 获取品类列表 - 第三方接口
export function getCategoryThirdList() {
  return request({
    url: '/category/third/list',
    method: 'get'
  })
}