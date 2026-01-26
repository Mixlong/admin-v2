/**
 * 版本管理 - 表格列配置
 */

export const columns = [
  { key: 'seq', type: 'seq', title: '序号', width: 60, align: 'center', fixed: 'left', locked: true, pinOrder: -1 },
  { key: 'platform', field: 'platform', title: '平台', width: 100, align: 'center', slot: 'platform' },
  { key: 'channel', field: 'channel', title: '渠道', minWidth: 120, align: 'center', slot: 'channel' },
  { key: 'versionName', field: 'versionName', title: '版本号', minWidth: 120, align: 'center' },
  { key: 'versionCode', field: 'versionCode', title: '版本Code', width: 100, align: 'center' },
  { key: 'type', field: 'type', title: '更新类型', width: 100, align: 'center', slot: 'type' },
  { key: 'force', field: 'force', title: '强制更新', width: 90, align: 'center', slot: 'force' },
  { key: 'minVersion', field: 'minVersion', title: '最低版本', width: 100, align: 'center', showOverflow: true },
  { key: 'status', field: 'status', title: '状态', width: 90, align: 'center', slot: 'status' },
  { key: 'publishAt', field: 'publishAt', title: '发布时间', minWidth: 160, align: 'center', showOverflow: true },
  { key: 'createTime', field: 'createTime', title: '创建时间', minWidth: 160, align: 'center', showOverflow: true },
  { key: 'actions', title: '操作', width: 180, align: 'center', fixed: 'right', slot: 'actions', locked: true, pinOrder: 1 }
]

export const columnStorageKey = 'app:version:columns'
