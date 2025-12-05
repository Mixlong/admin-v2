<template>
  <div class="shipment-order-excel">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="配置型号">
          <el-input v-model="searchForm.configModel" placeholder="请输入配置型号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="客户订单号">
          <el-input v-model="searchForm.customerOrderNo" placeholder="请输入客户订单号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="U8单号">
          <el-input v-model="searchForm.u8OrderNo" placeholder="请输入U8单号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="handleAdd">
          新增订单
        </el-button>
        <el-button type="success" size="small" @click="handleSave">
          保存修改
        </el-button>
        <el-button type="primary" size="small" plain @click="handleCopySelection">
          复制选区
        </el-button>
        <el-button type="success" size="small" plain @click="handlePasteSelection">
          粘贴到选区
        </el-button>
        <el-button type="danger" size="small" plain @click="handleClearSelection">
          清空选区
        </el-button>
        <el-button type="primary" plain size="small" @click="handleSelectionInfo">
          查看选区
        </el-button>
        <el-button type="danger" size="small" @click="handleDeleteSelected">
          删除选中
        </el-button>
        <el-button type="warning" size="small" @click="handleExport">
          高级导出
        </el-button>
        <el-button type="info" size="small" @click="handleQuickExport">
          快速导出
        </el-button>
        <el-button type="primary" size="small" @click="testExport">
          测试导出
        </el-button>
      </div>
    </div>

    <!-- VXE Grid 表格 -->
    <div class="table-wrapper">
      <vxe-grid
        ref="gridRef"
        v-bind="gridOptions"
        v-on="gridEvents"
        :cell-class-name="cellClassName"
      >
        <!-- 底部统计信息 -->
        <template #bottom>
          <div class="footer-info">{{ countText }}</div>
        </template>
      </vxe-grid>
    </div>

    <!-- 富文本编辑/查看对话框 -->
    <el-dialog
      v-model="richTextDialog.visible"
      :title="(richTextDialog.readonly ? '查看' : '编辑') + (richTextDialog.field === 'specialRemark' ? '特殊备注' : '交期变更历史')"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      class="rich-text-dialog"
    >
      <div class="dialog-content">
        <!-- 编辑模式 -->
        <FormattedTextEditor
          v-if="!richTextDialog.readonly"
          v-model="richTextDialog.content"
          :placeholder="richTextDialog.field === 'specialRemark' ? '请输入特殊备注，支持富文本格式' : '请输入交期变更记录，支持富文本格式'"
        />
        
        <!-- 只读模式 -->
        <div v-else class="readonly-content">
          <div class="rich-text-display" v-html="richTextDialog.content || '暂无内容'"></div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="richTextDialog.visible = false">
            {{ richTextDialog.readonly ? '关闭' : '取消' }}
          </el-button>
          <el-button v-if="!richTextDialog.readonly" type="primary" @click="handleRichTextSave">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, h, watch } from 'vue'
import { ElMessage, ElMessageBox, ElSelect, ElOption } from 'element-plus'
import VXETable from 'vxe-table'
const VxeUI = VXETable
import XEUtils from 'xe-utils'
import {
  getShipmentOrderList,
  deleteShipmentOrder,
  updateShipmentOrder
} from '@/api/shipment/order.mock'
import FormattedTextEditor from '@/components/FormattedTextEditor.vue'

const gridRef = ref()
const countText = ref('')

// 富文本编辑对话框
const richTextDialog = reactive({
  visible: false,
  content: '',
  row: null,
  field: '',
  readonly: false // 是否只读模式
})

// 权限控制 - 这里可以根据实际权限系统调整
const hasEditPermission = ref(true) // 示例：默认有编辑权限

// 兜底 Message/Confirm（防止 modal getter/未注册导致的异常）
const uiMessage = (opts) => {
  if (!opts) opts = {}
  const { content = '', status = 'info', duration = 1500 } = opts
  
  // 优先使用 VxeUI 的 modal.message
  try {
    if (VxeUI && VxeUI.modal && typeof VxeUI.modal.message === 'function') {
      return VxeUI.modal.message({ content, status, duration })
    }
  } catch (e) {
    console.warn('VxeUI.modal.message 调用失败:', e)
  }
  
  // 降级使用 Element Plus 的 ElMessage
  try {
    const typeMap = { success: 'success', error: 'error', warning: 'warning', info: 'info' }
    if (ElMessage && typeof ElMessage === 'function') {
      return ElMessage({ 
        message: content || '操作完成', 
        type: typeMap[status] || 'info', 
        duration 
      })
    }
  } catch (e) {
    console.warn('ElMessage 调用失败:', e)
  }
  
  // 最后降级到 console
  console.log(`[${status}] ${content}`)
}

const uiConfirm = (msg, title = '提示') => {
  let modalConfirm
  try {
    modalConfirm = VxeUI?.modal?.confirm
  } catch (e) {
    modalConfirm = null
  }
  if (typeof modalConfirm === 'function') {
    return modalConfirm(msg, title)
  }
  return ElMessageBox.confirm(msg, title, { type: 'warning' })
}

// 鼠标框选状态
const isSelecting = ref(false)
const selectionStart = reactive({ rowIndex: -1, cellIndex: -1, colId: '' })
const selectionEnd = reactive({ rowIndex: -1, cellIndex: -1, colId: '' })

// 选中的单元格 Set<"rowIndex-cellIndex">
const selectedCells = ref(new Set())

let mainTbodyEl = null
let fixedTbodyEl = null
let keydownHandler = null

// 搜索表单
const searchForm = reactive({
  customerName: '',
  configModel: '',
  customerOrderNo: '',
  u8OrderNo: ''
})

// Grid 配置 - Excel 风格
const gridOptions = reactive({
  border: true,
  loading: false,
  stripe: false,
  showOverflow: true,
  height: 'auto',
  keepSource: true,
  columnConfig: {
    resizable: true,
    width: 140,
    isCurrent: false,
    isHover: false
  },
  sortConfig: {
    trigger: 'cell',
    showIcon: false
  },
  filterConfig: {
    showIcon: false
  },
  rowConfig: {
    useKey: true,
    isHover: true,
    keyField: 'id',
    resizable: true // 启用行高调整
  },
  resizableConfig: {
    isSyncAutoWidth: true, // 拖拽调整列宽时，自动同步更新所选区域的所有列宽
    isDblclickAutoWidth: true, // 双击自适应列宽
    isSyncAutoHeight: true, // 拖拽调整行高时，自动同步更新所选区域的所有行高
    isDblclickAutoHeight: true // 双击自适应行高
  },

  // 鼠标配置（关闭区域选取，避免付费能力）
  mouseConfig: {
    selected: true,
    area: false
  },
  // 编辑配置
  editConfig: {
    mode: 'cell',
    trigger: 'dblclick',
    showStatus: true,  // 显示编辑状态（修改/新增标记）
    showIcon: true,    // 显示编辑图标
    autoClear: false   // 不自动清除编辑状态
  },
  // 右键菜单配置
  menuConfig: {
    header: {
      options: [
        [
          { code: 'COPY_TITLE', name: '复制列标题' },
          { code: 'EXPORT_ALL', name: '导出 Excel', prefixIcon: 'vxe-icon-download', params: { filename: '出货订单', type: 'xlsx' } }
        ]
      ]
    },
    body: {
      options: [
        [
          { code: 'INSERT_AT_ROW', name: '插入行' },
          { code: 'DELETE_ROW', name: '删除行' }
        ],
        [
          { code: 'EXPORT_ALL', name: '导出 Excel', prefixIcon: 'vxe-icon-download', params: { filename: '出货订单', type: 'xlsx' } }
        ]
      ]
    }
  },
  // 键盘配置
  keyboardConfig: {
    arrowCursorLock: true, // 方向键光标锁
    isClip: false, // 关闭跨区域复制（区域选取为付费功能）
    isArrow: true, // 方向键
    isShift: true, // Shift 扩展选区
    isTab: true, // Tab 键
    isEnter: true, // 回车键
    isEdit: true, // 任意键进入编辑
    isBack: true, // 回退键
    isDel: true, // 删除键
    isEsc: true, // Esc 键
    isFNR: false, // 查找与替换（付费）关闭
    isMerge: false, // 合并（付费）关闭
    isChecked: true // 启用复选框选中功能
  },
  // 虚拟滚动
  scrollX: {
    enabled: true,
    gt: 0
  },
  scrollY: {
    enabled: true,
    gt: 0
  },
  // 列配置
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { field: 'seq', type: 'seq', title: '序号', width: 60, fixed: 'left', rowResize: true },
    { 
      field: 'customerName', 
      title: '客户名称', 
      width: 140, 
      fixed: 'left',
      editRender: { name: 'input' }
    },
    { 
      field: 'u8OrderNo', 
      title: 'U8单号', 
      width: 160,
      editRender: { name: 'input' },
      slots: {
        default: ({ row }) => {
          return [
            h('span', { class: 'order-no-link' }, row.u8OrderNo || '-')
          ]
        }
      }
    },
    { 
      field: 'u8Available', 
      title: 'U8是否可用', 
      width: 130,
      cellRender: { name: 'VxeSwitch' }
    },
    { 
      field: 'bomCode', 
      title: 'BOM编码', 
      width: 160,
      editRender: { name: 'input' }
    },
    { 
      field: 'etreeBomBefore', 
      title: 'E树BOM刷新前', 
      width: 140,
      editRender: { name: 'input' }
    },
    { 
      field: 'etreeBomAfter', 
      title: 'E树BOM刷新后', 
      width: 140,
      editRender: { name: 'input' }
    },
    { 
      field: 'etreeBomAudited', 
      title: 'E树BOM是否审核', 
      width: 130,
      editRender: {
        name: 'select',
        options: [
          { label: '已审核', value: '已审核' },
          { label: '未审核', value: '未审核' },
        ]
      },
      slots: {
        default: ({ row }) => {
          const statusMap = {
            '已审核': { type: 'success', text: '已审核' },
            '有遗留': { type: 'warning', text: '有遗留' },
            '未审核': { type: 'info', text: '未审核' }
          }
          const status = statusMap[row.etreeBomAudited] || { type: 'info', text: '-' }
          const colorMap = {
            'success': '#67C23A',
            'warning': '#E6A23C',
            'info': '#909399'
          }
          return [
            h('span', { 
              style: { 
                color: colorMap[status.type], 
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: '500'
              }
            }, status.text)
          ]
        }
      }
    },
    { 
      field: 'configModel', 
      title: '配置型号', 
      width: 160,
      editRender: { name: 'input' },
      slots: {
        default: ({ row }) => {
          return [
            h('span', { class: 'model-text' }, row.configModel || '-')
          ]
        }
      }
    },
    { 
      field: 'keyModel', 
      title: '按键型号', 
      width: 140,
      editRender: { name: 'input' }
    },
    { 
      field: 'customerOrderNo', 
      title: '客户订单号', 
      width: 160,
      editRender: { name: 'input' }
    },
    { 
      field: 'etreeOrderNo', 
      title: 'E树订单号', 
      width: 160,
      editRender: { name: 'input' }
    },
    { 
      field: 'orderDate', 
      title: '上单时间', 
      width: 110,
      editRender: { 
        name: 'input',
        attrs: { type: 'date' }
      }
    },
    // 数量信息分组
    {
      title: '数量信息',
      children: [
        { 
          field: 'orderQuantity', 
          title: '订单数量', 
          width: 100,
          editRender: { 
            name: 'input',
            attrs: { type: 'number' }
          },
          slots: {
            default: ({ row }) => {
              return [
                h('span', { class: 'quantity-text text-green' }, row.orderQuantity || 0)
              ]
            }
          }
        },
        { 
          field: 'shippedQuantity', 
          title: '已发货量', 
          width: 100,
          editRender: { 
            name: 'input',
            attrs: { type: 'number' }
          },
          slots: {
            default: ({ row }) => {
              return [
                h('span', { class: 'shipped-text' }, row.shippedQuantity || 0)
              ]
            }
          }
        },
        { 
          field: 'unshippedQuantity', 
          title: '未发货量', 
          width: 100,
          editRender: { 
            name: 'input',
            attrs: { type: 'number' }
          },
          slots: {
            default: ({ row }) => {
              const hasUnshipped = row.unshippedQuantity > 0
              const classes = ['unshipped-text', 'text-red']
              if (hasUnshipped) classes.push('has-unshipped')
              return [
                h('span', { class: classes.join(' ') }, row.unshippedQuantity || 0)
              ]
            }
          }
        }
      ]
    },
    // 交期信息分组
    {
      title: '交期信息',
      children: [
        { 
          field: 'deliveryPlan', 
          title: '交货计划', 
          width: 110,
          editRender: { 
            name: 'input',
            attrs: { type: 'date' }
          }
        },
        { 
          field: 'pmcDeliveryDate', 
          title: 'PMC可达成交期', 
          width: 130,
          editRender: { 
            name: 'input',
            attrs: { type: 'date' }
          }
        }
      ]
    },
    { 
      field: 'deliveryChangeLog', 
      title: '交期变更履历', 
      width: 200,
      editRender: { 
        name: '$modal',
        props: {
          type: 'modal'
        }
      },
      slots: {
        default: ({ row }) => {
          const html = row.deliveryChangeLog || '-'
          
          return [
            h('div', { 
              class: 'rich-text-cell clickable-cell',
              style: { 
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: '1.6',
                padding: '4px 0',
                cursor: 'pointer'
              },
              innerHTML: html,
              onClick: () => {
                richTextDialog.row = row
                richTextDialog.field = 'deliveryChangeLog'
                richTextDialog.content = row.deliveryChangeLog || ''
                richTextDialog.readonly = !hasEditPermission.value
                richTextDialog.visible = true
              }
            })
          ]
        }
      }
    },
    // 客供物料情况分组
    {
      title: '客供物料情况',
      children: [
        { 
          field: 'customerMaterial', 
          title: '客供料', 
          width: 120,
          editRender: { name: 'input' }
        },
        { 
          field: 'customerMaterialArrival', 
          title: '到料时间', 
          width: 110,
          editRender: { name: 'input' }
        }
      ]
    },
    { 
      field: 'specialRemark', 
      title: '特殊备注', 
      width: 200,
      slots: {
        default: ({ row }) => {
          const html = row.specialRemark || '-'
          
          return [
            h('div', { 
              class: 'rich-text-cell clickable-cell',
              style: { 
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: '1.6',
                padding: '4px 0',
                cursor: 'pointer'
              },
              innerHTML: html,
              onClick: () => {
                richTextDialog.row = row
                richTextDialog.field = 'specialRemark'
                richTextDialog.content = row.specialRemark || ''
                richTextDialog.readonly = !hasEditPermission.value
                richTextDialog.visible = true
              }
            })
          ]
        }
      }
    },
    { 
      field: 'orderDays', 
      title: '订单已耗时(天)', 
      width: 120,
      slots: {
        default: ({ row }) => {
          const isWarning = row.orderDays > 60
          const classes = ['days-text']
          if (isWarning) classes.push('warning-days')
          return [
            h('span', { class: classes.join(' ') }, row.orderDays || 0)
          ]
        }
      }
    }
  ],
  data: []
})

// 将可见列拍平成叶子列
function getLeafColumns() {
  const $grid = gridRef.value
  if (!$grid || !$grid.getTableColumn) return []
  
  // 使用 VXE Table 的 API 获取可见列配置
  const { visibleColumn = [] } = $grid.getTableColumn()
  
  // 递归提取所有叶子列（没有 children 的列）
  function extractLeafColumns(columns) {
    const leaves = []
    for (const col of columns) {
      if (col.children && col.children.length > 0) {
        // 有子列，递归处理
        leaves.push(...extractLeafColumns(col.children))
      } else if (col.visible !== false) {
        // 叶子列且可见
        leaves.push(col)
      }
    }
    return leaves
  }
  
  return extractLeafColumns(visibleColumn)
}

// 获取可见行数据
function getVisibleRows() {
  const $grid = gridRef.value
  if (!$grid || !$grid.getTableData) return []
  const { visibleData = [] } = $grid.getTableData()
  return visibleData
}

function getRowIdCandidates(row) {
  const ids = []
  if (row && row._X_ROW_KEY !== undefined) {
    ids.push(String(row._X_ROW_KEY), `row_${row._X_ROW_KEY}`)
  }
  if (row && row.id !== undefined) {
    ids.push(String(row.id), `row_${row.id}`)
  }
  return Array.from(new Set(ids))
}

// 解析当前鼠标所在单元格的行列索引
function getCellPosition(target) {
  const rows = getVisibleRows()
  if (!rows.length) {
    return { rowIndex: -1, cellIndex: -1 }
  }
  
  let cell = target
  while (cell && cell.tagName !== 'TD') {
    cell = cell.parentElement
  }
  if (!cell) return { rowIndex: -1, cellIndex: -1 }
  
  const colId = cell.getAttribute('colid')
  const rowId = cell.getAttribute('rowid') || cell.parentElement?.getAttribute('rowid')
  const cleanRowId = rowId ? rowId.replace(/^row_/, '') : ''
  
  const rowIndex = rows.findIndex(row => {
    const candidates = getRowIdCandidates(row)
    return candidates.includes(rowId) || (cleanRowId && candidates.includes(cleanRowId))
  })
  
  // 直接从 DOM 中获取该行的所有单元格，找到当前单元格的实际位置索引
  const row = cell.parentElement
  if (!row) return { rowIndex, cellIndex: -1, colId: '' }
  
  const allCells = Array.from(row.querySelectorAll('td[colid]'))
  const cellIndex = allCells.findIndex(c => c.getAttribute('colid') === colId)
  
  return { rowIndex, cellIndex, colId }
}

function hasValidSelection() {
  return selectionStart.rowIndex >= 0 && selectionEnd.rowIndex >= 0 && selectionStart.cellIndex >= 0 && selectionEnd.cellIndex >= 0
}

function resetSelectionState() {
  selectionStart.rowIndex = -1
  selectionStart.cellIndex = -1
  selectionStart.colId = ''
  selectionEnd.rowIndex = -1
  selectionEnd.cellIndex = -1
  selectionEnd.colId = ''
  selectedCells.value.clear()
}

function isEditableTarget(target) {
  if (!target) return false
  const tag = (target.tagName || '').toLowerCase()
  if (target.isContentEditable) return true
  return tag === 'input' || tag === 'textarea' || tag === 'select'
}

function bindKeydown() {
  unbindKeydown()
  keydownHandler = (event) => {
    if (isEditableTarget(event.target)) return
    const key = event.key?.toLowerCase?.()
    if (event.ctrlKey && key === 'c') {
      event.preventDefault()
      handleCopySelection()
    } else if (event.ctrlKey && key === 'v') {
      event.preventDefault()
      handlePasteSelection()
    } else if (event.ctrlKey && key === 'd') {
      event.preventDefault()
      handleFillDown()
    } else if (event.key === 'Delete') {
      event.preventDefault()
      handleClearSelection()
    }
  }
  document.addEventListener('keydown', keydownHandler)
}

function unbindKeydown() {
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
}

// 更新选中的单元格集合
function updateSelectedCells() {
  if (!hasValidSelection()) {
    selectedCells.value.clear()
    return
  }
  
  const rowStartIndex = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex)
  const rowEndIndex = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex)
  const colStartIndex = Math.min(selectionStart.cellIndex, selectionEnd.cellIndex)
  const colEndIndex = Math.max(selectionStart.cellIndex, selectionEnd.cellIndex)
  
  selectedCells.value.clear()
  
  for (let r = rowStartIndex; r <= rowEndIndex; r++) {
    for (let c = colStartIndex; c <= colEndIndex; c++) {
      selectedCells.value.add(`${r}-${c}`)
    }
  }
}

function handleMouseDown(event) {
  if (event.button !== 0) return
  const pos = getCellPosition(event.target)
  selectionStart.rowIndex = pos.rowIndex
  selectionStart.cellIndex = pos.cellIndex
  selectionStart.colId = pos.colId
  selectionEnd.rowIndex = pos.rowIndex
  selectionEnd.cellIndex = pos.cellIndex
  selectionEnd.colId = pos.colId
  isSelecting.value = pos.rowIndex >= 0 && pos.cellIndex >= 0
  if (isSelecting.value) {
    updateSelectedCells()
  }
}

function handleMouseMove(event) {
  if (!isSelecting.value || event.button !== 0) return
  const pos = getCellPosition(event.target)
  if (pos.rowIndex === -1 || pos.cellIndex === -1) return
  selectionEnd.rowIndex = pos.rowIndex
  selectionEnd.cellIndex = pos.cellIndex
  selectionEnd.colId = pos.colId
  updateSelectedCells()
}

function handleMouseUp(event) {
  if (event.button !== 0) return
  isSelecting.value = false
  applySelectionToCheckbox()
}

function handleDocumentMouseup() {
  if (isSelecting.value) {
    isSelecting.value = false
    applySelectionToCheckbox()
  }
}

function bindAreaSelection() {
  unbindAreaSelection()
  const $grid = gridRef.value
  if (!$grid) return
  const el = $grid.$el
  mainTbodyEl = el.querySelector('.vxe-table--main-wrapper table tbody')
  fixedTbodyEl = el.querySelector('.vxe-table--fixed-left-wrapper table tbody')

  if (mainTbodyEl) {
    mainTbodyEl.addEventListener('mousedown', handleMouseDown)
    mainTbodyEl.addEventListener('mousemove', handleMouseMove)
    mainTbodyEl.addEventListener('mouseup', handleMouseUp)
  }
  if (fixedTbodyEl) {
    fixedTbodyEl.addEventListener('mousedown', handleMouseDown)
    fixedTbodyEl.addEventListener('mousemove', handleMouseMove)
    fixedTbodyEl.addEventListener('mouseup', handleMouseUp)
  }
  document.addEventListener('mouseup', handleDocumentMouseup)
}

function unbindAreaSelection() {
  if (mainTbodyEl) {
    mainTbodyEl.removeEventListener('mousedown', handleMouseDown)
    mainTbodyEl.removeEventListener('mousemove', handleMouseMove)
    mainTbodyEl.removeEventListener('mouseup', handleMouseUp)
    mainTbodyEl = null
  }
  if (fixedTbodyEl) {
    fixedTbodyEl.removeEventListener('mousedown', handleMouseDown)
    fixedTbodyEl.removeEventListener('mousemove', handleMouseMove)
    fixedTbodyEl.removeEventListener('mouseup', handleMouseUp)
    fixedTbodyEl = null
  }
  document.removeEventListener('mouseup', handleDocumentMouseup)
}

function handleGridCellClick({ $event }) {
  if (isSelecting.value) return
  const pos = getCellPosition($event.target)
  selectionStart.rowIndex = pos.rowIndex
  selectionStart.cellIndex = pos.cellIndex
  selectionStart.colId = pos.colId
  selectionEnd.rowIndex = pos.rowIndex
  selectionEnd.cellIndex = pos.cellIndex
  selectionEnd.colId = pos.colId
  updateSelectedCells()
  applySelectionToCheckbox()
}

function getSelectionResult() {
  if (!hasValidSelection()) return { rows: [], columns: [], range: null }
  const rows = getVisibleRows()
  const columns = getLeafColumns()
  const rowStartIndex = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex)
  const rowEndIndex = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex)
  const colStartIndex = Math.min(selectionStart.cellIndex, selectionEnd.cellIndex)
  const colEndIndex = Math.max(selectionStart.cellIndex, selectionEnd.cellIndex)
  if (rowStartIndex < 0 || colStartIndex < 0) return { rows: [], columns: [], range: null }
  if (rowStartIndex >= rows.length || colStartIndex >= columns.length) return { rows: [], columns: [], range: null }
  const selectedRows = rows.slice(rowStartIndex, rowEndIndex + 1)
  const selectedColumns = columns.slice(colStartIndex, colEndIndex + 1)
  return {
    rows: selectedRows,
    columns: selectedColumns,
    range: {
      rows: [rowStartIndex, rowEndIndex],
      columns: [colStartIndex, colEndIndex]
    }
  }
}

function applySelectionToCheckbox() {
  const $grid = gridRef.value
  if (!$grid) return
  const { rows } = getSelectionResult()
  if ($grid.clearCheckboxRow) {
    $grid.clearCheckboxRow()
  }
  if (rows.length && $grid.setCheckboxRow) {
    $grid.setCheckboxRow(rows, true)
  }
  updateFooterInfo()
}

function handleCopySelection() {
  const result = getSelectionResult()
  if (!result.range) {
    uiMessage({ content: '请先选中区域再复制', status: 'warning' })
    return
  }
  const [rowStart, rowEnd] = result.range.rows
  const [colStart, colEnd] = result.range.columns
  const data = gridOptions.data
  const columns = getLeafColumns()
  const lines = []
  for (let r = rowStart; r <= rowEnd; r++) {
    const row = data[r]
    if (!row) continue
    const values = []
    for (let c = colStart; c <= colEnd; c++) {
      const col = columns[c]
      values.push(col ? (row[col.field] ?? '') : '')
    }
    lines.push(values.join('\t'))
  }
  const text = lines.join('\n')
  navigator.clipboard?.writeText(text).then(() => {
    uiMessage({ content: '已复制选区', status: 'success', duration: 1000 })
  }).catch(() => {
    uiMessage({ content: '复制失败，请检查浏览器权限', status: 'error' })
  })
}

async function handlePasteSelection() {
  const result = getSelectionResult()
  if (!result.range) {
    uiMessage({ content: '请先选中区域再粘贴', status: 'warning' })
    return
  }
  try {
    const text = await navigator.clipboard?.readText?.()
    if (!text) {
      uiMessage({ content: '剪贴板为空', status: 'warning' })
      return
    }
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const rowsData = cleanText.split('\n')
    const [rowStart] = result.range.rows
    const [colStart] = result.range.columns
    const columns = getLeafColumns()
    for (let i = 0; i < rowsData.length; i++) {
      const line = rowsData[i]
      if (!line && i === rowsData.length - 1) continue
      const targetRowIndex = rowStart + i
      if (targetRowIndex >= gridOptions.data.length) break
      const cells = line.split('\t')
      for (let j = 0; j < cells.length; j++) {
        const targetColIndex = colStart + j
        if (targetColIndex >= columns.length) break
        const col = columns[targetColIndex]
        if (!col || !col.field) continue
        gridOptions.data[targetRowIndex][col.field] = cells[j]
      }
    }
    uiMessage({ content: '已粘贴到选区', status: 'success', duration: 1000 })
  } catch (error) {
    console.error('Paste failed:', error)
    uiMessage({ content: '粘贴失败，请检查浏览器权限', status: 'error' })
  }
}

function handleClearSelection() {
  const result = getSelectionResult()
  if (!result.range) {
    uiMessage({ content: '请先选中区域再清空', status: 'warning' })
    return
  }
  const [rowStart, rowEnd] = result.range.rows
  const [colStart, colEnd] = result.range.columns
  const columns = getLeafColumns()
  for (let r = rowStart; r <= rowEnd; r++) {
    const row = gridOptions.data[r]
    if (!row) continue
    for (let c = colStart; c <= colEnd; c++) {
      const col = columns[c]
      if (!col || !col.field) continue
      row[col.field] = ''
    }
  }
  uiMessage({ content: '选区已清空', status: 'success', duration: 1000 })
}

function handleFillDown() {
  const result = getSelectionResult()
  if (!result.range) {
    uiMessage({ content: '请先选中区域再填充', status: 'warning' })
    return
  }
  const [rowStart, rowEnd] = result.range.rows
  const [colStart, colEnd] = result.range.columns
  const columns = getLeafColumns()
  const baseRow = gridOptions.data[rowStart]
  if (!baseRow) return
  for (let r = rowStart + 1; r <= rowEnd; r++) {
    const row = gridOptions.data[r]
    if (!row) continue
    for (let c = colStart; c <= colEnd; c++) {
      const col = columns[c]
      if (!col || !col.field) continue
      row[col.field] = baseRow[col.field]
    }
  }
  uiMessage({ content: '已向下填充', status: 'success', duration: 1000 })
}

function normalizeRange() {
  return {
    r1: Math.min(selectionStart.rowIndex, selectionEnd.rowIndex),
    r2: Math.max(selectionStart.rowIndex, selectionEnd.rowIndex),
    c1: Math.min(selectionStart.cellIndex, selectionEnd.cellIndex),
    c2: Math.max(selectionStart.cellIndex, selectionEnd.cellIndex)
  }
}

function cellClassName({ rowIndex, columnIndex }) {
  const cellKey = `${rowIndex}-${columnIndex}`
  return selectedCells.value.has(cellKey) ? 'cell-selected' : ''
}

function handleSelectionInfo() {
  try {
    const result = getSelectionResult()
    if (!result || !result.range) {
      uiMessage({ content: '请先鼠标拖动选中区域', status: 'warning' })
      return
    }
    console.log('鼠标选中行:', result.rows)
    console.log('鼠标选中列:', result.columns)
    
    const rowCount = result.rows?.length || 0
    const colCount = result.columns?.length || 0
    
    uiMessage({
      content: `选中 ${rowCount} 行 / ${colCount} 列`,
      status: 'success',
      duration: 1500
    })
  } catch (error) {
    console.error('handleSelectionInfo 错误:', error)
    // 直接使用 ElMessage 作为后备
    ElMessage.error('获取选中信息失败: ' + error.message)
  }
}

// Grid 事件
const gridEvents = {
  cellClick: handleGridCellClick,
  // 编辑关闭
  editClosed({ row, column }) {
    console.log('编辑完成:', { row, column: column.field })
  },
  // 菜单点击事件
  async menuClick({ menu, row, column, $event }) {
    const $grid = gridRef.value
    console.log('菜单点击:', menu.code, { row, column })
    
    if (!$grid) return
    
    // 手动处理菜单事件（如果内置代码不工作）
    switch (menu.code) {
      case 'INSERT_AT_ROW':
        // 插入行
        await $grid.insertAt({}, row)
        uiMessage({ content: '已插入行', status: 'success' })
        break
        
      case 'DELETE_ROW':
        // 删除行
        const type = await uiConfirm('确定要删除这行吗？')
        if (type === 'confirm') {
          await $grid.remove(row)
          uiMessage({ content: '已删除', status: 'success' })
        }
        break
        
      case 'EXPORT_ALL':
        // 使用自定义导出（带样式）
        console.log('🚀 触发自定义导出')
        await handleExport()
        break
        
      case 'OPEN_FIND':
        // 打开查找
        await $grid.openFind()
        break
        
      case 'OPEN_REPLACE':
        // 打开替换
        await $grid.openReplace()
        break
        
      default:
        // 其他内置代码让 vxe-table 自动处理
        console.log('使用内置处理:', menu.code)
        break
    }
  }
}

// 更新底部统计信息（基于复选框选中）
const updateFooterInfo = () => {
  const $grid = gridRef.value
  if ($grid && $grid.getCheckboxRecords) {
    const rows = $grid.getCheckboxRecords()
    countText.value = rows.length > 0 ? `已选择 ${rows.length} 行` : ''
  }
}

// 加载数据
const loadData = async () => {
  gridOptions.loading = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000,
      customerName: searchForm.customerName || undefined,
      configModel: searchForm.configModel || undefined,
      customerOrderNo: searchForm.customerOrderNo || undefined,
      u8OrderNo: searchForm.u8OrderNo || undefined
    }
    const res = await getShipmentOrderList(params)
    if (res && res.code === 200) {
      gridOptions.data = res.data?.list || []
      console.log('✅ 数据加载成功:', gridOptions.data.length, '条')
    }
  } catch (error) {
    console.error('❌ 加载数据失败:', error)
    uiMessage({ content: '加载数据失败', status: 'error' })
  } finally {
    gridOptions.loading = false
  }
}

// 搜索
const handleSearch = () => {
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    customerName: '',
    configModel: '',
    customerOrderNo: '',
    u8OrderNo: ''
  })
  loadData()
}

// HTML 转纯文本的辅助函数
const htmlToText = (html) => {
  if (!html) return ''
  // 创建临时 div 元素
  const temp = document.createElement('div')
  temp.innerHTML = html
  // 获取纯文本，保留换行
  let text = temp.textContent || temp.innerText || ''
  // 清理多余的空白
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

// 导出Excel - 带样式导出
const handleExport = async () => {
  const $grid = gridRef.value
  if (!$grid) return
  
  try {
    // 动态导入 ExcelJS
    const ExcelJS = await import('exceljs')
    const { saveAs } = await import('file-saver')
    
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('订单列表')
    
    // 获取列配置和数据
    const columns = gridOptions.columns.filter(col => col.field && col.type !== 'checkbox' && col.type !== 'seq')
    const data = gridOptions.data
    
    // 添加表头
    const headerRow = worksheet.addRow(columns.map(col => col.title))
    headerRow.font = { bold: true }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F7FF' }
    }
    
    // 添加数据并应用样式
    data.forEach(row => {
      const rowData = columns.map(col => {
        let value = row[col.field]
        
        // 处理布尔值
        if (value === true) return '是'
        if (value === false) return '否'
        if (value === null || value === undefined) return ''
        
        // 如果是富文本字段，转换为纯文本
        if (col.field === 'deliveryChangeLog' || col.field === 'specialRemark') {
          // 检查是否包含 HTML 标签
          if (typeof value === 'string' && (value.includes('<') || value.includes('>'))) {
            value = htmlToText(value)
          }
        }
        
        return value
      })
      
      const excelRow = worksheet.addRow(rowData)
      
      // 应用单元格样式
      columns.forEach((col, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1)
        const text = String(row[col.field] || '')
        
        // 设置换行
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        }
        
        // 根据字段和内容设置颜色
        if (col.field === 'deliveryChangeLog' || col.field === 'specialRemark') {
          if (text.includes('重要') || text.includes('紧急') || text.includes('优先')) {
            cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
          } else if (text.includes('注意') || text.includes('关注') || text.includes('延期')) {
            cell.font = { color: { argb: 'FFE6A23C' } }
          }
        } else if (col.field === 'etreeBomAudited') {
          if (text === '已审核') {
            cell.font = { color: { argb: 'FF67C23A' } }
          } else if (text === '有遗留') {
            cell.font = { color: { argb: 'FFE6A23C' } }
          }
        } else if (col.field === 'unshippedQuantity' && row.unshippedQuantity > 0) {
          cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
        } else if (col.field === 'orderDays' && row.orderDays > 60) {
          cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
        }
        
        // 添加边框
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })
    
    // 设置列宽
    columns.forEach((col, index) => {
      worksheet.getColumn(index + 1).width = (col.width || 120) / 8
    })
    
    // 导出文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const timestamp = new Date().toISOString().split('T')[0]
    saveAs(blob, `出货订单_${timestamp}.xlsx`)
    
    uiMessage({ content: '导出成功', status: 'success' })
  } catch (error) {
    console.error('❌ 导出失败:', error)
    uiMessage({ content: `导出失败: ${error.message}`, status: 'error' })
  }
}

// 快速导出 - 使用自定义导出（带样式）
const handleQuickExport = async () => {
  // 直接调用高级导出
  await handleExport()
}

// 测试导出 - 使用自定义导出（带样式）
const testExport = async () => {
  await handleExport()
}

// 新增
const handleAdd = async () => {
  const $grid = gridRef.value
  if ($grid) {
    const newRow = {
      customerName: '',
      u8OrderNo: '',
      u8Available: false,
      bomCode: '',
      etreeBomBefore: '',
      etreeBomAfter: '',
      etreeBomAudited: '未审核',
      configModel: '',
      keyModel: '',
      customerOrderNo: '',
      etreeOrderNo: '',
      orderDate: new Date().toISOString().split('T')[0],
      orderQuantity: 0,
      shippedQuantity: 0,
      unshippedQuantity: 0,
      deliveryPlan: '',
      pmcDeliveryDate: '',
      deliveryChangeLog: '',
      customerMaterial: '',
      customerMaterialArrival: '',
      specialRemark: '',
      orderDays: 0
    }
    const { row } = await $grid.insert(newRow)
    await $grid.setEditCell(row, 'customerName')
  }
}

// 保存
const handleSave = async () => {
  const $grid = gridRef.value
  if ($grid) {
    const { insertRecords, updateRecords, removeRecords } = $grid.getRecordset()
    
    console.log('待保存数据:', {
      新增: insertRecords,
      修改: updateRecords,
      删除: removeRecords
    })
    
    uiMessage({
      content: `新增 ${insertRecords.length} 条，修改 ${updateRecords.length} 条，删除 ${removeRecords.length} 条`,
      status: 'success'
    })
  }
}

// 保存富文本编辑
const handleRichTextSave = () => {
  if (richTextDialog.row && richTextDialog.field) {
    richTextDialog.row[richTextDialog.field] = richTextDialog.content
    richTextDialog.visible = false
    
    // 标记行为已修改
    const $grid = gridRef.value
    if ($grid) {
      $grid.setActiveRow(richTextDialog.row)
    }
  }
}

// 删除选中
const handleDeleteSelected = async () => {
  const $grid = gridRef.value
  if ($grid) {
    const rows = $grid.getCheckboxRecords?.() || []
    if (rows.length > 0) {
      const type = await uiConfirm('确定要删除选中的行吗？')
      if (type === 'confirm') {
        await $grid.remove(rows)
        uiMessage({ content: `已删除 ${rows.length} 行`, status: 'success' })
      }
    } else {
      uiMessage({ content: '请先选择要删除的行', status: 'warning' })
    }
  }
}

onMounted(() => {
  loadData()
  nextTick(() => {
    bindAreaSelection()
    bindKeydown()
  })
  console.log('📊 Excel 风格页面已加载')
})

onBeforeUnmount(() => {
  unbindAreaSelection()
  unbindKeydown()
})

watch(
  () => gridOptions.data,
  () => {
    nextTick(() => {
      bindAreaSelection()
      resetSelectionState()
      updateFooterInfo()
    })
  }
)
</script>

<style scoped lang="scss">
.shipment-order-excel {
  padding: 10px;
  background: #f5f7fa;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-wrapper {
  background: #fff;
  border-radius: 4px;
  
  .el-form {
    margin-bottom: 10px;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.table-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 10px;
  overflow: hidden;
}

.footer-info {
  padding: 8px 12px;
  background: #f5f7fa;
  border-top: 1px solid #dcdfe6;
  font-size: 13px;
  color: #606266;
}

// 订单编号链接样式
:deep(.order-no-link) {
  color: #409EFF;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #66b1ff;
  }
}

// 型号文本样式
:deep(.model-text) {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

// 数量文本样式
:deep(.quantity-text) {
  font-weight: 600;
  color: #303133;
  
  &.text-green {
    color: #67C23A;
  }
}

:deep(.shipped-text) {
  color: #67C23A !important;
  font-weight: 500;
}

:deep(.unshipped-text) {
  color: #F56C6C !important;
  font-weight: 500;
  
  &.has-unshipped {
    color: #F56C6C !important;
    font-weight: 600;
  }
  
  &.text-red {
    color: #F56C6C !important;
  }
}

// 富文本单元格样式
:deep(.rich-text-cell) {
  p {
    margin: 0;
    padding: 2px 0;
  }
  
  strong {
    font-weight: 600;
  }
  
  em {
    font-style: italic;
  }
  
  u {
    text-decoration: underline;
  }
  
  s {
    text-decoration: line-through;
  }
  
  ul, ol {
    margin: 4px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 2px 0;
  }
  
  &.clickable-cell {
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}

// 富文本对话框样式
.rich-text-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    background: #f5f7fa;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  .dialog-content {
    padding: 20px;
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
  }
  
  .readonly-content {
    .rich-text-display {
      padding: 15px;
      background: #fafafa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      min-height: 260px;
      line-height: 1.8;
      color: #606266;
      
      :deep(p) {
        margin: 0;
        padding: 4px 0;
      }
      
      :deep(strong) {
        font-weight: 600;
      }
      
      :deep(em) {
        font-style: italic;
      }
      
      :deep(u) {
        text-decoration: underline;
      }
      
      :deep(s) {
        text-decoration: line-through;
      }
      
      :deep(ul), :deep(ol) {
        margin: 8px 0;
        padding-left: 24px;
      }
      
      :deep(li) {
        margin: 4px 0;
      }
    }
  }
  
  :deep(.el-dialog__footer) {
    padding: 12px 20px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

// 天数文本样式
:deep(.days-text) {
  color: #606266;
  
  &.warning-days {
    color: #F56C6C;
    font-weight: 600;
  }
}

// 多行文本单元格样式（支持换行和颜色）
:deep(.multiline-cell) {
  max-height: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: left;
  line-height: 1.5;
  padding: 4px 8px;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap; // 保留换行符
  display: block;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

:deep(.vxe-grid) {
  user-select: none;
}

// 选中单元格样式
:deep(.cell-selected) {
  background: rgba(64, 158, 255, 0.15) !important;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid #409eff;
    pointer-events: none;
    z-index: 1;
  }
}
</style>

<style>
/* 确保区域选择样式可见 */
.vxe-table--area-selection-area {
  border: 2px solid #409eff !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}

.vxe-table--area-selection-corner {
  background-color: #409eff !important;
  border: 1px solid #fff !important;
}

.vxe-table--area-selection-copy {
  border: 2px dashed #67c23a !important;
}

/* 选中的行列状态 */
.vxe-table--area-selection-row-active,
.vxe-table--area-selection-column-active {
  background-color: rgba(64, 158, 255, 0.05) !important;
}

/* 隐藏表头的排序和筛选图标 */
.vxe-cell--sort,
.vxe-cell--filter,
.vxe-sort--asc-btn,
.vxe-sort--desc-btn,
.vxe-filter--btn {
  display: none !important;
}

.vxe-header--column .vxe-cell--sort-wrapper,
.vxe-header--column .vxe-cell--filter-wrapper {
  display: none !important;
}

/* 隐藏表头右侧的图标 */
.vxe-header--column .vxe-cell--icon {
  display: none !important;
}

/* 显示编辑状态图标 - 已启用 */
/* 如果不想显示编辑图标，可以取消下面的注释 */
/*
.vxe-cell--edit-icon,
.vxe-cell--valid-error,
.vxe-cell--edit-status {
  display: none !important;
}
*/

/* 表头文字居中 */
.vxe-header--column .vxe-cell,
.vxe-header--column .vxe-cell--title {
  text-align: center !important;
  justify-content: center !important;
}

.vxe-table--header .vxe-header--column {
  text-align: center !important;
}

.vxe-table .vxe-header--column .vxe-cell {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 表格内容居中 */
.vxe-table .vxe-body--column .vxe-cell {
  text-align: center !important;
  justify-content: center !important;
}

/* 多行文本单元格保持左对齐 */
.vxe-table .vxe-body--column .vxe-cell .multiline-cell {
  text-align: left !important;
}
</style>
