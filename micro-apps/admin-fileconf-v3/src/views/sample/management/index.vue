<template>
  <PageContainer
    :search-form="queryParams"
    :fields="searchFields"
    :visible-count="4"
    :page-params="queryParams"
    :total="total"
    :show-pagination="false"
    @search="handleQuery"
    @reset="handleReset"
    @pagination="getList"
  >
    <template #actions>
      <el-button v-hasPermi="['sample:management:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['sample:management:export']" type="warning" icon="Download" @click="handleExport">导出</el-button>
    </template>

    <div v-loading="loading">
      <VxeConfiguredTable
        :data="dataList"
        :columns="columns"
        :storage-key="columnStorageKey"
        toolbar-placement="table-top-right"
        :page-params="queryParams"
        :total="total"
        show-pagination
        border
        show-overflow
        :seq-config="{ startIndex: (queryParams.pageNum - 1) * queryParams.pageSize }"
        :header-cell-class-name="headerCellClassName"
        @pagination="getList"
      >
        <template #currentStatus="{ row }">
          <el-tag :type="getStatusType(row?.currentStatus)" size="small">{{ row?.currentStatusName }}</el-tag>
        </template>
        <template #orderType="{ row }">
          <el-tag :type="row?.orderType === 0 ? 'primary' : 'warning'" size="small">{{ row?.orderTypeName }}</el-tag>
        </template>
        <template #bluetoothFunction="{ row }">
          <span>{{ row?.bluetoothFunction === '1' || row?.bluetoothFunction === 1 ? 'YES' : 'NO' }}</span>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link size="small" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="success" link size="small" @click="handleView(row)">查看</el-button>
          <el-button type="info" link size="small" @click="handleCopy(row)">复制</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </VxeConfiguredTable>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="95%" top="3vh" append-to-body destroy-on-close class="sample-dialog">
      <SampleForm ref="sampleFormRef" v-model="form" />
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <DetailView ref="detailViewRef" />
  </PageContainer>
</template>

<script setup name="SampleManagement">
import { getSampleList, getSampleDetail, createSample, updateSample, deleteSample, exportSample } from '@/api/sample/management'
import VxeConfiguredTable from '@/components/VxeConfiguredTable/index.vue'
import SampleForm from './components/SampleForm.vue'
import { download } from '@/utils/request'
import { columns, columnStorageKey, searchFields, detailSchema } from './schema'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const queryParams = reactive({ pageNum: 1, pageSize: 10, currentStatus: undefined, requirementCustomerId: undefined, requirementCategoryId: undefined, sn: undefined })

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const form = ref({ orderType: 0, requirementQuantity: 1 })
const sampleFormRef = ref(null)
const detailViewRef = ref(null)

function getStatusType(status) {
  return { 0: 'primary', 1: 'success', 2: 'warning', 3: 'info' }[status] || 'info'
}

// 表头单元格样式
function headerCellClassName({ column }) {
  const headerClass = column?.headerClassName
  if (headerClass) return headerClass
  return ''
}

// 复制功能
async function handleCopy(row) {
  const res = await getSampleDetail(row.id)
  const copyData = { ...(res.data || res) }
  delete copyData.id
  delete copyData.sn
  delete copyData.createTime
  delete copyData.updateTime
  form.value = copyData
  dialogTitle.value = '复制送样'
  dialogVisible.value = true
  nextTick(() => sampleFormRef.value?.initCategoryData())
}

function getRowActions(row) {
  if (!row) return []
  const actions = [
    { key: 'view', label: '详情', permi: ['sample:management:query'] },
    { key: 'edit', label: '编辑', permi: ['sample:management:edit'] },
    { key: 'delete', label: '删除', type: 'danger', class: 'text-danger', permi: ['sample:management:remove'] }
  ]
  return actions
}

function handleAction(key, row) {
  if (!row) return
  if (key === 'view') handleView(row)
  else if (key === 'edit') handleUpdate(row)
  else if (key === 'delete') handleDelete(row)
}

async function getList() {
  loading.value = true
  try {
    const res = await getSampleList(queryParams)
    dataList.value = res.data?.list || res.rows || []
    total.value = res.data?.total || res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function handleReset() { queryParams.pageNum = 1 }

function handleAdd() {
  form.value = { orderType: 0, requirementQuantity: 1 }
  dialogTitle.value = '添加送样'
  dialogVisible.value = true
  nextTick(() => sampleFormRef.value?.initCategoryData())
}

async function handleUpdate(row) {
  const res = await getSampleDetail(row.id)
  form.value = res.data || res
  dialogTitle.value = '编辑送样'
  dialogVisible.value = true
  nextTick(() => sampleFormRef.value?.initCategoryData())
}

function handleView(row) {
  detailViewRef.value.open({ title: '样品详情', id: row.id, schema: detailSchema })
}

async function submitForm() {
  submitLoading.value = true
  try {
    if (form.value.id) {
      await updateSample(form.value)
      proxy.$modal.msgSuccess('修改成功')
    } else {
      await createSample(form.value)
      proxy.$modal.msgSuccess('新增成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row) {
  proxy.$modal.confirm('确认删除该样品记录吗？').then(async () => {
    await deleteSample(row.id)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

async function handleExport() {
  proxy.$modal.confirm('确认导出样品管理数据吗？').then(async () => {
    const res = await exportSample(queryParams)
    download(res, '新送样管理.xlsx')
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>

<style scoped lang="scss">
.sample-dialog {
  :deep(.el-dialog__body) {
    padding: 10px 20px;
    max-height: 75vh;
    overflow-y: auto;
  }
}

// 表头分组样式 - vxe-table 表头单元格
:deep(.vxe-table) {
  .vxe-header--column {
    &.header-group-base {
      background-color: rgb(217, 225, 244) !important;  // 浅蓝色
      color: #000 !important;
    }
    &.header-group-config {
      background-color: #ffe0b2 !important;  // 浅橙色
      color: #000 !important;
    }
    &.header-group-appearance {
      background-color: #f8bbd9 !important;  // 浅粉色
      color: #000 !important;
    }
    &.header-group-time {
      background-color: #e8f5e9 !important;  // 浅绿色
      color: #000 !important;
    }
    &.header-sn {
      background-color: #ffca28 !important;  // 黄色
      color: #000 !important;
    }
  }
}
</style>
