<template>
  <vxe-table
    ref="vxeTable"
    :data="data"
    :loading="loading"
    :height="height"
    :border="border"
    :size="size"
    :row-config="rowConfig"
    :column-config="columnConfig"
    :show-overflow="showOverflow"
    :show-header-overflow="showHeaderOverflow"
    :filter-config="filterConfig"
    :tooltip-config="tooltipConfig"
    :virtual-y-config="computedVirtualYConfig"
    :scrollbar-config="scrollbarConfig"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 根据 columns 配置自动生成列 -->
    <template v-if="columns && columns.length > 0">
      <vxe-column
        v-for="(column, index) in columns"
        :key="column.field || index"
        v-bind="column"
      >
        <!-- 优先级 1：如果有自定义插槽，直接使用插槽 -->
        <template v-if="column.slotName" #default="scope">
          <slot :name="column.slotName" v-bind="scope"></slot>
        </template>

        <!-- 优先级 2：如果配置了 useTooltip，自动使用 CellTooltip -->
        <template v-else-if="column.useTooltip !== false" #default="{ row }">
          <CellTooltip
            :content="getCellValue(row, column)"
            :placement="column.tooltipPlacement"
            v-bind="column.tooltipProps"
          >
            <!-- 如果有自定义 formatter，使用 formatter -->
            <template v-if="column.formatter">
              {{ column.formatter(row, column) }}
            </template>
          </CellTooltip>
        </template>
      </vxe-column>
    </template>
    
    <!-- 如果没有 columns 配置，使用插槽方式 -->
    <slot v-else></slot>
  </vxe-table>
</template>

<script>
import { VxeTable, VxeColumn } from "vxe-table";

/**
 * 通用虚拟滚动表格组件
 * 
 * 支持两种使用方式：
 * 1. 配置式：通过 columns 数组配置列，自动集成 CellTooltip
 * 2. 插槽式：手动定义 vxe-column
 * 
 * @example
 * <!-- 配置式（推荐） -->
 * <VirtualTable
 *   :data="tableData"
 *   :columns="columns"
 *   :height="600"
 * />
 * 
 * const columns = [
 *   { field: 'name', title: '姓名', width: 120, useTooltip: true },
 *   { field: 'age', title: '年龄', width: 80, useTooltip: false },
 *   { 
 *     field: 'status', 
 *     title: '状态', 
 *     width: 100,
 *     slotName: 'status' // 使用自定义插槽
 *   }
 * ]
 * 
 * @example
 * <!-- 插槽式 -->
 * <VirtualTable :data="tableData" :height="600">
 *   <vxe-column field="name" title="姓名">
 *     <template #default="{ row }">
 *       <CellTooltip :content="row.name" />
 *     </template>
 *   </vxe-column>
 * </VirtualTable>
 */
export default {
  name: "VirtualTable",
  
  components: {
    VxeTable,
    VxeColumn,
  },
  
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => [],
    },
    
    // 列配置（配置式使用）
    columns: {
      type: Array,
      default: null,
      // columns 示例：
      // [
      //   { 
      //     field: 'name', 
      //     title: '姓名', 
      //     width: 120,
      //     useTooltip: true, // 是否使用 CellTooltip，默认 true
      //     tooltipPlacement: 'top', // tooltip 位置
      //     tooltipProps: {}, // 传递给 CellTooltip 的其他 props
      //     formatter: (row, column) => row.name, // 自定义格式化
      //     slotName: 'customSlot' // 使用自定义插槽
      //   }
      // ]
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false,
    },
    
    // 表格高度
    height: {
      type: [Number, String],
      default: 400,
    },
    
    // 行配置
    rowConfig: {
      type: Object,
      default: () => ({
        keyField: "id",
        isHover: true,
        height: 36,
      }),
    },
    
    // 列配置
    columnConfig: {
      type: Object,
      default: () => ({
        resizable: false,
      }),
    },
    
    // 边框
    border: {
      type: Boolean,
      default: true,
    },
    
    // 尺寸
    size: {
      type: String,
      default: "mini",
    },
    
    // 内容溢出显示方式
    showOverflow: {
      type: String,
      default: "ellipsis",
    },
    
    // 表头溢出显示方式
    showHeaderOverflow: {
      type: String,
      default: "ellipsis",
    },
    
    // 筛选配置
    filterConfig: {
      type: Object,
      default: () => ({
        remote: false,
      }),
    },
    
    // tooltip 配置（禁用原生，使用 CellTooltip）
    tooltipConfig: {
      type: Object,
      default: () => ({
        enabled: false,
      }),
    },
    
    // 虚拟滚动配置
    virtualYConfig: {
      type: Object,
      default: () => ({}),
    },

    // 是否启用虚拟滚动
    virtualEnabled: {
      type: Boolean,
      default: true,
    },
    
    // 滚动条配置
    scrollbarConfig: {
      type: Object,
      default: () => ({
        width: 8,
        overscrollBehavior: "contain",
      }),
    },
    
    // 行高（用于虚拟滚动计算）
    rowHeight: {
      type: Number,
      default: 36,
    },
    
    // 虚拟滚动阈值（数据量大于此值才启用）
    virtualThreshold: {
      type: Number,
      default: 50,
    },
  },
  
  computed: {
    // 合并后的虚拟滚动配置
    computedVirtualYConfig() {
      if (!this.virtualEnabled) {
        return {
          enabled: false,
        };
      }
      return {
        enabled: true,
        gt: this.virtualThreshold,
        rowHeight: this.rowHeight,
        // 平衡性能和流畅度
        preSize: 10, // 可视区域上方预渲染 10 行
        oSize: 10,   // 可视区域下方预渲染 10 行
        immediate: true, // 立即渲染
        scrollToTopOnChange: false, // 数据变化时不自动滚动到顶部
        ...this.virtualYConfig,
      };
    },
  },
  
  
  watch: {
    data: {
      handler() {
        // 数据变化后刷新虚拟滚动（使用防抖避免频繁刷新）
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        this.refreshTimer = setTimeout(() => {
          this.$nextTick(() => {
            if (this.$refs.vxeTable) {
              this.$refs.vxeTable.refreshScroll();
            }
          });
        }, 100);
      },
      deep: false,
      immediate: false,
    },
  },
  
  beforeDestroy() {
    // 清理定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  },
  
  methods: {
    // 获取单元格的值
    getCellValue(row, column) {
      if (column.formatter) {
        return column.formatter(row, column);
      }
      
      if (column.field) {
        // 支持嵌套字段，如 'user.name'
        const keys = column.field.split('.');
        let value = row;
        for (const key of keys) {
          value = value?.[key];
        }
        return value;
      }
      
      return '';
    },
    
    // 暴露 vxe-table 实例
    getVxeTable() {
      return this.$refs.vxeTable;
    },
    
    // 清空所有筛选
    clearAllFilters() {
      if (this.$refs.vxeTable) {
        this.$refs.vxeTable.clearFilter();
      }
    },
    
    // 刷新滚动
    refreshScroll() {
      if (this.$refs.vxeTable) {
        this.$refs.vxeTable.refreshScroll();
      }
    },
    
    // 滚动到顶部
    scrollToTop() {
      if (this.$refs.vxeTable) {
        this.$refs.vxeTable.scrollTo(0, 0);
      }
    },
  },
};
</script>
