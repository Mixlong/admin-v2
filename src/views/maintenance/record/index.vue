<template>
  <div class="maintenance-record-container app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      ref="searchForm"
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
      @reset="handleReset" 
      @filters-cleared="handleReset"
      @field-change="handleFieldChange">
      
      <!-- 自定义品类字段渲染 -->
      <template #field-category="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <el-select v-model="searchForm[field.key]" placeholder="请选择机型" clearable filterable size="mini" @change="handleSearch">
            <el-option 
              v-for="item in categoryOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义维修员字段渲染 -->
      <template #field-repairPerson="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
          <el-select v-model="searchForm[field.key]" placeholder="请选择维修员" clearable filterable size="mini" @change="handleSearch">
            <el-option 
              v-for="item in repairPersonOptions" 
              :key="item.userId" 
              :label="item.userName" 
              :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义时间范围字段渲染 -->
      <template #field-dateRange="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
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

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus" size="mini" v-hasPermi="['maintenance:record:add']">
          新增
        </el-button>
        <el-button type="warning" @click="handleExport" icon="el-icon-download" size="mini" :loading="exportLoading" v-hasPermi="['maintenance:record:export']">
          导出数据
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border 
        style="width: 100%" 
        :height="tableHeight(-50)"
        row-key="id">
        <el-table-column prop="createTime" label="日期" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="schedulingNo" label="排产单号" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.schedulingNo || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pcbaSn" label="PCBA SN" align="center" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.pcbaSn || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="机型" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.categoryName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="defectReason" label="不良描述" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.defectReason || '--' }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="discoverWorkstation" label="发现工位" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.discoverWorkstation || '--' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="defectiveImg" label="不良照片" align="center" width="140">
          <template slot-scope="scope">
            <div v-if="scope.row.defectiveImg && getImageList(scope.row.defectiveImg).length > 0">
              <el-carousel 
                v-if="getImageList(scope.row.defectiveImg).length > 1"
                height="50px" 
                :autoplay="false" 
                indicator-position="none"
                arrow="hover"
                :interval="4000"
                style="width: 120px; border-radius: 4px; overflow: hidden;">
                <el-carousel-item 
                  v-for="(img, index) in getImageList(scope.row.defectiveImg)" 
                  :key="index">
                  <el-image
                    style="width: 60px; height: 50px"
                    :src="img"
                    :preview-src-list="getImageList(scope.row.defectiveImg)"
                    :initial-index="index"
                    fit="cover">
                  </el-image>
                </el-carousel-item>
              </el-carousel>
              <el-image
                v-else
                style="width: 60px; height: 50px; border-radius: 4px;"
                :src="getImageList(scope.row.defectiveImg)[0]"
                :preview-src-list="getImageList(scope.row.defectiveImg)"
                fit="cover">
              </el-image>
            </div>
            <span v-else>--</span>
          </template>
        </el-table-column>
               
        <el-table-column prop="repairMethod" label="维修方案" align="center"     >
          <template slot-scope="scope">
            <div style="max-height:120px;overflow-y:auto;">
              <div v-html="scope.row.repairMethod || '--'" ></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="consumedMaterials" label="损耗物料" align="center"  width="200"  >
          <template slot-scope="scope">
            <div style="max-height:120px;overflow-y:auto;">
            <div v-html="scope.row.consumedMaterials || '--'" ></div>
          </div>
          </template>
        </el-table-column>
        <el-table-column prop="repairTestResult" label="维修结果" align="center"  >
          <template slot-scope="scope">
            <span>{{ scope.row.repairTestResult || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="responsibilityResult" label="责任判定" align="center" >
          <template slot-scope="scope">
            <span>{{ scope.row.responsibilityResult || '--' }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createBy" label="报修人员" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.createBy || '--' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="createBy" label="维修员" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.createBy || '--' }}</span>
          </template>
        </el-table-column>      
 
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit" v-hasPermi="['maintenance:record:edit']">编辑</el-button>
            <el-button size="mini" type="text" @click="handleCopy(scope.row)" icon="el-icon-document-copy" v-hasPermi="['maintenance:record:add']">复制</el-button>
            <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)" icon="el-icon-delete" v-hasPermi="['maintenance:record:remove']">删除</el-button>
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
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AddRecordDialog 
      :visible.sync="addDialogVisible" 
      :editData="editData" 
      :categoryOptions="categoryOptions"
      @success="handleDialogSuccess">
    </AddRecordDialog>

  </div>
</template>

<script>
import AddRecordDialog from './components/AddRecordDialog'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import { 
  getMaintenanceRecordList, 
  deleteMaintenanceRecord,
  exportMaintenanceRecord
} from '@/api/maintenance/record'
import { getCategoryList } from '@/api/quote-management/quotation'
import { getDicts } from '@/api/system/dict/data'
import { dictUserList } from '@/api/system/user'

export default {
  name: 'MaintenanceRecord',
  components: {
    AddRecordDialog,
    IntelligentSearchForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        category: '',
        productionLine: '',
        repairPerson: '',
        pcbaSn: '',
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
        size: 20,
        total: 0
      },
      // 选中的行
      selectedRows: [],
      // 弹窗控制
      addDialogVisible: false,
      // 编辑数据
      editData: null,
      // 导出loading状态
      exportLoading: false,
      // 品类选项
      categoryOptions: [],
      // 生产线选项
      productionLineOptions: [],
      // 维修员选项
      repairPersonOptions: [],
      // 不良归属选项
      defectAttributionOptions: [],
      
      // IntelligentSearchForm 字段配置
      searchFields: [
        {
          key: 'category',
          label: '机型',
          type: 'custom',
        },
 
        {
          key: 'repairPerson',
          label: '维修员',
          type: 'custom',
        },
        {
          key: 'dateRange',
          label: '时间范围',
          type: 'custom',
        }
      ]
    }
  },
  created() {
    this.loadCategoryOptions()
    this.loadProductionLineOptions()
    this.loadRepairPersonOptions()
    this.loadDefectAttributionOptions()
    this.fetchData()
  },
  methods: {
    // 处理多图显示 - 将逗号分隔的URL字符串转换为数组
    getImageList(imgStr) {
      if (!imgStr) return []
      return imgStr.split(',').filter(url => url.trim() !== '')
    },
    

    
    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        p: this.pagination.current,
        l: this.pagination.size,
        category: this.searchForm.category || undefined,
        productionLine: this.searchForm.productionLine || undefined,
        repairPerson: this.searchForm.repairPerson || undefined,
        pcbaSn: this.searchForm.pcbaSn || undefined,
        startDate: this.searchForm.startDate || undefined,
        endDate: this.searchForm.endDate || undefined
      }

      // 过滤掉空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key]
        }
      })

      getMaintenanceRecordList(params).then((res) => {
        console.log('API返回数据:', res)
        if (res.code === 200 && res.data) {
          // 根据API文档，数据结构应该是 { list, pageNum, pageSize, pages, total }
          this.tableData = res.data.list || []
          this.pagination.total = res.data.total || 0
          this.pagination.current = res.data.pageNum || this.pagination.current
          this.pagination.size = res.data.pageSize || this.pagination.size
        } else {
          this.$message.error(res.msg || '获取数据失败')
          this.tableData = []
          this.pagination.total = 0
        }
      }).catch((error) => {
        console.error('API调用失败:', error)
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
      // 手动重置所有搜索字段
      Object.keys(this.searchForm).forEach(key => {
        this.$set(this.searchForm, key, '')
      })
      
      // 重置日期范围
      this.dateRange = []
      
      // 重置分页
      this.pagination.current = 1
      
      // 强制更新视图以确保所有组件都反映新的数据状态
      this.$nextTick(() => {
        this.$forceUpdate()
        this.fetchData()
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

    // 新增记录
    handleAdd() {
      this.editData = null
      this.addDialogVisible = true
    },

    // 编辑记录
    handleEdit(row) {
      this.editData = { ...row }
      this.addDialogVisible = true
    },

    // 复制记录
    handleCopy(row) {
      // 复制当前数据作为新增，但清空PCBA SN和ID
      const copyData = { ...row }

      delete copyData.id // 移除ID，作为新增
      delete copyData.updateTime // 移除更新时间
      delete copyData.createTime // 移除创建时间
      copyData.pcbaSn = '' // 清空PCBA SN
      
      this.editData = copyData
      this.addDialogVisible = true
    },

    // 删除记录
    handleDelete(row) {
      this.$confirm('确定要删除这条维修记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMaintenanceRecord(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的记录')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          let successCount = 0
          let errorCount = 0
          
          for (const row of this.selectedRows) {
            try {
              const res = await deleteMaintenanceRecord(row.id)
              if (res.code === 200) {
                successCount++
              } else {
                errorCount++
              }
            } catch (error) {
              errorCount++
            }
          }
          
          if (successCount > 0) {
            this.$message.success(`成功删除 ${successCount} 条记录${errorCount > 0 ? `，失败 ${errorCount} 条` : ''}`)
            this.fetchData()
          } else {
            this.$message.error('删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 表格选择项变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
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
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 计算表格高度
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset
    },

    // 加载品类选项
    loadCategoryOptions() {
      getCategoryList().then(res => {
        if (res.code === 200 && res.data) {
          this.categoryOptions = res.data.filter(item => item.isSample === 1)
        } else {
          this.categoryOptions = []
        }
        console.log('品类选项:', this.categoryOptions)
      }).catch(error => {
        console.error('获取品类数据失败:', error)
        this.$message.error('获取品类数据失败')
        this.categoryOptions = []
      })
    },

    // 加载生产线选项
    loadProductionLineOptions() {
      getDicts('sop_line').then(res => {
        if (res.code === 200 && res.data) {
          this.productionLineOptions = res.data
        } else {
          this.productionLineOptions = []
        }
        console.log('生产线选项:', this.productionLineOptions)
      }).catch(error => {
        console.error('获取生产线字典失败:', error)
        this.$message.error('获取生产线字典失败')
        this.productionLineOptions = []
      })
    },

    // 加载维修员选项
    loadRepairPersonOptions() {
      dictUserList().then(res => {
        if (res && res.data) {
          // 对数据进行去重处理，避免重复键值问题
          const uniqueUsers = []
          const userNameSet = new Set()

          res.data.forEach(user => {
            if (!userNameSet.has(user.userName)) {
              userNameSet.add(user.userName)
              uniqueUsers.push(user)
            }
          })

          this.repairPersonOptions = uniqueUsers
          console.log('维修员选项:', this.repairPersonOptions)
        } else {
          this.repairPersonOptions = []
        }
      }).catch(error => {
        console.error('获取维修员列表失败:', error)
        this.$message.error('获取维修员列表失败')
        this.repairPersonOptions = []
      })
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出当前搜索条件下的维修记录数据项?').then(() => {
        this.exportLoading = true;
        
        // 准备导出参数，使用当前搜索条件
        const params = {
          category: this.searchForm.category || undefined,
          productionLine: this.searchForm.productionLine || undefined,
          repairPerson: this.searchForm.repairPerson || undefined,
          pcbaSn: this.searchForm.pcbaSn || undefined,
          startDate: this.searchForm.startDate || undefined,
          endDate: this.searchForm.endDate || undefined
        };

        // 过滤掉空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key];
          }
        });

        return exportMaintenanceRecord(params);
      }).then(response => {
        if (response.code === 200 && response.msg) {
          this.download(response.msg);
        } else {
          this.$message.error('导出失败');
        }
        this.exportLoading = false;
      }).catch(() => {
        this.exportLoading = false;
      });
    },


    // 加载不良归属选项
    loadDefectAttributionOptions() {
      getDicts('err_attribution').then(res => {
        if (res.code === 200 && res.data) {
          this.defectAttributionOptions = res.data
        } else {
          this.defectAttributionOptions = []
        }
        console.log('不良归属选项:', this.defectAttributionOptions)
      }).catch(error => {
        console.error('获取不良归属字典失败:', error)
        this.$message.error('获取不良归属字典失败')
        this.defectAttributionOptions = []
      })
    },

    // 获取不良归属标签
    getDefectAttributionLabel(value) {
      if (!value || !this.defectAttributionOptions.length) return value
      const option = this.defectAttributionOptions.find(item => item.dictValue === value)
      return option ? option.dictLabel : value
    },

    // IntelligentSearchForm 字段变化处理
    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value)
    }
  }
}
</script>

<style scoped>
.maintenance-record-container {
  padding: 20px;
}

.search-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 10px;
}

.text-content {
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
  text-align: left;
  cursor: help;
}

.text-content:hover {
  color: #409eff;
}

.action-section {
  text-align: right;
}

.table-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}

.text-red {
  color: #f56c6c;
}

.rich-text-content {
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
  text-align: left;
}

.rich-text-content p {
  margin: 0;
  padding: 2px 0;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
}

.rich-text-content ul, .rich-text-content ol {
  margin: 0;
  padding-left: 20px;
}

.rich-text-content li {
  margin: 2px 0;
}

/* 缩小轮播箭头大小 */
.el-carousel__arrow {
  width: 20px !important;
  height: 20px !important;
  font-size: 10px !important;
}

.el-carousel__arrow--left {
  left: 2px !important;
}

.el-carousel__arrow--right {
  right: 2px !important;
}
</style>