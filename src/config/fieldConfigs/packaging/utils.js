/**
 * 包装信息字段工具函数
 * 
 * 提供统一的字段访问和数据处理方法
 */

import { PACKAGING_FIELDS } from './fields'

/**
 * 根据字段key和分组获取实际字段名（包含别名查找）
 * @param {string} groupKey - 分组key
 * @param {string} fieldKey - 字段key
 * @param {object} data - 数据对象
 * @returns {string} - 实际存在的字段名
 */
export function resolveFieldName(groupKey, fieldKey, data) {
  if (!data || !data[groupKey]) return fieldKey
  
  const groupData = data[groupKey]
  const fieldConfig = PACKAGING_FIELDS[groupKey]?.fields[fieldKey]
  
  // 如果字段存在，直接返回
  if (groupData[fieldKey] !== undefined) {
    return fieldKey
  }
  
  // 查找别名
  if (fieldConfig && fieldConfig.aliases && fieldConfig.aliases.length > 0) {
    for (const alias of fieldConfig.aliases) {
      if (groupData[alias] !== undefined) {
        return alias // 返回找到的别名
      }
    }
  }
  
  return fieldKey // 都找不到，返回原字段名
}

/**
 * 获取字段值（自动处理别名）
 * @param {object} data - 数据对象
 * @param {string} groupKey - 分组key
 * @param {string} fieldKey - 字段key
 * @returns {any} - 字段值
 */
export function getFieldValue(data, groupKey, fieldKey) {
  if (!data || !data[groupKey]) return ''
  
  const groupData = data[groupKey]
  const actualFieldName = resolveFieldName(groupKey, fieldKey, data)
  const value = groupData[actualFieldName]
  
  if (typeof value === 'object' && value !== null && value.value !== undefined) {
    return value.value
  }
  
  return value || ''
}

/**
 * 设置字段值（使用标准字段名）
 * @param {object} data - 数据对象
 * @param {string} groupKey - 分组key
 * @param {string} fieldKey - 字段key
 * @param {any} value - 字段值
 */
export function setFieldValue(data, groupKey, fieldKey, value) {
  if (!data[groupKey]) {
    data[groupKey] = {}
  }
  
  // 始终使用标准字段名设置值
  data[groupKey][fieldKey] = value
}

/**
 * 数据标准化：将历史字段名转换为标准字段名
 * @param {object} data - 原始数据
 * @returns {object} - 标准化后的数据
 */
export function normalizePackagingData(data) {
  if (!data || typeof data !== 'object') return data
  
  const normalized = {}
  
  Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
    if (!data[groupKey]) return
    
    const groupConfig = PACKAGING_FIELDS[groupKey]
    normalized[groupKey] = {}
    
    Object.keys(groupConfig.fields).forEach(fieldKey => {
      const fieldConfig = groupConfig.fields[fieldKey]
      const actualFieldName = resolveFieldName(groupKey, fieldKey, data)
      
      if (data[groupKey][actualFieldName] !== undefined) {
        // 使用标准字段名
        normalized[groupKey][fieldKey] = data[groupKey][actualFieldName]
      }
    })
  })
  
  return normalized
}

/**
 * 获取所有字段keys（用于遍历）
 * @param {string} groupKey - 分组key
 * @returns {array} - 字段key数组
 */
export function getGroupFieldKeys(groupKey) {
  const groupConfig = PACKAGING_FIELDS[groupKey]
  if (!groupConfig) return []
  
  return Object.keys(groupConfig.fields)
}

