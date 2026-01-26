<template>
  <div class="category-model-select" :style="{ display: inline ? 'inline-flex' : 'flex', gap: gap }">
    <!-- 品类选择 -->
    <RemoteSelect
      v-model="categoryValue"
      :type="returnName ? 'categoryName' : 'category'"
      :placeholder="categoryPlaceholder"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      :style="categoryStyle"
      @item-change="handleCategoryChange"
      @clear="handleCategoryClear"
    />
    
    <!-- 型号选择 -->
    <RemoteSelect
      v-if="showModel"
      ref="modelRef"
      v-model="modelValue"
      :type="returnName ? 'modelName' : 'model'"
      :category-id="categoryIdForModel"
      :placeholder="modelPlaceholder"
      :clearable="clearable"
      :disabled="disabled || !categoryIdForModel"
      :size="size"
      :style="modelStyle"
      @item-change="handleModelChange"
      @clear="handleModelClear"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RemoteSelect from './index.vue'

const props = defineProps({
  // 品类值
  categoryId: { type: [String, Number], default: '' },
  // 型号值
  modelId: { type: [String, Number], default: '' },
  // 是否返回名称而不是ID
  returnName: { type: Boolean, default: false },
  // 是否显示型号选择
  showModel: { type: Boolean, default: true },
  // 品类占位符
  categoryPlaceholder: { type: String, default: '请选择品类' },
  // 型号占位符
  modelPlaceholder: { type: String, default: '请选择型号' },
  // 是否可清空
  clearable: { type: Boolean, default: true },
  // 是否禁用
  disabled: { type: Boolean, default: false },
  // 尺寸
  size: { type: String, default: 'default' },
  // 品类样式
  categoryStyle: { type: [String, Object], default: 'width: 150px' },
  // 型号样式
  modelStyle: { type: [String, Object], default: 'width: 150px' },
  // 间距
  gap: { type: String, default: '12px' },
  // 是否行内显示
  inline: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:categoryId',
  'update:modelId',
  'category-change',
  'model-change',
  'change'
])

const modelRef = ref(null)

// 品类值
const categoryValue = computed({
  get: () => props.categoryId,
  set: (val) => emit('update:categoryId', val)
})

// 型号值
const modelValue = computed({
  get: () => props.modelId,
  set: (val) => emit('update:modelId', val)
})

// 用于型号查询的品类ID（如果返回名称，需要转换）
const categoryIdForModel = computed(() => {
  if (props.returnName) {
    // 如果返回名称，需要从缓存中获取ID
    return selectedCategory.value?.id || ''
  }
  return props.categoryId
})

// 缓存选中的品类对象
const selectedCategory = ref(null)

// 品类变化
function handleCategoryChange(category) {
  selectedCategory.value = category
  // 清空型号
  emit('update:modelId', '')
  emit('category-change', category)
  emitChange()
}

// 品类清空
function handleCategoryClear() {
  selectedCategory.value = null
  emit('update:modelId', '')
  emit('category-change', null)
  emitChange()
}

// 型号变化
function handleModelChange(model) {
  emit('model-change', model)
  emitChange()
}

// 型号清空
function handleModelClear() {
  emit('model-change', null)
  emitChange()
}

// 统一变化事件
function emitChange() {
  emit('change', {
    categoryId: props.categoryId,
    modelId: props.modelId,
    category: selectedCategory.value
  })
}

// 暴露方法
defineExpose({
  refreshModel: () => modelRef.value?.refresh()
})
</script>

<style scoped>
.category-model-select {
  align-items: center;
}
</style>
