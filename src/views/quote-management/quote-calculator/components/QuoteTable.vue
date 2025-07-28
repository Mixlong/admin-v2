<template>
  <div class="quote-table">
    <!-- 表格操作栏 -->

    <el-table :data="paginatedData" border stripe empty-text="暂无数据" style="width: 100%"
      @selection-change="handleSelectionChange" :row-class-name="getRowClassName" v-loading="loading">
      <!-- 选择列 -->

      <!-- 序号列 -->
      <el-table-column label="序号" width="80" align="center">
        <template slot-scope="scope">
          {{ scope.$index + 1 + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <!-- 图片列 -->
      <el-table-column label="图片" width="100" align="center">
        <template slot-scope="scope">
          <div class="image-cell">
            <img v-if="scope.row.modelImg" :src="scope.row.modelImg" class="product-image"
              @click="previewImage(scope.row.modelImg)" />
            <div v-else class="image-placeholder">
              <i class="el-icon-picture"></i>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 产品型号列 -->
      <el-table-column prop="model" label="产品型号" width="150" show-overflow-tooltip />

      <!-- 标准规格列 -->
      <el-table-column label="标准规格" align="center" min-width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="currentLanguage === 'zh'" v-html="scope.row.standardSpec"> </span>
          <span v-else v-html="scope.row.standardSpecEn"> </span>
        </template>
      </el-table-column>

      <!-- 备注单价列 -->
      <el-table-column label="含税单价" align="center">
        <template slot-scope="scope">
          <span class="price-text">
            {{ formatTotalPrice(scope.row) }}
          </span>
        </template>
      </el-table-column>

      <!-- 备注列 -->
      <el-table-column prop="remark" align="center" label="备注" width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
          <span v-else class="placeholder-text">-</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="240" fixed="right" align="center">
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)"
              :disabled="isRowDisabled(scope.row)" :title="getEditTooltip(scope.row)">
              修改
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-copy-document" @click="handleCopy(scope.$index, scope.row)"
              :disabled="isRowDisabled(scope.row)" :title="getCopyTooltip(scope.row)">
              复制
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row)"
              :disabled="isRowDisabled(scope.row)" class="danger-button" :title="getDeleteTooltip(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total" background />
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog :visible.sync="imagePreviewVisible" title="图片预览" width="600px" center>
      <div class="image-preview-container">
        <img :src="previewImageUrl" class="preview-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getQuotationList, deleteQuotation, batchDeleteQuotation } from '@/api/quote-management/quotation'

export default {
  name: 'QuoteTable',
  props: {
    // 从父组件传入的报价项目数据（用于临时展示）
    quoteItems: {
      type: Array,
      default: () => []
    },
    // 搜索参数
    searchParams: {
      type: Object,
      default: () => ({})
    },
    // 是否自动加载数据
    autoLoad: {
      type: Boolean,
      default: true
    },
    // 临时key
    temporaryKey: {
      type: String,
      default: ''
    },
    // 字典数据
    dictData: {
      type: Object,
      default: () => ({
        customerTypes: [],
        productTaxRates: [],
        afterSalesRates: []
      })
    },
    // 当前语言
    currentLanguage: {
      type: String,
      default: 'zh'
    }
  },
  data() {
    return {
      imagePreviewVisible: false,
      previewImageUrl: '',
      selectedRows: [], // 选中的行数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      tableData: [] // 表格数据
    }
  },
  computed: {
    // 分页后的数据 - 优先使用父组件传入的quoteItems，否则使用API数据
    paginatedData() {
      // 如果有父组件传入的数据且不为空，优先使用
      if (this.quoteItems && this.quoteItems.length > 0) {
        return this.quoteItems;
      }
      // 否则使用API获取的数据
      return this.tableData;
    }
  },
  watch: {
    // 监听搜索参数变化
    searchParams: {
      deep: true,
      handler() {
        this.currentPage = 1;
        this.fetchData();
      }
    },
    temporaryKey(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchData();
      }
    }
  },
  mounted() {
    // 如果有temporaryKey，就尝试获取API数据
    if (this.temporaryKey) {
      this.fetchData();
    }
  },
  methods: {
    // 获取数据
    async fetchData() {
      this.loading = true;
      try {
        const params = {
          current: this.currentPage,
          size: this.pageSize,
          key: this.temporaryKey, // 添加临时key
          ...this.searchParams
        };

        const response = await getQuotationList(params);

        if (response.code === 200) {
          // 根据实际API返回格式解析数据
          if (Array.isArray(response.data)) {
            // 如果data直接是数组
            this.tableData = response.data;
            this.total = response.data.length;
          } else if (response.data && response.data.records) {
            // 如果data是分页格式 {records: [], total: 0}
            this.tableData = response.data.records || [];
            this.total = response.data.total || 0;
          } else {
            // 其他情况
            this.tableData = [];
            this.total = 0;
          }

          // 🆕 通知父组件数据已更新，用于更新nextId
          this.$emit('data-updated', this.tableData);
        } else {
          this.$message.error(response.msg || '获取数据失败');
          this.tableData = [];
          this.total = 0;
        }
      } catch (error) {
        console.error('获取报价单列表失败:', error);
        this.$message.error('获取数据失败');
        this.tableData = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },

    // 刷新数据
    refreshData() {
      this.fetchData();
    },

    // 处理每页条数变化
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchData();
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchData();
    },
    // 编辑操作
    handleEdit(index, row) {
      console.log('编辑项目:', index, row)
      this.$emit('edit', index, row)
    },

    // 复制操作
    handleCopy(index, row) {
      console.log('复制项目:', index, row)
      // 发送复制事件到父组件，让父组件处理复制逻辑并弹出新增表单
      this.$emit('copy', index, row)
    },

    // 删除操作
    async handleDelete(index, row) {
      const itemName = row.model || `项目${index + 1}`

      this.$confirm(`确定要删除"${itemName}"吗？\n删除后将无法恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }).then(async () => {
        try {
          // 如果有API ID，调用API删除
          if (row.id && typeof row.id === 'string' && row.id.length > 10) {
            const response = await deleteQuotation(row.id);
            if (response.code === 200) {
              this.$message.success('删除成功');
              this.fetchData(); // 刷新数据
            } else {
              this.$message.error(response.msg || '删除失败');
            }
          } else {
            // 否则通知父组件进行本地删除
            this.$emit('delete', index, row);
            this.$message.success('删除成功');
          }
        } catch (error) {
          console.error('删除报价单失败:', error);
          this.$message.error('删除失败');
        }
      }).catch(() => {
        // 用户取消删除
      });
    },

    // 预览图片
    previewImage(imageUrl) {
      this.previewImageUrl = imageUrl
      this.imagePreviewVisible = true
    },

    // 格式化总价
    formatTotalPrice(row) {
      if (!row.totalPrice && row.totalPrice !== 0) return '-';
      const symbol = row.quotationType === 1 ? '¥' : '$';
      return `${symbol}${this.formatPrice(row.totalPrice)}`;
    },

    // 格式化价格
    formatPrice(price) {
      if (!price && price !== 0) return '0.00';
      return Number(price).toFixed(2);
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // 获取客户类型名称
    getCustomerTypeName(customerType) {
      if (!customerType) return '-';

      // 从字典数据中查找对应的名称
      if (this.dictData.customerTypes && this.dictData.customerTypes.length > 0) {
        const found = this.dictData.customerTypes.find(item => item.value === customerType);
        return found ? found.label : customerType;
      }

      // 如果没有字典数据，直接返回值
      return customerType;
    },

    // 获取产品税率名称
    getProductTaxRateName(taxRate) {
      if (!taxRate) return '-';

      if (this.dictData.productTaxRates && this.dictData.productTaxRates.length > 0) {
        const found = this.dictData.productTaxRates.find(item => item.value === taxRate);
        return found ? `${found.label}%` : `${taxRate}%`;
      }

      return `${taxRate}%`;
    },

    // 获取售后费用名称
    getAfterSalesRateName(afterSalesRate) {
      if (!afterSalesRate) return '-';

      if (this.dictData.afterSalesRates && this.dictData.afterSalesRates.length > 0) {
        const found = this.dictData.afterSalesRates.find(item => item.value === afterSalesRate);
        return found ? `${found.label}%` : `${afterSalesRate}%`;
      }

      return `${afterSalesRate}%`;
    },



    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的项目');
        return;
      }

      // 分离API数据和本地数据
      const apiRows = this.selectedRows.filter(row => row.id && typeof row.id === 'string' && row.id.length > 10)
      const localRows = this.selectedRows.filter(row => !row.id || typeof row.id !== 'string' || row.id.length <= 10)

      const confirmMessage = `确定要删除选中的 ${this.selectedRows.length} 条记录吗？\n${apiRows.length > 0 ? `• ${apiRows.length} 条已保存记录将从服务器删除\n` : ''}${localRows.length > 0 ? `• ${localRows.length} 条临时记录将从本地删除\n` : ''}删除后将无法恢复。`

      this.$confirm(confirmMessage, '批量删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }).then(async () => {
        try {
          let successCount = 0

          // 删除API数据
          if (apiRows.length > 0) {
            const ids = apiRows.map(row => row.id);
            const response = await batchDeleteQuotation(ids);
            if (response.code === 200) {
              successCount += apiRows.length
            } else {
              this.$message.error(response.msg || 'API删除失败');
              return
            }
          }

          // 删除本地数据
          if (localRows.length > 0) {
            // 获取本地数据的索引
            const localIndexes = localRows.map(row => {
              return this.tableData.findIndex(item => item === row)
            }).filter(index => index >= 0)

            // 通知父组件删除本地数据
            this.$emit('batch-delete', localIndexes);
            successCount += localRows.length
          }

          this.$message.success(`批量删除成功，共删除 ${successCount} 条记录`);
          this.selectedRows = []; // 清空选择

          // 如果有API删除，刷新数据
          if (apiRows.length > 0) {
            this.fetchData();
          }
        } catch (error) {
          console.error('批量删除报价单失败:', error);
          this.$message.error('批量删除失败');
        }
      }).catch(() => {
        // 用户取消删除
      });
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      // 可以根据行数据添加不同的样式类
      const classes = []

      // 如果行数据不完整，添加警告样式
      if (!row.model || !row.specification || row.quantity <= 0) {
        classes.push('incomplete-row')
      }

      // 如果总价为0，添加提示样式
      if (!row.totalPrice || row.totalPrice <= 0) {
        classes.push('zero-price-row')
      }

      return classes.join(' ')
    },

    // 检查行是否禁用操作
    isRowDisabled() {
      // 可以根据业务逻辑判断是否禁用操作
      // 例如：正在计算价格时禁用操作
      return false
    },

    // 获取编辑按钮提示文本
    getEditTooltip(row) {
      return row.model ? `编辑 ${row.model}` : '编辑此项目'
    },

    // 获取复制按钮提示文本
    getCopyTooltip(row) {
      return row.model ? `复制 ${row.model}` : '复制此项目'
    },

    // 获取删除按钮提示文本
    getDeleteTooltip(row) {
      return row.model ? `删除 ${row.model}` : '删除此项目'
    }
  },

  // 暴露给父组件的方法
  expose: ['fetchData', 'refreshData']
}
</script>

<style lang="scss" scoped>
.quote-table {

  overflow: hidden;


  .table-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 24px;

    .toolbar-right {
      .el-button {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }



  .image-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;

    .product-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid #f8f9fa;

      &:hover {
        transform: scale(1.1);
        border-color: #007bff;
        box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
      }
    }

    .image-placeholder {
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      color: #adb5bd;
      font-size: 18px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #007bff;
        color: #007bff;
        background: #e7f3ff;
      }
    }
  }

  .specification-cell,
  .price-config-cell {
    padding: 12px 8px;
    line-height: 1.5;
    font-size: 14px;

    .placeholder-text {
      color: #adb5bd;
      font-style: italic;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
    }
  }

  .price-text {
    font-weight: 600;
    color: #28a745;
    font-size: 15px;
  }

  .quantity-text {
    font-weight: 500;
    color: #495057;
    font-size: 14px;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;

    .el-button {
      padding: 6px 12px;
      font-size: 13px;
      border-radius: 6px;
      margin: 0;
      transition: all 0.3s ease;

      &.el-button--text {
        color: #007bff;
        background: transparent;

        &:hover {
          background: #e7f3ff;
          color: #0056b3;
          transform: translateY(-1px);
        }

        &.danger-button {
          color: #dc3545;

          &:hover {
            background: #f8d7da;
            color: #721c24;
          }
        }
      }
    }
  }
}

.image-preview-container {
  text-align: center;
  padding: 24px;

  .preview-image {
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}

:deep(.el-table) {
  border: none;
  border-radius: 0;

  .el-table__header {
    th {
      background: #f8f9fa;
      color: #495057;
      font-weight: 600;
      padding: 16px 0;
      border-bottom: 2px solid #e9ecef;
      font-size: 14px;

      .cell {
        padding: 0 16px;
      }
    }
  }

  .el-table__row {
    transition: all 0.3s ease;

    &:hover {
      background: #f8f9fa;
    }

    td {
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;

      .cell {
        padding: 0 16px;
        line-height: 1.5;
      }
    }

    &.incomplete-row {
      background: #fff5f5;
      border-left: 4px solid #dc3545;

      &:hover {
        background: #ffe6e6;
      }
    }

    &.zero-price-row {
      .price-text {
        color: #dc3545;
        background: #f8d7da;
        padding: 4px 8px;
        border-radius: 6px;
      }
    }
  }

  &::before {
    display: none;
  }
}

:deep(.el-pagination) {

  .btn-prev,
  .btn-next {
    border-radius: 8px;
    padding: 0 12px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .el-pager li {
    border-radius: 8px;
    margin: 0 2px;
    transition: all 0.3s ease;

    &.active {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    &:hover:not(.active) {
      background: #e7f3ff;
      transform: translateY(-1px);
    }
  }

  .el-pagination__sizes {
    margin-right: 16px;
  }
}

@media (max-width: 768px) {
  .quote-table {
    border-radius: 8px;
    margin: 0 8px;

    .table-toolbar {
      padding: 16px;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .toolbar-right {
        align-self: flex-end;
      }
    }




    .action-buttons {
      flex-direction: column;
      gap: 4px;

      .el-button {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }
}

.quote-table {
  background: #ffffff;
  overflow: hidden;

  // 响应式设计
  @media (max-width: 1200px) {
    .table-toolbar {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .toolbar-right {
        align-self: flex-end;
      }
    }

    .action-buttons {
      flex-direction: column;
      gap: 2px;

      .el-button {
        font-size: 11px;
        padding: 2px 6px;
      }
    }
  }

  @media (max-width: 768px) {
    border-radius: 4px;

    .table-toolbar {
      padding: 12px 16px;

      .table-title {
        font-size: 14px;
      }

      .item-count {
        font-size: 12px;
      }
    }


    .action-buttons {
      .el-button {
        font-size: 10px;
        padding: 2px 4px;

        i {
          margin-right: 2px;
        }
      }
    }
  }



  .image-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding: 5px 0;

    .product-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #dcdfe6;

      &:hover {
        transform: scale(1.1);
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }
    }

    .image-placeholder {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f7fa;
      border: 1px dashed #c0c4cc;
      border-radius: 4px;
      color: #c0c4cc;
      font-size: 16px;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .specification-cell,
  .price-config-cell {
    padding: 8px 0;
    line-height: 1.4;
    font-size: 13px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;

    .placeholder-text {
      color: #c0c4cc;
      font-style: italic;
      background: #f9f9f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .price-text {
    font-weight: 600;
    color: #e6a23c;
    font-size: 14px;
  }

  .quantity-text {
    font-weight: 500;
    color: #606266;
    font-size: 13px;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;

    .el-button {
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px;
      margin: 0;

      &.el-button--text {
        color: #409eff;

        &:hover {
          background-color: #ecf5ff;
          color: #66b1ff;
        }

        &.danger-button {
          color: #f56c6c;

          &:hover {
            background-color: #fef0f0;
            color: #f78989;
          }
        }
      }
    }
  }
}

.image-preview-container {
  text-align: center;
  padding: 20px;

  .preview-image {
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 8px;
  }
}

// 表格样式优化
:deep(.el-table) {
  .el-table__header {
    th {
      background: #f5f7fa;
      color: #303133;
      font-weight: 600;
      padding: 12px 0;

      .cell {
        font-size: 13px;
      }
    }
  }

  .el-table__row {
    transition: background-color 0.2s ease;

    &:hover {
      background: #f5f7fa;
    }

    // 不完整行样式
    &.incomplete-row {
      background: #fff8f8;
      border-left: 3px solid #f56c6c;

      &:hover {
        background: #fef0f0;
      }

      td {
        border-bottom-color: #fbc4c4;
      }
    }

    // 零价格行样式
    &.zero-price-row {
      .price-text {
        color: #f56c6c;
        background: #fef0f0;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }

  // 自动调整行高以适应内容
  .el-table__body {
    tr {
      td {
        padding: 12px 0;
        vertical-align: top;

        .cell {
          line-height: 1.4;
          word-wrap: break-word;
          word-break: break-all;
          white-space: normal;
          overflow: visible;
          text-overflow: initial;
        }
      }
    }
  }


  &::before {
    display: none;
  }

  .el-table__fixed-right::before,
  .el-table__fixed::before {
    display: none;
  }
}

// 分页组件样式优化
:deep(.el-pagination) {

  .btn-prev,
  .btn-next {
    border-radius: 4px;
    padding: 0 8px;
  }

  .el-pager li {
    border-radius: 4px;

    &.active {
      background-color: #409eff;
      color: #fff;
    }
  }

  .el-pagination__sizes {
    margin-right: 15px;
  }
}
</style>
<style lang="scss">
// 全局样式，确保样式能够正确应用
.quote-table {
  .el-table {

    .el-table__header {
      th {
        background: #f5f7fa !important;
        color: #303133 !important;
        font-weight: 600 !important;
      }
    }

    .el-table__row {
      &:hover {
        background: #f5f7fa !important;
      }
    }
  }

  .table-toolbar {
    padding: 16px 20px !important;
  }


  .price-text {
    color: #e6a23c !important;
    font-weight: 600 !important;
  }
}
</style>
