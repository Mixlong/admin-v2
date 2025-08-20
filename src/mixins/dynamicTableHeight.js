/**
 * 动态表格高度计算 Mixin
 * 用于自动计算表格高度，响应搜索表单区域的折叠/展开
 */
export default {
  data() {
    return {
      // 动态表格高度
      dynamicTableHeight: 400,
      
      // ResizeObserver实例
      searchFormObserver: null
    }
  },

  mounted() {
    // 初始化动态表格高度
    this.initDynamicTableHeight()
  },

  beforeDestroy() {
    // 清理ResizeObserver
    if (this.searchFormObserver) {
      this.searchFormObserver.disconnect()
      this.searchFormObserver = null
    }
  },

  methods: {
    /**
     * 初始化动态表格高度
     * @param {Object} options 配置选项
     * @param {string} options.searchFormSelector 搜索表单容器选择器，默认'.intelligent-search-form'
     * @param {number} options.topOffset 顶部固定区域高度，默认244
     * @param {number} options.minHeight 表格最小高度，默认300
     * @param {number} options.debounceTime 防抖时间，默认100ms
     */
    initDynamicTableHeight(options = {}) {
      const config = {
        searchFormSelector: '.intelligent-search-form',
        topOffset: 244,
        minHeight: 300,
        debounceTime: 100,
        ...options
      }

      // 保存配置到实例
      this._tableHeightConfig = config

      // 初始计算
      this.calculateTableHeight()
      
      // 监听搜索表单区域高度变化
      this.$nextTick(() => {
        const searchFormContainer = this.$el.querySelector(config.searchFormSelector)
        if (searchFormContainer && window.ResizeObserver) {
          this.searchFormObserver = new ResizeObserver(
            this.debounce(() => {
              this.calculateTableHeight()
            }, config.debounceTime)
          )
          this.searchFormObserver.observe(searchFormContainer)
        }
      })

      // 监听IntelligentSearchForm的layout-changed事件
      this.$on('layout-changed', () => {
        this.debounce(() => {
          this.calculateTableHeight()
        }, config.debounceTime)()
      })
    },

    /**
     * 计算表格高度
     * @param {Object} customConfig 自定义配置，会覆盖初始配置
     */
    calculateTableHeight(customConfig = {}) {
      this.$nextTick(() => {
        const config = { ...this._tableHeightConfig, ...customConfig }
        const windowHeight = document.documentElement.clientHeight
        const searchFormContainer = this.$el.querySelector(config.searchFormSelector)
        
        if (searchFormContainer) {
          // 获取搜索表单的实际高度
          const searchFormHeight = searchFormContainer.offsetHeight
          
          // 计算内容区域高度：页面高度 - 顶部固定区域
          const contentAreaHeight = windowHeight - config.topOffset
          
          // 内容区域高度 - 搜索栏高度 = 表格可用高度
          const calculatedHeight = contentAreaHeight - searchFormHeight
          
          // 设置最小高度，避免表格过小
          this.dynamicTableHeight = Math.max(calculatedHeight, config.minHeight)
          
          // 调试信息
          if (process.env.NODE_ENV === 'development') {
            console.log(`表格高度计算: 窗口=${windowHeight}, 内容区域=${contentAreaHeight}(窗口-${config.topOffset}), 搜索表单=${searchFormHeight}, 表格=${this.dynamicTableHeight}`)
          }
        } else {
          // 降级到原有计算方式
          this.dynamicTableHeight = this.tableHeight ? this.tableHeight(-60) : 400
        }
      })
    },

    /**
     * 手动重新计算表格高度
     * 用于特殊情况下需要手动触发重新计算
     */
    refreshTableHeight() {
      this.calculateTableHeight()
    },

    /**
     * 防抖函数
     * @param {Function} func 要执行的函数
     * @param {number} wait 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
  }
}
