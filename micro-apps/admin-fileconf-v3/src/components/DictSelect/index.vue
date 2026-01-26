<template>
  <el-select
    v-model="internalValue"
    :placeholder="computedPlaceholder"
    :clearable="clearable"
    :disabled="disabled"
    :multiple="multiple"
    :size="size"
    :style="customStyle"
    :loading="loading"
    filterable
    :filter-method="handleFilter"
    @change="handleChange"
    @clear="handleClear"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in filteredOptions"
      :key="item[valueKey]"
      :label="item[labelKey]"
      :value="item[valueKey]"
    />
  </el-select>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getDicts } from '@/api/system/dict/data'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  dictType: { type: String, default: '' },
  request: { type: Function, default: null },
  params: { type: Object, default: () => ({}) },
  options: { type: Array, default: null },
  listPath: { type: String, default: 'data' },
  labelKey: { type: String, default: 'dictLabel' },
  valueKey: { type: String, default: 'dictValue' },
  valueType: { type: String, default: 'auto' },
  placeholder: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  size: { type: String, default: 'small' },
  customStyle: { type: [String, Object], default: 'width: 100%' },
  immediate: { type: Boolean, default: true },
  cache: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'change', 'item-change', 'clear'])

const optionList = ref([])
const loading = ref(false)
const filterKeyword = ref('')
const cachedData = ref(null)

const filteredOptions = computed(() => {
  const list = props.options || optionList.value
  if (!filterKeyword.value) return list
  const keyword = filterKeyword.value.toLowerCase()
  return list.filter(item => {
    const label = String(item[props.labelKey] || '')
    return label.toLowerCase().includes(keyword)
  })
})

const computedPlaceholder = computed(() => props.placeholder || '请选择')

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function getByPath(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((o, k) => (o || {})[k], obj)
}

function convertValue(val) {
  if (props.valueType === 'string') return String(val)
  if (props.valueType === 'number') return Number(val)
  return val
}

async function fetchData() {
  if (props.options) return
  if (loading.value) return
  if (props.cache && cachedData.value) {
    optionList.value = cachedData.value
    return
  }
  
  loading.value = true
  try {
    let res
    if (props.request) {
      res = await props.request(props.params)
    } else if (props.dictType) {
      res = await getDicts(props.dictType)
    } else {
      console.warn('[DictSelect] 未配置 dictType、request 或 options')
      return
    }
    
    if (res.code === 200) {
      let list = getByPath(res, props.listPath) || []
      if (!Array.isArray(list)) list = []
      if (props.valueType !== 'auto') {
        list = list.map(item => ({
          ...item,
          [props.valueKey]: convertValue(item[props.valueKey])
        }))
      }
      optionList.value = list
      if (props.cache) cachedData.value = list
    }
  } catch (error) {
    console.error('[DictSelect] 加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

function refresh() {
  cachedData.value = null
  optionList.value = []
  fetchData()
}

function handleFilter(query) {
  filterKeyword.value = query || ''
}

function handleChange(val) {
  const list = props.options || optionList.value
  const selectedItem = list.find(item => item[props.valueKey] === val)
  emit('change', val)
  emit('item-change', selectedItem || null)
}

function handleClear() {
  filterKeyword.value = ''
  emit('clear')
}

function handleVisibleChange(visible) {
  if (!visible) filterKeyword.value = ''
}

watch(() => props.dictType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    cachedData.value = null
    optionList.value = []
    if (newVal) fetchData()
  }
})

onMounted(() => {
  if (props.immediate && !props.options) fetchData()
})

defineExpose({ refresh, getOptions: () => props.options || optionList.value })
</script>
