<template>
  <div class="app-container">
    <VxeConfiguredTable
      :data="rows"
      :columns="columns"
      storage-key="demo:vxe-configured-table"
      border
      resizable
      show-overflow
      height="480"
    >
      <template #name="{ row }">
        <el-tag type="success" size="small">{{ row.name }}</el-tag>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
          {{ row.status === 'enabled' ? '启用' : '停用' }}
        </el-tag>
      </template>
      <template #actions="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
      </template>
    </VxeConfiguredTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VxeConfiguredTable from '@/components/VxeConfiguredTable/index.vue'

const rows = ref([
  { id: 1, name: '张三', phone: '13800000000', status: 'enabled' },
  { id: 2, name: '李四', phone: '13900000000', status: 'disabled' }
])

const columns = [
  { key: 'seq', type: 'seq', title: '序号', width: 60, align: 'center', fixed: 'left', locked: true },
  { key: 'name', field: 'name', title: '姓名', minWidth: 140, slot: 'name' },
  { key: 'phone', field: 'phone', title: '手机号', width: 160 },
  { key: 'status', field: 'status', title: '状态', width: 100, align: 'center', slot: 'status' },
  { key: 'actions', title: '操作', width: 140, fixed: 'right', align: 'center', slot: 'actions', locked: true }
]

function handleEdit(row) {
  console.log('edit', row)
}
</script>

