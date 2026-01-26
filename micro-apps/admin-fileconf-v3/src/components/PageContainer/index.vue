<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <div v-if="showSearch" class="search-section">
      <SearchBar
        :search-form="searchForm"
        :fields="fields"
        :default-visible-count="visibleCount"
        :max-visible-count="maxVisibleCount"
        :label-width="labelWidth"
        @search="handleSearch"
        @reset="handleReset"
        @field-change="handleFieldChange"
      >
        <!-- 透传自定义字段插槽 -->
        <template v-for="field in fields" :key="field.key" #[`field-${field.key}`]="slotProps">
          <slot :name="`field-${field.key}`" v-bind="slotProps" />
        </template>
        <!-- 额外按钮 -->
        <template #extra-buttons>
          <slot name="search-buttons" />
        </template>
        <!-- 右侧操作按钮 -->
        <template #page-actions>
          <slot name="actions" />
        </template>
      </SearchBar>
    </div>

    <!-- 工具栏（当不显示搜索时） -->
    <div v-if="!showSearch && $slots.toolbar" class="toolbar-section">
      <slot name="toolbar" />
    </div>

    <!-- 主体内容 -->
    <div class="main-section">
      <slot />
    </div>

    <!-- 分页 -->
    <pagination
      v-if="showPagination && total > 0"
      v-model:page="pageParams.pageNum"
      v-model:limit="pageParams.pageSize"
      :total="total"
      @pagination="handlePagination"
    />
  </div>
</template>

<script setup>
import SearchBar from '@/components/SearchBar/index.vue'

const props = defineProps({
  searchForm: { type: Object, default: () => ({}) },
  fields: { type: Array, default: () => [] },
  visibleCount: { type: Number, default: 4 },
  maxVisibleCount: { type: Number, default: 6 },
  labelWidth: { type: String, default: 'auto' },
  showSearch: { type: Boolean, default: true },
  pageParams: { type: Object, default: () => ({ pageNum: 1, pageSize: 10 }) },
  total: { type: Number, default: 0 },
  showPagination: { type: Boolean, default: true }
})

const emit = defineEmits(['search', 'reset', 'pagination', 'field-change'])

function handleSearch(form) {
  emit('search', form)
}

function handleReset() {
  emit('reset')
}

function handleFieldChange(key, value) {
  emit('field-change', key, value)
}

function handlePagination() {
  emit('pagination', props.pageParams)
}

defineExpose({
  search: () => handleSearch(props.searchForm),
  reset: handleReset
})
</script>

<style lang="scss" scoped>
.page-container {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px; // 四周留出间距显示底色
}

.search-section {
  flex-shrink: 0;
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.toolbar-section {
  flex-shrink: 0;
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.main-section {
  flex: 1;
  min-height: 0;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
}
</style>
