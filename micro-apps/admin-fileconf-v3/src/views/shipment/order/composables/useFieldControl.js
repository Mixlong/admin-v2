/**
 * 字段控制 - 简化版本
 * 
 * 数据结构：
 * {
 *   "frozen": ["customerName", "specialRemark"],  // 冻结的字段列表
 *   "original": {  // 原始值（用于变更检测）
 *     "u8OrderNo": "E树SO250900051",
 *     "bomCode": "BOM-001",
 *     "customerOrderNo": "2509120008"
 *   }
 * }
 * 
 * 使用场景：
 * 1. 渲染时提取字段禁用，禁用对应单元格输入
 * 2. 提交数据时获取 JSON 格式化后的结构到后端
 * 3. 禁用后其他人无法双击编辑输入表格
 * 4. 检测字段变更，标红显示
 */

/**
 * 解析 fieldControlJson
 * @param {String} jsonStr - JSON 字符串
 * @returns {Object} { frozen: [], original: {} }
 */
export function parseFieldControl(jsonStr) {
  if (!jsonStr) {
    return { frozen: [], original: {} }
  }
  
  try {
    const data = JSON.parse(jsonStr)
    // 兼容旧格式
    if (data.cellDisabled && Array.isArray(data.cellDisabled)) {
      return {
        frozen: data.cellDisabled.map(item => item.field),
        original: data._originalValues || {}
      }
    }
    return {
      frozen: data.frozen || [],
      original: data.original || {}
    }
  } catch (error) {
    console.error('解析 fieldControlJson 失败:', error)
    return { frozen: [], original: {} }
  }
}

/**
 * 生成 fieldControlJson
 * @param {Array} frozenFields - 冻结的字段列表 ['customerName', 'specialRemark']
 * @param {Object} originalValues - 原始值对象 { u8OrderNo: 'xxx', bomCode: 'xxx' }
 * @returns {String} JSON 字符串
 */
export function generateFieldControl(frozenFields = [], originalValues = {}) {
  return JSON.stringify({
    frozen: frozenFields,
    original: originalValues
  })
}

/**
 * 检查单元格是否禁用（用于编辑前检查）
 * @param {Object} row - 行数据
 * @param {String} field - 字段名
 * @returns {Boolean}
 */
export function isCellDisabled(row, field) {
  const control = parseFieldControl(row.fieldControlJson)
  return control.frozen.includes(field)
}

/**
 * 检查字段是否变更（用于标红显示）
 * @param {Object} row - 行数据
 * @param {String} field - 字段名
 * @returns {Boolean}
 */
export function isFieldChanged(row, field) {
  const control = parseFieldControl(row.fieldControlJson)
  const originalValue = control.original[field]
  
  // 如果没有原始值记录，说明没有变更
  if (originalValue === undefined) return false
  
  // 统一转换为字符串比较（处理 null、undefined、数字等类型）
  const original = String(originalValue ?? '').trim()
  
  // 如果原始值为空，说明是新增数据，不标红
  if (original === '') return false
  
  const currentValue = row[field]
  const current = String(currentValue ?? '').trim()
  
  return original !== current
}

/**
 * 冻结单元格（禁用编辑）
 * @param {Object} row - 行数据
 * @param {String} field - 字段名
 */
export function freezeCell(row, field) {
  const control = parseFieldControl(row.fieldControlJson)
  
  // 如果还没冻结，添加到列表
  if (!control.frozen.includes(field)) {
    control.frozen.push(field)
    row.fieldControlJson = generateFieldControl(control.frozen, control.original)
  }
}

/**
 * 解冻单元格（允许编辑）
 * @param {Object} row - 行数据
 * @param {String} field - 字段名
 */
export function unfreezeCell(row, field) {
  const control = parseFieldControl(row.fieldControlJson)
  
  // 从列表中移除
  control.frozen = control.frozen.filter(f => f !== field)
  row.fieldControlJson = generateFieldControl(control.frozen, control.original)
}

/**
 * 初始化行数据的原始值（用于变更检测）
 * @param {Object} row - 行数据
 * @param {Array} monitorFields - 需要监控的字段列表
 */
export function initOriginalValues(row, monitorFields) {
  const control = parseFieldControl(row.fieldControlJson)
  
  // 如果已有原始值，不覆盖
  if (Object.keys(control.original).length > 0) {
    return
  }
  
  // 记录原始值
  const original = {}
  monitorFields.forEach(field => {
    original[field] = row[field] ?? ''
  })
  
  row.fieldControlJson = generateFieldControl(control.frozen, original)
}

/**
 * 切换单元格冻结状态
 * @param {Object} row - 行数据
 * @param {String} field - 字段名
 * @returns {Boolean} 冻结后的状态 true=已冻结 false=已解冻
 */
export function toggleFreeze(row, field) {
  if (isCellDisabled(row, field)) {
    unfreezeCell(row, field)
    return false
  } else {
    freezeCell(row, field)
    return true
  }
}
