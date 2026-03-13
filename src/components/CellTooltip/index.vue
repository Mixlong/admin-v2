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
    isOverflow() {
      const el = this.$refs.cell;
      if (!el) return false;
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    },

    getTooltipMaxWidth() {
      if (this.maxWidth) {
        return this.maxWidth;
      }
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      return `${Math.max(320, Math.min(720, viewportWidth - 32))}px`;
    },

    handleMouseEnter() {
      if (!this.hasContent) return;
      
      const el = this.$refs.cell;
      if (!el) return;

      // 只有文本溢出时才显示 tooltip，同时给浏览器 title 做兜底
      if (!this.isOverflow()) {
        el.removeAttribute('title');
        return;
      }

      el.setAttribute('title', this.computedTooltipContent);
      
      // 延迟显示
      this.timer = setTimeout(() => {
        this.showTooltip();
      }, this.delay);
    },
    
    handleMouseLeave() {
      const el = this.$refs.cell;
      if (el) {
        el.removeAttribute('title');
      }
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
      tooltip.style.visibility = 'hidden';
      
      // 计算位置
      const rect = el.getBoundingClientRect();
      tooltip.style.cssText = `
        position: fixed;
        z-index: 99999;
        left: ${rect.left}px;
        top: ${rect.top - 8}px;
        max-width: ${this.getTooltipMaxWidth()};
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-size: 12px;
        line-height: 1.5;
        border-radius: 4px;
        white-space: normal;
        word-break: break-all;
        pointer-events: none;
        box-sizing: border-box;
        visibility: hidden;
      `;
      
      document.body.appendChild(tooltip);
      requestAnimationFrame(() => {
        const margin = 8;
        const viewportWidth =
          window.innerWidth || document.documentElement.clientWidth || 0;
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight || 0;
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left;
        let top = rect.top - tooltipRect.height - 8;

        if (left + tooltipRect.width > viewportWidth - margin) {
          left = viewportWidth - tooltipRect.width - margin;
        }
        if (left < margin) {
          left = margin;
        }
        if (top < margin) {
          top = Math.min(rect.bottom + 8, viewportHeight - tooltipRect.height - margin);
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
      });
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
  display: block;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;
}

.cell-tooltip--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
