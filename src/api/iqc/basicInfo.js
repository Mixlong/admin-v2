import request from '@/utils/request'

// 获取IQC基础信息列表
export function getIqcBasicInfoList(params) {
  return request({
    url: '/base/inventory/list',
    method: 'get',
    params
  })
}
