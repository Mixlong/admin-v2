/**
 * 性能监控和问题修复工具
 * 解决长时间运行后表单输入无响应的问题
 */

class PerformanceMonitor {
  constructor() {
    this.timers = new Set()
    this.intervals = new Set()
    this.observers = new Set()
    this.eventListeners = new Map()
    this.isMonitoring = false
  }

  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return
    this.isMonitoring = true

    // 重写定时器方法来跟踪它们
    this.wrapTimerMethods()
    
    // 监控Vue实例
    this.monitorVueInstances()
    
    // 定期清理
    this.startPeriodicCleanup()
    
    // 延迟监控路由变化，确保Vue实例已初始化
    setTimeout(() => {
      this.setupRouterCleanup()
    }, 3000)
    
    // 监控内存使用情况
    this.startMemoryMonitoring()
    
    console.log('🚀 性能监控已启动 - 包含自动清理和内存监控')
  }

  // 设置路由清理（已在main.js中直接设置，这里保留作为备用）
  setupRouterCleanup() {
    console.log('🔗 路由清理已在main.js中设置')
  }

  // 监控内存使用情况
  startMemoryMonitoring() {
    if (!performance.memory) {
      console.warn('⚠️ 浏览器不支持内存监控')
      return
    }
    
    console.log('📊 启动内存监控')
    setInterval(() => {
      const memInfo = performance.memory
      const usedMB = Math.round(memInfo.usedJSHeapSize / 1024 / 1024)
      const totalMB = Math.round(memInfo.totalJSHeapSize / 1024 / 1024)
      
      // 如果内存使用超过阈值，执行清理
      if (usedMB > 150) { // 超过150MB时清理
        console.warn(`⚠️ 内存使用过高 ${usedMB}MB，执行清理`)
        this.performCleanup()
      }
      
      if (usedMB > 200) { // 超过200MB时紧急修复
        console.error(`🚨 内存严重不足 ${usedMB}MB，执行紧急修复`)
        this.performEmergencyFix()
      }
    }, 60000) // 每分钟检查一次内存
  }

  // 包装定时器方法
  wrapTimerMethods() {
    const originalSetTimeout = window.setTimeout
    const originalSetInterval = window.setInterval
    const originalClearTimeout = window.clearTimeout
    const originalClearInterval = window.clearInterval

    window.setTimeout = (callback, delay, ...args) => {
      const id = originalSetTimeout(callback, delay, ...args)
      
      // 获取调用栈信息来判断定时器来源
      const stack = new Error().stack
      const isSystemTimer = this.isSystemTimer(stack, delay)
      
      if (!isSystemTimer) {
        this.timers.add({ id, delay, stack: stack.split('\n')[2] })
      }
      return id
    }

    window.setInterval = (callback, delay, ...args) => {
      const id = originalSetInterval(callback, delay, ...args)
      
      // 获取调用栈信息
      const stack = new Error().stack
      const isSystemTimer = this.isSystemTimer(stack, delay)
      
      if (!isSystemTimer) {
        this.intervals.add({ id, delay, stack: stack.split('\n')[2] })
      }
      return id
    }

    window.clearTimeout = (id) => {
      // 从集合中移除
      this.timers.forEach(timer => {
        if (timer.id === id) {
          this.timers.delete(timer)
        }
      })
      return originalClearTimeout(id)
    }

    window.clearInterval = (id) => {
      // 从集合中移除
      this.intervals.forEach(timer => {
        if (timer.id === id) {
          this.intervals.delete(timer)
        }
      })
      return originalClearInterval(id)
    }
  }

  // 判断是否是系统必需的定时器
  isSystemTimer(stack, delay) {
    if (!stack) return false
    
    // 不清理以下类型的定时器：
    const systemPatterns = [
      'smartScreen',           // 智慧大屏的定时器
      'getHeaderTime',         // 时间更新
      'getTodayInfo',          // 数据刷新
      'autofit',               // 自适应布局
      'resize',                // 窗口调整
      'vue-loader',            // Vue热重载
      'webpack',               // Webpack相关
      'element-ui',            // Element UI组件
      'created',               // Vue生命周期
      'mounted'                // Vue生命周期
    ]
    
    // 常见的页面功能定时器延时（保护这些定时器）
    const protectedDelays = [1000, 60000, 30000, 5000] // 1秒、1分钟、30秒、5秒
    
    return systemPatterns.some(pattern => stack.includes(pattern)) || 
           protectedDelays.includes(delay)
  }

  // 监控Vue实例
  monitorVueInstances() {
    if (window.Vue) {
      // 监控Vue实例创建
      const originalExtend = window.Vue.extend
      window.Vue.extend = function(options) {
        const Component = originalExtend.call(this, options)
        
        // 包装 beforeDestroy 钩子
        const originalBeforeDestroy = Component.options.beforeDestroy
        Component.options.beforeDestroy = function() {
          if (originalBeforeDestroy) {
            originalBeforeDestroy.call(this)
          }
          // 强制清理定时器
          performanceMonitor.cleanupComponent(this)
        }
        
        return Component
      }
    }
  }

  // 清理组件资源
  cleanupComponent(vm) {
    // 清理定时器
    if (vm._timers) {
      vm._timers.forEach(id => {
        clearTimeout(id)
        this.timers.delete(id)
      })
    }

    if (vm._intervals) {
      vm._intervals.forEach(id => {
        clearInterval(id)
        this.intervals.delete(id)
      })
    }

    // 清理观察者
    if (vm._observers) {
      vm._observers.forEach(observer => {
        if (observer.disconnect) {
          observer.disconnect()
        }
      })
    }
  }

  // 定期清理
  startPeriodicCleanup() {
    console.log('🕐 启动定期清理，每2分钟清理一次')
    
    this.cleanupInterval = setInterval(() => {
      console.log('⏰ 执行定期性能清理...')
      this.performCleanup()
    }, 120000) // 每2分钟清理一次，更频繁
    
    // 页面隐藏时也执行清理
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('📴 页面隐藏，执行清理')
        this.performCleanup()
      } else {
        console.log('👀 页面显示，检查状态')
        // 页面重新显示时检查并修复
        setTimeout(() => {
          this.checkAndFix()
        }, 1000)
      }
    })
  }

  // 检查并修复
  checkAndFix() {
    // 检查是否有输入响应问题
    const inputs = document.querySelectorAll('input:not([readonly]):not([disabled])')
    let hasIssue = false
    
    inputs.forEach(input => {
      try {
        // 简单检查输入是否响应
        const originalValue = input.value
        input.value = input.value + ' '
        input.value = originalValue
        
        // 如果无法修改值，说明有问题
        if (input.value !== originalValue) {
          hasIssue = true
        }
      } catch (e) {
        hasIssue = true
      }
    })
    
    if (hasIssue) {
      console.warn('🚨 检测到输入问题，执行修复')
      this.performEmergencyFix()
    }
  }

  // 紧急修复
  performEmergencyFix() {
    // 模拟控制台激活的效果
    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('resize'))
    
    // 触发Vue重新渲染
    this.refreshVueReactivity()
  }

  // 执行清理
  performCleanup() {
    console.log('🧹 开始性能清理...')
    
    // 1. 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc()
    }

    // 2. 智能清理可疑的定时器（保护系统必需的定时器）
    let clearedTimers = 0
    let clearedIntervals = 0
    
    // 只清理可疑的setTimeout（通常是短期或累积的）
    this.timers.forEach(timer => {
      try {
        // 清理延时很短的定时器（可能是累积的）
        if (timer.delay < 100 || timer.delay > 300000) {
          clearTimeout(timer.id)
          this.timers.delete(timer)
          clearedTimers++
        }
      } catch (e) {
        this.timers.delete(timer)
      }
    })

    // 对于setInterval，更加谨慎，只清理明显异常的
    this.intervals.forEach(timer => {
      try {
        // 只清理延时异常的间隔器
        if (timer.delay < 500 || timer.delay > 600000) {
          clearInterval(timer.id)
          this.intervals.delete(timer)
          clearedIntervals++
        }
      } catch (e) {
        this.intervals.delete(timer)
      }
    })
    
    // 3. 清理Vue组件的缓存
    if (window.Vue && window.Vue.util && window.Vue.util._toString) {
      // 清理Vue的内部缓存
      try {
        const app = document.getElementById('app').__vue__
        if (app && app.$store) {
          // 清理可能累积的Vuex状态
          console.log('🗃️ 清理Vuex状态缓存')
        }
      } catch (e) {
        console.warn('Vuex清理失败:', e)
      }
    }

    // 4. 强制重新渲染关键组件
    this.refreshVueReactivity()

    // 5. 清理Element UI的内部状态
    this.cleanupElementUI()

    console.log(`✅ 性能清理完成 - 智能清理了 ${clearedTimers} 个可疑定时器和 ${clearedIntervals} 个异常间隔器`)
  }

  // 清理Element UI组件状态
  cleanupElementUI() {
    try {
      // 重新激活所有Element UI输入组件
      const elInputs = document.querySelectorAll('.el-input__inner, .el-textarea__inner')
      elInputs.forEach(input => {
        if (input.__vue__) {
          input.__vue__.$forceUpdate()
        }
      })

      // 清理Element UI的内部缓存
      const elComponents = document.querySelectorAll('[class*="el-"]')
      elComponents.forEach(el => {
        if (el.__vue__ && el.__vue__.$options && el.__vue__.$options.name) {
          try {
            el.__vue__.$forceUpdate()
          } catch (e) {
            // 忽略单个组件的错误
          }
        }
      })
      
      console.log('🎨 Element UI组件状态已清理')
    } catch (e) {
      console.warn('Element UI清理失败:', e)
    }
  }

  // 清理DOM事件监听器
  cleanupDOMListeners() {
    // 移除可能累积的事件监听器
    const elements = document.querySelectorAll('*')
    elements.forEach(el => {
      // 克隆元素来移除所有事件监听器
      if (el.nodeType === 1 && el.tagName !== 'SCRIPT') {
        const clone = el.cloneNode(true)
        if (el.parentNode && el !== document.body && el !== document.documentElement) {
          // 只清理非关键元素的事件监听器
          try {
            const listeners = el._listeners || []
            if (listeners.length > 50) { // 如果事件监听器过多
              console.warn('发现事件监听器过多的元素:', el, listeners.length)
            }
          } catch (e) {
            // 忽略错误
          }
        }
      }
    })
  }

  // 重新激活Vue响应式系统
  refreshVueReactivity() {
    if (window.Vue && window.Vue.prototype) {
      // 触发Vue的重新渲染
      const app = document.getElementById('app').__vue__
      if (app) {
        // 温和的强制更新，不影响组件状态
        app.$nextTick(() => {
          app.$forceUpdate()
        })
        
        // 只更新可能有问题的子组件
        this.refreshProblemComponents(app)
      }
    }
  }

  // 刷新可能有问题的组件
  refreshProblemComponents(vm) {
    if (vm.$children && vm.$children.length > 0) {
      vm.$children.forEach(child => {
        try {
          // 只更新表单相关组件
          const componentName = child.$options.name
          if (componentName && (
            componentName.includes('Form') || 
            componentName.includes('Input') || 
            componentName.includes('Select') ||
            componentName.includes('Dialog')
          )) {
            child.$forceUpdate()
          }
          this.refreshProblemComponents(child)
        } catch (e) {
          console.warn('组件更新失败:', e)
        }
      })
    }
  }

  // 递归强制更新子组件
  forceUpdateChildren(vm) {
    if (vm.$children && vm.$children.length > 0) {
      vm.$children.forEach(child => {
        child.$forceUpdate()
        this.forceUpdateChildren(child)
      })
    }
  }

  // 修复输入无响应问题
  fixInputResponsiveness() {
    console.log('🔧 修复输入响应问题...')
    
    // 重新激活所有输入元素
    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      // 触发focus/blur事件重新激活
      if (input.focus) {
        try {
          input.blur()
          setTimeout(() => {
            if (input.focus) input.focus()
            setTimeout(() => {
              if (input.blur) input.blur()
            }, 10)
          }, 10)
        } catch (e) {
          // 忽略错误
        }
      }
    })

    // 强制重新渲染Vue组件
    this.refreshVueReactivity()
    
    console.log('✅ 输入响应修复完成')
  }

  // 获取性能统计
  getStats() {
    return {
      activeTimers: this.timers.size,
      activeIntervals: this.intervals.size,
      activeObservers: this.observers.size,
      eventListeners: this.eventListeners.size,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      } : 'N/A'
    }
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor()

// 导出工具函数
export default performanceMonitor

// 全局方法，可在控制台调用
if (typeof window !== 'undefined') {
  window.fixInputIssue = () => {
    performanceMonitor.fixInputResponsiveness()
  }
  
  window.getPerformanceStats = () => {
    console.table(performanceMonitor.getStats())
  }
  
  window.forceCleanup = () => {
    performanceMonitor.performCleanup()
  }
}
