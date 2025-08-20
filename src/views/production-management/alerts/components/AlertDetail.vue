<template>
  <el-dialog title="报警详情" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false" top="0"
    @close="handleClose" class="alert-detail-dialog">
    <div class="detail-container">
      <!-- 基本信息 -->
      <el-card shadow="never" class="info-card">
        <div slot="header" class="card-header">
          <span>基本信息</span>
          <el-tag :type="getStatusColor(alertData.processType)" size="small">
            {{ getStatusLabel(alertData.processType) }}
          </el-tag>
        </div>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="工单号">{{ alertData.workOrderNo }}</el-descriptions-item>
              <el-descriptions-item label="品类名称">{{ alertData.categoryName }}</el-descriptions-item>
              <el-descriptions-item label="型号名称">{{ alertData.computerName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="上报人">{{ alertData.reporter }}</el-descriptions-item>
              <el-descriptions-item label="责任人">{{ alertData.responsible }}</el-descriptions-item>
              <el-descriptions-item label="责任部门">{{ alertData.responsibleDept }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="创建时间">{{ formatDateTime(alertData.createdTime) }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ alertData.processName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理时长">{{ alertData.processDuration || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- 问题描述 -->
      <el-card shadow="never" class="info-card">
        <div slot="header">问题描述</div>
        <div class="problem-content">{{ alertData.problemDesc }}</div>
      </el-card>

      <!-- 备注信息 -->
      <el-card shadow="never" class="info-card" v-if="alertData.remark">
        <div slot="header">备注信息</div>
        <div class="remark-content">{{ alertData.remark }}</div>
      </el-card>

      <!-- 附件信息 -->
      <el-card shadow="never" class="info-card" v-if="alertData.fileUrl && getFileCount(alertData.fileUrl) > 0">
        <div slot="header" class="card-header">
          <span>附件信息</span>
          <!-- <el-button size="mini" type="primary" @click="handleBatchDownload" v-if="getFileCount(alertData.fileUrl) > 1">
            <i class="el-icon-download"></i>
            批量下载
          </el-button> -->
        </div>
        <div class="attachment-content">
          <div class="file-list">
            <div v-for="(file, index) in parseFileUrls(alertData.fileUrl)" :key="index" class="file-item"
              @click="handleFileAction(file)">
              <div class="file-info">
                <i :class="getFileIcon(file.name)" class="file-icon"></i>
                <div class="file-details">
                  <div class="file-name" :title="file.name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <div class="file-actions">
                <!-- <el-button size="mini" type="text" @click.stop="handlePreviewFile(file)" v-if="isPreviewable(file)">
                  <i class="el-icon-view"></i>
                  预览
                </el-button> -->
                <el-button size="mini" type="text" @click.stop="handleDownloadFile(file)">
                  <i class="el-icon-download"></i>
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script>
import { processTypeOptions, processTypeColors } from '@/types/production-alerts'

export default {
  name: 'AlertDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alertData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    getStatusColor(status) {
      return processTypeColors[status] || 'info'
    },

    getStatusLabel(status) {
      const option = processTypeOptions.find(item => item.value === status)
      return option ? option.label : '未知'
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    handleEdit() {
      this.$emit('edit', this.alertData)
      this.handleClose()
    },

    handleClose() {
      this.dialogVisible = false
    },

    // ==================== 附件相关方法 ====================

    // 解析文件URL字符串为文件对象数组
    parseFileUrls(fileUrl) {
      if (!fileUrl) return []

      try {
        // 如果是JSON字符串，尝试解析
        if (typeof fileUrl === 'string' && fileUrl.startsWith('[')) {
          return JSON.parse(fileUrl)
        }

        // 如果是逗号分隔的URL字符串
        if (typeof fileUrl === 'string') {
          return fileUrl.split(',').map((url, index) => {
            const fileName = this.getFileNameFromUrl(url.trim())
            return {
              name: fileName,
              url: url.trim(),
              size: 0 // 大小未知
            }
          })
        }

        // 如果已经是数组
        if (Array.isArray(fileUrl)) {
          return fileUrl
        }

        return []
      } catch (error) {
        console.error('解析文件URL失败:', error)
        return []
      }
    },

    // 从URL中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return '未知文件'

      try {
        // 从URL中提取文件名
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]

        // 如果包含查询参数，去除
        const cleanFileName = fileName.split('?')[0]

        return decodeURIComponent(cleanFileName) || '未知文件'
      } catch (error) {
        return '未知文件'
      }
    },

    // 获取文件数量
    getFileCount(fileUrl) {
      const files = this.parseFileUrls(fileUrl)
      return files.length
    },

    // 根据文件名获取文件图标
    getFileIcon(fileName) {
      if (!fileName) return 'el-icon-document'

      const extension = fileName.toLowerCase().split('.').pop()
      const iconMap = {
        // 图片文件
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'bmp': 'el-icon-picture',
        'webp': 'el-icon-picture',

        // 文档文件
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'txt': 'el-icon-document',
        'rtf': 'el-icon-document',

        // 表格文件
        'xls': 'el-icon-s-grid',
        'xlsx': 'el-icon-s-grid',
        'csv': 'el-icon-s-grid',

        // 演示文件
        'ppt': 'el-icon-film',
        'pptx': 'el-icon-film',

        // 压缩文件
        'zip': 'el-icon-folder-opened',
        'rar': 'el-icon-folder-opened',
        '7z': 'el-icon-folder-opened',

        // 视频文件
        'mp4': 'el-icon-video-camera',
        'avi': 'el-icon-video-camera',
        'mov': 'el-icon-video-camera',
        'wmv': 'el-icon-video-camera',

        // 音频文件
        'mp3': 'el-icon-headset',
        'wav': 'el-icon-headset',
        'flac': 'el-icon-headset'
      }

      return iconMap[extension] || 'el-icon-document'
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '-'

      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))

      if (i === 0) return `${bytes} ${sizes[i]}`

      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    },

    // 判断文件是否可预览
    isPreviewable(file) {
      if (!file || !file.name) return false

      const extension = file.name.toLowerCase().split('.').pop()
      const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf']

      return previewableTypes.includes(extension)
    },

    // 处理文件点击（默认下载）
    handleFileAction(file) {
      this.handleDownloadFile(file)
    },

    // 处理文件下载
    handleDownloadFile(file) {
      try {
        // 直接下载文件URL
        this.downloadFileUrl(file.url, file.name)

        this.$message.success(`开始下载文件: ${file.name}`)

        // 记录下载日志
        console.log('文件下载记录:', {
          fileName: file.name,
          fileUrl: file.url,
          alertId: this.alertData.id,
          workOrderNo: this.alertData.workOrderNo,
          downloadTime: new Date().toISOString()
        })

      } catch (error) {
        console.error('文件下载失败:', error)
        this.$message.error(`文件下载失败: ${error.message || '未知错误'}`)
      }
    },

    // 批量下载所有附件
    async handleBatchDownload() {
      const files = this.parseFileUrls(this.alertData.fileUrl)

      if (files.length === 0) {
        this.$message.warning('没有可下载的附件')
        return
      }

      try {
        const confirmed = await this.$confirm(
          `确定要下载工单 "${this.alertData.workOrderNo}" 的所有附件吗？\n共 ${files.length} 个文件`,
          '批量下载确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )

        if (confirmed) {
          this.$message.info(`开始批量下载 ${files.length} 个文件...`)

          // 逐个下载文件（避免浏览器阻止多个下载）
          for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // 延迟下载以避免浏览器限制
            setTimeout(() => {
              this.downloadFileUrl(file.url, file.name)
            }, i * 500) // 每个文件间隔500ms
          }

          this.$message.success(`开始批量下载 ${files.length} 个文件`)
        }
      } catch (error) {
        // 用户取消下载
        if (error !== 'cancel') {
          console.error('批量下载失败:', error)
          this.$message.error(`批量下载失败: ${error.message || '未知错误'}`)
        }
      }
    },

    // 预览文件（如果是图片或PDF）
    handlePreviewFile(file) {
      const extension = file.name.toLowerCase().split('.').pop()
      const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf']

      if (previewableTypes.includes(extension)) {
        // 在新窗口中打开预览
        window.open(file.url, '_blank')

        // 记录预览日志
        console.log('文件预览记录:', {
          fileName: file.name,
          fileUrl: file.url,
          alertId: this.alertData.id,
          workOrderNo: this.alertData.workOrderNo,
          previewTime: new Date().toISOString()
        })
      } else {
        this.$message.info('该文件类型不支持预览，请下载后查看')
        this.handleDownloadFile(file)
      }
    },

    // 直接下载文件URL的方法
    downloadFileUrl(url, fileName) {
      try {
        // 创建一个隐藏的a标签来触发下载
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || this.getFileNameFromUrl(url)
        link.target = '_blank'
        link.style.display = 'none'

        // 添加到DOM并触发点击
        document.body.appendChild(link)
        link.click()

        // 清理DOM
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)

      } catch (error) {
        console.error('下载失败:', error)
        // 如果a标签下载失败，尝试直接打开URL
        window.open(url, '_blank')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-detail-dialog {
  .detail-container {
    .info-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .problem-content {
        line-height: 1.6;
        color: #606266;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
      }

      .remark-content {
        line-height: 1.6;
        padding: 15px;
      }

      .attachment-content {
        .file-list {
          .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 15px;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            margin-bottom: 8px;
            transition: all 0.3s ease;
            cursor: pointer;

            &:hover {
              background-color: #f5f7fa;
              border-color: #c0c4cc;
            }

            &:last-child {
              margin-bottom: 0;
            }

            .file-info {
              display: flex;
              align-items: center;
              flex: 1;
              min-width: 0;

              .file-icon {
                font-size: 24px;
                margin-right: 12px;
                flex-shrink: 0;

                // 文件图标颜色
                &.el-icon-picture {
                  color: #67c23a;
                }

                &.el-icon-document {
                  color: #409eff;
                }

                &.el-icon-s-grid {
                  color: #e6a23c;
                }

                &.el-icon-film {
                  color: #f56c6c;
                }

                &.el-icon-folder-opened {
                  color: #909399;
                }

                &.el-icon-video-camera {
                  color: #f56c6c;
                }

                &.el-icon-headset {
                  color: #67c23a;
                }
              }

              .file-details {
                flex: 1;
                min-width: 0;

                .file-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: #303133;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  margin-bottom: 2px;
                }

                .file-size {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }

            .file-actions {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-shrink: 0;

              .el-button {
                color: #409eff;

                &:hover {
                  color: #66b1ff;
                }

                &.is-disabled {
                  color: #c0c4cc;
                }
              }
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .detail-container {
      .info-card {
        .attachment-content {
          .file-list {
            .file-item {
              flex-direction: column;
              align-items: stretch;

              .file-info {
                margin-bottom: 8px;
              }

              .file-actions {
                justify-content: center;
                width: 100%;

                .el-button {
                  flex: 1;
                  max-width: 100px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>