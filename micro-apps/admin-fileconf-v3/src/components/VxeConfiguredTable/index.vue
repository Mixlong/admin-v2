<template>
  <div class="vxe-configured-table" :class="{ 'is-toolbar-overlay': toolbarPlacement === 'table-top-right' }">
    <div class="toolbar">
      <div class="toolbar__left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar__right">
        <slot name="toolbar-right">
          <VxeColumnSetting :columns="baseColumns" :storage-key="storageKey" @update:columns="setColumns" />
        </slot>
      </div>
    </div>

    <vxe-table :key="tableKey" v-bind="$attrs" :data="data" :height="tableHeight" size="small" :header-cell-class-name="getHeaderCellClassName">
      <template v-for="col in visibleColumns" :key="col.key">
        <!-- 分组列（多级表头） -->
        <vxe-colgroup
          v-if="col.children && col.children.length"
          :title="col.title"
          :header-class-name="col.headerClassName"
          :fixed="col.fixed"
          header-align="center"
        >
          <vxe-column
            v-for="child in col.children"
            :key="child.key"
            v-bind="toVxeColumnProps(child, col.headerClassName)"
            header-align="center"
          >
            <template v-if="child.slot" #default="scope">
              <slot :name="child.slot" v-bind="scope" />
            </template>
          </vxe-column>
        </vxe-colgroup>
        <!-- 普通列 -->
        <vxe-column
          v-else
          v-bind="toVxeColumnProps(col)"
          header-align="center"
        >
          <template v-if="col.slot" #default="scope">
            <slot :name="col.slot" v-bind="scope" />
          </template>
        </vxe-column>
      </template>
    </vxe-table>

    <div v-if="showPagination && total > 0" class="pagination">
      <pagination
        v-model:page="pageParams.pageNum"
        v-model:limit="pageParams.pageSize"
        :total="total"
        @pagination="handlePagination"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import VxeColumnSetting from '@/components/VxeColumnSetting/index.vue'
import { applyVxeColumnConfig, loadVxeColumnConfig, normalizeColumns } from '@/utils/vxeColumnConfig'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  storageKey: {
    type: String,
    required: true
  },
  pageParams: {
    type: Object,
    default: () => ({ pageNum: 1, pageSize: 10 })
  },
  total: {
    type: Number,
    default: 0
  },
  showPagination: {
    type: Boolean,
    default: false
  },
  toolbarPlacement: {
    type: String,
    default: 'top' // 'top' | 'table-top-right'
  },
  // 高度偏移量，用于计算表格高度
  heightOffset: {
    type: Number,
    default: 270
  }
})

const emit = defineEmits(['pagination'])

// 响应式窗口高度
const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - props.heightOffset)
const baseColumns = computed(() => normalizeColumns(props.columns))
const configuredColumns = ref([])
const tableKey = ref(0)

function setColumns(cols) {
  configuredColumns.value = normalizeColumns(cols)
  tableKey.value += 1
}

function handlePagination() {
  emit('pagination', props.pageParams)
}

function init() {
  const saved = loadVxeColumnConfig(props.storageKey)
  configuredColumns.value = applyVxeColumnConfig(baseColumns.value, saved)
  tableKey.value += 1
}

watch(
  () => props.columns,
  () => init(),
  { deep: true, immediate: true }
)

const visibleColumns = computed(() =>
  configuredColumns.value.filter(col => col.visible !== false).map(col => {
    // 过滤掉隐藏的子列
    if (col.children && col.children.length) {
      return {
        ...col,
        children: col.children.filter(child => child.visible !== false)
      }
    }
    return col
  }).filter(col => {
    // 如果分组列的所有子列都被隐藏，则隐藏整个分组
    if (col.children && col.children.length === 0) return false
    return true
  })
)

function toVxeColumnProps(col, parentHeaderClassName) {
  const {
    key,
    slot,
    visible,
    locked,
    ...rest
  } = col
  // 子列继承父级的 headerClassName
  if (parentHeaderClassName && !rest.headerClassName) {
    rest.headerClassName = parentHeaderClassName
  }
  return rest
}

// 表头单元格样式（用于动态设置）
function getHeaderCellClassName({ column }) {
  return column?.headerClassName || ''
}
</script>

<style scoped lang="scss">
.vxe-configured-table {
  position: relative;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.is-toolbar-overlay {
  .toolbar {
    position: absolute;
    right: -10px;
    top:-10px;
    z-index: 50;
    margin-bottom: 0;
    pointer-events: none;
  }

  .toolbar__right {
    pointer-events: auto;
  }

  .toolbar__left {
    display: none;
  }

  :deep(.vxe-table) {
    padding-top: 0;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}
</style>
