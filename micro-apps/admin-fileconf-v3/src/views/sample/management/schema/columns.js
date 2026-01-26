/**
 * 样品管理 - 表格列配置
 * 按照需求文档的分组表头结构
 */

export const columns = [
  // 基础信息分组
  {
    key: 'baseInfo',
    title: '基础信息',
    headerClassName: 'header-group-base',
    fixed: 'left',
    children: [
      { key: 'currentStatus', field: 'currentStatus', title: '当前状态', width: 80, align: 'center', slot: 'currentStatus', headerClassName: 'header-group-base' },
      { key: 'orderType', field: 'orderType', title: '订单类型', width: 80, align: 'center', slot: 'orderType', headerClassName: 'header-group-base' },
      { key: 'requirementCustomer', field: 'requirementCustomer', title: '需求客户', width: 100, showOverflow: true, headerClassName: 'header-group-base' },
      { key: 'customerLevel', field: 'customerLevel', title: '客户分级', width: 80, align: 'center', headerClassName: 'header-group-base' },
      { key: 'requirementCategoryName', field: 'requirementCategoryName', title: '需求品类', width: 100, showOverflow: true, headerClassName: 'header-group-base' },
      { key: 'meterModelName', field: 'meterModelName', title: '仪表型号', width: 100, showOverflow: true, headerClassName: 'header-group-base' },
      { key: 'requirementQuantity', field: 'requirementQuantity', title: '需求数量', width: 80, align: 'center', headerClassName: 'header-group-base' },
      { key: 'deliveredQuantity', field: 'deliveredQuantity', title: '已发货', width: 70, align: 'center', headerClassName: 'header-group-base' },
      { key: 'undeliveredQuantity', field: 'undeliveredQuantity', title: '未发货', width: 70, align: 'center', headerClassName: 'header-group-base' },
      { key: 'requiredSampleDate', field: 'requiredSampleDate', title: '要求送样日期', width: 110, align: 'center', headerClassName: 'header-group-base' },
      { key: 'samplePurpose', field: 'samplePurpose', title: '样品用途', width: 100, showOverflow: true, headerClassName: 'header-group-base' }
    ]
  },
  // 基础配置分组
  {
    key: 'baseConfig',
    title: '基础配置',
    headerClassName: 'header-group-config',
    children: [
      { key: 'communicationType', field: 'communicationType', title: '通讯方式', width: 80, showOverflow: true, headerClassName: 'header-group-config' },
      { key: 'communicationProtocol', field: 'communicationProtocol', title: '通讯协议', width: 80, showOverflow: true, headerClassName: 'header-group-config' },
      { key: 'powerCircuit', field: 'powerCircuit', title: '开关机电路', width: 90, showOverflow: true, headerClassName: 'header-group-config' },
      { key: 'voltage', field: 'voltage', title: '电压(V)', width: 70, align: 'center', headerClassName: 'header-group-config' },
      { key: 'wheelDiameter', field: 'wheelDiameter', title: '轮径', width: 60, align: 'center', headerClassName: 'header-group-config' },
      { key: 'bluetoothFunction', field: 'bluetoothFunction', title: '蓝牙功能', width: 80, align: 'center', slot: 'bluetoothFunction', headerClassName: 'header-group-config' },
      { key: 'bluetoothApp', field: 'bluetoothApp', title: '蓝牙APP', width: 100, showOverflow: true, headerClassName: 'header-group-config' },
      { key: 'peripheralConnection', field: 'peripheralConnection', title: '外设连接', width: 80, showOverflow: true, headerClassName: 'header-group-config' },
      { key: 'peripheralQuantity', field: 'peripheralQuantity', title: '外设数量', width: 80, align: 'center', headerClassName: 'header-group-config' }
    ]
  },
  // 外观配置分组
  {
    key: 'appearanceConfig',
    title: '外观配置',
    headerClassName: 'header-group-appearance',
    children: [
      { key: 'communicationCableModel', field: 'communicationCableModel', title: '通讯线型号', width: 100, showOverflow: true, headerClassName: 'header-group-appearance' },
      { key: 'communicationCableLength', field: 'communicationCableLength', title: '线长(mm)', width: 80, align: 'center', headerClassName: 'header-group-appearance' },
      { key: 'extensionCableModel', field: 'extensionCableModel', title: '延长线型号', width: 100, showOverflow: true, headerClassName: 'header-group-appearance' },
      { key: 'extensionCableLength', field: 'extensionCableLength', title: '线长(mm)', width: 80, align: 'center', headerClassName: 'header-group-appearance' },
      { key: 'buttonModel', field: 'buttonModel', title: '按键型号', width: 80, showOverflow: true, headerClassName: 'header-group-appearance' },
      { key: 'handlebarSize', field: 'handlebarSize', title: '车把尺寸', width: 80, align: 'center', headerClassName: 'header-group-appearance' }
    ]
  },
  // 人员时效分组
  {
    key: 'personnelTime',
    title: '人员时效',
    headerClassName: 'header-group-time',
    children: [
      { key: 'customerOrderTime', field: 'customerOrderTime', title: '客户下单时间', width: 110, align: 'center', headerClassName: 'header-group-time' },
      { key: 'demandReviewTime', field: 'demandReviewTime', title: '需求评审完成时间', width: 130, align: 'center', headerClassName: 'header-group-time' },
      { key: 'materialPrepTime', field: 'materialPrepTime', title: '开发物料完成时间', width: 130, align: 'center', headerClassName: 'header-group-time' },
      { key: 'developer', field: 'developer', title: '开发人员', width: 80, showOverflow: true, headerClassName: 'header-group-time' },
      { key: 'developCompleteTime', field: 'developCompleteTime', title: '完成时间', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'softwareTester', field: 'softwareTester', title: '软测人员', width: 80, showOverflow: true, headerClassName: 'header-group-time' },
      { key: 'softwareTestTime', field: 'softwareTestTime', title: '完成时间', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'tester', field: 'tester', title: '测试人员', width: 80, showOverflow: true, headerClassName: 'header-group-time' },
      { key: 'testCompleteTime', field: 'testCompleteTime', title: '完成时间', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'assembler', field: 'assembler', title: '组装人员', width: 80, showOverflow: true, headerClassName: 'header-group-time' },
      { key: 'assembleCompleteTime', field: 'assembleCompleteTime', title: '完成时间', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'sampleReviewTime', field: 'sampleReviewTime', title: '送样评审完成时间', width: 130, align: 'center', headerClassName: 'header-group-time' },
      { key: 'deliveryTime', field: 'deliveryTime', title: '发货时间', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'developmentDuration', field: 'developmentDuration', title: '开发时效(天)', width: 100, align: 'center', headerClassName: 'header-group-time' },
      { key: 'sampleDuration', field: 'sampleDuration', title: '送样时效(天)', width: 100, align: 'center', headerClassName: 'header-group-time' }
    ]
  },
  // SN号（黄色背景）
  { key: 'sn', field: 'sn', title: 'SN', width: 120, showOverflow: true, headerClassName: 'header-sn' },
  // 操作列
  { key: 'actions', title: '操作', width: 200, align: 'center', fixed: 'right', slot: 'actions', locked: true }
]

export const columnStorageKey = 'sample:management:columns'
