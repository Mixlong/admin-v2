<template>
  <div class="iqc-inspection-data-container app-container flex-app-container">
 

    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="3" 
      @reset="handleReset" 
      @field-change="handleFieldChange"
      @layout-changed="handleSearchFormLayoutChanged">

      <!-- 自定义来料编码字段 -->
      <template #field-invCode="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <select-loadMore
            v-model="searchForm[field.key]"
            style="width: 200px"
            :data="inventoryData.data"
            :page="inventoryData.page"
            :hasMore="inventoryData.more"
            dictLabel="invCode"
            dictValue="invCode"
            :request="getInventoryList"
            placeholder="请选择物料编码"
            size="mini"
            @change="handleSearch">
          </select-loadMore>
        </el-form-item>
      </template>


      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus" size="mini" v-hasPermi="['iqc-inspection-data:add']">
          新增
        </el-button>
        <el-button type="danger" @click="handleExport" icon="el-icon-download" size="mini" :loading="exportLoading" v-hasPermi="['iqc-inspection-data:export']">
          导出
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border  
        style="width: 100%" 
        :height="tableHeight(-150)"
        row-key="id">
                
 
        
        <el-table-column prop="inventoryCreateTime" label="日期" align="center" width="110">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.createTime , 'yyyy-MM-dd') || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invCode" label="物料编码" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.invCode || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invName" label="物料名称" align="center" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.invName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="englishName" label="规格" align="center" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.englishName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invDefine" label="供应商" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.invDefine || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="来料记录" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.id || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.batchNo || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="arrivalQuantity" label="来料数量" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.arrivalQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="samplingQuantity" label="检验数量" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.samplingQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="defectiveQuantity" label="不良数量" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.defectiveQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="defectiveRate" label="不良率" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="getDefectRateTagType(scope.row.defectiveRate)">
              {{ scope.row.defectiveRate || '0.00%' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="testResult" label="检验结果" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="getInspectionResultTagType(scope.row.testResult)">
              {{ getResultText(scope.row.testResult) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="defectiveDesc" label="检验结果描述" align="center" >
          <template slot-scope="scope">
            <div v-if="scope.row.defectiveDesc" v-html="scope.row.testInfo" class="rich-text-content"></div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="检验员" align="center" width="100"/>
         
        <el-table-column label="操作" width="180" align="center" >
          <template slot-scope="scope">
            <el-button size="mini" type="text"  icon="el-icon-link" v-if="scope.row.testResult === 'NG'" 
            :disabled="scope.row.isEcn==1"
            @click="handleDefectProcessing(scope.row)">特采申请</el-button>
            <el-button size="mini" type="text" @click="handleView(scope.row)" icon="el-icon-view">查看</el-button>
            <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit">编辑</el-button>
            <el-button 
              size="mini" 
              type="text" 
              @click="handleDelete(scope.row)" 
              icon="el-icon-delete"
              style="color: #F56C6C;">
              删除
            </el-button>
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
    <AddInspectionDataDialog 
      :visible.sync="addDialogVisible" 
      :editData="editData" 
      :basicInfoId="basicInfoId"
      @success="handleDialogSuccess">
    </AddInspectionDataDialog>

    <!-- 查看对话框 -->
    <ViewInspectionDataDialog 
      :visible.sync="viewDialogVisible"
      :view-data="viewData">
    </ViewInspectionDataDialog>
  </div>
</template>

<script>
import AddInspectionDataDialog from './components/AddInspectionDataDialog'
import ViewInspectionDataDialog from './components/ViewInspectionDataDialog'
import { 
  getIqcInspectionDataList,
  deleteIqcInspectionData
} from '@/api/iqc/inspectionData'
import { exportInventoryInfo } from '@/api/base/inventory'
import { getIqcBasicInfoById } from '@/api/iqc/basicInfo'
import { afterCategoryList } from '@/api/third/sale'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import selectLoadMore from '@/components/selectLoadMore'

export default {
  name: 'IqcInspectionData',
  components: {
    AddInspectionDataDialog,
    ViewInspectionDataDialog,
    IntelligentSearchForm,
    selectLoadMore
  },
  data() {
    return {
      // 基础信息ID
      basicInfoId: null,
      // 基础信息数据
      basicInfoData: null,
      // 搜索表单
      searchForm: {
        inspectionResult: '',
        defectQuantityMin: '',
        defectQuantityMax: '',
        testResult: ''
      },
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
      // 查看数据
      viewData: {},
      // 导出加载状态
      exportLoading: false,
      
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },

      // 来料数据
      inventoryData: {
        data: [],
        page: 1,
        more: true,
      },
      
      // IntelligentSearchForm 配置
      searchFields: [
        {
          key: 'invCode',
          label: '物料编码',
          type: 'custom', // 使用自定义插槽
          sort: 2
        },
        {
          key: 'testResult',
          label: '检验结果',
          type: 'select',
          options: [
            { label: 'PASS', value: 'PASS' },
            { label: 'NG', value: 'NG' }
          ],
          placeholder: '请选择检验结果',
          sort: 3
        }
      ]
    }
  },
  created() {
    // 从路由参数获取基础信息ID
    this.basicInfoId = this.$route.query.basicInfoId
    if (this.basicInfoId) {
      this.loadBasicInfo()
    }
    this.fetchData()
  },
  methods: {
    // 加载基础信息
    async loadBasicInfo() {
      try {
        const res = await getIqcBasicInfoById(this.basicInfoId)
        if (res.code === 200) {
          this.basicInfoData = res.data
        }
      } catch (error) {
        console.error('加载基础信息失败:', error)
      }
    },

    // 返回基础信息页面
    backToBasicInfo() {
      this.$router.push('/iqc/basic-info')
    },

    // 获取列表数据
    fetchData() {
      this.loading = true
      
      // 过滤空值参数
      const params = {}
      if (this.pagination.current) params.p = this.pagination.current
      if (this.pagination.size) params.l = this.pagination.size
      if (this.basicInfoId) params.basicInfoId = this.basicInfoId
      if (this.searchForm.id) params.id = this.searchForm.id
      if (this.searchForm.invCode) params.invCode = this.searchForm.invCode
      if (this.searchForm.category) params.category = this.searchForm.category
      if (this.searchForm.inspectionResult) params.inspectionResult = this.searchForm.inspectionResult
      if (this.searchForm.defectQuantityMin) params.defectQuantityMin = this.searchForm.defectQuantityMin
      if (this.searchForm.defectQuantityMax) params.defectQuantityMax = this.searchForm.defectQuantityMax
      if (this.searchForm.testResult) params.testResult = this.searchForm.testResult

      console.log('IQC检验数据列表请求参数:', params)

      getIqcInspectionDataList(params).then((res) => {
        console.log('IQC检验数据列表响应:', res)
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
        console.error('IQC检验数据列表请求失败:', error)
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
      this.searchForm = {
        inspectionResult: '',
        defectQuantityMin: '',
        defectQuantityMax: '',
        testResult: ''
      }
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

    // 新增记录
    handleAdd() {
      this.editData = null
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
      this.addDialogVisible = true
    },

    // 从查看对话框跳转到编辑
    handleEditFromView(data) {
      this.editData = { ...data }
      this.addDialogVisible = true
    },

    // 跳转到不良处理页面
    handleDefectProcessing(row) {
      this.$router.push({
        name: 'Defect-processing',
        query: {
          basicInfoId: this.basicInfoId,
          inspectionDataId: row.id,
          materialCode: this.basicInfoData?.materialCode,
          materialName: this.basicInfoData?.materialName
        }
      })
    },

    // 删除记录
    handleDelete(row) {
      this.$confirm(`确定要删除这条检验数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRecord(row.id)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 执行删除
    async deleteRecord(id) {
      try {
        const res = await deleteIqcInspectionData(id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.fetchData()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败')
      }
    },

    // 获取不良率标签类型
    getDefectRateTagType(rate) {
      if (!rate || rate === '0.00%') return 'success'
      const numRate = parseFloat(rate.replace('%', ''))
      if (numRate <= 2) return 'success'
      if (numRate <= 5) return 'warning'
      return 'danger'
    },

    // 获取检验结果标签类型
    getInspectionResultTagType(result) {
      switch (result) {
        case 'PASS':
          return 'success'
        case 'NG':
          return 'danger'
        default:
          return 'info'
      }
    },

    // 获取检验结果文本
    getResultText(result) {
      switch (result) {
        case 'PASS':
          return 'PASS'
        case 'NG':
          return 'NG'
        default:
          return '--'
      }
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
    // 获取结果文本
    getResultText(result) {
      const resultMap = {
        'PASS': 'PASS',
        'NG': 'NG',
      }
      return resultMap[result] || '未知'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return date.split(' ')[0] // 只显示日期部分
    },

    // 计算表格高度
    tableHeight(offset = 0) {
      return window.innerHeight - 400 - offset // 考虑到关联信息卡片的高度
    },

    // 获取品类列表
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data
          if (more) {
            this.categoryData.data = [...this.categoryData.data, ...list]
          } else {
            this.categoryData.data = list
          }
          this.categoryData.more = pageNum * pageSize < total
          this.categoryData.page = pageNum
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },

    // 获取来料编码列表
    getInventoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getIqcInspectionDataList({
          p: page,
          l: 20,
          invCode: keyword
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.inventoryData.data = [...this.inventoryData.data, ...list]
            } else {
              this.inventoryData.data = list
            }
            this.inventoryData.more = pageNum * pageSize < total
            this.inventoryData.page = pageNum
          }
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },

    // 导出来料记录
    async handleExport() {
      // 确认导出
      try {
        await this.$confirm('确定要导出当前搜索条件下的来料记录数据吗？', '确认导出', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
      } catch {
        return // 用户取消
      }
      
      this.exportLoading = true
      
      try {
        // 构建导出参数，使用当前的搜索条件
        const params = {}
        if (this.basicInfoId) params.id = this.basicInfoId
        if (this.searchForm.id) params.id = this.searchForm.id
        if (this.searchForm.invCode) params.invCode = this.searchForm.invCode
        if (this.searchForm.category) params.category = this.searchForm.category
        if (this.searchForm.inspectionResult) params.inspectionResult = this.searchForm.inspectionResult
        if (this.basicInfoData?.inventoryStartDate) params.inventoryStartDate = this.basicInfoData.inventoryStartDate
        if (this.basicInfoData?.inventoryEndDate) params.inventoryEndDate = this.basicInfoData.inventoryEndDate
        
        // 过滤掉空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        
        console.log('导出参数:', params)
        
        // 调用导出接口，获取文件ID
        const response = await exportInventoryInfo(params)
        
        if (response.code === 200 && response.msg) {
          // 使用文件ID下载文件
          this.download(response.msg)
          this.$message.success('导出成功')
        } else {
          this.$message.error(response.msg || '导出失败')
        }
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.iqc-inspection-data-container {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}
</style>

<style>
/* 富文本表格显示样式 */
.el-table .cell .rich-text-content {
  max-height: 60px;
  overflow: hidden;
  line-height: 1.4;
  font-size: 12px;
  word-break: break-word;
}

.el-table .cell .rich-text-content p {
  margin: 0;
  padding: 0;
  line-height: 1.4;
  display: inline;
}

.el-table .cell .rich-text-content p + p::before {
  content: " ";
  white-space: pre;
}

/* 表格标签样式优化 */
.el-table .el-tag {
  font-size: 12px;
  padding: 0 8px;
}

/* 表格操作列固定样式 */
.el-table .el-table-column--selection,
.el-table .el-table-column--index {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #fff;
}
</style>