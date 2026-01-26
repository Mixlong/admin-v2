# VxeConfiguredTable（列配置/拖拽/本地持久化）

目标：不依赖 vxe-table 的付费「列设置/持久化」能力，统一用一个通用组件实现：

- 列显示/隐藏
- 列固定（left/right）
- 列宽（数值）
- 拖拽排序（SortableJS）
- localStorage 持久化（按 `storageKey` 隔离）

## 基本用法

```vue
<template>
  <VxeConfiguredTable
    :data="rows"
    :columns="columns"
    storage-key="demo:users"
    border
    show-overflow
    :height="500"
  >
    <template #name="{ row }">
      <el-tag type="success">{{ row.name }}</el-tag>
    </template>
    <template #actions="{ row }">
      <el-button size="small" @click="edit(row)">编辑</el-button>
    </template>
  </VxeConfiguredTable>
</template>

<script setup>
import { ref } from 'vue'
import VxeConfiguredTable from '@/components/VxeConfiguredTable/index.vue'

const rows = ref([])

const columns = [
  { key: 'seq', type: 'seq', title: '序号', width: 60, align: 'center', fixed: 'left', locked: true },
  { key: 'name', field: 'name', title: '姓名', minWidth: 140, slot: 'name' },
  { key: 'phone', field: 'phone', title: '手机号', width: 160 },
  { key: 'actions', title: '操作', width: 160, fixed: 'right', slot: 'actions', locked: true }
]

function edit(row) {
  console.log('edit', row)
}
</script>
```

## 列定义字段说明

- `key`：唯一标识（必填，持久化/排序用）
- `field`：vxe-column 的字段（普通数据列必填）
- `title`：表头文字
- `width`/`minWidth`：列宽
- `fixed`：`left | right | null`
- `visible`：是否显示（默认 `true`）
- `locked`：是否允许配置（默认 `false`，锁定列不会被隐藏/拖拽）
- `slot`：自定义渲染 slot 名称（如 `slot: 'name'` 对应 `<template #name>`）
- 其他：除 `key/slot/visible/locked` 外都会透传给 `<vxe-column>`

