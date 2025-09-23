<template>
  <div class="iqc-basic-info-container app-container flex-app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
      @reset="handleReset" 
      @field-change="handleFieldChange"
      @layout-changed="handleSearchFormLayoutChanged">
    <!-- 自定义日期范围字段渲染 -->
      <template #field-dateRange="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" >
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
            @change="handleDateRangeChange" />
        </el-form-item>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border  
        style="width: 100%" 
        :height="tableHeight(-50)"
        row-key="id">
        <el-table-column prop="invCode" label="物料编码" align="center"  width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.invCode || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invName" label="物料名称" align="center" width="170">
          <template slot-scope="scope">
            <span>{{ scope.row.invName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="englishName" label="英文名称" align="center"   show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.englishName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invStd" label="物料标准" align="center" >
          <template slot-scope="scope">
            <span>{{ scope.row.invStd || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invDefine" label="供应商" align="center" width="120"></el-table-column>
        
        <el-table-column prop="createTime" label="来料日期" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AddBasicInfoDialog 
      :visible.sync="addDialogVisible" 
      :editData="editData" 
      :isView="isViewMode"
      @success="handleDialogSuccess">
    </AddBasicInfoDialog>
  </div>
</template>

<script>
import AddBasicInfoDialog from './components/AddBasicInfoDialog'
import { 
  getIqcBasicInfoList,
} from '@/api/iqc/basicInfo'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'

export default {
  name: 'IqcBasicInfo',
  components: {
    AddBasicInfoDialog,
    IntelligentSearchForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        invCode: '',
        invName: '',
        startDate: '',
        endDate: ''
      },
      // 日期范围
      dateRange: [],
      // 表格数据
      tableData: [],
      loading: false,
      // 分页信息
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 弹窗控制
      addDialogVisible: false,
      // 编辑数据
      editData: null,
      // 是否查看模式
      isViewMode: false,
      
      // IntelligentSearchForm 配置
      searchFields: [
        {
          key: 'invCode',
          label: '物料编码',
          component: 'el-input',
          sort: 1
        },
        {
          key: 'invName',
          label: '物料名称',
          component: 'el-input',
          sort: 2
        },
         {
          key: 'dateRange',
          label: '日期范围',
          component: 'el-date-picker',
          labelWidth: '100px',
          sort: 4
        }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取列表数据
    fetchData() {
      this.loading = true
      
      // 过滤空值参数
      const params = {}
      if (this.pagination.current) params.p = this.pagination.current
      if (this.pagination.size) params.l = this.pagination.size
      if (this.searchForm.invCode) params.invCode = this.searchForm.invCode
      if (this.searchForm.invName) params.invName = this.searchForm.invName
      if (this.searchForm.startDate) params.startDate = this.searchForm.startDate
      if (this.searchForm.endDate) params.endDate = this.searchForm.endDate

      console.log('IQC基础信息列表请求参数:', params)

      getIqcBasicInfoList(params).then((res) => {
        console.log('IQC基础信息列表响应:', res)
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
        console.error('IQC基础信息列表请求失败:', error)
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
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


    // 搜索功能
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      // 重置搜索表单
      this.searchForm = {
        invCode: '',
        invName: '',
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
      this.editData = { ...row }
      this.isViewMode = true
      this.addDialogVisible = true
    },

    // 编辑记录
    handleEdit(row) {
      this.editData = { ...row }
      this.isViewMode = false
      this.addDialogVisible = true
    },

    // 跳转到检验数据页面
    handleInspectionData(row) {
      this.$router.push({
        path: '/iqc/inspection-data',
        query: {
          basicInfoId: row.id,
          invCode: row.invCode,
          invName: row.invName
        }
      })
    },

    // 跳转到不良处理页面
    handleDefectProcessing(row) {
      this.$router.push({
        path: '/iqc/defect-processing',
        query: {
          basicInfoId: row.id,
          invCode: row.invCode,
          invName: row.invName
        }
      })
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

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return date.split(' ')[0] // 只显示日期部分
    },

    // 计算表格高度
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset
    }
  }
}
</script>

<style scoped>
.iqc-basic-info-container {
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
</style>