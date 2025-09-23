<template>
  <el-dialog 
    :title="editData ? '编辑基础信息' : '新增基础信息'"
    :visible.sync="dialogVisible" 
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose">
    
    <div class="dialog-content">
      <el-form 
        ref="form" 
        :model="form" 
        :rules="rules" 
        label-width="120px"
        size="mini">
        
        <!-- 基础信息区域 -->
        <fieldset class="form-fieldset">
          <legend>基础信息</legend>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="ECN编号" prop="ecnCode">
                <el-input 
                  v-model="form.ecnCode" 
                  placeholder="系统自动生成"
                  readonly
                  prefix-icon="el-icon-document-copy">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间" prop="createTime">
                <el-input 
                  v-model="form.createTime" 
                  placeholder="系统自动生成"
                  readonly
                  prefix-icon="el-icon-time">
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>

        <!-- 来料信息区域 -->
        <fieldset class="form-fieldset">
          <legend>来料信息</legend>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="物料编码" prop="invCode">
                <el-input
                  v-model="form.invCode"
                  placeholder="请选择来料信息"
                  readonly
                  @click="handleSelectInventory">
                  <el-button 
                    slot="append" 
                    icon="el-icon-search" 
                    @click="handleSelectInventory">
                    选择
                  </el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="物料名称" prop="invName">
                <el-input
                  v-model="form.invName"
                  placeholder="物料名称"
                  readonly>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="供应商" prop="supplier">
                <el-input
                  v-model="form.supplier"
                  placeholder="供应商"
                  readonly>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="物料标准" prop="invStd">
                <el-input
                  v-model="form.invStd"
                  placeholder="物料标准"
                  readonly>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="英文名称" prop="englishName">
                <el-input
                  v-model="form.englishName"
                  placeholder="英文名称"
                  readonly>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>

        <!-- 备注信息 -->
        <fieldset class="form-fieldset">
          <legend>备注信息</legend>
          
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息">
            </el-input>
          </el-form-item>
        </fieldset>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="mini">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading" size="mini">
        {{ editData ? '更 新' : '保 存' }}
      </el-button>
    </div>

    <!-- 来料信息选择对话框 -->
    <el-dialog
      title="选择来料信息"
      :visible.sync="inventorySelectVisible"
      width="1200px"
      :close-on-click-modal="false"
      top="0"
      append-to-body>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" class="search-form" size="mini">
        <el-form-item label="物料编码">
          <el-input v-model="inventorySearchForm.invCode" placeholder="请输入物料编码" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="inventorySearchForm.invName" placeholder="请输入物料名称" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleInventorySearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleInventoryReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 来料列表 -->
      <el-table 
        :data="inventoryTableData" 
        v-loading="inventoryLoading" 
        border
        style="width: 100%"
        height="60vh"
        @row-click="handleInventoryRowClick"
        highlight-current-row>
        
        <el-table-column prop="invCode" label="物料编码" align="center" width="140"></el-table-column>
        <el-table-column prop="invName" label="物料名称" align="center" width="170"></el-table-column>
        <el-table-column prop="englishName" label="英文名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="invStd" label="物料标准" align="center"></el-table-column>
        <el-table-column prop="invDefine" label="供应商" align="center" width="120"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleSelectInventoryRow(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section" style="margin-top: 20px; text-align: right;">
        <el-pagination
          @size-change="handleInventorySizeChange"
          @current-change="handleInventoryCurrentChange"
          :current-page="inventoryPagination.current"
          :page-sizes="[10, 20, 50]"
          :page-size="inventoryPagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="inventoryPagination.total">
        </el-pagination>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { 
  addIqcBasicInfo, 
  updateIqcBasicInfo 
} from '@/api/iqc/basicInfo'
import { getInventoryInfoList } from '@/api/iqc/inspectionData'

export default {
  name: 'AddBasicInfoDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitLoading: false,
      inventorySelectVisible: false,
      inventoryLoading: false,
      form: {
        ecnCode: '',
        createTime: '',
        invCode: '',
        invName: '',
        englishName: '',
        invStd: '',
        supplier: '',
        remark: '',
        inventoryInfoId: '' // 来料信息ID
      },
      // 来料搜索表单
      inventorySearchForm: {
        invCode: '',
        invName: ''
      },
      // 来料表格数据
      inventoryTableData: [],
      // 来料分页信息
      inventoryPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      rules: {
        ecnCode: [
          { required: true, message: 'ECN编号不能为空', trigger: 'blur' }
        ],
        invCode: [
          { required: true, message: '请选择来料信息', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    // 初始化数据
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑模式，填充数据
        this.form = {
          id: this.editData.id,
          ecnCode: this.editData.ecnCode || '',
          createTime: this.editData.createTime || '',
          invCode: this.editData.invCode || '',
          invName: this.editData.invName || '',
          englishName: this.editData.englishName || '',
          invStd: this.editData.invStd || '',
          supplier: this.editData.supplier || this.editData.invDefine || '',
          remark: this.editData.remark || '',
          inventoryInfoId: this.editData.inventoryInfoId || ''
        }
      } else {
        // 新增模式，生成ECN编号
        const now = new Date()
        this.form = {
          ecnCode: this.generateEcnCode(),
          createTime: this.formatDateTime(now),
          invCode: '',
          invName: '',
          englishName: '',
          invStd: '',
          supplier: '',
          remark: '',
          inventoryInfoId: ''
        }
      }
      
      // 清除验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    // 生成ECN编号
    generateEcnCode() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const time = String(now.getHours()).padStart(2, '0') + 
                   String(now.getMinutes()).padStart(2, '0') + 
                   String(now.getSeconds()).padStart(2, '0')
      return `ECN${year}${month}${day}${time}`
    },

    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0')
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    },

    // 选择来料信息
    handleSelectInventory() {
      this.inventorySelectVisible = true
      this.loadInventoryData()
    },

    // 加载来料数据
    loadInventoryData() {
      this.inventoryLoading = true
      const params = {
        current: this.inventoryPagination.current,
        size: this.inventoryPagination.size,
        invCode: this.inventorySearchForm.invCode,
        invName: this.inventorySearchForm.invName
      }

      getInventoryInfoList(params).then(res => {
        if (res.code === 200) {
          this.inventoryTableData = res.data.records || []
          this.inventoryPagination.total = res.data.total || 0
        }
      }).catch(error => {
        console.error('加载来料数据失败:', error)
        this.$message.error('加载来料数据失败')
      }).finally(() => {
        this.inventoryLoading = false
      })
    },

    // 来料搜索
    handleInventorySearch() {
      this.inventoryPagination.current = 1
      this.loadInventoryData()
    },

    // 重置来料搜索
    handleInventoryReset() {
      this.inventorySearchForm = {
        invCode: '',
        invName: ''
      }
      this.inventoryPagination.current = 1
      this.loadInventoryData()
    },

    // 来料分页大小改变
    handleInventorySizeChange(val) {
      this.inventoryPagination.size = val
      this.inventoryPagination.current = 1
      this.loadInventoryData()
    },

    // 来料当前页改变
    handleInventoryCurrentChange(val) {
      this.inventoryPagination.current = val
      this.loadInventoryData()
    },

    // 来料行点击
    handleInventoryRowClick(row) {
      this.handleSelectInventoryRow(row)
    },

    // 选择来料行
    handleSelectInventoryRow(row) {
      this.form.invCode = row.invCode
      this.form.invName = row.invName
      this.form.englishName = row.englishName || ''
      this.form.invStd = row.invStd || ''
      this.form.supplier = row.invDefine || ''
      this.form.inventoryInfoId = row.id
      
      this.inventorySelectVisible = false
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form.validateField('invCode')
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          // 构建提交数据
          const submitData = { ...this.form }
          
          // 调用对应的API
          const apiCall = this.editData 
            ? updateIqcBasicInfo(submitData)
            : addIqcBasicInfo(submitData)
          
          apiCall.then((res) => {
            if (res.code === 200) {
              this.$message.success(this.editData ? '更新成功' : '新增成功')
              this.handleClose()
              this.$emit('success')
            } else {
              this.$message.error(res.msg || '操作失败')
            }
          }).catch((error) => {
            console.error('提交失败:', error)
            this.$message.error('操作失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      // 重置表单
      this.$refs.form && this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  padding: 0 10px;
  border: none;
  width: auto;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px 0;
  border-top: 1px solid #e8eaec;
}

.search-form {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination-section {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

/* 只读输入框样式 */
.el-input.is-disabled .el-input__inner,
.el-input__inner[readonly] {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

/* 选择按钮样式 */
.el-input-group__append .el-button {
  border-left: 0;
}

/* 表格行悬停效果 */
.el-table__row:hover {
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form .el-form-item {
    margin-bottom: 10px;
  }
  
  .search-form .el-input {
    width: 100% !important;
  }
}
</style>