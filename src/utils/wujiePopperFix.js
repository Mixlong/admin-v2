/**
 * 无界微前端 Element UI Popper 定位修复
 * 在子应用中修复 fixed 定位问题
 */

/**
 * 方案一：修改 Element UI Popper 的 appendToBody 行为
 * 将 popper 元素挂载到正确的容器
 */
export function fixPopperAppendToBody() {
  if (!window.__POWERED_BY_WUJIE__) {
    console.log('⚠️ 非无界环境，跳过 Popper 修复')
    return
  }

  console.log('🔧 [V2] 开始修复 Element UI Popper 定位')

  // 方案：将所有 fixed 定位改为 absolute
  const style = document.createElement('style')
  style.id = 'wujie-popper-fix'
  style.textContent = `
    /* 无界微前端 Element UI Popper 定位修复 */
    .el-popper {
      position: absolute !important;
    }
    .el-tooltip__popper {
      position: absolute !important;
    }
    
    /* 无界微前端 VXE-Table Tooltip 定位修复 */
    .vxe-table--tooltip-wrapper,
    .vxe-tooltip--wrapper {
      position: absolute !important;
    }
  `

  // 插入到 head 最后，确保优先级
  document.head.appendChild(style)
  console.log('✅ [V2] Popper CSS 修复已应用')
}

/**
 * 方案二：劫持 Element UI 的 PopupManager
 * 修改 z-index 管理和定位计算
 */
export function fixPopupManager() {
  if (!window.__POWERED_BY_WUJIE__) {
    return
  }

  try {
    // 尝试获取 Element UI 的 PopupManager
    const ElementUI = window.ELEMENT
    if (!ElementUI) {
      console.warn('⚠️ [V2] 未找到 Element UI 实例')
      return
    }

    console.log('🔧 [V2] 修复 PopupManager')

    // 这里可以添加更多的 PopupManager 修复逻辑
    // 例如修改 nextZIndex 方法等

  } catch (e) {
    console.warn('⚠️ [V2] PopupManager 修复失败:', e)
  }
}

/**
 * 方案三：监听 DOM 变化，动态修复 popper 元素
 */
export function watchPopperElements() {
  if (!window.__POWERED_BY_WUJIE__) {
    return
  }

  console.log('🔧 [V2] 开始监听 Popper 元素')

  // Popper 相关的 class 名称
  const popperClassNames = [
    'el-select-dropdown',
    'el-picker-panel',
    'el-autocomplete-suggestion',
    'el-dropdown-menu',
    'el-popover',
    'el-tooltip__popper',
    'el-date-picker',
    'el-time-panel',
    'el-cascader-menu',
    'el-color-picker__panel'
  ]

  // 检查元素是否是 popper
  const isPopperElement = (element) => {
    if (!element || !element.className) return false
    const className = element.className
    return popperClassNames.some(cls => className.includes(cls))
  }

  // 修复单个 popper 元素
  const fixPopperElement = (element) => {
    if (!element || !element.style) return

    // 将 fixed 改为 absolute
    if (element.style.position === 'fixed') {
      element.style.position = 'absolute'
      console.log('🔧 [V2] 修复 Popper 元素定位:', element.className)
    }

    // 确保 z-index 足够高
    const zIndex = parseInt(element.style.zIndex || '0')
    if (zIndex < 2000) {
      element.style.zIndex = '2000'
    }
  }

  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 检查新增的节点
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element 节点
          if (isPopperElement(node)) {
            fixPopperElement(node)
          }
          // 检查子节点
          if (node.querySelectorAll) {
            popperClassNames.forEach(className => {
              const poppers = node.querySelectorAll(`.${className}`)
              poppers.forEach(fixPopperElement)
            })
          }
        }
      })
    })
  })

  // 开始观察 body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('✅ [V2] Popper 元素监听已启动')

  // 返回清理函数
  return () => {
    observer.disconnect()
    console.log('🛑 [V2] Popper 元素监听已停止')
  }
}

/**
 * 方案四：劫持 document.body.appendChild
 * 在元素添加到 DOM 时修复定位
 */
export function hijackAppendChild() {
  if (!window.__POWERED_BY_WUJIE__) {
    return
  }

  console.log('🔧 [V2] 劫持 appendChild 方法')

  const popperClassNames = [
    'el-select-dropdown',
    'el-picker-panel',
    'el-autocomplete-suggestion',
    'el-dropdown-menu',
    'el-popover',
    'el-tooltip__popper',
    'el-date-picker',
    'el-time-panel'
  ]

  const isPopperElement = (element) => {
    if (!element || !element.className) return false
    const className = element.className
    return popperClassNames.some(cls => className.includes(cls))
  }

  // 保存原始方法
  const originalAppendChild = document.body.appendChild

  // 劫持 appendChild
  document.body.appendChild = function (element) {
    // 检查是否是 popper 元素
    if (isPopperElement(element)) {
      console.log('🔧 [V2] 拦截 Popper 元素:', element.className)

      // 修改定位方式
      if (element.style) {
        element.style.position = 'absolute'
      }
    }

    // 调用原始方法
    return originalAppendChild.call(this, element)
  }

  console.log('✅ [V2] appendChild 劫持完成')
}

/**
 * 初始化所有修复方案
 */
export function initPopperFix() {
  if (!window.__POWERED_BY_WUJIE__) {
    console.log('⚠️ 非无界环境，跳过 Popper 修复')
    return
  }

  console.log('🚀 [V2] 初始化 Popper 定位修复')

  // 方案一：CSS 修复（最简单有效）
  fixPopperAppendToBody()

  // 方案二：PopupManager 修复
  // fixPopupManager()

  // 方案三：监听 DOM 变化（备用）
  // const cleanup = watchPopperElements()

  // 方案四：劫持 appendChild（备用）
  // hijackAppendChild()

  console.log('✅ [V2] Popper 定位修复初始化完成')
}

export default {
  initPopperFix,
  fixPopperAppendToBody,
  fixPopupManager,
  watchPopperElements,
  hijackAppendChild
}
