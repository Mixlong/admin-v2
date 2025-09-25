<template>
  <div class="quality-issue-container app-container flex-app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm
      :search-form="searchForm"
      :fields="searchFields"
      :default-visible-count="4"
      @search="handleSearch"
      @reset="handleReset"
      @field-change="handleFieldChange"
      @layout-changed="handleSearchFormLayoutChanged"
    >

      <!-- 自定义订单号字段渲染 -->
      <template #field-orderNo="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <select-loadMore
            v-model="searchForm[field.key]"
            :data="orderData.data"
            :page="orderData.page"
            :has-more="orderData.more"
            dict-label="salesOrderNo"
            dict-value="salesOrderNo"
            :request="getOrderData"
            placeholder="请选择订单号"
            style="width: 200px"
            @change="handleSearch"
            size="mini"
          >
            <template v-slot="{ proOption }">
              <span style="float: left">{{ proOption.salesOrderNo }}</span>
            </template>
          </select-loadMore>
        </el-form-item>
      </template>

      <!-- 自定义线号字段渲染 -->
      <template #field-productionLine="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <el-select v-model="searchForm[field.key]" placeholder="请选择线号" clearable filterable size="mini" style="width: 200px" @change="handleSearch">
            <el-option
              v-for="dict in sopLineOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 机型查询插槽 -->
      <template #field-customerModel="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <select-loadMore
            v-model="searchForm[field.key]"
            style="width: 200px"
            :data="categoryData.data"
            :page="categoryData.page"
            :hasMore="categoryData.more"
            dictLabel="name"
            dictValue="id"
            :request="getCategoryList"
            placeholder="请选择机型"
            size="mini"
            @input="handleFieldChange(field.key, $event)"
            @change="handleSearch"
            >
          </select-loadMore>
        </el-form-item>
      </template>

      <!-- 自定义异常状态字段渲染 -->
      <template #field-exceptionStatus="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <el-select v-model="searchForm[field.key]" placeholder="请选择异常状态" clearable size="mini" @change="handleSearch">
            <el-option label="待处理" :value="1" />
            <el-option label="处理中" :value="2" />
            <el-option label="已完善" :value="3" />
            <el-option label="已确认" :value="4" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义日期范围字段渲染 -->
      <template #field-dateRange="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 250px"
            size="mini"
            @change="handleDateRangeChange"
          />
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">
          新增 
        </el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" :loading="exportLoading" @click="handleExport">
          导出
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :height="tableHeight(-50)"
        row-key="id"
      >

        <el-table-column prop="orderNo" label="订单号" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.orderNo || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="productionLine" label="线号" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.productionLine || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="customerModel" label="机型" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.customerModel || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="materialNo" label="物料编码" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.materialNo || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="problemDescription" label="问题描述" align="center"  show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.problemDescription" v-html="scope.row.problemDescription" />
            <span v-else>--</span>
          </template>
        </el-table-column>

        <el-table-column prop="defectQuantity" label="不良数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.defectQuantity }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="productionQuantity" label="生产数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.productionQuantity || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="defectRate" label="不良率" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.defectRate || '0' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="exceptionStatus" label="异常状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.exceptionStatus)">
              {{ getStatusText(scope.row.exceptionStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="responsibility" label="责任归属部门" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.responsibility || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="issueDate" label="日期" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.issueDate) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="canModifyStatus(scope.row)"
              size="mini"
              type="text"
              icon="el-icon-setting"
              @click="handleModifyStatus(scope.row)"
            >
              修改状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <AddIssueDialog
      :visible.sync="addDialogVisible"
      :edit-data="editData"
      :is-view="isViewMode"
      @success="handleDialogSuccess"
    />

    <!-- 查看详情弹窗 -->
    <ViewIssueDialog
      :visible.sync="viewDialogVisible"
      :issue-data="viewData"
      :can-edit="true"
      @edit="handleEditFromView"
    />

    <!-- 修改状态弹窗 -->
    <el-dialog
      title="修改异常状态"
      :visible.sync="statusDialogVisible"
      width="600px"
      top="0vh"
      :close-on-click-modal="false"
    >
      <el-form ref="statusForm" :model="statusForm" :rules="statusRules" label-width="100px">
        <el-form-item label="异常状态" prop="exceptionStatus">
          <el-select v-model="statusForm.exceptionStatus" placeholder="请选择异常状态" style="width: 100%">
            <!-- 管理员和部门负责人可以选择的状态 -->
            <el-option v-if="canModifyGeneralStatus()" label="处理中" :value="2" />
            <el-option v-if="canModifyGeneralStatus()" label="已完善" :value="3" />
            <!-- 确认人和管理员可以选择确认状态 -->
            <el-option
              v-if="canConfirmStatus()"
              label="已确认"
              :value="4"
            />
          </el-select>
        </el-form-item>

        <!-- 当状态为处理中时，显示改善措施字段 -->
        <el-form-item
          v-if="statusForm.exceptionStatus === 2"
          label="临时措施"
          prop="temporaryMeasures"
        >
          <el-input
            v-model="statusForm.temporaryMeasures"
            type="textarea"
            :rows="4"
            placeholder="请描述为控制问题影响而采取的紧急应对措施"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          v-if="statusForm.exceptionStatus === 2"
          label="长期改善对策"
          prop="longTermImprovement"
        >
          <el-input
            v-model="statusForm.longTermImprovement"
            type="textarea"
            :rows="4"
            placeholder="请制定长期的改善对策，防止问题再次发生"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 当选择已确认状态时，显示确认效果录入字段 -->
        <el-form-item
          v-if="statusForm.exceptionStatus === 4"
          label="确认效果"
          prop="effectConfirmation"
        >
          <el-input
            v-model="statusForm.effectConfirmation"
            type="textarea"
            :rows="4"
            placeholder="请输入确认效果"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleStatusDialogClose">取 消</el-button>
        <el-button type="primary" @click="confirmStatusChange">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AddIssueDialog from './components/AddIssueDialog'
import ViewIssueDialog from './components/ViewIssueDialog'
import {

  getQualityIssueList,
  getOrderList,
  updateQualityIssue,
  exportQualityIssue
} from '@/api/base/qualityIssue'
import { afterCategoryList } from '@/api/third/sale'
import { getDicts } from '@/api/system/dict/data'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import { mapGetters } from "vuex"
export default {
  name: 'QualityIssue',
  components: {
    AddIssueDialog,
    ViewIssueDialog,
    IntelligentSearchForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        orderNo: '',
        productionLine: '',
        customerModel: '',
        exceptionStatus: '',
        startDate: '',
        endDate: '',
        
      },
      // 日期范围
      dateRange: [],
      // 表格数据
      tableData: [],
      loading: false,
      // 分页信息
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      // 弹窗控制
      addDialogVisible: false,
      viewDialogVisible: false,
      // 编辑数据
      editData: null,
      viewData: null,
      // 是否查看模式
      isViewMode: false,
      // 修改状态对话框控制
      statusDialogVisible: false,
      statusForm: {
        id: null,
        exceptionStatus: '',
        temporaryMeasures: '',
        longTermImprovement: '',
        effectConfirmation: ''
      },
      // 状态修改表单验证规则
      statusRules: {
        exceptionStatus: [
          { required: true, message: '请选择异常状态', trigger: 'change' }
        ],
        temporaryMeasures: [
          { required: true, message: '请输入临时措施', trigger: 'blur' }
        ],
        longTermImprovement: [
          { required: true, message: '请输入长期改善对策', trigger: 'blur' }
        ],
        effectConfirmation: [
          { required: true, message: '请输入确认效果', trigger: 'blur' }
        ]
      },
      // 当前操作的行数据
      currentStatusRow: null,
      // 导出加载状态
      exportLoading: false,
      // 线号字典选项
      sopLineOptions: [],
      // 订单数据
      orderData: {
        data: [],
        page: 1,
        more: true
      },

      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },

      // IntelligentSearchForm 配置
      searchFields: [
        {
          key: 'orderNo',
          label: '订单号',
          component: 'el-select',
          sort: 1
        },
        {
          key: 'productionLine',
          label: '线号',
          component: 'el-select',
          sort: 2
        },
        {
          key: 'customerModel',
          label: '机型',
          component: 'el-select',
          sort: 3
        },
        {
          key: 'exceptionStatus',
          label: '异常状态',
          component: 'el-select',
          sort: 4
        },
        {
          key: 'dateRange',
          label: '日期范围',
          component: 'el-date-picker',
          labelWidth: '100px',
          sort: 5
        },
        
      ]
    }
  },
  computed: {  
    ...mapGetters([
      'userId',
      'name', 
      'nickName',
      'deptId',
      'deptName',
      'roles'
    ])
  },
  created() {
    this.fetchData()
    this.loadDictData()
    this.initUserInfo()
  },
  methods: {
    // 获取列表数据
    fetchData() {
      this.loading = true

      // 过滤空值参数
      const params = {}
      if (this.pagination.current) params.p = this.pagination.current
      if (this.pagination.size) params.l = this.pagination.size
      if (this.searchForm.orderNo) params.orderNo = this.searchForm.orderNo
      if (this.searchForm.productionLine) params.productionLine = this.searchForm.productionLine
      if (this.searchForm.customerModel) params.customerModel = this.searchForm.customerModel
      if (this.searchForm.exceptionStatus) params.exceptionStatus = this.searchForm.exceptionStatus
      if (this.searchForm.startDate) params.startDate = this.searchForm.startDate
      if (this.searchForm.endDate) params.endDate = this.searchForm.endDate

      console.log('质量异常列表请求参数:', params)

      getQualityIssueList(params).then((res) => {
        console.log('质量异常列表响应:', res)
        if (res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
          // 同步分页信息
          if (res.data?.pageNum) this.pagination.current = res.data.pageNum
          if (res.data?.pageSize) this.pagination.size = res.data.pageSize
        } else {
          this.$message.error(res.msg || '获取数据失败')
          this.tableData = []
          this.pagination.total = 0
        }
      }).catch((error) => {
        console.error('质量异常列表请求失败:', error)
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
    },

    // 搜索功能
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      // 重置搜索表单
      this.searchForm = {
        orderNo: '',
        productionLine: '',
        customerModel: '',
        exceptionStatus: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = []
      this.pagination.current = 1
      this.fetchData()
    },

    // 字段变化处理
    handleFieldChange(field, value) {
      console.log('字段变化:', field, value)
    },

    // 搜索表单布局变化处理
    handleSearchFormLayoutChanged(layout) {
      console.log('搜索表单布局变化:', layout)
    },

    // 日期范围变化处理
    handleDateRangeChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.searchForm.startDate = dateRange[0]
        this.searchForm.endDate = dateRange[1]
      } else {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
      }
    },

    // 新增记录
    handleAdd() {
      this.editData = null
      this.isViewMode = false
      this.addDialogVisible = true
    },

    // 查看记录
    handleView(row) {
      this.viewData = { ...row }
      this.viewDialogVisible = true
    },

    // 编辑记录
    handleEdit(row) {
      this.editData = { ...row }
      this.isViewMode = false
      this.addDialogVisible = true
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

    // 从查看详情切换到编辑
    handleEditFromView(row) {
      this.editData = { ...row }
      this.isViewMode = false
      this.addDialogVisible = true
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        1: 'warning', // 待处理
        2: 'primary', // 处理中
        3: 'success', // 已完善
        4: 'info' // 已确认
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '待处理',
        2: '处理中',
        3: '已完善',
        4: '已确认'
      }
      return statusMap[status] || '未知'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return date.split(' ')[0] // 只显示日期部分
    },

    // 计算表格高度
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset
    },

    // 加载字典数据
    loadDictData() {
      // 获取线号字典
      getDicts('sop_line').then(res => {
        this.sopLineOptions = res.data || []
      }).catch(() => {
        console.error('获取线号字典失败')
        this.sopLineOptions = []
      })
    },

    // 获取订单数据 - SelectLoadMore组件接口
    getOrderData({ page = 1, more = false, keyword = '' } = {}) {
      return new Promise((resolve) => {
        getOrderList({
          p: page,
          salesOrderNo: keyword
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data

          if (more) {
            this.orderData.data = [...this.orderData.data, ...list]
          } else {
            this.orderData.data = list
          }
          this.orderData.more = pageNum * pageSize < total
          this.orderData.page = pageNum
          resolve()
        })
      })
    },

    // 获取品类列表
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.categoryData.data = [...this.categoryData.data, ...list]
            } else {
              this.categoryData.data = list || []
            }
            this.categoryData.more = pageNum * pageSize < total
            this.categoryData.page = pageNum
          } else {
            this.categoryData.data = []
            this.categoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取品类数据失败:', error)
          this.categoryData.data = []
          this.categoryData.more = false
          resolve()
        })
      })
    },

    // 初始化用户信息
    async initUserInfo() {
      try {
        // 如果Store中没有用户信息，先调用GetInfo获取
        if (!this.$store.getters.userId || !this.$store.getters.deptId) {
          await this.$store.dispatch('GetInfo')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 判断是否可以修改状态 - 当前用户部门与责任归属部门匹配
    canModifyStatus(row) {
      if (!row) {
        console.log('权限检查失败: row为空', { row })
        return false
      }

      // 管理员权限：admin用户或具有管理员角色的用户可以修改所有状态
      const isAdmin = this.nickName === 'admin' ||
          (this.roles && this.roles.some(role => role.includes('admin')))

      if (isAdmin) {
        console.log('管理员权限通过', { nickName: this.nickName, roles: this.roles })
        return true
      }

      // 确认人权限：确认人只能进行确认操作，不能修改其他状态
      const isConfirmer = this.nickName === row.confirmer
      if (isConfirmer) {
        console.log('确认人权限：只能确认状态', { nickName: this.nickName, confirmer: row.confirmer })
        return true // 确认人可以看到修改状态按钮，但只能选择"已确认"
      }

      // 部门匹配逻辑：当前用户部门与责任归属部门匹配
      let deptMatch = false
      if (this.deptName && row.responsibility) {
        deptMatch = this.deptName === row.responsibility
      }

      console.log('部门权限检查', {
        currentDept: this.deptName,
        responsibilityDept: row.responsibility,
        match: deptMatch
      })

      return deptMatch
    },

    // 判断是否可以选择"已确认"状态 - 当前用户是确认人
    canConfirmStatus() {
      if (!this.currentStatusRow) {
        return false
      }

      // 管理员权限：admin用户或具有管理员角色的用户可以确认所有状态
      const isAdmin = this.nickName === 'admin' ||
          (this.roles && this.roles.some(role => role.includes('admin')))

      if (isAdmin) {
        console.log('管理员权限：可以确认状态', { nickName: this.nickName })
        return true
      }

      // 确认人权限：当前用户是该记录的确认人
      const isConfirmer = this.nickName === this.currentStatusRow.confirmer

      console.log('确认人权限检查', {
        currentUser: this.nickName,
        confirmer: this.currentStatusRow.confirmer,
        match: isConfirmer
      })

      return isConfirmer
    },

    // 判断是否可以修改一般状态（待处理、处理中、已完善）- 管理员和部门负责人
    canModifyGeneralStatus() {
      if (!this.currentStatusRow) {
        return false
      }

      // 管理员权限：admin用户或具有管理员角色的用户可以修改所有状态
      const isAdmin = this.nickName === 'admin' ||
          (this.roles && this.roles.some(role => role.includes('admin')))

      if (isAdmin) {
        console.log('管理员权限：可以修改一般状态', { nickName: this.nickName })
        return true
      }

      // 确认人不能修改一般状态，只能确认
      const isConfirmer = this.nickName === this.currentStatusRow.confirmer
      if (isConfirmer) {
        console.log('确认人权限：不能修改一般状态', { nickName: this.nickName })
        return false
      }

      // 部门匹配逻辑：当前用户部门与责任归属部门匹配的用户可以修改一般状态
      let deptMatch = false
      if (this.deptName && this.currentStatusRow.responsibility) {
        deptMatch = this.deptName === this.currentStatusRow.responsibility
      }

      console.log('部门权限检查（一般状态）', {
        currentDept: this.deptName,
        responsibilityDept: this.currentStatusRow.responsibility,
        match: deptMatch
      })

      return deptMatch
    },

    // 修改状态按钮处理
    handleModifyStatus(row) {
      this.statusForm.id = row.id
      // 保存当前操作的行数据，用于权限检查
      this.currentStatusRow = { ...row }

      // 等待下一个tick后再设置默认值，确保权限检查方法可以正确执行
      this.$nextTick(() => {
        // 如果确认人只能确认（只有已确认选项），默认设置为已确认状态
        if (this.canConfirmStatus() && !this.canModifyGeneralStatus()) {
          this.statusForm.exceptionStatus = '4' // 已确认
          console.log('确认人默认设置状态为已确认')
        } else {
          // 默认选中下一个状态（当前状态+1），最大为4
          const currentStatus = parseInt(row.exceptionStatus) || 1
          const nextStatus = Math.min(currentStatus + 1, 4)
          this.statusForm.exceptionStatus = nextStatus
          console.log(`当前状态: ${currentStatus}, 默认选择下一状态: ${nextStatus}`)
        }
      })
      
      console.log("🚀 ~ file: index.vue:804 ~ this.statusForm.exceptionStatus:", this.statusForm.exceptionStatus)
      this.statusDialogVisible = true
    },

    // 关闭状态修改对话框
    handleStatusDialogClose() {
      this.statusDialogVisible = false
      this.currentStatusRow = null
      // 重置表单
      if (this.$refs.statusForm) {
        this.$refs.statusForm.resetFields()
      }
      // 重置所有字段
      this.statusForm.temporaryMeasures = ''
      this.statusForm.longTermImprovement = ''
      this.statusForm.effectConfirmation = ''
    },

    // 确认状态修改
    async confirmStatusChange() {
      // 使用表单验证
      this.$refs.statusForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        try {
          const params = {
            id: this.statusForm.id,
            exceptionStatus: this.statusForm.exceptionStatus
          }

          // 如果选择的是处理中状态，需要传递改善措施
          if (this.statusForm.exceptionStatus === 2) {
            params.temporaryMeasures = this.statusForm.temporaryMeasures
            params.longTermImprovement = this.statusForm.longTermImprovement
          }

          // 如果选择的是已确认状态，需要传递确认效果
          if (this.statusForm.exceptionStatus === 4) {
            params.effectConfirmation = this.statusForm.effectConfirmation
          }

          const response = await updateQualityIssue(params)

          if (response.code === 200) {
            this.$message.success('状态修改成功')
            this.handleStatusDialogClose()
            this.fetchData() // 刷新列表数据
          } else {
            this.$message.error(response.msg || '状态修改失败')
          }
        } catch (error) {
          console.error('修改状态失败:', error)
          this.$message.error('修改状态失败')
        }
      })
    },

    // 导出质量异常数据
    handleExport() {
      this.$modal.confirm('是否确认导出当前搜索条件下的质量异常数据？').then(() => {
        this.exportLoading = true

        // 构建导出参数，使用当前的搜索条件
        const params = {}
        if (this.searchForm.orderNo) params.orderNo = this.searchForm.orderNo
        if (this.searchForm.productionLine) params.productionLine = this.searchForm.productionLine
        if (this.searchForm.exceptionStatus) params.exceptionStatus = this.searchForm.exceptionStatus
        if (this.searchForm.startDate) params.startDate = this.searchForm.startDate
        if (this.searchForm.endDate) params.endDate = this.searchForm.endDate

        console.log('导出参数:', params)

        return exportQualityIssue(params)
      }).then(response => {
        if (response.code === 200 && response.msg) {
          this.download(response.msg)
          this.$message.success('导出成功')
        } else {
          this.$message.error(response.msg || '导出失败')
        }
        this.exportLoading = false
      }).catch(() => {
        this.exportLoading = false
      })
    }
  }
}
</script>

<style scoped>
.quality-issue-container {
  padding: 20px;
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}
</style>

<style>
/* 富文本表格显示样式 */
.el-table .cell div[v-html] {
  max-height: 60px;
  overflow: hidden;
  line-height: 1.4;
  font-size: 12px;
}

.el-table .cell div[v-html] p {
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.el-table .cell div[v-html] ul,
.el-table .cell div[v-html] ol {
  margin: 0;
  padding-left: 15px;
  line-height: 1.4;
}

.el-table .cell div[v-html] li {
  margin: 0;
  line-height: 1.4;
}

.el-table .cell div[v-html] strong {
  font-weight: bold;
}

.el-table .cell div[v-html] em {
  font-style: italic;
}
</style>