# VirtualTable 通用虚拟滚动表格组件

基于 `vxe-table` 封装的通用虚拟滚动表格组件，自动集成 `CellTooltip`，支持大数据量场景。

## 特性

- ✅ 自动虚拟滚动（数据量 > 50 条自动启用）
- ✅ 自动集成 CellTooltip（解决无界微前端 tooltip 定位问题）
- ✅ 支持配置式和插槽式两种使用方式
- ✅ 支持自定义格式化、筛选、排序
- ✅ 支持嵌套字段（如 `user.name`）

## 使用方式

### 方式一：配置式（推荐）

```vue
<template>
  <VirtualTable
    :data="tableData"
    :columns="columns"
    :height="tableHeight(60)"
    :loading="loading"
    @sort-change="handleSort"
  >
    <!-- 自定义插槽（可选） -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </VirtualTable>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      loading: false,
      columns: [
        {
          field: 'name',
          title: '姓名',
          width: 120,
          align: 'center',
          useTooltip: true, // 自动使用 CellTooltip
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
          field: 'age',
          title: '年龄',
          width: 80,
          align: 'center',
          useTooltip: false, // 不使用 tooltip
        },
        {
          field: 'status',
          title: '状态',
          width: 100,
          align: 'center',
          slotName: 'status', // 使用自定义插槽
        },
        {
          field: 'createTime',
          title: '创建时间',
          width: 180,
          align: 'center',
          useTooltip: true,
          formatter: (row) => {
            // 自定义格式化
            return this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss');
          },
        },
      ],
    };
  },
  methods: {
    handleSort(params) {
      console.log('排序变化', params);
    },
  },
};
</script>
```

### 方式二：插槽式

```vue
<template>
  <VirtualTable
    :data="tableData"
    :height="600"
    :loading="loading"
  >
    <vxe-column field="name" title="姓名" width="120" align="center">
      <template #default="{ row }">
        <CellTooltip :content="row.name" />
      </template>
    </vxe-column>

    <vxe-column field="email" title="邮箱" min-width="200">
      <template #default="{ row }">
        <CellTooltip :content="row.email" placement="bottom" />
      </template>
    </vxe-column>

    <vxe-column field="status" title="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </vxe-column>
  </VirtualTable>
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | Array | `[]` | 表格数据 |
| `columns` | Array | `null` | 列配置（配置式使用） |
| `loading` | Boolean | `false` | 加载状态 |
| `height` | Number/String | `400` | 表格高度 |
| `rowHeight` | Number | `36` | 行高（虚拟滚动计算用） |
| `virtualThreshold` | Number | `50` | 虚拟滚动阈值 |
| `border` | Boolean | `true` | 是否显示边框 |
| `size` | String | `'mini'` | 表格尺寸 |

## Columns 配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `field` | String | - | 字段名（支持嵌套，如 `user.name`） |
| `title` | String | - | 列标题 |
| `width` | Number | - | 列宽度 |
| `minWidth` | Number | - | 最小宽度 |
| `align` | String | `'left'` | 对齐方式 |
| `useTooltip` | Boolean | `true` | 是否使用 CellTooltip |
| `tooltipPlacement` | String | `'top'` | Tooltip 位置 |
| `tooltipProps` | Object | `{}` | 传递给 CellTooltip 的其他 props |
| `formatter` | Function | - | 自定义格式化函数 |
| `slotName` | String | - | 自定义插槽名称 |
| `filters` | Array | - | 筛选配置 |
| `sortable` | Boolean | - | 是否可排序 |

## Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `getVxeTable()` | 获取 vxe-table 实例 | - |
| `clearAllFilters()` | 清空所有筛选 | - |
| `refreshScroll()` | 刷新虚拟滚动 | - |
| `scrollToTop()` | 滚动到顶部 | - |

## Events

支持所有 vxe-table 的事件，如：

- `@sort-change` - 排序变化
- `@filter-change` - 筛选变化
- `@cell-click` - 单元格点击
- 等等...

## 完整示例

```vue
<template>
  <div class="page-container">
    <VirtualTable
      ref="table"
      :data="tableData"
      :columns="columns"
      :height="tableHeight(60)"
      :loading="loading"
      @sort-change="handleSort"
      @filter-change="handleFilter"
    >
      <!-- 状态列自定义插槽 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="mini">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>

      <!-- 操作列自定义插槽 -->
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
  data() {
    return {
      tableData: [],
      loading: false,
      columns: [
        {
          field: 'id',
          title: 'ID',
          width: 80,
          align: 'center',
          useTooltip: false,
        },
        {
          field: 'name',
          title: '姓名',
          width: 120,
          align: 'center',
          useTooltip: true,
          sortable: true,
        },
        {
          field: 'email',
          title: '邮箱',
          minWidth: 200,
          align: 'left',
          useTooltip: true,
        },
        {
          field: 'department.name', // 嵌套字段
          title: '部门',
          width: 150,
          align: 'center',
          useTooltip: true,
        },
        {
          field: 'status',
          title: '状态',
          width: 100,
          align: 'center',
          slotName: 'status',
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
          formatter: (row) => {
            return this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss');
          },
        },
        {
          title: '操作',
          width: 150,
          align: 'center',
          fixed: 'right',
          slotName: 'action',
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
        const res = await this.$api.getList();
        this.tableData = res.data;
      } finally {
        this.loading = false;
      }
    },
    
    handleSort(params) {
      console.log('排序', params);
    },
    
    handleFilter(params) {
      console.log('筛选', params);
    },
    
    handleEdit(row) {
      console.log('编辑', row);
    },
    
    handleDelete(row) {
      console.log('删除', row);
    },
    
    getStatusType(status) {
      return status === 1 ? 'success' : 'danger';
    },
    
    getStatusLabel(status) {
      return status === 1 ? '启用' : '禁用';
    },
  },
};
</script>
```

## 注意事项

1. **CellTooltip 默认启用**：所有列默认使用 `CellTooltip`，如不需要可设置 `useTooltip: false`
2. **嵌套字段支持**：`field` 支持点语法，如 `user.profile.name`
3. **自定义插槽优先**：如果配置了 `slotName`，会优先使用自定义插槽
4. **虚拟滚动自动启用**：数据量超过 `virtualThreshold`（默认 50）时自动启用
5. **无界微前端兼容**：已禁用 vxe-table 原生 tooltip，使用 CellTooltip 替代
