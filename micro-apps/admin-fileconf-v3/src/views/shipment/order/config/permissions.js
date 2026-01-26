/**
 * 出货订单权限配置
 * 定义各角色可编辑的字段
 */

/**
 * 角色可编辑列配置
 * key: 角色标识
 * value: 可编辑的字段数组
 */
export const roleEditableColumns = {
  // 市场专员：可编辑基础订单信息和出货信息
  ms: [
    'customerName',
    'u8OrderNo',
    'bomCode',
    'etreeOrderNo',
    'etreeBomBefore',
    'etreeBomAfter',
    'etreeBomAudited',
    'customerOrderNo',
    'configModel',
    'keyModel',
    'orderDate',
    'orderQty',
    'shippedQty',
    'unshippedQty',
    'deliveryDate',
    'customerMaterial',
    'customerMaterialArrival',
    'specialRemark',
    'deliveryChangeLog',
    'orderSigned'
  ],

  // BOM专员：可编辑BOM相关字段
  BOM_Manage: ['etreeBomBefore', 'etreeBomAfter', 'etreeBomAudited', 'configModel', 'keyModel'],

  // PMC专员：只能编辑可达成交期
  pmc: ['pmcDate'],

  // 超级管理员：可编辑所有字段
  admin: [
    'customerName',
    'u8OrderNo',
    'bomCode',
    'etreeOrderNo',
    'etreeBomBefore',
    'etreeBomAfter',
    'etreeBomAudited',
    'configModel',
    'keyModel',
    'customerOrderNo',
    'orderDate',
    'orderQty',
    'shippedQty',
    'unshippedQty',
    'deliveryDate',
    'pmcDate',
    'deliveryChangeLog',
    'customerMaterial',
    'customerMaterialArrival',
    'specialRemark'
  ]
}

/**
 * 角色名称映射
 */
export const roleNameMap = {
  ms: '市场专员',
  BOM_Manage: 'BOM专员',
  pmc: 'PMC专员',
  admin: '超级管理员'
}

/**
 * 可新增订单的角色
 */
export const canAddOrderRoles = ['ms', 'sale_manager', 'admin']

/**
 * 有编辑权限的角色
 */
export const hasEditPermissionRoles = ['ms', 'BOM_Manage', 'pmc', 'admin']
