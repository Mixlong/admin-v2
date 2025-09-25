<template>
  <div class="circle-statistic" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 外层装饰圆环图片 -->
    <div class="outer-ring" :style="{
      width: size + 'px',
      height: size + 'px',
      backgroundImage: backgroundRing ? 'url(' + getImageUrl('radius-w.png') + ')' : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }"></div>

    <!-- 内层装饰圆环图片 -->
    <div class="inner-ring" :style="{
      width: Math.round(size * 0.67) + 'px',
      height: Math.round(size * 0.67) + 'px',
      backgroundImage: backgroundRing ? 'url(' + getImageUrl('radius.png') + ')' : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }"></div>

    <!-- 纯CSS环形进度条 -->
    <div class="progress-container" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" class="progress-svg" :viewBox="`0 0 ${size} ${size}`">
        <!-- 背景环 -->
        <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" :stroke="backgroundColor"
          :stroke-width="strokeWidth" :opacity="backgroundOpacity" />

        <!-- 多段进度环 -->
        <circle v-for="(segment, index) in progressSegments" :key="'segment-' + index" :cx="size / 2" :cy="size / 2"
          :r="radius" fill="none" :stroke="segment.color" :stroke-width="strokeWidth"
          :stroke-dasharray="segment.dashArray" :stroke-dashoffset="segment.dashOffset" stroke-linecap="round"
          :transform="`rotate(-90 ${size / 2} ${size / 2})`" class="progress-segment" :style="{
            animationDelay: index * 0.2 + 's',
            filter: glowEffect ? `drop-shadow(0 0 ${strokeWidth / 2}px ${segment.color})` : 'none'
          }" />

        <!-- 渐变定义 -->
        <defs>
          <linearGradient v-for="(gradient, index) in gradients" :key="'gradient-' + index" :id="'gradient-' + index"
            x1="0%" y1="0%" x2="100%" y2="0%">
            <stop v-for="(stop, stopIndex) in gradient.stops" :key="stopIndex" :offset="stop.offset"
              :stop-color="stop.color" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- 中心内容 -->
    <div class="center-content">
      <!-- 主要数据和单位 -->
      <div class="value-container">
        <div class="main-value" :style="{ fontSize: computedMainFontSize + 'px', color: mainColor }">
          <slot name="main">{{ mainValue }}</slot>
        </div>
        <div class="unit-label" :style="{ fontSize: unitFontSize + 'px', color: unitColor }">
          <slot name="unit">{{ unit }}</slot>
        </div>
      </div>

      <!-- 次要信息 -->
      <div v-if="$slots.secondary || secondaryText" class="secondary-info"
        :style="{ fontSize: secondaryFontSize + 'px', color: secondaryColor }">
        <slot name="secondary">{{ secondaryText }}</slot>
      </div>
    </div>

    <!-- 图标/装饰 -->
    <div v-if="showIcon" class="icon-decoration" :style="iconStyle">
      <slot name="icon">
        <i :class="iconClass" :style="{ fontSize: iconSize + 'px', color: iconColor }"></i>
      </slot>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CircleStatistic',
  props: {
    // 基础配置
    size: {
      type: Number,
      default: 140
    },
    mainValue: {
      type: [String, Number],
      default: '98'
    },
    unit: {
      type: String,
      default: '%'
    },
    secondaryText: {
      type: String,
      default: ''
    },

    // 进度配置
    segments: {
      type: Array,
      default: () => [
        { value: 98, color: '#00E8B5', label: '完成率' }
      ]
    },

    // 样式配置
    strokeWidth: {
      type: Number,
      default: 12
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    backgroundOpacity: {
      type: Number,
      default: 0.2
    },

    // 字体配置
    mainFontSize: {
      type: Number,
      default: 32
    },
    unitFontSize: {
      type: Number,
      default: 12
    },
    secondaryFontSize: {
      type: Number,
      default: 12
    },
    mainColor: {
      type: String,
      default: '#FFFFFF'
    },
    unitColor: {
      type: String,
      default: '#FFFFFF'
    },
    secondaryColor: {
      type: String,
      default: '#CCCCCC'
    },

    // 装饰配置
    backgroundRing: {
      type: Boolean,
      default: true
    },
    glowEffect: {
      type: Boolean,
      default: true
    },

    // 图标配置
    showIcon: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: 'el-icon-trends'
    },
    iconSize: {
      type: Number,
      default: 16
    },
    iconColor: {
      type: String,
      default: '#00E8B5'
    },
    iconPosition: {
      type: String,
      default: 'top-right' // top-right, top-left, bottom-right, bottom-left
    },

  },

  computed: {
    radius() {
      return (this.size - this.strokeWidth) / 2
    },
    computedMainFontSize() {
      // 根据数值长度动态调整字体大小
      const valueStr = String(this.mainValue);
      const baseSize = this.mainFontSize * 0.85;
      
      if (valueStr.length >= 3) {
        // 3位数或更长，缩小一点
        return Math.round(baseSize * 0.9);
      } else if (valueStr.length === 2) {
        // 2位数，稍微缩小
        return Math.round(baseSize * 0.95);
      }
      // 1位数，使用原大小
      return Math.round(baseSize);
    },
    circumference() {
      return 2 * Math.PI * this.radius
    },
    totalProgress() {
      return this.segments.reduce((sum, segment) => sum + segment.value, 0)
    },
    progressSegments() {
      let accumulatedProgress = 0

      return this.segments.map((segment, index) => {
        const progress = Math.min(segment.value, 100)
        const dashLength = (progress / 100) * this.circumference
        const gapLength = this.circumference - dashLength

        // 计算偏移量
        const offsetProgress = accumulatedProgress
        const offset = this.circumference - (offsetProgress / 100) * this.circumference

        accumulatedProgress += progress

        return {
          color: segment.gradient ? `url(#gradient-${index})` : segment.color,
          dashArray: `${dashLength} ${gapLength}`,
          dashOffset: -offset,
          progress: progress
        }
      })
    },
    gradients() {
      return this.segments
        .map((segment, index) => {
          if (segment.gradient) {
            return {
              id: `gradient-${index}`,
              stops: segment.gradient
            }
          }
          return null
        })
        .filter(Boolean)
    },
    iconStyle() {
      const positions = {
        'top-right': { top: '10px', right: '10px' },
        'top-left': { top: '10px', left: '10px' },
        'bottom-right': { bottom: '10px', right: '10px' },
        'bottom-left': { bottom: '10px', left: '10px' }
      }
      return positions[this.iconPosition] || positions['top-right']
    }
  },

  methods: {
    getImageUrl(imageName) {
      try {
        return require('@/assets/image/screen/' + imageName)
      } catch (error) {
        console.error('Failed to load image:', imageName)
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.circle-statistic {
  position: relative;
  display: inline-block;

  .outer-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    padding: 10px;
    box-sizing: content-box;
  }

  .inner-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    opacity: 0.8;
  }

  .progress-container {
    position: relative;
    z-index: 3;

    .progress-svg {
      width: 100%;
      height: 100%;
      transform: rotate(0deg);

      .progress-segment {
        opacity: 0;
        animation: progressAppear 1s ease-out forwards;
        transition: all 0.3s ease;
      }
    }
  }

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 4;
    pointer-events: none;
    width: 80%;
    max-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .value-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 1px;
      margin-bottom: 4px;
      white-space: nowrap;

      .main-value {
        font-weight: bold;
        line-height: 1;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        flex-shrink: 0;
      }

      .unit-label {
        line-height: 1;
        opacity: 0.9;
        flex-shrink: 0;
      }
    }

    .secondary-info {
      line-height: 1;
      opacity: 0.8;
      margin-top: 4px;
    }
  }

  .icon-decoration {
    position: absolute;
    z-index: 5;
    opacity: 0.8;

    i {
      display: block;
      text-shadow: 0 0 8px currentColor;
    }
  }

}

// 动画定义
@keyframes progressAppear {
  from {
    opacity: 0;
    stroke-dashoffset: var(--full-circumference, 0);
  }

  to {
    opacity: 1;
    stroke-dashoffset: var(--target-offset, 0);
  }
}

// 发光效果增强
.progress-segment {
  filter: drop-shadow(0 0 8px currentColor);
}

// 响应式适配
@media screen and (max-width: 768px) {
  .circle-statistic {
    .center-content {
      .main-value {
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
      }
    }
  }
}
</style>