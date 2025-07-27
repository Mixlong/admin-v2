<template>
  <el-dialog title="批量导入设备成本" :visible.sync="dialogVisible" width="900px" :close-on-click-modal="false"
    @close="handleClose" class="batch-import-dialog" center top="3vh">

    <!-- 渐进式流程容器 -->
    <div class="import-container">
      <!-- 上传阶段 -->
      <div v-if="!importResult" class="upload-stage">
        <div class="stage-header">
          <!-- 上传前的UI -->
          <div v-if="!fileUploaded" class="upload-initial-ui">
            <div class="stage-background-decoration">
              <div class="floating-shape shape-1"></div>
              <div class="floating-shape shape-2"></div>
              <div class="floating-shape shape-3"></div>
            </div>
            <div class="stage-icon">
              <div class="icon-pulse"></div>
              <i class="el-icon-upload2"></i>
            </div>
            <h3 class="stage-title">文件上传</h3>
            <p class="stage-desc">选择Excel文件开始批量导入，支持拖拽上传</p>
            <div class="stage-progress">
              <div class="progress-step active">1</div>
              <div class="progress-line"></div>
              <div class="progress-step">2</div>
            </div>

            <!-- 透明的上传组件覆盖整个header区域 -->
            <el-upload ref="headerUpload" class="header-upload-overlay" drag action="#" :auto-upload="false"
              :on-change="handleChange" :before-upload="beforeUpload" :disabled="loading" accept=".xlsx,.xls"
              :show-file-list="false" multiple="false">
              <div class="upload-overlay-content"></div>
            </el-upload>
          </div>

          <!-- 上传后的UI -->
          <div v-if="fileUploaded" class="upload-progress-ui">
            <div class="progress-background-decoration">
              <div class="progress-wave wave-1"></div>
              <div class="progress-wave wave-2"></div>
              <div class="progress-wave wave-3"></div>
            </div>
            <div class="progress-icon">
              <div class="loading-spinner" v-if="loading">
                <i class="el-icon-loading"></i>
              </div>
              <div class="success-icon" v-else-if="importResult && importResult.failedCount === 0">
                <i class="el-icon-success"></i>
              </div>
              <div class="error-icon" v-else-if="importResult && importResult.successCount === 0">
                <i class="el-icon-error"></i>
              </div>
              <div class="warning-icon" v-else>
                <i class="el-icon-warning"></i>
              </div>
            </div>
            <h3 class="progress-title" v-if="loading">正在导入中...</h3>
            <h3 class="progress-title" v-else-if="importResult">{{ resultTitle }}</h3>
            <div class="file-info-display">
              <div class="file-name">
                <i class="el-icon-document"></i>
                <span>{{ fileList[0] && fileList[0].name }}</span>
              </div>
              <div class="file-status" v-if="loading">
                <div class="status-loading">
                  <i class="el-icon-loading rotating"></i>
                  <span>导入中...</span>
                </div>
              </div>
              <div class="file-status" v-else-if="importResult">
                <div class="status-complete" :class="resultType">
                  <i :class="getResultIcon()"></i>
                  <span>{{ getResultSubTitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="upload-container" v-if="!fileUploaded">
          <!-- 模板下载区域 -->
          <div class="template-download-area">
            <div class="template-card">
              <div class="template-decoration">
                <div class="decoration-circle"></div>
              </div>
              <div class="template-content">
                <div class="template-icon">
                  <i class="el-icon-document"></i>
                  <div class="icon-badge">Excel</div>
                </div>
                <div class="template-text">
                  <span class="template-title">需要导入模板？</span>
                  <span class="template-subtitle">下载标准格式文件，确保数据准确导入</span>
                </div>
              </div>
              <el-button type="primary" @click="downloadTemplate" icon="el-icon-download" size="small"
                class="download-btn">
                下载模板
              </el-button>
            </div>
          </div>

          <!-- 文件信息显示 -->
          <div v-if="fileList.length > 0" class="file-info">
            <div class="file-item">
              <div class="file-icon-wrapper">
                <i class="el-icon-document file-icon"></i>
                <div class="file-check">
                  <i class="el-icon-check"></i>
                </div>
              </div>
              <div class="file-details">
                <span class="file-name">{{ fileList[0].name }}</span>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(fileList[0].size) }}</span>
                  <span class="file-status">就绪</span>
                </div>
              </div>
              <el-button type="text" @click="removeFile" icon="el-icon-close" size="mini" class="remove-btn">
              </el-button>
            </div>
          </div>

          <!-- 导入操作 -->
          <div v-if="fileList.length > 0" class="import-actions">
            <div class="action-wrapper">
              <div class="action-decoration">
                <div class="action-ripple"></div>
              </div>
              <el-button type="primary" size="large" @click="handleImport" :loading="loading" icon="el-icon-upload2"
                class="import-button">
                <span class="button-text">{{ loading ? '正在导入...' : '开始导入' }}</span>
                <div class="button-shine"></div>
              </el-button>
              <p class="action-hint">点击按钮开始处理您的数据</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="importResult" class="result-stage">
        <div class="stage-header">
          <div class="stage-background-decoration">
            <div class="result-particle particle-1" :class="resultType"></div>
            <div class="result-particle particle-2" :class="resultType"></div>
            <div class="result-particle particle-3" :class="resultType"></div>
          </div>
          <div class="stage-icon" :class="resultType">
            <div class="result-animation-ring"></div>
            <i :class="getResultIcon()"></i>
          </div>
          <h3 class="stage-title">{{ resultTitle }}</h3>
          <p class="stage-desc">{{ getResultSubTitle }}</p>
          <div class="stage-progress">
            <div class="progress-step completed">1</div>
            <div class="progress-line completed"></div>
            <div class="progress-step completed">2</div>
          </div>
        </div>

        <div class="result-container">
          <!-- 结果统计 -->
          <div class="result-stats">
            <div class="stat-item success" v-if="importResult.successCount > 0">
              <div class="stat-number">{{ importResult.successCount }}</div>
              <div class="stat-label">成功导入</div>
            </div>
            <div class="stat-item error" v-if="importResult.failedCount > 0">
              <div class="stat-number">{{ importResult.failedCount }}</div>
              <div class="stat-label">导入失败</div>
            </div>
            <div class="stat-item total">
              <div class="stat-number">{{ (importResult.successCount || 0) + (importResult.failedCount || 0) }}</div>
              <div class="stat-label">总计行数</div>
            </div>
          </div>

          <!-- 错误详情 -->
          <div v-if="importResult.errors && importResult.errors.length > 0" class="error-details">
            <div class="error-header">
              <i class="el-icon-warning"></i>
              <span>错误详情</span>
            </div>
            <el-collapse>
              <el-collapse-item title="查看详细错误信息" name="errors">
                <div class="error-categories">
                  <div v-for="(errorGroup, groupIndex) in importResult.errors" :key="groupIndex" class="error-category">
                    <div class="error-category-header">
                      <i :class="getErrorIcon(errorGroup.type)"></i>
                      <span class="error-category-title">{{ errorGroup.title }}</span>
                      <el-tag :type="getErrorTagType(errorGroup.type)" size="mini">{{ errorGroup.items.length }}
                        项</el-tag>
                    </div>
                    <div class="error-list">
                      <div v-for="(error, errorIndex) in errorGroup.items" :key="errorIndex" class="error-item">
                        <i class="el-icon-close"></i>
                        <span>{{ error }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 操作按钮 -->
          <div class="result-actions">
            <el-button type="default" size="large" @click="resetImport" icon="el-icon-refresh-left"
              class="reset-button">
              重新上传
            </el-button>
            <el-button v-if="resultType === 'success'" type="primary" size="large" @click="handleConfirm"
              icon="el-icon-check" class="confirm-button">
              完成
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" :disabled="loading" size="small">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { importDeviceCost, downloadTemplate } from '@/api/quote-management/deviceCost'

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
      loading: false,
      importResult: null,
      currentStep: 0,
      fileUploaded: false
    }
  },
  computed: {
    resultTitle() {
      if (!this.importResult) return ''
      if (this.importResult.failedCount === 0) {
        return '导入成功'
      } else if (this.importResult.successCount === 0) {
        return '导入失败'
      } else {
        return '部分导入成功'
      }
    },
    resultType() {
      if (!this.importResult) return 'info'
      if (this.importResult.failedCount === 0) {
        return 'success'
      } else if (this.importResult.successCount === 0) {
        return 'error'
      } else {
        return 'warning'
      }
    },
    // 结果卡片样式类
    resultCardClass() {
      if (!this.importResult) return ''
      return this.importResult.failedCount === 0 ? 'success' : 'error'
    },
    // 结果图标
    resultIcon() {
      if (!this.importResult) return 'el-icon-info'
      return this.importResult.failedCount === 0 ? 'el-icon-success' : 'el-icon-error'
    },
    // 获取结果副标题
    getResultSubTitle() {
      if (!this.importResult) return ''
      const { successCount = 0, failedCount = 0 } = this.importResult
      const total = successCount + failedCount
      return `共处理 ${total} 条数据，成功 ${successCount} 条，失败 ${failedCount} 条`
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
      this.loading = false
      this.importResult = null
      this.fileUploaded = false
    },

    // 下载模板
    async downloadTemplate() {
      try {
        const link = document.createElement('a')
        link.href = 'https://digiwise-web.oss-eu-central-1.aliyuncs.com/admin/%E8%AE%BE%E5%A4%87%E6%88%90%E6%9C%AC%E6%A8%A1%E7%89%88.xlsx'
        link.download = '设备成本导入模板.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.$message.success('模板下载中...')
      } catch (error) {
        console.error('下载模板失败:', error)
        this.$message.error('下载模板失败')
      }
    },

    // 文件改变
    handleChange(_, fileList) {
      this.fileList = fileList.slice(-1)
      if (fileList.length > 0) {
        this.fileUploaded = true
        this.currentStep = 1
        // 自动开始导入
        this.$nextTick(() => {
          this.handleImport()
        })
      }
    },


    // 重新导入
    resetImport() {
      this.importResult = null
      this.fileList = []
      this.currentStep = 0
      this.$refs.upload.clearFiles()
    },

    // 确认完成
    handleConfirm() {
      this.dialogVisible = false
      this.$emit('success')
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
    async handleImport() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先选择要导入的文件')
        return
      }

      this.loading = true
      this.importResult = null
      this.currentStep = 2

      try {
        const formData = new FormData()
        formData.append('file', this.fileList[0].raw)

        const response = await importDeviceCost(formData)

        if (response.code === 200) {
          // 根据实际API响应结构映射数据
          const totalCount = response.data.num || 0
          const successCount = response.data.successNum || 0
          const failedCount = totalCount - successCount

          // 解析错误信息
          const errorInfo = this.parseErrorInfo(response.data)

          this.importResult = {
            totalCount,
            successCount,
            failedCount,
            errors: errorInfo
          }

          if (this.importResult.failedCount === 0) {
            this.$message.success('导入成功')
            this.$emit('success')
          } else if (this.importResult.successCount === 0) {
            this.$message.error('导入失败')
          } else {
            this.$message.warning('部分导入成功')
          }
        } else {
          throw new Error(response.msg || '导入失败')
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.$message.error(error.message || '导入失败，请稍后重试')
        // 导入失败时重置到初始状态
        this.fileList = []
        this.fileUploaded = false
        this.importResult = null
        if (this.$refs.headerUpload) {
          this.$refs.headerUpload.clearFiles()
        }
      } finally {
        this.loading = false
      }
    },

    // 取消
    handleCancel() {
      if (this.loading) return
      this.dialogVisible = false
    },

    // 关闭
    handleClose() {
      if (this.loading) return
      this.resetData()
    },

    // 解析错误信息
    parseErrorInfo(data) {
      const errors = []

      // 设备成本导入错误
      if (data.computerIndex && Array.isArray(data.computerIndex) && data.computerIndex.length > 0) {
        errors.push({
          type: 'category',
          title: '无效品类行',
          items: data.computerIndex.map(index => `第 ${index} 行：品类信息无效或不存在`)
        })
      }

      if (data.costCategoryIndex && Array.isArray(data.costCategoryIndex) && data.costCategoryIndex.length > 0) {
        errors.push({
          type: 'costCategory',
          title: '无效成本类型行',
          items: data.costCategoryIndex.map(index => `第 ${index} 行：成本类型信息无效或不存在`)
        })
      }

      if (data.costProjectIndex && Array.isArray(data.costProjectIndex) && data.costProjectIndex.length > 0) {
        errors.push({
          type: 'costProject',
          title: '无效成本项行',
          items: data.costProjectIndex.map(index => `第 ${index} 行：成本项信息无效或不存在`)
        })
      }

      // 线缆成本导入错误
      if (data.cableSupplierIndex && Array.isArray(data.cableSupplierIndex) && data.cableSupplierIndex.length > 0) {
        errors.push({
          type: 'cableSupplier',
          title: '无效供应商行',
          items: data.cableSupplierIndex.map(index => `第 ${index} 行：供应商信息无效或不存在`)
        })
      }

      // 通用错误 - 数据重复行
      if (data.errorIndex && Array.isArray(data.errorIndex) && data.errorIndex.length > 0) {
        errors.push({
          type: 'duplicate',
          title: '数据重复行',
          items: data.errorIndex.map(index => `第 ${index} 行：数据重复，请检查后重新导入`)
        })
      }

      return errors
    },

    // 获取错误图标
    getErrorIcon(errorType) {
      const iconMap = {
        category: 'el-icon-collection-tag',
        costCategory: 'el-icon-price-tag',
        costProject: 'el-icon-paperclip',
        cableSupplier: 'el-icon-connection',
        duplicate: 'el-icon-copy-document'
      }
      return iconMap[errorType] || 'el-icon-warning'
    },

    // 获取错误标签类型
    getErrorTagType(errorType) {
      const typeMap = {
        category: 'warning',
        costCategory: 'danger',
        costProject: 'info',
        cableSupplier: 'success',
        duplicate: 'danger'
      }
      return typeMap[errorType] || 'danger'
    },

    // 获取结果图标
    getResultIcon() {
      const iconMap = {
        success: 'el-icon-success',
        error: 'el-icon-error',
        warning: 'el-icon-warning'
      }
      return iconMap[this.resultType] || 'el-icon-info'
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 移除文件
    removeFile() {
      this.fileList = []
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
      if (this.$refs.headerUpload) {
        this.$refs.headerUpload.clearFiles()
      }
    },

    // 关闭结果
    closeResult() {
      this.importResult = null
    },

    // 导出错误报告
    exportErrors() {
      if (!this.importResult || !this.importResult.errors) return

      // 创建错误报告内容
      let content = '导入错误报告\n\n'
      content += `导入时间: ${new Date().toLocaleString()}\n`
      content += `总计处理: ${(this.importResult.successCount || 0) + (this.importResult.errorCount || 0)} 条\n`
      content += `成功导入: ${this.importResult.successCount || 0} 条\n`
      content += `导入失败: ${this.importResult.errorCount || 0} 条\n\n`

      this.importResult.errors.forEach((errorGroup, index) => {
        content += `${index + 1}. ${errorGroup.title}\n`
        errorGroup.items.forEach(item => {
          content += `   - ${item}\n`
        })
        content += '\n'
      })

      // 创建并下载文件
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `导入错误报告_${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },

    // 重置导入
    resetImport() {
      this.importResult = null
      this.fileList = []
      this.currentStep = 1
      this.fileUploaded = false
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
      if (this.$refs.headerUpload) {
        this.$refs.headerUpload.clearFiles()
      }
    },

    // 确认完成
    handleConfirm() {
      this.$emit('success', this.importResult)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
// 超级美观的批量导入弹窗样式
.batch-import-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
  }

  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    color: white;
    border-radius: 0;
    padding: 28px 36px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%);
      background-size: 100% 100%, 100% 100%, 30px 30px;
      animation: headerShine 8s ease-in-out infinite;
    }

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: headerRotate 10s linear infinite;
    }

    .el-dialog__title {
      color: white;
      font-weight: 700;
      font-size: 22px;
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .el-dialog__close {
      color: white;
      font-size: 24px;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;

      &:hover {
        color: #fef3c7;
        transform: scale(1.2) rotate(90deg);
        filter: drop-shadow(0 0 8px rgba(254, 243, 199, 0.6));
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  }

  :deep(.el-dialog__footer) {
    padding: 24px 36px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-top: 1px solid #e2e8f0;
    backdrop-filter: blur(10px);
  }
}

// 上传后进度UI样式
.upload-progress-ui {
  text-align: center;
  padding: 48px 36px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%);
  position: relative;
  overflow: hidden;

  .progress-background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;

    .progress-wave {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: progressWave 4s ease-in-out infinite;

      &.wave-1 {
        animation-delay: 0s;
        transform: scale(0.5);
      }

      &.wave-2 {
        animation-delay: 1.5s;
        transform: scale(0.7);
      }

      &.wave-3 {
        animation-delay: 3s;
        transform: scale(0.9);
      }
    }
  }

  .progress-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: white;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow:
      0 20px 40px rgba(99, 102, 241, 0.4),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 2;

    .loading-spinner {
      i {
        animation: rotating 1s linear infinite;
      }
    }

    .success-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 32px;
        color: white;
      }
    }

    .error-icon {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 32px;
        color: white;
      }
    }

    .warning-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 32px;
        color: white;
      }
    }
  }

  .progress-title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    margin: 0 0 24px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 2;
  }

  .file-info-display {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 16px 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .file-name {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      gap: 8px;

      i {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
      }

      span {
        font-size: 16px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }

    .file-status {
      .status-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);

        .rotating {
          animation: rotating 1s linear infinite;
        }

        span {
          font-size: 14px;
          font-weight: 500;
        }
      }

      .status-complete {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &.success {
          color: #10b981;
        }

        &.error {
          color: #ef4444;
        }

        &.warning {
          color: #f59e0b;
        }

        i {
          font-size: 16px;
        }

        span {
          font-size: 14px;
          font-weight: 500;
          color: white;
        }
      }
    }
  }
}

.import-container {
  min-height: 480px;
  position: relative;
}

// 阶段头部样式
.stage-header {
  text-align: center;
  padding: 48px 36px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%);
  position: relative;
  overflow: hidden;
  border-radius: 10px;

  .stage-background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;

    .floating-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: floatUpDown 6s ease-in-out infinite;

      &.shape-1 {
        width: 80px;
        height: 80px;
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }

      &.shape-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }
    }

    .result-particle {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: particleFloat 4s ease-in-out infinite;

      &.particle-1 {
        top: 30%;
        left: 25%;
        animation-delay: 0s;
      }

      &.particle-2 {
        top: 50%;
        right: 30%;
        animation-delay: 1.5s;
      }

      &.particle-3 {
        bottom: 40%;
        left: 60%;
        animation-delay: 3s;
      }

      &.success {
        background: rgba(76, 175, 80, 0.8);
      }

      &.error {
        background: rgba(244, 67, 54, 0.8);
      }

      &.warning {
        background: rgba(255, 152, 0, 0.8);
      }
    }
  }

  .stage-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: white;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow:
      0 20px 40px rgba(99, 102, 241, 0.4),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 2;
    animation: iconPulse 3s ease-in-out infinite;

    .icon-pulse {
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.3);
      animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .result-animation-ring {
      position: absolute;
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: rotateRing 3s linear infinite;
    }

    &.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow:
        0 20px 40px rgba(16, 185, 129, 0.4),
        0 0 0 8px rgba(255, 255, 255, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);

      .icon-pulse {
        background: rgba(16, 185, 129, 0.3);
      }
    }

    &.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow:
        0 20px 40px rgba(239, 68, 68, 0.4),
        0 0 0 8px rgba(255, 255, 255, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);

      .icon-pulse {
        background: rgba(239, 68, 68, 0.3);
      }
    }

    &.warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow:
        0 20px 40px rgba(245, 158, 11, 0.4),
        0 0 0 8px rgba(255, 255, 255, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);

      .icon-pulse {
        background: rgba(245, 158, 11, 0.3);
      }
    }
  }

  .stage-title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    margin: 0 0 12px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 2;
  }

  .stage-desc {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 24px 0;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 2;
  }

  .stage-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    position: relative;
    z-index: 2;

    .progress-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;

      &.active {
        background: rgba(255, 255, 255, 0.9);
        color: #6366f1;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
      }

      &.completed {
        background: rgba(16, 185, 129, 0.9);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }

    .progress-line {
      width: 60px;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      position: relative;

      &.completed {
        background: rgba(16, 185, 129, 0.6);
      }
    }
  }
}

// 上传阶段样式
.upload-stage {

  // 透明上传组件样式
  .header-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    width: 100%;


    ::v-deep .el-upload {
      opacity: 0;
      width: 100%;
      height: 100%;
      display: block;

      .el-upload-dragger {
        width: 100%;
        height: 100%;
      }
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 100%;
      border: none !important;
      background: transparent !important;
      border-radius: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: transparent !important;
        border: none !important;
      }

      &.is-dragover {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 2px dashed rgba(255, 255, 255, 0.5) !important;
        border-radius: 12px;
      }
    }

    .upload-overlay-content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}

// 上传阶段样式
.upload-stage {
  .upload-container {
    margin-top: 10px;
  }

  .template-download-area {
    margin-bottom: 32px;

    .template-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: padding-box;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        padding: 2px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af);
        border-radius: inherit;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
      }

      .template-decoration {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0.6;

        .decoration-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          position: absolute;
          top: -20px;
          right: -20px;
        }


      }

      .template-content {
        display: flex;
        align-items: center;
        position: relative;
        z-index: 1;

        .template-icon {
          position: relative;
          margin-right: 20px;

          i {
            font-size: 32px;
            color: #1d4ed8;
            filter: drop-shadow(0 2px 4px rgba(29, 78, 216, 0.3));
          }

          .icon-badge {
            position: absolute;
            top: -8px;
            right: -12px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          }
        }

        .template-text {
          display: flex;
          flex-direction: column;

          .template-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 6px;
          }

          .template-subtitle {
            font-size: 14px;
            color: #64748b;
            line-height: 1.4;
          }
        }
      }

      .download-btn {
        position: relative;
        z-index: 1;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        border-radius: 10px;
        padding: 12px 24px;
        font-weight: 600;
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
      }
    }
  }

  .file-upload-area {
    margin-bottom: 24px;

    .upload-dragger {
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 180px;
        border: 2px dashed #d9d9d9;
        border-radius: 12px;
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          border-color: #409eff;
          background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
        }

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(64, 158, 255, 0.05) 0%, transparent 70%);
          transform: scale(0);
          transition: transform 0.3s ease;
        }

        &:hover::before {
          transform: scale(1);
        }
      }

      .upload-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        position: relative;
        z-index: 1;

        .upload-icon-container {
          margin-bottom: 16px;

          .upload-icon {
            font-size: 48px;
            color: #409eff;
          }
        }

        .upload-text-container {
          text-align: center;

          .upload-main-text {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin: 0 0 8px 0;
          }

          .upload-sub-text {
            font-size: 14px;
            color: #666;
            margin: 0 0 12px 0;

            .upload-link {
              color: #409eff;
              font-weight: 500;
            }
          }

          .upload-format-text {
            font-size: 12px;
            color: #999;
            margin: 0;
          }
        }
      }
    }

    .file-info {
      margin-top: 16px;

      .file-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        i {
          font-size: 18px;
          color: #52c41a;
          margin-right: 12px;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .file-size {
          font-size: 12px;
          color: #999;
          margin-right: 12px;
        }

        .remove-btn {
          color: #f5222d;
          padding: 4px;

          &:hover {
            background: #fff2f0;
          }
        }
      }
    }
  }

  .import-actions {
    text-align: center;

    .import-button {
      padding: 16px 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
      }
    }
  }
}

// 结果阶段样式
.result-stage {
  .result-container {
    padding: 0 32px 32px;
  }

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 32px;

    .stat-item {
      text-align: center;
      padding: 24px;
      border-radius: 12px;
      min-width: 120px;

      &.success {
        background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
        border: 2px solid #4caf50;
      }

      &.error {
        background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
        border: 2px solid #f44336;
      }

      &.total {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border: 2px solid #2196f3;
      }

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }
  }

  .error-details {
    margin-bottom: 32px;
    padding: 20px;
    background: #fff9f9;
    border-radius: 8px;
    border: 1px solid #ffebee;

    .error-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 600;
      color: #f44336;

      i {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: 16px;

    .reset-button,
    .confirm-button {
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px;
    }

    .reset-button {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .confirm-button {
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

// 错误详情样式优化
.error-categories {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;

  .error-category {
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    .error-category-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;

      i {
        margin-right: 8px;
        font-size: 16px;
        color: #f56c6c;
      }

      .error-category-title {
        flex: 1;
        font-weight: 600;
        font-size: 14px;
        color: #303133;
      }

      .el-tag {
        margin-left: 8px;
      }
    }

    .error-list {
      padding: 8px 16px 12px;

      .error-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #fff2f0;
        border-left: 3px solid #ff4d4f;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          margin-right: 8px;
          color: #ff4d4f;
          font-size: 12px;
          margin-top: 3px;
          flex-shrink: 0;
        }

        span {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          word-break: break-word;
        }
      }
    }
  }
}

// 底部按钮
.dialog-footer {
  text-align: right;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  .el-button {
    margin-left: 12px;
    min-width: 80px;

    &:first-child {
      margin-left: 0;
    }
  }
}

// 动画定义
@keyframes headerShine {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

@keyframes headerRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes floatUpDown {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes particleFloat {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 1;
  }
}

@keyframes iconPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes rotateRing {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes dotPulse {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes uploadWave {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes particleMove {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(20px, -20px) rotate(90deg);
  }

  50% {
    transform: translate(0, -40px) rotate(180deg);
  }

  75% {
    transform: translate(-20px, -20px) rotate(270deg);
  }
}

@keyframes buttonShine {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressWave {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 文件信息显示样式（移动到upload-container级别）
.upload-container {
  .file-info {
    margin: 24px 0 32px 0;
    animation: fadeInUp 0.5s ease-out;

    .file-item {
      display: flex;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 10px;
      border: 2px solid #e2e8f0;

      .file-icon-wrapper {
        position: relative;
        margin-right: 16px;

        .file-icon {
          font-size: 24px;
          color: #10b981;
        }

        .file-check {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: 10px;
            color: white;
          }
        }
      }

      .file-details {
        flex: 1;

        .file-name {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }

        .file-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .file-size {
            font-size: 13px;
            color: #64748b;
          }

          .file-status {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
        }
      }

      .remove-btn {
        color: #ef4444;
        padding: 8px;
        border-radius: 8px;
      }
    }
  }
}

// 文件上传区域增强样式（保留原有样式供参考）
.file-upload-area {
  margin-bottom: 32px;

  .upload-dragger {
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 220px;
      border: 3px dashed #cbd5e1;
      border-radius: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: #6366f1;
        background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #dbeafe 100%);
        transform: translateY(-8px);
        box-shadow: 0 25px 50px rgba(99, 102, 241, 0.2);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
        animation: uploadWave 3s ease-in-out infinite;
      }
    }

    .upload-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      position: relative;
      z-index: 2;

      .upload-background-effects {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;

        .upload-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #6366f1;
          border-radius: 50%;
          opacity: 0.6;
          animation: particleMove 8s ease-in-out infinite;

          &.particle-1 {
            top: 20%;
            left: 20%;
            animation-delay: 0s;
          }

          &.particle-2 {
            top: 60%;
            right: 25%;
            animation-delay: 2s;
          }

          &.particle-3 {
            bottom: 30%;
            left: 60%;
            animation-delay: 4s;
          }
        }

        .upload-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          opacity: 0.3;
          animation: uploadWave 2s ease-in-out infinite;
        }
      }

      .upload-icon-container {
        margin-bottom: 20px;
        position: relative;
        z-index: 1;

        .icon-wrapper {
          position: relative;

          .upload-icon {
            font-size: 56px;
            color: #6366f1;
            filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
            transition: all 0.3s ease;
          }

          .icon-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
            border-radius: 50%;
            animation: iconPulse 3s ease-in-out infinite;
          }
        }
      }

      .upload-text-container {
        text-align: center;
        position: relative;
        z-index: 1;

        .upload-main-text {
          font-size: 20px;
          font-weight: 700;
          color: #334155;
          margin: 0 0 8px 0;
        }

        .upload-sub-text {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 16px 0;

          .upload-link {
            color: #6366f1;
            font-weight: 600;
            text-decoration: underline;
            text-decoration-color: rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;

            &:hover {
              color: #4f46e5;
              text-decoration-color: #4f46e5;
            }
          }
        }

        .upload-format-text {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 20px 0;
        }

        .upload-features {
          display: flex;
          justify-content: center;
          gap: 12px;

          .feature-tag {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 1px solid #cbd5e1;
            color: #475569;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;

            &:hover {
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              border-color: #6366f1;
              color: white;
              transform: translateY(-2px);
            }
          }
        }
      }
    }

  }

  .import-actions {
    text-align: center;
    animation: fadeInUp 0.6s ease-out;

    .action-wrapper {
      position: relative;

      .action-decoration {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        border-radius: 50%;
        z-index: 0;

        .action-ripple {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          animation: ripple 2s ease-out infinite;
        }
      }

      .import-button {
        position: relative;
        z-index: 1;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
        border: none;
        border-radius: 16px;
        padding: 18px 48px;
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;

        .button-text {
          position: relative;
          z-index: 2;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          z-index: 1;
          animation: buttonShine 3s ease-in-out infinite;
        }

        &:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.5);
        }

        &:active {
          transform: translateY(-2px) scale(1.02);
        }
      }

      .action-hint {
        margin: 16px 0 0 0;
        font-size: 14px;
        color: #64748b;
        opacity: 0.8;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .batch-import-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin-top: 5vh !important;
    }
  }

  .import-container {
    padding: 16px 0;
  }

  .upload-container {
    padding: 0 20px 20px !important;
  }

  .result-container {
    padding: 0 20px 20px !important;
  }

  .result-stats {
    flex-direction: column;
    gap: 16px;

    .stat-item {
      min-width: auto;
      padding: 16px;
    }
  }

  .template-card {
    flex-direction: column !important;
    text-align: center;
    gap: 16px;
  }

  .upload-dragger :deep(.el-upload-dragger) {
    height: 180px !important;
  }

  .stage-header {
    padding: 32px 20px 24px !important;

    .stage-icon {
      width: 80px !important;
      height: 80px !important;
      font-size: 36px !important;
    }

    .stage-title {
      font-size: 24px !important;
    }

    .stage-desc {
      font-size: 16px !important;
    }
  }
}
</style>