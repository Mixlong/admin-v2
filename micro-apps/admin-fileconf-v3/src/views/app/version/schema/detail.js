/**
 * 版本管理 - 详情配置（DetailView）
 */

export const detailSchema = {
  cols: 2,
  fetch: { url: '/app/version/detail/{id}' },
  blocks: [
    {
      fields: [
        { key: 'platform', label: '平台', render: 'dict', map: { Android: 'Android', iOS: 'iOS' } },
        { key: 'channel', label: '渠道', render: 'dict', map: { internal: '内部渠道', huawei: '华为应用市场', xiaomi: '小米应用市场', mdm: 'MDM企业管理' } },
        { key: 'versionName', label: '版本号' },
        { key: 'versionCode', label: '版本Code' },
        { key: 'type', label: '更新类型', render: 'dict', map: { wgt: '热更新', apk: '整包' } },
        { key: 'force', label: '强制更新', render: 'boolean' },
        { key: 'minVersion', label: '最低版本' },
        { key: 'status', label: '状态', render: 'dict', map: { draft: '草稿', published: '已发布', disabled: '已禁用' } },
        { key: 'wgtUrl', label: 'WGT地址', span: 2, visibleOn: 'data.wgtUrl' },
        { key: 'apkUrl', label: 'APK地址', span: 2, visibleOn: 'data.apkUrl' },
        { key: 'size', label: '包大小', render: 'size' },
        { key: 'sha256', label: 'SHA256' },
        { key: 'title', label: '更新标题', span: 2 },
        { key: 'note', label: '更新说明', span: 2, render: 'html' },
        { key: 'grayRule', label: '灰度规则', span: 2 },
        { key: 'publishAt', label: '发布时间', render: 'datetime' },
        { key: 'createTime', label: '创建时间', render: 'datetime' },
        { key: 'createBy', label: '创建人' },
        { key: 'updateTime', label: '更新时间', render: 'datetime' }
      ]
    }
  ]
}
