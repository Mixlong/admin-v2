<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="3" 
      @reset="handleReset" 
      @field-change="handleFieldChange">

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
            placeholder="请选择" 
            clearable
            @change="handleSearch"
            style="width: 150px;"
          />
        </el-form-item>
      </template>

      <template #field-follower="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <TypedSelectLoadMore
            v-model="searchForm[field.key]"
            type="user"
            @change="handleSearch"
            style="width: 150px;"
            ></TypedSelectLoadMore>
            </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['crm:followRecord:add']"
        >
          新建
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 跟进记录表格 -->
      <el-table
        v-loading="loading"
        :data="filteredFollowRecords"
        style="width: 100%"
        row-key="id"
        border
        :height="tableHeight(30)"
        class="crm-follow-record-table"
      >

        <el-table-column
          prop="followContent"
          label="跟进内容"
          align="center"
        >
          <template slot-scope="{ row }">
            <div class="cursor-pointer" @click="handleView(row)">
              <div class="font-medium text-blue-600 hover:underline">
                {{ row.followContent }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="followMethod" label="跟进方式" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="getMethodColor(row.followMethod)">
              {{ getMethodText(row.followMethod) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="customerName" label="客户名称" width="150" align="center">
        </el-table-column>

        <el-table-column prop="contactName" label="联系人" width="100"  align="center"/>

        <el-table-column prop="follower" label="跟进人" width="100" align="center">
        </el-table-column>

        <el-table-column prop="followTime" label="跟进时间" width="150" align="center">
          <template slot-scope="{ row }">
              <span>
                {{ parseTime(row.followTime, '{y}-{m}-{d}') }}
              </span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="150" align="center">
          <template slot-scope="{ row }">
            <span>
              {{ parseTime(row.createTime, '{y}-{m}-{d}') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              icon="el-icon-check"
              @click="handleComplete(row)"
              v-hasPermi="['crm:followRecord:complete']"
            >
              完成
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="handleView(row)"
              v-hasPermi="['crm:followRecord:query']"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(row)"
              v-hasPermi="['crm:followRecord:edit']"
            >
              编辑
            </el-button>
     
            <el-button
              v-if="row.status === 'pending'"
              type="text"
              size="small"
              class="action-warning"
              icon="el-icon-close"
              @click="handleCancel(row)"
              v-hasPermi="['crm:followRecord:cancel']"
            >
              取消
            </el-button>
            <el-button
              type="text"
              size="small"
              class="action-danger"
              icon="el-icon-delete"
              @click="handleDelete(row)"
              v-hasPermi="['crm:followRecord:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt10 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    <!-- 跟进记录详情弹框 -->
    <ActivityDetailModal
      :visible.sync="detailVisible"
      :activity="currentFollowRecord"
      @refresh="getFollowRecordList"
    />

    <!-- 完成跟进记录弹框 -->
    <CompleteActivityModal
      :visible.sync="completeVisible"
      :activity="currentFollowRecord"
      @refresh="getFollowRecordList"
    />
    <!-- 新增跟进记录弹框 -->
    <AddFollowRecordDialog
      :visible.sync="addVisible"
      @refresh="getFollowRecordList"
    />

    <!-- 编辑跟进记录弹框 -->
    <AddFollowRecordDialog
      :visible.sync="editVisible"
      :follow-record="currentFollowRecord"
      @refresh="getFollowRecordList"
    />
  </div>
</template>

<script>
import ActivityDetailModal from './components/ActivityDetailModal.vue'
import CompleteActivityModal from './components/CompleteActivityModal.vue'
import ImportModal from '../components/ImportModal.vue'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import AddFollowRecordDialog from './components/AddFollowRecordDialog.vue'
import SelectLoadMore from '@/components/selectLoadMore'
// import EditFollowRecordDialog from './components/EditFollowRecordDialog.vue' // 已合并到AddFollowRecordDialog
import { getFollowRecordList, deleteFollowRecord, updateFollowRecord } from '@/api/crm/followRecord'
import { getSoCustomerList } from '@/api/crm/soCustomer'
import { FOLLOW_METHOD_OPTIONS, getFollowMethodColor } from '@/views/crm/constants'

export default {
  name: 'CrmFollowRecord',
  components: {
    ActivityDetailModal,
    CompleteActivityModal,
    ImportModal,
    IntelligentSearchForm,
    AddFollowRecordDialog,
    SelectLoadMore
    // EditFollowRecordDialog 已合并到AddFollowRecordDialog
  },
  data() {
    return {
      loading: false,
      followRecords: [],
      selectedRows: [],

      // 搜索表单 - 只保留API支持的参数
      searchForm: {
        customerId: '',
        contactId: '',
        followMethod: '',
        follower: ''
      },

      // 搜索字段配置 - 只保留API支持的参数
      searchFields: [
        {
          key: 'customerId',
          label: '客户',
          component: 'el-input',
          placeholder: '请输入客户',
          width: '150px',
          sort: 1,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'followMethod',
          label: '跟进方式',
          component: 'el-select',
          placeholder: '请选择',
          width: '120px',
          sort: 3,
          autoSearch: true,
          props: {
            size: 'mini',
            clearable: true,
            options: FOLLOW_METHOD_OPTIONS
          }
        },
        {
          key: 'follower',
          label: '跟进人',
          component: 'el-input',
          placeholder: '请输入',
          width: '120px',
          sort: 4,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        }
      ],

      detailVisible: false,
      completeVisible: false,
      importVisible: false,
      addVisible: false,
      editVisible: false,
      currentFollowRecord: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true
      }
    }
  },
  computed: {
    filteredFollowRecords() {
      // 由于API支持服务端过滤，这里直接返回数据
      // 搜索过滤在getFollowRecordList中通过API参数实现
      return this.followRecords
    }
  },
  mounted() {
    this.getFollowRecordList()
    this.getCustomerData()
  },
  methods: {
    async getFollowRecordList() {
      this.loading = true
      try {
        // 构建查询参数 - 使用API支持的参数
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          customerId: this.searchForm.customerId || undefined,
          contactId: this.searchForm.contactId || undefined,
          followMethod: this.searchForm.followMethod || undefined,
          follower: this.searchForm.follower || undefined
        }

        const response = await getFollowRecordList(params)
        
        if (response.code === 200 && response.data) {
          this.followRecords = response.data.list || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.msg || '获取跟进记录列表失败')
          this.followRecords = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取跟进记录列表失败:', error)
        this.$message.error('获取跟进记录列表失败')
        this.followRecords = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.currentFollowRecord = null
      this.addVisible = true
    },
    handleAddPlan() {
      this.$router.push('/crm/follow-record/plan')
    },
    handleEdit(row) {
      this.currentFollowRecord = { ...row }
      this.editVisible = true
    },
    handleView(row) {
      console.log('查看跟进记录详情，数据结构:', row)
      this.currentFollowRecord = row
      this.detailVisible = true
    },
    handleViewCustomer(customerId) {
      this.$router.push(`/crm/customer/detail/${customerId}`)
    },
    handleComplete(row) {
      this.currentFollowRecord = row
      this.completeVisible = true
    },
    async handleCancel(row) {
      try {
        await this.$confirm(
          `确定要取消跟进记录"${row.followContent.substring(0, 20)}..."吗？`,
          '确认取消',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 更新跟进记录状态为已取消（如果API支持状态字段）
        const updateData = {
          ...row,
          status: 'cancelled',
          updateTime: new Date().toISOString()
        }
        
        const response = await updateFollowRecord(updateData)
        if (response.code === 200) {
          this.$message.success('取消成功')
          this.getFollowRecordList()
        } else {
          this.$message.error(response.msg || '取消失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消跟进记录失败:', error)
          this.$message.error('取消失败')
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(
          `确定要删除跟进记录"${row.followContent.substring(0, 20)}..."吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 调用删除API
        const response = await deleteFollowRecord(row.id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.getFollowRecordList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除跟进记录失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // IntelligentSearchForm 事件处理
    handleSearch(searchForm) {
      console.log('执行搜索:', searchForm)
      this.currentPage = 1
      // 重新加载数据，使用新的搜索参数
      this.getFollowRecordList()
    },

    handleReset() {
      console.log('重置搜索表单')
      this.currentPage = 1
      // 重新加载数据
      this.getFollowRecordList()
    },

    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value)
      // 处理特定字段变化的逻辑
      if (fieldKey === 'followMethod' && value) {
        console.log('跟进方式已选择:', value)
      }
    },
    handleSortChange({ prop, order }) {
      // TODO: 处理排序
    },
    handleExport() {
      this.$message.info('导出功能开发中')
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.getFollowRecordList()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getFollowRecordList()
    },
    // 简化：使用统一的常量管理
    getMethodColor(method) {
      return getFollowMethodColor(method)
    },
    formatDateTime(datetime) {
      if (!datetime) return ''
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 获取客户数据
    async getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          l: 20,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          const filteredList = list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...filteredList];
          } else {
            this.customerData.data = filteredList;
          }

          this.customerData.page = pageNum;
          this.customerData.more = this.customerData.data.length < total;
          resolve();
        }).catch((error) => {
          console.error('获取客户列表失败:', error);
          resolve();
        });
      });
    }
  }
}
</script>

<style scoped>
.crm-follow-record-table :deep(.el-table__row) {
  cursor: pointer;
}

.crm-follow-record-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.action-warning {
  color: #e6a23c;
}

.action-warning:hover,
.action-warning:focus {
  color: #cf9236;
}

.action-danger {
  color: #f56c6c;
}

.action-danger:hover,
.action-danger:focus {
  color: #dd6161;
}
</style>
