/**
 * CRM 模块常量定义
 * 统一管理 CRM 相关的选项和配置
 */

// 跟进方式选项
export const FOLLOW_METHOD_OPTIONS = [
  { label: '邮件沟通', value: '邮件沟通' },
  { label: '视频会议', value: '视频会议' },
  { label: '客户拜访', value: '客户拜访' },
  { label: '展会会面', value: '展会会面' },
  { label: '微信沟通', value: '微信沟通' },
  { label: '电话跟进', value: '电话跟进' },
  { label: '其他沟通', value: '其他沟通' }
]

// 跟进方式对应的标签颜色
export const FOLLOW_METHOD_COLORS = {
  '电话跟进': '',
  '客户拜访': 'success',
  '邮件沟通': 'warning',
  '微信沟通': 'info',
  '展会会面': 'info',
  '视频会议': 'info',
  '其他沟通': 'danger'
}

// 获取跟进方式颜色
export function getFollowMethodColor(method) {
  return FOLLOW_METHOD_COLORS[method] || ''
}
