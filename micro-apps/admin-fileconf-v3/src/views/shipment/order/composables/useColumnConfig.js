/**
 * 列配置管理 Composable
 * 提供列配置的加载、保存、重置等功能
 */
import { ref, computed } from 'vue'

/**
 * 从 localStorage 读取列配置，并和默认配置做对齐（兼容新增字段）
 * @param {string} key - localStorage 的 key
 * @param {Array} fallback - 默认列配置
 * @param {string} version - 配置版本号
 * @returns {Array} 列配置数组
 */
export function loadColumns(key, fallback, version) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return JSON.parse(JSON.stringify(fallback))

    const saved = JSON.parse(raw)

    // 检查版本号，如果不匹配则使用默认配置
    if (version && saved._version !== version) {
      console.warn('⚠️ 列配置版本不匹配，使用默认配置', {
        saved: saved._version,
        current: version
      })
      return JSON.parse(JSON.stringify(fallback))
    }

    // 提取实际的列配置（排除版本信息）
    const parsed = saved._version ? saved.columns : saved

    // 创建一个 Map 用于快速查找已保存的配置
    const map = new Map(parsed.map(i => [i.field, i]))

    // 以默认配置为基准，合并已保存的配置
    return fallback.map(f => {
      const savedCol = map.get(f.field)
      return {
        ...f,
        // 合并用户配置的所有属性
        visible: savedCol?.visible !== undefined ? savedCol.visible : f.visible,
        width: savedCol?.width || f.width,
        fixed: savedCol?.fixed !== undefined ? savedCol.fixed : f.fixed,
        order: savedCol?.order !== undefined ? savedCol.order : f.order
      }
    })
  } catch (error) {
    console.error('加载列配置失败:', error)
    return JSON.parse(JSON.stringify(fallback))
  }
}

/**
 * 保存列配置到 localStorage
 * @param {string} key - localStorage 的 key
 * @param {Array} cols - 列配置数组
 * @param {string} version - 配置版本号
 */
export function saveColumns(key, cols, version) {
  try {
    const data = version
      ? {
          _version: version,
          _timestamp: Date.now(),
          columns: cols
        }
      : cols
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('保存列配置失败:', error)
  }
}

/**
 * 列配置管理 Hook
 * @param {Object} options - 配置选项
 * @param {string} options.storageKey - localStorage 的 key
 * @param {Array} options.defaultColumns - 默认列配置
 * @returns {Object} 列配置相关的状态和方法
 */
export function useColumnConfig({ storageKey, defaultColumns }) {
  // 列配置状态
  const columns = ref(loadColumns(storageKey, defaultColumns))

  // 列配置对话框显示状态
  const columnConfigVisible = ref(false)

  /**
   * 计算可见的列（过滤 + 排序）
   */
  const visibleColumns = computed(() => {
    return columns.value
      .filter(c => c.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  /**
   * 打开列配置对话框
   */
  const openColumnConfig = () => {
    columnConfigVisible.value = true
  }

  /**
   * 关闭列配置对话框
   */
  const closeColumnConfig = () => {
    columnConfigVisible.value = false
  }

  /**
   * 应用列配置
   * @param {Array} newColumns - 新的列配置
   */
  const applyColumnConfig = newColumns => {
    columns.value = JSON.parse(JSON.stringify(newColumns))
    saveColumns(storageKey, columns.value)
    closeColumnConfig()
  }

  /**
   * 重置列配置为默认值
   */
  const resetColumns = () => {
    columns.value = JSON.parse(JSON.stringify(defaultColumns))
    saveColumns(storageKey, columns.value)
  }

  /**
   * 更新列配置（不保存到 localStorage）
   * @param {Array} newColumns - 新的列配置
   */
  const updateColumns = newColumns => {
    columns.value = newColumns
  }

  return {
    columns,
    visibleColumns,
    columnConfigVisible,
    openColumnConfig,
    closeColumnConfig,
    applyColumnConfig,
    resetColumns,
    updateColumns
  }
}
