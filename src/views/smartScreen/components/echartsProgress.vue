<template>
  <div class="echarts-progress" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 外层装饰圆环图片 -->
    <div class="outer-ring" 
         :style="{ 
           width: size + 'px', 
           height: size + 'px',
           backgroundImage: 'url(' + this.getImageUrl('radius-w.png') + ')',
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'center'
         }"></div>
    
    <!-- 内层装饰圆环图片 -->
    <div class="inner-ring" 
         :style="{ 
           width: '80px', 
           height: '80px',
           backgroundImage: 'url(' + this.getImageUrl('raduis.png') + ')',
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'center'
         }"></div>
    
    <!-- ECharts 进度条 -->
    <div ref="chartRef" :style="{ width: size + 'px', height: size + 'px' }" class="chart-container"></div>
    
    <!-- 纯CSS备用进度环 - 平板ECharts失败时显示 -->
    <div v-if="showFallback" class="fallback-progress" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" class="progress-svg">
        <!-- 背景环 -->
        <circle 
          :cx="size/2" 
          :cy="size/2" 
          :r="size * 0.35"
          fill="none"
          stroke="#FFFFFF"
          :stroke-width="size * 0.08"
          opacity="0.3"
        />
        <!-- 进度环 -->
        <circle 
          :cx="size/2" 
          :cy="size/2" 
          :r="size * 0.35"
          fill="none"
          :stroke="progressColor"
          :stroke-width="size * 0.08"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeOffset"
          stroke-linecap="round"
          transform-origin="center"
          :transform="`rotate(-90 ${size/2} ${size/2})`"
          class="progress-circle"
        />
      </svg>
    </div>
    
    <!-- 百分比文字 -->
    <div class="progress-text">
      <slot>{{ debugMode ? mockPercentage : percentage }}%</slot>
    </div>
    
    <!-- 调试控制面板 - TODO: 删除 -->
    <div v-if="debugMode" class="debug-controls">
      <div class="debug-title">调试模式</div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        v-model="mockPercentage" 
        @input="onDebugChange"
        class="debug-slider"
      />
      <div class="debug-info">
        <span>进度: {{ mockPercentage }}%</span>
        <span>状态: {{ mockPercentage >= 80 ? '良好' : mockPercentage >= 50 ? '警告' : '危险' }}</span>
      </div>
      <button @click="startAnimation" class="debug-btn">测试动画</button>
      <button @click="testResize" class="debug-btn">测试Resize</button>
      <button @click="toggleFallback" class="debug-btn">{{ showFallback ? '使用ECharts' : '使用CSS备用' }}</button>
    </div>
  </div>
</template>

<script>
// 使用全局CDN的ECharts 5.4.3 (移动端兼容性更好)
// ECharts 6.0.0 在某些平板和移动设备上存在兼容性问题
// import * as echarts from 'echarts'

export default {
  name: 'EchartsProgress',
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 140
    },
    thresholds: {
      type: Object,
      default: () => ({
        good: 80,    // >= 80% green
        warning: 50  // >= 50% orange, < 80%
      })
    },
    colors: {
      type: Object,
      default: () => ({
        good: '#00E8B5',     // green
        warning: '#FF8C00',  // orange  
        danger: '#FF4757'    // red
      })
    }
  },
  data() {
    return {
      chart: null,
      showFallback: false, // 是否显示CSS备用方案
      chartInitFailed: false, // ECharts初始化是否失败
      // 临时调试数据 - TODO: 删除
      debugMode: true,
      mockPercentage: 75,
      animationTimer: null
    }
  },
  computed: {
    progressColor() {
      if (this.percentage >= this.thresholds.good) {
        return this.colors.good;
      } else if (this.percentage >= this.thresholds.warning) {
        return this.colors.warning;
      } else {
        return this.colors.danger;
      }
    },
    progressGradient() {
      if (this.percentage >= this.thresholds.good) {
        return {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#00FFB3' },
            { offset: 1, color: '#00E8B5' }
          ]
        };
      } else if (this.percentage >= this.thresholds.warning) {
        return {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#FFB800' },
            { offset: 1, color: '#FF8C00' }
          ]
        };
      } else {
        return {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#FF6B7A' },
            { offset: 1, color: '#FF4757' }
          ]
        };
      }
    },
    chartOption() {
      // 调试模式使用模拟数据 - TODO: 删除
      const progressValue = this.debugMode ? this.mockPercentage : this.percentage;
      const remainingValue = 100 - progressValue;

      return {
        series: [
          // 主要进度环形图（兼容移动端的配置）
          {
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['73%', '85%'], // 调整环形图厚度，更接近设计稿
            avoidLabelOverlap: false,
            // 移动端兼容性：padAngle在某些版本可能不支持
            ...(this.isMobileCompatible() ? {} : { padAngle: 8 }),
            itemStyle: {
              // 移动端兼容性：borderRadius支持检查
              ...(this.supportsBorderRadius() ? { borderRadius: 6 } : {}),
              borderWidth: 0,
              shadowBlur: 0,
            },
            emphasis: {
              disabled: true // 禁用悬停效果
            },
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: progressValue,
                name: 'progress',
                itemStyle: {
                  color: this.progressGradient,
                  // 移动端兼容性优化
                  ...(this.supportsBorderRadius() ? { borderRadius: 6 } : {}),
                  shadowBlur: 6,
                  shadowColor: this.progressColor,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  opacity: 0.95
                }
              },
              {
                value: remainingValue,
                name: 'remaining',
                itemStyle: {
                  color: '#FFFFFF',
                  ...(this.supportsBorderRadius() ? { borderRadius: 6 } : {}),
                  shadowBlur: 12,
                  shadowColor: '#FFFFFF',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  opacity: 1
                }
              }
            ],
            startAngle: 90,
            clockwise: true,
            // 移动端优化的动画配置
            animation: true,
            animationType: 'scale',
            animationEasing: 'cubicOut',
            animationDelay: 0,
            animationDuration: this.isMobileDevice() ? 600 : 1000, // 移动端动画更快
            // 移动端兼容性：某些属性可能不支持
            ...(this.supportsAdvancedAnimation() ? {
              animationThreshold: 2000,
              animationDurationUpdate: 500
            } : {})
          }
        ],
        tooltip: {
          show: false
        },
        // 移动端兼容性：aria支持检查
        ...(this.supportsAria() ? { aria: { enabled: false } } : {})
      }
    },
    // CSS备用方案的计算属性
    circumference() {
      return 2 * Math.PI * (this.size * 0.35)
    },
    strokeOffset() {
      const progress = this.debugMode ? this.mockPercentage : this.percentage
      return this.circumference - (progress / 100) * this.circumference
    }
  },
  mounted() {
    // 延迟初始化确保DOM完全渲染
    this.$nextTick(() => {
      this.initChart()
    })
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('resize', this.handleResize)
    
    if (this.chart && !this.chart.isDisposed()) {
      this.chart.dispose()
    }
  },
  watch: {
    percentage: {
      handler() {
        this.updateChart()
      },
      immediate: true
    },
    // 调试模式监听 - TODO: 删除
    mockPercentage: {
      handler() {
        if (this.debugMode) {
          this.updateChart()
        }
      }
    }
  },
  methods: {
    initChart() {
      if (window.echarts) {
        try {
          // 确保容器有正确的尺寸
          if (this.$refs.chartRef && this.$refs.chartRef.offsetWidth > 0 && this.$refs.chartRef.offsetHeight > 0) {
            // 移动端兼容性：使用canvas渲染器，避免SVG兼容性问题
            const renderer = this.isMobileDevice() ? 'canvas' : 'canvas'
            this.chart = window.echarts.init(this.$refs.chartRef, null, {
              renderer: renderer,
              devicePixelRatio: window.devicePixelRatio || 1
            })
            this.updateChart()
            console.log('ECharts initialized successfully with renderer:', renderer)
          } else {
            console.warn('Chart container has no size, retrying...')
            // 延迟初始化，等待DOM完全渲染
            setTimeout(() => {
              this.initChart()
            }, 100)
          }
        } catch (error) {
          console.error('Failed to initialize ECharts:', error)
          // 尝试fallback初始化（不使用高级配置）
          try {
            this.chart = window.echarts.init(this.$refs.chartRef)
            this.updateChart()
            console.log('ECharts fallback initialization succeeded')
          } catch (fallbackError) {
            console.error('ECharts fallback initialization also failed:', fallbackError)
            this.enableFallback('ECharts初始化失败，使用CSS备用方案')
          }
        }
      } else {
        console.error('ECharts CDN not loaded')
        // 检测是否是已知的平板兼容性问题
        if (this.isMobileDevice() || this.isTabletDevice()) {
          console.warn('检测到移动/平板设备，可能存在ECharts兼容性问题')
          // 给更多时间等待CDN加载
          let retryCount = 0
          const maxRetries = 3
          
          const retryInit = () => {
            setTimeout(() => {
              retryCount++
              if (window.echarts) {
                this.initChart()
              } else if (retryCount < maxRetries) {
                console.log(`重试ECharts加载 (${retryCount}/${maxRetries})`)
                retryInit()
              } else {
                this.enableFallback('ECharts CDN加载失败，使用CSS备用方案')
              }
            }, 1000 * retryCount) // 递增延迟
          }
          
          retryInit()
        } else {
          // 桌面设备正常重试
          setTimeout(() => {
            this.initChart()
          }, 500)
        }
      }
    },
    updateChart() {
      if (this.chart && !this.chart.isDisposed()) {
        try {
          this.chart.setOption(this.chartOption)
          console.log('Chart updated with percentage:', this.percentage)
        } catch (error) {
          console.error('Failed to update chart:', error)
        }
      }
    },
    // 新增：响应式处理
    handleResize() {
      if (this.chart && !this.chart.isDisposed()) {
        this.chart.resize()
      }
    },
    // 图片URL处理方法，避免require在某些环境下的问题
    getImageUrl(imageName) {
      try {
        return require('@/assets/image/screen/' + imageName)
      } catch (error) {
        console.error('Failed to load image:', imageName, error)
        // 返回空字符串或默认图片
        return ''
      }
    },
    // 移动端兼容性检测方法
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    isTabletDevice() {
      return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent)
    },
    isMobileCompatible() {
      // 检测是否需要移动端兼容模式
      const isOldAndroid = /Android [1-4]/i.test(navigator.userAgent)
      const isOldIOS = /OS [1-9]_/i.test(navigator.userAgent)
      return isOldAndroid || isOldIOS || this.isMobileDevice()
    },
    supportsBorderRadius() {
      // 检测ECharts版本是否支持borderRadius
      if (window.echarts && window.echarts.version) {
        const version = window.echarts.version
        const majorVersion = parseInt(version.split('.')[0])
        return majorVersion >= 5 // ECharts 5.0+ 支持 borderRadius
      }
      return false
    },
    supportsAdvancedAnimation() {
      // 检测是否支持高级动画属性
      if (window.echarts && window.echarts.version) {
        const version = window.echarts.version
        const majorVersion = parseInt(version.split('.')[0])
        const minorVersion = parseInt(version.split('.')[1])
        return majorVersion > 5 || (majorVersion === 5 && minorVersion >= 2)
      }
      return false
    },
    supportsAria() {
      // 检测是否支持无障碍功能
      if (window.echarts && window.echarts.version) {
        const version = window.echarts.version
        const majorVersion = parseInt(version.split('.')[0])
        return majorVersion >= 5
      }
      return false
    },
    // 启用CSS备用方案
    enableFallback(reason) {
      console.warn('启用CSS备用进度环:', reason)
      this.showFallback = true
      this.chartInitFailed = true
      // 隐藏ECharts容器
      if (this.$refs.chartRef) {
        this.$refs.chartRef.style.display = 'none'
      }
    },
    // ========== 调试方法 - TODO: 删除 ==========
    onDebugChange() {
      console.log('调试进度变化:', this.mockPercentage + '%')
    },
    startAnimation() {
      // 清除之前的动画
      if (this.animationTimer) {
        clearInterval(this.animationTimer)
      }
      
      let current = 0
      this.animationTimer = setInterval(() => {
        this.mockPercentage = current
        current += 5
        if (current > 100) {
          current = 0
        }
      }, 200)
      
      // 10秒后停止动画
      setTimeout(() => {
        if (this.animationTimer) {
          clearInterval(this.animationTimer)
          this.animationTimer = null
        }
      }, 10000)
    },
    testResize() {
      console.log('测试Resize功能')
      if (this.chart && !this.chart.isDisposed()) {
        this.chart.resize()
        console.log('Resize执行成功')
      } else {
        console.log('Chart未初始化或已销毁')
      }
    },
    toggleFallback() {
      if (this.showFallback) {
        // 切换回ECharts
        this.showFallback = false
        this.chartInitFailed = false
        if (this.$refs.chartRef) {
          this.$refs.chartRef.style.display = 'block'
        }
        this.$nextTick(() => {
          this.initChart()
        })
      } else {
        // 切换到CSS备用方案
        this.enableFallback('用户手动切换到CSS备用方案')
      }
    }
    // ========== 调试方法结束 ==========
  }
}
</script>

<style lang="scss" scoped>
.echarts-progress {
  position: relative;
  display: inline-block;
  // 确保在平板等设备上正确显示
  min-width: 100px;
  min-height: 100px;

  .outer-ring {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1; // 外层装饰圆环（最底层）
    // 平板兼容性改进
    -webkit-background-size: contain;
    -moz-background-size: contain;
    -o-background-size: contain;
  }

  .inner-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2; // 内层装饰圆环
    // 平板兼容性改进
    -webkit-background-size: contain;
    -moz-background-size: contain;
    -o-background-size: contain;
  }

  .chart-container {
    position: relative;
    z-index: 3; // ECharts 进度条图表层
    // 确保容器在平板上有正确的尺寸
    box-sizing: border-box;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    line-height: 1;
    pointer-events: none; // 防止影响图表交互
    z-index: 4; // 文字层在最上面
    // 平板设备字体适配
    @media screen and (max-width: 1024px) {
      font-size: 14px;
    }
  }
}

// 针对平板设备的优化
@media screen and (max-width: 1024px) and (min-width: 768px) {
  .echarts-progress {
    // 确保在平板横屏/竖屏都能正确显示
    .chart-container {
      // 强制重绘，解决某些平板渲染问题
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
  }
}

/* ========== 调试样式 - TODO: 删除 ========== */
.debug-controls {
  position: absolute;
  bottom: -120px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  color: white;
  font-size: 12px;
  z-index: 1000;
  
  .debug-title {
    font-weight: bold;
    margin-bottom: 8px;
    color: #00E8B5;
  }
  
  .debug-slider {
    width: 100%;
    margin: 8px 0;
    accent-color: #00E8B5;
  }
  
  .debug-info {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    
    span {
      color: #ccc;
    }
  }
  
  .debug-btn {
    background: #333;
    border: 1px solid #555;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
    font-size: 11px;
    
    &:hover {
      background: #444;
      border-color: #666;
    }
    
    &:active {
      background: #222;
    }
  }
}
/* ========== CSS备用进度环样式 ========== */
.fallback-progress {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5; // 比ECharts容器层级高
  
  .progress-svg {
    width: 100%;
    height: 100%;
  }
  
  .progress-circle {
    transition: stroke-dashoffset 0.8s ease-in-out;
    filter: drop-shadow(0 0 8px currentColor);
  }
}
/* ========== 调试样式结束 ========== */
</style>