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
            <el-option label="原因分析中" :value="2" />
            <el-option label="对策制定中" :value="3" />
            <el-option label="已关闭" :value="5" />
            <el-option label="已关闭" :value="6" />
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

        <el-table-column prop="computerName" label="产品型号" align="center" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.computerName || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="productionLine" label="线号" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.productionLine || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="customerModel" label="机型" align="center" width="100">
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

        <el-table-column prop="defectRate" label="不良率" align="center" width="80">
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
        
        <el-table-column prop="responsiblePerson" label="责任人" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.responsiblePerson || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="measurePerson" label="对策人员" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.measurePerson || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="analysisPerson" label="分析人员" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.analysisPerson || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="confirmer" label="效果确认人" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.confirmer || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="issueDate" label="日期" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.issueDate) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
            
            <!-- 管理员可以编辑 -->
            <el-button 
              v-if="isAdmin"
              size="mini" 
              type="text" 
              icon="el-icon-edit" 
              @click="handleEdit(scope.row)">
              编辑
            </el-button>
            
            <!-- 分析人员：待处理状态下填写原因分析 -->
            <el-button
              v-if="isRowAnalysisPerson(scope.row) && scope.row.exceptionStatus === 1"
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleProjectAnalysis(scope.row)"
            >
              原因分析
            </el-button>
            
            <!-- 对策人员：原因分析状态下填写临时对策 -->
            <el-button
              v-if="isRowMeasurePerson(scope.row) && scope.row.exceptionStatus === 2 && !scope.row.temporaryMeasures"
              size="mini"
              type="text"
              icon="el-icon-document-add"
              @click="handleFillTemporaryMeasures(scope.row)"
            >
              临时对策
            </el-button>
            
            <!-- 责任人：对策制定中状态下长期对策 -->
            <el-button
              v-if="isRowResponsiblePerson(scope.row) && scope.row.exceptionStatus === 3 && !scope.row.longTermImprovement"
              size="mini"
              type="text"
              icon="el-icon-document-checked"
              @click="handleFillLongTermMeasures(scope.row)"
            >
              长期对策
            </el-button>
            
            <!-- 确认人：确认效果 -->
            <el-button
              v-if="isRowConfirmer(scope.row) && scope.row.exceptionStatus == 4 && !scope.row.effectConfirmation"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="handleConfirmEffect(scope.row)"
            >
              确认效果
            </el-button>
            
            <!-- 创建人：关闭任务 -->
            <el-button
              v-if="isRowCreator(scope.row) && scope.row.exceptionStatus === 5"
              size="mini"
              type="text"
              icon="el-icon-close"
              @click="handleCloseIssue(scope.row)"
            >
              关闭
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

    <!-- 原因分析对话框 -->
    <AnalysisDialog
      :visible.sync="analysisDialogVisible"
      :issue-data="analysisData"
      @success="handleDialogSuccess"
    />

    <!-- 修改状态弹窗 -->
    <el-dialog
      :title="statusDialogTitle"
      :visible.sync="statusDialogVisible"
      width="800px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <el-form ref="statusForm" :model="statusForm" :rules="statusRules" label-width="120px">

        <!-- 对策人员临时对策：原因分析(2) -> 对策制定中(3) -->
        <template v-if="currentOperation === 'fillTemporaryMeasures'">
          <!-- 展示上一环节：原因分析 -->
          <el-form-item label="原因分析 ">
            <div class="readonly-content" v-html="currentStatusRow.causeAnalysis || '未填写'"></div>
          </el-form-item>
          
          <el-divider></el-divider>
          
          <!-- 当前环节：临时对策 -->
          <el-form-item
            label="临时对策"
            prop="temporaryMeasures"
          >
            <Editor 
              v-model="statusForm.temporaryMeasures" 
              :min-height="200" 
              placeholder="请描述为控制问题影响而采取的紧急应对措施"
              :config="editorConfig">
            </Editor>
          </el-form-item>
        </template>

        <!-- 责任人填写长期改善对策：状态保持为已完善(3) -->
        <template v-if="currentOperation === 'fillLongTermMeasures'">
          <!-- 展示上一环节：原因分析 -->
          <el-form-item label="原因分析 ">
            <div class="readonly-content" v-html="currentStatusRow.causeAnalysis || '未填写'"></div>
          </el-form-item>
          
          <!-- 展示上一环节：临时对策 -->
          <el-form-item label="临时对策 ">
            <div class="readonly-content" v-html="currentStatusRow.temporaryMeasures || '未填写'"></div>
          </el-form-item>
          
          <el-divider></el-divider>
          
          <!-- 当前环节：填写长期改善对策 -->
          <el-form-item
            label="长期改善对策"
            prop="longTermImprovement"
          >
            <Editor 
              v-model="statusForm.longTermImprovement" 
              :min-height="200" 
              placeholder="请制定长期的改善对策，防止问题再次发生"
              :config="editorConfig">
            </Editor>
          </el-form-item>
        </template>

        <!-- 已确认状态：显示效果确认 - 由确认人填写 -->
        <template v-if="currentOperation === 'confirmEffect'">
          <!-- 展示上一环节：原因分析 -->
          <el-form-item label="原因分析 ">
            <div class="readonly-content" v-html="currentStatusRow.causeAnalysis || '未填写'"></div>
          </el-form-item>
          
          <!-- 展示上一环节：临时对策 -->
          <el-form-item label="临时对策 ">
            <div class="readonly-content" v-html="currentStatusRow.temporaryMeasures || '未填写'"></div>
          </el-form-item>
          
          <!-- 展示上一环节：长期改善对策 -->
          <el-form-item label="长期改善对策 ">
            <div class="readonly-content" v-html="currentStatusRow.longTermImprovement || '未填写'"></div>
          </el-form-item>
          
          <el-divider></el-divider>
          
          <!-- 当前环节：填写效果确认 -->
          <el-form-item
            label="效果确认"
            prop="effectConfirmation"
          >
            <Editor 
              v-model="statusForm.effectConfirmation" 
              :min-height="200" 
              placeholder="请输入确认效果"
              :read-only="!isConfirmer && !isAdmin"
              :config="editorConfig">
            </Editor>
            <div v-if="!isConfirmer && !isAdmin" style="color: #E6A23C; font-size: 12px; margin-top: 5px;">
              <i class="el-icon-warning"></i> 此字段只能由确认人（{{ currentStatusRow.confirmer || '未指定' }}）填写
            </div>
          </el-form-item>
        </template>
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
import AnalysisDialog from './components/AnalysisDialog'
import {

  getQualityIssueList,
  getOrderList,
  updateQualityIssue,
  exportQualityIssue
} from '@/api/base/qualityIssue'
import { afterCategoryList } from '@/api/third/sale'
import { getDicts } from '@/api/system/dict/data'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import Editor from '@/components/Editor'
import { mapGetters } from "vuex"
export default {
  name: 'QualityIssue',
  components: {
    AddIssueDialog,
    ViewIssueDialog,
    AnalysisDialog,
    IntelligentSearchForm,
    Editor
  },
  data() {
    return {
      // 富文本编辑器配置
      editorConfig: {
        height: 200,
        menubar: false,
        toolbar: 'bold italic underline | bullist numlist | removeformat',
        plugins: 'lists',
        statusbar: false,
        resize: false,
        branding: false
      },
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
      analysisDialogVisible: false,
      // 编辑数据
      editData: null,
      viewData: null,
      analysisData: null,
      // 是否查看模式
      isViewMode: false,
      // 修改状态对话框控制
      statusDialogVisible: false,
      statusDialogTitle: '修改异常状态', // 对话框标题
      currentOperation: '', // 当前操作类型：fillTemporaryMeasures | fillLongTermMeasures | confirmEffect
      statusForm: {
        id: null,
        exceptionStatus: null,
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
          { 
            validator: (rule, value, callback) => {
              // 对策人员临时对策时验证
              if (this.currentOperation === 'fillTemporaryMeasures') {
                if (!value || value.trim() === '') {
                  callback(new Error('请输入临时对策'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        longTermImprovement: [
          { 
            validator: (rule, value, callback) => {
              // 责任人填写长期改善对策时验证
              if (this.currentOperation === 'fillLongTermMeasures') {
                if (!value || value.trim() === '') {
                  callback(new Error('请输入长期改善对策'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        effectConfirmation: [
          { 
            validator: (rule, value, callback) => {
              // 确认人确认效果时验证
              if (this.currentOperation === 'confirmEffect') {
                if (!value || value.trim() === '') {
                  callback(new Error('请输入效果确认'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
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
    ]),
    // 判断当前用户是否为对策人员
    isMeasurePerson() {
      if (!this.currentStatusRow) return false
      return this.nickName === this.currentStatusRow.measurePerson
    },
    // 判断当前用户是否为确认人
    isConfirmer() {
      if (!this.currentStatusRow) return false
      return this.nickName === this.currentStatusRow.confirmer
    },
    // 判断当前用户是否为责任人
    isResponsiblePerson() {
      if (!this.currentStatusRow) return false
      return this.nickName === this.currentStatusRow.responsiblePerson
    },
    // 判断当前用户是否可以长期对策（仅责任人）
    canFillLongTermMeasures() {
      return this.isResponsiblePerson
    },
    // 判断当前用户是否为管理员
    isAdmin() {
      return this.nickName === 'admin' || (this.roles && this.roles.some(role => role.includes('admin')))
    }
  },
  created() {
    this.fetchData()
    this.loadDictData()
    this.initUserInfo()
  },
  methods: {
    // 获取列表数据
    async fetchData() {
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
          // 调试：打印第一条数据的所有字段
          if (this.tableData.length > 0) {
            console.log('第一条数据的所有字段:', Object.keys(this.tableData[0]))
            console.log('第一条数据:', this.tableData[0])
            console.log('当前用户 nickName:', this.nickName)
          }
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
    async handleDialogSuccess() {
      await this.fetchData()
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
        1: 'info', // 待处理
        2: 'warning', // 原因分析
        3: 'primary', // 对策制定中（对策人员填写临时对策）
        4: 'primary', // 对策制定中（责任人长期对策）
        5: 'info', // 已关闭
        6: 'info' // 已关闭
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '待处理',
        2: '原因分析中',
        3: '对策制定中',
        4: '对策制定中',
        5: '已关闭',
        6: '已关闭'
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

      // 加载已有的字段内容
      this.statusForm.temporaryMeasures = row.temporaryMeasures || ''
      this.statusForm.longTermImprovement = row.longTermImprovement || ''
      this.statusForm.effectConfirmation = row.effectConfirmation || ''

      // 等待下一个tick后再设置默认值，确保权限检查方法可以正确执行
      this.$nextTick(() => {
        // 管理员可以选择任何状态，默认为下一状态
        if (this.isAdmin) {
          const currentStatus = parseInt(row.exceptionStatus) || 1
          const nextStatus = Math.min(currentStatus + 1, 4)
          this.statusForm.exceptionStatus = Number(nextStatus)
        } else {
          // 普通用户根据角色自动设置，不可修改
          const currentStatus = parseInt(row.exceptionStatus) || 1
          const nextStatus = Math.min(currentStatus + 1, 4)
          this.statusForm.exceptionStatus = Number(nextStatus)
        }
      })
      
      this.statusDialogVisible = true
    },

    // 关闭状态修改对话框
    handleStatusDialogClose() {
      this.statusDialogVisible = false
      this.statusDialogTitle = '修改异常状态' // 重置标题
      this.currentOperation = '' // 重置操作类型
      this.currentStatusRow = null
      // 重置表单
      if (this.$refs.statusForm) {
        this.$refs.statusForm.resetFields()
      }
      // 重置所有字段
      this.statusForm.exceptionStatus = null
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

          // 根据当前操作类型添加对应字段
          if (this.currentOperation === 'fillTemporaryMeasures') {
            // 对策人员临时对策
            if (this.statusForm.temporaryMeasures) {
              params.temporaryMeasures = this.statusForm.temporaryMeasures
            }
          } else if (this.currentOperation === 'fillLongTermMeasures') {
            // 责任人填写长期改善对策
            if (this.statusForm.longTermImprovement) {
              params.longTermImprovement = this.statusForm.longTermImprovement
            }
          } else if (this.currentOperation === 'confirmEffect') {
            // 确认人确认效果
            if (this.statusForm.effectConfirmation) {
              params.effectConfirmation = this.statusForm.effectConfirmation
            }
          }

          console.log('提交参数:', params)

          const response = await updateQualityIssue(params)

          if (response.code === 200) {
            this.$message.success('状态修改成功')
            // 先关闭对话框
            this.handleStatusDialogClose()
            // 等待数据刷新完成
            await this.fetchData()
          } else {
            this.$message.error(response.msg || '状态修改失败')
          }
        } catch (error) {
          console.error('修改状态失败:', error)
          this.$message.error('修改状态失败')
        }
      })
    },

    // 判断当前用户是否为某行的分析人员
    isRowAnalysisPerson(row) {
      return this.nickName === row.analysisPerson
    },
    
    // 判断当前用户是否为某行的对策人员
    isRowMeasurePerson(row) {
      return this.nickName === row.measurePerson
    },
    
    // 判断当前用户是否为某行的确认人
    isRowConfirmer(row) {
      return this.nickName === row.confirmer
    },
    
    // 判断当前用户是否为某行的责任人
    isRowResponsiblePerson(row) {
      return this.nickName === row.responsiblePerson
    },
    
    // 判断当前用户是否可以填写某行的长期措施（仅责任人）
    canRowFillLongTermMeasures(row) {
      return this.isRowResponsiblePerson(row)
    },
    
    // 判断当前用户是否为某行的创建人
    isRowCreator(row) {
      // 检查 createBy 或 creator 字段
      const isCreator = this.nickName === row.createBy || this.nickName === row.creator
      console.log(`isRowCreator 检查: 当前用户=${this.nickName}, row.createBy=${row.createBy}, row.creator=${row.creator}, status=${row.exceptionStatus}, 结果=${isCreator}`)
      return isCreator
    },
    
    // 处理原因分析
    handleProjectAnalysis(row) {
      this.analysisData = { ...row }
      this.analysisDialogVisible = true
    },
    
    // 对策人员填写临时对策：原因分析(2) -> 对策制定中(3)
    handleFillTemporaryMeasures(row) {
      this.statusDialogTitle = '临时对策'
      this.currentOperation = 'fillTemporaryMeasures' // 设置当前操作类型
      // 从表格数据中获取最新的行数据
      const latestRow = this.tableData.find(item => item.id === row.id) || row
      this.currentStatusRow = { ...latestRow }
      this.statusForm.id = latestRow.id
      this.statusForm.exceptionStatus = 3 // 填写后更新为对策制定中(3)
      this.statusForm.temporaryMeasures = latestRow.temporaryMeasures || ''
      this.statusForm.longTermImprovement = latestRow.longTermImprovement || ''
      this.statusForm.effectConfirmation = latestRow.effectConfirmation || ''
      
      console.log('填写临时对策 - 最新数据:', {
        causeAnalysis: latestRow.causeAnalysis,
        temporaryMeasures: latestRow.temporaryMeasures
      })
      
      this.statusDialogVisible = true
    },
    
    // 责任人填写长期改善对策：对策制定中(3) -> 对策制定中(4)
    handleFillLongTermMeasures(row) {
      this.statusDialogTitle = '填写长期改善对策'
      this.currentOperation = 'fillLongTermMeasures' // 设置当前操作类型
      // 从表格数据中获取最新的行数据
      const latestRow = this.tableData.find(item => item.id === row.id) || row
      this.currentStatusRow = { ...latestRow }
      this.statusForm.id = latestRow.id
      this.statusForm.exceptionStatus = 4 // 状态保持为对策制定中(4)
      this.statusForm.temporaryMeasures = latestRow.temporaryMeasures || ''
      this.statusForm.longTermImprovement = latestRow.longTermImprovement || ''
      this.statusForm.effectConfirmation = latestRow.effectConfirmation || ''
      
      console.log('长期对策 - 最新数据:', {
        causeAnalysis: latestRow.causeAnalysis,
        temporaryMeasures: latestRow.temporaryMeasures,
        longTermImprovement: latestRow.longTermImprovement
      })
      
      this.statusDialogVisible = true
    },
    
    // 确认人确认效果：对策制定中(4) -> 已关闭(5)
    handleConfirmEffect(row) {
      this.statusDialogTitle = '确认效果'
      this.currentOperation = 'confirmEffect' // 设置当前操作类型
      // 从表格数据中获取最新的行数据
      const latestRow = this.tableData.find(item => item.id === row.id) || row
      this.currentStatusRow = { ...latestRow }
      this.statusForm.id = latestRow.id
      this.statusForm.exceptionStatus = 5 // 更新为已关闭(5)
      this.statusForm.temporaryMeasures = latestRow.temporaryMeasures || ''
      this.statusForm.longTermImprovement = latestRow.longTermImprovement || ''
      this.statusForm.effectConfirmation = latestRow.effectConfirmation || ''
      
      console.log('确认效果 - 最新数据:', {
        causeAnalysis: latestRow.causeAnalysis,
        temporaryMeasures: latestRow.temporaryMeasures,
        longTermImprovement: latestRow.longTermImprovement,
        effectConfirmation: latestRow.effectConfirmation
      })
      
      this.statusDialogVisible = true
    },
    
    // 创建人关闭任务：已关闭(5) -> 已关闭(6)
    handleCloseIssue(row) {
      this.$modal.confirm('确认要关闭这个质量问题吗？').then(() => {
        const params = {
          id: row.id,
          exceptionStatus: 6, // 更新为已关闭(6)
          updateTime: this.formatDateTime(new Date())
        }
        
        updateQualityIssue(params).then(res => {
          if (res.code === 200) {
            this.$message.success('关闭成功')
            this.fetchData() // 刷新列表数据
          } else {
            this.$message.error(res.msg || '关闭失败')
          }
        }).catch(() => {
          this.$message.error('关闭失败')
        })
      }).catch(() => {
        // 用户取消操作
      })
    },
    
    // 格式化日期时间为后端期望的格式 yyyy-MM-dd HH:mm:ss
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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

/* 只读内容显示样式 */
.readonly-content {
  padding: 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  min-height: 50px;
  max-height: 200px;
  overflow-y: auto;
}

.readonly-content p {
  margin: 0 0 8px 0;
}

.readonly-content p:last-child {
  margin-bottom: 0;
}

.readonly-content ul,
.readonly-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.readonly-content li {
  margin: 4px 0;
}

.readonly-content strong {
  font-weight: bold;
  color: #303133;
}

.readonly-content em {
  font-style: italic;
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