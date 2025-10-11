<template>
  <div class="intelligent-search-form" ref="container">
    <div class="search-layout">
      <!-- 左侧：搜索表单区域 -->
      <div class="search-left" ref="searchLeft">
        <el-form :model="searchForm" ref="searchForm" :inline="true" class="search-form" :label-width="labelWidth"
          label-position="left">
          <!-- 第一行：自动计算显示的字段 + 按钮 -->
          <div class="search-row primary-row">
            <!-- 动态显示的字段 -->
            <div class="visible-fields" ref="visibleFields">
              <div v-for="field in initialVisibleFields" :key="field.key" class="field-wrapper">
                <slot :name="`field-${field.key}`" :field="field" :searchForm="searchForm">
                  <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth"
                    :class="field.fieldClass" :style="field.fieldStyle">
                    <component :is="field.component || 'el-input'" v-model="searchForm[field.key]"
                      v-bind="getFieldProps(field)" 
                      @change="handleFieldChangeAndAutoSearch(field, $event)"
                      @keyup.enter.native="handleSearch">
                      <!-- 为 el-select 组件添加选项渲染 -->
                      <template v-if="field.component === 'el-select' && field.props && field.props.options">
                        <el-option v-for="option in field.props.options" :key="option.value" :label="option.label"
                          :value="option.value">
                        </el-option>
                      </template>
                    </component>
                  </el-form-item>
                </slot>
              </div>
            </div>

            <!-- 搜索按钮区域 -->
            <div class="search-buttons" ref="searchButtons">
              <el-button type="primary" @click="handleSearch" icon="el-icon-search" size="mini">搜索</el-button>
              <el-button @click="handleReset" icon="el-icon-refresh" size="mini">重置</el-button>
              <slot name="add-search-buttons"></slot>

              <!-- 筛选 Popover -->
              <el-popover v-if="initialHiddenFields.length > 0" placement="right" :width="popoverWidth" trigger="click"
                v-model="filterPopoverVisible" popper-class="filter-popover" :offset="5" :z-index="100000">
                <div class="filter-content" :style="{ '--max-label-width': maxLabelWidth }">
                  <div class="filter-header">
                    <span class="filter-title">高级筛选</span>
                    <el-button type="text" size="mini" @click="clearAllFilters" class="clear-all-btn">清空所有</el-button>
                  </div>
                  <div class="filter-form">
                    <div v-for="field in initialHiddenFields" :key="field.key" class="filter-item">
                      <div class="filter-label" :style="{ width: maxLabelWidth }">
                        {{ field.label }}
                      </div>
                      <div class="filter-input">
                        <slot :name="`field-${field.key}`" :field="field" :searchForm="tempSearchForm">
                          <component :is="field.component || 'el-input'" v-model="tempSearchForm[field.key]"
                            v-bind="getPopoverFieldProps(field)" 
                            @change="handleTempFieldChangeAndAutoConfirm(field, $event)"
                            @keyup.enter.native="confirmFilter"
                            size="mini">
                            <!-- 为 el-select 组件添加选项渲染 -->
                            <template v-if="field.component === 'el-select' && field.props && field.props.options">
                              <el-option v-for="option in field.props.options" :key="option.value" :label="option.label"
                                :value="option.value">
                              </el-option>
                            </template>
                          </component>
                        </slot>
                      </div>
                    </div>
                  </div>
                  <div class="filter-footer">
                    <el-button size="mini" @click="cancelFilter">取消</el-button>
                    <el-button type="primary" size="mini" @click="confirmFilter">确认</el-button>
                  </div>
                </div>
                <el-button slot="reference" type="text"
                  :class="['filter-button', { 'has-filters': hiddenFieldsWithValues.length > 0 }]" size="mini"
                  icon="el-icon-s-operation">
                  筛选({{ hiddenFieldsWithValues.length > 0 ? hiddenFieldsWithValues.length : initialHiddenFields.length
                  }})
                </el-button>
              </el-popover>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 右侧：页面操作按钮区域 -->
      <div class="search-right" ref="searchRight" v-if="$slots['page-actions']">
        <slot name="page-actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntelligentSearchForm',
  props: {
    searchForm: { type: Object, required: true },
    fields: { type: Array, required: true },
    fieldPriorities: { type: Object, default: () => ({}) },
    // 新增：手动配置默认显示字段数量
    defaultVisibleCount: { type: Number, default: 0 }, // 0表示自动计算
    // 新增：最大显示字段数量限制
    maxVisibleCount: { type: Number, default: 6 },
    // 新增：标签宽度配置
    labelWidth: { type: String, default: 'auto' }
  },
  data() {
    return {
      isCollapsed: true,
      filterPopoverVisible: false,
      tempSearchForm: {},
      containerWidth: 1200,
      rightSideWidth: 120,
      buttonsWidth: 220,
      fieldWidths: new Map(),
      visibleFieldsComputed: [],
      hiddenFieldsComputed: [],
      resizeObserver: null,
      measurementTimer: null,
      isLayoutReady: false
    }
  },
  computed: {
    allFields() {
      return [...this.fields].sort((a, b) => {
        const sortA = a.sort || a.priority || this.fieldPriorities[a.key] || 999;
        const sortB = b.sort || b.priority || this.fieldPriorities[b.key] || 999;
        return sortA - sortB;
      });
    },
    initialVisibleFields() {
      // 如果有手动配置，优先使用手动配置
      if (this.defaultVisibleCount > 0) {
        const visibleCount = Math.min(this.defaultVisibleCount, this.allFields.length, this.maxVisibleCount);
        return this.allFields.slice(0, visibleCount);
      }

      // 如果布局未准备好或计算结果为空，使用默认逻辑
      if (!this.isLayoutReady || this.visibleFieldsComputed.length === 0) {
        if (this.allFields.length > 0) {
          // 自动估算：基于容器宽度动态计算
          const estimatedVisible = this.calculateEstimatedVisible();
          return this.allFields.slice(0, estimatedVisible);
        }
        return [];
      }
      return this.visibleFieldsComputed;
    },
    initialHiddenFields() {
      // 如果有手动配置，优先使用手动配置
      if (this.defaultVisibleCount > 0) {
        const visibleCount = Math.min(this.defaultVisibleCount, this.allFields.length, this.maxVisibleCount);
        return this.allFields.slice(visibleCount);
      }

      // 如果布局未准备好或计算结果为空，使用默认逻辑
      if (!this.isLayoutReady || this.hiddenFieldsComputed.length === 0) {
        if (this.allFields.length > 4) {
          return this.allFields.slice(4);
        }
        return [];
      }
      return this.hiddenFieldsComputed;
    },
    hiddenFieldsWithValues() {
      return this.initialHiddenFields.filter(field => {
        const value = this.searchForm[field.key];
        // 检查值是否为空：undefined、null、空字符串、空数组
        if (value === undefined || value === null || value === '') {
          return false;
        }
        // 如果是数组，检查是否为空数组
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      });
    },
    maxLabelWidth() {
      if (this.initialHiddenFields.length === 0) return '90px';

      // 使用更精确的字符宽度计算
      const widths = this.initialHiddenFields.map(field => {
        return this.measureTextWidth(field.label || '');
      });

      const maxWidth = Math.max(...widths);
      const padding = 12; // padding-right
      const minWidth = 80;  // 最小宽度
      const maxAllowedWidth = 280; // 进一步增加最大允许宽度以防止换行

      const calculatedWidth = Math.max(minWidth, Math.min(maxAllowedWidth, maxWidth + padding));

      // 调试信息（可在生产环境中删除）
      // console.log('IntelligentSearchForm - maxLabelWidth calculation:', {
      //   hiddenFieldsCount: this.initialHiddenFields.length,
      //   labelWidths: this.initialHiddenFields.map((field, index) => ({
      //     label: field.label,
      //     width: widths[index]
      //   })),
      //   maxWidth: maxWidth,
      //   calculatedWidth: calculatedWidth
      // });

      return `${calculatedWidth}px`;
    },
    popoverWidth() {
      if (this.initialHiddenFields.length === 0) return 420;

      // 根据最长标签计算弹窗宽度
      const labelWidth = parseInt(this.maxLabelWidth.replace('px', ''));
      const inputMinWidth = 200; // 进一步增加输入框最小宽度
      const padding = 60; // 增加弹窗内边距
      const gap = 20; // 增加标签和输入框间距

      const calculatedPopoverWidth = labelWidth + inputMinWidth + padding + gap;
      const minPopoverWidth = 390; // 增加最小弹窗宽度以适应更宽的标签
      const maxPopoverWidth = 800; // 增加最大弹窗宽度

      const finalWidth = Math.max(minPopoverWidth, Math.min(maxPopoverWidth, calculatedPopoverWidth));

      // 调试信息（可在生产环境中删除）
      // console.log('IntelligentSearchForm - popoverWidth calculation:', {
      //   labelWidth: labelWidth,
      //   inputMinWidth: inputMinWidth,
      //   calculatedPopoverWidth: calculatedPopoverWidth,
      //   finalWidth: finalWidth
      // });

      return finalWidth;
    }
  },
  watch: {
    // 监听字段变化，重新计算布局
    fields: {
      handler() {
        this.$nextTick(() => {
          this.measureFieldWidths();
          this.calculateVisibleFields();
        });
      },
      deep: true,
      immediate: false
    },
    // 监听隐藏字段变化，触发标签宽度重新计算
    initialHiddenFields: {
      handler() {
        // 调试信息（可在生产环境中删除）
        // console.log('IntelligentSearchForm - hidden fields changed:', newFields.map(f => f.label));
      },
      deep: true
    },
    // 监听弹出框显示状态，确保每次打开时同步最新数据
    filterPopoverVisible: {
      handler(newVal) {
        if (newVal) {
          // 弹出框打开时，重新初始化临时表单数据
          this.initTempSearchForm();
        }
      }
    }
  },
  mounted() {
    this.loadUserPreferences();
    this.initTempSearchForm();

    // 确保DOM渲染完成后再进行布局计算
    this.$nextTick(() => {
      this.updateContainerSizes();
      this.initializeLayout();
      this.setupResizeObserver();

      // 短暂延迟确保所有元素都已渲染
      setTimeout(() => {
        this.isLayoutReady = true;
        this.updateContainerSizes();
        this.calculateVisibleFields();
      }, 100);
    });
  },
  beforeDestroy() {
    // 清理资源
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.measurementTimer) {
      clearTimeout(this.measurementTimer);
      this.measurementTimer = null;
    }
  },
  methods: {
    initTempSearchForm() {
      // 确保 tempSearchForm 包含最新的 searchForm 数据
      const tempForm = { ...this.searchForm };

      // 为隐藏字段设置默认值（如果尚未设置）
      this.initialHiddenFields.forEach(field => {
        if (!(field.key in tempForm)) {
          tempForm[field.key] = this.getDefaultValue(field);
        }
      });

      this.tempSearchForm = tempForm;
    },
    getDefaultValue(field) {
      if (field.component === 'el-select') return null;
      else if (field.component === 'el-date-picker') return null;
      else return '';
    },
    getFieldProps(field) {
      const defaultProps = {
        size: field.size || 'mini',
        clearable: field.clearable !== false,
        placeholder: field.placeholder || `请选择${field.label}`
      };

      // 处理样式配置
      if (field.component === 'el-select') {
        defaultProps.style = field.width ? `width: ${field.width}` : 'width: 140px';
      } else if (field.width) {
        defaultProps.style = `width: ${field.width}`;
      }

      return { ...defaultProps, ...(field.props || {}) };
    },
    getPopoverFieldProps(field) {
      const defaultProps = { size: 'mini', clearable: true, placeholder: field.placeholder || `请输入${field.label}` };
      if (field.component === 'el-select') defaultProps.placeholder = field.placeholder || `请选择${field.label}`;
      return { ...defaultProps, ...(field.props || {}) };
    },
    handleFieldChange(fieldKey, value) {
      const field = this.allFields.find(f => f.key === fieldKey);
      if (field && field.onChange) field.onChange(value);
      this.$emit('field-change', fieldKey, value);
    },
    handleTempFieldChange(fieldKey, value) {
      const field = this.allFields.find(f => f.key === fieldKey);
      if (field && field.onChange) field.onChange(value);
      this.$emit('temp-field-change', fieldKey, value);
    },
    // 新增：处理字段变化并自动搜索
    handleFieldChangeAndAutoSearch(field, value) {
      // 先处理字段变化
      this.handleFieldChange(field.key, value);
      // 再处理自动搜索
      this.handleAutoSearch(field);
    },
    // 新增：处理临时字段变化并自动确认
    handleTempFieldChangeAndAutoConfirm(field, value) {
      // 先处理临时字段变化
      this.handleTempFieldChange(field.key, value);
      // 再处理自动确认
      this.handleAutoConfirmFilter(field);
    },
    // 处理自动搜索（下拉选择后触发）
    handleAutoSearch(field) {
      // 如果字段配置了自动搜索，或者是下拉选择组件，则自动触发搜索
      const isSelectComponent = field.component === 'el-select' || 
                                field.type === 'select-loadMore' || 
                                field.component === 'select-loadMore';
      if (field.autoSearch !== false && (isSelectComponent || field.autoSearch === true)) {
        this.$nextTick(() => {
          this.handleSearch();
        });
      }
    },
    // 处理弹窗中的自动确认过滤（下拉选择后触发）
    handleAutoConfirmFilter(field) {
      // 如果字段配置了自动搜索，或者是下拉选择组件，则自动确认过滤
      const isSelectComponent = field.component === 'el-select' || 
                                field.type === 'select-loadMore' || 
                                field.component === 'select-loadMore';
      if (field.autoSearch !== false && (isSelectComponent || field.autoSearch === true)) {
        this.$nextTick(() => {
          this.confirmFilter();
        });
      }
    },
    confirmFilter() {
      // 只更新隐藏字段的值，保留可见字段的当前值
      this.initialHiddenFields.forEach(field => {
        if (field.key in this.tempSearchForm) {
          this.$set(this.searchForm, field.key, this.tempSearchForm[field.key]);
        }
      });
      this.filterPopoverVisible = false;
      this.$emit('filter-confirmed', this.searchForm);
      this.handleSearch();
    },
    cancelFilter() {
      this.initTempSearchForm();
      this.filterPopoverVisible = false;
      this.$emit('filter-popover-close');
    },
    clearAllFilters() {
      this.initialHiddenFields.forEach(field => {
        this.$set(this.tempSearchForm, field.key, this.getDefaultValue(field));
      });
      this.$emit('filters-cleared');
    },
    handleSearch() { this.$emit('search', this.searchForm); },
    handleReset() { 
      // 重置主表单
      this.$refs.searchForm.resetFields(); 
      
      // 手动重置主表单中的隐藏字段（因为resetFields可能不会重置没有form-item的字段）
      this.initialHiddenFields.forEach(field => {
        this.$set(this.searchForm, field.key, this.getDefaultValue(field));
        this.$set(this.tempSearchForm, field.key, this.getDefaultValue(field));
      });
      
      // 如果弹窗是打开状态，强制刷新tempSearchForm
      if (this.filterPopoverVisible) {
        this.$nextTick(() => {
          this.initTempSearchForm();
        });
      }
      
      this.$emit('reset'); 
    },

    // 布局相关方法
    initializeLayout() {
      this.measureFieldWidths();
      this.calculateVisibleFields();
    },
    measureFieldWidths() {
      // 为每个字段设置默认宽度
      this.allFields.forEach(field => {
        const estimatedWidth = this.estimateFieldWidth(field);
        this.fieldWidths.set(field.key, estimatedWidth);
      });
    },
    estimateFieldWidth(field) {
      // 根据字段类型和标签长度估算宽度
      const fieldLabelWidth = field.labelWidth ?
        parseInt(field.labelWidth.replace('px', '')) :
        parseInt(this.labelWidth.replace('px', '')) || 68;

      let inputWidth = 140; // 默认输入框宽度

      // 如果字段配置了宽度，使用字段配置的宽度
      if (field.width) {
        inputWidth = parseInt(field.width.replace('px', '')) || 140;
      } else if (field.component === 'el-select') {
        inputWidth = 140;
      } else if (field.component === 'el-date-picker') {
        inputWidth = 160;
      } else if (field.component === 'el-input') {
        inputWidth = 120;
      }

      // 为responsibleDept字段特殊处理，因为它使用treeselect组件
      if (field.key === 'responsibleDept') {
        inputWidth = 150; // 与模板中style="width: 150px"保持一致
      }

      const totalWidth = fieldLabelWidth + inputWidth + 30; // 增加间距以防布局挤压

      return totalWidth;
    },
    calculateVisibleFields() {
      if (!this.allFields.length) {
        this.visibleFieldsComputed = [];
        this.hiddenFieldsComputed = [];
        return;
      }

      // 获取容器可用宽度，为按钮区域预留更多空间
      const buttonReserveWidth = Math.max(this.buttonsWidth, 260); // 至少预留260px给按钮
      const safetyMargin = 32; // 安全边距
      const availableWidth = this.containerWidth - this.rightSideWidth - buttonReserveWidth - safetyMargin;
      let usedWidth = 0;
      const visible = [];
      const hidden = [];

      // 改进：确保有足够的可用宽度
      if (availableWidth <= 100) {
        // 可用宽度太小，只显示第一个字段
        if (this.allFields.length > 0) {
          visible.push(this.allFields[0]);
          hidden.push(...this.allFields.slice(1));
        }
        this.visibleFieldsComputed = visible;
        this.hiddenFieldsComputed = hidden;
        return;
      }

      // 调试信息（可在生产环境中删除）
      // console.log('IntelligentSearchForm - calculateVisibleFields:', {
      //   allFieldsLength: this.allFields.length,
      //   containerWidth: this.containerWidth,
      //   rightSideWidth: this.rightSideWidth,
      //   buttonsWidth: this.buttonsWidth,
      //   availableWidth: availableWidth,
      //   isLayoutReady: this.isLayoutReady
      // });

      // 确定要使用的最大可见字段数量
      let targetVisibleCount = this.maxVisibleCount;
      if (this.defaultVisibleCount > 0) {
        targetVisibleCount = Math.min(this.defaultVisibleCount, this.maxVisibleCount);
      }

      for (const field of this.allFields) {
        const fieldWidth = this.fieldWidths.get(field.key) || 200;

        if (usedWidth + fieldWidth <= availableWidth && visible.length < targetVisibleCount) {
          visible.push(field);
          usedWidth += fieldWidth;
        } else {
          hidden.push(field);
        }
      }

      // 至少显示一个字段
      if (visible.length === 0 && this.allFields.length > 0) {
        visible.push(this.allFields[0]);
        if (hidden.length > 0) {
          hidden.splice(0, 1);
        }
      }

      // 调试信息（可在生产环境中删除）
      // console.log('IntelligentSearchForm - field distribution:', {
      //   visibleCount: visible.length,
      //   hiddenCount: hidden.length,
      //   visibleFields: visible.map(f => f.key),
      //   hiddenFields: hidden.map(f => f.key)
      // });

      this.visibleFieldsComputed = visible;
      this.hiddenFieldsComputed = hidden;
    },
    updateContainerSizes() {
      if (this.$refs.container) {
        this.containerWidth = this.$refs.container.offsetWidth || 1200;
      }
      if (this.$refs.searchButtons) {
        this.buttonsWidth = this.$refs.searchButtons.offsetWidth || 220;
      }
      if (this.$refs.searchRight) {
        this.rightSideWidth = this.$refs.searchRight.offsetWidth || 120;
      }
    },
    setupResizeObserver() {
      if (typeof ResizeObserver !== 'undefined' && this.$refs.container) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.measurementTimer) {
            clearTimeout(this.measurementTimer);
          }
          this.measurementTimer = setTimeout(() => {
            this.updateContainerSizes();
            this.calculateVisibleFields();
          }, 100);
        });
        this.resizeObserver.observe(this.$refs.container);
      }
    },
    loadUserPreferences() {
      // 可以从 localStorage 加载用户偏好设置
      try {
        const saved = localStorage.getItem('intelligent-search-form-preferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          // 应用保存的偏好设置
          if (preferences.containerWidth) {
            // 这里可以应用保存的偏好设置
          }
        }
      } catch (e) {
        console.warn('Failed to load user preferences:', e);
      }
    },
    saveUserPreferences() {
      // 保存用户偏好设置到 localStorage
      try {
        const preferences = {
          containerWidth: this.containerWidth,
          // 其他偏好设置
        };
        localStorage.setItem('intelligent-search-form-preferences', JSON.stringify(preferences));
      } catch (e) {
        console.warn('Failed to save user preferences:', e);
      }
    },
    measureTextWidth(text) {
      if (!text) return 0;

      // 创建临时canvas来精确测量文本宽度
      if (!this._canvas) {
        this._canvas = document.createElement('canvas');
        this._canvasContext = this._canvas.getContext('2d');
      }

      // 设置与CSS相同的字体样式
      this._canvasContext.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      const width = this._canvasContext.measureText(text).width;

      // 为了保险起见，给测量结果加上一些余量
      return Math.ceil(width * 1.1);
    },

    // 新增：计算预估可显示字段数量
    calculateEstimatedVisible() {
      if (this.allFields.length === 0) return 0;

      // 基于容器宽度和字段平均宽度估算
      const avgFieldWidth = 200; // 平均字段宽度估算
      const buttonReserveWidth = 260;
      const safetyMargin = 32;
      const availableWidth = this.containerWidth - this.rightSideWidth - buttonReserveWidth - safetyMargin;

      if (availableWidth <= 0) return 1; // 至少显示1个字段

      const estimatedCount = Math.floor(availableWidth / avgFieldWidth);
      const maxCount = Math.min(this.maxVisibleCount, this.allFields.length);
      const minCount = 1;

      return Math.max(minCount, Math.min(maxCount, estimatedCount));
    }
  }
}
</script>

<style lang="scss" scoped>
.intelligent-search-form {
  background: #fff;
  margin-bottom: 16px;
  border-radius: 6px;

  ::v-deep {

    .el-select,
    .el-input {
      width: 100%;
      max-width:150px;
    }

    .el-form-item__label-wrap {
      margin-left: 0 !important;
    }
  }


  .search-layout {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    .search-left {
      flex: 1;
      min-width: 0;

      .search-form .search-row.primary-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;

        .visible-fields {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 8px;

          ::v-deep .el-form-item {
            margin-bottom: 0;
          }

          .field-wrapper {
            padding-right: 5px;
            flex-shrink: 0;
            display: inline-block;
            width: fit-content;
          }
        }

        .search-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          min-width: fit-content;
          position: relative;

          .filter-button {
            color: #5a6c7d;
            padding: 8px 12px;
            position: relative;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid transparent;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

            &:hover {
              color: #409EFF;
              background: linear-gradient(135deg, #ecf5ff 0%, #f0f8ff 100%);
              border-color: #d4e8ff;
              // transform: translateY(-1px);
              box-shadow: 0 3px 8px rgba(64, 158, 255, 0.15);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 1px 3px rgba(64, 158, 255, 0.2);
            }

            // 有筛选条件时的样式
            &.has-filters {
              background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%);
              border-color: #b3d8ff;
              color: #409EFF;

              &::after {
                content: '';
                position: absolute;
                top: 2px;
                right: 2px;
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 1px 3px rgba(255, 107, 107, 0.3);
                animation: filterBadgePulse 2s infinite;
              }

              &:hover::after {
                animation-play-state: paused;
              }
            }

            // 图标样式优化
            i {
              margin-right: 4px;
              font-size: 14px;
              transition: transform 0.2s ease;
            }

            &:hover i {
              transform: rotate(180deg);
            }
          }

          // 筛选徽章动画
          @keyframes filterBadgePulse {

            0%,
            100% {
              transform: scale(1);
              opacity: 1;
            }

            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}
</style>

<!-- 全局样式 - 确保 popover 样式能正确应用 -->
<style lang="scss">
// Popover 样式 - 现代卡片风格
.filter-popover {
  // 弹出框容器基础样式
  background: linear-gradient(135deg, #ffffff 0%, #f8fafe 100%) !important;
  border: 1px solid #d4e8ff !important;
  border-radius: 12px !important;
  box-shadow:
    0 8px 24px rgba(64, 158, 255, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  padding: 0 !important;
  overflow: hidden !important;

  // 入场动画
  animation: filterPopoverFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transform-origin: top center !important;

  .filter-content {
    padding: 16px;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8f4fd;
      position: relative;

      // 添加装饰性渐变线
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #409EFF 0%, #66b1ff 100%);
        border-radius: 1px;
        opacity: 0.6;
      }

      .filter-title {
        font-weight: 600;
        font-size: 15px;
        color: #2c3e50;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '🔍';
          font-size: 16px;
        }
      }

      .clear-all-btn {
        padding: 6px 12px;
        font-size: 12px;
        color: #8492a6;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          color: #409eff;
          background-color: #ecf5ff;
          transform: translateY(-1px);
        }
      }
    }

    .filter-form {
      .filter-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        min-height: 32px;
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: all 0.3s ease;
        position: relative;

        // 字段入场动画（延时显示）
        animation: filterItemSlideIn 0.4s ease-out;
        animation-fill-mode: both;

        // 为每个字段添加延时
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: #{$i * 0.05}s;
          }
        }



        &:last-child {
          margin-bottom: 6px;
        }

        .filter-label {
          font-size: 13px;
          color: #5a6c7d;
          text-align: right;
          padding-right: 16px;
          padding-top: 8px;
          flex-shrink: 0;
          line-height: 1.4;
          white-space: nowrap;
          font-weight: 500;

          // 确保标签不换行且完全显示
          overflow: visible;
          word-break: keep-all;
          word-wrap: normal;

          // 调整宽度限制，允许更宽的标签
          min-width: 80px;
          max-width: 280px;

          // 确保文字垂直居中对齐
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 32px;
          padding-top: 0;
        }

        .filter-input {
          flex: 1;
          min-width: 0;

          .el-form-item {
            margin-bottom: 0;

            .el-form-item__label {
              display: none;
            }

            .el-form-item__content {
              margin-left: 0 !important;
              line-height: normal;
            }
          }

          .el-input,
          .el-select,
          .el-date-picker,
          .el-autocomplete {
            width: 100%;

            .el-input__inner {
              height: 32px;
              line-height: 32px;
              font-size: 13px;
              border: 1px solid #e1ecf4;
              border-radius: 6px;
              background-color: #ffffff;
              transition: all 0.2s ease;

              &:focus {
                border-color: #409eff;
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                background-color: #fcfdff;
              }

              &:hover {
                border-color: #c5d9e8;
              }

              &::placeholder {
                color: #a8b3c5;
                font-size: 12px;
              }
            }
          }

          // Select 组件特殊样式
          .el-select {
            .el-input__inner {
              cursor: pointer;
            }

            .el-input__suffix {
              .el-input__suffix-inner {
                .el-icon-arrow-up {
                  color: #409eff;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 底部按钮区域样式
.filter-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e8f4fd;
  position: relative;

  // 添加装饰性渐变线
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #409EFF 50%, transparent 100%);
    border-radius: 1px;
    opacity: 0.3;
  }

  .el-button {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 3px;
    min-width: 80px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    // 取消按钮样式
    &:not(.el-button--primary) {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;
      color: #6c757d;

      &:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        border-color: #adb5bd;
        color: #495057;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    // 确认按钮样式
    &.el-button--primary {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      border: 1px solid #409EFF;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      &:hover {
        background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
        border-color: #66b1ff;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
      }
    }

    // 加载状态
    &.is-loading {
      pointer-events: none;

      .el-icon-loading {
        animation: rotating 1s linear infinite;
      }
    }
  }
}

// 关键帧动画定义
@keyframes filterPopoverFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes filterItemSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// 响应式适配
@media (max-width: 768px) {
  ::v-deep .filter-popover {
    border-radius: 8px;

    .filter-content {
      padding: 12px;

      .filter-form {
        .filter-item {
          padding: 4px 6px;
          margin-bottom: 8px;
          flex-direction: column;
          align-items: stretch;

          .filter-label {
            text-align: left;
            padding-right: 0;
            padding-bottom: 4px;
            height: auto;
            justify-content: flex-start;
            font-size: 12px;
          }

          .filter-input {
            .el-input__inner {
              height: 32px;
              line-height: 32px;
              font-size: 12px;
            }
          }
        }
      }
    }
  }

  .filter-footer {
    margin-top: 12px;
    padding-top: 12px;

    .el-button {
      padding: 8px 16px;
      font-size: 12px;
      min-width: 70px;
    }
  }
}

// 深色模式适配（预留）
@media (prefers-color-scheme: dark) {
  ::v-deep .filter-popover {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border-color: #4a5568;

    .filter-content {
      .filter-header {
        border-bottom-color: #4a5568;

        .filter-title {
          color: #f7fafc;
        }

        .clear-all-btn {
          color: #a0aec0;

          &:hover {
            color: #63b3ed;
            background-color: #2d3748;
          }
        }
      }

      .filter-form {
        .filter-item {
          background: rgba(45, 55, 72, 0.7);

          &:hover {
            background: rgba(45, 55, 72, 0.9);
            border-color: #4a5568;
          }

          .filter-label {
            color: #e2e8f0;
          }

          .filter-input {
            .el-input__inner {
              background-color: #2d3748;
              border-color: #4a5568;
              color: #f7fafc;

              &:focus {
                border-color: #63b3ed;
                background-color: #2d3748;
              }

              &::placeholder {
                color: #718096;
              }
            }
          }
        }
      }
    }
  }

  .filter-footer {
    border-top-color: #4a5568;

    .el-button {
      &:not(.el-button--primary) {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        border-color: #4a5568;
        color: #e2e8f0;

        &:hover {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
          color: #f7fafc;
        }
      }
    }
  }
}

// 关键帧动画定义
@keyframes filterPopoverFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes filterItemSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes filterBadgePulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>