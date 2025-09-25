<template>
  <div class="attachment-preview">
    <div v-if="attachments.length === 0" class="no-attachments">
      <i class="el-icon-document-remove"></i>
      <span>暂无附件</span>
    </div>
    
    <div v-else class="attachment-list">
      <div
        v-for="(file, index) in attachments"
        :key="index"
        class="attachment-item"
        @click="previewFile(file)">

        <!-- 图片缩略图 -->
        <div class="file-thumbnail" v-if="isImage(file.extension)">
          <el-image
            :src="file.url"
            :alt="file.name"
            class="thumbnail-image"
            fit="cover"
            :preview-src-list="[file.url]"
            :z-index="3000"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </div>

        <!-- 非图片文件图标 -->
        <div class="file-icon" v-else>
          <i :class="getFileIcon(file.extension)"></i>
        </div>

        <div class="file-info">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</div>
        </div>

        <div class="file-actions">
          <el-tooltip content="下载" placement="top">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-download"
              @click.stop="downloadFile(file)">
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    
    <!-- 预览对话框 -->
    <el-dialog
      title="文件预览"
      :visible.sync="previewVisible"
      width="80%"
      :close-on-click-modal="false"
      class="file-preview-dialog">
      
      <div class="preview-content" v-loading="previewLoading">
        <!-- 图片预览 -->
        <div v-if="isImage(currentFile.extension)" class="image-preview">
          <el-image
            :src="currentFile.url"
            :alt="currentFile.name"
            fit="contain"
            :preview-src-list="[currentFile.url]"
            :z-index="3000"
            @load="previewLoading = false"
            @error="handleImageError"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
              <p>图片加载失败</p>
            </div>
          </el-image>
        </div>
        
        <!-- PDF预览 -->
        <div v-else-if="isPdf(currentFile.extension)" class="pdf-preview">
          <iframe 
            :src="currentFile.url" 
            width="100%" 
            height="600px"
            @load="previewLoading = false">
          </iframe>
        </div>
        
        <!-- 文本文件预览 -->
        <div v-else-if="isText(currentFile.extension)" class="text-preview">
          <pre>{{ textContent }}</pre>
        </div>
        
        <!-- 不支持预览的文件 -->
        <div v-else class="unsupported-preview">
          <i class="el-icon-document"></i>
          <p>此文件类型不支持预览</p>
          <el-button type="primary" @click="downloadFile(currentFile)">
            <i class="el-icon-download"></i> 下载文件
          </el-button>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(currentFile)">
          <i class="el-icon-download"></i> 下载
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AttachmentPreview',
  props: {
    // 附件字符串，多个用逗号分隔
    attachmentUrls: {
      type: String,
      default: ''
    },
    // 是否显示文件大小
    showSize: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previewVisible: false,
      previewLoading: false,
      currentFile: {},
      textContent: ''
    }
  },
  computed: {
    attachments() {
      if (!this.attachmentUrls) return []
      
      const urls = this.attachmentUrls.split(',').filter(url => url.trim())
      return urls.map((url, index) => {
        const fileName = this.getFileNameFromUrl(url) || `附件${index + 1}`
        const extension = this.getFileExtension(fileName)
        
        return {
          name: fileName,
          url: url.trim(),
          extension: extension.toLowerCase(),
          size: null // 如果需要显示文件大小，可以通过API获取
        }
      })
    }
  },
  methods: {
    // 从URL中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return ''

      try {
        // 先解码URL
        const decodedUrl = decodeURIComponent(url)

        // 分割路径获取文件名
        const parts = decodedUrl.split('/')
        let fileName = parts[parts.length - 1] || ''

        // 去掉查询参数
        fileName = fileName.split('?')[0]

        // 如果文件名太长，进行截断
        if (fileName.length > 50) {
          const extension = this.getFileExtension(fileName)
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.') || fileName.length)
          const truncatedName = nameWithoutExt.substring(0, 40) + '...'
          fileName = extension ? `${truncatedName}.${extension}` : truncatedName
        }

        return fileName || '附件'
      } catch (error) {
        console.warn('解析文件名失败:', error)
        return '附件'
      }
    },
    
    // 获取文件扩展名
    getFileExtension(fileName) {
      const parts = fileName.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    },
    
    // 获取文件图标
    getFileIcon(extension) {
      const iconMap = {
        // 图片
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'bmp': 'el-icon-picture',
        'webp': 'el-icon-picture',
        'svg': 'el-icon-picture',
        
        // 文档
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'xls': 'el-icon-s-grid',
        'xlsx': 'el-icon-s-grid',
        'ppt': 'el-icon-document',
        'pptx': 'el-icon-document',
        'txt': 'el-icon-document',
        
        // 压缩包
        'zip': 'el-icon-folder-opened',
        'rar': 'el-icon-folder-opened',
        '7z': 'el-icon-folder-opened',
        
        // 视频
        'mp4': 'el-icon-video-camera',
        'avi': 'el-icon-video-camera',
        'mov': 'el-icon-video-camera',
        'mkv': 'el-icon-video-camera',
        
        // 音频
        'mp3': 'el-icon-service',
        'wav': 'el-icon-service',
        'flac': 'el-icon-service'
      }
      
      return iconMap[extension] || 'el-icon-document'
    },
    
    // 判断是否可以预览
    canPreview(extension) {
      const previewable = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'pdf', 'txt']
      return previewable.includes(extension)
    },
    
    // 判断是否为图片
    isImage(extension) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      return imageTypes.includes(extension)
    },
    
    // 判断是否为PDF
    isPdf(extension) {
      return extension === 'pdf'
    },
    
    // 判断是否为文本文件
    isText(extension) {
      const textTypes = ['txt', 'md', 'json', 'xml', 'csv']
      return textTypes.includes(extension)
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return ''
      
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },
    
    // 预览文件
    async previewFile(file) {
      // 如果是图片，el-image 已经提供了预览功能，不需要打开对话框
      if (this.isImage(file.extension)) {
        return
      }

      if (!this.canPreview(file.extension)) {
        this.downloadFile(file)
        return
      }

      this.currentFile = file
      this.previewVisible = true
      this.previewLoading = true

      // 如果是文本文件，需要加载内容
      if (this.isText(file.extension)) {
        try {
          const response = await fetch(file.url)
          this.textContent = await response.text()
        } catch (error) {
          console.error('加载文本文件失败:', error)
          this.textContent = '无法加载文件内容'
        }
        this.previewLoading = false
      }
    },
    
    // 下载文件
    downloadFile(file) {
      if (!file.url) {
        this.$message.warning('文件链接无效')
        return
      }
      
      try {
        // 创建一个隐藏的下载链接
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = file.url
        link.download = file.name || 'download'
        link.target = '_blank'
        
        // 添加到页面并触发点击
        document.body.appendChild(link)
        link.click()
        // 移除链接
        document.body.removeChild(link)
      } catch (error) {
        this.$message.error('下载失败，请重试')
      }
    },

    // 处理图片加载错误
    handleImageError() {
      console.error('图片加载失败:', this.currentFile.url)
      this.previewLoading = false
      this.$message.error('图片加载失败')
    },

  }
}
</script>

<style scoped>
.attachment-preview {
  width: 100%;
}

.no-attachments {
  text-align: center;
  color: #909399;
  padding: 30px;
  font-size: 14px;
}

.no-attachments i {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.attachment-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-icon {
  margin-right: 12px;
  color: #409eff;
  font-size: 24px;
  min-width: 24px;
}

.file-thumbnail {
  margin-right: 12px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
  flex-shrink: 0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.thumbnail-image .el-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 4px;
}

.file-actions .el-button {
  padding: 4px;
  color: #606266;
}

.file-actions .el-button:hover {
  color: #409eff;
}

/* 预览对话框样式 */
.file-preview-dialog .el-dialog__body {
  padding: 20px;
}

.preview-content {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 4px;
}

.image-preview .el-image {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 8px;
}

.pdf-preview iframe {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.text-preview {
  width: 100%;
  max-height: 600px;
  overflow: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 20px;
}

.text-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.unsupported-preview {
  text-align: center;
  color: #909399;
  padding: 50px;
}

.unsupported-preview i {
  font-size: 80px;
  margin-bottom: 20px;
  display: block;
}

.unsupported-preview p {
  margin: 20px 0;
  font-size: 16px;
}

/* el-image 错误状态样式 */
.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
  font-size: 14px;
}

.image-slot i {
  font-size: 32px;
  margin-bottom: 5px;
}

.image-slot p {
  margin: 0;
  font-size: 12px;
}

.file-thumbnail .image-slot i {
  font-size: 24px;
}

.image-preview .image-slot {
  min-height: 200px;
}

.image-preview .image-slot i {
  font-size: 64px;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attachment-item {
    padding: 8px;
  }

  .file-icon {
    margin-right: 8px;
    font-size: 20px;
  }

  .file-name {
    font-size: 13px;
  }

  .file-actions .el-button {
    padding: 2px;
  }
}
</style>
