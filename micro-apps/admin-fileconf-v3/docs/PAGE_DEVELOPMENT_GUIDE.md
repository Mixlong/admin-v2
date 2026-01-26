# V3 页面开发规范

基于 `src/views/app/version/index.vue` 的最佳实践，后续新增页面请遵循此规范。

## 目录结构

```
src/views/{module}/{feature}/
├── index.vue                    # 主页面
├── schema/                      # Schema 配置
│   ├── index.js                 # 统一出口
│   ├── columns.js               # 表格列配置（VxeConfiguredTable）
│   ├── form.js                  # 表单配置（FormCreate）
│   └── detail.js                # 详情配置（DetailView）
└── components/                  # 页面私有组件（可选）
    └── XxxDialog.vue
```

## 页面模板结构

```vue
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
    <!-- 1. 操作按钮区域 -->
    <template #actions>
      <el-button v-hasPermi="['xxx:xxx:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
    </template>
    
    <!-- 2. 表格区域 -->
    <VxeConfiguredTable ... />
    
    <!-- 3. 弹窗区域 -->
    <el-dialog ... />
    <DetailView ref="detailViewRef" />
  </PageContainer>
</template>
```

## 核心组件使用

### 1. 页面容器 - PageContainer

```js
const searchFields = [
  { key: 'name', label: '名称', type: 'input' },
  { key: 'status', label: '状态', type: 'select', options: [...] },
  { key: 'createTime', label: '创建时间', type: 'date' },
  // 超过 visibleCount 的字段自动放到筛选弹窗
]
```

### 2. 表格 - VxeConfiguredTable

```js
const columns = [
  { key: 'checkbox', type: 'checkbox', width: 55, align: 'center', locked: true },
  { key: 'seq', type: 'seq', title: '序号', width: 60, align: 'center', locked: true },
  { key: 'name', field: 'name', title: '名称', width: 120 },
  { key: 'status', field: 'status', title: '状态', width: 100, slot: 'status' },
  { key: 'actions', title: '操作', width: 180, fixed: 'right', slot: 'actions', locked: true }
]
```

**列配置说明：**
- `key`: 唯一标识（必填）
- `field`: 数据字段名
- `title`: 列标题
- `width`: 列宽度
- `slot`: 自定义插槽名
- `locked`: 锁定列（不可隐藏）
- `fixed`: 固定列位置 `'left' | 'right'`

### 3. 行操作按钮 - TableActions

```vue
<!-- 模板中使用 -->
<template #actions="{ row }">
  <TableActions :row="row" :actions="getRowActions(row)" @action="handleAction" />
</template>
```

```js
// 获取行操作配置（带权限）
function getRowActions(row) {
  if (!row) return []
  return [
    { key: 'view', label: '详情', permi: ['xxx:xxx:query'] },
    { key: 'edit', label: '编辑', permi: ['xxx:xxx:edit'] },
    { key: 'delete', label: '删除', type: 'danger', class: 'text-danger', permi: ['xxx:xxx:remove'] }
  ]
}

// 处理操作
function handleAction(key, row) {
  if (!row) return
  switch (key) {
    case 'view': handleView(row); break
    case 'edit': handleUpdate(row); break
    case 'delete': handleDelete(row); break
  }
}
```

**action 配置项：**
- `key`: 操作标识（必填）
- `label`: 按钮文字
- `permi`: 权限标识数组，如 `['xxx:xxx:edit']`
- `type`: 按钮类型 `'primary' | 'success' | 'warning' | 'danger' | 'info'`
- `icon`: 图标名称
- `class`: 自定义样式类，如 `'text-danger'`
- `tooltip`: 是否显示 tooltip
- `hidden`: 是否隐藏
- `disabled`: 是否禁用

### 4. 详情弹窗 - DetailView

```js
const detailSchema = {
  cols: 2,
  fetch: { url: '/api/xxx/detail/{id}' },  // 可选，有接口时配置
  blocks: [{
    fields: [
      { key: 'name', label: '名称' },
      { key: 'status', label: '状态', render: 'dict', map: { 1: '启用', 0: '禁用' } },
      { key: 'createTime', label: '创建时间', render: 'datetime' },
      { key: 'remark', label: '备注', span: 2 },
      { key: 'content', label: '内容', span: 2, render: 'html' }
    ]
  }]
}

// 方式一：通过接口获取数据
detailViewRef.value.open({
  title: 'XXX详情',
  id: row.id,
  schema: detailSchema
})

// 方式二：直接传入数据（无需接口）
detailViewRef.value.open({
  title: 'XXX详情',
  schema: detailSchema,
  data: row  // 直接使用行数据
})
```

**render 类型：**
- `dict`: 字典映射，需配合 `map` 使用
- `datetime`: 日期时间格式化
- `boolean`: 布尔值显示为 是/否
- `size`: 文件大小格式化（字节转 MB）
- `html`: 富文本渲染
- `Function`: 自定义渲染函数

### 5. 表单 - FormCreate（推荐）

```js
// xxxFormRule.js
export const createXxxFormRule = () => [
  {
    type: 'input',
    field: 'name',
    title: '名称',
    value: '',
    props: { placeholder: '请输入名称' },
    validate: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    col: { span: 12 }
  },
  {
    type: 'select',
    field: 'status',
    title: '状态',
    value: 1,
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ],
    col: { span: 12 }
  }
]

export const formOption = {
  form: { labelWidth: '100px', size: 'default' },
  row: { gutter: 20 },
  submitBtn: false,
  resetBtn: false
}
```

### 6. 远程选择器 - RemoteSelect

用于客户、品类、型号、用户等需要从接口加载的下拉选择。

**在 FormCreate 中使用：**

```js
// 客户选择
{
  type: 'RemoteSelect',
  field: 'customerId',
  title: '客户',
  value: '',
  props: { type: 'customer', placeholder: '请选择客户', customStyle: 'width: 100%' },
  col: { span: 12 }
}

// 品类选择
{
  type: 'RemoteSelect',
  field: 'categoryId',
  title: '品类',
  value: '',
  props: { type: 'category', placeholder: '请选择品类', customStyle: 'width: 100%' },
  col: { span: 12 }
}

// 型号选择（依赖品类）
{
  type: 'RemoteSelect',
  field: 'modelId',
  title: '型号',
  value: '',
  props: { type: 'model', placeholder: '请选择型号', customStyle: 'width: 100%' },
  col: { span: 12 },
  link: ['categoryId'],
  update: (val, rule, fApi) => {
    rule.props.categoryId = fApi.getValue('categoryId')
  }
}

// 用户选择
{
  type: 'RemoteSelect',
  field: 'userId',
  title: '负责人',
  value: '',
  props: { type: 'user', placeholder: '请选择用户', customStyle: 'width: 100%' },
  col: { span: 12 }
}
```

**预设类型（type）：**
- `customer` / `customerName`: 客户选择（返回 ID / 名称）
- `category` / `categoryName`: 品类选择（返回 ID / 名称）
- `model` / `modelName`: 型号选择（返回 ID / 名称，需配合 categoryId）
- `user` / `userId`: 所有用户选择（返回 userName / ID）
- `projectManager` / `projectManagerName`: 项目经理选择（返回 ID / 名称，通过角色筛选）
- `sales` / `salesName`: 销售选择（返回 ID / 名称，通过角色筛选）

**在模板中直接使用：**

```vue
<RemoteSelect v-model="form.customerId" type="customer" />
<RemoteSelect v-model="form.categoryId" type="category" />
<RemoteSelect v-model="form.modelId" type="model" :category-id="form.categoryId" />
<RemoteSelect v-model="form.userId" type="user" />
```

## Script Setup 规范

```vue
<script setup name="XxxList">
import { getToken } from '@/utils/auth'
import { getXxxList, getXxxDetail, createXxx, updateXxx, deleteXxx } from '@/api/xxx'
import VxeConfiguredTable from '@/components/VxeConfiguredTable/index.vue'

const { proxy } = getCurrentInstance()

// ==================== 配置区 ====================
const searchFields = [...]
const columns = [...]
const detailSchema = {...}

// ==================== 状态区 ====================
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const ids = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  // ...其他查询参数
})

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const form = ref({})

// 详情相关
const detailViewRef = ref(null)

// ==================== 方法区 ====================
// 获取列表
async function getList() {
  loading.value = true
  try {
    const res = await getXxxList(queryParams)
    dataList.value = res.data?.list || res.rows || []
    total.value = res.data?.total || res.total || 0
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

// 新增
function handleAdd() {
  form.value = {}
  dialogTitle.value = '新增XXX'
  dialogVisible.value = true
}

// 编辑
async function handleUpdate(row) {
  const res = await getXxxDetail(row.id)
  form.value = res.data || res
  dialogTitle.value = '编辑XXX'
  dialogVisible.value = true
}

// 查看详情
function handleView(row) {
  detailViewRef.value.open({
    title: 'XXX详情',
    id: row.id,
    schema: detailSchema
  })
}

// 提交表单
async function submitForm() {
  submitLoading.value = true
  try {
    if (form.value.id) {
      await updateXxx(form.value)
      proxy.$modal.msgSuccess('修改成功')
    } else {
      await createXxx(form.value)
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
  proxy.$modal.confirm('确认删除选中的记录吗？').then(async () => {
    await deleteXxx(row.id)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

// ==================== 生命周期 ====================
onMounted(() => {
  getList()
})
</script>
```

## API 文件规范

```js
// src/api/xxx/index.js
import request from '@/utils/request'

// 分页查询
export function getXxxList(params) {
  return request({
    url: '/xxx/list',
    method: 'get',
    params: { p: params.pageNum, l: params.pageSize, ...params }
  })
}

// 详情
export function getXxxDetail(id) {
  return request({ url: `/xxx/detail/${id}`, method: 'get' })
}

// 新增
export function createXxx(data) {
  return request({ url: '/xxx/add', method: 'post', data })
}

// 修改
export function updateXxx(data) {
  return request({ url: '/xxx/update', method: 'put', data })
}

// 删除
export function deleteXxx(id) {
  return request({ url: `/xxx/delete/${id}`, method: 'delete' })
}
```

## 权限配置

### 按钮权限

```vue
<el-button v-hasPermi="['xxx:xxx:add']">新增</el-button>
<el-button v-hasPermi="['xxx:xxx:edit']">编辑</el-button>
<el-button v-hasPermi="['xxx:xxx:remove']">删除</el-button>
```

## 样式规范

```vue
<style scoped lang="scss">
// 页面私有样式
.custom-class {
  // ...
}
</style>
```

- 使用 `scoped` 避免样式污染
- 使用 Element Plus CSS 变量
- 避免使用 `!important`

## 注意事项

1. **分页参数**：后端使用 `p` 和 `l`，前端使用 `pageNum` 和 `pageSize`，在 API 层转换
2. **表格高度**：VxeConfiguredTable 内置自动计算（默认 heightOffset=270），可通过 `:height-offset` 调整
3. **表单验证**：使用 FormCreate 时通过 `fApi.value.validate()` 验证
4. **详情弹窗**：优先使用 DetailView 组件，支持 schema 配置
5. **权限控制**：所有操作按钮必须配置 `v-hasPermi` 指令或 `permi` 属性
