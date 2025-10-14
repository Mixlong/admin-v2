<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <IntelligentSearchForm
      ref="intelligentSearchForm"
      :searchForm="searchForm"
      :fields="searchFields"
      :defaultVisibleCount="3"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 自定义客户选择器字段 -->
      <template #field-customerId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore 
            v-model="searchForm[field.key]" 
            :data="customerData.data" 
            :page="customerData.page"
            :hasMore="customerData.more" 
            dictLabel="name" 
            dictValue="id" 
            :request="getCustomerData"
            size="mini" 
            placeholder="请选择客户" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="openAddDialog" v-hasPermi="['crm:followPlan:add']">
          新增
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 列表表格 -->
    <el-table
      v-loading="loading"
      :data="plans"
      border
      :height="tableHeight(30)"
      class="crm-follow-plan-table"
      style="width: 100%"
    >

      <el-table-column prop="planContent" label="计划内容" min-width="200" align="center" show-overflow-tooltip />

      <el-table-column prop="customerName" label="客户名称" width="160" align="center" show-overflow-tooltip />

      <el-table-column prop="planTime" label="计划时间" width="160" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.planTime, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>

      <el-table-column prop="planExecutor" label="计划执行人" width="120" align="center" show-overflow-tooltip />

      <el-table-column prop="planState" label="状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.planState === 1 ? 'success' : 'info'" size="small">
            {{ row.planState === 1 ? '已完成' : '待完成' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createBy" label="创建人" width="100" align="center" />

      <el-table-column prop="createTime" label="创建时间" width="160" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="320" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" icon="el-icon-plus" @click="handleAddFollowRecord(row)" v-hasPermi="['crm:followRecord:add']">
            添加跟进记录
          </el-button>
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit(row)" v-hasPermi="['crm:followPlan:edit']">
            编辑
          </el-button>
          <el-button type="text" size="small" icon="el-icon-finished" @click="handleComplete(row)" :disabled="row.planState === 1" v-hasPermi="['crm:followPlan:complete']">
            完成
          </el-button>
          <el-button type="text" size="small" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(row)" v-hasPermi="['crm:followPlan:remove']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-5 flex justify-end" style="margin-top: 10px;">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增计划弹窗 -->
    <FollowPlanFormDialog
      :visible.sync="addDialogVisible"
      :projectFollow="null"
      mode="add"
      @refresh="fetchList"
    />

    <!-- 编辑计划弹窗 -->
    <FollowPlanFormDialog
      :visible.sync="editDialogVisible"
      :projectFollow="editPlan"
      mode="edit"
      @refresh="fetchList"
    />

    <!-- 添加跟进记录弹窗 -->
    <AddFollowRecordDialog
      :visible.sync="addFollowRecordVisible"
      :default-customer-id="selectedPlan && selectedPlan.customerId"
      :default-plan-id="selectedPlan && selectedPlan.id"
      @refresh="handleFollowRecordAdded"
    />
  </div>
</template>

<script>
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import FollowPlanFormDialog from './components/FollowPlanFormDialog.vue'
import AddFollowRecordDialog from '../followRecord/components/AddFollowRecordDialog.vue'
import SelectLoadMore from '@/components/selectLoadMore'
import { getFollowPlanList, deleteFollowPlan, updateFollowPlanState } from '@/api/crm/followPlan'
import { getSoCustomerList } from '@/api/crm/soCustomer'
import { listUser } from '@/api/system/user'

export default {
  name: 'CrmFollowPlan',
  components: { IntelligentSearchForm, FollowPlanFormDialog, AddFollowRecordDialog, SelectLoadMore },
  data() {
    return {
      loading: false,
      plans: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      addDialogVisible: false,
      editDialogVisible: false,
      addFollowRecordVisible: false,
      selectedPlan: null,
      editPlan: null,
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true
      },
      // 用户列表
      userList: [],
      // 搜索
      searchForm: {
        customerId: '',
        planContent: '',
        planExecutor: '',
        planState: '',
        dateRange: []
      },
      searchFields: [
        { 
          key: 'customerId', 
          label: '客户', 
          component: 'el-select', 
          width: '200px', 
          sort: 1, 
          autoSearch: false,
          props: {
            placeholder: '请选择客户',
            clearable: true,
            filterable: true,
            options: []
          }
        },
        { 
          key: 'planContent', 
          label: '计划内容', 
          component: 'el-input', 
          placeholder: '请输入', 
          width: '180px', 
          sort: 2, 
          autoSearch: false 
        },
        { 
          key: 'planExecutor', 
          label: '计划执行人', 
          component: 'el-select', 
          width: '160px', 
          sort: 3, 
          autoSearch: false,
          props: {
            placeholder: '请选择',
            clearable: true,
            filterable: true,
            options: []
          }
        },
        { 
          key: 'planState', 
          label: '状态', 
          component: 'el-select', 
          width: '120px', 
          sort: 4, 
          props: { 
            placeholder: '请选择', 
            clearable: true, 
            options: [ 
              { label: '待完成', value: 0 }, 
              { label: '已完成', value: 1 } 
            ] 
          } 
        },
        { 
          key: 'dateRange', 
          label: '计划日期', 
          component: 'el-date-picker', 
          width: '240px', 
          sort: 5, 
          props: { 
            type: 'daterange', 
            'range-separator': '至', 
            'start-placeholder': '开始日期', 
            'end-placeholder': '结束日期', 
            'value-format': 'yyyy-MM-dd' 
          } 
        }
      ]
    }
  },
  mounted() {
    this.fetchList()
    this.getUserList()
    this.getCustomerData()
  },
  methods: {
    formatDateTime(dt) {
      if (!dt) return ''
      return new Date(dt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    openAddDialog() { this.addDialogVisible = true },
    handleSearch() { this.currentPage = 1; this.fetchList() },
    handleReset() {
      this.currentPage = 1
      this.searchForm.customerId = ''
      this.searchForm.planContent = ''
      this.searchForm.planExecutor = ''
      this.searchForm.planState = ''
      this.searchForm.dateRange = []
      this.fetchList()
    },
    handleSizeChange(size) { this.pageSize = size; this.fetchList() },
    handleCurrentChange(page) { this.currentPage = page; this.fetchList() },
    
    // 编辑跟进计划
    handleEdit(row) {
      this.editPlan = { ...row }
      this.editDialogVisible = true
    },
    
    // 查看客户详情
    handleViewCustomer(customerId) {
      if (customerId) {
        this.$router.push(`/crm/customer/detail/${customerId}`)
      }
    },
    
    // 添加跟进记录
    handleAddFollowRecord(row) {
      this.selectedPlan = row
      this.addFollowRecordVisible = true
    },
    
    // 跟进记录添加成功后的回调
    handleFollowRecordAdded() {
      this.$message.success('跟进记录添加成功')
      // 可以选择是否刷新列表或执行其他操作
    },

    // 获取客户数据
    async getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      try {
        const res = await getSoCustomerList({
          pageNum: page,
          pageSize: 50,
          name: keyword,
        })
        
        if (res.code === 200 && res.data) {
          const { list, total } = res.data;
          const filteredList = list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...filteredList];
          } else {
            this.customerData.data = filteredList;
          }

          this.customerData.page = page;
          this.customerData.more = this.customerData.data.length < total;
          
          // 更新搜索字段中的客户选项
          this.updateCustomerSearchOptions();
        }
      } catch (error) {
        console.error('获取客户数据失败:', error)
      }
    },

    // 更新搜索字段中的客户选项
    updateCustomerSearchOptions() {
      const customerField = this.searchFields.find(field => field.key === 'customerId')
      if (customerField && customerField.props) {
        customerField.props.options = this.customerData.data.map(customer => ({
          label: customer.name,
          value: customer.id
        }))
      }
    },

    // 获取用户列表
    async getUserList() {
      try {
        const response = await listUser({ p: 1, l: 999 })
        if (response.code === 200 && response.rows) {
          this.userList = response.rows
          this.updateExecutorSearchOptions()
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          customerId: this.searchForm.customerId || undefined,
          planContent: this.searchForm.planContent || undefined,
          planExecutor: this.searchForm.planExecutor || undefined,
          planState: this.searchForm.planState === '' ? undefined : Number(this.searchForm.planState)
        }
        
        // 如果有日期范围，添加日期参数
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }

        const res = await getFollowPlanList(params)
        
        if (res.code === 200 && res.data) {
          const { list = [], total = 0, pageNum, pageSize } = res.data
          this.plans = list
          this.total = total
          if (pageNum !== undefined) {
            this.currentPage = Number(pageNum) || this.currentPage
          }
          if (pageSize !== undefined) {
            this.pageSize = Number(pageSize) || this.pageSize
          }
        } else {
          this.$message.error(res.msg || '获取跟进计划列表失败')
          this.plans = []
          this.total = 0
        }
      } catch (e) {
        console.error('获取跟进计划列表失败:', e)
        this.$message.error('获取跟进计划列表失败')
        this.plans = []
        this.total = 0
      } finally { 
        this.loading = false 
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确认删除计划"${row.planContent.substring(0, 20)}..."吗？`, '确认删除', { type: 'warning' })
        const res = await deleteFollowPlan(row.id)
        if (res.code === 200 || res.code === 0) { 
          this.$message.success('删除成功')
          this.fetchList() 
        } else { 
          this.$message.error(res.msg || '删除失败') 
        }
      } catch (e) { 
        if (e !== 'cancel') {
          console.error('删除跟进计划失败:', e)
          this.$message.error('删除失败') 
        }
      }
    },
    async handleComplete(row) {
      try {
        await this.$confirm('确认标记为已完成？', '确认', { type: 'info' })
        const res = await updateFollowPlanState(row.id, 1)
        if (res.code === 200 || res.code === 0) { 
          this.$message.success('已完成')
          this.fetchList() 
        } else { 
          this.$message.error(res.msg || '操作失败') 
        }
      } catch (e) { 
        if (e !== 'cancel') {
          console.error('完成跟进计划失败:', e)
          this.$message.error('操作失败') 
        }
      }
    },
    updateExecutorSearchOptions() {
      const executorField = this.searchFields.find(field => field.key === 'planExecutor')
      if (executorField && executorField.props) {
        executorField.props.options = this.userList.map(user => ({
          label: user.nickName,
          value: user.nickName
        }))
      }
    }
  }
}
</script>

<style scoped>
.crm-follow-plan-table :deep(.el-table__row:hover) { background-color: #f5f7fa; }
</style>
