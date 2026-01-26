<template>
  <div class="search-bar" ref="containerRef">
    <div class="search-layout">
      <!-- 左侧：搜索表单区域 -->
      <div class="search-left">
        <el-form :model="searchForm" ref="formRef" :inline="true" class="search-form" :label-width="labelWidth" label-position="left">
          <div class="search-row primary-row">
            <!-- 动态显示的字段 -->
            <div class="visible-fields">
              <div v-for="field in visibleFields" :key="field.key" class="field-wrapper">
                <slot :name="`field-${field.key}`" :field="field" :searchForm="searchForm">
                  <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth" :class="field.fieldClass" :style="field.fieldStyle">
                    <!-- 动态组件渲染 -->
                    <template v-if="field.component">
                      <component
                        :is="field.component"
                        v-model="searchForm[field.key]"
                        v-bind="getFieldProps(field)"
                        @change="handleFieldChange(field, $event)"
                        @keyup.enter="handleSearch"
                      >
                        <template v-if="field.component === 'el-select' && field.options">
                          <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                        </template>
                      </component>
                    </template>
                    <!-- 默认类型渲染 -->
                    <template v-else>
                      <el-input
                        v-if="!field.type || field.type === 'input'"
                        v-model="searchForm[field.key]"
                        v-bind="getFieldProps(field)"
                        @keyup.enter="handleSearch"
                      />
                      <el-select
                        v-else-if="field.type === 'select'"
                        v-model="searchForm[field.key]"
                        v-bind="getFieldProps(field)"
                        @change="handleFieldChange(field, $event)"
                      >
                        <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                      </el-select>
                      <el-date-picker
                        v-else-if="field.type === 'date'"
                        v-model="searchForm[field.key]"
                        :type="field.dateType || 'date'"
                        v-bind="getFieldProps(field)"
                        value-format="YYYY-MM-DD"
                      />
                      <el-date-picker
                        v-else-if="field.type === 'daterange'"
                        v-model="searchForm[field.key]"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        v-bind="getFieldProps(field)"
                        value-format="YYYY-MM-DD"
                      />
                      <RemoteSelect
                        v-else-if="field.type === 'remote-select'"
                        v-model="searchForm[field.key]"
                        :type="field.remoteType"
                        v-bind="getFieldProps(field)"
                        @change="handleFieldChange(field, $event)"
                      />
                    </template>
                  </el-form-item>
                </slot>
              </div>
            </div>

            <!-- 搜索按钮区域 -->
            <div class="search-buttons">
              <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
              <el-button @click="handleReset" :icon="Refresh">重置</el-button>
              <slot name="extra-buttons" />

              <!-- 筛选 Popover -->
              <el-popover
                v-if="hiddenFields.length > 0"
                v-model:visible="filterVisible"
                placement="bottom-end"
                :width="popoverWidth"
                trigger="click"
                popper-class="search-bar-filter-popover"
              >
                <template #reference>
                  <el-button :class="['filter-button', { 'has-filters': hiddenFieldsWithValues.length > 0 }]">
                    <el-icon><Filter /></el-icon>
                    <span>筛选({{ hiddenFieldsWithValues.length > 0 ? hiddenFieldsWithValues.length : hiddenFields.length }})</span>
                  </el-button>
                </template>
                <div class="filter-content">
                  <div class="filter-header">
                    <span class="filter-title">高级筛选</span>
                    <el-button link size="small" @click="clearAllFilters">清空所有</el-button>
                  </div>
                  <div class="filter-form">
                    <div v-for="field in hiddenFields" :key="field.key" class="filter-item">
                      <div class="filter-label">{{ field.label }}</div>
                      <div class="filter-input">
                        <slot :name="`field-${field.key}`" :field="field" :searchForm="searchForm">
                          <template v-if="field.component">
                            <component
                              :is="field.component"
                              v-model="searchForm[field.key]"
                              v-bind="getPopoverFieldProps(field)"
                              :teleported="false"
                              @keyup.enter="confirmFilter"
                            >
                              <template v-if="field.component === 'el-select' && field.options">
                                <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                              </template>
                            </component>
                          </template>
                          <template v-else>
                            <el-input
                              v-if="!field.type || field.type === 'input'"
                              v-model="searchForm[field.key]"
                              v-bind="getPopoverFieldProps(field)"
                              @keyup.enter="confirmFilter"
                            />
                            <el-select
                              v-else-if="field.type === 'select'"
                              v-model="searchForm[field.key]"
                              v-bind="getPopoverFieldProps(field)"
                              :teleported="false"
                            >
                              <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                            </el-select>
                            <el-date-picker
                              v-else-if="field.type === 'date'"
                              v-model="searchForm[field.key]"
                              :type="field.dateType || 'date'"
                              v-bind="getPopoverFieldProps(field)"
                              value-format="YYYY-MM-DD"
                              :teleported="false"
                            />
                            <el-date-picker
                              v-else-if="field.type === 'daterange'"
                              v-model="searchForm[field.key]"
                              type="daterange"
                              range-separator="-"
                              start-placeholder="开始"
                              end-placeholder="结束"
                              v-bind="getPopoverFieldProps(field)"
                              value-format="YYYY-MM-DD"
                              :teleported="false"
                            />
                            <RemoteSelect
                              v-else-if="field.type === 'remote-select'"
                              v-model="searchForm[field.key]"
                              :type="field.remoteType"
                              v-bind="getPopoverFieldProps(field)"
                            />
                          </template>
                        </slot>
                      </div>
                    </div>
                  </div>
                  <div class="filter-footer">
                    <el-button @click="filterVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmFilter">确认</el-button>
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 右侧：页面操作按钮区域 -->
      <div class="search-right" v-if="$slots['page-actions']">
        <slot name="page-actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Refresh, Filter } from '@element-plus/icons-vue'
import RemoteSelect from '@/components/RemoteSelect/index.vue'

const props = defineProps({
  searchForm: { type: Object, required: true },
  fields: { type: Array, required: true },
  fieldPriorities: { type: Object, default: () => ({}) },
  defaultVisibleCount: { type: Number, default: 4 },
  maxVisibleCount: { type: Number, default: 6 },
  labelWidth: { type: String, default: 'auto' }
})

const emit = defineEmits(['search', 'reset', 'field-change'])

const containerRef = ref(null)
const formRef = ref(null)
const filterVisible = ref(false)

// 排序后的所有字段
const allFields = computed(() => {
  return [...props.fields].sort((a, b) => {
    const sortA = a.sort || a.priority || props.fieldPriorities[a.key] || 999
    const sortB = b.sort || b.priority || props.fieldPriorities[b.key] || 999
    return sortA - sortB
  })
})

// 可见字段
const visibleFields = computed(() => {
  const count = Math.min(props.defaultVisibleCount, allFields.value.length, props.maxVisibleCount)
  return allFields.value.slice(0, count)
})

// 隐藏字段
const hiddenFields = computed(() => {
  const count = Math.min(props.defaultVisibleCount, allFields.value.length, props.maxVisibleCount)
  return allFields.value.slice(count)
})

// 有值的隐藏字段
const hiddenFieldsWithValues = computed(() => {
  return hiddenFields.value.filter(field => {
    const val = props.searchForm[field.key]
    if (val === undefined || val === null || val === '') return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  })
})

// 计算弹窗宽度
const popoverWidth = computed(() => {
  if (hiddenFields.value.length === 0) return 400
  const maxLabelLen = Math.max(...hiddenFields.value.map(f => (f.label || '').length))
  return Math.max(380, Math.min(500, maxLabelLen * 14 + 280))
})

// 获取字段属性
function getFieldProps(field) {
  return {
    clearable: field.clearable !== false,
    placeholder: field.placeholder || (field.type === 'select' ? `请选择${field.label}` : `请输入${field.label}`),
    style: { width: field.width || '140px' },
    ...(field.props || {})
  }
}

function getPopoverFieldProps(field) {
  return {
    clearable: true,
    placeholder: field.placeholder || (field.type === 'select' ? `请选择${field.label}` : `请输入${field.label}`),
    style: { width: '100%' },
    ...(field.props || {})
  }
}

// 获取默认值
function getDefaultValue(field) {
  return undefined
}

// 事件处理
function handleSearch() {
  emit('search', props.searchForm)
}

function handleReset() {
  allFields.value.forEach(field => {
    props.searchForm[field.key] = getDefaultValue(field)
  })
  emit('reset')
  emit('search', props.searchForm)
}

function handleFieldChange(field, value) {
  emit('field-change', field.key, value)
  if (field.autoSearch !== false && (field.type === 'select' || field.component === 'el-select')) {
    nextTick(() => handleSearch())
  }
}

function confirmFilter() {
  filterVisible.value = false
  handleSearch()
}

function clearAllFilters() {
  hiddenFields.value.forEach(field => {
    props.searchForm[field.key] = getDefaultValue(field)
  })
}

defineExpose({
  search: handleSearch,
  reset: handleReset
})
</script>

<style lang="scss" scoped>
.search-bar {
  .search-layout {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    .search-left {
      flex: 1;
      min-width: 0;

      .search-form {
        :deep(.el-form-item) {
          margin-bottom: 0 !important;
          margin-right: 0 !important;
        }

        :deep(.el-form-item__label-wrap) {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        :deep(.el-form-item__label) {
          padding-right: 8px;
          margin-right: 0 !important;
          color: #606266;
          font-weight: normal;
          width: auto !important;
          flex-shrink: 0;
        }

        :deep(.el-form-item__content) {
          flex: none;
          margin-left: 0 !important;
        }

        :deep(.el-input),
        :deep(.el-select) {
          width: 140px;
        }

        :deep(.el-date-editor) {
          width: 140px;
        }

        :deep(.el-date-editor--daterange) {
          width: 220px;
        }

        .search-row.primary-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;

          .visible-fields {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;

            .field-wrapper {
              flex-shrink: 0;
            }
          }

          .search-buttons {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            .filter-button {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 8px 12px;
              color: #606266;
              border: 1px solid #dcdfe6;
              border-radius: 4px;
              background: #fff;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                color: #409EFF;
                border-color: #c6e2ff;
                background: #ecf5ff;
              }

              &.has-filters {
                color: #409EFF;
                border-color: #409EFF;
                background: #ecf5ff;
                position: relative;

                &::after {
                  content: '';
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 8px;
                  height: 8px;
                  background: #f56c6c;
                  border-radius: 50%;
                  border: 2px solid #fff;
                }
              }

              .el-icon {
                font-size: 14px;
              }
            }
          }
        }
      }
    }

    .search-right {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
    }
  }
}
</style>

<style lang="scss">
/* 筛选弹窗全局样式 */
.search-bar-filter-popover {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;

  .filter-content {
    padding: 16px;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .filter-title {
        font-weight: 600;
        font-size: 14px;
        color: #303133;

        &::before {
          content: '🔍 ';
        }
      }
    }

    .filter-form {
      .filter-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          flex-shrink: 0;
          text-align: right;
          padding-right: 12px;
          font-size: 13px;
          color: #606266;
          white-space: nowrap;
        }

        .filter-input {
          flex: 1;
          min-width: 180px;

          .el-input,
          .el-select,
          .el-date-editor {
            width: 100%;
          }
        }
      }
    }

    .filter-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
