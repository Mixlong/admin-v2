<template>
  <el-select
    ref="selectRef"
    v-model="internalValue"
    :placeholder="computedPlaceholder"
    :style="customStyle"
    :size="size"
    :clearable="clearable"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    :loading="loading"
    :reserve-keyword="reserveKeyword"
    :automatic-dropdown="automaticDropdown"
    :teleported="false"
    popper-class="typed-select-popper"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @focus="handleFocus"
  >
    <el-option
      v-for="item in options"
      :key="item[computedDictValue]"
      :label="item[computedDictLabel]"
      :value="returnLabel ? item[computedDictLabel] : item[computedDictValue]"
    />
    <!-- 加载更多 -->
    <el-option v-if="hasMore && !loading" disabled value="">
      <div class="load-more" @click.stop="loadMore">
        加载更多...
      </div>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  // v-model 绑定值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 选择器类型：customer（客户）、user（用户）、category（品类）
  type: {
    type: String,
    default: 'custom'
  },
  // 占位符
  placeholder: {
    type: String,
    default: ''
  },
  // 自定义样式
  customStyle: {
    type: [String, Object],
    default: 'width: 100%'
  },
  // 尺寸
  size: {
    type: String,
    default: 'default'
  },
  // 是否可清空
  clearable: {
    type: Boolean,
    default: true
  },
  // 是否可搜索
  filterable: {
    type: Boolean,
    default: true
  },
  // 是否远程搜索
  remote: {
    type: Boolean,
    default: true
  },
  // 多选时是否保留搜索关键字
  reserveKeyword: {
    type: Boolean,
    default: false
  },
  // 获取焦点时自动弹出下拉框
  automaticDropdown: {
    type: Boolean,
    default: true  // 默认开启自动弹出
  },
  // 是否在挂载时自动展开
  autoExpand: {
    type: Boolean,
    default: true
  },
  // 自定义字典标签字段
  dictLabel: {
    type: String,
    default: ''
  },
  // 自定义字典值字段
  dictValue: {
    type: String,
    default: ''
  },
  // 是否返回 label 而不是 value
  returnLabel: {
    type: Boolean,
    default: false
  },
  // 自定义数据源（如果提供则不使用内置数据）
  dataSource: {
    type: Array,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 组件引用
const selectRef = ref(null)
// 内部值
const internalValue = ref(props.modelValue)
// 选项列表
const options = ref([])
// 加载状态
const loading = ref(false)
// 是否有更多数据
const hasMore = ref(false)
// 当前页码
const currentPage = ref(1)
// 搜索关键字
const searchKeyword = ref('')

// 类型配置
const typeConfigs = {
  customer: {
    dictLabel: 'name',
    dictValue: 'id',
    placeholder: '请选择客户'
  },
  customerName: {
    dictLabel: 'name',
    dictValue: 'name',
    placeholder: '请选择客户'
  },
  user: {
    dictLabel: 'nickName',
    dictValue: 'userName',
    placeholder: '请选择用户'
  },
  category: {
    dictLabel: 'name',
    dictValue: 'id',
    placeholder: '请选择品类'
  },
  categoryName: {
    dictLabel: 'name',
    dictValue: 'name',
    placeholder: '请选择品类'
  }
}

// 计算属性
const typeConfig = computed(() => typeConfigs[props.type] || {})

const computedDictLabel = computed(() => 
  props.dictLabel || typeConfig.value.dictLabel || 'label'
)

const computedDictValue = computed(() => {
  if (props.returnLabel) {
    return props.dictLabel || typeConfig.value.dictLabel || 'label'
  }
  return props.dictValue || typeConfig.value.dictValue || 'value'
})

const computedPlaceholder = computed(() => 
  props.placeholder || typeConfig.value.placeholder || '请选择'
)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  internalValue.value = val
})

// 监听 dataSource 变化
watch(() => props.dataSource, (val) => {
  if (val) {
    options.value = val
    hasMore.value = false
  }
}, { immediate: true })

// 处理值变化
const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}

// 下拉框显示/隐藏
const handleVisibleChange = (visible) => {
  if (visible && options.value.length === 0) {
    loadData()
  }
}

// 获取焦点时处理
const handleFocus = () => {
  // 如果没有数据，主动加载
  if (options.value.length === 0) {
    loadData()
  }
  // 确保下拉框能正确显示
  nextTick(() => {
    if (selectRef.value && props.automaticDropdown) {
      // 延迟一点确保焦点稳定后再展开
      setTimeout(() => {
        selectRef.value?.focus?.()
      }, 50)
    }
  })
}

// 远程搜索
const handleRemoteSearch = (query) => {
  searchKeyword.value = query
  currentPage.value = 1
  loadData(query)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadData(searchKeyword.value, true)
  }
}

// 加载数据
const loadData = async (keyword = '', append = false) => {
  // 如果有自定义数据源，直接使用
  if (props.dataSource) {
    if (keyword) {
      options.value = props.dataSource.filter(item => 
        String(item[computedDictLabel.value]).toLowerCase().includes(keyword.toLowerCase())
      )
    } else {
      options.value = props.dataSource
    }
    hasMore.value = false
    return
  }

  loading.value = true
  
  try {
    let result = { list: [], total: 0 }
    
    switch (props.type) {
      case 'customer':
      case 'customerName':
        result = await loadCustomerData(keyword)
        break
      case 'user':
        result = await loadUserData(keyword)
        break
      case 'category':
      case 'categoryName':
        result = await loadCategoryData(keyword)
        break
      default:
        // 使用模拟数据
        result = getMockData(keyword)
    }
    
    if (append) {
      options.value = [...options.value, ...result.list]
    } else {
      options.value = result.list
    }
    
    hasMore.value = options.value.length < result.total
  } catch (error) {
    console.error('加载数据失败:', error)
    options.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 加载客户数据
const loadCustomerData = async (keyword = '') => {
  try {
    const { getCustomerList } = await import('@/api/customer/index.js')
    const res = await getCustomerList({
      p: currentPage.value,
      name: keyword
    })
    
    if (res && res.data) {
      const { list = [], total = 0 } = res.data
      // 过滤启用状态的客户
      const filteredList = list.filter(item => item.status === 0)
      return { list: filteredList, total }
    }
    return { list: [], total: 0 }
  } catch (error) {
    console.error('获取客户数据失败:', error)
    return { list: [], total: 0 }
  }
}

// 加载用户数据
const loadUserData = async (keyword = '') => {
  try {
    const { dictUserList } = await import('@/api/system/user.js')
    const res = await dictUserList()
    
    if (res && res.data) {
      let list = res.data.map(user => ({
        id: user.id,
        userName: user.userName,
        nickName: user.nickName || user.userName
      }))
      
      // 去重
      const uniqueUsers = []
      const userNameSet = new Set()
      list.forEach(user => {
        if (!userNameSet.has(user.userName)) {
          userNameSet.add(user.userName)
          uniqueUsers.push(user)
        }
      })
      
      // 前端搜索过滤
      if (keyword) {
        return {
          list: uniqueUsers.filter(item =>
            item.nickName.toLowerCase().includes(keyword.toLowerCase()) ||
            item.userName.toLowerCase().includes(keyword.toLowerCase())
          ),
          total: uniqueUsers.length
        }
      }
      
      return { list: uniqueUsers, total: uniqueUsers.length }
    }
    return { list: [], total: 0 }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return { list: [], total: 0 }
  }
}

// 加载品类数据
const loadCategoryData = async (keyword = '') => {
  try {
    // TODO: 替换为真实品类 API
    const mockData = [
      { id: 1, name: '电机' },
      { id: 2, name: '控制器' },
      { id: 3, name: '仪表' },
      { id: 4, name: '电池' },
      { id: 5, name: '充电器' }
    ]
    
    const filtered = keyword
      ? mockData.filter(item => item.name.toLowerCase().includes(keyword.toLowerCase()))
      : mockData
      
    return { list: filtered, total: filtered.length }
  } catch (error) {
    console.error('获取品类数据失败:', error)
    return { list: [], total: 0 }
  }
}

// 获取模拟数据
const getMockData = (keyword = '') => {
  return { list: [], total: 0 }
}

// 自动展开下拉框
const autoExpandDropdown = () => {
  nextTick(() => {
    setTimeout(() => {
      if (selectRef.value) {
        // 先加载数据
        if (options.value.length === 0) {
          loadData()
        }
        // 聚焦并展开下拉框
        selectRef.value.focus()
        // 手动触发展开
        if (selectRef.value.expanded !== undefined) {
          selectRef.value.expanded = true
        }
      }
    }, 50)
  })
}

// 初始化
onMounted(() => {
  if (props.dataSource) {
    options.value = props.dataSource
  }
  // 自动展开下拉框
  if (props.autoExpand) {
    autoExpandDropdown()
  }
})

// 暴露方法给父组件
defineExpose({
  focus: () => selectRef.value?.focus?.(),
  blur: () => selectRef.value?.blur?.(),
  reload: () => loadData()
})
</script>

<style scoped>
.load-more {
  text-align: center;
  color: #409eff;
  cursor: pointer;
  padding: 5px 0;
}

.load-more:hover {
  color: #66b1ff;
}
</style>

<style>
/* 确保下拉框在表格编辑时能正确显示 */
.typed-select-popper {
  z-index: 9999 !important;
}

/* 防止下拉框被表格单元格裁剪 */
.vxe-table .vxe-body--column.col--edit {
  overflow: visible !important;
}

.vxe-table .vxe-cell {
  overflow: visible !important;
}
</style>
