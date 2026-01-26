/**
 * 出货订单数据管理 Composable
 * 处理数据加载、分页、搜索、CRUD 等逻辑
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { getShipmentOrderList, saveShipmentOrder, deleteShipmentOrder } from '@/api/shipment/order'

export function useShipmentData() {
  // 搜索表单
  const searchForm = reactive({
    customerName: '',
    configModel: '',
    customerOrderNo: ''
  })

  // 分页配置
  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // 表格数据
  const tableData = ref([])

  // 加载状态
  const loading = ref(false)

  // 复制的行数据（用于新增时粘贴）
  const copiedRowData = ref(null)

  // 模拟数据（实际应从后端获取）
  const mockAllData = [
    {
      id: 1,
      customerName: '安乃达',
      customerOrderNo: '2509120008',
      u8OrderNo: 'E树SO250900051',
      orderDate: '2025-09-09',
      orderQty: 110,
      shippedQty: 110,
      unshippedQty: 0,
      deliveryDate: '2025-10-27',
      pmcDate: '2025-10-27',
      deliveryChangeLog:
        '<p><strong style="color:#F56C6C">重要：</strong>10/20：原交期10/18，延期至10/27</p>',
      customerMaterial: '/',
      customerMaterialArrival: '',
      specialRemark: '-',
      orderDays: 56
    },
    {
      id: 2,
      customerName: '安乃达',
      customerOrderNo: '2509120008修补件',
      u8OrderNo: 'E树SO250900052',
      orderDate: '2025-09-10',
      orderQty: 50,
      shippedQty: 20,
      unshippedQty: 30,
      deliveryDate: '2025-10-28',
      pmcDate: '2025-10-28',
      deliveryChangeLog: '-',
      customerMaterial: '客供料A',
      customerMaterialArrival: '2025-10-15',
      specialRemark: '<p><strong style="color:#F56C6C">紧急订单</strong></p>',
      orderDays: 55
    },
    {
      id: 3,
      customerName: '鑫堡',
      customerOrderNo: 'WSB25040777',
      u8OrderNo: 'E树SO250400054',
      orderDate: '2025-04-01',
      orderQty: 200,
      shippedQty: 200,
      unshippedQty: 0,
      deliveryDate: '2025-06-03',
      pmcDate: '2025-06-03',
      deliveryChangeLog:
        '<p><span style="color:#E6A23C">注意：</span>5/16调整【提前】：原交期6/10 修改为6/3</p>',
      customerMaterial: '/',
      customerMaterialArrival: '',
      specialRemark: '-',
      orderDays: 221
    },
    {
      id: 4,
      customerName: '鸿霖',
      customerOrderNo: 'H421-2503130033',
      u8OrderNo: 'E树SO250300042',
      orderDate: '2025-03-13',
      orderQty: 3200,
      shippedQty: 0,
      unshippedQty: 3200,
      deliveryDate: '2025-05-06',
      pmcDate: '2025-05-06',
      deliveryChangeLog: '<p>4/23 修改为5/6</p><p>3/31调整【延后】</p>',
      customerMaterial: '/',
      customerMaterialArrival: '',
      specialRemark: '<p><strong style="color:#F56C6C">重要客户，优先处理</strong></p>',
      orderDays: 240
    },
    {
      id: 5,
      customerName: '嘉宏',
      customerOrderNo: 'JH2502250015',
      u8OrderNo: 'E树SO250200025',
      orderDate: '2025-02-25',
      orderQty: 500,
      shippedQty: 100,
      unshippedQty: 400,
      deliveryDate: '2025-04-15',
      pmcDate: '2025-04-15',
      deliveryChangeLog: '-',
      customerMaterial: '客供料B',
      customerMaterialArrival: '2025-03-01',
      specialRemark: '嘉宏修补件订单',
      orderDays: 256
    },
    {
      id: 6,
      customerName: 'LIME',
      customerOrderNo: 'LIME-2511-001',
      u8OrderNo: 'E树SO251100001',
      orderDate: '2025-11-01',
      orderQty: 1000,
      shippedQty: 0,
      unshippedQty: 1000,
      deliveryDate: '2025-12-15',
      pmcDate: '2025-12-20',
      deliveryChangeLog: '-',
      customerMaterial: '/',
      customerMaterialArrival: '',
      specialRemark: '-',
      orderDays: 28
    },
    {
      id: 7,
      customerName: '喜德盛',
      customerOrderNo: 'XDS-2510-088',
      u8OrderNo: 'E树SO251000088',
      orderDate: '2025-10-15',
      orderQty: 800,
      shippedQty: 400,
      unshippedQty: 400,
      deliveryDate: '2025-11-30',
      pmcDate: '2025-11-28',
      deliveryChangeLog: '<p><span style="color:#67C23A">11/10：交期提前2天</span></p>',
      customerMaterial: '客供料C',
      customerMaterialArrival: '2025-10-20',
      specialRemark: '-',
      orderDays: 45
    },
    {
      id: 8,
      customerName: '银三环',
      customerOrderNo: 'YSH-2511-002',
      u8OrderNo: 'E树SO251100002',
      orderDate: '2025-11-05',
      orderQty: 600,
      shippedQty: 0,
      unshippedQty: 600,
      deliveryDate: '2025-12-25',
      pmcDate: '',
      deliveryChangeLog: '-',
      customerMaterial: '/',
      customerMaterialArrival: '',
      specialRemark: '<p><span style="color:#409EFF">新客户首单</span></p>',
      orderDays: 24
    }
  ]

  /**
   * 加载数据
   */
  const loadData = async () => {
    loading.value = true
    try {
      // TODO: 实际应该调用后端API
      // const res = await getShipmentOrderList({
      //   page: pagination.current,
      //   pageSize: pagination.size,
      //   ...searchForm
      // })

      // 模拟前端分页
      let filteredData = [...mockAllData]

      // 应用搜索条件
      if (searchForm.customerName) {
        filteredData = filteredData.filter(item =>
          item.customerName?.includes(searchForm.customerName)
        )
      }
      if (searchForm.configModel) {
        filteredData = filteredData.filter(item =>
          item.configModel?.includes(searchForm.configModel)
        )
      }
      if (searchForm.customerOrderNo) {
        filteredData = filteredData.filter(item =>
          item.customerOrderNo?.includes(searchForm.customerOrderNo)
        )
      }

      pagination.total = filteredData.length

      const start = (pagination.current - 1) * pagination.size
      const end = start + pagination.size
      const pageData = filteredData.slice(start, end)

      // 初始化原始值（用于变更检测）
      const { initOriginalValues } = await import('./useFieldControl')
      const monitorFields = [
        'u8OrderNo',
        'bomCode',
        'configModel',
        'keyModel',
        'customerOrderNo',
        'etreeOrderNo',
        'orderQty'
      ]

      pageData.forEach(row => {
        initOriginalValues(row, monitorFields)
      })

      tableData.value = pageData
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索
   */
  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  /**
   * 重置搜索
   */
  const handleReset = () => {
    searchForm.customerName = ''
    searchForm.configModel = ''
    searchForm.customerOrderNo = ''
    pagination.current = 1
    loadData()
  }

  /**
   * 分页大小变化
   */
  const handleSizeChange = size => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  /**
   * 当前页变化
   */
  const handleCurrentChange = current => {
    pagination.current = current
    loadData()
  }

  /**
   * 创建新行数据
   */
  const createNewRow = (copyData = null) => {
    const baseRow = {
      // 不生成模拟 ID，新增行没有 ID
      customerName: '',
      customerOrderNo: '',
      u8OrderNo: '',
      orderDate: new Date().toISOString().split('T')[0],
      orderQty: 0,
      shippedQty: 0,
      unshippedQty: 0,
      deliveryDate: '',
      pmcDate: '',
      deliveryChangeLog: '',
      customerMaterial: '',
      customerMaterialArrival: '',
      specialRemark: '',
      orderDays: 0,
      _isNew: true, // 标记为新增行
      _editedFields: {}
    }

    if (copyData) {
      return {
        ...baseRow,
        ...copyData,
        // 不生成模拟 ID
        id: undefined,
        orderDate: new Date().toISOString().split('T')[0],
        orderDays: 0,
        _isNew: true, // 标记为新增行
        _editedFields: {}
      }
    }

    return baseRow
  }

  /**
   * 新增行
   */
  const addRow = () => {
    const newRow = createNewRow(copiedRowData.value)
    tableData.value.unshift(newRow)

    if (copiedRowData.value) {
      ElMessage.success('已新增一行并粘贴复制的数据')
    } else {
      ElMessage.success('已新增一行')
    }

    return newRow
  }

  /**
   * 删除行
   */
  const deleteRows = async rowIds => {
    if (!rowIds || rowIds.length === 0) {
      ElMessage.warning('请先选择要删除的数据')
      return false
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${rowIds.length} 行吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const rowIdSet = new Set(rowIds.map(id => String(id)))
      tableData.value = tableData.value.filter(row => !rowIdSet.has(String(row.id)))
      ElMessage.success(`已删除 ${rowIds.length} 行`)
      return true
    } catch {
      return false
    }
  }

  /**
   * 保存数据
   */
  const saveData = async (insertRecords, updateRecords) => {
    if (insertRecords.length === 0 && updateRecords.length === 0) {
      ElMessage.warning('没有需要保存的数据')
      return false
    }

    try {
      // TODO: 调用API保存数据
      // await saveShipmentOrder({ insertRecords, updateRecords })

      ElMessage.success(
        `保存成功：新增 ${insertRecords.length} 条，修改 ${updateRecords.length} 条`
      )
      return true
    } catch (error) {
      ElMessage.error('保存失败')
      return false
    }
  }

  /**
   * 复制行数据
   */
  const copyRowData = rowData => {
    const data = { ...rowData }
    // 删除内部属性
    delete data.id
    delete data._X_ROW_KEY
    delete data._isNew
    delete data._editedFields
    copiedRowData.value = data
  }

  return {
    searchForm,
    pagination,
    tableData,
    loading,
    copiedRowData,
    loadData,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    createNewRow,
    addRow,
    deleteRows,
    saveData,
    copyRowData
  }
}
