<template>
  <div class="shipment-order-draggable" @click="handleClickOutside">
    <!-- 搜索栏和操作按钮 -->
    <SearchBar
      :form="searchForm"
      :current-role="mockRole"
      :can-add-order="canAddOrder"
      @search="handleSearch"
      @reset="handleReset"
      @role-change="handleRoleChange"
      @add="handleAdd"
      @save="handleSave"
      @export="handleExport"
      @show-column-config="showColumnConfig"
      @reset-columns="resetColumns"
    />

    <!-- 表格区域 -->
    <div class="table-wrapper" @click="handleTableWrapperClick">
      <VxeSelectableTable
        ref="selectableTableRef"
        v-bind="gridOptions"
        :menu-config="customMenuConfig"
        :cell-class-name="cellClassName"
        @selection-change="handleSelectionChange"
        @menu-click="handleMenuClick"
        @header-dragend="handleHeaderDragEnd"
      />
    </div>
    
    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 富文本编辑对话框 -->
    <RichTextDialog
      v-model:visible="richTextDialog.visible"
      v-model:content="richTextDialog.content"
      :field="richTextDialog.field"
      :readonly="richTextDialog.readonly"
      @save="handleRichTextSave"
    />

    <!-- 列配置对话框 -->
    <ColumnConfig
      v-model:open="columnConfigVisible"
      v-model:columns="userColumns"
      storage-key="shipment-order-columns"
      :version="COLUMN_CONFIG_VERSION"
    />
  </div>
</template>

<script setup>
/**
 * 出货订单管理主页面
 * 
 * 功能特性：
 * - 支持可编辑表格（单元格双击编辑）
 * - 区域选择、复制粘贴
 * - 单元格冻结/解冻
 * - 富文本编辑（支持颜色、加粗等）
 * - 字段变更检测（标红显示）
 * - 自定义列配置（显示/隐藏、顺序、宽度）
 * - Excel导出（二级表头、Rich Text、条件格式）
 * - 角色权限控制
 * 
 * 技术栈：
 * - Vue 3 Composition API
 * - VXE Table (可编辑表格)
 * - ExcelJS (Excel导出)
 * - DOMParser (HTML解析)
 */
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VxeSelectableTable from '@/components/VxeSelectableTable/index.vue'
import ColumnConfig from './components/ColumnConfig.vue'
import SearchBar from './components/SearchBar.vue'
import RichTextDialog from './components/RichTextDialog.vue'
import { getCustomerList } from '@/api/customer/index.js'

// 导入配置
import { customerMaterialOptions } from './config'
import { defaultColumns, COLUMN_CONFIG_VERSION } from './config/defaultColumns'

// 导入 Composables
import { usePermission, useShipmentData, useRichTextEditor, useTableColumns } from './composables'
import { loadColumns, saveColumns } from './composables/useColumnConfig'

// 导入字段控制函数
import { freezeCell, unfreezeCell, isCellDisabled, isFieldChanged } from './composables/useFieldControl'

// 导入Excel导出功能
import { useExcelExport } from './composables/useExcelExport'

// ==================== 权限管理 ====================
const { 
  mockRole, 
  hasEditPermission, 
  checkRole, 
  isColumnEditable, 
  getRoleName, 
  switchRole, 
  updateEditPermission,
  canAddOrder 
} = usePermission()

// ==================== 数据管理 ====================
const { 
  searchForm, 
  pagination, 
  tableData,
  copiedRowData,
  loadData, 
  handleSearch, 
  handleReset, 
  handleSizeChange, 
  handleCurrentChange,
  createNewRow,
  deleteRows,
  saveData,
  copyRowData
} = useShipmentData()

// ==================== 富文本编辑 ====================
const { 
  richTextDialog, 
  getRichTextFieldTitle, 
  getRichTextFieldPlaceholder,
  openRichTextDialog,
  closeRichTextDialog,
  saveRichText
} = useRichTextEditor({
  onSave: (field, value) => {
    // 刷新表格以更新显示
    nextTick(() => {
      const table = selectableTableRef.value
      if (table && table.gridRef) {
        table.gridRef.refreshColumn()
      }
    })
  }
})

// ==================== Excel导出 ====================
const { exportToExcel } = useExcelExport()

// 监听富文本对话框的打开/关闭，控制表格键盘事件
watch(() => richTextDialog.visible, (isVisible) => {
  const table = selectableTableRef.value
  if (!table) return
  
  if (isVisible) {
    // 富文本对话框打开时，禁用表格键盘事件
    table.disableKeyboard()
    console.log('🔇 富文本对话框打开，已禁用表格键盘事件')
  } else {
    // 富文本对话框关闭时，恢复表格键盘事件
    table.enableKeyboard()
    console.log('🔊 富文本对话框关闭，已恢复表格键盘事件')
  }
})

// ==================== 客户选项数据 ====================
// 用于搜索框和表格列的客户名称下拉选项
const customerNameOptions = ref([])

/**
 * 加载客户选项列表
 * 获取所有启用状态的客户，用于下拉选择
 */
const loadCustomerOptions = async () => {
  try {
    const res = await getCustomerList({ p: 1, l: 100000 })
    if (res && res.data) {
      const { list = [] } = res.data
      customerNameOptions.value = list
        .filter(item => item.status === 0) // 只显示启用的客户
        .map(item => ({ label: item.name, value: item.name }))
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
  }
}

// ==================== 列配置管理 ====================
/**
 * 用户自定义列配置
 * - 从 localStorage 加载用户保存的列配置
 * - 包括列的显示/隐藏、顺序、宽度等
 * - 带版本控制，版本不匹配时自动使用默认配置
 */
const userColumns = ref(loadColumns('shipment-order-columns', defaultColumns, COLUMN_CONFIG_VERSION))
const columnConfigVisible = ref(false)

/**
 * 验证列配置完整性
 * 检查用户配置是否缺失字段，缺失则自动重置为默认配置
 */
const validateColumns = () => {
  const userFields = new Set(userColumns.value.map(c => c.field))
  const defaultFields = new Set(defaultColumns.map(c => c.field))
  
  // 检查是否有缺失的字段
  const missingFields = [...defaultFields].filter(f => !userFields.has(f))
  
  if (missingFields.length > 0) {
    console.warn('⚠️ 检测到列配置缺失字段，自动重置:', missingFields)
    userColumns.value = JSON.parse(JSON.stringify(defaultColumns))
    saveColumns('shipment-order-columns', userColumns.value, COLUMN_CONFIG_VERSION)
    ElMessage.warning('检测到列配置不完整，已自动重置')
  }
}

/**
 * 打开列配置对话框
 */
const showColumnConfig = () => {
  columnConfigVisible.value = true
}

/**
 * 重置列配置为默认值
 */
const resetColumns = () => {
  userColumns.value = JSON.parse(JSON.stringify(defaultColumns))
  saveColumns('shipment-order-columns', userColumns.value, COLUMN_CONFIG_VERSION)
  ElMessage.success('列配置已重置')
  refreshTable()
}

// ==================== 表格列配置 ====================
/**
 * 表格列定义
 * - 从 useTableColumns composable 获取列配置
 * - 包括基础列、分组列、富文本列等
 * - 自动注入编辑权限、客户选项等依赖
 */
const { tableColumns, buildGroupedColumns } = useTableColumns({ 
  customerNameOptions, 
  customerMaterialOptions, 
  isColumnEditable, 
  openRichTextDialog 
})

/**
 * 根据用户配置计算可见列
 * 核心逻辑：
 * 1. 根据 userColumns 的 visible 和 order 排序
 * 2. 重建分组结构（相邻的同组列合并为一个分组）
 * 3. 应用用户自定义的宽度和固定列设置
 */
const visibleColumns = computed(() => {
  console.log('📊 重新计算 visibleColumns，userColumns 数量:', userColumns.value.length)
  const rawColumns = tableColumns.value
  
  // 创建原始列的映射（包括分组列的子列）
  const rawColMap = new Map()
  const groupInfoMap = new Map() // 记录每个列所属的分组完整信息
  
  rawColumns.forEach(col => {
    if (col.type === 'seq') {
      rawColMap.set('seq', col)
    } else if (col.children && col.children.length > 0) {
      // 分组列
      col.children.forEach(child => {
        rawColMap.set(child.field, child)
        groupInfoMap.set(child.field, {
          groupTitle: col.title,
          groupAlign: col.align
        })
      })
    } else {
      // 普通列
      rawColMap.set(col.field, col)
    }
  })
  
  // 按 order 排序用户配置的列
  const sortedUserColumns = userColumns.value
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
  
  // 构建最终的列配置，尝试重建分组结构
  const finalColumns = []
  const currentGroups = new Map() // 当前正在构建的分组
  
  // 添加序号列
  const seqCol = rawColMap.get('seq')
  if (seqCol) {
    finalColumns.push(seqCol)
  }
  
  // 按用户配置的顺序处理列
  sortedUserColumns.forEach((userCol, index) => {
    const rawCol = rawColMap.get(userCol.field)
    if (!rawCol) return
    
    const processedCol = {
      ...rawCol,
      width: userCol.width || rawCol.width,
      fixed: userCol.fixed || rawCol.fixed
    }
    
    const groupInfo = groupInfoMap.get(userCol.field)
    
    if (groupInfo) {
      // 这是一个分组列的子列
      const groupTitle = groupInfo.groupTitle
      
      // 检查是否需要创建新分组或添加到现有分组
      const nextUserCol = sortedUserColumns[index + 1]
      const nextGroupInfo = nextUserCol ? groupInfoMap.get(nextUserCol.field) : null
      const isLastInGroup = !nextGroupInfo || nextGroupInfo.groupTitle !== groupTitle
      
      // 检查前一个列是否属于同一分组
      const prevUserCol = sortedUserColumns[index - 1]
      const prevGroupInfo = prevUserCol ? groupInfoMap.get(prevUserCol.field) : null
      const isFirstInGroup = !prevGroupInfo || prevGroupInfo.groupTitle !== groupTitle
      
      if (isFirstInGroup) {
        // 创建新分组
        const groupCol = {
          title: groupTitle,
          align: groupInfo.groupAlign || 'center',
          children: [processedCol]
        }
        currentGroups.set(groupTitle, groupCol)
        finalColumns.push(groupCol)
      } else {
        // 添加到现有分组
        const groupCol = currentGroups.get(groupTitle)
        if (groupCol) {
          groupCol.children.push(processedCol)
        }
      }
    } else {
      // 普通列，直接添加
      finalColumns.push(processedCol)
    }
  })
  
  return finalColumns
})

// ==================== 表格配置与状态 ====================
/**
 * 表格组件引用
 * 用于访问 VxeSelectableTable 的方法和属性
 */
const selectableTableRef = ref()

/**
 * 选中单元格信息
 * 记录当前选中的单元格数量和位置信息
 */
const selectionInfo = ref({ cells: [], count: 0 })

/**
 * 自定义右键菜单配置
 * 提供冻结/解冻单元格等功能
 */
const customMenuConfig = {
  body: {
    options: [
      [
        { code: 'freezeCell', name: '🔒 冻结单元格', prefixIcon: 'vxe-icon-lock' },
        { code: 'unfreezeCell', name: '🔓 解冻单元格', prefixIcon: 'vxe-icon-unlock' }
      ]
    ]
  }
}

console.log('📋 主页面自定义菜单配置:', customMenuConfig)

/**
 * 编辑前的权限检查
 * 在单元格进入编辑状态前调用
 * @returns {boolean} true-允许编辑，false-禁止编辑
 */
const beforeEditMethod = ({ row, column }) => {
  if (!hasEditPermission.value) {
    ElMessage.warning('您没有编辑权限')
    return false
  }
  if (column.field && !isColumnEditable(column.field)) {
    ElMessage.warning('该列不可编辑')
    return false
  }
  // 检查单元格是否被冻结
  if (isCellDisabled(row, column.field)) {
    ElMessage.warning('该单元格已被冻结，无法编辑')
    return false
  }
  return true
}

// 表格配置
const gridOptions = reactive({
  border: true,
  resizable: true,
  showOverflow: true,
  keepSource: true,
  id: 'shipment-order-table',
  rowId: 'id',
  height: 'auto',
  rowConfig: { isHover: true, keyField: 'id', height: 40 },
  columnConfig: { resizable: true },
  headerRowHeight: 32,
  tooltipConfig: { enterable: true, appendToBody: true },
  editConfig: {
    trigger: 'dblclick',
    mode: 'cell',
    showStatus: true,
    autoClear: false,
    beforeEditMethod
  },
  // 鼠标配置 - 启用区域选择
  mouseConfig: {
    selected: true,
    area: true
  },
  // 区域选择配置
  areaConfig: {
    multiple: true,
    selectCellToRow: false,
    extendByCalc: true,
    extendByCopy: true
  },
  // 复制粘贴配置
  clipConfig: {
    isCopy: true,
    isCut: true,
    isPaste: true
  },
  // 键盘配置
  keyboardConfig: {
    isClip: true,
    isArrow: true,
    isTab: true,
    isEnter: true,
    isDel: true,
    isBack: true,
    isEsc: true
  },
  // 列拖拽配置
  columnConfig: {
    resizable: true, // 列宽可调整
    useKey: true
  },
  // 筛选配置
  filterConfig: {
    remote: false
  },
  columns: visibleColumns,
  data: tableData
})

// 刷新表格
const refreshTable = () => {
  const table = selectableTableRef.value
  if (table && table.gridRef) {
    // 强制重新加载列配置
    nextTick(() => {
      table.gridRef.loadColumn(visibleColumns.value)
      table.gridRef.refreshColumn()
    })
  }
}

// 监听用户列配置变化，自动刷新表格
watch(userColumns, () => {
  console.log('🔄 用户列配置已更新，刷新表格')
  refreshTable()
}, { deep: true })


// 列拖拽结束处理
const handleHeaderDragEnd = ({ column, newIndex, oldIndex }) => {
  console.log('列拖拽:', { column, newIndex, oldIndex })
  // 保存列顺序到 localStorage
  const table = selectableTableRef.value
  if (table && table.gridRef) {
    const columns = table.gridRef.getColumns()
    const columnOrder = columns.map(col => col.field)
    localStorage.setItem('shipment-order-column-order', JSON.stringify(columnOrder))
    ElMessage.success('列顺序已保存')
  }
}

/**
 * 调试用单元格标记
 * 用于开发时定位特定单元格
 */
const debugCell = ref({ rowId: null, field: null })

/**
 * 单元格样式类名
 * 根据单元格状态动态添加CSS类
 * - cell-frozen: 冻结状态
 * - cell-changed: 字段值已变更
 * - cell-badge-new: 新增行标记
 * - cell-badge-edit: 已编辑字段标记
 */
const cellClassName = ({ row, column }) => {
  if (!column || !column.field) return ''
  
  const classes = []
  
  // 1. 检查单元格是否被冻结
  const isFrozen = isCellDisabled(row, column.field)
  if (isFrozen) {
    classes.push('cell-frozen')
  }
  
  // 2. 检查字段是否变更（标红显示）
  const isChanged = isFieldChanged(row, column.field)
  if (isChanged) {
    classes.push('cell-changed')
  }
  
  // 3. 关键判断：_isNew 为 true 的行就是新增行，始终显示绿色角标
  // 即使有 id 或 _editedFields，只要 _isNew 为 true，就是新增状态
  if (row._isNew === true) {
    classes.push('cell-badge-new')
  }
  // 4. 已保存的行（_isNew 不为 true），字段被编辑过，显示红色角标
  else if (row._editedFields && row._editedFields[column.field]) {
    classes.push('cell-badge-edit')
  }
  
  return classes.join(' ')
}

// ==================== 事件处理 ====================

/**
 * 选中区域变化事件
 * 更新选中单元格信息
 */
const handleSelectionChange = (info) => {
  selectionInfo.value = info
}

/**
 * 角色切换事件
 * 切换用户角色后更新编辑权限
 */
const handleRoleChange = (role) => {
  switchRole(role)
  ElMessage.success(`已切换到角色: ${getRoleName(role)}`)
  
  const table = selectableTableRef.value
  if (table && table.gridRef) {
    table.gridRef.refreshColumn()
  }
}

// 点击表格容器时的处理
const handleTableWrapperClick = (e) => {
  const target = e.target
  const table = selectableTableRef.value
  if (!table || !table.gridRef) return
  
  // 检查是否点击在表头
  if (target.closest('.vxe-table--header-wrapper')) {
    return
  }
  
  // 检查是否点击在输入框、下拉框等组件上
  if (
    target.closest('.vxe-input') ||
    target.closest('.el-input') ||
    target.closest('.el-select') ||
    target.closest('.el-date-editor')
  ) {
    return
  }
  
  // 检查是否点击在单元格上
  const cellElement = target.closest('.vxe-cell')
  if (cellElement) {
    // 获取当前激活的单元格
    const activedCell = table.gridRef.getActiveRecord()
    
    if (activedCell && activedCell.row && activedCell.column) {
      // 获取点击的单元格信息
      const tdElement = cellElement.closest('td')
      if (tdElement) {
        const rowIndex = tdElement.parentElement.rowIndex - 1 // 减去表头
        const colIndex = Array.from(tdElement.parentElement.children).indexOf(tdElement)
        
        // 获取点击位置的行和列
        const { visibleData } = table.gridRef.getTableData()
        const clickedRow = visibleData[rowIndex]
        const clickedColumn = table.gridRef.getColumns()[colIndex]
        
        // 如果点击的是当前正在编辑的单元格，不退出编辑
        if (
          clickedRow && 
          clickedColumn && 
          clickedRow === activedCell.row && 
          clickedColumn.field === activedCell.column.field
        ) {
          return
        }
      }
    }
    
    // 点击的是其他单元格，不处理（让 VXE Table 自己处理切换编辑）
    return
  }
  
  // 点击的是空白区域，只清除编辑状态，保留选中状态
  table.gridRef.clearEdit()
  // 不清除选中状态，让用户可以继续选择区域
  // table.clearSelection()
}

// 点击空白处，让表格失去焦点
const handleClickOutside = () => {
  const table = selectableTableRef.value
  if (!table || !table.gridRef) return
  
  // 只清除编辑状态，保留选中状态
  table.gridRef.clearEdit()
  
  // 不清除选中状态，让用户可以继续操作选中的单元格
  // table.clearSelection()
}

/**
 * 新增订单
 * 在表格顶部插入一行新记录
 * 如果有复制的数据则自动填充
 */
const handleAdd = () => {
  const table = selectableTableRef.value
  if (table) table.clearSelection()
  
  const newRow = createNewRow(copiedRowData.value)
  gridOptions.data.unshift(newRow)
  
  if (copiedRowData.value) {
    ElMessage.success('已新增一行并粘贴复制的数据')
  } else {
    ElMessage.success('已新增一行')
  }
}

/**
 * 保存数据
 * 提交新增和修改的记录到后端
 */
const handleSave = () => {
  const table = selectableTableRef.value
  if (!table) return
  
  const { insertRecords, updateRecords } = table.getRecordset()
  saveData(insertRecords, updateRecords)
}

/**
 * 右键菜单点击事件
 * 处理冻结/解冻/复制/删除等操作
 */
const handleMenuClick = ({ code, row, column, partialRows, selectedRowIds }) => {
  console.log('🖱️ 右键菜单点击:', { code, rowId: row?.id, field: column?.field, partialRows: partialRows?.length, selectedRowIds: selectedRowIds?.length })
  
  const table = selectableTableRef.value
  
  switch (code) {
    case 'freezeCell':
      {
        // 获取选中的单元格
        const selectedData = table?.getSelectedData?.() || []
        
        if (selectedData.length > 0) {
          // 批量冻结选中的单元格
          console.log('🔒 批量冻结操作...', selectedData.length, '个单元格')
          
          // 按行分组
          const rowMap = new Map()
          selectedData.forEach(item => {
            if (!rowMap.has(item.rowId)) {
              rowMap.set(item.rowId, [])
            }
            rowMap.get(item.rowId).push(item.field)
          })
          
          // 对每一行的字段进行冻结，并统计实际冻结数量
          const $grid = table.gridRef
          const { visibleData } = $grid.getTableData()
          let actualFreezeCount = 0
          
          rowMap.forEach((fields, rowId) => {
            const targetRow = visibleData.find(r => String(r.id) === String(rowId) || String(r._X_ROW_KEY) === String(rowId))
            if (targetRow) {
              fields.forEach(field => {
                // 只冻结未冻结的单元格
                if (!isCellDisabled(targetRow, field)) {
                  freezeCell(targetRow, field)
                  actualFreezeCount++
                }
              })
            }
          })
          
          if (actualFreezeCount > 0) {
            ElMessage.success(`已冻结 ${actualFreezeCount} 个单元格`)
          } else {
            ElMessage.warning('所选单元格均已冻结')
          }
        } else if (row && column) {
          // 单个单元格冻结
          console.log('🔒 单个冻结操作...')
          if (!isCellDisabled(row, column.field)) {
            freezeCell(row, column.field)
            ElMessage.success('单元格已冻结')
          } else {
            ElMessage.warning('该单元格已冻结')
          }
        }
        
        // 刷新表格并清除选中状态
        if (table && table.gridRef) {
          table.gridRef.refreshColumn()
          // 冻结后清除选中状态和编辑状态
          table.clearSelection()
          table.gridRef.clearEdit()
        }
      }
      break
      
    case 'unfreezeCell':
      {
        // 获取选中的单元格
        const selectedData = table?.getSelectedData?.() || []
        
        if (selectedData.length > 0) {
          // 批量解冻选中的单元格
          console.log('🔓 批量解冻操作...', selectedData.length, '个单元格')
          
          // 按行分组
          const rowMap = new Map()
          selectedData.forEach(item => {
            if (!rowMap.has(item.rowId)) {
              rowMap.set(item.rowId, [])
            }
            rowMap.get(item.rowId).push(item.field)
          })
          
          // 对每一行的字段进行解冻，并统计实际解冻数量
          const $grid = table.gridRef
          const { visibleData } = $grid.getTableData()
          let actualUnfreezeCount = 0
          
          rowMap.forEach((fields, rowId) => {
            const targetRow = visibleData.find(r => String(r.id) === String(rowId) || String(r._X_ROW_KEY) === String(rowId))
            if (targetRow) {
              fields.forEach(field => {
                // 只解冻已冻结的单元格
                if (isCellDisabled(targetRow, field)) {
                  unfreezeCell(targetRow, field)
                  actualUnfreezeCount++
                }
              })
            }
          })
          
          if (actualUnfreezeCount > 0) {
            ElMessage.success(`已解冻 ${actualUnfreezeCount} 个单元格`)
          } else {
            ElMessage.warning('所选单元格均未冻结')
          }
        } else if (row && column) {
          // 单个单元格解冻
          console.log('🔓 单个解冻操作...')
          if (isCellDisabled(row, column.field)) {
            unfreezeCell(row, column.field)
            ElMessage.success('单元格已解冻')
          } else {
            ElMessage.warning('该单元格未冻结')
          }
        }
        
        // 刷新表格并清除选中状态
        if (table && table.gridRef) {
          table.gridRef.refreshColumn()
          // 解冻后清除选中状态和编辑状态
          table.clearSelection()
          table.gridRef.clearEdit()
        }
      }
      break
    case 'addSelectedAsNew':
      // 选中新增：批量复制选中区域的所有行
      if (partialRows && partialRows.length > 0) {
        // 批量新增选中的行（只包含选中的字段）
        partialRows.forEach(partialRow => {
          const newRow = createNewRow()
          // 只填充选中区域的字段
          Object.keys(partialRow).forEach(field => {
            if (field in newRow) {
              newRow[field] = partialRow[field]
            }
          })
          gridOptions.data.unshift(newRow)
        })
        ElMessage.success(`已新增 ${partialRows.length} 行并填充选中数据`)
      } else {
        ElMessage.warning('请先选择要复制的单元格区域')
      }
      break
    case 'insertRow':
      handleAdd()
      break
    case 'copyRow':
      if (row) {
        copyRowData(row)
        ElMessage.success('已复制行数据，点击"新增订单"可粘贴')
      }
      break
    case 'deleteRow':
      if (row) {
        deleteRows([row.id])
      }
      break
    case 'deleteRows':
      // 批量删除选中的行（子组件已经提取了实际的 id）
      if (selectedRowIds && selectedRowIds.length > 0) {
        console.log('🗑️ 准备删除行:', selectedRowIds)
        deleteRows(selectedRowIds)
      } else {
        ElMessage.warning('请先选择要删除的行')
      }
      break
    case 'exportData':
      handleExport()
      break
  }
}

/**
 * 导出Excel
 * 功能特性：
 * - 调用接口获取全量数据（最多100000条）
 * - 支持二级表头（分组列）
 * - HTML富文本转Excel Rich Text（保留颜色、加粗等样式）
 * - 自动检测字段变更并标红
 * - 应用条件格式（未发货量、订单耗时等）
 */
const handleExport = () => {
  exportToExcel(searchForm, visibleColumns.value)
}

// ==================== 生命周期 ====================
/**
 * 组件挂载时初始化
 * 1. 验证列配置完整性
 * 2. 加载客户选项
 * 3. 加载表格数据
 * 4. 更新编辑权限
 * 5. 检查列配置版本
 */
onMounted(() => {
  validateColumns() // 验证列配置完整性
  loadCustomerOptions()
  loadData()
  updateEditPermission()
  
  // 检查是否需要显示清除配置提示
  const saved = localStorage.getItem('shipment-order-columns')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (!data._version || data._version !== COLUMN_CONFIG_VERSION) {
        console.log('🔄 检测到旧版本列配置，将使用默认配置')
        ElMessage.info({
          message: '检测到列配置需要更新，已自动使用默认配置。如有问题，请点击"重置列配置"按钮。',
          duration: 5000
        })
      }
    } catch (e) {
      console.error('解析列配置失败:', e)
    }
  }
})
</script>


<style scoped lang="scss">
.shipment-order-draggable {
  height: calc(100vh - 84px); // 减去顶部导航栏高度
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;
  border-radius: 8px;
  overflow: hidden;
}
 
.table-wrapper {
  flex: 1;
  background: #fff;
  padding:0 15px;
  overflow: hidden;
  min-height: 0; // 关键：允许 flex 子元素收缩
  
  :deep(.vxe-selectable-table) {
    height: 100%;
  }
  
  :deep(.vxe-table) {
    height: 100%;
  }
  
  :deep(.vxe-table--main-wrapper) {
    height: 100%;
  }
  
  // 调整表头高度
  :deep(.vxe-table--header-wrapper) {
    .vxe-header--row {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
    }
    
    .vxe-header--column {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      line-height: 32px !important;
    }
    
    .vxe-cell {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      line-height: 32px !important;
      padding: 0 6px !important;
      font-size: 13px !important;
    }
  }
}

.pagination-wrapper {
  flex-shrink: 0;
  background: #fff;
  padding: 15px;
  border-radius:0 0 10px 10px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

// 单元格角标样式
:deep(.cell-badge-new) {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: #67C23A transparent transparent transparent;
    z-index: 1;
  }
}

:deep(.cell-badge-edit) {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: #F56C6C transparent transparent transparent;
    z-index: 1;
  }
}

// 字段变更样式（标红显示）
:deep(.cell-changed) {
  color: #F56C6C !important;
  font-weight: 600;
}

// 数量字段颜色
:deep(.text-green) {
  color: #67C23A !important;
  font-weight: 600;
}

:deep(.text-red) {
  color: #F56C6C !important;
  font-weight: 600;
}

// 冻结单元格样式
:deep(.cell-frozen) {
  background-color: #f5f7fa !important;
  color: #909399 !important;
  cursor: not-allowed !important;
  position: relative;
  
  &::before {
    content: '🔒';
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    opacity: 0.8;
    z-index: 100;
    pointer-events: none;
  }
  
  // 禁用悬停效果
  &:hover {
    background-color: #f5f7fa !important;
  }
}

// 选中状态下的冻结单元格，图标更明显
:deep(.vxe-cell--selected.cell-frozen::before),
:deep(.col--actived.cell-frozen::before) {
  opacity: 1;
  font-size: 14px;
  z-index: 100;
}

// 订单编号链接样式
:deep(.order-no-link) {
  color: #409EFF;
  cursor: pointer;
  font-weight: 500;
  &:hover { text-decoration: underline; color: #66b1ff; }
}

// 数量文本样式
:deep(.quantity-text) {
  font-weight: 600;
  color: #303133;
  &.text-green { color: #67C23A; }
}

:deep(.shipped-text) { color: #67C23A !important; font-weight: 500; }

:deep(.unshipped-text) {
  color: #F56C6C !important;
  font-weight: 500;
  &.has-unshipped { font-weight: 600; }
}

:deep(.days-text) {
  color: #606266;
  &.warning-days { color: #F56C6C; font-weight: 600; }
}

// 富文本单元格样式
:deep(.rich-text-cell) {
  white-space: pre-wrap;  // 保留空格和换行
  word-break: break-word;
  line-height: 1.6;
  padding: 4px 0;
  cursor: pointer;
  
  p { margin: 0; padding: 2px 0; }
  strong { font-weight: 600; }
  
  &.clickable-cell {
    transition: background-color 0.2s;
    &:hover { background-color: rgba(64, 158, 255, 0.1); }
  }
  
  &.rich-text-left { text-align: left; width: 100%; }
}

// 富文本列的单元格垂直顶部对齐
:deep(.vxe-body--column) {
  &:has(.rich-text-cell) {
    vertical-align: top !important;
    
    .vxe-cell {
      align-items: flex-start !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }
  }
}

// 富文本对话框样式
.rich-text-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    .el-dialog__title { font-size: 16px; font-weight: 600; color: #303133; }
  }
  
  :deep(.el-dialog__body) { padding: 0; }
  
  .dialog-content {
    padding: 20px;
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
  }
  
  .readonly-content .rich-text-display {
    padding: 15px;
    background: #fafafa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    min-height: 260px;
    line-height: 1.8;
    color: #606266;
    :deep(p) { margin: 0; padding: 4px 0; }
  }
  
  :deep(.el-dialog__footer) {
    padding: 12px 20px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
  }
  
  .dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
}

// 全局样式：强制设置表头高度
:deep(.vxe-table) {
  .vxe-table--header-wrapper {
    .vxe-header--row {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
    }
    
    .vxe-header--column {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
    }
    
    .vxe-cell {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      line-height: 32px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  }
}

// 选中单元格样式
:deep(.cell-selected) {
  background: rgba(64, 158, 255, 0.15) !important;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid #409eff;
    pointer-events: none;
    z-index: 1;
  }
}

:deep(.vxe-body--column.col--edit) {
  cursor: text;
  &:hover { background-color: rgba(64, 158, 255, 0.05); }
}
</style>
