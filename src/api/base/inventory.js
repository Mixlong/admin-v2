import request from '@/utils/request'

// 导出来料记录
export function exportInventoryInfo(params) {
  return request({
    url: '/base/inventory/info/export',
    method: 'get',
    params
    // 注意：不设置responseType，因为返回的是JSON格式包含文件ID
  })
}
