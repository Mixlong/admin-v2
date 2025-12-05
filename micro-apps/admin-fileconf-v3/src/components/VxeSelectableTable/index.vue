<template>
  <div class="vxe-selectable-table" ref="containerRef" @mousedown="handleMouseDown">
    <!-- 选区框 -->
    <div 
      v-show="selectionBox.visible" 
      class="selection-box"
      :style="selectionBoxStyle"
    ></div>
    
    <vxe-grid
      ref="gridRef"
      v-bind="$attrs"
      :menu-config="menuConfig"
      @cell-click="handleCellClick"
      @edit-actived="handleEditActived"
      @edit-closed="handleEditClosed"
      @menu-click="handleMenuClick"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </vxe-grid>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  selectable: {
    type: Boolean,
    default: true
  },
  menuConfig: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['selection-change', 'cell-change', 'menu-click'])

const containerRef = ref()
const gridRef = ref()

// 选中的单元格 Set<"cleanRowId||field"> 按行+字段去重，避免固定列/滚动重复
const selectedCells = ref(new Set())
// 当前指针位置（用于精确定位终点单元格）
const currentPointer = reactive({ x: 0, y: 0 })

// 根据 DOM 的 colId 获取字段并生成唯一 key
const buildCellKey = (rowId, colId) => {
  const $grid = gridRef.value
  if (!$grid || !rowId || !colId) return null
  const column = $grid.getColumnById(colId)
  const field = column?.field
  if (!field) return null
  
  // 需要转换 rowId 为索引格式以保持一致性
  const { visibleData } = $grid.getTableData()
  const rowIndex = visibleData.findIndex(r => {
    const key = r._X_ROW_KEY ?? r.id
    return String(key) === String(rowId)
  })
  
  if (rowIndex >= 0) {
    return `row_${rowIndex}||${field}`
  }
  
  // 如果找不到，直接使用 rowId
  return `${rowId}||${field}`
}

// 复制的数据（包含字段和值的映射）
const copiedData = ref([])

// 复制的整行数据（支持多行）
const copiedRows = ref([])

// 默认右键菜单配置
const defaultMenuConfig = {
  body: {
    options: [
      [
        { code: 'copy', name: '复制单元格', prefixIcon: 'vxe-icon-copy' },
        { code: 'paste', name: '粘贴单元格', prefixIcon: 'vxe-icon-paste' },
        // { code: 'clear', name: '清空选区', prefixIcon: 'vxe-icon-delete' }
      ],
      [
        { code: 'addSelectedAsNew', name: '选中新增', prefixIcon: 'vxe-icon-add' },
        { code: 'insertRow', name: '插入空行', prefixIcon: 'vxe-icon-add' }
      ],
      [
        { code: 'deleteRows', name: '删除行', prefixIcon: 'vxe-icon-remove' }
      ],
      [
        { code: 'exportData', name: '导出数据', prefixIcon: 'vxe-icon-download' }
      ]
    ]
  }
}

// 合并菜单配置
const menuConfig = computed(() => {
  if (props.menuConfig) {
    // 如果传入了自定义菜单配置，将自定义选项放在最前面
    const customOptions = props.menuConfig.body?.options || []
    const defaultOptions = defaultMenuConfig.body.options
    
    console.log('🔧 合并菜单配置:', {
      customOptions,
      defaultOptions,
      merged: [...customOptions, ...defaultOptions]
    })
    
    return {
      body: {
        options: [...customOptions, ...defaultOptions]
      }
    }
  }
  return defaultMenuConfig
})

// 选区框状态
const selectionBox = reactive({
  visible: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
})

// 是否正在框选
const isSelecting = ref(false)

// 起始单元格
const startCell = reactive({
  rowId: '',
  colId: ''
})

// 选区框样式
const selectionBoxStyle = computed(() => {
  const left = Math.min(selectionBox.startX, selectionBox.endX)
  const top = Math.min(selectionBox.startY, selectionBox.endY)
  const width = Math.abs(selectionBox.endX - selectionBox.startX)
  const height = Math.abs(selectionBox.endY - selectionBox.startY)
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

// 获取单元格信息
const getCellInfo = (target) => {
  let cell = target
  while (cell && !cell.classList?.contains('vxe-body--column')) {
    cell = cell.parentElement
  }
  if (!cell) return null
  
  const colId = cell.getAttribute('colid')
  const row = cell.closest('tr')
  const rowId = row?.getAttribute('rowid')
  
  return { cell, colId, rowId }
}

// 鼠标按下
const handleMouseDown = (e) => {
  if (!props.selectable) return
  if (e.button !== 0) return // 只处理左键
  currentPointer.x = e.clientX
  currentPointer.y = e.clientY
  
  const cellInfo = getCellInfo(e.target)
  if (!cellInfo) return
  
  const container = containerRef.value
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  
  isSelecting.value = true
  startCell.rowId = cellInfo.rowId
  startCell.colId = cellInfo.colId
  
  selectionBox.startX = e.clientX - rect.left
  selectionBox.startY = e.clientY - rect.top
  selectionBox.endX = selectionBox.startX
  selectionBox.endY = selectionBox.startY
  selectionBox.visible = true
  
  // 如果没有按住 Ctrl/Cmd，清空之前的选择
  if (!e.ctrlKey && !e.metaKey) {
    clearSelection()
  }
  
  const cellKey = `${cellInfo.rowId}-${cellInfo.colId}`
  if (cellKey) {
    selectedCells.value.add(cellKey)
    cellInfo.cell.classList.add('cell-selected')
  }
  
  e.preventDefault()
}

// 鼠标移动
const handleMouseMove = (e) => {
  if (!isSelecting.value) return
  
  currentPointer.x = e.clientX
  currentPointer.y = e.clientY
  
  const container = containerRef.value
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  selectionBox.endX = e.clientX - rect.left
  selectionBox.endY = e.clientY - rect.top
  
  // 更新选中的单元格
  updateSelectedCells()
}

// 鼠标松开
const handleMouseUp = (e) => {
  if (!isSelecting.value) return
  
  currentPointer.x = e.clientX
  currentPointer.y = e.clientY
  // 先在正在选择状态下更新一次最终选区
  updateSelectedCells()
  
  isSelecting.value = false
  selectionBox.visible = false
  
  emitSelectionChange()
}

// 更新选中的单元格
const updateSelectedCells = () => {
  const container = containerRef.value
  const $grid = gridRef.value
  if (!container) return
  if (!$grid) return
  
  // 拖拽过程中清空旧选中，避免残留叠加
  if (isSelecting.value) {
    container.querySelectorAll('.cell-selected').forEach(cell => cell.classList.remove('cell-selected'))
    selectedCells.value.clear()
  }
  
  const containerRect = container.getBoundingClientRect()
  
  // 计算选区的绝对位置（相对容器视口）
  const selLeft = Math.min(selectionBox.startX, selectionBox.endX)
  const selTop = Math.min(selectionBox.startY, selectionBox.endY)
  const selRight = Math.max(selectionBox.startX, selectionBox.endX)
  const selBottom = Math.max(selectionBox.startY, selectionBox.endY)
  
  // 辅助：叶子列列表
  const flattenColumns = (cols, acc = []) => {
    cols.forEach(c => {
      if (c.children && c.children.length) {
        flattenColumns(c.children, acc)
      } else {
        acc.push(c)
      }
    })
    return acc
  }
  const leafColumns = flattenColumns($grid.getColumns ? $grid.getColumns() : [])
  
  // 辅助：通过 rowId 查找可见数据中的索引
  const findRowIndex = (rid) => {
    if (!rid) return -1
    const clean = String(rid).replace(/^row_/, '')
    return $grid.getTableData().visibleData.findIndex(r => {
      const key = r._X_ROW_KEY !== undefined ? String(r._X_ROW_KEY) : null
      const id = r.id !== undefined ? String(r.id) : null
      return key === clean || key === String(rid) || id === clean || id === String(rid)
    })
  }
  
  // 当前指针下的终点单元格
  const endEl = document.elementFromPoint(currentPointer.x, currentPointer.y)
  const endCellInfo = getCellInfo(endEl)
  
  const startRowIndex = findRowIndex(startCell.rowId)
  const startColIndex = leafColumns.findIndex(c => c.id === startCell.colId)
  if (startRowIndex < 0 || startColIndex < 0) return
  const endRowIndex = endCellInfo ? findRowIndex(endCellInfo.rowId) : startRowIndex
  const endColIndex = endCellInfo ? leafColumns.findIndex(c => c.id === endCellInfo.colId) : startColIndex
  
  const rowStart = Math.max(0, Math.min(startRowIndex, endRowIndex))
  const rowEnd = Math.max(startRowIndex, endRowIndex)
  const colStart = Math.max(0, Math.min(startColIndex, endColIndex))
  const colEnd = Math.max(startColIndex, endColIndex)
  
  // 清空旧选中 DOM
  container.querySelectorAll('.cell-selected').forEach(cell => cell.classList.remove('cell-selected'))
  selectedCells.value.clear()
  
  const visibleData = $grid.getTableData().visibleData
  
  for (let ri = rowStart; ri <= rowEnd; ri++) {
    const row = visibleData[ri]
    if (!row) continue
    
    // 使用索引作为 rowKey 的主键，确保一致性
    const rowKey = `row_${ri}`
    
    for (let ci = colStart; ci <= colEnd; ci++) {
      const col = leafColumns[ci]
      if (!col || !col.field) continue
      const cellKey = `${rowKey}||${col.field}`
      selectedCells.value.add(cellKey)
      
      // 高亮 DOM（使用实际的 rowid 属性）
      const domRowId = row._X_ROW_KEY ?? row.id
      const domCell = container.querySelector(`tr[rowid="${domRowId}"] td[colid="${col.id}"]`)
      if (domCell) domCell.classList.add('cell-selected')
    }
  }
}

// 编辑开始时的原始值
const editingOriginalValue = ref(null)

// 编辑激活事件 - 保存原始值并禁用键盘监听
const handleEditActived = ({ row, column }) => {
  if (!row || !column || !column.field) return
  editingOriginalValue.value = row[column.field]
  
  // 进入编辑状态时，禁用全局复制粘贴键盘监听
  keyboardEnabled.value = false
}

// 编辑关闭事件 - 比较值是否改变，只有改变了才标记，并恢复键盘监听
const handleEditClosed = ({ row, column }) => {
  if (!row || !column || !column.field) return
  
  const field = column.field
  
  // 退出编辑状态时，恢复全局复制粘贴键盘监听
  keyboardEnabled.value = true
  const newValue = row[field]
  const oldValue = editingOriginalValue.value
  
  // 比较新旧值，只有真正改变了才标记
  if (newValue !== oldValue) {
    // 只有非新增行才标记为编辑过
    if (row._isNew !== true) {
      if (!row._editedFields) row._editedFields = {}
      row._editedFields[field] = true
    }
  }
  
  editingOriginalValue.value = null
}

// 单元格点击
const handleCellClick = ({ row, column, $event }) => {
  if (!props.selectable) return
  
  // 如果是框选结束，不处理点击
  if (selectionBox.visible) return
  
  const cellInfo = getCellInfo($event.target)
  if (!cellInfo) return
  
  // 如果没有按住 Ctrl/Cmd，清空之前的选择
  if (!$event.ctrlKey && !$event.metaKey && !$event.shiftKey) {
    clearSelection()
  }
  
  const cellKey = buildCellKey(cellInfo.rowId, cellInfo.colId)
  if (!cellKey) return
  
  // 切换选中状态（按行+字段去重）
  if (selectedCells.value.has(cellKey)) {
    selectedCells.value.delete(cellKey)
    cellInfo.cell.classList.remove('cell-selected')
  } else {
    selectedCells.value.add(cellKey)
    cellInfo.cell.classList.add('cell-selected')
  }
  
  emitSelectionChange()
}

// 清除选择
const clearSelection = () => {
  const container = containerRef.value
  if (container) {
    container.querySelectorAll('.cell-selected').forEach(cell => {
      cell.classList.remove('cell-selected')
    })
  }
  selectedCells.value.clear()
}

// 触发选择变化事件
const emitSelectionChange = () => {
  const deduped = getSelectedData()
  emit('selection-change', {
    cells: deduped,
    count: deduped.length
  })
}

// 获取选中的数据
const getSelectedData = () => {
  const $grid = gridRef.value
  if (!$grid) return []
  
  const { visibleData } = $grid.getTableData()
  const result = []
  const uniqueCellMap = new Set()
  
  console.log('selectedCells:', Array.from(selectedCells.value))
  console.log('visibleData:', visibleData)
  
  selectedCells.value.forEach(cellKey => {
    const [rowIdPart, field] = cellKey.split('||')
    if (!field) return
    
    // 尝试多种方式匹配行
    let row = null
    
    // 1. 先尝试按 _X_ROW_KEY 或 id 匹配
    row = visibleData.find(r => {
      if (r._X_ROW_KEY !== undefined && String(r._X_ROW_KEY) === String(rowIdPart)) return true
      if (r.id !== undefined && String(r.id) === String(rowIdPart)) return true
      return false
    })
    
    // 2. 如果没找到，尝试按索引匹配（如 row_0, row_1）
    if (!row && rowIdPart.startsWith('row_')) {
      const index = parseInt(rowIdPart.replace('row_', ''))
      if (!isNaN(index) && index >= 0 && index < visibleData.length) {
        row = visibleData[index]
      }
    }
    
    // 3. 如果还没找到，尝试直接按数字索引匹配
    if (!row) {
      const index = parseInt(rowIdPart)
      if (!isNaN(index) && index >= 0 && index < visibleData.length) {
        row = visibleData[index]
      }
    }
    
    const column = $grid.getColumnByField(field)
    
    console.log('查找行:', { 
      rowId: rowIdPart, 
      field, 
      foundRow: !!row, 
      foundColumn: !!column,
      rowData: row ? { id: row.id, _X_ROW_KEY: row._X_ROW_KEY } : null
    })
    
    if (row && column) {
      const normalizedRowId = String(row._X_ROW_KEY ?? row.id ?? rowIdPart)
      const uniqueKey = `${normalizedRowId}-${field}`
      if (uniqueCellMap.has(uniqueKey)) return
      uniqueCellMap.add(uniqueKey)
      
      result.push({
        rowId: normalizedRowId,
        field,
        value: row[field],
        row,
        column
      })
    }
  })
  
  return result
}

// Ctrl+C 复制
const handleCopy = () => {
  const selectedData = getSelectedData()
  if (selectedData.length === 0) {
    console.log('没有选中的单元格')
    return
  }
  
  console.log('📋 开始复制，选中单元格数:', selectedData.length)
  
  // 按行分组（使用对象保持插入顺序）
  const rowMap = new Map()
  selectedData.forEach(item => {
    if (!rowMap.has(item.rowId)) {
      rowMap.set(item.rowId, [])
    }
    rowMap.get(item.rowId).push({
      field: item.field,
      value: item.value,
      column: item.column
    })
  })
  
  // 保存内部复制数据
  copiedData.value = Array.from(rowMap.values())
  
  // 生成可粘贴到 Excel 的文本（tab 分隔列，换行分隔行）
  const $grid = gridRef.value
  const allColumns = $grid ? ($grid.getColumns ? $grid.getColumns() : []) : []
  const flattenColumns = (cols, acc = []) => {
    cols.forEach(c => {
      if (c.children && c.children.length) flattenColumns(c.children, acc)
      else acc.push(c)
    })
    return acc
  }
  const leafColumns = flattenColumns(allColumns)
  
  // 按行分组后，按列顺序排序
  const textLines = []
  rowMap.forEach((cells, rowId) => {
    // 按列的顺序排序单元格
    const sortedCells = cells.sort((a, b) => {
      const aIndex = leafColumns.findIndex(col => col.field === a.field)
      const bIndex = leafColumns.findIndex(col => col.field === b.field)
      return aIndex - bIndex
    })
    // 生成 tab 分隔的文本
    const values = sortedCells.map(c => {
      const val = c.value
      // 处理换行和 tab，避免破坏格式
      if (val === null || val === undefined) return ''
      return String(val).replace(/\t/g, ' ').replace(/\n/g, ' ')
    }).join('\t')
    textLines.push(values)
  })
  const text = textLines.join('\n')
  
  console.log('📋 复制文本:', text)
  console.log('📋 复制行数:', textLines.length, '每行列数:', copiedData.value[0]?.length)
  
  // 复制到系统剪贴板
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ 已复制到系统剪贴板（Clipboard API）')
    }).catch((err) => {
      console.warn('⚠️ Clipboard API 失败，使用降级方案:', err.message || err)
      fallbackCopy(text)
    })
  } else {
    console.log('ℹ️ 浏览器不支持 Clipboard API，使用降级方案（通常是 HTTP 环境）')
    fallbackCopy(text)
  }
}

// 降级复制方案
const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    console.log('已复制(降级方案):', text)
  } catch (e) {
    console.error('复制失败:', e)
  }
  document.body.removeChild(textarea)
}

// Ctrl+V 粘贴
const handlePaste = async () => {
  console.log('🔹 触发粘贴操作...')
  const $grid = gridRef.value
  if (!$grid) {
    console.log('❌ 表格引用不存在')
    return
  }
  
  const { visibleData } = $grid.getTableData()
  
  // 获取当前选中的单元格
  const selectedData = getSelectedData()
  if (selectedData.length === 0) {
    console.log('没有选中的目标单元格')
    return
  }
  
  // 辅助函数：更新单元格值
  const updateCellValue = (row, field, newValue) => {
    if (!field || !row.hasOwnProperty(field)) return
    const oldValue = row[field]
    if (oldValue !== newValue) {
      row[field] = newValue
      // 只有非新增行才标记为已编辑
      if (row._isNew !== true) {
        if (!row._editedFields) row._editedFields = {}
        row._editedFields[field] = true
      }
    }
  }
  
  // 辅助函数：查找行
  const findRowByRowId = (rowId) => {
    const cleanRowId = rowId.replace(/^row_/, '')
    return visibleData.find(r => {
      if (r._X_ROW_KEY !== undefined) {
        return String(r._X_ROW_KEY) === cleanRowId || String(r._X_ROW_KEY) === rowId
      }
      if (r.id !== undefined) {
        return String(r.id) === cleanRowId || String(r.id) === rowId
      }
      return false
    })
  }
  
  // 如果有内部复制的数据，优先使用
  if (copiedData.value.length > 0) {
    // 判断是否是单值粘贴（只复制了一个单元格）
    const isSingleValue = copiedData.value.length === 1 && copiedData.value[0].length === 1
    
    if (isSingleValue && selectedData.length > 1) {
      // 单值粘贴到所有选中的单元格
      const singleValue = copiedData.value[0][0].value
      selectedData.forEach(item => {
        const row = findRowByRowId(item.rowId)
        if (row) {
          updateCellValue(row, item.field, singleValue)
        }
      })
      console.log('单值粘贴到所有选中单元格完成')
    } else {
      // 多值粘贴：智能判断粘贴模式
      const copiedRowCount = copiedData.value.length
      const copiedColCount = copiedData.value[0]?.length || 0
      const copiedCellCount = copiedRowCount * copiedColCount
      
      // 如果选中的单元格数量和复制的单元格数量相同，直接对应粘贴
      if (selectedData.length === copiedCellCount && selectedData.length > 1) {
        // 按选中顺序粘贴
        let copiedIndex = 0
        for (let rowIdx = 0; rowIdx < copiedData.value.length; rowIdx++) {
          for (let colIdx = 0; colIdx < copiedData.value[rowIdx].length; colIdx++) {
            if (copiedIndex < selectedData.length) {
              const targetCell = selectedData[copiedIndex]
              const row = findRowByRowId(targetCell.rowId)
              if (row) {
                const copiedValue = copiedData.value[rowIdx][colIdx].value
                updateCellValue(row, targetCell.field, copiedValue)
              }
              copiedIndex++
            }
          }
        }
        console.log('对应粘贴完成')
      } else {
        // 按偏移量粘贴
        const targetCell = selectedData[0]
        const targetRowIndex = visibleData.findIndex(r => {
          const cleanRowId = targetCell.rowId.replace(/^row_/, '')
          if (r._X_ROW_KEY !== undefined) {
            return String(r._X_ROW_KEY) === cleanRowId || String(r._X_ROW_KEY) === targetCell.rowId
          }
          if (r.id !== undefined) {
            return String(r.id) === cleanRowId || String(r.id) === targetCell.rowId
          }
          return false
        })
        
        if (targetRowIndex === -1) return
        
        copiedData.value.forEach((rowCells, rowOffset) => {
          const targetRow = visibleData[targetRowIndex + rowOffset]
          if (!targetRow) return
          
          rowCells.forEach(cell => {
            updateCellValue(targetRow, cell.field, cell.value)
          })
        })
        console.log('偏移量粘贴完成')
      }
    }
    return
  }
  
  // 否则尝试从系统剪贴板读取
  try {
    const text = await navigator.clipboard.readText()
    if (!text) return
    
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return
    
    // 判断是否是单值（只有一行一列）
    const isSingleValue = lines.length === 1 && !lines[0].includes('\t')
    
    if (isSingleValue && selectedData.length > 1) {
      // 单值粘贴到所有选中的单元格
      const singleValue = lines[0].trim()
      selectedData.forEach(item => {
        const row = findRowByRowId(item.rowId)
        if (row) {
          updateCellValue(row, item.field, singleValue)
        }
      })
      console.log('从剪贴板单值粘贴到所有选中单元格完成')
    } else {
      // 多值粘贴：按偏移量粘贴
      const targetCell = selectedData[0]
      const targetRowIndex = visibleData.findIndex(r => {
        const cleanRowId = targetCell.rowId.replace(/^row_/, '')
        if (r._X_ROW_KEY !== undefined) {
          return String(r._X_ROW_KEY) === cleanRowId || String(r._X_ROW_KEY) === targetCell.rowId
        }
        if (r.id !== undefined) {
          return String(r.id) === cleanRowId || String(r.id) === targetCell.rowId
        }
        return false
      })
      
      if (targetRowIndex === -1) return
      
      const allColumns = $grid.getTableColumn().visibleColumn.filter(c => c.field)
      const startColIndex = allColumns.findIndex(c => c.id === targetCell.colId)
      
      lines.forEach((line, rowOffset) => {
        const targetRow = visibleData[targetRowIndex + rowOffset]
        if (!targetRow) return
        
        const values = line.split('\t')
        values.forEach((value, colOffset) => {
          const targetCol = allColumns[startColIndex + colOffset]
          if (targetCol) {
            updateCellValue(targetRow, targetCol.field, value)
          }
        })
      })
      console.log('从剪贴板多值粘贴完成')
    }
  } catch (e) {
    console.error('粘贴失败:', e)
  }
}

// 键盘事件处理
const handleKeydown = (e) => {
  // 如果键盘事件被禁用，直接返回
  if (!keyboardEnabled.value) {
    return
  }
  
  // 如果焦点在输入框、文本域，不处理（允许原生复制粘贴）
  const tag = e.target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea') {
    return
  }
  
  // 检查是否在可编辑元素内（contenteditable）
  if (e.target.isContentEditable) {
    return
  }
  
  // 检查是否在 VXE Table 的编辑单元格内
  let element = e.target
  while (element) {
    if (element.classList) {
      // VXE Table 编辑状态下的单元格
      if (element.classList.contains('vxe-body--column') && 
          element.classList.contains('col--edit')) {
        return
      }
      // VXE Table 激活编辑的单元格
      if (element.classList.contains('vxe-body--column') && 
          element.classList.contains('col--actived')) {
        return
      }
      // 富文本编辑器
      if (element.classList.contains('ql-editor') || 
          element.classList.contains('ql-container') ||
          element.classList.contains('editor')) {
        return
      }
      // VXE 输入框
      if (element.classList.contains('vxe-input') || 
          element.classList.contains('vxe-textarea')) {
        return
      }
    }
    element = element.parentElement
  }
  
  // 只处理 Ctrl+C 和 Ctrl+V
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    console.log('🔹 触发 Ctrl+C 复制')
    e.preventDefault()
    handleCopy()
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    console.log('🔹 触发 Ctrl+V 粘贴')
    e.preventDefault()
    handlePaste()
  }
}

// 获取新增的行（标记为 _isNew 的行）
const getInsertRecords = () => {
  const $grid = gridRef.value
  if (!$grid) return []
  const { visibleData } = $grid.getTableData()
  return visibleData.filter(row => row._isNew === true)
}

// 获取修改过的行（非新增行中有编辑过字段的）
const getUpdateRecords = () => {
  const $grid = gridRef.value
  if (!$grid) return []
  const { visibleData } = $grid.getTableData()
  return visibleData.filter(row => row._isNew !== true && row._editedFields && Object.keys(row._editedFields).length > 0)
}

// 获取变更记录集
const getRecordset = () => {
  return {
    insertRecords: getInsertRecords(),
    updateRecords: getUpdateRecords()
  }
}

// 右键菜单点击事件
const handleMenuClick = ({ menu, row, column }) => {
  console.log('🔧 VxeSelectableTable 收到菜单点击:', { code: menu.code, row, column })
  
  const $grid = gridRef.value
  
  // 如果没有选中单元格，自动选中右键点击的单元格
  if (selectedCells.value.size === 0 && row && column) {
    const rowId = row._X_ROW_KEY || row.id
    const colId = column.id
    const cellKey = buildCellKey(rowId, colId)
    if (cellKey) {
      selectedCells.value.add(cellKey)
      // 高亮单元格
      const container = containerRef.value
      if (container) {
        const cell = container.querySelector(`tr[rowid="${rowId}"] td[colid="${colId}"]`)
        if (cell) cell.classList.add('cell-selected')
      }
    }
  }
  
  switch (menu.code) {
    case 'copy':
      // 如果还是没有选中，复制当前单元格
      if (selectedCells.value.size === 0 && row && column && column.field) {
        const value = String(row[column.field] || '')
        fallbackCopy(value)
      } else {
        handleCopy()
      }
      break
    case 'paste':
      handlePaste()
      break
    case 'clear':
      clearSelection()
      break
    case 'addSelectedAsNew':
      // 添加为新增 - 只复制选中单元格的值到新行，其他字段留空
      {
        const selectedData = getSelectedData()
        if (selectedData.length === 0) {
          console.log('没有选中的单元格')
          break
        }
        
        // 按行分组，每行只保留选中的字段
        const rowMap = new Map()
        selectedData.forEach(item => {
          if (!rowMap.has(item.rowId)) {
            rowMap.set(item.rowId, {})
          }
          // 只复制选中的字段
          if (item.field) {
            rowMap.get(item.rowId)[item.field] = item.value
          }
        })
        
        // 转换为数组
        const partialRows = Array.from(rowMap.values())
        
        // 传递给父组件处理新增（只包含选中字段的部分数据）
        emit('menu-click', { code: menu.code, row, column, partialRows })
      }
      break
    case 'insertRow':
    case 'exportData':
      // 向上传递给父组件处理
      emit('menu-click', { code: menu.code, row, column })
      break
    case 'deleteRows':
      // 删除行 - 根据是否有选中行来决定删除行为
      {
        const selectedData = getSelectedData()
        
        // 提取唯一的行（按 row 对象去重）
        const rowSet = new Set()
        const selectedRows = []
        selectedData.forEach(item => {
          if (item.row && !rowSet.has(item.row)) {
            rowSet.add(item.row)
            selectedRows.push(item.row)
          }
        })
        
        // 提取实际的 id
        const selectedRowIds = selectedRows.map(r => r.id).filter(id => id !== undefined && id !== null)
        
        // 如果有选中行，删除选中的所有行；否则删除当前行
        if (selectedRowIds.length > 0) {
          console.log('🗑️ 批量删除:', selectedRowIds.length, '行', selectedRowIds)
          // 传递给父组件处理批量删除
          emit('menu-click', { code: menu.code, row, column, selectedRowIds })
        } else if (row && row.id) {
          console.log('🗑️ 单行删除:', row.id)
          // 传递给父组件处理单行删除
          emit('menu-click', { code: menu.code, row, column, selectedRowIds: [row.id] })
        } else {
          console.warn('⚠️ 没有可删除的行')
        }
      }
      break
    default:
      // 未处理的菜单项（如自定义的 freezeCell、unfreezeCell）传递给父组件
      console.log('🔧 传递自定义菜单项给父组件:', menu.code)
      emit('menu-click', { code: menu.code, row, column })
      break
  }
}

// 控制键盘事件监听的启用状态
const keyboardEnabled = ref(true)

// 启用键盘事件监听
const enableKeyboard = () => {
  keyboardEnabled.value = true
}

// 禁用键盘事件监听
const disableKeyboard = () => {
  keyboardEnabled.value = false
}

// 暴露方法
defineExpose({
  gridRef,
  clearSelection,
  getSelectedData,
  selectedCells,
  handleCopy,
  handlePaste,
  getInsertRecords,
  getUpdateRecords,
  getRecordset,
  enableKeyboard,
  disableKeyboard
})

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('keydown', handleKeydown)
})
</script>


<style scoped lang="scss">
.vxe-selectable-table {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  user-select: none;
}

// 选区框样式
.selection-box {
  position: absolute;
  border: 2px solid #409eff;
  background: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 100;
}

// 选中单元格样式
:deep(.cell-selected) {
  background: rgba(64, 158, 255, 0.15) !important;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid #409eff;
    pointer-events: none;
  }
}

// 表格样式
:deep(.vxe-grid) {
  .vxe-body--column {
    position: relative;
    cursor: cell;
    
    &:hover {
      background: rgba(64, 158, 255, 0.05);
    }
  }
}
</style>
