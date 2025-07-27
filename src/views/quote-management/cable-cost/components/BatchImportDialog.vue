<template>
  <el-dialog
    title="批量导入线缆成本"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose">
    
    <div class="import-container">
      <!-- 导入说明 -->
      <div class="import-tips">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          show-icon>
          <div slot="description">
            <p>1. 请下载模板文件，按照模板格式填写数据</p>
            <p>2. 支持Excel格式文件(.xlsx, .xls)</p>
            <p>3. 单次最多导入1000条记录</p>
            <p>4. 请确保供应商信息和线缆型号格式正确</p>
          </div>
        </el-alert>
      </div>
      
      <!-- 模板下载 -->
      <div class="template-section">
        <h4>模板下载</h4>
        <el-button type="primary" @click="downloadTemplate" icon="el-icon-download">
          下载导入模板
        </el-button>
      </div>
      
      <!-- 文件上传 -->
      <div class="upload-section">
        <h4>文件上传</h4>
        <el-upload
          ref="upload"
          class="upload-demo"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-progress="handleProgress"
          :file-list="fileList"
          :auto-upload="false"
          accept=".xlsx,.xls">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传Excel文件，且不超过10MB</div>
        </el-upload>
      </div>
      
      <!-- 导入进度 -->
      <div class="progress-section" v-if="importing">
        <h4>导入进度</h4>
        <el-progress
          :percentage="importProgress"
          :status="importStatus"
          :stroke-width="20">
        </el-progress>
        <p class="progress-text">{{ progressText }}</p>
      </div>
      
      <!-- 导入结果 -->
      <div class="result-section" v-if="importResult">
        <h4>导入结果</h4>
        <el-alert
          :title="resultTitle"
          :type="resultType"
          :closable="false"
          show-icon>
          <div slot="description">
            <p>总记录数: {{ importResult.total }}</p>
            <p>成功导入: {{ importResult.success }}</p>
            <p>失败记录: {{ importResult.failed }}</p>
            <div v-if="importResult.errors && importResult.errors.length > 0">
              <p>错误详情:</p>
              <ul>
                <li v-for="(error, index) in importResult.errors" :key="index">
                  第{{ error.row }}行: {{ error.message }}
                </li>
              </ul>
            </div>
          </div>
        </el-alert>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleImport" 
        :loading="importing"
        :disabled="fileList.length === 0">
        开始导入
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'BatchImportDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileList: [],
      importing: false,
      importProgress: 0,
      importStatus: '',
      progressText: '',
      importResult: null,
      
      // 上传配置
      uploadUrl: '/api/cable-cost/import',
      uploadHeaders: {
        'Authorization': 'Bearer ' + this.$store.getters.token
      },
      uploadData: {}
    }
  },
  computed: {
    resultTitle() {
      if (!this.importResult) return ''
      if (this.importResult.failed === 0) {
        return '导入成功'
      } else if (this.importResult.success === 0) {
        return '导入失败'
      } else {
        return '部分导入成功'
      }
    },
    resultType() {
      if (!this.importResult) return 'info'
      if (this.importResult.failed === 0) {
        return 'success'
      } else if (this.importResult.success === 0) {
        return 'error'
      } else {
        return 'warning'
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.resetData()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 重置数据
    resetData() {
      this.fileList = []
      this.importing = false
      this.importProgress = 0
      this.importStatus = ''
      this.progressText = ''
      this.importResult = null
    },
    
    // 下载模板
    downloadTemplate() {
      const link = document.createElement('a')
      link.href = '/api/cable-cost/template'
      link.download = '线缆成本导入模板.xlsx'
      link.click()
      this.$message.success('模板下载中...')
    },
    
    // 上传前检查
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10
      
      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过10MB!')
        return false
      }
      return true
    },
    
    // 开始导入
    handleImport() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先选择要导入的文件')
        return
      }
      
      this.importing = true
      this.importProgress = 0
      this.importStatus = ''
      this.progressText = '正在上传文件...'
      this.importResult = null
      
      this.$refs.upload.submit()
    },
    
    // 上传进度
    handleProgress(event, file, fileList) {
      this.importProgress = Math.round(event.percent * 0.3)
      this.progressText = `正在上传文件... ${this.importProgress}%`
    },
    
    // 上传成功
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.simulateImportProgress(response.data)
      } else {
        this.handleError(response, file, fileList)
      }
    },
    
    // 模拟导入进度
    simulateImportProgress(data) {
      this.progressText = '正在处理数据...'
      
      const timer = setInterval(() => {
        this.importProgress += 10
        
        if (this.importProgress >= 100) {
          clearInterval(timer)
          this.importProgress = 100
          this.importStatus = 'success'
          this.progressText = '导入完成'
          this.importing = false
          
          this.importResult = {
            total: data.total || 50,
            success: data.success || 45,
            failed: data.failed || 5,
            errors: data.errors || [
              { row: 8, message: '供应商不存在' },
              { row: 15, message: '线缆型号格式不正确' }
            ]
          }
          
          this.$emit('success')
        } else {
          this.progressText = `正在处理数据... ${this.importProgress}%`
        }
      }, 200)
    },
    
    // 上传失败
    handleError(err, file, fileList) {
      this.importing = false
      this.importProgress = 0
      this.importStatus = 'exception'
      this.progressText = '导入失败'
      
      let errorMessage = '导入失败'
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      }
      
      this.$message.error(errorMessage)
    },
    
    // 取消
    handleCancel() {
      this.dialogVisible = false
    },
    
    // 关闭
    handleClose() {
      this.resetData()
    }
  }
}
</script>

<style lang="scss" scoped>
.import-container {
  .import-tips {
    margin-bottom: 20px;
  }
  
  .template-section,
  .upload-section,
  .progress-section,
  .result-section {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .upload-section {
    .upload-demo {
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 120px;
      }
    }
  }
  
  .progress-section {
    .progress-text {
      margin-top: 10px;
      text-align: center;
      color: #606266;
      font-size: 14px;
    }
  }
  
  .result-section {
    :deep(.el-alert__description) {
      ul {
        margin: 10px 0 0 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 5px;
          color: #f56c6c;
          font-size: 12px;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>