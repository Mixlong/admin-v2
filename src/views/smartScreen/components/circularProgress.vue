<template>
  <div class="circular-progress">
    <svg :width="size" :height="size" class="progress-ring">
      <defs>
        <!-- 绿色渐变 -->
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#00FFB3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00E8B5;stop-opacity:1" />
        </linearGradient>
        <!-- 橙色渐变 -->
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FFB800;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:1" />
        </linearGradient>
        <!-- 红色渐变 -->
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FF6B7A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF4757;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 带间隙的连续式进度条 -->
      <g v-if="gapStyle">
        <!-- 进度弧形 -->
        <path v-if="percentage > 0" 
          :d="progressArcPath" 
          fill="transparent" 
          :stroke="progressGradient"
          :stroke-width="strokeWidth"
          stroke-linecap="round" />
        
        <!-- 未完成部分的弧形 -->
        <path v-if="percentage < 100" 
          :d="remainingArcPath" 
          fill="transparent" 
          stroke="rgba(255, 255, 255, 0.8)"
          :stroke-width="strokeWidth"
          stroke-linecap="round" />
      </g>
      
      <!-- 传统连续式进度条 -->
      <g v-else>
        <!-- 背景圆环 -->
        <circle :cx="center" :cy="center" :r="radius" 
          fill="transparent" 
          :stroke="backgroundColor"
          :stroke-width="strokeWidth" />
        
        <!-- 进度圆环 -->
        <circle :cx="center" :cy="center" :r="radius" 
          fill="transparent" 
          :stroke="progressGradient"
          :stroke-width="strokeWidth" 
          :stroke-dasharray="circumference" 
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round" 
          :transform="`rotate(-90 ${center} ${center})`" />
      </g>
    </svg>
    
    <div class="progress-text">
      <slot>{{ percentage }}%</slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircularProgress',
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 95
    },
    strokeWidth: {
      type: Number,
      default: 8
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
    },
    backgroundColor: {
      type: String,
      default: 'rgba(31, 198, 255, 0.32)'
    },
    // 间隙样式进度条选项
    gapStyle: {
      type: Boolean,
      default: false
    },
    gapSize: {
      type: Number,
      default: 30  // 间隙大小（角度）
    }
  },
  computed: {
    center() {
      return this.size / 2;
    },
    radius() {
      return (this.size - this.strokeWidth) / 2;
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashoffset() {
      const progress = Math.max(0, Math.min(100, this.percentage));
      return this.circumference - (progress / 100) * this.circumference;
    },
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
        return 'url(#greenGradient)';
      } else if (this.percentage >= this.thresholds.warning) {
        return 'url(#orangeGradient)';
      } else {
        return 'url(#redGradient)';
      }
    },
    // 进度弧形路径
    progressArcPath() {
      if (!this.gapStyle || this.percentage <= 0) return '';
      
      const startAngle = -90; // 从顶部开始
      const totalUsableAngle = 360 - this.gapSize; // 可用角度（减去间隙）
      const progressAngle = (this.percentage / 100) * totalUsableAngle;
      const endAngle = startAngle + progressAngle;
      
      return this.createArcPath(startAngle, endAngle);
    },
    
    // 剩余部分弧形路径（未完成部分）
    remainingArcPath() {
      if (!this.gapStyle || this.percentage >= 100) return '';
      
      const totalUsableAngle = 360 - this.gapSize; // 330度可用
      const progressAngle = (this.percentage / 100) * totalUsableAngle;
      const remainingAngle = totalUsableAngle - progressAngle; // 剩余角度
      const gapBetween = 3; // 进度条和剩余部分之间的小间隙
      
      // 如果剩余角度太小（减去间隙后），不显示
      if (remainingAngle - gapBetween < 5) return '';
      
      // 白色弧形从进度条结束位置+小间隙开始
      const startAngle = -90 + progressAngle + gapBetween;
      // 白色弧形长度是剩余角度减去小间隙
      const whiteArcLength = remainingAngle - gapBetween;
      const endAngle = startAngle + whiteArcLength;
      
      return this.createArcPath(startAngle, endAngle);
    }
  },
  methods: {
    // 创建弧形路径
    createArcPath(startAngle, endAngle) {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = this.center + this.radius * Math.cos(startAngleRad);
      const y1 = this.center + this.radius * Math.sin(startAngleRad);
      const x2 = this.center + this.radius * Math.cos(endAngleRad);
      const y2 = this.center + this.radius * Math.sin(endAngleRad);
      
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      
      return `M ${x1} ${y1} A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.circular-progress {
  position: relative;
  display: inline-block;

  .progress-ring {
    transform: rotate(-90deg);
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
  }
}
</style>