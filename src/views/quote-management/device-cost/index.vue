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

        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button type="success" @click="handleCategoryManage" icon="el-icon-setting"
          v-hasPermi="['quote:device:category']">类别管理</el-button>
        <!-- <el-button type="warning" @click="handleBatchImport" icon="el-icon-upload2"
          v-hasPermi="['quote:device:import']">批量导入</el-button> -->
        <el-button type="danger" @click="handleBatchDelete" icon="el-icon-delete" :disabled="selectedRows.length === 0"
          v-hasPermi="['quote:device:remove']">批量删除</el-button>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus"
          v-hasPermi="['quote:device:add']">新增</el-button>
      </div>

    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="displayTableData" v-loading="loading" border style="width: 100%" :height="tableHeight(-30)"
        @selection-change="handleSelectionChange" @row-click="handleRowClick" row-key="id"
        :row-class-name="getRowClassName">
        <el-table-column type="selection" width="55" align="center" :selectable="row => row.isParent">
        </el-table-column>
        <el-table-column prop="categoryId" label="品类" align="center" width="140">
          <template slot-scope="scope">
            <div v-if="scope.row.isParent" class="supplier-cell">
              <i v-if="scope.row.hasChildren && scope.row.list && scope.row.list.length > 1"
                :class="isRowExpanded(scope.row.id) ? 'el-icon-minus' : 'el-icon-plus'" class="expand-icon"
                @click.stop="toggleExpand(scope.row)"></i>
              <span class="supplier-name">{{ formatCategory(scope.row) }}</span>
            </div>
            <div v-else class="child-supplier">
              <span class="sub-item-indicator">└</span>
              <span class="sub-item-note"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="costTypeName" label="成本类型" align="center">
          <template slot-scope="scope">
            <!-- 子记录显示成本类型，主记录显示汇总信息 -->
            <div v-if="scope.row.isParent" class="parent-summary">
              <span class="summary-text" v-html="formatCostType(scope.row.list[0])"> </span>
            </div>
            <div v-else v-html="formatCostType(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="costItemName" label="成本项" align="center">
          <template slot-scope="scope">
            <!-- 子记录显示成本项，主记录不显示 -->
            <div v-if="scope.row.isParent" class="parent-summary">
              <span class="summary-text" v-html="formatCostItem(scope.row.list[0])"></span>
            </div>
            <div v-else v-html="formatCostItem(scope.row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成本金额" align="center">
          <template slot-scope="scope">
            <!-- 主记录显示总金额，子记录显示单项金额 -->
            <span v-if="scope.row.isParent" class="total-amount">
              ¥{{ scope.row.list[0].amount.toFixed(2) }}
            </span>
            <span v-else class="item-amount">
              ¥{{ scope.row.amount.toFixed(2) || '0.00' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center">
          <template slot-scope="scope">
            <!-- 主记录显示创建时间，子记录不显示 -->
            <span v-if="scope.row.isParent">{{ scope.row.createTime }}</span>
            <span v-else class="sub-item-note">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.isParent">{{ scope.row.createBy }}</span>
            <span v-else class="sub-item-note">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.isParent">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit"
                v-hasPermi="['quote:device:edit']">编辑</el-button>
              <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)" icon="el-icon-delete"
                v-hasPermi="['quote:device:remove']">删除</el-button>
            </template>
            <span v-else class="sub-item-note">--</span>
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
    <AddBatchCostDialog :visible.sync="addDialogVisible" :editData="editData" :costTypes="costTypeOptions"
      :costItems="allCostItems" :categoryOptions="categoryOptions" @success="handleDialogSuccess"></AddBatchCostDialog>
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
import AddBatchCostDialog from './components/AddBatchCostDialog'
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
    AddBatchCostDialog,
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
      expandedRows: [], // 存储展开的行ID
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
    },

    // 根据展开状态过滤显示的表格数据
    displayTableData() {
      return this.tableData.filter(row => {
        if (row.isParent) {
          // 主记录总是显示
          return true
        } else {
          // 子记录只有在父记录展开时才显示
          return this.expandedRows.includes(row.parentId)
        }
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
        this.tableData = this.flattenTableData(res.data?.list || [])
        this.pagination.total = res.data?.total || 0
        // 清空展开状态
        this.expandedRows = []
      }).catch(() => {
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
    },

    // 获取行的CSS类名
    getRowClassName({ row }) {
      if (row.level === 1) {
        return 'child-row'
      } else {
        // 父行，检查是否可展开
        const isExpandable = row.isParent && row.hasChildren && row.list && row.list.length > 1
        return isExpandable ? 'parent-row expandable-row' : 'parent-row'
      }
    },

    // 检查行是否已展开
    isRowExpanded(rowId) {
      return this.expandedRows.includes(rowId)
    },

    // 处理行点击事件
    handleRowClick(row, column, event) {
      // 只有父行且有子项时才允许点击展开
      if (row.isParent && row.hasChildren && row.list && row.list.length > 1) {
        this.toggleExpand(row)
      }
    },

    // 切换行展开状态
    toggleExpand(row) {
      console.log('toggleExpand被调用:', row)
      console.log('row.hasChildren:', row.hasChildren)
      console.log('row.id:', row.id)
      console.log('当前expandedRows:', this.expandedRows)

      const rowId = row.id
      const index = this.expandedRows.indexOf(rowId)
      if (index > -1) {
        console.log('收起行:', rowId)
        this.expandedRows.splice(index, 1)
      } else {
        console.log('展开行:', rowId)
        this.expandedRows.push(rowId)
      }

      console.log('更新后expandedRows:', this.expandedRows)
    },

    // 计算总金额
    calculateTotalAmount(row) {
      if (!row.list || row.list.length === 0) {
        return '0.00'
      }
      const total = row.list.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0)
      }, 0)
      return total.toFixed(2)
    },

    // 扁平化表格数据，处理嵌套结构
    flattenTableData(rawData) {
      const flatData = []

      console.log('原始数据:', rawData)

      rawData.forEach((item, index) => {
        console.log(`处理第${index}项:`, item)
        console.log('list存在:', !!item.list)
        console.log('list长度:', item.list ? item.list.length : 0)
        console.log('list内容:', item.list)

        // 检查list是否是有效的子项数组
        const hasValidChildren = item.list &&
          Array.isArray(item.list) &&
          item.list.length > 0 &&
          // 确保list不是重复的父对象
          item.list.some(subItem => subItem.id !== item.id)

        console.log('hasValidChildren:', hasValidChildren)

        // 添加主记录
        const mainRecord = {
          ...item,
          isParent: true,
          level: 0,
          hasChildren: hasValidChildren,
          // 确保主记录有唯一ID
          originalId: item.id,
          displayId: `parent-${index}-${item.id}`,
          id: `parent-${index}-${item.id}`  // 使用displayId作为表格的row-key
        }
        flatData.push(mainRecord)

        // 添加子记录
        if (hasValidChildren) {
          item.list.forEach((subItem, subIndex) => {
            // 跳过重复的父对象
            if (subItem.id === item.id) {
              console.log('跳过重复的父对象:', subItem)
              return
            }

            const subRecord = {
              ...subItem,
              isParent: false,
              level: 1,
              parentId: mainRecord.id,
              hasChildren: false,
              // 为子记录生成唯一ID
              id: `child-${index}-${subIndex}-${subItem.id || subIndex}`,
              originalId: subItem.id
            }
            flatData.push(subRecord)
          })
        }
      })

      console.log('扁平化后的数据:', flatData)
      return flatData
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
          id: row.categoryId,  // 使用categoryId
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
          id: row.categoryId,  // 使用categoryId
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
      // 如果是主记录，传递完整的数据结构
      if (row.isParent) {
        this.editData = {
          ...row,
          id: row.originalId || row.id  // 使用原始ID
        }
      } else {
        // 如果是子记录，需要找到对应的主记录
        const parentRow = this.tableData.find(item => item.id === row.parentId)
        this.editData = {
          ...parentRow,
          id: parentRow.originalId || parentRow.id
        }
      }
      this.addDialogVisible = true
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
      return `<div>${costType.dictLabel}</div>`
    },

    // 格式化成本项显示
    formatCostItem(row) {
      const costItem = this.allCostItems.find(item => item.dictCode === row.costProject)
      return `<div>${costItem.dictLabel}</div>`
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

  // 层级显示样式
  .level-cell {
    display: flex;
    align-items: center;

    .expand-icon {
      cursor: pointer;
      margin-right: 8px;
      color: #409EFF;
      font-size: 14px;

      &:hover {
        color: #66b1ff;
      }
    }

    .level-indicator {
      margin-right: 8px;
      color: #909399;
      font-size: 12px;
      visibility: hidden;
    }

    .level-text {
      font-size: 12px;
      color: #606266;
    }
  }

  // 表格行样式
  ::v-deep .parent-row {
    font-weight: bold;
    background-color: #fff;

    &.expandable-row {
      cursor: pointer;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  ::v-deep .child-row {
    background-color: #f5f7fa;

    td {
      border-top: 1px dashed #e4e7ed;
    }

    // 隐藏子行的复选框
    .el-checkbox {
      display: none;
    }
  }

  // 汇总信息样式
  .parent-summary {
    .summary-text {
      color: #909399;
      font-size: 12px;
    }
  }

  // 金额显示样式
  .total-amount {
    font-weight: bold;
    color: #E6A23C;
    font-size: 14px;
  }

  .item-amount {
    color: #606266;
  }

  // 品类列样式
  .supplier-cell {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .expand-icon {
      cursor: pointer;
      margin-right: 8px;
      color: #409EFF;
      font-size: 14px;

      &:hover {
        color: #66b1ff;
      }
    }

    .supplier-name {
      font-weight: 600;
      color: #303133;
    }
  }

  .child-supplier {
    display: flex;
    align-items: center;
    justify-content: center;

    .sub-item-indicator {
      margin-right: 4px;
      color: #909399;
      font-size: 12px;
    }

    .sub-item-note {
      color: #909399;
      font-size: 12px;
    }
  }

  // 子项备注样式
  .sub-item-note {
    color: #909399;
    font-size: 12px;
  }
}
</style>