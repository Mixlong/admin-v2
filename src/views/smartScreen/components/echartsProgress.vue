<template>
  <div class="echarts-progress" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 外层装饰圆环图片 -->
    <div class="outer-ring" 
         :style="{ 
           width: size + 'px', 
           height: size + 'px',
           backgroundImage: 'url(' + require('@/assets/image/screen/radius-w.png') + ')',
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'center'
         }"></div>
    
    <!-- 内层装饰圆环图片 -->
    <div class="inner-ring" 
         :style="{ 
           width: '80px', 
           height: '80px',
           backgroundImage: 'url(' + require('@/assets/image/screen/raduis.png') + ')',
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'center'
         }"></div>
    
    <!-- ECharts 进度条 -->
    <div ref="chartRef" :style="{ width: size + 'px', height: size + 'px' }" class="chart-container"></div>
    
    <!-- 百分比文字 -->
    <div class="progress-text">
      <slot>{{ percentage }}%</slot>
    </div>
  </div>
</template>

<script>
// 使用全局CDN的ECharts 6.0.0
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
      chart: null
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
      const progressValue = this.percentage;
      const remainingValue = 100 - this.percentage;

      return {
        series: [
          // 主要进度环形图（背景装饰圆环现在用图片实现）
          {
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['73%', '85%'], // 调整环形图厚度，更接近设计稿
            avoidLabelOverlap: false,
            padAngle: 8, // 增加间隙，匹配设计稿中的间隔
            // ECharts 6.0.0 改进的样式系统
            itemStyle: {
              borderRadius: 8, // ECharts 6.0 支持更好的圆角
              borderWidth: 0,
              shadowBlur: 0,
            },
            // ECharts 6.0.0 支持更精确的强调状态控制
            emphasis: {
              disabled: true // 完全禁用悬停效果
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
                  borderRadius: 8,
                  // ECharts 6.0.0 改进的阴影系统
                  shadowBlur: 6,
                  shadowColor: this.progressColor,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  // ECharts 6.0.0 新增的透明度控制
                  opacity: 0.95
                }
              },
              {
                value: remainingValue,
                name: 'remaining',
                itemStyle: {
                  color: '#FFFFFF', // 纯白色，不透明
                  borderRadius: 8,
                  // 强烈的白色发光效果
                  shadowBlur: 12,
                  shadowColor: '#FFFFFF',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  opacity: 1
                }
              }
            ],
            startAngle: 90, // 从顶部开始
            clockwise: true, // 顺时针方向
            // ECharts 6.0.0 改进的动画系统
            animation: true,
            animationType: 'scale',
            animationEasing: 'cubicOut',
            animationDelay: 0,
            animationDuration: 1000, // 更流畅的动画
            // ECharts 6.0.0 新增的动画配置
            animationThreshold: 2000,
            animationDurationUpdate: 500
          }
        ],
        // ECharts 6.0.0 改进的工具提示系统
        tooltip: {
          show: false
        },
        // ECharts 6.0.0 新增的无障碍支持
        aria: {
          enabled: false // 对于装饰性图表禁用
        }
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  watch: {
    percentage: {
      handler() {
        this.updateChart()
      },
      immediate: true
    }
  },
  methods: {
    initChart() {
      if (window.echarts) {
        this.chart = window.echarts.init(this.$refs.chartRef)
        this.updateChart()
      } else {
        console.error('ECharts CDN not loaded')
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.setOption(this.chartOption)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts-progress {
  position: relative;
  display: inline-block;

  .outer-ring {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1; // 外层装饰圆环（最底层）
  }

  .inner-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2; // 内层装饰圆环
  }

  .chart-container {
    position: relative;
    z-index: 3; // ECharts 进度条图表层
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
  }
}
</style>