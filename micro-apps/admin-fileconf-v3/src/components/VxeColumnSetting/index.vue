<template>
  <el-popover
    v-model:visible="open"
    placement="bottom-end"
    trigger="click"
    :width="500"
    popper-class="vxe-column-setting__popover"
  >
    <template #reference>
      <el-button size="small">
        <el-icon><Setting /></el-icon>
        列设置
      </el-button>
    </template>

    <div class="panel" @click.stop>
      <div class="panel__header">
        <div class="panel__title">{{ title }}</div>
        <div class="panel__actions">
          <el-button link size="small" @click="expandAll">展开</el-button>
          <el-button link size="small" @click="collapseAll">折叠</el-button>
          <el-divider direction="vertical" />
          <el-button link size="small" @click="selectAll(true)">全选</el-button>
          <el-button link size="small" @click="selectAll(false)">全不选</el-button>
          <el-button link size="small" type="warning" @click="reset">重置</el-button>
          <el-button size="small" type="primary" @click="apply">应用</el-button>
        </div>
      </div>

      <!-- 顶层列表（分组和普通列混合） -->
      <div ref="listRef" class="list">
        <template v-for="col in editableColumns" :key="col.key">
          <!-- 分组列 -->
          <div v-if="col.children && col.children.length" class="group-item" :data-key="col.key">
            <div class="group-header" @click="toggleCollapse(col.key)">
              <span class="drag-handle" title="拖拽排序分组" @click.stop>☰</span>
              <span class="collapse-icon" :class="{ 'is-collapsed': collapsedGroups[col.key] }">▼</span>
              <el-checkbox
                :model-value="isGroupAllVisible(col)"
                :indeterminate="isGroupIndeterminate(col)"
                @click.stop
                @change="toggleGroupVisible(col, $event)"
              >{{ col.title }}</el-checkbox>
              <el-select 
                v-model="col.fixed" 
                size="small" 
                class="group-fixed-select" 
                placeholder="固定"
                @click.stop
                :teleported="false"
              >
                <el-option label="不固定" :value="null" />
                <el-option label="左固定" value="left" />
                <el-option label="右固定" value="right" />
              </el-select>
              <span class="group-badge">{{ col.children.filter(c => c.visible !== false).length }}/{{ col.children.length }}</span>
            </div>
            <!-- 分组内子列列表 -->
            <div 
              v-show="!collapsedGroups[col.key]"
              :ref="el => setChildListRef(col.key, el)" 
              class="group-children" 
              :data-parent="col.key"
            >
              <div
                v-for="child in col.children"
                :key="child.key"
                class="row row--child"
                :data-key="child.key"
                :data-parent="col.key"
              >
                <span class="drag-handle" title="拖拽排序">☰</span>
                <el-checkbox v-model="child.visible">{{ child.title }}</el-checkbox>
                <el-input-number
                  v-model="child.width"
                  size="small"
                  class="width-input"
                  :min="60"
                  :max="800"
                  :controls="false"
                />
              </div>
            </div>
          </div>
          <!-- 普通列 -->
          <div v-else class="row" :data-key="col.key" :class="{ 'is-locked': col.locked }">
            <span class="drag-handle" :class="{ disabled: col.locked }" title="拖拽排序">☰</span>
            <el-checkbox v-model="col.visible" :disabled="col.locked">{{ col.title }}</el-checkbox>
            <el-select v-model="col.fixed" size="small" class="fixed-select" :disabled="col.locked" :teleported="false">
              <el-option label="不固定" :value="null" />
              <el-option label="左固定" value="left" />
              <el-option label="右固定" value="right" />
            </el-select>
            <el-input-number
              v-model="col.width"
              size="small"
              class="width-input"
              :min="60"
              :max="800"
              :controls="false"
              :disabled="col.locked"
            />
          </div>
        </template>
      </div>
      <div class="panel__tip">支持分组/列拖拽排序、分组内子列排序（本地持久化）</div>
    </div>
  </el-popover>
</template>


<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import { Setting } from '@element-plus/icons-vue'
import {
  applyVxeColumnConfig,
  buildVxeColumnConfig,
  loadVxeColumnConfig,
  normalizeColumns,
  saveVxeColumnConfig
} from '@/utils/vxeColumnConfig'

const props = defineProps({
  columns: { type: Array, required: true },
  storageKey: { type: String, required: true },
  title: { type: String, default: '列设置' }
})

const emit = defineEmits(['update:columns'])

const open = ref(false)
const listRef = ref(null)
const localColumns = ref([])
const childListRefs = ref({})
const collapsedGroups = ref({}) // 折叠状态
let mainSortable = null
const childSortables = {}

const editableColumns = computed(() => localColumns.value.filter(c => c.key && !c.settingHidden))

function setChildListRef(key, el) {
  if (el) childListRefs.value[key] = el
}

function cloneColumns(cols) {
  return normalizeColumns(cols).map(c => {
    const cloned = { ...c }
    if (c.children && Array.isArray(c.children)) {
      cloned.children = c.children.map(child => ({ ...child }))
    }
    return cloned
  })
}

function isGroupAllVisible(group) {
  if (!group.children || !group.children.length) return true
  return group.children.every(c => c.visible !== false)
}

function isGroupIndeterminate(group) {
  if (!group.children || !group.children.length) return false
  const visibleCount = group.children.filter(c => c.visible !== false).length
  return visibleCount > 0 && visibleCount < group.children.length
}

function toggleGroupVisible(group, value) {
  if (!group.children) return
  group.children.forEach(child => { child.visible = value })
}

// 切换分组折叠状态
function toggleCollapse(key) {
  collapsedGroups.value[key] = !collapsedGroups.value[key]
}

// 全部展开/折叠
function expandAll() {
  editableColumns.value.forEach(col => {
    if (col.children && col.children.length) {
      collapsedGroups.value[col.key] = false
    }
  })
}

function collapseAll() {
  editableColumns.value.forEach(col => {
    if (col.children && col.children.length) {
      collapsedGroups.value[col.key] = true
    }
  })
}


function syncFromProps() {
  const saved = loadVxeColumnConfig(props.storageKey)
  localColumns.value = applyVxeColumnConfig(cloneColumns(props.columns), saved)
}

function selectAll(value) {
  localColumns.value = localColumns.value.map(col => {
    const updated = { ...col, visible: value }
    if (col.children && Array.isArray(col.children)) {
      updated.children = col.children.map(child => ({ ...child, visible: value }))
    }
    return updated
  })
}

function reset() {
  localColumns.value = cloneColumns(props.columns)
  const config = buildVxeColumnConfig(localColumns.value)
  saveVxeColumnConfig(props.storageKey, config)
  emit('update:columns', applyVxeColumnConfig(cloneColumns(props.columns), config))
}

function apply() {
  const config = buildVxeColumnConfig(localColumns.value)
  saveVxeColumnConfig(props.storageKey, config)
  emit('update:columns', applyVxeColumnConfig(cloneColumns(props.columns), config))
  open.value = false
}


// 初始化主列表排序（分组和普通列）
function initMainSortable() {
  if (!listRef.value) return
  mainSortable?.destroy()
  
  mainSortable = Sortable.create(listRef.value, {
    animation: 150,
    handle: '.group-header .drag-handle, .row:not(.row--child) > .drag-handle',
    draggable: '.group-item, .row:not(.row--child)',
    filter: '.is-locked',
    ghostClass: 'sortable-ghost',
    onEnd(evt) {
      if (evt.oldIndex === evt.newIndex) return
      const arr = [...localColumns.value]
      const [moved] = arr.splice(evt.oldIndex, 1)
      arr.splice(evt.newIndex, 0, moved)
      localColumns.value = arr
    }
  })
}

// 初始化分组内子列排序
function initChildSortables() {
  // 清理旧的
  Object.values(childSortables).forEach(s => s?.destroy())
  Object.keys(childSortables).forEach(k => delete childSortables[k])
  
  // 为每个分组创建 Sortable
  localColumns.value.forEach(col => {
    if (!col.children || !col.children.length) return
    const el = childListRefs.value[col.key]
    if (!el) return
    
    childSortables[col.key] = Sortable.create(el, {
      animation: 150,
      handle: '.drag-handle',
      draggable: '.row--child',
      group: 'children', // 允许跨分组拖拽
      ghostClass: 'sortable-ghost',
      onEnd(evt) {
        const fromParentKey = evt.from.dataset.parent
        const toParentKey = evt.to.dataset.parent
        const itemKey = evt.item.dataset.key
        
        if (fromParentKey === toParentKey) {
          // 同分组内排序
          const parent = localColumns.value.find(c => c.key === fromParentKey)
          if (parent && parent.children) {
            const arr = [...parent.children]
            const [moved] = arr.splice(evt.oldIndex, 1)
            arr.splice(evt.newIndex, 0, moved)
            parent.children = arr
          }
        } else {
          // 跨分组拖拽
          const fromParent = localColumns.value.find(c => c.key === fromParentKey)
          const toParent = localColumns.value.find(c => c.key === toParentKey)
          if (fromParent && toParent && fromParent.children && toParent.children) {
            const itemIndex = fromParent.children.findIndex(c => c.key === itemKey)
            if (itemIndex > -1) {
              const [moved] = fromParent.children.splice(itemIndex, 1)
              // 更新 headerClassName 为目标分组的
              if (toParent.headerClassName) {
                moved.headerClassName = toParent.headerClassName
              }
              toParent.children.splice(evt.newIndex, 0, moved)
            }
          }
        }
      }
    })
  })
}


watch(() => props.columns, () => { if (open.value) syncFromProps() }, { deep: true })

watch(open, async v => {
  if (!v) return
  syncFromProps()
  await nextTick()
  initMainSortable()
  await nextTick()
  initChildSortables()
})

onBeforeUnmount(() => {
  mainSortable?.destroy()
  Object.values(childSortables).forEach(s => s?.destroy())
})
</script>

<style scoped lang="scss">
.panel {
  padding: 8px 0;
}
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.panel__title {
  font-weight: 600;
}
.panel__actions :deep(.el-button + .el-button) {
  margin-left: 6px;
}
.list {
  max-height: 450px;
  overflow: auto;
  padding: 8px;
}
.group-item {
  margin-bottom: 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}
.group-header {
  display: grid;
  grid-template-columns: 20px 16px 1fr 80px 50px;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.collapse-icon {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s;
  &.is-collapsed {
    transform: rotate(-90deg);
  }
}
.group-badge {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
  text-align: right;
}
.group-fixed-select {
  width: 80px;
}
.group-children {
  padding: 0 8px 8px;
  min-height: 30px;
}
.row {
  display: grid;
  grid-template-columns: 20px 1fr 80px 80px;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--el-bg-color);
  margin-bottom: 2px;
}
.row--child {
  grid-template-columns: 20px 1fr 80px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
}
.row:hover, .row--child:hover {
  background: var(--el-fill-color-light);
}
.drag-handle {
  cursor: grab;
  color: var(--el-text-color-secondary);
  user-select: none;
}
.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.fixed-select {
  width: 80px;
}
.width-input {
  width: 80px;
}
.panel__tip {
  padding: 8px 10px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.sortable-ghost {
  opacity: 0.4;
  background: var(--el-color-primary-light-9) !important;
}
</style>