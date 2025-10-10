/**
 * 紧急修复工具
 * 当遇到输入无响应时的快速修复方法
 */

// 修复输入无响应问题 - 模拟打开控制台的效果
export function fixInputFreeze() {
  console.log('🚨 模拟控制台激活效果，修复输入无响应...')
  
  try {
    // 1. 模拟控制台激活时的窗口事件
    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('resize'))
    
    // 2. 触发Vue DevTools的重新连接效果
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      // 模拟DevTools的激活
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush')
    }
    
    // 3. 强制重新计算所有元素的样式和布局
    document.body.style.display = 'none'
    document.body.offsetHeight // 触发重排
    document.body.style.display = ''
    
    // 4. 重新激活页面焦点管理
    const activeElement = document.activeElement
    if (activeElement && activeElement.blur) {
      activeElement.blur()
    }
    
    // 5. 触发全局的resize事件，重新激活所有监听器
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      
      // 6. 重新激活Vue实例
      const app = document.getElementById('app').__vue__
      if (app) {
        app.$forceUpdate()
        forceUpdateAllChildren(app)
      }
    }, 50)

    console.log('✅ 模拟控制台激活修复完成')
    
  } catch (error) {
    console.error('修复失败:', error)
  }
}

// 递归强制更新所有子组件
function forceUpdateAllChildren(vm) {
  if (vm.$children && vm.$children.length > 0) {
    vm.$children.forEach(child => {
      try {
        child.$forceUpdate()
        forceUpdateAllChildren(child)
      } catch (e) {
        console.warn('强制更新子组件失败:', e)
      }
    })
  }
}

// 检测输入是否响应
export function checkInputResponsiveness() {
  const testInput = document.createElement('input')
  testInput.style.position = 'absolute'
  testInput.style.left = '-9999px'
  testInput.style.opacity = '0'
  document.body.appendChild(testInput)
  
  return new Promise((resolve) => {
    let responded = false
    
    const testHandler = () => {
      responded = true
      resolve(true)
    }
    
    testInput.addEventListener('input', testHandler)
    testInput.focus()
    testInput.value = 'test'
    testInput.dispatchEvent(new Event('input'))
    
    setTimeout(() => {
      testInput.removeEventListener('input', testHandler)
      document.body.removeChild(testInput)
      if (!responded) {
        resolve(false)
      }
    }, 1000)
  })
}

// 自动检测和修复
export function startAutoFix() {
  setInterval(async () => {
    const isResponsive = await checkInputResponsiveness()
    if (!isResponsive) {
      console.warn('🚨 检测到输入无响应，模拟控制台激活进行修复...')
      fixInputFreeze()
    }
  }, 30000) // 每30秒检查一次
}

// 添加快捷键修复
export function addKeyboardShortcut() {
  document.addEventListener('keydown', (event) => {
    // Ctrl + Shift + F (修复快捷键)
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      event.preventDefault()
      console.log('🎯 快捷键触发修复')
      fixInputFreeze()
    }
  })
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.fixInputFreeze = fixInputFreeze
  window.checkInputResponsiveness = checkInputResponsiveness
  window.startAutoFix = startAutoFix
}
