/**
 * 输入修复指令
 * 解决长时间运行后输入框无响应的问题
 */

const inputFix = {
  bind(el, binding, vnode) {
    // 为输入元素添加修复机制
    const fixInput = () => {
      const inputs = el.querySelectorAll('input, textarea, select')
      inputs.forEach(input => {
        // 重新激活输入元素
        if (input.disabled === false) {
          try {
            // 触发重新渲染
            input.style.pointerEvents = 'none'
            setTimeout(() => {
              input.style.pointerEvents = 'auto'
            }, 10)
          } catch (e) {
            console.warn('输入修复失败:', e)
          }
        }
      })
    }

    // 绑定修复方法到元素
    el._inputFix = fixInput
    
    // 定期检查并修复
    el._fixTimer = setInterval(fixInput, 60000) // 每分钟检查一次
  },

  unbind(el) {
    // 清理定时器
    if (el._fixTimer) {
      clearInterval(el._fixTimer)
      el._fixTimer = null
    }
    el._inputFix = null
  }
}

export default inputFix

