<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="90%"
    top="2vh"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    class="file-preview-dialog"
  >
    <div v-loading="loading" class="preview-container">
      <!-- PDF预览 -->
      <iframe
        v-if="isPDF"
        :src="fileUrl"
        class="preview-iframe"
        frameborder="0"
      />

      <!-- 图片预览 -->
      <div v-else-if="isImage" class="image-preview">
        <el-image :src="fileUrl" fit="contain" :preview-src-list="[fileUrl]">
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <p>图片加载失败</p>
            </div>
          </template>
        </el-image>
      </div>

      <!-- 文本文件预览 -->
      <div v-else-if="isTextFile" class="text-preview">
        <pre>{{ textContent }}</pre>
      </div>

      <!-- 不支持预览的文件类型 -->
      <div v-else class="unsupported-preview">
        <el-icon class="file-icon"><Document /></el-icon>
        <p>该文件类型（{{ fileExtension }}）暂不支持在线预览</p>
        <el-button type="primary" @click="handleDownload">
          <el-icon><Download /></el-icon> 下载文件
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="handleDownload">
        <el-icon><Download /></el-icon> 下载
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document, Download, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  url: { type: String, default: '' },
  name: { type: String, default: '文件预览' }
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const textContent = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fileUrl = computed(() => props.url)
const title = computed(() => props.name || '文件预览')

const fileExtension = computed(() => {
  if (!props.url) return ''
  const url = props.url.split('?')[0]
  const parts = url.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
})

const isPDF = computed(() => fileExtension.value === 'pdf')
const isImage = computed(() => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  return imageExts.includes(fileExtension.value)
})
const isTextFile = computed(() => {
  const textExts = ['txt', 'json', 'xml', 'csv', 'log', 'md']
  return textExts.includes(fileExtension.value)
})

watch(visible, (val) => {
  if (val) {
    loading.value = true
    if (isTextFile.value) {
      loadTextContent()
    } else {
      loading.value = false
    }
  } else {
    textContent.value = ''
    loading.value = false
  }
})

async function loadTextContent() {
  try {
    const response = await fetch(props.url)
    textContent.value = await response.text()
  } catch (error) {
    console.error('加载文本文件失败:', error)
  } finally {
    loading.value = false
  }
}

function handleDownload() {
  const link = document.createElement('a')
  link.href = props.url
  link.download = props.name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.file-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 10px 20px;
  }
}

.preview-container {
  min-height: 400px;
  max-height: 75vh;
  overflow: auto;
}

.preview-iframe {
  width: 100%;
  height: 75vh;
  border: none;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  :deep(.el-image) {
    max-width: 100%;
    max-height: 70vh;
  }
  
  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
    
    .el-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  }
}

.text-preview {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: 70vh;
  overflow: auto;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.6;
  }
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
  
  .file-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 14px;
    margin-bottom: 20px;
  }
}
</style>
