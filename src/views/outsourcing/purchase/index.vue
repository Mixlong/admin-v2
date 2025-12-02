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
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">
          新增采购订单
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
      :height="tableHeight(30)"
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
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button 
            size="mini" 
            type="text" 
            icon="el-icon-edit" 
            @click="handleEdit(scope.row)"
            :disabled="scope.row.cancelStatus === 0"
          >
            编辑
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-upload2" @click="handlePublish(scope.row)" 
            v-if="scope.row.cancelStatus === 1">发布</el-button>
          <el-button size="mini" type="text" icon="el-icon-refresh-left" @click="handleCancel(scope.row)"
            v-if="scope.row.cancelStatus === 0">撤销</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" 
            style="color: #F56C6C">删除</el-button>
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
  </div>
</template>


<script>
import { getOutsourcingOrderList, publishOrder, cancelOrder, deleteOrder } from '@/api/outsourcing/order'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import AddPurchaseDialog from './components/AddPurchaseDialog.vue'

export default {
  name: 'OutsourcingPurchase',
  components: { 
    IntelligentSearchForm,
    AddPurchaseDialog 
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
      }
    }
  },
  created() {
    this.fetchData()
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
</style>
