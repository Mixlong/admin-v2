<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" size="mini" class="search-form">
      <el-form-item label="请购单号" prop="purchaseOrderNo">
        <el-input
          v-model.trim="queryParams.purchaseOrderNo"
          placeholder="请输入请购单号"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="料号" prop="materialCode">
       <select-loadMore
          v-model="queryParams.materialCode"
          style="width: 100%"
          :data="inventoryData.data"
          :page="inventoryData.page"
          :hasMore="inventoryData.more"
          dictLabel="invCode"
          dictValue="invCode"
          :request="getInventoryList"
          placeholder="请选择物料编码"
          size="mini"
        >
        </select-loadMore>
      </el-form-item>

      <el-form-item label="物料名称" prop="materialName">
        <el-input
          v-model.trim="queryParams.materialName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="入库状态" prop="storageStatus">
        <el-select
          v-model="queryParams.storageStatus"
          placeholder="请选择入库状态"
          clearable
          style="width: 150px"
        >
          <el-option label="未到料" :value="0" />
          <el-option label="未检验" :value="1" />
          <el-option label="未入库" :value="2" />
          <el-option label="已入库" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery" size="mini">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery" size="mini">重置</el-button>
      </el-form-item>

      <div class="operation-btns">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          size="mini"
          v-hasPermi="['base:incoming:material:add']"
        >新增</el-button>
      </div>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight(0)" border>
      <el-table-column label="序号" type="index" width="55" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="请购单号" prop="purchaseOrderNo" align="center" width="130"  />
      <el-table-column label="料号" prop="materialCode" align="center" width="150"  />
      <el-table-column label="物料名称" prop="materialName" align="center"    />
      <el-table-column label="规格" prop="specification" align="center"    />
      <el-table-column label="数量" prop="quantity" align="center" width="80" />
      <el-table-column label="预计到料日期" prop="expectedArrivalDate" align="center" width="110" />
      <el-table-column label="实际到料日期" prop="actualArrivalDate" align="center" width="110" />
      <el-table-column label="检验完成日期" prop="inspectionCompleteDate" align="center" width="120" />
      <el-table-column label="延期天数" prop="delayDays" align="center" width="80">
        <template slot-scope="{ row }">
          <span :style="{ color: row.delayDays > 0 ? '#F56C6C' : '' }">
            {{ row.delayDays || 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="入库状态" prop="storageStatusName" align="center" width="100">
        <template slot-scope="{ row }">
          <el-tag v-if="row.storageStatus === 0" type="info">{{ row.storageStatusName }}</el-tag>
          <el-tag v-else-if="row.storageStatus === 1" type="warning">{{ row.storageStatusName }}</el-tag>
          <el-tag v-else-if="row.storageStatus === 2" type="">{{ row.storageStatusName }}</el-tag>
          <el-tag v-else-if="row.storageStatus === 3" type="success">{{ row.storageStatusName }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" align="center"  width="160">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.storageStatus === 0"
            size="mini"
            type="text"
            @click="handleConfirmArrival(row)"
            v-hasPermi="['base:incoming:material:confirm:arrival']"
            style="color: #67C23A"
          >确认到料</el-button>
          <el-button
            v-if="row.storageStatus === 1"
            size="mini"
            type="text"
            @click="handleConfirmInspection(row)"
            v-hasPermi="['base:incoming:material:confirm:inspection']"
            style="color: #409EFF"
          >检验完成</el-button>
          <el-button
            v-if="row.storageStatus === 2"
            size="mini"
            type="text"
            @click="handleConfirmStorage(row)"
            v-hasPermi="['base:incoming:material:confirm:storage']"
            style="color: #E6A23C"
          >入库完成</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleDetail(row)"
            v-hasPermi="['base:incoming:material:query']"
          >查看</el-button>
          <el-button
            v-if="row.storageStatus !== 3"
            size="mini"
            type="text"
            @click="handleDelete(row)"
            v-hasPermi="['base:incoming:material:delete']"
            style="color: #F56C6C"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 表单弹窗 -->
    <form-dialog ref="formDialog" @ok="getList" />

    <!-- 详情弹窗 -->
    <detail-dialog ref="detailDialog" />
  </div>
</template>

<script>
import {
  getIncomingMaterialList,
  deleteIncomingMaterial,
  updateIncomingMaterial
} from '@/api/base/incomingMaterial'
import { getInventoryList } from '@/api/base/inventory'
import FormDialog from './components/FormDialog'
import DetailDialog from './components/DetailDialog'
import Pagination from '@/components/Pagination'

export default {
  name: 'IncomingMaterial',
  components: { FormDialog, DetailDialog, Pagination },
  data() {
    return {
      loading: false,
      materialLoading: false,
      materialOptions: [],
      list: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        purchaseOrderNo: '',
        materialCode: '',
        materialName: '',
        storageStatus: undefined
      },
           inventoryData: {
        data: [],
        page: 1,
        more: true
      },
    }
  },
  mounted() {
    this.getList()
    this.searchMaterialCode('')
  },
  methods: {
    // 获取来料列表
    getInventoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          l: 10
        }
        
        if (keyword) {
          params.invCode = keyword
        }

        getInventoryList(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total } = res.data
            const pageSize = 10
            if (more) {
              this.inventoryData.data = [...this.inventoryData.data, ...list]
            } else {
              this.inventoryData.data = list || []
            }
            this.inventoryData.more = page * pageSize < total
            this.inventoryData.page = page
          } else {
            this.inventoryData.data = []
            this.inventoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取来料数据失败:', error)
          this.inventoryData.data = []
          this.inventoryData.more = false
          resolve()
        })
      })
    },
    searchMaterialCode(query) {
      if (query !== '' || this.materialOptions.length === 0) {
        this.materialLoading = true
        getInventoryList({
          p: 1,
          l: 50,
          invCode: query
        })
          .then(response => {
            this.materialOptions = response.data.list || []
          })
          .finally(() => {
            this.materialLoading = false
          })
      }
    },
    getList() {
      this.loading = true
      getIncomingMaterialList(this.queryParams)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.p = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        p: 1,
        l: 10,
        purchaseOrderNo: '',
        materialCode: '',
        materialName: '',
        storageStatus: undefined
      }
      this.getList()
    },
    handleAdd() {
      this.$refs.formDialog.open()
    },
    handleDetail(row) {
      this.$refs.detailDialog.open(row.id)
    },
    handleConfirmArrival(row) {
      this.$confirm('确认物料已到料？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return updateIncomingMaterial({
            id: row.id,
            storageStatus: 1
          })
        })
        .then(() => {
          this.msgSuccess('确认成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleConfirmInspection(row) {
      this.$confirm('确认检验已完成？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return updateIncomingMaterial({
            id: row.id,
            storageStatus: 2
          })
        })
        .then(() => {
          this.msgSuccess('确认成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleConfirmStorage(row) {
      this.$confirm('确认入库已完成？此操作将完成整个流程。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return updateIncomingMaterial({
            id: row.id,
            storageStatus: 3
          })
        })
        .then(() => {
          this.msgSuccess('入库完成')
          this.getList()
        })
        .catch(() => {})
    },
    handleDelete(row) {
      this.$confirm(
        `是否确认删除请购单号为"${row.purchaseOrderNo}"的来料入库记录?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return deleteIncomingMaterial(row.id)
        })
        .then(() => {
          this.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
}

.operation-btns {
  margin-left: auto;
}
</style>
