<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      ref="intelligentSearchForm"
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
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
            placeholder="请选择客户" 
            clearable
            @change="handleSearch"
            style="width: 150px;"
          />
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['crm:projectFollow:add']"
        >
          新建
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 项目跟进表格 -->
    <el-table
      v-loading="loading"
      :data="filteredProjectFollows"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      row-key="id"
      border
      :height="tableHeight(30)"
      class="crm-project-follow-table"
    >
      <el-table-column
        prop="projectName"
        label="项目名称"
        min-width="150"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <div class="cursor-pointer text-blue-600 hover:underline" @click="handleView(row)">
            {{ row.projectName }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="customerName" label="客户名称" width="150" align="center" show-overflow-tooltip />

      <el-table-column prop="productType" label="产品类型" width="120" align="center" />

      <el-table-column prop="projectNode" label="项目阶段" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="getProjectNodeType(row.projectNode)" size="small">
            {{  row.projectNode }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="progress" label="项目进度" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.progress || '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="productKeyFeatures" label="产品关键特性" width="150" align="center" show-overflow-tooltip />

      <el-table-column prop="requirementLink" label="需求总表链接" width="120" align="center">
        <template slot-scope="{ row }">
          <el-button 
            v-if="row.requirementLink && row.requirementLink.trim()" 
            type="text" 
            size="mini"
            style="color: #409eff; padding: 0;"
            @click="openLink(row.requirementLink)"
          >
            查看链接
          </el-button>
          <span v-else style="color: #c0c4cc;">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="projectBackground" label="项目背景" width="150" align="center" show-overflow-tooltip />

      <el-table-column prop="projectMilestones" label="项目里程碑" width="150" align="center" show-overflow-tooltip />

      <el-table-column prop="projectTest" label="项目测试" width="150" align="center" show-overflow-tooltip />

      <el-table-column prop="createBy" label="创建者" width="100" align="center" />

      <el-table-column prop="createTime" label="创建时间" width="100" align="center"  >
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handleView(row)"
            v-hasPermi="['crm:projectFollow:query']"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit(row)"
            v-hasPermi="['crm:projectFollow:edit']"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            style="color: #f56c6c"
            @click="handleDelete(row)"
            v-hasPermi="['crm:projectFollow:remove']"
          >
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

    <!-- 项目跟进详情弹框 -->
    <ProjectFollowDetailModal
      :visible.sync="detailModalVisible"
      :projectFollow="currentProjectFollow"
      @refresh="getProjectFollowList"
    />

    <!-- 项目跟进表单弹窗 -->
    <ProjectFollowFormDialog
      :visible.sync="formDialogVisible"
      :mode="dialogMode"
      :projectFollow="currentProjectFollow"
      @refresh="getProjectFollowList"
    />
  </div>
</template>

<script>
import ProjectFollowDetailModal from './components/ProjectFollowDetailModal.vue'
import ProjectFollowFormDialog from './components/ProjectFollowFormDialog.vue'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import SelectLoadMore from '@/components/selectLoadMore'
import { 
  getProjectFollowList, 
  deleteProjectFollow, 
  getProjectFollowDetail 
} from '@/api/crm/projectFollow'
import { getCustomerList } from '@/api/order'

export default {
  name: 'CrmProjectFollow',
  components: {
    IntelligentSearchForm,
    SelectLoadMore,
    ProjectFollowDetailModal,
    ProjectFollowFormDialog
  },
  data() {
    return {
      // 响应式数据
      loading: false,
      projectFollows: [],
      selectedRows: [],

      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true
      },

      // 搜索表单
      searchForm: {
        projectName: '',
        customerId: '',
        productType: '',
        projectNode: ''
      },

      // 搜索字段配置
      searchFields: [
        {
          key: 'projectName',
          label: '项目名称',
          component: 'el-input',
          placeholder: '请输入项目名称',
          width: '150px',
          sort: 1,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'customerId',
          label: '客户',
          component: 'custom', // 使用slot自定义
          placeholder: '请选择客户',
          width: '200px',
          sort: 2,
          autoSearch: true
        },
        {
          key: 'productType',
          label: '产品类型',
          component: 'el-input',
          placeholder: '请输入产品类型',
          width: '120px',
          sort: 3,
          autoSearch: true,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'projectNode',
          label: '项目阶段',
          component: 'el-select',
          placeholder: '请选择项目阶段',
          width: '120px',
          sort: 4,
          autoSearch: true,
          props: {
            size: 'mini',
            clearable: true,
            options: [
              { label: '需求分析', value: '需求分析' },
              { label: '方案设计', value: '方案设计' },
              { label: '开发阶段', value: '开发阶段' },
              { label: '测试阶段', value: '测试阶段' },
              { label: '部署上线', value: '部署上线' },
              { label: '验收完成', value: '验收完成' },
              { label: '项目结束', value: '项目结束' }
            ]
          }
        }
      ],

      // 弹框控制
      formDialogVisible: false,
      detailModalVisible: false,
      dialogMode: 'add', // 'add' | 'edit' | 'copy'
      currentProjectFollow: null,

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },
  computed: {
    filteredProjectFollows() {
      // 由于使用服务端搜索，直接返回projectFollows数据
      return this.projectFollows
    }
  },
  watch: {
    // 监听搜索表单变化，同步重置自定义组件
    'searchForm.customerId'(newVal) {
      if (newVal === '' || newVal === null || newVal === undefined) {
        // 客户被重置时，清空客户数据
        this.customerData = {
          data: [],
          page: 1,
          more: true
        }
      }
    }
  },
  mounted() {
    this.getProjectFollowList()
  },
  methods: {
    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
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
        }).catch(() => {
          resolve();
        });
      });
    },

    async getProjectFollowList() {
      this.loading = true
      try {
        // 构建查询参数 - 使用API支持的参数
        const params = {
          p: this.currentPage,
          l: this.pageSize,
          projectName: this.searchForm.projectName || undefined,
          customerId: this.searchForm.customerId || undefined,
          productType: this.searchForm.productType || undefined,
          projectNode: this.searchForm.projectNode || undefined
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getProjectFollowList(params)
        
        if (response.code === 200 && response.data) {
          this.projectFollows = response.data.list || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.msg || '获取项目跟进列表失败')
          this.projectFollows = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取项目跟进列表失败:', error)
        this.$message.error('获取项目跟进列表失败')
        this.projectFollows = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    handleAdd() {
      this.dialogMode = 'add'
      this.currentProjectFollow = null
      this.formDialogVisible = true
    },

    handleEdit(row) {
      this.dialogMode = 'edit'
      this.currentProjectFollow = { ...row }
      this.formDialogVisible = true
    },

    handleView(row) {
      this.currentProjectFollow = { ...row }
      this.detailModalVisible = true
    },

    handleDuplicate(row) {
      // 复制项目跟进记录 - 使用copy模式
      this.handleCopy(row)
    },

    handleCopy(row) {
      this.dialogMode = 'copy'
      this.currentProjectFollow = { ...row }
      this.formDialogVisible = true
    },


    async handleDelete(row) {
      try {
        await this.$confirm(
          `确定要删除项目跟进"${row.projectName}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await deleteProjectFollow(row.id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.getProjectFollowList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除项目跟进失败:', error)
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
      this.getProjectFollowList()
    },

    handleReset() {
      console.log('重置搜索表单')
      this.currentPage = 1
      
      // 重置客户数据
      this.customerData = {
        data: [],
        page: 1,
        more: true
      }
      
      // 重新加载数据
      this.getProjectFollowList()
    },

    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value)
      // 处理特定字段变化的逻辑
      if (fieldKey === 'customerId' && value) {
        console.log('客户已选择:', value)
      }
    },

    handleSortChange({ prop, order }) {
      // TODO: 处理排序
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.getProjectFollowList()
    },

    handleCurrentChange(page) {
      this.currentPage = page
      this.getProjectFollowList()
    },

    // 项目阶段类型
    getProjectNodeType(projectNode) {
      const typeMap = {
        '需求分析': 'primary',    // 需求分析 - 蓝色
        '方案设计': 'success',         // 方案设计 - 绿色
        '测试阶段': 'warning',    // 开发阶段 - 橙色
        '部署上线': 'danger',         // 测试阶段 - 红色
        '验收完成': 'info',        // 部署上线 - 灰色
        '项目结束': 'success',     // 验收完成 - 绿色
        '项目结束': ''               // 项目结束 - 默认
      }
      return typeMap[projectNode] || 'primary'
    },
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      return new Date(dateTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 打开链接
    openLink(url) {
      if (!url) return
      
      // 确保URL有协议前缀
      let fullUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url
      }
      
      window.open(fullUrl, '_blank')
    }

  }
}
</script>

<style scoped>
.crm-project-follow-table :deep(.el-table__row) {
  cursor: pointer;
}

.crm-project-follow-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
