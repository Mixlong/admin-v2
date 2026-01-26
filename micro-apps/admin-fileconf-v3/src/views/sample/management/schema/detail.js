/**
 * 样品管理 - 详情配置
 */

export const detailSchema = {
  cols: 2,
  fetch: { url: '/sample/management/detail/{id}' },
  blocks: [
    {
      title: '基本信息',
      fields: [
        { key: 'currentStatusName', label: '状态' },
        { key: 'orderTypeName', label: '订单类型' },
        { key: 'requirementCustomer', label: '需求客户' },
        { key: 'requirementCategoryName', label: '需求品类' },
        { key: 'meterModelName', label: '仪表型号' },
        { key: 'projectManager', label: '项目经理' },
        { key: 'customerLevel', label: '客户分级' },
        { key: 'samplePurpose', label: '样品用途' },
        { key: 'requirementQuantity', label: '需求数量' },
        { key: 'deliveredQuantity', label: '已发货数量' },
        { key: 'undeliveredQuantity', label: '未发货数量' },
        { key: 'requiredSampleDate', label: '要求送样日期', render: 'datetime' },
        { key: 'requirementLink', label: '需求总表链接', span: 2 },
        { key: 'sn', label: 'SN号', span: 2 }
      ]
    },
    {
      title: '通讯信息',
      fields: [
        { key: 'communicationType', label: '通讯方式' },
        { key: 'communicationProtocol', label: '通讯协议' },
        { key: 'powerCircuit', label: '开关机电路' },
        { key: 'voltage', label: '电压(V)' },
        { key: 'wheelDiameter', label: '轮径' },
        { key: 'bluetoothFunction', label: '蓝牙功能' },
        { key: 'bluetoothApp', label: '蓝牙APP' },
        { key: 'peripheralConnection', label: '外设连接' },
        { key: 'peripheralQuantity', label: '外设数量' }
      ]
    },
    {
      title: '时效信息',
      fields: [
        { key: 'developmentDuration', label: '开发时效' },
        { key: 'sampleDuration', label: '送样时效' },
        { key: 'customerOrderTime', label: '客户下单时间', render: 'datetime' },
        { key: 'demandReviewCompleteTime', label: '需求评审完成时间', render: 'datetime' },
        { key: 'developMaterialCompleteTime', label: '开发物料完成时间', render: 'datetime' },
        { key: 'developerCompleteTime', label: '开发完成时间', render: 'datetime' },
        { key: 'softwareTesterCompleteTime', label: '软测完成时间', render: 'datetime' },
        { key: 'testerCompleteTime', label: '测试完成时间', render: 'datetime' },
        { key: 'assemblerCompleteTime', label: '组装完成时间', render: 'datetime' },
        { key: 'sampleReviewCompleteTime', label: '送样评审完成时间', render: 'datetime' },
        { key: 'deliveryTime', label: '实际发货时间', render: 'datetime' }
      ]
    },
    {
      title: '其它信息',
      fields: [
        { key: 'otherRequirements', label: '其它要求', span: 2 },
        { key: 'createBy', label: '创建人' },
        { key: 'createTime', label: '创建时间', render: 'datetime' },
        { key: 'updateBy', label: '更新人' },
        { key: 'updateTime', label: '更新时间', render: 'datetime' }
      ]
    }
  ]
}
