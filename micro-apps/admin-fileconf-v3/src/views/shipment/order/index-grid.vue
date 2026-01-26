<template>
  <div class="app-container shipment-order-grid">
    <vxe-grid ref="gridRef" v-bind="gridOptions" v-on="gridEvents">
      <!-- 工具栏按钮 -->
      <template #toolbar_buttons>
        <vxe-button status="primary" icon="vxe-icon-add" @click="handleAdd">新增订单</vxe-button>
        <vxe-button status="success" icon="vxe-icon-save" @click="handleSave">保存修改</vxe-button>
        <vxe-button status="warning" icon="vxe-icon-download" @click="handleExport"
          >导出Excel</vxe-button
        >
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <vxe-button mode="text" status="primary" icon="vxe-icon-edit" @click="handleEdit(row)"
          >编辑</vxe-button
        >
        <vxe-button mode="text" status="error" icon="vxe-icon-delete" @click="handleDelete(row)"
          >删除</vxe-button
        >
      </template>
    </vxe-grid>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import VXETable from 'vxe-table'
const VxeUI = VXETable
import {
  getShipmentOrderList,
  deleteShipmentOrder,
  updateShipmentOrder
} from '@/api/shipment/order.mock'

const gridRef = ref()

// Grid 配置
const gridOptions = reactive({
  border: true,
  loading: false,
  stripe: true,
  showOverflow: true,
  height: 'auto',
  keepSource: true,
  columnConfig: {
    resizable: true
  },
  rowConfig: {
    useKey: true,
    isHover: true,
    keyField: 'id'
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar_buttons'
    }
  },
  editConfig: {
    mode: 'cell',
    trigger: 'dblclick',
    showStatus: true
  },
  scrollY: {
    enabled: true
  },
  columns: [
    { type: 'seq', title: '序号', width: 60, fixed: 'left' },
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
      editRender: { name: 'input' }
    },
    {
      field: 'u8Available',
      title: 'U8是否可用',
      width: 120,
      cellRender: {
        name: 'VxeSwitch'
      }
    },
    {
      field: 'bomCode',
      title: 'BOM编码',
      width: 160,
      editRender: { name: 'input' }
    },
    {
      field: 'etreeBomAudited',
      title: 'E树BOM审核',
      width: 120,
      editRender: {
        name: 'select',
        options: [
          { label: '已审核', value: '已审核' },
          { label: '未审核', value: '未审核' },
          { label: '有遗留', value: '有遗留' }
        ]
      }
    },
    {
      field: 'configModel',
      title: '配置型号',
      width: 160,
      editRender: { name: 'input' }
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
      width: 120,
      editRender: {
        name: 'input',
        attrs: { type: 'date' }
      }
    },
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
          }
        },
        {
          field: 'shippedQuantity',
          title: '已发货量',
          width: 100,
          editRender: {
            name: 'input',
            attrs: { type: 'number' }
          }
        },
        {
          field: 'unshippedQuantity',
          title: '未发货量',
          width: 100,
          editRender: {
            name: 'input',
            attrs: { type: 'number' }
          }
        }
      ]
    },
    {
      title: '交期信息',
      children: [
        {
          field: 'deliveryPlan',
          title: '交货计划',
          width: 120,
          editRender: {
            name: 'input',
            attrs: { type: 'date' }
          }
        },
        {
          field: 'pmcDeliveryDate',
          title: 'PMC可达成交期',
          width: 140,
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
      minWidth: 200,
      editRender: {
        name: 'textarea',
        attrs: { autosize: { minRows: 2, maxRows: 4 } }
      }
    },
    {
      field: 'specialRemark',
      title: '特殊备注',
      minWidth: 200,
      editRender: {
        name: 'textarea',
        attrs: { autosize: { minRows: 2, maxRows: 4 } }
      }
    },
    {
      field: 'orderDays',
      title: '订单已耗时(天)',
      width: 130
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ],
  data: [],
  pagerConfig: {
    enabled: true,
    currentPage: 1,
    pageSize: 20,
    pageSizes: [10, 20, 30, 40, 50, 100],
    total: 0
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        gridOptions.loading = true
        try {
          const res = await getShipmentOrderList({
            pageNum: page.currentPage,
            pageSize: page.pageSize
          })

          if (res && res.code === 200) {
            return {
              result: res.data?.list || [],
              page: {
                total: res.data?.total || 0
              }
            }
          }
          return { result: [], page: { total: 0 } }
        } catch (error) {
          console.error('加载数据失败:', error)
          return { result: [], page: { total: 0 } }
        } finally {
          gridOptions.loading = false
        }
      }
    }
  }
})

// Grid 事件
const gridEvents = {
  editClosed: ({ row, column }) => {
    console.log('单元格编辑完成:', { row, column: column.field })
  }
}

// 新增订单
const handleAdd = () => {
  const $grid = gridRef.value
  if ($grid) {
    const newRow = {
      customerName: '',
      u8OrderNo: '',
      u8Available: false,
      bomCode: '',
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
      specialRemark: '',
      orderDays: 0
    }
    $grid.insert(newRow).then(({ row }) => {
      $grid.setEditCell(row, 'customerName')
    })
  }
}

// 保存修改
const handleSave = async () => {
  const $grid = gridRef.value
  if ($grid) {
    const { insertRecords, updateRecords, removeRecords } = $grid.getRecordset()

    console.log('待保存数据:', {
      新增: insertRecords,
      修改: updateRecords,
      删除: removeRecords
    })

    VxeUI.modal.message({
      content: `新增 ${insertRecords.length} 条，修改 ${updateRecords.length} 条，删除 ${removeRecords.length} 条`,
      status: 'success'
    })

    // 这里可以调用 API 保存数据
    // await updateShipmentOrder(...)
  }
}

// 编辑订单
const handleEdit = row => {
  const $grid = gridRef.value
  if ($grid) {
    $grid.setEditRow(row)
  }
}

// 删除订单
const handleDelete = async row => {
  const type = await VxeUI.modal.confirm('确定要删除这条记录吗？')
  if (type === 'confirm') {
    const $grid = gridRef.value
    if ($grid) {
      await $grid.remove(row)
      VxeUI.modal.message({ content: '删除成功', status: 'success' })
    }
  }
}

// 导出Excel
const handleExport = () => {
  const $grid = gridRef.value
  if ($grid) {
    $grid.exportData({
      filename: `出货订单_${new Date().getTime()}`,
      type: 'xlsx',
      isHeader: true
    })
  }
}

onMounted(() => {
  console.log('📊 VXE Grid 页面已加载')
})
</script>

<style scoped>
.shipment-order-grid {
  padding: 20px;
  background: #fff;
  height: calc(100vh - 100px);
}
</style>
