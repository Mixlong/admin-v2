/**
 * 默认列配置
 * 用于列配置面板的初始化和重置
 * 
 * 注意：此文件从 columns.js 自动生成默认配置，不要手动维护列数据！
 * 如需新增/修改列，请编辑 columns.js
 */

import { getColumnConfigData } from './columns.js'

/**
 * 列配置版本号
 * 当列配置结构发生变化时，更新此版本号，强制用户重置配置
 * 修改历史：
 * - 1.0.1: 修复列顺序混乱问题，强制重置所有旧配置
 * - 1.0.2: 添加分组字段（group），支持一二级表头显示
 * - 1.0.3: 统一数据源，从 columns.js 自动生成
 * - 1.0.4: 更新列宽度配置
 */
export const COLUMN_CONFIG_VERSION = '1.0.4'

/**
 * 从 columns.js 生成默认列配置
 * 这样只需要维护一份数据源
 */
export const defaultColumns = (() => {
  // 获取原始列配置（传入空的 options，因为这里只需要结构）
  const sourceColumns = getColumnConfigData({ 
    customerNameOptions: { value: [] }, 
    customerMaterialOptions: [] 
  })
  
  // 转换为默认列配置格式
  return sourceColumns.map((col, index) => ({
    field: col.field,
    title: col.title,
    width: col.width || 120,
    visible: true,
    fixed: col.field === 'customerName' ? 'left' : null, // 客户名称默认左固定
    order: index + 1,
    group: col.group || null // 保留分组信息
  }))
})()

/**
 * 根据列配置生成 VXE Table 列配置
 * @param {Array} columns - 列配置数组
 * @param {Object} columnConfigData - 原始列配置数据（包含类型、选项等）
 * @returns {Array} VXE Table 列配置
 */
export function buildVxeColumns(columns, columnConfigData) {
  // 创建字段到配置的映射
  const configMap = new Map()
  columnConfigData.forEach(config => {
    configMap.set(config.field, config)
  })
  
  return columns
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(col => {
      const config = configMap.get(col.field) || {}
      
      return {
        field: col.field,
        title: col.title,
        width: col.width,
        minWidth: col.minWidth,
        fixed: col.fixed || undefined,
        // 合并原始配置的其他属性
        ...config
      }
    })
}
