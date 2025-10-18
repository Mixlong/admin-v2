/**
 * 包装信息字段配置 - 统一入口
 * 
 * 使用方式：
 * import { PACKAGING_FIELDS, getFieldValue, ... } from '@/config/fieldConfigs/packaging'
 */

// 导出字段定义和辅助函数
export { 
  PACKAGING_FIELDS,
  getFieldDefaultValue,
  shouldShowRichtext
} from './fields'

// 导出工具函数
export {
  resolveFieldName,
  getFieldValue,
  setFieldValue,
  normalizePackagingData,
  getGroupFieldKeys
} from './utils'

