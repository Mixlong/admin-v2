<template>
  <teleport to="body">
    <div v-if="open" class="column-config-mask" @click.self="close">
      <div class="column-config-panel">
        <!-- 头部 -->
        <div class="panel-header">
          <div class="header-title">列配置</div>
          <div class="header-actions">
            <button class="action-btn" @click="selectAll(true)">全选</button>
            <button class="action-btn" @click="selectAll(false)">全不选</button>
            <button class="action-btn primary" @click="apply">应用</button>
          </div>
        </div>

        <!-- 配置方案管理 -->
        <div class="scheme-manager">
          <el-form :inline="true" size="small">
            <el-form-item label="配置方案">
              <el-select
                v-model="currentScheme"
                placeholder="请选择"
                style="width: 200px"
                clearable
                size="small"
                :teleported="false"
                :popper-class="'column-config-select-dropdown'"
                @change="loadScheme"
              >
                <el-option :key="'default'" label="默认配置" value=""></el-option>
                <el-option
                  v-for="(scheme, key) in savedSchemes"
                  :key="key"
                  :label="scheme.name"
                  :value="key"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                size="small"
                :icon="FolderAdd"
                title="保存当前配置为新方案"
                @click="showSaveDialog = true"
              >
                另存为
              </el-button>
              <el-button
                v-if="currentScheme"
                size="small"
                type="danger"
                :icon="DeleteIcon"
                title="删除当前方案"
                @click="deleteScheme"
              >
                删除
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 列列表（分层显示，支持分组拖拽） -->
        <div ref="listRef" class="column-list">
          <!-- 序号列提示（固定不可配置） -->
          <div class="column-row seq-row">
            <span class="drag-handle disabled" title="序号列固定在第一位">☰</span>
            <input type="checkbox" checked disabled class="column-checkbox" />
            <span class="column-label">序号</span>
            <select disabled class="fixed-select">
              <option value="left">左固定</option>
            </select>
            <input type="number" value="60" disabled class="width-input" />
          </div>

          <!-- 分组和列（分层显示） -->
          <template v-for="item in groupedItems" :key="item.key">
            <!-- 分组标题（可拖拽） -->
            <div
              v-if="item.isGroup"
              class="group-header draggable-group"
              :data-group="item.groupName"
            >
              <span class="drag-handle group-drag" title="拖拽整个分组">☰</span>
              <span class="group-icon">📁</span>
              <span class="group-label">{{ item.groupName }}</span>
              <span class="group-count">({{ item.columns.length }}列)</span>
              <span class="toggle-icon" @click="toggleGroup(item.groupName)">
                {{ item.collapsed ? '▶' : '▼' }}
              </span>
            </div>

            <!-- 分组内的列 -->
            <div v-if="item.isGroup && !item.collapsed" class="group-children">
              <div
                v-for="col in item.columns"
                :key="col.field"
                class="column-row group-child"
                :class="{
                  'is-fixed-left': col.fixed === 'left',
                  'is-fixed-right': col.fixed === 'right'
                }"
              >
                <span class="drag-handle disabled" title="分组内不可单独拖拽">☰</span>
                <input v-model="col.visible" type="checkbox" class="column-checkbox" />
                <span class="column-label indent">{{ col.title }}</span>
                <select v-model="col.fixed" class="fixed-select">
                  <option :value="null">不固定</option>
                  <option value="left">左固定</option>
                  <option value="right">右固定</option>
                </select>
                <input
                  v-model.number="col.width"
                  type="number"
                  class="width-input"
                  min="60"
                  max="500"
                />
              </div>
            </div>

            <!-- 独立列（非分组） -->
            <div
              v-else-if="!item.isGroup"
              class="column-row draggable-column"
              :class="{
                'is-fixed-left': item.column.fixed === 'left',
                'is-fixed-right': item.column.fixed === 'right'
              }"
              :data-field="item.column.field"
            >
              <span class="drag-handle" title="拖拽排序">☰</span>
              <input v-model="item.column.visible" type="checkbox" class="column-checkbox" />
              <span class="column-label">{{ item.column.title }}</span>
              <select v-model="item.column.fixed" class="fixed-select">
                <option :value="null">不固定</option>
                <option value="left">左固定</option>
                <option value="right">右固定</option>
              </select>
              <input
                v-model.number="item.column.width"
                type="number"
                class="width-input"
                min="60"
                max="500"
              />
            </div>
          </template>
        </div>

        <!-- 底部提示 -->
        <div class="panel-footer">
          <small>💡 序号列固定在第一位，其他列可拖拽调顺序、控制显隐、设置固定和宽度</small>
        </div>
      </div>
    </div>

    <!-- 保存方案对话框 -->
    <div v-if="showSaveDialog" class="save-dialog-mask" @click.self="showSaveDialog = false">
      <div class="save-dialog">
        <div class="dialog-header">
          <h3>保存配置方案</h3>
          <button class="close-btn" @click="showSaveDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <label>方案名称：</label>
          <input
            v-model="newSchemeName"
            type="text"
            placeholder="请输入方案名称"
            class="scheme-name-input"
            @keyup.enter="saveScheme"
          />
        </div>
        <div class="dialog-footer">
          <button class="action-btn" @click="showSaveDialog = false">取消</button>
          <button class="action-btn primary" @click="saveScheme">保存</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue'
import Sortable from 'sortablejs'
import { FolderAdd, Delete as DeleteIcon } from '@element-plus/icons-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  },
  storageKey: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:open', 'update:columns'])

const listRef = ref(null)
const localCols = ref([])
const collapsedGroups = ref(new Set()) // 折叠的分组

// 配置方案管理
const savedSchemes = ref({}) // 已保存的方案
const currentScheme = ref('') // 当前选中的方案
const showSaveDialog = ref(false) // 显示保存对话框
const newSchemeName = ref('') // 新方案名称

// 从 localStorage 加载已保存的方案
function loadSavedSchemes() {
  const key = `${props.storageKey}-schemes`
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      savedSchemes.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载配置方案失败:', e)
      savedSchemes.value = {}
    }
  }

  // 加载上次选择的方案
  const lastSchemeKey = `${props.storageKey}-current-scheme`
  const lastScheme = localStorage.getItem(lastSchemeKey)
  if (lastScheme && savedSchemes.value[lastScheme]) {
    currentScheme.value = lastScheme
    console.log('📋 恢复上次选择的方案:', savedSchemes.value[lastScheme].name)
  }
}

// 保存方案到 localStorage
function saveSchemesToStorage() {
  const key = `${props.storageKey}-schemes`
  localStorage.setItem(key, JSON.stringify(savedSchemes.value))
}

// 保存当前配置为方案
function saveScheme() {
  if (!newSchemeName.value.trim()) {
    alert('请输入方案名称')
    return
  }

  const schemeKey = `scheme_${Date.now()}`
  savedSchemes.value[schemeKey] = {
    name: newSchemeName.value.trim(),
    columns: JSON.parse(JSON.stringify(localCols.value)),
    createdAt: new Date().toISOString()
  }

  saveSchemesToStorage()
  currentScheme.value = schemeKey

  // 保存当前选择的方案
  const lastSchemeKey = `${props.storageKey}-current-scheme`
  localStorage.setItem(lastSchemeKey, schemeKey)

  showSaveDialog.value = false
  newSchemeName.value = ''

  console.log('✅ 配置方案已保存:', savedSchemes.value[schemeKey].name)
}

// 加载指定方案
function loadScheme() {
  // 保存当前选择的方案到 localStorage
  const lastSchemeKey = `${props.storageKey}-current-scheme`
  if (currentScheme.value) {
    localStorage.setItem(lastSchemeKey, currentScheme.value)
  } else {
    localStorage.removeItem(lastSchemeKey)
  }

  if (!currentScheme.value) {
    // 加载默认配置
    localCols.value = JSON.parse(JSON.stringify(props.columns)).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    )
    console.log('📋 已加载默认配置')
    return
  }

  const scheme = savedSchemes.value[currentScheme.value]
  if (scheme) {
    localCols.value = JSON.parse(JSON.stringify(scheme.columns))
    console.log('📋 已加载方案:', scheme.name)
  }
}

// 删除当前方案
function deleteScheme() {
  if (!currentScheme.value) return

  const scheme = savedSchemes.value[currentScheme.value]
  if (confirm(`确定要删除方案"${scheme.name}"吗？`)) {
    delete savedSchemes.value[currentScheme.value]
    saveSchemesToStorage()

    // 清除当前选择的方案记录
    const lastSchemeKey = `${props.storageKey}-current-scheme`
    localStorage.removeItem(lastSchemeKey)

    currentScheme.value = ''
    loadScheme() // 加载默认配置
    console.log('🗑️ 方案已删除')
  }
}

// 计算分组后的列结构（用于显示）
const groupedItems = computed(() => {
  const result = []
  const groupMap = new Map()

  // 按 order 排序
  const sortedCols = [...localCols.value].sort((a, b) => (a.order || 0) - (b.order || 0))

  sortedCols.forEach(col => {
    if (col.group) {
      // 分组列
      if (!groupMap.has(col.group)) {
        const groupItem = {
          key: `group-${col.group}`,
          isGroup: true,
          groupName: col.group,
          columns: [],
          collapsed: collapsedGroups.value.has(col.group)
        }
        groupMap.set(col.group, groupItem)
        result.push(groupItem)
      }
      groupMap.get(col.group).columns.push(col)
    } else {
      // 独立列
      result.push({
        key: `col-${col.field}`,
        isGroup: false,
        column: col
      })
    }
  })

  return result
})

// 切换分组折叠状态
function toggleGroup(groupName) {
  if (collapsedGroups.value.has(groupName)) {
    collapsedGroups.value.delete(groupName)
  } else {
    collapsedGroups.value.add(groupName)
  }
  // 触发响应式更新
  collapsedGroups.value = new Set(collapsedGroups.value)
}

// 打开弹层时，复制一份 columns 作为本地编辑数据
watch(
  () => props.open,
  async v => {
    if (v) {
      // 加载已保存的方案
      loadSavedSchemes()

      // 使用 JSON 深拷贝，避免 structuredClone 无法克隆响应式对象
      localCols.value = JSON.parse(JSON.stringify(props.columns)).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      )
      await nextTick()
      initDrag()
    }
  }
)

// 组件挂载时加载方案
onMounted(() => {
  loadSavedSchemes()
})

let sortable = null

function initDrag() {
  if (!listRef.value) return
  sortable?.destroy()

  sortable = Sortable.create(listRef.value, {
    handle: '.drag-handle:not(.disabled)',
    filter: '.seq-row, .group-children', // 排除序号行和分组子列容器
    animation: 150,
    onEnd(evt) {
      const movedElement = evt.item
      const isGroup = movedElement.classList.contains('draggable-group')

      console.log('🎯 拖拽:', isGroup ? '分组' : '独立列')

      if (isGroup) {
        // 拖拽的是分组
        const groupName = movedElement.dataset.group
        handleGroupDrag(groupName, evt.oldIndex, evt.newIndex)
      } else {
        // 拖拽的是独立列
        const field = movedElement.dataset.field
        handleColumnDrag(field, evt.oldIndex, evt.newIndex)
      }
    }
  })
}

// 处理分组拖拽
function handleGroupDrag(groupName, oldDomIndex, newDomIndex) {
  console.log(`📦 拖拽分组: ${groupName}`)

  // 找出该分组的所有列
  const groupCols = localCols.value.filter(c => c.group === groupName)
  const otherCols = localCols.value.filter(c => c.group !== groupName)

  // 计算新的插入位置（基于 DOM 顺序）
  const items = groupedItems.value
  let insertOrder = 0

  // 找到新位置对应的 order 值
  for (let i = 0; i < items.length; i++) {
    if (i === newDomIndex - 1) {
      // -1 因为序号行
      break
    }
    if (items[i].isGroup) {
      insertOrder += items[i].columns.length
    } else {
      insertOrder += 1
    }
  }

  // 重新组合列数组
  const newCols = []
  let currentOrder = 1

  otherCols.forEach(col => {
    if (currentOrder === insertOrder + 1) {
      // 在这里插入分组列
      groupCols.forEach(gc => {
        gc.order = currentOrder++
        newCols.push(gc)
      })
    }
    col.order = currentOrder++
    newCols.push(col)
  })

  // 如果插入位置在最后
  if (newCols.length < localCols.value.length) {
    groupCols.forEach(gc => {
      gc.order = currentOrder++
      newCols.push(gc)
    })
  }

  localCols.value = newCols
  console.log('✅ 分组拖拽完成')
}

// 处理独立列拖拽
function handleColumnDrag(field, oldDomIndex, newDomIndex) {
  console.log(`📄 拖拽列: ${field}`)

  // 计算实际的列索引
  const col = localCols.value.find(c => c.field === field)
  if (!col) return

  // 简化处理：直接根据 DOM 顺序重新排列
  const items = groupedItems.value
  const newOrder = []

  items.forEach(item => {
    if (item.isGroup) {
      item.columns.forEach(c => newOrder.push(c.field))
    } else {
      newOrder.push(item.column.field)
    }
  })

  // 根据新顺序重新排列
  const colMap = new Map(localCols.value.map(c => [c.field, c]))
  localCols.value = newOrder.map(field => colMap.get(field)).filter(Boolean)

  // 更新 order
  localCols.value.forEach((c, idx) => {
    c.order = idx + 1
  })

  console.log('✅ 列拖拽完成')
}

function close() {
  emit('update:open', false)
}

function selectAll(v) {
  localCols.value.forEach(c => (c.visible = v))
}

function apply() {
  // 使用 JSON 深拷贝，避免 structuredClone 无法克隆响应式对象
  const cols = JSON.parse(JSON.stringify(localCols.value)).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )

  console.log('✅ 应用列配置:')
  cols.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.title} (order: ${c.order}, visible: ${c.visible})`)
  })

  // 如果当前选择了某个方案，自动更新该方案
  if (currentScheme.value && savedSchemes.value[currentScheme.value]) {
    savedSchemes.value[currentScheme.value].columns = JSON.parse(JSON.stringify(localCols.value))
    savedSchemes.value[currentScheme.value].updatedAt = new Date().toISOString()
    saveSchemesToStorage()
    console.log('💾 已自动更新方案:', savedSchemes.value[currentScheme.value].name)
  }

  emit('update:columns', cols)

  // 保存时包含版本信息
  const data = props.version
    ? {
        _version: props.version,
        _timestamp: Date.now(),
        columns: cols
      }
    : cols
  localStorage.setItem(props.storageKey, JSON.stringify(data))
  close()
}

onMounted(() => {
  if (props.open) initDrag()
})
</script>

<style scoped lang="scss">
.column-config-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.column-config-panel {
  width: 720px;
  max-height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden; // 保持圆角不被内部内容盖住
}

.panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-title {
    font-weight: 600;
    font-size: 16px;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;

  &:hover {
    background: #f5f7fa;
    border-color: #c0c4cc;
  }

  &.primary {
    background: #409eff;
    color: #fff;
    border-color: #409eff;

    &:hover {
      background: #66b1ff;
      border-color: #66b1ff;
    }
  }

  &.small {
    padding: 4px 10px;
    font-size: 12px;
  }

  &.danger {
    background: #f56c6c;
    color: #fff;
    border-color: #f56c6c;

    &:hover {
      background: #f78989;
      border-color: #f78989;
    }
  }
}

// 配置方案管理样式
.scheme-manager {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  z-index: 10;
}

// 全局样式：确保下拉框在最上层
::v-deep .column-config-select-dropdown {
  z-index: 10001 !important;
}

.column-list {
  padding: 8px 12px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  max-height: calc(80vh - 200px);
}

// 分组标题样式
.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  margin-top: 12px;
  background: linear-gradient(135deg, #eef1f6 0%, #d9ddea 100%);
  color: #303133;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: move;

  .group-icon {
    font-size: 16px;
    color: #606266;
  }

  .group-label {
    flex: 1;
  }

  .group-count {
    font-size: 12px;
    opacity: 0.75;
  }

  .toggle-icon {
    cursor: pointer;
    padding: 0 4px;
    user-select: none;
    color: #606266;

    &:hover {
      opacity: 0.9;
    }
  }

  .drag-handle.group-drag {
    cursor: move;
    color: #606266;
    opacity: 0.75;

    &:hover {
      opacity: 1;
    }
  }
}

// 分组子列容器
.group-children {
  padding-left: 20px;
  border-left: 2px solid #e0e0e0;
  margin-left: 10px;
  margin-bottom: 8px;
}

.column-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-bottom: 1px dashed #f0f0f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.group-child {
    background-color: #fafafa;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  &.is-fixed-left {
    background-color: #f0f7ff;
    border-left: 3px solid #c8ddff;
  }

  &.is-fixed-right {
    background-color: #fff9f0;
    border-right: 3px solid #f3d9a6;
  }

  // 序号列样式（禁用状态）
  &.seq-row {
    background-color: #f5f7fa;
    border-left: 3px solid #67c23a;
    opacity: 0.8;

    .drag-handle.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    input:disabled,
    select:disabled {
      cursor: not-allowed;
      background-color: #f5f7fa;
      color: #909399;
    }
  }
}

.drag-handle {
  cursor: grab;
  user-select: none;
  opacity: 0.6;
  font-size: 16px;
  color: #909399;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    color: #409eff;
  }

  &:active {
    cursor: grabbing;
  }
}

.column-checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.column-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
  user-select: none;

  &.indent {
    padding-left: 8px;
    position: relative;

    &::before {
      content: '└';
      position: absolute;
      left: -8px;
      color: #c0c4cc;
    }
  }
}

.fixed-select {
  width: 90px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus {
    outline: none;
    border-color: #409eff;
  }
}

.width-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  transition: border-color 0.2s;

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus {
    outline: none;
    border-color: #409eff;
  }

  /* 隐藏数字输入框的上下箭头 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  text-align: center;

  small {
    color: #909399;
    font-size: 12px;
  }
}

// 保存方案对话框样式
.save-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.save-dialog {
  background: #fff;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #909399;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      line-height: 1;

      &:hover {
        color: #606266;
      }
    }
  }

  .dialog-body {
    padding: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }

    .scheme-name-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #409eff;
      }
    }
  }

  .dialog-footer {
    padding: 12px 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
