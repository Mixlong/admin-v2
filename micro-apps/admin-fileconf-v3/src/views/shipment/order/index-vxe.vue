<template>
  <div class="app-container shipment-order-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="配置型号">
          <el-input
            v-model="searchForm.configModel"
            placeholder="请输入配置型号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="客户订单号">
          <el-input
            v-model="searchForm.customerOrderNo"
            placeholder="请输入客户订单号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="U8单号">
          <el-input
            v-model="searchForm.u8OrderNo"
            placeholder="请输入U8单号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增订单
        </el-button>
        <el-button type="warning" size="small" @click="handleExport">
          <el-icon><Download /></el-icon> 导出Excel
        </el-button>
      </div>
    </div>

    <!-- VXE Table 数据表格 -->
    <div class="table-wrapper">
      <div v-loading="loading">
        <vxe-table
          ref="xTable"
          :key="tableKey"
          :data="tableData"
          border
          resizable
          show-overflow
          :height="tableHeight"
          :column-config="{ resizable: true }"
          :scroll-y="{ enabled: true }"
          :edit-config="{ trigger: 'dblclick', mode: 'cell' }"
          @edit-closed="handleEditClosed"
        >
          <vxe-column type="seq" title="序号" width="60" align="center" fixed="left"></vxe-column>

          <!-- 客户名称 - 必显列 -->
          <vxe-column
            field="customerName"
            title="客户名称"
            width="140"
            fixed="left"
            align="center"
          ></vxe-column>

          <!-- U8单号 -->
          <vxe-column
            v-if="isColumnVisible('u8OrderNo')"
            field="u8OrderNo"
            title="U8单号"
            width="160"
            align="center"
          >
            <template #default="{ row }">
              <span class="order-no-link">{{ row.u8OrderNo || '-' }}</span>
            </template>
          </vxe-column>

          <!-- U8是否可用 -->
          <vxe-column
            v-if="isColumnVisible('u8Available')"
            field="u8Available"
            title="U8是否可用"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <el-tag v-if="row.u8Available" type="success" size="small">可用</el-tag>
              <el-tag v-else type="info" size="small">不可用</el-tag>
            </template>
          </vxe-column>

          <!-- BOM编码 -->
          <vxe-column
            v-if="isColumnVisible('bomCode')"
            field="bomCode"
            title="BOM编码"
            width="160"
            align="center"
          ></vxe-column>

          <!-- BOM信息 -->
          <vxe-column
            v-if="isColumnVisible('etreeBomBefore')"
            field="etreeBomBefore"
            title="E树BOM刷新前"
            width="140"
            align="center"
          ></vxe-column>

          <vxe-column
            v-if="isColumnVisible('etreeBomAfter')"
            field="etreeBomAfter"
            title="E树BOM刷新后"
            width="140"
            align="center"
          ></vxe-column>

          <vxe-column
            v-if="isColumnVisible('etreeBomAudited')"
            field="etreeBomAudited"
            title="E树BOM审核"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag v-if="row.etreeBomAudited === '已审核'" type="success" size="small"
                >已审核</el-tag
              >
              <el-tag v-else-if="row.etreeBomAudited === '有遗留'" type="warning" size="small"
                >有遗留</el-tag
              >
              <el-tag v-else-if="row.etreeBomAudited === '未审核'" type="info" size="small"
                >未审核</el-tag
              >
              <span v-else>-</span>
            </template>
          </vxe-column>

          <!-- 配置型号 - 可编辑 -->
          <vxe-column
            v-if="isColumnVisible('configModel')"
            field="configModel"
            title="配置型号"
            width="160"
            align="center"
            :edit-render="{ name: 'input' }"
          >
            <template #default="{ row }">
              <span class="model-text">{{ row.configModel || '-' }}</span>
            </template>
          </vxe-column>

          <!-- 按键型号 - 可编辑 -->
          <vxe-column
            v-if="isColumnVisible('keyModel')"
            field="keyModel"
            title="按键型号"
            width="140"
            align="center"
            :edit-render="{ name: 'input' }"
          ></vxe-column>

          <!-- 客户订单号 -->
          <vxe-column
            v-if="isColumnVisible('customerOrderNo')"
            field="customerOrderNo"
            title="客户订单号"
            width="160"
            align="center"
          ></vxe-column>

          <!-- E树订单号 -->
          <vxe-column
            v-if="isColumnVisible('etreeOrderNo')"
            field="etreeOrderNo"
            title="E树订单号"
            width="160"
            align="center"
          ></vxe-column>

          <!-- 上单时间 -->
          <vxe-column
            v-if="isColumnVisible('orderDate')"
            field="orderDate"
            title="上单时间"
            width="110"
            align="center"
          ></vxe-column>

          <!-- 数量信息分组 -->
          <vxe-colgroup
            v-if="
              isColumnVisible('orderQuantity') ||
              isColumnVisible('shippedQuantity') ||
              isColumnVisible('unshippedQuantity')
            "
            title="数量信息"
            align="center"
          >
            <vxe-column
              v-if="isColumnVisible('orderQuantity')"
              field="orderQuantity"
              title="订单数量"
              width="100"
              align="center"
              :edit-render="{ name: 'input', attrs: { type: 'number' } }"
            >
              <template #default="{ row }">
                <span class="quantity-text text-green">{{ row.orderQuantity || 0 }}</span>
              </template>
            </vxe-column>

            <vxe-column
              v-if="isColumnVisible('shippedQuantity')"
              field="shippedQuantity"
              title="已发货量"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span class="shipped-text">{{ row.shippedQuantity || 0 }}</span>
              </template>
            </vxe-column>

            <vxe-column
              v-if="isColumnVisible('unshippedQuantity')"
              field="unshippedQuantity"
              title="未发货量"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span
                  class="unshipped-text text-red"
                  :class="{ 'has-unshipped': row.unshippedQuantity > 0 }"
                >
                  {{ row.unshippedQuantity || 0 }}
                </span>
              </template>
            </vxe-column>
          </vxe-colgroup>

          <!-- 交期信息分组 -->
          <vxe-colgroup
            v-if="isColumnVisible('deliveryPlan') || isColumnVisible('pmcDeliveryDate')"
            title="交期信息"
            align="center"
          >
            <vxe-column
              v-if="isColumnVisible('deliveryPlan')"
              field="deliveryPlan"
              title="交货计划"
              width="110"
              align="center"
            ></vxe-column>

            <vxe-column
              v-if="isColumnVisible('pmcDeliveryDate')"
              field="pmcDeliveryDate"
              title="PMC可达成交期"
              width="130"
              align="center"
            ></vxe-column>
          </vxe-colgroup>

          <!-- 交期变更履历 -->
          <vxe-column
            v-if="isColumnVisible('deliveryChangeLog')"
            field="deliveryChangeLog"
            title="交期变更履历"
            min-width="200"
            align="left"
          >
            <template #default="{ row }">
              <div
                v-if="row.deliveryChangeLog"
                class="rich-text-cell"
                v-html="row.deliveryChangeLog"
              ></div>
              <span v-else>-</span>
            </template>
          </vxe-column>

          <!-- 客供物料情况分组 -->
          <vxe-colgroup
            v-if="isColumnVisible('customerMaterial') || isColumnVisible('customerMaterialArrival')"
            title="客供物料情况"
            align="center"
          >
            <vxe-column
              v-if="isColumnVisible('customerMaterial')"
              field="customerMaterial"
              title="客供料"
              width="120"
              align="center"
            ></vxe-column>

            <vxe-column
              v-if="isColumnVisible('customerMaterialArrival')"
              field="customerMaterialArrival"
              title="到料时间"
              width="110"
              align="center"
            >
              <template #default="{ row }">
                <span
                  v-if="
                    Array.isArray(row.customerMaterialArrival) &&
                    row.customerMaterialArrival.length > 0
                  "
                >
                  {{ row.customerMaterialArrival.join('、') }}
                </span>
                <span v-else>{{ row.customerMaterialArrival || '-' }}</span>
              </template>
            </vxe-column>
          </vxe-colgroup>

          <!-- 特殊备注 -->
          <vxe-column
            v-if="isColumnVisible('specialRemark')"
            field="specialRemark"
            title="特殊备注"
            min-width="200"
            align="left"
          >
            <template #default="{ row }">
              <div v-if="row.specialRemark" class="rich-text-cell" v-html="row.specialRemark"></div>
              <span v-else>-</span>
            </template>
          </vxe-column>

          <!-- 订单已耗时 -->
          <vxe-column
            v-if="isColumnVisible('orderDays')"
            field="orderDays"
            title="订单已耗时(天)"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <span class="days-text" :class="{ 'warning-days': row.orderDays > 60 }">
                {{ row.orderDays || 0 }}
              </span>
            </template>
          </vxe-column>

          <!-- 操作列 -->
          <vxe-column title="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top" :enterable="false">
                <el-button
                  v-hasPermi="['shipment:order:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="icon-btn"
                  circle
                  @click="handleEdit(row)"
                ></el-button>
              </el-tooltip>
              <el-tooltip
                v-if="checkRole(['ms', 'sale_manager', 'admin'])"
                content="复制"
                placement="top"
                :enterable="false"
              >
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-document-copy"
                  class="icon-btn"
                  circle
                  style="color: #409eff"
                  @click="handleCopy(row)"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :enterable="false">
                <el-button
                  v-hasPermi="['shipment:order:remove']"
                  size="small"
                  type="text"
                  class="text-red icon-btn"
                  icon="el-icon-delete"
                  circle
                  @click="handleDelete(row)"
                ></el-button>
              </el-tooltip>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-wrapper flex" style="margin-top: 10px; justify-content: flex-end">
      <el-pagination
        :current-page="pagination.current"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>

    <!-- 保存方案对话框 -->
    <el-dialog
      v-model="saveSchemeDialogVisible"
      title="保存列显示方案"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="{ schemeName }" label-width="100px">
        <el-form-item label="方案名称" required>
          <el-input
            v-model="schemeName"
            placeholder="请输入方案名称"
            maxlength="20"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="saveSchemeDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCustomScheme">保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Setting, Search, Refresh } from '@element-plus/icons-vue'
// ========== 临时使用 Mock 数据，后续对接真实接口后删除 .mock 即可 ==========
import {
  getShipmentOrderList,
  deleteShipmentOrder,
  getCustomerDict,
  getOrderStatusDict,
  exportShipmentOrder
} from '@/api/shipment/order.mock'
// ========== Mock 数据使用结束 ==========

// ========== 响应式数据 ==========
const xTable = ref(null)
const tableKey = ref(0)

// 模拟角色（仅用于测试）
const mockRole = ref('ms')
const mockRoles = ref(['ms'])

// 列显示控制
const columnDisplayMode = ref('mode1')
const visibleColumns = ref([
  'customerName',
  'u8OrderNo',
  'u8Available',
  'bomCode',
  'etreeBomAudited',
  'configModel',
  'keyModel',
  'customerOrderNo',
  'etreeOrderNo',
  'orderDate',
  'orderQuantity',
  'shippedQuantity',
  'unshippedQuantity',
  'deliveryPlan',
  'pmcDeliveryDate',
  'deliveryChangeLog',
  'customerMaterial',
  'customerMaterialArrival',
  'specialRemark',
  'orderDays'
])

// 保存方案相关
const saveSchemeDialogVisible = ref(false)
const schemeName = ref('')
const customSchemes = ref({})

// 预设模式配置
const columnModes = {
  mode1: {
    name: '主模式',
    columns: [
      'customerName',
      'u8OrderNo',
      'u8Available',
      'bomCode',
      'etreeBomAudited',
      'configModel',
      'keyModel',
      'customerOrderNo',
      'etreeOrderNo',
      'orderDate',
      'orderQuantity',
      'shippedQuantity',
      'unshippedQuantity',
      'deliveryPlan',
      'pmcDeliveryDate',
      'deliveryChangeLog',
      'customerMaterial',
      'customerMaterialArrival',
      'specialRemark',
      'orderDays'
    ]
  }
}

const allColumns = [
  { field: 'customerName', title: '客户名称', fixed: true },
  { field: 'u8OrderNo', title: 'U8单号', fixed: false },
  { field: 'u8Available', title: 'U8是否可用', fixed: false },
  { field: 'bomCode', title: 'BOM编码', fixed: false },
  { field: 'etreeBomBefore', title: 'E树BOM刷新前', fixed: false },
  { field: 'etreeBomAfter', title: 'E树BOM刷新后', fixed: false },
  { field: 'etreeBomAudited', title: 'E树BOM是否审核', fixed: false },
  { field: 'configModel', title: '配置型号', fixed: false },
  { field: 'keyModel', title: '按键型号', fixed: false },
  { field: 'customerOrderNo', title: '客户订单号', fixed: false },
  { field: 'etreeOrderNo', title: 'E树订单号', fixed: false },
  { field: 'orderDate', title: '上单时间', fixed: false },
  { field: 'orderQuantity', title: '订单数量', fixed: false },
  { field: 'shippedQuantity', title: '已发货量', fixed: false },
  { field: 'unshippedQuantity', title: '未发货量', fixed: false },
  { field: 'deliveryPlan', title: '交货计划', fixed: false },
  { field: 'pmcDeliveryDate', title: 'PMC可达成交期', fixed: false },
  { field: 'deliveryChangeLog', title: '交期变更履历', fixed: false },
  { field: 'customerMaterial', title: '客供料', fixed: false },
  { field: 'customerMaterialArrival', title: '到料时间', fixed: false },
  { field: 'specialRemark', title: '特殊备注', fixed: false },
  { field: 'orderDays', title: '订单已耗时(天)', fixed: false }
]

// 搜索表单
const searchForm = reactive({
  customerName: '',
  configModel: '',
  customerOrderNo: '',
  u8OrderNo: '',
  bomCode: '',
  orderDate: null
})

// 搜索字段配置
const searchFields = [
  {
    key: 'customerName',
    label: '客户',
    component: 'custom',
    sort: 1
  },
  {
    key: 'configModel',
    label: '配置型号',
    component: 'el-input',
    placeholder: '请输入配置型号',
    sort: 2
  },
  {
    key: 'customerOrderNo',
    label: '客户订单号',
    component: 'el-input',
    placeholder: '请输入客户订单号',
    sort: 3
  },
  {
    key: 'u8OrderNo',
    label: 'U8单号',
    component: 'el-input',
    placeholder: '请输入U8单号',
    sort: 4
  },
  {
    key: 'bomCode',
    label: 'BOM编码',
    component: 'el-input',
    placeholder: '请输入BOM编码',
    sort: 5
  },
  {
    key: 'orderDate',
    label: '上单日期',
    component: 'el-date-picker',
    componentAttrs: {
      type: 'daterange',
      rangeSeparator: '至',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: 'yyyy-MM-dd'
    },
    sort: 6
  }
]

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 下拉选项
const customerOptions = ref([])
const statusOptions = ref([])

// 弹窗控制
const dialogVisible = ref(false)
const editData = ref(null)
const copyMode = ref(false)

// ========== 方法 ==========
// 计算表格高度
const tableHeight = ref(500)

// 更新表格高度
const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 250
}

// 监听窗口大小变化
if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateTableHeight)
}

// 获取列筛选选项
const getColumnFilters = columnField => {
  if (!tableData.value || tableData.value.length === 0) {
    return []
  }

  const values = tableData.value.map(row => row[columnField])
  const uniqueValues = [...new Set(values)]
  const emptyValues = uniqueValues.filter(v => v === null || v === undefined || v === '')
  const nonEmptyValues = uniqueValues.filter(v => v !== null && v !== undefined && v !== '')

  const filters = []
  nonEmptyValues.sort().forEach(value => {
    filters.push({ label: value, value: value })
  })

  if (emptyValues.length > 0) {
    filters.push({ label: '/', value: null })
  }

  return filters
}

// VXE Table 筛选变化处理
const handleFilterChange = ({ filters }) => {
  console.log('筛选变化:', filters)
  // 可以在这里实现远程筛选逻辑
}

// 从本地存储加载列配置
const loadColumnConfig = () => {
  const storageKey = 'shipment_order_column_config'
  const savedConfig = localStorage.getItem(storageKey)
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      if (config.mode) {
        columnDisplayMode.value = config.mode
      }

      if (config.mode === 'custom' && Array.isArray(config.columns) && config.columns.length > 0) {
        visibleColumns.value = config.columns
      } else if (config.mode && columnModes[config.mode]) {
        visibleColumns.value = [...columnModes[config.mode].columns]
      } else if (config.mode && customSchemes.value[config.mode]) {
        visibleColumns.value = [...customSchemes.value[config.mode].columns]
      }

      nextTick(() => {
        tableKey.value++
      })
    } catch (e) {
      console.error('加载列配置失败:', e)
    }
  }
}

// 保存列配置到本地存储
const saveColumnConfig = () => {
  const storageKey = 'shipment_order_column_config'
  try {
    const config = {
      mode: columnDisplayMode.value,
      columns: columnDisplayMode.value === 'custom' ? visibleColumns.value : []
    }
    localStorage.setItem(storageKey, JSON.stringify(config))
  } catch (e) {
    console.error('保存列配置失败:', e)
  }
}

// 处理模式切换
const handleModeChange = mode => {
  if (mode === 'mode1') {
    visibleColumns.value = [...columnModes[mode].columns]
  } else if (mode === 'custom') {
    visibleColumns.value = allColumns.map(col => col.field)
  } else if (customSchemes.value[mode]) {
    visibleColumns.value = [...customSchemes.value[mode].columns]
  }
  saveColumnConfig()
  tableKey.value++
  const modeName = getModeName(mode)
  ElMessage.success(`已切换到${modeName}`)
}

// 获取模式名称
const getModeName = mode => {
  if (mode === 'mode1') return '主模式'
  if (mode === 'custom') return '自定义模式'
  if (customSchemes.value[mode]) return customSchemes.value[mode].name
  return mode
}

// 打开保存方案对话框
const openSaveSchemeDialog = () => {
  if (columnDisplayMode.value !== 'custom') {
    ElMessage.warning('请先切换到自定义模式后再保存方案')
    return
  }
  schemeName.value = ''
  saveSchemeDialogVisible.value = true
}

// 保存自定义方案
const saveCustomScheme = () => {
  if (!schemeName.value.trim()) {
    ElMessage.error('请输入方案名称')
    return
  }

  const schemeKey = `custom_${Date.now()}`
  const scheme = {
    name: schemeName.value.trim(),
    columns: [...visibleColumns.value],
    createTime: new Date().toLocaleString()
  }

  customSchemes.value[schemeKey] = scheme
  saveCustomSchemesToStorage()
  saveSchemeDialogVisible.value = false
  columnDisplayMode.value = schemeKey
  saveColumnConfig()

  ElMessage.success(`方案 "${scheme.name}" 保存成功并已切换`)
}

// 保存自定义方案到本地存储
const saveCustomSchemesToStorage = () => {
  try {
    localStorage.setItem('shipment_order_custom_schemes', JSON.stringify(customSchemes.value))
  } catch (e) {
    console.error('保存自定义方案失败:', e)
  }
}

// 加载自定义方案
const loadCustomSchemesFromStorage = () => {
  try {
    const schemes = localStorage.getItem('shipment_order_custom_schemes')
    if (schemes) {
      customSchemes.value = JSON.parse(schemes)
    }
  } catch (e) {
    console.error('加载自定义方案失败:', e)
    customSchemes.value = {}
  }
}

// 删除自定义方案
const deleteCustomScheme = schemeKey => {
  ElMessageBox.confirm(`确定要删除方案 "${customSchemes.value[schemeKey].name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      delete customSchemes.value[schemeKey]
      saveCustomSchemesToStorage()

      if (columnDisplayMode.value === schemeKey) {
        handleModeChange('mode1')
      }

      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 列显示变化处理
const handleColumnChange = value => {
  columnDisplayMode.value = 'custom'
  saveColumnConfig()
  tableKey.value++
}

// 重置列显示
const resetColumns = () => {
  visibleColumns.value = allColumns.map(col => col.field)
  columnDisplayMode.value = 'custom'
  saveColumnConfig()
  tableKey.value++
  ElMessage.success('已重置为默认显示')
}

// dropdown 命令处理
const handleDropdownCommand = command => {
  // 空方法，防止点击菜单项关闭
}

// 判断列是否可见
const isColumnVisible = field => {
  return visibleColumns.value.includes(field)
}

// 检查角色
const checkRole = roles => {
  if (mockRoles.value && mockRoles.value.length > 0) {
    return roles.some(role => mockRoles.value.includes(role))
  }
  return true
}

// 切换角色
const handleRoleChange = role => {
  mockRoles.value = [role]
  ElMessage.success(`已切换到角色: ${getRoleName(role)}`)
}

// 获取角色名称
const getRoleName = roleKey => {
  const roleMap = {
    ms: '市场专员',
    BOM_Manage: 'BOM专员',
    pmc: 'PMC专员',
    admin: '超级管理员'
  }
  return roleMap[roleKey] || roleKey
}

// 加载下拉选项
const loadOptions = () => {
  loadCustomerOptions()
  loadStatusOptions()
}

// 加载客户选项
const loadCustomerOptions = () => {
  getCustomerDict().then(res => {
    if (res.code === 200) {
      customerOptions.value = res.data || []
    }
  })
}

// 加载状态选项
const loadStatusOptions = () => {
  getOrderStatusDict()
    .then(res => {
      if (res.code === 200) {
        statusOptions.value = res.data || []
      }
    })
    .catch(() => {
      ElMessage.error('获取状态数据失败')
    })
}

// 获取列表数据
const fetchData = () => {
  loading.value = true
  const params = {
    pageNum: pagination.current,
    pageSize: pagination.size,
    customerName: searchForm.customerName || undefined,
    configModel: searchForm.configModel || undefined,
    customerOrderNo: searchForm.customerOrderNo || undefined,
    u8OrderNo: searchForm.u8OrderNo || undefined,
    bomCode: searchForm.bomCode || undefined
  }

  if (searchForm.orderDate && searchForm.orderDate.length === 2) {
    params.startDate = searchForm.orderDate[0]
    params.endDate = searchForm.orderDate[1]
  }

  console.log('📡 开始获取数据，参数:', params)

  getShipmentOrderList(params)
    .then(res => {
      console.log('📦 API 返回结果:', res)
      if (res && res.code === 200) {
        tableData.value = res.data?.list || res.data?.rows || []
        pagination.total = res.data?.total || 0
        console.log('✅ 数据加载成功:', tableData.value.length, '条')
        console.log('📋 表格数据:', tableData.value)
      } else {
        ElMessage.error(res?.msg || '获取数据失败')
        tableData.value = []
        pagination.total = 0
      }
    })
    .catch(error => {
      console.error('❌ 获取未出货订单列表失败:', error)
      ElMessage.error('获取数据失败')
      tableData.value = []
      pagination.total = 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索功能
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    customerName: '',
    configModel: '',
    customerOrderNo: '',
    u8OrderNo: '',
    bomCode: '',
    orderDate: null
  })
  pagination.current = 1
  fetchData()
}

// 新增订单
const handleAdd = () => {
  editData.value = null
  copyMode.value = false
  dialogVisible.value = true
}

// 编辑订单
const handleEdit = row => {
  editData.value = { ...row }
  copyMode.value = false
  dialogVisible.value = true
}

// 复制订单
const handleCopy = row => {
  const copyData = { ...row }
  delete copyData.id
  editData.value = copyData
  copyMode.value = true
  dialogVisible.value = true
}

// 删除订单
const handleDelete = row => {
  ElMessageBox.confirm('确定要删除这条未出货订单记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteShipmentOrder([row.id])
        .then(res => {
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchData()
          } else {
            ElMessage.error(res.msg || '删除失败')
          }
        })
        .catch(error => {
          console.error('删除订单失败:', error)
          ElMessage.error('删除失败')
        })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 导出Excel
const handleExport = () => {
  ElMessageBox.confirm(`确定要导出当前${tableData.value.length}条订单数据吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      // 使用 VXE Table 的导出功能
      const $table = xTable.value
      if ($table) {
        $table.exportData({
          filename: `未出货订单_${formatDate(new Date())}`,
          type: 'xlsx',
          isHeader: true,
          isFooter: false
        })
        ElMessage.success('导出成功')
      }
    })
    .catch(() => {
      ElMessage.info('已取消导出')
    })
}

// 格式化日期
const formatDate = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hour}${minute}`
}

// 分页大小改变
const handleSizeChange = val => {
  pagination.size = val
  fetchData()
}

// 当前页改变
const handleCurrentChange = val => {
  pagination.current = val
  fetchData()
}

// 弹窗成功回调
const handleDialogSuccess = () => {
  fetchData()
}

// 单元格编辑完成处理
const handleEditClosed = ({ row, column }) => {
  console.log('单元格编辑完成:', { row, column: column.field, value: row[column.field] })
  // 这里可以调用 API 保存数据
  // updateShipmentOrder(row).then(() => {
  //   ElMessage.success('保存成功')
  // })
}

// ========== 生命周期 ==========
onMounted(() => {
  // 初始化表格高度
  updateTableHeight()

  loadCustomSchemesFromStorage()
  loadColumnConfig()
  fetchData()
  loadCustomerOptions()
  loadStatusOptions()

  console.log('📊 VXE Table 页面已加载')
})
</script>

<style lang="scss" scoped>
.shipment-order-container {
  .search-wrapper {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 10px;

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
    background: #fff;
    border-radius: 4px;
    margin-top: 10px;
  }

  .pagination-wrapper {
    margin-top: 25px;
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    display: flex;
    justify-content: flex-end;
  }

  // 订单编号链接样式
  .order-no-link {
    color: #409eff;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #66b1ff;
    }
  }

  // 型号文本样式
  .model-text {
    font-weight: 600;
    color: #303133;
    font-size: 13px;
  }

  // 数量文本样式
  .quantity-text {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .shipped-text {
    color: #67c23a !important;
    font-weight: 500;
  }

  .unshipped-text {
    color: #f56c6c !important;
    font-weight: 500;

    &.has-unshipped {
      color: #f56c6c !important;
      font-weight: 600;
    }
  }

  // 天数文本样式
  .days-text {
    color: #606266;

    &.warning-days {
      color: #f56c6c;
      font-weight: 600;
    }
  }

  // 富文本单元格样式
  .rich-text-cell {
    max-height: 80px !important;
    height: 80px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    text-align: left;
    line-height: 1.4;
    padding: 6px !important;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fafafa;
    word-wrap: break-word;
    word-break: break-all;
    display: block !important;

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

    ::v-deep {
      p {
        margin: 5px 0;
        line-height: 1.6;
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 5px 0;
        border-radius: 4px;
      }

      ul,
      ol {
        padding-left: 20px;
        margin: 5px 0;
      }

      strong {
        font-weight: 600;
      }

      em {
        font-style: italic;
      }
    }
  }

  // 删除按钮样式
  .text-red {
    color: #f56c6c;

    &:hover {
      color: #f78989;
    }
  }

  // 操作按钮图标样式
  .icon-btn {
    font-size: 14px;
    padding: 8px;

    i {
      font-size: 14px;
    }

    &:hover {
      transform: scale(1.1);
      transition: all 0.2s;
    }
  }
}
</style>

<style lang="scss">
// 全局样式（列设置下拉菜单挂载到 body，需要全局样式）
.column-setting-dropdown-menu {
  padding: 0 !important;
  min-width: 320px;
  max-width: 500px;
  max-height: 620px;

  .el-dropdown-menu__item {
    padding: 0 !important;
    line-height: normal !important;

    &:hover {
      background-color: transparent !important;
    }
  }

  .column-control-panel {
    padding: 12px 15px;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      span {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .mode-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 8px;
      padding-left: 2px;
    }

    .mode-selection {
      margin-bottom: 15px;

      .el-radio-group {
        display: flex;
        gap: 15px;

        .el-radio {
          margin-right: 0;
        }
      }
    }

    .saved-schemes {
      margin-bottom: 15px;

      .scheme-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .scheme-item {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          background-color: #fff;
          transition: all 0.2s;

          &:hover {
            background-color: #f5f7fa;
            border-color: #c0c4cc;
          }

          &.active {
            background-color: #ecf5ff;
            border-color: #409eff;
          }

          .el-radio {
            margin-right: 4px;

            .el-radio__label {
              font-size: 13px;
              padding-left: 6px;
            }
          }

          .delete-scheme-btn {
            opacity: 0;
            transition: opacity 0.2s;
            color: #f56c6c;
            padding: 2px 4px;
            margin-left: 4px;

            &:hover {
              color: #f56c6c;
              background-color: #fef0f0;
            }
          }

          &:hover .delete-scheme-btn {
            opacity: 1;
          }
        }
      }
    }

    .save-scheme-section {
      margin-bottom: 15px;
      padding-top: 10px;
      border-top: 1px solid #ebeef5;
    }

    .el-checkbox-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 12px;
      max-height: 550px;
      overflow-y: auto;
      padding: 5px;

      .el-checkbox {
        margin: 0 !important;
        white-space: nowrap;

        &.is-disabled {
          .el-checkbox__label {
            color: #909399;
            font-weight: 500;
          }

          .el-checkbox__input.is-disabled .el-checkbox__inner {
            background-color: #f5f7fa;
            border-color: #dcdfe6;
          }
        }

        .el-checkbox__label {
          font-size: 13px;
          padding-left: 8px;
        }
      }
    }
  }
}
</style>
