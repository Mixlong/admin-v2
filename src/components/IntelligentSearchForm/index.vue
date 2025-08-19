<template>
  <div class="intelligent-search-form" ref="container">
    <div class="search-layout">
      <!-- 左侧：搜索表单区域 -->
      <div class="search-left" ref="searchLeft">
        <el-form :model="searchForm" ref="searchForm" :inline="true" class="search-form" label-width="68px">
          <!-- 第一行：自动计算显示的字段 + 按钮 -->
          <div class="search-row primary-row">
            <!-- 动态显示的字段 -->
            <div class="visible-fields" ref="visibleFields">
              <div v-for="(field, fieldIndex) in initialVisibleFields" :key="field.key" class="field-wrapper">
                <slot :name="`field-${field.key}`" :field="field" :searchForm="searchForm">
                  <el-form-item :label="field.label" :prop="field.key">
                    <component :is="field.component || 'el-input'" v-model="searchForm[field.key]"
                      v-bind="getFieldProps(field)" @change="handleFieldChange(field.key, $event)" />
                  </el-form-item>
                </slot>
              </div>
            </div>

            <!-- 搜索按钮区域 - 始终在最后 -->
            <div class="search-buttons" ref="searchButtons">
              <el-button type="primary" @click="handleSearch" icon="el-icon-search" size="mini">搜索</el-button>
              <el-button @click="handleReset" icon="el-icon-refresh" size="mini">重置</el-button>

              <!-- 展开按钮 - 只在有隐藏字段时显示 -->
              <el-button v-if="initialHiddenFields.length > 0" type="text" @click="toggleCollapsed"
                class="toggle-button" size="mini" :icon="isCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'">
                {{ isCollapsed ? `展开(${initialHiddenFields.length})` : '收起' }}
              </el-button>
            </div>
          </div>

          <!-- 第二行：展开后显示剩余字段 -->
          <el-collapse-transition @before-enter="onBeforeEnter" @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave" @after-leave="onAfterLeave">
            <div v-show="!isCollapsed && initialHiddenFields.length > 0" class="search-row advanced-row">
              <div v-for="field in initialHiddenFields" :key="field.key" class="field-wrapper">
                <slot :name="`field-${field.key}`" :field="field" :searchForm="searchForm">
                  <el-form-item :label="field.label" :prop="field.key">
                    <component :is="field.component || 'el-input'" v-model="searchForm[field.key]"
                      v-bind="getFieldProps(field)" @change="handleFieldChange(field.key, $event)" />
                  </el-form-item>
                </slot>
              </div>
            </div>
          </el-collapse-transition>
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
    // 搜索表单数据
    searchForm: {
      type: Object,
      required: true
    },
    // 所有搜索字段配置（包含优先级）
    fields: {
      type: Array,
      required: true
    },
    // 字段优先级（向下兼容，已废弃）
    fieldPriorities: {
      type: Object,
      default: () => ({}),
      validator(value) {
        if (Object.keys(value).length > 0) {
          console.warn('IntelligentSearchForm: fieldPriorities prop is deprecated. Please use sort property in fields array instead.');
        }
        return true;
      }
    }
  },
  data() {
    return {
      isCollapsed: true,
      containerWidth: 1200, // 设置合理的初始值
      rightSideWidth: 120,
      buttonsWidth: 220,
      fieldWidths: new Map(),
      visibleFieldsComputed: [], // 初始化时会立即计算
      hiddenFieldsComputed: [],
      resizeObserver: null,
      measurementTimer: null,
      isLayoutReady: false // 添加布局就绪状态
    }
  },
  computed: {
    // 按排序权重排序的所有字段
    allFields() {
      return [...this.fields].sort((a, b) => {
        // 优先使用字段内的sort属性，如果没有则使用fieldPriorities（向下兼容）
        const sortA = a.sort || a.priority || this.fieldPriorities[a.key] || 999;
        const sortB = b.sort || b.priority || this.fieldPriorities[b.key] || 999;
        return sortA - sortB; // 升序排列：小的数字在前面
      });
    },

    // 初始可见字段 - 避免初始化时的空白
    initialVisibleFields() {
      if (!this.isLayoutReady && this.allFields.length > 0) {
        // 预估显示前3-4个字段
        const estimatedVisible = Math.min(4, this.allFields.length);
        return this.allFields.slice(0, estimatedVisible);
      }
      return this.visibleFieldsComputed;
    },

    // 初始隐藏字段
    initialHiddenFields() {
      if (!this.isLayoutReady && this.allFields.length > 4) {
        return this.allFields.slice(4);
      }
      return this.hiddenFieldsComputed;
    }
  },
  mounted() {
    // 立即进行初始计算，避免页面跳动
    this.initializeLayout();
    this.setupResizeObserver();
    this.loadUserPreferences();

    // 延迟标记布局就绪，进行精确计算
    setTimeout(() => {
      this.isLayoutReady = true;
      this.calculateVisibleFields();
    }, 200);
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.measurementTimer) {
      clearTimeout(this.measurementTimer);
    }
    // 确保滚动条被解锁
    this.unlockScrollbar();
  },
  methods: {
    // 初始化布局
    initializeLayout() {
      // 先测量所有字段的实际宽度
      this.measureFieldWidths();
      // 然后计算能显示多少字段
      this.calculateVisibleFields();
    },

    // 测量字段宽度
    measureFieldWidths() {
      // 直接使用估算宽度，避免复杂的DOM测量
      this.allFields.forEach(field => {
        const labelWidth = Math.max((field.label.length * 14) + 68, 80); // label-width，最小80px
        const inputWidth = this.getEstimatedInputWidth(field);
        const estimatedWidth = labelWidth + inputWidth + 20; // 增加间距
        this.fieldWidths.set(field.key, estimatedWidth);
        console.log(`字段 ${field.key} 估算宽度: ${estimatedWidth}px`);
      });

      // 设置固定的按钮宽度
      this.buttonsWidth = 220; // 搜索、重置、展开按钮的总宽度
      console.log(`按钮区域宽度: ${this.buttonsWidth}px`);
    },

    // 估算输入框宽度
    getEstimatedInputWidth(field) {
      const widthMap = {
        'el-input': 160,
        'el-select': 150,
        'el-date-picker': 240,
        'el-autocomplete': 200,
        'treeselect': 150
      };
      return widthMap[field.component] || 160;
    },

    // 计算可见字段
    calculateVisibleFields() {
      this.updateContainerSizes();

      // 确保有合理的最小宽度
      const minContainerWidth = 800;
      const actualContainerWidth = Math.max(this.containerWidth, minContainerWidth);

      // 重新计算可用宽度 - 不使用flex:1的紧凑布局
      // 按钮现在紧跟在字段后面，需要为按钮区域预留空间
      const containerPadding = 32; // 容器内边距 (16px * 2)
      const layoutGap = 16; // search-layout的gap
      const buttonAreaWidth = this.buttonsWidth + 8; // 按钮区域宽度 + margin-left

      // 总可用宽度需要减去右侧操作按钮区域和按钮区域
      const totalReservedWidth = this.rightSideWidth + buttonAreaWidth + containerPadding + layoutGap;
      const availableWidth = actualContainerWidth - totalReservedWidth;

      let currentWidth = 0;
      const visible = [];
      const hidden = [];

      for (const field of this.allFields) {
        const fieldWidth = this.fieldWidths.get(field.key) || 250;

        // 更精确的宽度判断 - 考虑字段间的间距
        const fieldWithGap = fieldWidth + (visible.length > 0 ? 8 : 0); // 字段间8px间距

        // 放宽条件：可用宽度足够 且 不超过最大显示数量
        if (currentWidth + fieldWithGap <= availableWidth && visible.length < 8) {
          visible.push(field);
          currentWidth += fieldWithGap;
        } else {
          hidden.push(field);
        }
      }

      // 确保至少显示2个字段（如果有的话）
      if (visible.length === 0 && this.allFields.length > 0) {
        visible.push(this.allFields[0]);
        if (this.allFields.length > 1) {
          visible.push(this.allFields[1]);
        }
        // 从hidden中移除已添加的字段
        hidden.splice(0, visible.length);
      } else if (visible.length === 1 && this.allFields.length > 1) {
        // 检查是否还能添加更多字段
        for (let i = 1; i < this.allFields.length && visible.length < 8; i++) {
          const field = this.allFields[i];
          const fieldWidth = this.fieldWidths.get(field.key) || 250;
          const fieldWithGap = fieldWidth + 8; // 添加间距

          if (currentWidth + fieldWithGap <= availableWidth) {
            visible.push(field);
            currentWidth += fieldWithGap;
            // 从hidden中移除
            const hiddenIndex = hidden.findIndex(h => h.key === field.key);
            if (hiddenIndex > -1) {
              hidden.splice(hiddenIndex, 1);
            }
          } else {
            break; // 空间不够，停止添加
          }
        }
      }

      // 只有在布局就绪后才更新计算结果，避免初始化时的跳动
      if (this.isLayoutReady) {
        this.visibleFieldsComputed = visible;
        this.hiddenFieldsComputed = hidden;

        console.log(`布局计算: 容器宽度=${this.containerWidth}(实际=${actualContainerWidth})`);
        console.log(`空间分配: 右侧=${this.rightSideWidth}px, 按钮区域=${buttonAreaWidth}px, 总预留=${totalReservedWidth}px, 字段可用=${availableWidth}px`);
        console.log(`字段分配: 显示${visible.length}个(占用${currentWidth}px), 隐藏${hidden.length}个`);
        console.log('可见字段:', visible.map(f => `${f.key}(${this.fieldWidths.get(f.key) || 250}px)`));
        console.log('隐藏字段:', hidden.map(f => f.key));
      } else {
        // 初始化阶段，只记录日志但不更新显示
        console.log(`初始计算: 容器宽度=${this.containerWidth}(实际=${actualContainerWidth}), 可用宽度=${availableWidth}px, 预计显示${visible.length}个字段`);
      }
    },

    // 更新容器尺寸
    updateContainerSizes() {
      this.$nextTick(() => {
        if (this.$refs.container) {
          this.containerWidth = this.$refs.container.offsetWidth;
          console.log(`容器宽度更新: ${this.containerWidth}px`);
        } else {
          // 如果无法获取容器宽度，使用默认值
          this.containerWidth = 1200;
          console.log('使用默认容器宽度: 1200px');
        }

        if (this.$refs.searchRight) {
          this.rightSideWidth = this.$refs.searchRight.offsetWidth;
        } else {
          this.rightSideWidth = 120; // 预估右侧按钮宽度
        }

        console.log(`右侧宽度: ${this.rightSideWidth}px`);
      });
    },

    // 设置尺寸监听器
    setupResizeObserver() {
      if (!window.ResizeObserver) {
        // 降级到监听窗口大小变化
        window.addEventListener('resize', this.handleResize);
        return;
      }

      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.measurementTimer);
        this.measurementTimer = setTimeout(() => {
          this.calculateVisibleFields();
        }, 100);
      });

      this.resizeObserver.observe(this.$refs.container);
    },

    // 处理窗口大小变化（降级方案）
    handleResize() {
      clearTimeout(this.measurementTimer);
      this.measurementTimer = setTimeout(() => {
        this.calculateVisibleFields();
      }, 100);
    },

    // 获取字段属性
    getFieldProps(field) {
      const defaultProps = {
        size: 'mini',
        clearable: true,
        placeholder: field.placeholder || `请选择${field.label}`
      };

      // 如果是选择框，设置默认宽度
      if (field.component === 'el-select') {
        defaultProps.style = 'width: 140px';
      }

      return { ...defaultProps, ...(field.props || {}) };
    },

    // 处理字段变化
    handleFieldChange(fieldKey, value) {
      const field = this.allFields.find(f => f.key === fieldKey);
      if (field && field.onChange) {
        field.onChange(value);
      }
      this.$emit('field-change', fieldKey, value);
    },

    // 切换折叠状态
    toggleCollapsed() {
      // 防止滚动条抖动的处理
      this.preventScrollbarFlicker(() => {
        this.isCollapsed = !this.isCollapsed;
        this.saveUserPreferences();
        this.$emit('toggle-collapsed', this.isCollapsed);
      });
    },

    // 防止滚动条抖动
    preventScrollbarFlicker(callback) {
      // 获取当前滚动位置
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 临时隐藏滚动条，保持页面宽度
      const originalOverflow = document.documentElement.style.overflow;
      const originalPaddingRight = document.documentElement.style.paddingRight;

      // 计算滚动条宽度
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // 设置样式防止抖动
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

      // 执行回调
      callback();

      // 延迟恢复，等待动画完成
      setTimeout(() => {
        // 恢复原始样式
        document.documentElement.style.overflow = originalOverflow;
        document.documentElement.style.paddingRight = originalPaddingRight;

        // 恢复滚动位置
        window.scrollTo(scrollLeft, scrollTop);
      }, 300); // 与CSS动画时间一致
    },

    // 动画事件处理
    onBeforeEnter(el) {
      // 展开前：锁定滚动条
      this.lockScrollbar();
    },

    onAfterEnter(el) {
      // 展开后：释放滚动条
      this.unlockScrollbar();
      // 触发表格高度重新计算
      this.$emit('layout-changed');
    },

    onBeforeLeave(el) {
      // 收起前：锁定滚动条
      this.lockScrollbar();
    },

    onAfterLeave(el) {
      // 收起后：释放滚动条
      this.unlockScrollbar();
      // 触发表格高度重新计算
      this.$emit('layout-changed');
    },

    // 锁定滚动条
    lockScrollbar() {
      if (this._scrollLocked) return;

      this._scrollPosition = {
        top: window.pageYOffset || document.documentElement.scrollTop,
        left: window.pageXOffset || document.documentElement.scrollLeft
      };

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      this._originalStyles = {
        overflow: document.documentElement.style.overflow,
        paddingRight: document.documentElement.style.paddingRight
      };

      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      this._scrollLocked = true;
    },

    // 解锁滚动条
    unlockScrollbar() {
      if (!this._scrollLocked) return;

      document.documentElement.style.overflow = this._originalStyles.overflow;
      document.documentElement.style.paddingRight = this._originalStyles.paddingRight;

      window.scrollTo(this._scrollPosition.left, this._scrollPosition.top);
      this._scrollLocked = false;
    },

    // 处理搜索
    handleSearch() {
      this.$emit('search', this.searchForm);
    },

    // 处理重置
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.$emit('reset');
    },

    // 保存用户偏好
    saveUserPreferences() {
      try {
        const key = `intelligent-search-${this.$route.name || 'default'}`;
        const preferences = {
          isCollapsed: this.isCollapsed,
          timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(preferences));
      } catch (error) {
        console.warn('保存搜索偏好失败:', error);
      }
    },

    // 加载用户偏好
    loadUserPreferences() {
      try {
        const key = `intelligent-search-${this.$route.name || 'default'}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const preferences = JSON.parse(saved);
          this.isCollapsed = preferences.isCollapsed !== false; // 默认折叠
        }
      } catch (error) {
        console.warn('加载搜索偏好失败:', error);
      }
    }
  },

  watch: {
    fields: {
      handler() {
        // 字段变化时立即重新计算，避免延迟
        this.isLayoutReady = false;
        this.$nextTick(() => {
          this.initializeLayout();
          setTimeout(() => {
            this.isLayoutReady = true;
            this.calculateVisibleFields();
          }, 100);
        });
      },
      deep: true
    }
  },

  created() {
    // 在组件创建时预先计算字段宽度，避免mounted时的计算延迟
    if (this.fields && this.fields.length > 0) {
      this.measureFieldWidths();
    }
  }
}
</script>

<style lang="scss" scoped>
.intelligent-search-form {
  background: #fff;
  margin-bottom: 16px;
  border-radius: 6px;

  .search-layout {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    .search-left {
      flex: 1;
      min-width: 0;

      .search-form {
        .search-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          &.primary-row {
            .visible-fields {
              display: flex;
              align-items: flex-start;
              flex-wrap: nowrap; // 关键：不允许换行
              gap: 8px;
              // 不使用flex:1，让字段区域只占用实际需要的宽度
              transition: all 0.3s ease; // 添加平滑过渡

              .field-wrapper {
                flex-shrink: 0;
                display: inline-block;
                opacity: 1;
                transform: translateX(0);
                transition: opacity 0.3s ease, transform 0.3s ease;
              }
            }

            .search-buttons {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-shrink: 0;
              margin-left: 8px; // 与字段区域保持一致的间距

              .toggle-button {
                color: #606266;
                padding: 7px 8px;

                &:hover {
                  color: #409EFF;
                  background-color: #ecf5ff;
                }
              }
            }
          }

          &.advanced-row {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f0f0f0;
            flex-wrap: wrap; // 高级行允许换行

            .field-wrapper {
              flex-shrink: 0;
              display: inline-block;
            }
          }
        }

        /deep/ .el-form-item {
          margin-bottom: 8px;
          margin-right: 12px;
          flex-shrink: 0; // 防止字段被压缩

          .el-form-item__label {
            padding-right: 8px;
            font-size: 13px;
            color: #606266;
            white-space: nowrap;
          }

          .el-input,
          .el-select,
          .el-autocomplete,
          .el-date-picker {

            &.el-input--mini,
            &.el-select--mini {
              .el-input__inner {
                height: 32px;
                line-height: 32px;
                font-size: 13px;
              }
            }
          }
        }
      }
    }

    .search-right {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }



  // 响应式设计
  @media (max-width: 1200px) {
    .search-layout {
      flex-direction: column;
      align-items: stretch;

      .search-left {
        .search-row.primary-row {
          flex-wrap: wrap;

          .visible-fields {
            flex-wrap: wrap;
            flex-basis: 100%;
          }

          .search-buttons {
            margin-top: 8px;
            justify-content: flex-start;
          }
        }
      }

      .search-right {
        margin-top: 8px;
        justify-content: flex-start;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;

    .search-left {
      /deep/ .el-form-item {
        width: 100%;
        margin-right: 0;

        .el-input,
        .el-select,
        .el-autocomplete,
        .el-date-picker {
          width: 100% !important;
        }
      }

      .search-row {
        flex-direction: column;

        .visible-fields {
          width: 100%;
          flex-direction: column;
        }

        .search-buttons {
          width: 100%;
          justify-content: space-between;
          margin-top: 8px;

          .el-button {
            flex: 1;
            margin: 0 4px;
            max-width: 80px;

            &.toggle-button {
              flex: 0 0 auto;
              max-width: none;
            }
          }
        }
      }
    }

    .search-right {
      width: 100%;

      .el-button {
        flex: 1;
        margin: 0 4px;
      }
    }
  }
}

// 动画过渡优化
.el-collapse-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height, opacity;
}

// 防止展开时的布局抖动
.intelligent-search-form {
  // 使用 contain 属性优化渲染性能
  contain: layout style;

  .search-row.advanced-row {
    // 确保展开行有稳定的渲染上下文
    transform: translateZ(0);
    backface-visibility: hidden;
  }
}
</style>