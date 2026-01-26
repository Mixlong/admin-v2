<template>
  <div class="outsourcing-purchase-container app-container">
    <!-- 搜索区域 -->
    <IntelligentSearchForm 
      ref="searchForm" 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      @reset="handleReset" 
      :defaultVisibleCount="4" 
      @filters-cleared="handleReset"
    >
      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button 
          v-hasPermi="['outsourcing:purchase:add']"
          type="primary" 
          size="mini" 
          icon="el-icon-plus" 
          @click="handleAdd"
        >
          新增采购订单
        </el-button>
        <el-button 
          type="success" 
          size="mini" 
          @click="handleAddContact"
          v-hasPermi="['outsourcing:production:addContact']"
        >
          添加联系人
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 表格区域 -->
    <el-table 
      ref="table" 
      :data="tableData" 
      v-loading="loading" 
      border 
      style="width: 100%"
      :height="tableHeight(-30)"
      row-key="id"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="purchaseOrderCode" label="采购单号" align="center" min-width="150">
        <template slot-scope="scope">{{ scope.row.purchaseOrderCode || '--' }}</template>
      </el-table-column>
      <el-table-column prop="address" label="生产地点" align="center" width="120">
        <template slot-scope="scope">{{ scope.row.address || '--' }}</template>
      </el-table-column>
      <el-table-column prop="purchaseOrderImg" label="采购订单图" align="center" width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.purchaseOrderImg" class="img-wrapper">
            <el-image 
              :src="getFirstImg(scope.row.purchaseOrderImg)" 
              :preview-src-list="getImgList(scope.row.purchaseOrderImg)" 
              style="width: 60px; height: 60px" 
              fit="cover" 
            />
            <span v-if="getImgList(scope.row.purchaseOrderImg).length > 1" class="img-count">
              {{ getImgList(scope.row.purchaseOrderImg).length }}张
            </span>
          </div>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="cancelStatus" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.cancelStatus === 1 ? 'danger' : 'success'" size="small">
            {{ scope.row.cancelStatus === 1 ? '已撤销' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" align="center" width="100">
        <template slot-scope="scope">{{ scope.row.createBy || '--' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" width="160">
        <template slot-scope="scope">{{ scope.row.createTime || '--' }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240">
        <template slot-scope="scope">
          <el-button 
            v-hasPermi="['outsourcing:purchase:edit']"
            size="mini" 
            type="text" 
            icon="el-icon-edit" 
            @click="handleEdit(scope.row)"
            :disabled="scope.row.cancelStatus === 0"
          >
            编辑
          </el-button>
          <el-button 
            v-hasPermi="['outsourcing:purchase:publish']"
            size="mini" 
            type="text" 
            icon="el-icon-upload2" 
            @click="handlePublish(scope.row)" 
            v-show="scope.row.cancelStatus === 1"
          >发布</el-button>
          <el-button 
            v-hasPermi="['outsourcing:purchase:cancel']"
            size="mini" 
            type="text" 
            icon="el-icon-refresh-left" 
            @click="handleCancel(scope.row)"
            v-show="scope.row.cancelStatus === 0"
          >撤销</el-button>
          <el-button 
            v-hasPermi="['outsourcing:purchase:delete']"
            size="mini" 
            type="text" 
            icon="el-icon-delete" 
            @click="handleDelete(scope.row)" 
            style="color: #F56C6C"
          >删除</el-button>
          <el-button 
          v-if="scope.row.cancelStatus === 0"
            v-hasPermi="['outsourcing:production:add']"
            size="mini" 
            type="text" 
            icon="el-icon-plus" 
            @click="handleCreateProduction(scope.row)" 
            style="color: #409EFF"
          >新建外协资料</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
        :current-page="pagination.current" 
        :page-sizes="[10, 20, 50, 100]" 
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper" 
        :total="pagination.total" 
      />
    </div>

    <!-- 新增对话框组件 -->
    <AddPurchaseDialog ref="addDialog" @success="fetchData" />

    <!-- 联系人管理对话框 -->
    <el-dialog 
      title="联系人管理" 
      :visible.sync="contactDialogVisible" 
      width="80%" 
      top="0vh" 
      append-to-body
      :close-on-click-modal="false" 
      @close="handleContactDialogClose" 
      custom-class="contact-dialog"
    >
      <div class="contact-dialog-content">
        <ContactManagement ref="contactManagement" :embedded="true" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="contactDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 新建外协资料对话框组件 -->
    <ProductionProcessFormDialog
      :visible.sync="productionDialogVisible"
      :is-edit="false"
      :initial-data="productionInitialData"
      :category-list="categoryList"
      :show-order-code-in-smt="true"
      @submit="handleProductionSubmit"
      @close="handleProductionDialogClose"
    />
  </div>
</template>


<script>
import { getOutsourcingOrderList, publishOrder, cancelOrder, deleteOrder } from '@/api/outsourcing/order'
import { addOutsourcingProduction } from '@/api/outsourcing/production'
import { categoryComputerDict } from '@/api/third/fileConfig'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import AddPurchaseDialog from './components/AddPurchaseDialog.vue'
import ContactManagement from '../contact/index.vue'
import ProductionProcessFormDialog from '../production/components/ProductionProcessFormDialog.vue'

export default {
  name: 'OutsourcingPurchase',
  components: { 
    IntelligentSearchForm,
    AddPurchaseDialog,
    ContactManagement,
    ProductionProcessFormDialog
  },
  data() {
    return {
      // 搜索表单
      searchForm: { 
        purchaseOrderCode: '' 
      },
      // 搜索字段配置
      searchFields: [
        {
          key: 'purchaseOrderCode',
          label: '采购单号',
          component: 'el-input',
          placeholder: '请输入采购单号'
        }
      ],
      // 表格数据
      tableData: [],
      loading: false,
      // 分页
      pagination: { 
        current: 1, 
        size: 20, 
        total: 0 
      },
      // 联系人管理
      contactDialogVisible: false,
      // 新建外协资料对话框
      productionDialogVisible: false,
      productionInitialData: null,
      // 品类列表
      categoryList: []
    }
  },
  created() {
    this.fetchData()
    this.loadCategoryList()
  },
  methods: {
    /** 获取列表数据 */
    fetchData() {
      this.loading = true
      getOutsourcingOrderList({
        p: this.pagination.current,
        l: this.pagination.size,
        purchaseOrderCode: this.searchForm.purchaseOrderCode
      }).then(res => {
        if (res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
        }
      }).finally(() => { 
        this.loading = false 
      })
    },
    /** 获取第一张图片 */
    getFirstImg(imgs) { 
      return imgs ? imgs.split(',')[0] : '' 
    },
    /** 获取图片列表 */
    getImgList(imgs) { 
      return imgs ? imgs.split(',') : [] 
    },
    /** 搜索 */
    handleSearch() { 
      this.pagination.current = 1
      this.fetchData() 
    },
    /** 重置 */
    handleReset() { 
      this.searchForm.purchaseOrderCode = ''
      this.handleSearch() 
    },
    /** 分页大小改变 */
    handleSizeChange(val) { 
      this.pagination.size = val
      this.fetchData() 
    },
    /** 页码改变 */
    handleCurrentChange(val) { 
      this.pagination.current = val
      this.fetchData() 
    },
    /** 新增 */
    handleAdd() { 
      this.$refs.addDialog.open() 
    },
    /** 编辑 */
    handleEdit(row) {
      if (row && row.cancelStatus === 0) {
        this.$message.warning('发布状态下不可编辑')
        return
      }
      this.$refs.addDialog.open(row) 
    },
    /** 发布 */
    handlePublish(row) {
      this.$confirm('确认发布该订单?', '提示', { type: 'warning' }).then(() => {
        publishOrder(row.id).then(res => {
          if (res.code === 200) { 
            this.$message.success('发布成功')
            this.fetchData() 
          }
        })
      }).catch(() => {})
    },
    /** 撤销 */
    handleCancel(row) {
      this.$confirm('确认撤销该订单?', '提示', { type: 'warning' }).then(() => {
        cancelOrder(row.id).then(res => {
          if (res.code === 200) { 
            this.$message.success('撤销成功')
            this.fetchData() 
          }
        })
      }).catch(() => {})
    },
    /** 删除 */
    handleDelete(row) {
      this.$confirm('确认删除该订单?', '提示', { type: 'warning' }).then(() => {
        deleteOrder(row.id).then(res => {
          if (res.code === 200) { 
            this.$message.success('删除成功')
            this.fetchData() 
          }
        })
      }).catch(() => {})
    },
    /** 添加联系人 */
    handleAddContact() {
      this.contactDialogVisible = true
    },
    /** 联系人对话框关闭 */
    handleContactDialogClose() {
      // 对话框关闭时可以执行一些清理操作
    },
    /** 计算表格高度 */
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset
    },
    /** 新建外协资料 */
    handleCreateProduction(row) {
      // 设置初始数据，不管SMT还是打板都传入采购单号
      this.productionInitialData = {
        orderCode: row.purchaseOrderCode || '',  // 采购单号（两种流程都使用）
        partNo: row.partNo || '',                 // 打板流程的料号
        productionProcess: this.resolveProductionProcess(row) || 'SMT'
      }
      // 打开对话框
      this.productionDialogVisible = true
    },
    /** 提交新建外协资料 */
    handleProductionSubmit(formData) {
      // 过滤掉空值字段
      const submitData = {}
      Object.keys(formData).forEach((key) => {
        const value = formData[key]
        if (value !== '' && value !== null && value !== undefined) {
          submitData[key] = value
        }
      })
      
      addOutsourcingProduction(submitData)
        .then((response) => {
          if (response.code === 200) {
            this.$message.success('新建外协资料成功')
            this.productionDialogVisible = false
            // 可以刷新当前页面数据，或者提示用户去外协资料页面查看
          }
        })
    },
    /** 新建外协资料对话框关闭 */
    handleProductionDialogClose() {
      // 清空初始数据
      this.productionInitialData = null
    },
    /** 加载品类列表 */
    loadCategoryList() {
      categoryComputerDict().then(res => {
        if (res.code === 200 && res.data) {
          this.categoryList = res.data
        }
      }).catch(error => {
        console.error('获取品类数据失败:', error)
      })
    },
    /** 解析生产流程类型（采购类型） */
    resolveProductionProcess(row) {
      const candidate =
        row?.productionProcess ||
        row?.processType ||
        row?.type ||
        row?.purchaseType ||
        ''
      const normalized = String(candidate).trim()
      return normalized || '打板'
    }
  }
}
</script>

<style lang="scss" scoped>
.outsourcing-purchase-container {
  .pagination-section {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
  .img-wrapper {
    position: relative;
    display: inline-block;
    .img-count {
      position: absolute;
      right: -5px;
      bottom: -5px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
    }
  }
}

/* 联系人对话框样式 */
::v-deep .contact-dialog {
  height: 85vh;
  display: flex;
  flex-direction: column;
}

::v-deep .contact-dialog .el-dialog__body {
  flex: 1;
  overflow: hidden;
  padding: 10px 20px;
}

.contact-dialog-content {
  height: 100%;
  overflow: hidden;
}

::v-deep .contact-dialog-content .company-contact-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 新建外协资料对话框样式 ========== */
::v-deep .production-dialog {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .production-dialog .el-dialog__header {
  background-color: #ffffff;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

::v-deep .production-dialog .el-dialog__title {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
}

::v-deep .production-dialog .el-dialog__body {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

::v-deep .production-dialog .el-dialog__footer {
  padding: 16px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
}

.form-container {
  background-color: transparent;
}

.form-fieldset {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 22px 24px 25px;
  margin-bottom: 18px;
  background-color: #fafbfc;
  transition: all 0.2s ease;
}

.form-fieldset:last-child {
  margin-bottom: 0;
}

.form-fieldset legend {
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  border: none;
  width: auto;
  margin-left: -4px;
  margin-bottom: 0;
  line-height: 1.4;
}

.form-fieldset legend i {
  margin-right: 6px;
  color: #909399;
  font-size: 13px;
  vertical-align: middle;
}

::v-deep .form-container .el-form-item {
  margin-bottom: 18px;
}

::v-deep .form-container .el-form-item:last-child {
  margin-bottom: 0;
}

::v-deep .form-container .el-form-item__label {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 40px;
  text-align: right;
}

::v-deep .form-container .el-form-item__content {
  line-height: 40px;
}

::v-deep .form-container .el-input__inner {
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

::v-deep .form-container .el-input__inner:hover {
  border-color: #c0c4cc;
}

::v-deep .form-container .el-input__inner:focus {
  border-color: #409eff;
  background-color: #ffffff;
}

.dialog-footer-new {
  text-align: right;
}

.dialog-footer-new .el-button {
  min-width: 90px;
  border-radius: 4px;
  font-size: 14px;
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.dialog-footer-new .el-button--default {
  color: #606266;
  background-color: #ffffff;
  border-color: #e4e7ed;
}

.dialog-footer-new .el-button--default:hover {
  color: #409eff;
  border-color: #c0c4cc;
  background-color: #f5f7fa;
}

.dialog-footer-new .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.dialog-footer-new .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.3);
}
</style>
