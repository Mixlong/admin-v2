import request from '@/utils/request'

// 获取维修不良统计报表
export function getRepairDefectReport(params, data = {}) {
  return request({
    url: '/base/repair/record/report/defect',
    method: 'post',
    params: params,
    data: data
  })
}

// 获取维修记录不良原因列表
export function getRepairReasonsList() {
  return request({
    url: '/base/repair/record/reasons/list',
    method: 'get'
  })
}

