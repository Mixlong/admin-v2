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
    <!-- 操作按钮 -->
    <template #actions>
      <el-button v-hasPermi="['app:version:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
    </template>

    <!-- 表格 -->
    <div v-loading="loading">
      <VxeConfiguredTable
        :data="versionList"
        :columns="columns"
        :storage-key="columnStorageKey"
        toolbar-placement="table-top-right"
        :page-params="queryParams"
        :total="total"
        show-pagination
        border
        show-overflow
        :seq-config="{ startIndex: (queryParams.pageNum - 1) * queryParams.pageSize }"
        @pagination="getList"
        @checkbox-change="syncCheckedIds"
        @checkbox-all="syncCheckedIds"
      >
        <template #platform="{ row }">
          <el-tag :type="row?.platform === 'Android' ? 'success' : 'primary'" size="small">{{ row?.platform }}</el-tag>
        </template>
        <template #channel="{ row }">
          {{ getChannelLabel(row?.channel) }}
        </template>
        <template #type="{ row }">
          <el-tag :type="row?.type === 'wgt' ? 'warning' : 'danger'" size="small">
            {{ row?.type === 'wgt' ? '热更新' : '整包' }}
          </el-tag>
        </template>
        <template #force="{ row }">
          <el-tag :type="row?.force ? 'danger' : 'info'" size="small">{{ row?.force ? '是' : '否' }}</el-tag>
        </template>
        <template #status="{ row }">
          <el-tag :type="getStatusType(row?.status)" size="small">{{ getStatusLabel(row?.status) }}</el-tag>
        </template>
        <template #actions="{ row }">
          <TableActions :row="row" :actions="getRowActions(row)" @action="handleAction" />
        </template>
      </VxeConfiguredTable>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" append-to-body destroy-on-close>
      <form-create
        v-model:api="fApi"
        v-model:value="form"
        :rule="formRule"
        :option="formOption"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <DetailView ref="detailViewRef" />

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadVisible" title="上传安装包" width="500px" append-to-body>
      <el-upload
        drag
        :action="uploadAction"
        :headers="uploadHeaders"
        :data="{ type: uploadType }"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :accept="uploadType === 'wgt' ? '.wgt' : '.apk'"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            {{ uploadType === 'wgt' ? '请上传 .wgt 热更新包文件' : '请上传 .apk 安装包文件' }}
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </PageContainer>
</template>

<script setup name="AppVersion">
import { getToken } from '@/utils/auth'
import { getVersionList, getVersionDetail, createVersion, updateVersion, deleteVersion, publishVersion, disableVersion } from '@/api/app/version'
import VxeConfiguredTable from '@/components/VxeConfiguredTable/index.vue'

// Schema 配置
import {
  columns,
  columnStorageKey,
  searchFields,
  channelOptions,
  statusOptions,
  createFormRule,
  formOption,
  detailSchema
} from './schema'

const { proxy } = getCurrentInstance()

// FormCreate
const fApi = ref(null)
const formRule = computed(() => {
  return createFormRule().map(rule => {
    if (rule.children) {
      rule.children = rule.children.map(child => {
        if (child.on) {
          return {
            ...child,
            on: {
              click: () => {
                if (child.on.click === '$uploadWgt') handleUpload('wgt')
                else if (child.on.click === '$uploadApk') handleUpload('apk')
              }
            }
          }
        }
        return child
      })
    }
    return rule
  })
})

// 列表数据
const loading = ref(false)
const versionList = ref([])
const total = ref(0)
const ids = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  platform: undefined,
  channel: undefined,
  versionName: undefined,
  status: undefined,
  type: undefined
})

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const form = ref({})

// 详情相关
const detailViewRef = ref(null)

// 上传相关
const uploadVisible = ref(false)
const uploadType = ref('wgt')
const uploadAction = computed(() => import.meta.env.VITE_APP_BASE_API + '/app/version/upload')
const uploadHeaders = computed(() => ({ Authorization: 'Bearer ' + getToken() }))

// 获取状态标签
function getStatusLabel(status) {
  const item = statusOptions.find(s => s.value === status)
  return item ? item.label : status
}

// 获取状态类型
function getStatusType(status) {
  const map = { draft: 'info', published: 'success', disabled: 'danger' }
  return map[status] || 'info'
}

// 获取渠道标签
function getChannelLabel(channel) {
  const item = channelOptions.find(c => c.value === channel)
  return item ? item.label : channel
}

// 获取行操作（带权限）
function getRowActions(row) {
  if (!row) return []
  const actions = [
    { key: 'view', label: '详情', permi: ['app:version:query'] }
  ]
  if (row.status === 'draft') {
    actions.push(
      { key: 'edit', label: '编辑', permi: ['app:version:edit'] },
      { key: 'publish', label: '发布', type: 'success', permi: ['app:version:publish'] },
      { key: 'delete', label: '删除', type: 'danger', class: 'text-danger', permi: ['app:version:remove'] }
    )
  } else if (row.status === 'published') {
    actions.push(
      { key: 'disable', label: '禁用', type: 'warning', permi: ['app:version:disable'] }
    )
  }
  return actions
}

// 处理操作
function handleAction(key, row) {
  if (!row) return
  switch (key) {
    case 'view': handleView(row); break
    case 'edit': handleUpdate(row); break
    case 'publish': handlePublish(row); break
    case 'disable': handleDisable(row); break
    case 'delete': handleDelete(row); break
  }
}

// 获取列表
async function getList() {
  loading.value = true
  try {
    const res = await getVersionList(queryParams)
    let list = []
    if (Array.isArray(res.rows)) list = res.rows
    else if (Array.isArray(res.data)) list = res.data
    else if (res.data && Array.isArray(res.data.rows)) list = res.data.rows
    else if (res.data && Array.isArray(res.data.list)) list = res.data.list
    versionList.value = list
    total.value = res.total || res.data?.total || 0
  } catch (error) {
    console.error('获取版本列表失败:', error)
    versionList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置
function handleReset() {
  queryParams.pageNum = 1
}

// 多选
function syncCheckedIds({ records } = {}) {
  ids.value = Array.isArray(records) ? records.map(item => item.id) : []
}

// 新增
function handleAdd() {
  form.value = {}
  dialogTitle.value = '新增版本'
  dialogVisible.value = true
}

// 编辑
async function handleUpdate(row) {
  form.value = {}
  const res = await getVersionDetail(row.id)
  form.value = res.data || res
  dialogTitle.value = '编辑版本'
  dialogVisible.value = true
}

// 查看详情
function handleView(row) {
  detailViewRef.value.open({
    title: '版本详情',
    id: row.id,
    schema: detailSchema
  })
}

// 提交表单
async function submitForm() {
  try {
    await fApi.value.validate()
  } catch {
    return
  }

  submitLoading.value = true
  try {
    const formData = fApi.value.formData()
    if (formData.id) {
      await updateVersion(formData)
      proxy.$modal.msgSuccess('修改成功')
    } else {
      await createVersion(formData)
      proxy.$modal.msgSuccess('新增成功')
    }
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

// 删除
function handleDelete(row) {
  const delIds = row?.id || ids.value
  proxy.$modal.confirm('确认删除选中的版本记录吗？').then(async () => {
    await deleteVersion(delIds)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

// 发布
function handlePublish(row) {
  proxy.$modal.confirm(`确认发布版本 ${row.versionName} 吗？发布后将对用户生效。`).then(async () => {
    await publishVersion(row.id)
    proxy.$modal.msgSuccess('发布成功')
    getList()
  }).catch(() => {})
}

// 禁用
function handleDisable(row) {
  proxy.$modal.confirm(`确认禁用版本 ${row.versionName} 吗？禁用后用户将无法获取此版本。`).then(async () => {
    await disableVersion(row.id)
    proxy.$modal.msgSuccess('禁用成功')
    getList()
  }).catch(() => {})
}

// 上传
function handleUpload(type) {
  uploadType.value = type
  uploadVisible.value = true
}

function beforeUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const allowExt = uploadType.value === 'wgt' ? 'wgt' : 'apk'
  if (ext !== allowExt) {
    proxy.$modal.msgError(`请上传 .${allowExt} 格式文件`)
    return false
  }
  return true
}

function handleUploadSuccess(res) {
  if (res.code === 200) {
    const url = res.data?.url || res.url
    if (uploadType.value === 'wgt') {
      form.value.wgtUrl = url
    } else {
      form.value.apkUrl = url
    }
    uploadVisible.value = false
    proxy.$modal.msgSuccess('上传成功')
  } else {
    proxy.$modal.msgError(res.msg || '上传失败')
  }
}

function handleUploadError() {
  proxy.$modal.msgError('上传失败')
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.note-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
