const DEFAULT_STORAGE_VERSION = 1

function safeParseJSON(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeColumn(col) {
  const key = col.key ?? col.field ?? col.prop
  const normalized = {
    ...col,
    key,
    visible: col.visible ?? true,
    locked: col.locked ?? false,
    pinOrder: Number.isFinite(col.pinOrder) ? col.pinOrder : 0
  }
  // 递归处理子列
  if (col.children && Array.isArray(col.children)) {
    normalized.children = col.children.map(normalizeColumn)
  }
  return normalized
}

export function normalizeColumns(columns) {
  if (!Array.isArray(columns)) return []
  return columns.map(normalizeColumn)
}

function normalizeFixedOrder(columns) {
  // vxe-table 的渲染规则：fixed='left' 固定在最左，fixed='right' 固定在最右
  // 为了让“列设置顺序”和“表格显示顺序”一致，这里做一次稳定分组。
  const left = []
  const center = []
  const right = []

  columns.forEach((col, idx) => {
    const item = { col, idx }
    if (col?.fixed === 'left') left.push(item)
    else if (col?.fixed === 'right') right.push(item)
    else center.push(item)
  })

  const byPinOrder = (a, b) => {
    const ap = Number.isFinite(a.col?.pinOrder) ? a.col.pinOrder : 0
    const bp = Number.isFinite(b.col?.pinOrder) ? b.col.pinOrder : 0
    if (ap !== bp) return ap - bp
    return a.idx - b.idx
  }

  left.sort(byPinOrder)
  center.sort(byPinOrder)
  right.sort(byPinOrder)

  return [...left, ...center, ...right].map(x => x.col)
}

export function loadVxeColumnConfig(storageKey) {
  if (!storageKey) return null
  return safeParseJSON(localStorage.getItem(storageKey), null)
}

export function saveVxeColumnConfig(storageKey, config) {
  if (!storageKey) return
  localStorage.setItem(storageKey, JSON.stringify(config))
}

export function buildVxeColumnConfig(columns) {
  const config = {
    version: DEFAULT_STORAGE_VERSION,
    order: [],
    map: {},
    childrenOrder: {} // 保存每个分组的子列顺序
  }

  normalizeColumns(columns).forEach(col => {
    if (!col.key) return
    config.order.push(col.key)
    config.map[col.key] = {
      visible: !!col.visible,
      width: col.width ?? null,
      fixed: col.fixed ?? null,
      headerClassName: col.headerClassName ?? null
    }
    // 处理子列
    if (col.children && Array.isArray(col.children)) {
      config.childrenOrder[col.key] = col.children.map(c => c.key).filter(Boolean)
      col.children.forEach(child => {
        if (!child.key) return
        config.map[child.key] = {
          visible: child.visible !== false,
          width: child.width ?? null,
          fixed: child.fixed ?? null,
          headerClassName: child.headerClassName ?? null,
          parentKey: col.key // 记录所属分组
        }
      })
    }
  })

  return config
}

export function applyVxeColumnConfig(columns, savedConfig) {
  const normalized = normalizeColumns(columns)
  if (!savedConfig || typeof savedConfig !== 'object') return normalized

  const configMap = savedConfig.map && typeof savedConfig.map === 'object' ? savedConfig.map : {}
  const order = Array.isArray(savedConfig.order) ? savedConfig.order : []
  const childrenOrder = savedConfig.childrenOrder && typeof savedConfig.childrenOrder === 'object' ? savedConfig.childrenOrder : {}

  // 收集所有子列（用于跨分组拖拽后的重建）
  const allChildren = new Map()
  normalized.forEach(col => {
    if (col.children && Array.isArray(col.children)) {
      col.children.forEach(child => {
        if (child.key) allChildren.set(child.key, { ...child, originalParent: col.key })
      })
    }
  })

  const merged = normalized.map(col => {
    const saved = col.key ? configMap[col.key] : null
    
    // 处理子列
    let children = col.children
    if (col.children && Array.isArray(col.children)) {
      // 获取保存的子列顺序
      const savedChildOrder = childrenOrder[col.key] || []
      
      // 根据保存的配置重建子列（支持跨分组拖拽）
      const childrenByKey = new Map(col.children.map(c => [c.key, c]))
      const rebuiltChildren = []
      
      // 先按保存的顺序添加
      savedChildOrder.forEach(childKey => {
        const childSaved = configMap[childKey]
        // 检查这个子列是否应该在当前分组（可能从其他分组拖过来的）
        if (childSaved && childSaved.parentKey === col.key) {
          let child = childrenByKey.get(childKey) || allChildren.get(childKey)
          if (child) {
            const shouldIgnoreSavedWidth =
              child.width == null &&
              child.minWidth != null &&
              childSaved.width != null &&
              Number(childSaved.width) === Number(child.minWidth)

            rebuiltChildren.push({
              ...child,
              visible: typeof childSaved.visible === 'boolean' ? childSaved.visible : child.visible,
              width: shouldIgnoreSavedWidth ? child.width : childSaved.width ?? child.width,
              headerClassName: childSaved.headerClassName ?? col.headerClassName ?? child.headerClassName
            })
            childrenByKey.delete(childKey)
          }
        }
      })
      
      // 添加未在保存顺序中的子列（新增的列）
      childrenByKey.forEach((child, key) => {
        const childSaved = configMap[key]
        // 只添加原本属于这个分组或没有保存记录的
        if (!childSaved || childSaved.parentKey === col.key || !childSaved.parentKey) {
          if (childSaved) {
            const shouldIgnoreSavedWidth =
              child.width == null &&
              child.minWidth != null &&
              childSaved.width != null &&
              Number(childSaved.width) === Number(child.minWidth)
            rebuiltChildren.push({
              ...child,
              visible: typeof childSaved.visible === 'boolean' ? childSaved.visible : child.visible,
              width: shouldIgnoreSavedWidth ? child.width : childSaved.width ?? child.width
            })
          } else {
            rebuiltChildren.push(child)
          }
        }
      })
      
      children = rebuiltChildren
    }
    
    if (!saved) return { ...col, children }

    const shouldIgnoreSavedWidth =
      col.width == null &&
      col.minWidth != null &&
      saved.width != null &&
      Number(saved.width) === Number(col.minWidth)

    return {
      ...col,
      children,
      visible: col.locked ? true : typeof saved.visible === 'boolean' ? saved.visible : col.visible,
      width: shouldIgnoreSavedWidth ? col.width : saved.width ?? col.width,
      fixed: saved.fixed ?? col.fixed
    }
  })

  const hasAnyVisible = merged.some(c => {
    if (c.visible !== false) return true
    if (c.children && c.children.some(child => child.visible !== false)) return true
    return false
  })
  const safeMergedRaw = hasAnyVisible ? merged : merged.map(c => ({ ...c, visible: true }))
  const safeMerged = normalizeFixedOrder(safeMergedRaw)

  if (!order.length) return safeMerged

  const byKey = new Map(safeMerged.filter(c => c.key).map(c => [c.key, c]))
  const ordered = []
  order.forEach(key => {
    const col = byKey.get(key)
    if (col) ordered.push(col)
    byKey.delete(key)
  })
  byKey.forEach(col => ordered.push(col))

  return normalizeFixedOrder(ordered)
}
