/**
 * 无界样式桥接插件
 * 将子应用内包含 vxe-table 的样式同步到主应用的 document.head
 * 警告：会造成样式全局污染，仅在确需复用子应用样式时使用
 */
const STYLE_ID_PREFIX = 'wujie-vxe-style-bridge'

function ensureStyleElement(id) {
  let styleEl = document.getElementById(id)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = id
    document.head.appendChild(styleEl)
  }
  return styleEl
}

function syncStyleContent(content, key = 'vxe') {
  if (!content) return
  const styleEl = ensureStyleElement(`${STYLE_ID_PREFIX}-${key}`)
  if (styleEl.textContent !== content) {
    styleEl.textContent = content
  }
}

function syncLink(href) {
  if (!href) return
  const id = `${STYLE_ID_PREFIX}-link`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

// 主动从 iframe 内同步 vxe 相关样式（用于兜底）
export function syncVxeStylesFromIframe(iframeWindow) {
  try {
    const doc = iframeWindow?.document
    if (!doc) return

    // 同步 style 内联样式
    const styleNodes = Array.from(doc.querySelectorAll('style'))
    let merged = ''
    styleNodes.forEach((styleEl) => {
      const content = styleEl.textContent || ''
      if (content.includes('vxe-table') || content.includes('.vxe-')) {
        merged += content + '\n'
      }
    })
    if (merged) {
      syncStyleContent(merged, 'style-scan')
    }

    // 同步外链样式
    const linkNodes = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    linkNodes.forEach((linkEl, idx) => {
      const href = linkEl.getAttribute('href') || ''
      if (href && href.includes('vxe')) {
        const id = `${STYLE_ID_PREFIX}-link-${idx}`
        if (!document.getElementById(id)) {
          const link = document.createElement('link')
          link.id = id
          link.rel = 'stylesheet'
          link.href = href
          document.head.appendChild(link)
        }
      }
    })
  } catch (err) {
    console.warn('[wujie] scan vxe styles failed:', err)
  }
}

export function createVxeStyleBridgePlugin() {
  return {
    name: 'vxe-style-bridge',
    appendOrInsertElementHook(element, iframeWindow) {
      try {
        if (!element || !element.tagName) return
        const tag = element.tagName.toUpperCase()

        // 无界会把外链 CSS 转成 style 元素插入到子应用 iframe
        if (tag === 'STYLE') {
          const content = element.innerHTML || ''
          // 只同步 vxe-table 相关样式，避免全量污染
          if (content.includes('vxe-table') || content.includes('.vxe-')) {
            syncStyleContent(content, 'style')
            // 保底再把 iframe 已有样式扫描一次
            syncVxeStylesFromIframe(iframeWindow)
          }
        } else if (tag === 'LINK') {
          const href = element.getAttribute('href') || ''
          if (href && href.includes('vxe')) {
            syncLink(href)
            syncVxeStylesFromIframe(iframeWindow)
          }
        }
      } catch (err) {
        // 不阻断子应用运行，只记录日志
        console.warn('[wujie] vxe-style-bridge failed:', err)
      }
    }
  }
}
