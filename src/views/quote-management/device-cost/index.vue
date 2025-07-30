<template>
  <div class="device-cost-container app-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" ref="searchForm" :inline="true" class="search-form">
        <el-form-item label="所属品类" prop="categoryId">
          <el-select v-model="searchForm.categoryId" @change="handleSearch" filterable allow-create clearable
            placeholder="请选择品类">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="成本类型" prop="costCategory">
          <el-select v-model="searchForm.costCategory" placeholder="请选择成本类型" clearable @change="handleCostTypeChange">
            <el-option v-for="item in costTypeOptions" :key="item.dictCode" :label="item.dictLabel"
              :value="item.dictCode">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="成本项" prop="costProject">
          <el-select v-model="searchForm.costProject" placeholder="请选择成本项" clearable
            :disabled="!searchForm.costCategory" @change="handleSearch">
            <el-option v-for="item in filteredCostItems" :key="item.dictCode" :label="item.dictLabel"
              :value="item.dictCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="成本金额" prop="amount"></el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button type="success" @click="handleCategoryManage" icon="el-icon-setting">类别管理</el-button>
        <el-button type="warning" @click="handleBatchImport" icon="el-icon-upload2">批量导入</el-button>
        <el-button type="danger" @click="handleBatchDelete" icon="el-icon-delete"
          :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus">新增</el-button>
      </div>

    </div>


    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center">
        </el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center" :index="(index) => {
          return (pagination.current - 1) * pagination.size + index + 1
        }">
        </el-table-column>
        <el-table-column prop="categoryId" label="品类" align="center" :formatter="formatCategory"></el-table-column>
        <el-table-column prop="costTypeName" label="成本类型" align="center">
          <template slot-scope="scope">
            <div v-html="formatCostType(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="costItemName" label="成本项" align="center">
          <template slot-scope="scope">
            <div v-html="formatCostItem(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)"
              icon="el-icon-delete">删除</el-button>
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

    <!-- 新增成本弹窗 -->
    <AddCostDialog :visible.sync="addDialogVisible" :editData="editData" :costTypes="costTypeOptions"
      :costItems="allCostItems" :categoryOptions="categoryOptions" @success="handleDialogSuccess">
    </AddCostDialog>
    <!-- 类别管理弹窗 -->
    <CategoryManageDialog :visible.sync="categoryDialogVisible" :costTypes="costTypeOptions" :costItems="allCostItems"
      @success="handleCategorySuccess" @refresh="loadOptions">
    </CategoryManageDialog>

    <!-- 批量导入弹窗 -->
    <BatchImportDialog :visible.sync="importDialogVisible" @success="handleImportSuccess">
    </BatchImportDialog>
  </div>
</template>

<script>
import AddCostDialog from './components/AddCostDialog'
import CategoryManageDialog from './components/CategoryManageDialog'
import BatchImportDialog from './components/BatchImportDialog'
import { getDeviceCostList, batchDeleteDeviceCost, getDeviceCostById } from '@/api/quote-management/deviceCost'
import { computerNameList } from '@/api/third/fileConfig'
import { getDicts } from '@/api/system/dict/data'
import {
  getCategoryList as categoryComputerDict,

} from '@/api/quote-management/quotation'
export default {
  name: 'DeviceCost',
  components: {
    AddCostDialog,
    CategoryManageDialog,
    BatchImportDialog
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        categoryId: '',
        computerId: '',
        costCategory: '',
        costProject: ''
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
      computerOptions: [],
      costTypeOptions: [], // 成本类型选项
      costItemOptions: [], // 成本项选项
      // 加载状态
      isComputerLoading: false,
      // 弹窗控制
      addDialogVisible: false,
      categoryDialogVisible: false,
      importDialogVisible: false,
      // 编辑数据
      editData: null,
      allCostItems: [], // 存储所有成本项
      selectedRows: [], // 新增：选中的行数据
    }
  },
  computed: {
    // 根据选中的成本类型过滤成本项
    filteredCostItems() {
      if (!this.searchForm.costCategory) {
        return []
      }
      const costType = this.costTypeOptions.find(item => item.dictCode == this.searchForm.costCategory)
      return this.allCostItems.filter(item => {
        return item.dictValue === costType.dictValue
      })
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
    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.pagination.current,
        size: this.pagination.size,
        categoryId: this.searchForm.categoryId,
        computerId: this.searchForm.computerId,
        costCategory: this.searchForm.costCategory,
        costProject: this.searchForm.costProject
      }

      getDeviceCostList(params).then((res) => {
        this.tableData = res.data?.list || []
        this.pagination.total = res.data?.total || 0
      }).catch(() => {
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
    },

    // 加载下拉选项
    loadOptions() {
      // 加载品类选项
      this.loadCategoryOptions()
      // 加载成本类型选项
      this.loadCostTypeOptions()
      // 加载成本项选项
      this.loadCostItemOptions()
    },

    // 加载品类选项
    loadCategoryOptions() {
      categoryComputerDict().then((res) => {
        this.categoryOptions = res.data || []
      }).catch(() => {
        this.$message.error('获取品类数据失败')
      })
    },


    // 仪表型号远程搜索
    getComputerNameList(name) {
      if (name) {
        this.isComputerLoading = true
        computerNameList({
          name,
          categoryId: this.searchForm.categoryId
        }).then((res) => {
          this.computerOptions = res.data || []
        }).catch(() => {
          this.computerOptions = []
        }).finally(() => {
          this.isComputerLoading = false
        })
      } else {
        this.computerOptions = []
      }
    },

    // 加载成本类型选项
    loadCostTypeOptions() {
      getDicts('cost_category').then(response => {
        this.costTypeOptions = response.data
      }).catch(() => {
        this.$message.error('获取成本类型数据失败')
      })
    },

    // 加载成本项选项
    loadCostItemOptions() {
      getDicts('cost_project').then(response => {
        this.allCostItems = response.data
      }).catch(() => {
        this.$message.error('获取成本项数据失败')
      })
    },

    // 成本类型变化时的处理
    handleCostTypeChange(value) {
      // 清空已选择的成本项
      this.searchForm.costProject = ''

      if (!value) {
        // 如果清空了成本类型，则不需要进行搜索
        return
      }

      // 如果选择了新的成本类型，自动触发搜索
      this.handleSearch()
    },

    // 搜索功能
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.searchForm.costCategory = ''
      this.searchForm.costProject = ''
      this.pagination.current = 1
      this.fetchData()
    },

    // 新增成本
    handleAdd() {
      this.editData = null
      this.addDialogVisible = true
    },

    // 删除成本
    handleDelete(row) {
      this.$confirm('确定要删除这条成本记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = [{
          id: row.id,
          status: 1,  // 1表示禁用/删除
          why: '用户手动删除'
        }]

        batchDeleteDeviceCost(params).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
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
        const params = this.selectedRows.map(row => ({
          id: row.id,
          status: 1,
          why: '用户批量删除'
        }))

        batchDeleteDeviceCost(params).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 编辑成本
    handleEdit(row) {
      getDeviceCostById(row.id).then(res => {
        if (res.code === 200) {
          // 设置编辑数据
          this.editData = {
            id: res.data.id,
            categoryId: res.data.categoryId,
            costCategory: parseInt(res.data.costCategory),
            costProject: parseInt(res.data.costProject),
            amount: res.data.amount,
            ...res.data
          }
          this.addDialogVisible = true
        } else {
          this.$message.error(res.msg || '获取详情失败')
        }
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
    },

    // 类别管理
    handleCategoryManage() {
      this.categoryDialogVisible = true
    },

    // 打开批量导入弹窗
    handleBatchImport() {
      this.importDialogVisible = true
    },

    // 导入成功回调
    handleImportSuccess() {
      this.$message.success('导入成功')
      this.fetchData()
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

    // 类别管理成功回调
    handleCategorySuccess() {
      this.loadOptions()
    },

    // 导入成功回调
    handleImportSuccess() {
      this.fetchData()
    },

    // 表格选择项变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 格式化品类显示
    formatCategory(row) {
      const category = this.categoryOptions.find(item => item.id === row.categoryId)
      return category ? category.name : '--'
    },

    // 格式化成本类型显示
    formatCostType(row) {
      const costType = this.costTypeOptions.find(item => item.dictCode === row.costCategory)
      return costType ? `<div>中文：${costType.dictLabel}</div> ${costType.remark ? `<div>英文：${costType.remark}</div>` : ''}` : '--'
    },

    // 格式化成本项显示
    formatCostItem(row) {
      const costItem = this.allCostItems.find(item => item.dictCode === row.costProject)
      return costItem ? `<div>中文：${costItem.dictLabel}</div> ${costItem.remark ? `<div>英文：${costItem.remark}</div>` : ''}` : '--'
    },
  }
}
</script>

<style lang="scss" scoped>
.device-cost-container {
  .search-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
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

  .pagination-section {
    margin-top: 20px;
    text-align: right;
  }
}
</style>