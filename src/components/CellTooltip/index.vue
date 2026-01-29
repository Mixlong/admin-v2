<template>
  <span
    ref="cell"
    class="cell-tooltip"
    :class="{ 'cell-tooltip--ellipsis': ellipsis }"
    :style="cellStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot>{{ displayValue }}</slot>
  </span>
</template>

<script>
/**
 * 轻量级单元格 Tooltip 组件
 * 
 * 只在 hover 时动态创建 tooltip，不预先渲染
 * 适用于大数据量虚拟滚动表格
 */
export default {
  name: 'CellTooltip',
  
  props: {
    content: {
      type: [String, Number],
      default: ''
    },
    tooltipContent: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '--'
    },
    ellipsis: {
      type: Boolean,
      default: true
    },
    maxWidth: {
      type: String,
      default: ''
    },
    // 延迟显示时间 (ms)
    delay: {
      type: Number,
      default: 100
    }
  },
  
  data() {
    return {
      tooltipEl: null,
      timer: null
    };
  },
  
  computed: {
    hasContent() {
      const val = this.content;
      return val !== null && val !== undefined && val !== '';
    },
    
    displayValue() {
      return this.hasContent ? this.content : this.placeholder;
    },
    
    computedTooltipContent() {
      return this.tooltipContent || String(this.content || '');
    },
    
    cellStyle() {
      const style = {};
      if (this.maxWidth) {
        style.maxWidth = this.maxWidth;
      }
      return style;
    }
  },
  
  beforeDestroy() {
    this.hideTooltip();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
  
  methods: {
    handleMouseEnter() {
      if (!this.hasContent) return;
      
      // 检查是否有文本溢出
      const el = this.$refs.cell;
      if (!el) return;
      
      // 只有文本溢出时才显示 tooltip
      if (el.scrollWidth <= el.clientWidth) return;
      
      // 延迟显示
      this.timer = setTimeout(() => {
        this.showTooltip();
      }, this.delay);
    },
    
    handleMouseLeave() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.hideTooltip();
    },
    
    showTooltip() {
      if (this.tooltipEl) return;
      
      const el = this.$refs.cell;
      if (!el) return;
      
      // 创建 tooltip 元素
      const tooltip = document.createElement('div');
      tooltip.className = 'cell-tooltip-popup';
      tooltip.textContent = this.computedTooltipContent;
      
      // 计算位置
      const rect = el.getBoundingClientRect();
      tooltip.style.cssText = `
        position: fixed;
        z-index: 99999;
        left: ${rect.left}px;
        top: ${rect.top - 8}px;
        transform: translateY(-100%);
        max-width: 400px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-size: 12px;
        line-height: 1.5;
        border-radius: 4px;
        word-break: break-all;
        pointer-events: none;
      `;
      
      document.body.appendChild(tooltip);
      this.tooltipEl = tooltip;
    },
    
    hideTooltip() {
      if (this.tooltipEl) {
        this.tooltipEl.remove();
        this.tooltipEl = null;
      }
    }
  }
};
</script>

<style scoped>
.cell-tooltip {
  display: inline-block;
  max-width: 100%;
  vertical-align: middle;
}

.cell-tooltip--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
