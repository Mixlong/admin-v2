<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="批量导入"
    width="600px"
    center
    class="import-modal"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="import-container">
      <!-- 步骤条 -->
      <el-steps :active="currentStep" align-center class="mb-6">
        <el-step title="下载模板" description="下载导入模板" />
        <el-step title="上传文件" description="选择并上传文件" />
        <el-step title="导入结果" description="查看导入结果" />
      </el-steps>

      <!-- 步骤1：下载模板 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="template-download">
          <el-alert
            title="导入说明"
            type="info"
            show-icon
            :closable="false"
            class="mb-4"
          >
            <template #default>
              <div>
                <p>1. 请先下载导入模板，按照模板格式填写数据</p>
                <p>2. 支持的文件格式：Excel (.xlsx, .xls)</p>
                <p>3. 单次最多导入1000条记录</p>
                <p>4. 必填字段不能为空</p>
              </div>
            </template>
          </el-alert>

          <div class="text-center">
          <el-button
            type="primary"
            icon="el-icon-download"
            @click="downloadTemplate"
          >
              下载导入模板
            </el-button>
          </div>
        </div>
      </div>

      <!-- 步骤2：上传文件 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          drag
          class="upload-area"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件，且不超过10MB
            </div>
          </template>
        </el-upload>

        <div v-if="uploadFile" class="file-info mt-4">
          <el-card>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i class="el-icon-document mr-2"></i>
                <span>{{ uploadFile.name }}</span>
                <span class="text-gray-500 ml-2">({{ formatFileSize(uploadFile.size) }})</span>
              </div>
              <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="removeFile"
              >
                移除
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 步骤3：导入结果 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="import-result">
          <div class="result-summary mb-4">
            <el-alert
              :title="`导入完成！成功导入 ${importResult.success} 条记录，失败 ${importResult.failed} 条记录`"
              :type="importResult.failed > 0 ? 'warning' : 'success'"
              show-icon
              :closable="false"
            />
          </div>

          <!-- 失败记录详情 -->
          <div v-if="importResult.errors.length > 0" class="error-details">
            <h4 class="mb-2">失败记录详情：</h4>
            <el-table
              :data="importResult.errors"
              style="width: 100%"
              max-height="300"
            >
              <el-table-column prop="row" label="行号" width="80" />
              <el-table-column prop="data" label="数据" min-width="200" />
              <el-table-column prop="error" label="错误原因" min-width="250" />
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button
          v-if="currentStep === 0"
          type="primary"
          size="small"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 1"
          size="small"
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep === 1"
          type="primary"
          size="small"
          :loading="importing"
          :disabled="!uploadFile"
          @click="startImport"
        >
          开始导入
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          size="small"
          @click="handleClose"
        >
          完成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { importCustomerContact, downloadCustomerContactTemplate } from '@/api/third/customerContact'

export default {
  name: 'ImportModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'customer' // customer, contact, activity
    }
  },
  data() {
    return {
      currentStep: 0,
      uploadFile: null,
      importing: false,
      importResult: {
        success: 0,
        failed: 0,
        errors: []
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetDialog()
      }
    }
  },
  methods: {
    handleClose() {
      this.resetDialog()
      this.$emit('update:visible', false)
    },

    resetDialog() {
      this.currentStep = 0
      this.uploadFile = null
      this.importing = false
      this.importResult = {
        success: 0,
        failed: 0,
        errors: []
      }
      if (this.$refs.uploadRef) {
        this.$refs.uploadRef.clearFiles()
      }
    },

    nextStep() {
      if (this.currentStep < 2) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    async downloadTemplate() {
      try {
        this.$message.info('正在准备下载模板...')

        if (this.type === 'contact') {
          // 下载客户联系人模板
          const response = await downloadCustomerContactTemplate()
          
          // 创建下载链接
          const blob = new Blob([response], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = '客户联系人导入模板.xlsx'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } else {
          // 其他类型的模板下载（模拟）
          const templates = {
            customer: '/templates/customer_import_template.xlsx',
            activity: '/templates/activity_import_template.xlsx'
          }
          
          const templateUrl = templates[this.type] || templates.customer
          const link = document.createElement('a')
          link.href = templateUrl
          link.download = `${this.type}_import_template.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        this.$message.success('模板下载完成')
      } catch (error) {
        console.error('模板下载失败:', error)
        this.$message.error('模板下载失败')
      }
    },

    handleFileChange(file) {
      const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.raw.type === 'application/vnd.ms-excel'

      if (!isExcel) {
        this.$message.error('只支持 Excel 格式文件！')
        return false
      }

      const isLt10M = file.raw.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB！')
        return false
      }

      this.uploadFile = file.raw
      return true
    },

    handleExceed() {
      this.$message.warning('只能选择一个文件进行导入')
    },

    removeFile() {
      this.uploadFile = null
      this.$refs.uploadRef.clearFiles()
    },

    async startImport() {
      if (!this.uploadFile) {
        this.$message.error('请选择要导入的文件')
        return
      }

      this.importing = true

      try {
        // 创建FormData
        const formData = new FormData()
        formData.append('file', this.uploadFile)

        let response
        if (this.type === 'contact') {
          // 调用客户联系人导入API
          response = await importCustomerContact(formData)
        } else {
          // 其他类型的导入（模拟）
          await new Promise(resolve => setTimeout(resolve, 2000))
          response = {
            code: 200,
            data: {
              successCount: Math.floor(Math.random() * 50) + 10,
              failureCount: Math.floor(Math.random() * 5),
              errors: [
                {
                  row: 15,
                  data: '张三, 13800138000',
                  message: '手机号码已存在'
                },
                {
                  row: 23,
                  data: '李四, ',
                  message: '手机号码不能为空'
                }
              ]
            }
          }
        }

        if (response.code === 200) {
          // 处理导入结果
          this.importResult = {
            success: response.data.successCount || 0,
            failed: response.data.failureCount || 0,
            errors: (response.data.errors || []).map(error => ({
              row: error.row || error.lineNumber,
              data: error.data || error.content,
              error: error.message || error.error
            }))
          }
        } else {
          throw new Error(response.msg || '导入失败')
        }

        this.currentStep = 2
        this.$message.success('导入完成')

        // 刷新列表
        this.$emit('refresh')
      } catch (error) {
        this.$message.error('导入失败：' + error.message)
      } finally {
        this.importing = false
      }
    },

    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB'
      } else {
        return (size / (1024 * 1024)).toFixed(1) + ' MB'
      }
    }
  }
}
</script>

<style scoped>
.import-container {
  padding: 0 20px;
}
</style>

<style>
.import-modal .el-dialog__body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.import-modal .el-dialog {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}
</style>

<style scoped>

.step-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.template-download {
  text-align: center;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 40px;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.file-info {
  max-width: 400px;
  margin: 0 auto;
}

.import-result {
  text-align: left;
}

.result-summary {
  text-align: center;
}

.error-details h4 {
  color: #e6a23c;
  margin-bottom: 12px;
}
</style>