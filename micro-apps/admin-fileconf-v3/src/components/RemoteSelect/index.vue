<template>
  <el-select
    v-model="internalValue"
    :placeholder="computedPlaceholder"
    :clearable="clearable"
    :disabled="computedDisabled"
    :multiple="multiple"
    :size="size"
    :style="customStyle"
    :loading="loading"
    filterable
    :filter-method="handleFilter"
    @change="handleChange"
    @clear="handleClear"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in filteredOptions"
      :key="getRowKey(item)"
      :label="getLabel(item)"
      :value="getValue(item)"
    >
      <slot name="option" :item="item">
        <span>{{ getLabel(item) }}</span>
      </slot>
    </el-option>
    <el-option v-if="loading" disabled value="__loading_indicator__">
      <span>加载中...</span>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { typeModel, typeCategoryWithModels } from '@/api/base/category'
import { getCustomerList } from '@/api/customer'
import { dictUserList, dictUserByRoles } from '@/api/system/user'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  type: { type: String, default: '' },
  categoryId: { type: [String, Number], default: '' },
  request: { type: Function, default: null },
  params: { type: Object, default: () => ({}) },
  searchKey: { type: String, default: 'key' },
  pageKey: { type: String, default: 'p' },
  pageSizeKey: { type: String, default: 'l' },
  pageSize: { type: Number, default: 10000 },
  listPath: { type: String, default: '' },
  totalPath: { type: String, default: '' },
  labelKey: { type: String, default: '' },
  valueKey: { type: String, default: '' },
  rowKey: { type: String, default: '' },
  returnObject: { type: Boolean, default: false },
  returnFields: { type: Array, default: () => [] },
  filterFn: { type: Function, default: null },
  transformFn: { type: Function, default: null },
  placeholder: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  size: { type: String, default: 'small' },
  customStyle: { type: [String, Object], default: 'width: 200px' },
  immediate: { type: Boolean, default: true },
  cache: { type: Boolean, default: true },
  disableWithoutParent: { type: Boolean, default: true },
  // 品类数据源（用于型号联动）
  categoryData: { type: Array, default: null }
})

const emit = defineEmits(['update:modelValue', 'change', 'item-change', 'clear'])

const options = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const filterKeyword = ref('')
const cachedData = ref(null)

// 本地过滤后的选项
const filteredOptions = computed(() => {
  if (!filterKeyword.value) return options.value
  const keyword = filterKeyword.value.toLowerCase()
  return options.value.filter(item => {
    const label = getLabel(item)
    return label && label.toLowerCase().includes(keyword)
  })
})

const TYPE_CONFIGS = {
  // 品类（带型号列表，用于联动）
  category: { labelKey: 'name', valueKey: 'id', rowKey: 'id', placeholder: '请选择品类', listPath: 'data', request: () => typeCategoryWithModels() },
  categoryName: { labelKey: 'name', valueKey: 'name', rowKey: 'id', placeholder: '请选择品类', listPath: 'data', request: () => typeCategoryWithModels() },
  // 型号（从品类的 computerList 中获取，需要配合 categoryData 使用）
  model: { labelKey: 'name', valueKey: 'model', rowKey: 'model', placeholder: '请选择型号', listPath: 'data', request: (p) => typeModel(p) },
  modelName: { labelKey: 'name', valueKey: 'name', rowKey: 'model', placeholder: '请选择型号', listPath: 'data', request: (p) => typeModel(p) },
  user: { labelKey: 'nickName', valueKey: 'userName', rowKey: 'id', placeholder: '请选择用户', listPath: 'data', request: (p) => dictUserList(p) },
  userId: { labelKey: 'nickName', valueKey: 'id', rowKey: 'id', placeholder: '请选择用户', listPath: 'data', request: (p) => dictUserList(p) },
  customer: { labelKey: 'name', valueKey: 'id', rowKey: 'id', placeholder: '请选择客户', listPath: 'data.list', filterFn: (item) => item.status === 0, request: (p) => getCustomerList(p) },
  customerName: { labelKey: 'name', valueKey: 'name', rowKey: 'id', placeholder: '请选择客户', listPath: 'data.list', filterFn: (item) => item.status === 0, request: (p) => getCustomerList(p) },
  // 项目经理（通过角色查询）
  projectManager: { labelKey: 'name', valueKey: 'id', rowKey: 'id', placeholder: '请选择项目经理', listPath: 'data', request: () => dictUserByRoles(['pm']) },
  projectManagerName: { labelKey: 'name', valueKey: 'name', rowKey: 'id', placeholder: '请选择项目经理', listPath: 'data', request: () => dictUserByRoles(['pm']) },
  // 销售（通过角色查询）
  sales: { labelKey: 'name', valueKey: 'id', rowKey: 'id', placeholder: '请选择销售', listPath: 'data', request: () => dictUserByRoles(['sale_manager']) },
  salesName: { labelKey: 'name', valueKey: 'name', rowKey: 'id', placeholder: '请选择销售', listPath: 'data', request: () => dictUserByRoles(['sale_manager']) }
}

const typeConfig = computed(() => TYPE_CONFIGS[props.type] || {})
const computedLabelKey = computed(() => props.labelKey || typeConfig.value.labelKey || 'label')
const computedValueKey = computed(() => props.valueKey || typeConfig.value.valueKey || 'value')
const computedRowKey = computed(() => props.rowKey || typeConfig.value.rowKey || 'id')
const computedPlaceholder = computed(() => props.placeholder || typeConfig.value.placeholder || '请选择')
const computedListPath = computed(() => props.listPath || typeConfig.value.listPath || 'data')

const computedDisabled = computed(() => {
  if (props.disabled) return true
  if ((props.type === 'model' || props.type === 'modelName') && props.disableWithoutParent) return !props.categoryId
  return false
})

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function getByPath(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((o, k) => (o || {})[k], obj)
}

function getLabel(item) { return item?.[computedLabelKey.value] ?? '' }
function getValue(item) {
  if (props.returnObject) return item
  if (props.returnFields.length > 0) {
    return props.returnFields.reduce((acc, key) => { acc[key] = item[key]; return acc }, {})
  }
  return item?.[computedValueKey.value] ?? ''
}
function getRowKey(item) { return item?.[computedRowKey.value] ?? '' }

async function fetchData() {
  // 如果是型号类型且提供了 categoryData，直接从 categoryData 中获取
  if ((props.type === 'model' || props.type === 'modelName') && props.categoryData && props.categoryId) {
    const category = props.categoryData.find(c => c.id === props.categoryId || c.name === props.categoryId)
    if (category && category.computerList) {
      options.value = processData(category.computerList)
      total.value = options.value.length
    } else {
      options.value = []
      total.value = 0
    }
    return
  }
  
  if (loading.value) return
  if (props.cache && cachedData.value) {
    options.value = processData(cachedData.value)
    return
  }
  loading.value = true
  try {
    const requestFn = props.request || typeConfig.value.request
    if (!requestFn) { console.warn('[RemoteSelect] 未配置请求函数'); return }
    const requestParams = { [props.pageKey]: page.value, [props.pageSizeKey]: props.pageSize, ...props.params }
    if (props.type === 'model' || props.type === 'modelName') {
      if (props.categoryId) requestParams.categoryId = props.categoryId
    }
    const res = await requestFn(requestParams)
    if (res.code === 200) {
      let list = getByPath(res, computedListPath.value) || []
      list = processData(list)
      options.value = list
      if (props.cache) cachedData.value = list
      total.value = list.length
    }
  } catch (error) { console.error('[RemoteSelect] 加载数据失败:', error) }
  finally { loading.value = false }
}

function processData(list) {
  if (!list || !Array.isArray(list)) return []
  let result = [...list]
  const filterFunc = props.filterFn || typeConfig.value.filterFn
  if (filterFunc) result = result.filter(filterFunc)
  if (props.transformFn) result = result.map(props.transformFn)
  return result
}

function refresh() { page.value = 1; filterKeyword.value = ''; cachedData.value = null; options.value = []; fetchData() }
function handleFilter(query) { filterKeyword.value = query || '' }
function handleChange(val) {
  const selectedItem = options.value.find(item => getValue(item) === val)
  emit('change', val)
  emit('item-change', selectedItem || null)
}
function handleClear() { filterKeyword.value = ''; emit('clear') }
function handleFocus() { if (options.value.length === 0) fetchData() }
function handleVisibleChange(visible) {
  if (!visible) { filterKeyword.value = '' }
}

watch(() => props.categoryId, (newVal, oldVal) => {
  if ((props.type === 'model' || props.type === 'modelName') && newVal !== oldVal) {
    emit('update:modelValue', ''); options.value = []; cachedData.value = null; page.value = 1
    if (newVal) fetchData()
  }
})

// 监听 categoryData 变化（用于型号联动）
watch(() => props.categoryData, () => {
  if ((props.type === 'model' || props.type === 'modelName') && props.categoryId) {
    fetchData()
  }
}, { deep: true })

onMounted(() => { if (props.immediate && !computedDisabled.value) fetchData() })

defineExpose({ refresh, getOptions: () => options.value })
</script>

<style scoped>
.load-more-text { color: var(--el-color-primary); cursor: pointer; }
.load-more-text:hover { text-decoration: underline; }
</style>
