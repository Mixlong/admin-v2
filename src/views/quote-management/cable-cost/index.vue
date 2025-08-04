<template>
  <div class="cable-cost-container app-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" ref="searchForm" :inline="true" class="search-form">
        <el-form-item label="线缆型号" prop="cableModel">
          <el-input v-model="searchForm.cableModel" placeholder="请输入线缆型号" clearable></el-input>
        </el-form-item>

        <el-form-item label="供应商" prop="supplier">
          <el-select v-model="searchForm.supplier" filterable clearable placeholder="请选择供应商" @change="fetchData">
            <el-option v-for="item in supplierOptions" :key="item.dictCode" :label="item.dictLabel"
              :value="item.dictCode">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button type="success" @click="handleSupplierManage" icon="el-icon-user"
          v-hasPermi="['quote:cable:supplier']">供应商管理</el-button>
        <el-button type="warning" @click="handleBatchImport" icon="el-icon-upload2"
          v-hasPermi="['quote:cable:import']">批量导入</el-button>
        <el-button type="danger" @click="handleBatchDelete" icon="el-icon-delete" :disabled="selectedRows.length === 0"
          v-hasPermi="['quote:cable:remove']">批量删除</el-button>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus"
          v-hasPermi="['quote:cable:add']">新增线缆成本</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table ref="table" :data="tableData" v-loading="loading" element-loading-text="加载中..."
        :height="tableHeight(-30)" @selection-change="handleSelectionChange" element-loading-spinner="el-icon-loading"
        border stripe style="width: 100%" empty-text="暂无数据">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="supplierName" label="供应商" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ getSupplierName(scope.row.supplier) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commonLinearPrice" label="防水头盔型号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.cableModel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="waterproofHeadPrice" label="防水头价格" align="center">
          <template slot-scope="scope">
            <span class="text-red">{{ scope.row.waterproofHeadPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cableModel" label="线缆型号" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="commonLinearPrice" label="普通线价格(元/米)" align="center">
          <template slot-scope="scope">
            <span class="text-red">{{ scope.row.commonLinearPrice | currency }}</span>
          </template>
        </el-table-column>


        <el-table-column prop="ulLinearPrice" label="UL线价格(元/米)" align="center">
          <template slot-scope="scope">
            <span class="text-red">{{ scope.row.ulLinearPrice | currency }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
              v-hasPermi="['quote:cable:edit']">编辑</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" class="text-red" @click="handleDelete(scope.row)"
              v-hasPermi="['quote:cable:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.current" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper" :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 新增线缆成本弹窗 -->
    <AddCableCostDialog :visible.sync="addDialogVisible" :editData="editData" :supplierOptions="supplierOptions"
      @success="handleDialogSuccess">
    </AddCableCostDialog>

    <!-- 批量导入弹窗 -->
    <BatchImportDialog :visible.sync="importDialogVisible" @success="handleImportSuccess">
    </BatchImportDialog>

    <!-- 供应商管理弹窗 -->
    <AddSupplierDialog :visible.sync="supplierManageVisible" @success="handleSupplierSuccess">
    </AddSupplierDialog>
  </div>
</template>

<script>
import AddCableCostDialog from './components/AddCableCostDialog'
import BatchImportDialog from './components/BatchImportDialog'
import AddSupplierDialog from './components/AddSupplierDialog'
import { getCableCostList, deleteCableCosts, getSupplierDict } from '@/api/quote-management/cableCost'

export default {
  name: 'CableCost',
  components: {
    AddCableCostDialog,
    BatchImportDialog,
    AddSupplierDialog
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        categoryId: '',
        cableModel: '',
        supplier: ''  // 添加供应商ID搜索
      },
      // 表格数据
      tableData: [],
      loading: false,
      // 分页信息
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 下拉选项
      categoryOptions: [],
      supplierOptions: [],  // 供应商选项

      // 弹窗控制
      addDialogVisible: false,
      importDialogVisible: false,
      supplierManageVisible: false,
      // 编辑数据
      editData: null,
      selectedRows: [], // 新增：选中的行数据
    }
  },
  filters: {
    currency(value) {
      if (!value) return '0.00'
      return Number(value).toFixed(2)
    },
    formatDate(value) {
      if (!value) return ''
      return new Date(value).toLocaleString()
    }
  },
  created() {
    this.fetchData()
    this.loadOptions()
  },
  methods: {
    // 加载下拉选项
    loadOptions() {
      // this.loadCategoryOptions()
      this.loadSupplierOptions()
    },

    // 加载供应商选项
    loadSupplierOptions() {
      getSupplierDict().then(res => {
        if (res.code === 200) {
          this.supplierOptions = res.data || []
        } else {
          this.$message.error(res.msg || '获取供应商数据失败')
        }
      }).catch(() => {
        this.$message.error('获取供应商数据失败')
      })
    },

    // 获取供应商名称
    getSupplierName(supplier) {
      if (!supplier) return '-'
      const supplierName = this.supplierOptions.find(item => item.dictCode === supplier)
      return supplierName ? supplierName.dictLabel : '-'
    },

    // 处理供应商管理成功
    handleSupplierSuccess() {
      this.loadSupplierOptions()  // 重新加载供应商选项
      this.fetchData()  // 刷新表格数据
    },

    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        pageNum: this.pagination.current,
        pageSize: this.pagination.size,
        categoryId: this.searchForm.categoryId || undefined,
        cableModel: this.searchForm.cableModel || undefined,
        supplier: this.searchForm.supplier || undefined
      }

      getCableCostList(params).then((res) => {
        if (res && res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
        } else {
          this.$message.error(res?.msg || '获取数据失败')
          this.tableData = []
          this.pagination.total = 0
        }
      }).catch((error) => {
        console.error('获取线缆成本列表失败:', error)
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
    },

    // 表格选择项变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 搜索功能
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.pagination.current = 1
      this.fetchData()
    },

    // 新增线缆成本
    handleAdd() {
      this.editData = null
      this.addDialogVisible = true
    },

    // 编辑线缆成本
    handleEdit(row) {
      this.editData = { ...row }
      this.addDialogVisible = true
    },
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的记录')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedRows.map(row => row.id)

        deleteCableCosts(ids).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.selectedRows = [] // 清空选中的行
            this.$refs.table.clearSelection() // 清空表格选择
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch((error) => {
          console.error('批量删除失败:', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 删除线缆成本
    handleDelete(row) {
      this.$confirm('确定要删除这条线缆成本记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCableCosts([row.id]).then((res) => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch((error) => {
          console.error('删除线缆成本失败:', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 批量导入
    handleBatchImport() {
      this.importDialogVisible = true
    },

    // 供应商管理
    handleSupplierManage() {
      this.supplierManageVisible = true
    },



    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },

    // 弹窗成功回调
    handleDialogSuccess() {
      this.fetchData()
    },

    // 导入成功回调
    handleImportSuccess() {
      this.fetchData()
    },



    // 处理下拉菜单操作
    handleAction(command) {
      const { action, row } = command
      switch (action) {
        case 'edit':
          this.handleEdit(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    // 获取分类名称
    getCategoryName(categoryId) {
      if (!categoryId) return '-'
      const category = this.categoryOptions.find(item => item.id === categoryId)
      return category ? category.name : `分类${categoryId}`
    }
  }
}
</script>

<style lang="scss" scoped>
.cable-cost-container {

  .page-header {
    margin-bottom: 20px;

    h2 {
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .search-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .search-form,
    .action-section {
      gap: 15px;
      flex-wrap: wrap;
      display: flex;

      .el-form-item {
        display: flex;
        margin-bottom: 0;
      }
    }
  }

  .action-section {
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }

  .table-section {
    background: #fff;
    overflow: hidden;
  }

  .pagination-section {
    margin-top: 20px;
    text-align: right;
  }
}
</style>