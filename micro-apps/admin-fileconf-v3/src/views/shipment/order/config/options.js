/**
 * 出货订单下拉选项配置
 */

/**
 * 客供料选项
 */
export const customerMaterialOptions = [
  { label: '/', value: '/' },
  { label: '中控线', value: '中控线' },
  { label: '按键线', value: '按键线' },
  { label: '丝印保护膜', value: '丝印保护膜' },
  { label: '蓝牙模块', value: '蓝牙模块' },
  { label: '安全芯片', value: '安全芯片' }
]

/**
 * 客供料标签颜色映射
 */
export const customerMaterialTagTypeMap = {
  中控线: 'primary',
  按键线: 'success',
  丝印保护膜: 'warning',
  蓝牙模块: 'danger',
  安全芯片: 'info'
}

/**
 * E树BOM审核状态选项
 */
export const etreeBomAuditedOptions = [
  { label: '已审核', value: '已审核' },
  { label: '未审核', value: '未审核' },
  { label: '有遗留', value: '有遗留' }
]

/**
 * E树BOM审核状态标签颜色映射
 */
export const etreeBomAuditedTagMap = {
  已审核: 'success',
  未审核: 'info'
}

/**
 * 角色选项（用于测试切换）
 */
export const roleOptions = [
  { label: '👔 市场专员', value: 'ms' },
  { label: '📋 BOM专员', value: 'BOM_Manage' },
  { label: '📊 PMC专员', value: 'pmc' },
  { label: '👑 超级管理员', value: 'admin' }
]
