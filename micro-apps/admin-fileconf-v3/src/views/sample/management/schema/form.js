/**
 * 样品管理 - 表单配置
 */

// 状态选项
export const statusOptions = [
  { label: '进行中', value: 0 },
  { label: '已完成', value: 1 },
  { label: '暂停中', value: 2 },
  { label: '已取消', value: 3 }
]

// 订单类型选项
export const orderTypeOptions = [
  { label: '新单', value: 0 },
  { label: '反单', value: 1 }
]

// 流程类型选项
export const processTypeOptions = [
  { label: '销售人员', value: 1 },
  { label: '评审人员', value: 2 },
  { label: '产品经理', value: 3 },
  { label: '备料人员', value: 4 },
  { label: '开发人员', value: 5 },
  { label: '软测人员', value: 6 },
  { label: '测试人员', value: 7 },
  { label: '组装人员', value: 8 },
  { label: '评审人员', value: 9 },
  { label: '发货人员', value: 10 }
]

// 搜索字段配置
export const searchFields = [
  { key: 'currentStatus', label: '状态', type: 'select', options: statusOptions },
  { key: 'requirementCustomerId', label: '需求客户', type: 'remote-select', remoteType: 'customer' },
  { key: 'requirementCategoryId', label: '需求品类', type: 'remote-select', remoteType: 'category' },
  { key: 'sn', label: 'SN号', type: 'input' }
]

// 表单规则（分组布局）
export const createFormRule = () => [
  // ========== 基础信息 ==========
  {
    type: 'el-card',
    props: { header: '基础信息', shadow: 'never', class: 'form-section' },
    children: [
      {
        type: 'el-row',
        props: { gutter: 16 },
        children: [
          // 第一行
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'RemoteSelect', field: 'requirementCustomerId', title: '需求客户', props: { type: 'customer', customStyle: 'width: 100%' }, validate: [{ required: true, message: '请选择', trigger: 'change' }] }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'RemoteSelect', field: 'requirementCategoryId', title: '需求品类', props: { type: 'category', customStyle: 'width: 100%' }, validate: [{ required: true, message: '请选择', trigger: 'change' }] }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'RemoteSelect', field: 'meterModelId', title: '仪表型号', props: { type: 'model', customStyle: 'width: 100%', categoryId: '' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'select', field: 'orderType', title: '订单类型', value: 0, options: orderTypeOptions }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'RemoteSelect', field: 'projectManager', title: '项目经理', props: { type: 'projectManager', customStyle: 'width: 100%' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'RemoteSelect', field: 'salesperson', title: '销售', props: { type: 'sales', customStyle: 'width: 100%' } }
          ]},
          // 第二行
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'customerLevel', title: '客户分级', props: { placeholder: '请输入' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'InputNumber', field: 'requirementQuantity', title: '需求数量', value: 1, props: { min: 1, style: { width: '100%' } } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'DatePicker', field: 'requiredSampleDate', title: '要求送样日期', props: { type: 'date', style: { width: '100%' }, valueFormat: 'YYYY-MM-DD' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'samplePurpose', title: '样品用途', props: { placeholder: '请输入' } }
          ]},
          { type: 'el-col', props: { span: 8 }, children: [
            { type: 'input', field: 'requirementLink', title: '需求总表链接', props: { placeholder: '请输入腾讯文档链接' } }
          ]}
        ]
      }
    ]
  },
  // ========== 基础配置 ==========
  {
    type: 'el-card',
    props: { header: '基础配置', shadow: 'never', class: 'form-section' },
    children: [
      {
        type: 'el-row',
        props: { gutter: 16 },
        children: [
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'communicationType', title: '通讯方式', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'communicationProtocol', title: '通讯协议', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'powerCircuit', title: '开关机电路', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'InputNumber', field: 'voltage', title: '电压', props: { min: 0, style: { width: '100%' } } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'wheelDiameter', title: '轮径', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'productLineCode', title: '参考产品族谱线', props: { placeholder: '请选择' } }
          ]},
          // 第二行
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'bluetoothFunction', title: '蓝牙功能', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'bluetoothApp', title: '蓝牙APP', props: { placeholder: '请选择蓝牙APP' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'input', field: 'peripheralConnection', title: '外设连接', props: { placeholder: '请选择外设' } }
          ]},
          { type: 'el-col', props: { span: 4 }, children: [
            { type: 'InputNumber', field: 'peripheralQuantity', title: '外设数量', props: { min: 0, style: { width: '100%' } } }
          ]}
        ]
      }
    ]
  },
  // ========== 外观配置 ==========
  {
    type: 'el-card',
    props: { header: '外观配置', shadow: 'never', class: 'form-section' },
    children: [
      {
        type: 'el-row',
        props: { gutter: 16 },
        children: [
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'communicationCableModel', title: '通讯线型号', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'communicationCableLength', title: '线长(mm)', props: { placeholder: '请输入' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'communicationCableHead', title: '是否含头', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'supplyMethod1', title: '供线方式', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireType1', title: '线束类型', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireDiameter1', title: '线径', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireColor1', title: '线色', props: { placeholder: '请选择' } }
          ]},
          // 延长线
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'extensionCableModel', title: '延长线型号', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'extensionCableLength', title: '线长(mm)', props: { placeholder: '请输入' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'extensionCableHead', title: '是否含头', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'supplyMethod2', title: '供线方式', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireType2', title: '线束类型', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireDiameter2', title: '线径', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireColor2', title: '线色', props: { placeholder: '请选择' } }
          ]},
          // 按键型号
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'buttonModel', title: '按键型号', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'outputMethod', title: '出线方式', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'buttonHead', title: '按键【仪表端】接头', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'buttonControlHead', title: '按键【按键端】接头', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'buttonCableLength', title: '线长(mm)', props: { placeholder: '请输入' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireDiameter3', title: '线径', props: { placeholder: '请选择' } }
          ]},
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'wireColor3', title: '线色', props: { placeholder: '请选择' } }
          ]},
          // 车把尺寸
          { type: 'el-col', props: { span: 3 }, children: [
            { type: 'input', field: 'handlebarSize', title: '车把尺寸', props: { placeholder: 'Φ22.2' } }
          ]},
          { type: 'el-col', props: { span: 21 }, children: [
            { type: 'input', field: 'otherRequirements', title: '其它要求', props: { placeholder: '请输入' } }
          ]}
        ]
      }
    ]
  }
]

// 表单配置选项
export const formOption = {
  form: { labelWidth: '100px', size: 'small', labelPosition: 'top' },
  row: { gutter: 16 },
  submitBtn: false,
  resetBtn: false
}
