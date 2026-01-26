# V3 页面组件使用指南

## IntelligentSearchForm 智能搜索表单

与 V2 一致的智能搜索表单组件，支持自动计算显示字段、高级筛选弹窗、自定义字段渲染。

### 基本用法

```vue
<template>
  <IntelligentSearchForm
    :search-form="queryParams"
    :fields="searchFields"
    :default-visible-count="4"
    @search="handleQuery"
    @reset="handleReset"
  >
    <!-- 右侧操作按钮 -->
    <template #page-actions>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </template>
  </IntelligentSearchForm>
</template>

<script setup>
const searchFields = [
  { key: 'name', label: '名称', type: 'input' },
  { key: 'status', label: '状态', type: 'select', options: [...] },
  { key: 'createTime', label: '创建时间', type: 'date' },
  // 超过 defaultVisibleCount 的字段自动放到筛选弹窗
  { key: 'extra1', label: '额外字段1', type: 'input' },
  { key: 'extra2', label: '额外字段2', type: 'select', options: [...] }
]
</script>
```

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| searchForm | 搜索表单数据（必填） | Object | - |
| fields | 搜索字段配置（必填） | Array | - |
| defaultVisibleCount | 默认显示字段数量 | Number | 4 |
| maxVisibleCount | 最大显示字段数量 | Number | 6 |
| labelWidth | 标签宽度 | String | 'auto' |
| fieldPriorities | 字段优先级配置 | Object | {} |

### 字段配置

```js
{
  key: 'fieldName',        // 字段名（必填）
  label: '字段标签',        // 标签文字（必填）
  type: 'input',           // 类型: input/select/date/daterange
  component: 'el-select',  // 自定义组件（优先级高于 type）
  placeholder: '请输入',    // 占位符
  width: '150px',          // 宽度
  labelWidth: '80px',      // 标签宽度
  options: [],             // select 选项 [{ label, value }]
  dateType: 'date',        // date 类型: date/datetime/month/year
  autoSearch: true,        // select 变化时自动搜索（默认 true）
  sort: 1,                 // 排序优先级（数字越小越靠前）
  props: {},               // 传递给组件的额外属性
  fieldClass: '',          // 自定义类名
  fieldStyle: {}           // 自定义样式
}
```

### Slots

| 名称 | 说明 |
|------|------|
| field-{key} | 自定义字段渲染 |
| extra-buttons | 搜索按钮后的额外按钮 |
| page-actions | 右侧操作按钮区域 |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| search | 搜索 | searchForm |
| reset | 重置 | - |
| field-change | 字段值变化 | (key, value) |

---

## PageContainer 页面容器组件

统一的页面布局组件，内部集成 IntelligentSearchForm，包含搜索区域、内容区域和分页。

### 基本用法

```vue
<template>
  <PageContainer
    :search-form="queryParams"
    :fields="searchFields"
    :visible-count="4"
    :page-params="queryParams"
    :total="total"
    @search="handleQuery"
    @reset="handleReset"
    @pagination="getList"
  >
    <!-- 右侧操作按钮 -->
    <template #actions>
      <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
    </template>

    <!-- 表格内容 -->
    <el-table :data="list" v-loading="loading">
      <!-- 表格列 -->
    </el-table>
  </PageContainer>
</template>
```

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| searchForm | 搜索表单数据 | Object | {} |
| fields | 搜索字段配置 | Array | [] |
| visibleCount | 默认显示字段数量 | Number | 4 |
| maxVisibleCount | 最大显示字段数量 | Number | 6 |
| labelWidth | 标签宽度 | String | 'auto' |
| showSearch | 是否显示搜索 | Boolean | true |
| pageParams | 分页参数 | Object | { pageNum: 1, pageSize: 10 } |
| total | 总数 | Number | 0 |
| showPagination | 是否显示分页 | Boolean | true |

### Slots

| 名称 | 说明 |
|------|------|
| default | 主体内容（表格等） |
| actions | 右侧操作按钮 |
| search-buttons | 搜索按钮后的额外按钮 |
| toolbar | 工具栏（showSearch=false 时显示） |
| field-{key} | 自定义字段渲染（透传给 IntelligentSearchForm） |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| search | 搜索 | searchForm |
| reset | 重置 | - |
| pagination | 分页变化 | pageParams |
| field-change | 字段值变化 | (key, value) |

---

## TableActions 表格操作组件

表格行操作按钮组件，支持更多下拉。

### 基本用法

```vue
<el-table-column label="操作" width="180">
  <template #default="{ row }">
    <TableActions :row="row" :actions="getRowActions(row)" @action="handleAction" />
  </template>
</el-table-column>

<script setup>
function getRowActions(row) {
  return [
    { key: 'view', label: '详情', icon: 'View' },
    { key: 'edit', label: '编辑', icon: 'Edit' },
    { key: 'delete', label: '删除', icon: 'Delete', type: 'danger', class: 'text-danger' }
  ]
}

function handleAction(key, row) {
  switch (key) {
    case 'view': handleView(row); break
    case 'edit': handleUpdate(row); break
    case 'delete': handleDelete(row); break
  }
}
</script>
```

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| actions | 操作配置 | Array | [] |
| row | 行数据 | Object | {} |
| maxVisible | 最大显示数量 | Number | 3 |

### 操作配置

```js
{
  key: 'edit',           // 操作标识
  label: '编辑',          // 按钮文字
  icon: 'Edit',          // 图标
  type: 'primary',       // 按钮类型
  class: 'text-danger',  // 自定义类名
  tooltip: true,         // 是否显示 tooltip
  disabled: false,       // 是否禁用
  hidden: false,         // 是否隐藏
  divided: false,        // 下拉菜单分割线
  onClick: (row) => {}   // 点击回调
}
```

---

## 自定义字段渲染示例

```vue
<PageContainer :search-form="queryParams" :fields="searchFields" ...>
  <!-- 自定义 treeselect 字段 -->
  <template #field-deptId="{ field, searchForm }">
    <el-form-item :label="field.label">
      <treeselect
        v-model="searchForm.deptId"
        :options="deptOptions"
        placeholder="请选择部门"
        style="width: 200px"
      />
    </el-form-item>
  </template>
  
  <!-- 自定义远程搜索字段 -->
  <template #field-userId="{ field, searchForm }">
    <el-form-item :label="field.label">
      <el-select
        v-model="searchForm.userId"
        filterable
        remote
        :remote-method="searchUser"
        placeholder="请输入用户名搜索"
      >
        <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
      </el-select>
    </el-form-item>
  </template>
</PageContainer>
```
