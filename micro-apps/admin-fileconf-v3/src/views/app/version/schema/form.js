/**
 * 版本管理 - 表单配置（FormCreate）
 */

// 渠道选项
export const channelOptions = [
  { label: '内部渠道', value: 'internal' },
  { label: '华为应用市场', value: 'huawei' },
  { label: '小米应用市场', value: 'xiaomi' },
  { label: 'MDM企业管理', value: 'mdm' }
]

// 状态选项
export const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已禁用', value: 'disabled' }
]

// 搜索字段配置
export const searchFields = [
  { key: 'platform', label: '平台', type: 'select', options: [
    { label: 'Android', value: 'Android' },
    { label: 'iOS', value: 'iOS' }
  ]},
  { key: 'channel', label: '渠道', type: 'select', options: channelOptions },
  { key: 'versionName', label: '版本号', type: 'input' },
  { key: 'status', label: '状态', type: 'select', options: statusOptions },
  { key: 'type', label: '更新类型', type: 'select', options: [
    { label: '热更新(wgt)', value: 'wgt' },
    { label: '整包(apk)', value: 'apk' }
  ]}
]

// 表单规则
export const createFormRule = () => [
  {
    type: 'select',
    field: 'platform',
    title: '平台',
    value: 'Android',
    props: { placeholder: '请选择平台' },
    options: [
      { label: 'Android', value: 'Android' },
      { label: 'iOS', value: 'iOS' }
    ],
    validate: [{ required: true, message: '请选择平台', trigger: 'change' }],
    col: { span: 12 }
  },
  {
    type: 'select',
    field: 'channel',
    title: '渠道',
    value: 'internal',
    props: { placeholder: '请选择渠道' },
    options: channelOptions,
    validate: [{ required: true, message: '请选择渠道', trigger: 'change' }],
    col: { span: 12 }
  },
  {
    type: 'input',
    field: 'versionName',
    title: '版本号',
    value: '',
    props: { placeholder: '如: 1.2.3' },
    validate: [
      { required: true, message: '请输入版本号', trigger: 'blur' },
      { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式如: 1.2.3', trigger: 'blur' }
    ],
    col: { span: 12 }
  },
  {
    type: 'InputNumber',
    field: 'versionCode',
    title: '版本Code',
    value: 1,
    props: { min: 1, style: { width: '100%' } },
    validate: [{ required: true, message: '请输入版本Code', trigger: 'blur', type: 'number' }],
    col: { span: 12 }
  },
  {
    type: 'select',
    field: 'type',
    title: '更新类型',
    value: 'wgt',
    props: { placeholder: '请选择更新类型' },
    options: [
      { label: '热更新(wgt)', value: 'wgt' },
      { label: '整包(apk)', value: 'apk' }
    ],
    validate: [{ required: true, message: '请选择更新类型', trigger: 'change' }],
    col: { span: 12 }
  },
  {
    type: 'switch',
    field: 'force',
    title: '强制更新',
    value: false,
    col: { span: 12 }
  },
  {
    type: 'input',
    field: 'minVersion',
    title: '最低版本',
    value: '',
    props: { placeholder: '低于此版本强制更新，如: 1.0.0' },
    col: { span: 24 }
  },
  {
    type: 'input',
    field: 'wgtUrl',
    title: 'WGT包地址',
    value: '',
    props: { placeholder: '热更新包下载地址' },
    col: { span: 24 },
    display: ({ type, platform }) => type === 'wgt' || platform === 'iOS',
    children: [
      {
        type: 'ElButton',
        slot: 'append',
        children: ['上传'],
        props: { icon: 'Upload' },
        on: { click: '$uploadWgt' }
      }
    ]
  },
  {
    type: 'input',
    field: 'apkUrl',
    title: 'APK包地址',
    value: '',
    props: { placeholder: 'Android整包下载地址' },
    col: { span: 24 },
    display: ({ type, platform }) => type === 'apk' && platform === 'Android',
    children: [
      {
        type: 'ElButton',
        slot: 'append',
        children: ['上传'],
        props: { icon: 'Upload' },
        on: { click: '$uploadApk' }
      }
    ]
  },
  {
    type: 'input',
    field: 'title',
    title: '更新标题',
    value: '发现新版本',
    props: { placeholder: '如: 发现新版本' },
    col: { span: 24 }
  },
  {
    type: 'Editor',
    field: 'note',
    title: '更新说明',
    value: '',
    props: { minHeight: 150 },
    col: { span: 24 }
  }
]

// 表单配置选项
export const formOption = {
  form: { labelWidth: '100px', size: 'small' },
  row: { gutter: 20 },
  submitBtn: false,
  resetBtn: false
}
