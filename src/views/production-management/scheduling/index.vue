<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <transition name="fade-transform-tb">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
        <el-form-item label="订单号" prop="orderNumber">
          <el-input
            v-model="queryParams.orderNumber"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="工单号" prop="workOrderNumber">
          <el-input
            v-model="queryParams.workOrderNumber"
            placeholder="请输入工单号"
            clearable
            style="width: 200px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="排产状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完成" value="2" />
            <el-option label="已暂停" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="上线日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </transition>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['production:scheduling:add']"
        >
          新增排产
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['production:scheduling:edit']"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['production:scheduling:remove']"
        >
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['production:scheduling:export']"
        >
          导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="schedulingList" 
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="订单号" align="center" prop="orderNumber" min-width="150" show-overflow-tooltip />
      <el-table-column label="工单号" align="center" prop="workOrderNumber" min-width="150" show-overflow-tooltip />
      <el-table-column label="工单数量" align="center" prop="totalQuantity" width="100" />
      <el-table-column label="上线日期" align="center" prop="onlineDate" width="110">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.onlineDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completionDate" width="110">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.completionDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排产状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['production:scheduling:query']"
          >
            查看
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['production:scheduling:edit']"
          >
            修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['production:scheduling:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改排产对话框 -->
    <AddSchedulingDialog
      v-if="dialogVisible"
      :visible="dialogVisible"
      :editData="editData"
      @update:visible="dialogVisible = $event"
      @save="handleSave"
    />

    <!-- 查看排产详情对话框 -->
    <ViewSchedulingDialog
      v-if="viewDialogVisible"
      :visible="viewDialogVisible"
      :data="viewData"
      @update:visible="viewDialogVisible = $event"
    />
  </div>
</template>

<script>
import AddSchedulingDialog from './components/AddSchedulingDialog.vue'
import ViewSchedulingDialog from './components/ViewSchedulingDialog.vue'
// 这里需要根据实际API路径调整
// import { listScheduling, getScheduling, delScheduling, addScheduling, updateScheduling } from '@/api/production/scheduling'

export default {
  name: 'ProductionScheduling',
  components: {
    AddSchedulingDialog,
    ViewSchedulingDialog
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 排产表格数据
      schedulingList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNumber: null,
        workOrderNumber: null,
        status: null,
        onlineDate: null
      },
      // 表单参数
      form: {},
      // 对话框
      dialogVisible: false,
      viewDialogVisible: false,
      // 编辑数据
      editData: null,
      viewData: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询排产列表 */
    getList() {
      this.loading = true
      // 模拟数据，实际使用时需要调用真实API
      // listScheduling(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
      //   this.schedulingList = response.rows
      //   this.total = response.total
      //   this.loading = false
      // })
      
      // 模拟数据
      setTimeout(() => {
        this.schedulingList = [
          {
            id: 1,
            orderNumber: 'ORD-2025-001',
            workOrderNumber: 'WO-2025-001',
            totalQuantity: 1000,
            onlineDate: '2025-01-15',
            completionDate: '2025-01-25',
            status: 1,
            createBy: '张三',
            createTime: '2025-01-10 09:00:00'
          },
          {
            id: 2,
            orderNumber: 'ORD-2025-002',
            workOrderNumber: 'WO-2025-002',
            totalQuantity: 500,
            onlineDate: '2025-01-20',
            completionDate: '2025-01-30',
            status: 0,
            createBy: '李四',
            createTime: '2025-01-12 10:00:00'
          }
        ]
        this.total = 2
        this.loading = false
      }, 1000)
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    
    /** 新增按钮操作 */
    handleAdd() {
      this.editData = null
      this.dialogVisible = true
    },
    
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id || this.ids
      // getScheduling(id).then(response => {
      //   this.editData = response.data
      //   this.dialogVisible = true
      // })
      
      // 模拟数据
      this.editData = row || this.schedulingList.find(item => item.id === this.ids[0])
      this.dialogVisible = true
    },
    
    /** 查看详情 */
    handleView(row) {
      this.viewData = row
      this.viewDialogVisible = true
    },
    
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id != null ? [row.id] : this.ids
      this.$confirm('是否确认删除排产编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        // return delScheduling(ids)
        return Promise.resolve() // 模拟删除成功
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      })
    },
    
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有排产数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        // return exportScheduling(queryParams)
        return Promise.resolve() // 模拟导出成功
      }).then(response => {
        // this.download(response.msg)
        this.msgSuccess('导出成功')
      })
    },
    
    /** 保存回调 */
    handleSave() {
      this.dialogVisible = false
      this.getList()
    },
    
    /** 排序处理 */
    handleSortChange(sort) {
      this.queryParams.orderByColumn = sort.prop
      this.queryParams.isAsc = sort.order
      this.getList()
    },
    
    /** 获取状态标签类型 */
    getStatusType(status) {
      const statusMap = {
        0: 'info',     // 未开始
        1: 'warning',  // 进行中
        2: 'success',  // 已完成
        3: 'danger',   // 已暂停
        4: 'danger'    // 已取消
      }
      return statusMap[status] || 'info'
    },
    
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        0: '未开始',
        1: '进行中',
        2: '已完成',
        3: '已暂停',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>