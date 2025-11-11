<template>
  <div class="version-display-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
      <p>正在加载版本更新...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      <el-icon><i class="el-icon-warning"></i></el-icon>
      <p>{{ error }}</p>
      <el-button @click="loadVersion">重新加载</el-button>
    </div>
    
    <!-- HTML 内容渲染 -->
    <div v-else v-html="htmlContent" class="html-content"></div>
  </div>
</template>

<script>
import { excelToHtml } from '@/utils/excelToHtml'

export default {
  name: 'VersionDisplay',
  
  data() {
    return {
      loading: false,
      error: null,
      htmlContent: ''
    }
  },
  
  mounted() {
    this.loadVersion()
  },
  
  methods: {
    async loadVersion() {
      this.loading = true
      this.error = null
      
      try {
        // Excel 文件路径
        const excelUrl = '/static/迪太云变更履历表.xlsx'
        
        // 转换为 HTML
        this.htmlContent = await excelToHtml(excelUrl)
        
        console.log('✅ 版本更新加载成功')
      } catch (error) {
        console.error('❌ 版本更新加载失败:', error)
        this.error = '加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.version-display-container {
  min-height: 400px;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #1890ff;
}

.error .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ff4d4f;
}

.loading p,
.error p {
  font-size: 16px;
  margin: 8px 0;
}

/* HTML 内容样式已在 excelToHtml.js 中定义 */
.html-content {
  width: 100%;
  overflow-x: auto;
}
</style>
