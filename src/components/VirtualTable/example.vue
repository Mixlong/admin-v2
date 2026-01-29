<!-- 
  VirtualTable 使用示例
  展示如何用配置式替换手动定义的 vxe-table
-->

<template>
  <div class="example-container">
    <h2>配置式用法（推荐）</h2>
    <VirtualTable
      :data="tableData"
      :columns="columns"
      :height="600"
      :loading="loading"
      @sort-change="handleSort"
    >
      <!-- 自定义插槽：状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="mini">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 自定义插槽：操作列 -->
      <template #action="{ row }">
        <el-button type="text" size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="text" size="small" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </VirtualTable>
  </div>
</template>

<script>
export default {
  name: 'VirtualTableExample',
  
  data() {
    return {
      tableData: [],
      loading: false,
      
      // 列配置
      columns: [
        {
          field: 'id',
          title: 'ID',
          width: 80,
          align: 'center',
          useTooltip: false, // 不需要 tooltip
        },
        {
          field: 'name',
          title: '客户简称',
          width: 140,
          align: 'center',
          fixed: 'left',
          useTooltip: true, // 自动使用 CellTooltip
          sortable: true,
        },
        {
          field: 'email',
          title: '邮箱',
          minWidth: 200,
          align: 'left',
          useTooltip: true,
          tooltipPlacement: 'bottom', // 自定义 tooltip 位置
        },
        {
          field: 'phone',
          title: '电话',
          width: 150,
          align: 'center',
          useTooltip: true,
        },
        {
          field: 'address',
          title: '地址',
          minWidth: 200,
          align: 'left',
          useTooltip: true,
        },
        {
          field: 'status',
          title: '状态',
          width: 100,
          align: 'center',
          slotName: 'status', // 使用自定义插槽
          filters: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        },
        {
          field: 'createTime',
          title: '创建时间',
          width: 180,
          align: 'center',
          useTooltip: true,
          sortable: true,
          // 自定义格式化
          formatter: (row) => {
            return row.createTime || '--';
          },
        },
        {
          title: '操作',
          width: 150,
          align: 'center',
          fixed: 'right',
          slotName: 'action', // 使用自定义插槽
        },
      ],
    };
  },
  
  mounted() {
    this.loadData();
  },
  
  methods: {
    async loadData() {
      this.loading = true;
      try {
        // 模拟数据加载
        this.tableData = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `客户${i + 1}`,
          email: `customer${i + 1}@example.com`,
          phone: `138${String(i).padStart(8, '0')}`,
          address: `地址${i + 1}号`,
          status: i % 2,
          createTime: new Date().toISOString(),
        }));
      } finally {
        this.loading = false;
      }
    },
    
    handleSort(params) {
      console.log('排序变化', params);
    },
    
    handleEdit(row) {
      console.log('编辑', row);
    },
    
    handleDelete(row) {
      console.log('删除', row);
    },
  },
};
</script>

<style scoped>
.example-container {
  padding: 20px;
}
</style>
