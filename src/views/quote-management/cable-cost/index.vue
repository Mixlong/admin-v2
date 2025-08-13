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
        <!-- <el-button type="warning" @click="handleBatchImport" icon="el-icon-upload2"
          v-hasPermi="['quote:cable:import']">批量导入</el-button> -->
        <el-button type="danger" @click="handleBatchDelete" icon="el-icon-delete" :disabled="selectedRows.length === 0"
          v-hasPermi="['quote:cable:remove']">批量删除</el-button>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus"
          v-hasPermi="['quote:cable:add']">新增线缆成本</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="displayTableData" v-loading="loading" border style="width: 100%" :height="tableHeight(-30)"
        @selection-change="handleSelectionChange" @row-click="handleRowClick" row-key="id"
        :row-class-name="getRowClassName">
        <el-table-column type="selection" width="55" align="center" :selectable="row => row.isParent">
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" align="center" width="140">
          <template slot-scope="scope">
            <div v-if="scope.row.isParent" class="supplier-cell">
              <i v-if="scope.row.hasChildren && scope.row.list && scope.row.list.length > 0"
                :class="isRowExpanded(scope.row.id) ? 'el-icon-minus' : 'el-icon-plus'" class="expand-icon"
                @click.stop="toggleExpand(scope.row)"></i>
              <span class="supplier-name">{{ getSupplierName(scope.row.supplier) }}</span>
            </div>
            <div v-else class="child-supplier">
              <span class="sub-item-indicator">└</span>
              <span class="sub-item-note"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="costType" label="类型" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="scope.row.isParent" class="parent-summary">
              <span class="summary-text">汇总</span>
            </div>
            <span v-else class="cost-type-tag" :class="getCostTypeClass(scope.row)">
              {{ formatCostType(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="itemInfo" label="型号" align="center" min-width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.isParent" class="parent-summary">
              <span class="summary-text">{{ getParentSummary(scope.row) }}</span>
            </div>
            <div v-else class="item-detail">
              {{ formatItemInfo(scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" align="center" width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.isParent" class="parent-summary">
              <span class="summary-text">-</span>
            </div>
            <span v-else class="item-price">
              {{ formatPrice(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center">
          <template slot-scope="scope">
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
                v-hasPermi="['quote:cable:edit']">编辑</el-button>
              <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)" icon="el-icon-delete"
                v-hasPermi="['quote:cable:remove']">删除</el-button>
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

    <!-- 新增线缆成本弹窗 -->
    <AddCableCostDialog :visible.sync="addDialogVisible" :editData="editData" :supplierOptions="supplierOptions"
      :existingSuppliers="existingSuppliers" @success="handleDialogSuccess">
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
  computed: {
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
    },

    // 获取已存在的供应商列表
    existingSuppliers() {
      const suppliers = []
      this.tableData.forEach(row => {
        if (row.isParent && row.supplier) {
          suppliers.push(row.supplier)
        }
      })
      return [...new Set(suppliers)] // 去重
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
          this.tableData = this.flattenTableData(res.data?.list || [])
          this.pagination.total = res.data?.total || 0
          // 清空展开状态
          this.expandedRows = []
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
        // 根据API文档，删除要用supplier代理商ID
        const supplierIds = this.selectedRows.map(row => row.supplier).filter(id => id)

        if (supplierIds.length === 0) {
          this.$message.error('选中的记录中没有有效的供应商信息，无法删除')
          return
        }

        deleteCableCosts(supplierIds).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.selectedRows = [] // 清空选中的行
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
        // 根据API文档，删除要用supplier代理商ID
        const supplierId = row.supplier
        if (!supplierId) {
          this.$message.error('无效的供应商信息，无法删除')
          return
        }

        deleteCableCosts([supplierId]).then((res) => {
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
    // 扁平化表格数据，处理嵌套结构
    flattenTableData(rawData) {
      const flatData = []

      rawData.forEach((item, index) => {
        // 获取所有子项，不过滤任何项目
        const allChildren = item.list && Array.isArray(item.list) ? item.list : []

        const hasValidChildren = allChildren.length > 0

        // 添加主记录（代表整个供应商的成本汇总）
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

        // 添加所有子记录（显示list中的所有项目）
        if (hasValidChildren) {
          allChildren.forEach((subItem, subIndex) => {
            const subRecord = {
              ...subItem,
              isParent: false,
              level: 1,
              parentId: mainRecord.id,
              hasChildren: false,
              // 为子记录生成唯一ID，确保即使ID相同也有不同的显示ID
              id: `child-${index}-${subIndex}-${subItem.id || subIndex}`,
              originalId: subItem.id
            }
            flatData.push(subRecord)
          })
        }
      })

      return flatData
    },

    // 获取行的CSS类名
    getRowClassName({ row }) {
      if (row.level === 1) {
        return 'child-row'
      } else {
        // 父行，检查是否可展开
        const isExpandable = row.isParent && row.hasChildren && row.list && row.list.length > 0
        return isExpandable ? 'parent-row expandable-row' : 'parent-row'
      }
    },

    // 检查行是否已展开
    isRowExpanded(rowId) {
      return this.expandedRows.includes(rowId)
    },

    // 处理行点击事件
    handleRowClick(row) {
      // 只有父行且有子项时才允许点击展开
      if (row.isParent && row.hasChildren && row.list && row.list.length > 0) {
        this.toggleExpand(row)
      }
    },

    // 切换行展开状态
    toggleExpand(row) {
      const rowId = row.id
      const index = this.expandedRows.indexOf(rowId)
      if (index > -1) {
        this.expandedRows.splice(index, 1)
      } else {
        this.expandedRows.push(rowId)
      }
    },

    // 格式化成本类型
    formatCostType(row) {
      if (row.costCableType === 1) {
        return '防水头'
      } else if (row.costCableType === 2) {
        if (row.commonLinearPrice > 0) return '普通线'
        if (row.ulLinearPrice > 0) return 'UL线'
        return '线缆'
      } else if (row.costCableType === 3) {
        return '插线端子'
      }
      return '-'
    },

    // 获取成本类型样式类名
    getCostTypeClass(row) {
      if (row.costCableType === 1) {
        return 'waterproof-type'
      } else if (row.costCableType === 2) {
        return 'cable-type'
      } else if (row.costCableType === 3) {
        return 'terminal-type'
      }
      return ''
    },

    // 格式化规格信息
    formatItemInfo(row) {
      if (row.costCableType === 1) {
        // 防水头：显示型号
        return row.cableModel || '-'
      } else if (row.costCableType === 2) {
        // 线缆：显示型号
        return row.linearModel || '-'
      } else if (row.costCableType === 3) {
        // 插线端子：显示型号
        return row.triggerTerminalModel || '-'
      }
      return '-'
    },

    // 格式化价格信息
    formatPrice(row) {
      if (row.costCableType === 1) {
        // 防水头价格
        return `¥${(row.waterproofHeadPrice || 0).toFixed(2)}`
      } else if (row.costCableType === 2) {
        // 线缆价格
        if (row.commonLinearPrice > 0) {
          return `¥${(row.commonLinearPrice || 0).toFixed(2)}/米`
        } else if (row.ulLinearPrice > 0) {
          return `¥${(row.ulLinearPrice || 0).toFixed(2)}/米`
        }
        return '-'
      } else if (row.costCableType === 3) {
        // 插线端子价格
        return `¥${(row.triggerTerminalPrice || 0).toFixed(2)}`
      }
      return '-'
    },

    // 获取父行汇总信息
    getParentSummary(row) {
      if (!row.list || row.list.length === 0) return '-'

      // 基于list中的所有项目进行统计
      const allItems = row.list

      const types = []
      const waterproof = allItems.filter(item => item.costCableType === 1)
      const cables = allItems.filter(item => item.costCableType === 2)
      const terminals = allItems.filter(item => item.costCableType === 3)

      if (waterproof.length > 0) types.push(`防水头×${waterproof.length}`)
      if (cables.length > 0) types.push(`线缆×${cables.length}`)
      if (terminals.length > 0) types.push(`端子×${terminals.length}`)

      return types.join(' | ') || '-'
    },

    // 格式化总价格
    formatTotalPrice(row) {
      if (!row.list || row.list.length === 0) return '-'

      // 基于list中的所有项目进行价格计算
      const allItems = row.list

      let total = 0
      allItems.forEach(item => {
        if (item.costCableType === 1) {
          total += (item.waterproofHeadPrice || 0)
        } else if (item.costCableType === 2) {
          total += (item.commonLinearPrice || 0) + (item.ulLinearPrice || 0)
        } else if (item.costCableType === 3) {
          total += (item.triggerTerminalPrice || 0)
        }
      })

      return `¥${total.toFixed(2)}`
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

  // 供应商列样式
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

  // 子项备注样式
  .sub-item-note {
    color: #909399;
    font-size: 12px;
  }

  // 成本类型标签样式
  .cost-type-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;

    &.waterproof-type {
      background-color: #67C23A;
    }

    &.cable-type {
      background-color: #409EFF;
    }

    &.terminal-type {
      background-color: #E6A23C;
    }
  }

  // 规格信息样式
  .item-detail {
    font-size: 13px;
    color: #606266;
    line-height: 1.4;
  }

  // 价格信息样式
  .item-price {
    font-weight: 600;
    color: #E6A23C;
    font-size: 13px;
  }
}
</style>