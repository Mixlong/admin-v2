/**
 * 出货订单表格列配置
 * 数据驱动的列定义，支持动态生成 VXE Table 列配置
 */

/**
 * 列类型说明：
 * - input: 普通文本输入
 * - select: 单选下拉
 * - multi-select: 多选下拉
 * - tag-select: 带标签样式的下拉
 * - date: 日期选择器
 * - number: 数字输入
 * - richtext: 富文本（弹窗编辑）
 * - readonly: 只读展示
 */

/**
 * 获取列配置数据
 * @param {Object} options - 动态选项
 * @param {Ref} options.customerNameOptions - 客户名称选项
 * @param {Array} options.customerMaterialOptions - 客供料选项
 * @returns {Array} 列配置数组
 */
export const getColumnConfigData = ({ customerNameOptions, customerMaterialOptions }) => [
  // 基础信息
  { 
    field: 'customerName', 
    title: '客户名称', 
    width: 140, 
    type: 'select', 
    options: () => customerNameOptions.value, 
    selectProps: { clearable: true, filterable: true, placeholder: '请选择客户' } 
  },
  { field: 'u8OrderNo', title: 'U8单号', width: 150, type: 'input', cellClass: 'order-no-link' },
  { field: 'bomCode', title: 'BOM编码', width: 150, type: 'input' },
  { field: 'etreeBomBefore', title: 'E树BOM刷新前', width: 145, type: 'input' },
  { field: 'etreeBomAfter', title: 'E树BOM刷新后', width: 145, type: 'input' },
  { 
    field: 'etreeBomAudited', 
    title: 'E树BOM审核', 
    width: 130, 
    type: 'tag-select', 
    options: () => [
      { label: '已审核', value: '已审核' }, 
      { label: '未审核', value: '未审核' }, 
      { label: '有遗留', value: '有遗留' }
    ] 
  },
  { field: 'configModel', title: '配置型号', width: 160, type: 'input' },
  { field: 'keyModel', title: '按键型号', width: 140, type: 'input' },
  { field: 'customerOrderNo', title: '客户订单号', width: 150, type: 'input' },
  { field: 'etreeOrderNo', title: 'E树订单号', width: 150, type: 'input' },
  { field: 'orderDate', title: '上单时间', width: 120, type: 'date' },
  
  // 数量信息（分组）
  { field: 'orderQty', title: '订单数量', width: 130, type: 'number', group: '数量信息' },
  { field: 'shippedQty', title: '已发货量', width: 130, type: 'number', group: '数量信息', cellClass: 'text-green' },
  { field: 'unshippedQty', title: '未发货量', width: 130, type: 'number', group: '数量信息', cellClass: 'text-red' },
  
  // 交期信息（分组）
  { field: 'deliveryDate', title: '交货计划', width: 120, type: 'date', group: '交期信息' },
  { field: 'pmcDate', title: '可达成交期', width: 150, type: 'richtext', group: '交期信息' },
  
  // 独立列
  { field: 'deliveryChangeLog', title: '交期变更履历', width: 200, type: 'richtext' },
  
  // 客供物料情况（分组）
  { field: 'customerMaterial', title: '客供料', width: 140, type: 'multi-select', group: '客供物料情况', options: () => customerMaterialOptions },
  { field: 'customerMaterialArrival', title: '到料时间', width: 120, type: 'input', group: '客供物料情况' },
  
  // 独立列
  { field: 'specialRemark', title: '特殊备注', width: 200, type: 'richtext' },
  { field: 'orderDays', title: '订单已耗时(天)', width: 120, type: 'readonly', warnCondition: (row) => row.orderDays > 60 }
]

/**
 * 富文本字段标题映射
 */
export const richTextFieldTitles = {
  specialRemark: '特殊备注',
  deliveryChangeLog: '交期变更履历',
  pmcDate: 'PMC可达成交期'
}

/**
 * 富文本字段占位符映射
 */
export const richTextFieldPlaceholders = {
  specialRemark: '请输入特殊备注',
  deliveryChangeLog: '请输入交期变更记录',
  pmcDate: '请输入PMC可达成交期'
}

/**
 * 字段中文名映射（用于提示等场景）
 */
export const fieldNameMap = {
  customerName: '客户名称',
  u8OrderNo: 'U8单号',
  bomCode: 'BOM编码',
  etreeBomBefore: 'E树BOM刷新前',
  etreeBomAfter: 'E树BOM刷新后',
  etreeBomAudited: 'E树BOM审核',
  configModel: '配置型号',
  keyModel: '按键型号',
  customerOrderNo: '客户订单号',
  etreeOrderNo: 'E树订单号',
  orderDate: '上单时间',
  orderQty: '订单数量',
  shippedQty: '已发货量',
  unshippedQty: '未发货量',
  deliveryDate: '交货计划',
  pmcDate: 'PMC可达成交期',
  deliveryChangeLog: '交期变更履历',
  customerMaterial: '客供料',
  customerMaterialArrival: '到料时间',
  specialRemark: '特殊备注',
  orderDays: '订单已耗时(天)'
}
