<template>
  <div class="image-upload">
    <!-- 图片列表 -->
    <div class="image-list" v-if="fileList.length > 0">
      <div
        v-for="(file, index) in fileList"
        :key="file.uid || index"
        class="image-item"
      >
        <el-image
          :src="getFileUrl(file)"
          :preview-src-list="previewList"
          :initial-index="index"
          fit="cover"
          class="image-thumbnail"
        />
        <div class="image-actions" v-if="!disabled">
          <el-icon class="action-icon" @click="handlePreview(index)"><ZoomIn /></el-icon>
          <el-icon class="action-icon delete" @click="handleDelete(index)"><Delete /></el-icon>
        </div>
        <div class="file-name" v-if="showFileName">{{ getFileName(file) }}</div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-icon class="empty-icon"><Picture /></el-icon>
      <span class="empty-text">暂无文件</span>
    </div>
    
    <!-- 上传按钮（隐藏，通过外部触发） -->
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :data="uploadData"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :disabled="disabled"
      class="hidden-upload"
    >
      <template #trigger>
        <span ref="triggerRef"></span>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ZoomIn, Delete, Picture } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: { type: [String, Array], default: '' },
  action: { type: String, default: '/oss/batch-upload' },
  data: { type: Object, default: () => ({}) },
  limit: { type: Number, default: 10 },
  fileSize: { type: Number, default: 50 },
  accept: { type: String, default: 'image/*,.pdf,.doc,.docx,.xls,.xlsx' },
  multiple: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  showFileName: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])
const { proxy } = getCurrentInstance()

const uploadRef = ref(null)
const triggerRef = ref(null)
const fileList = ref([])
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadUrl = computed(() => baseUrl + props.action)
const headers = computed(() => ({ Authorization: 'Bearer ' + getToken() }))
const uploadData = computed(() => props.data)

const previewList = computed(() => fileList.value.map(f => getFileUrl(f)))

watch(() => props.modelValue, (val) => {
  if (val) {
    const list = Array.isArray(val) ? val : val.split(',').filter(Boolean)
    fileList.value = list.map((item, index) => {
      if (typeof item === 'string') {
        return { url: item, name: item, uid: Date.now() + index }
      }
      return { ...item, uid: item.uid || Date.now() + index }
    })
  } else {
    fileList.value = []
  }
}, { immediate: true, deep: true })

function getFileUrl(file) {
  const url = typeof file === 'string' ? file : file.url
  if (!url) return ''
  if (url.startsWith('http')) return url
  return baseUrl + url
}

function getFileName(file) {
  const url = typeof file === 'string' ? file : (file.name || file.url)
  if (!url) return ''
  return url.split('/').pop()
}

function handleBeforeUpload(file) {
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`文件大小不能超过 ${props.fileSize}MB!`)
      return false
    }
  }
  proxy.$modal.loading('正在上传...')
  return true
}

function handleUploadSuccess(res, file) {
  proxy.$modal.closeLoading()
  if (res.code === 200) {
    const url = res.data?.[0]?.url || res.url || res.fileName
    if (url) {
      fileList.value.push({ url, name: file.name, uid: Date.now() })
      emitValue()
    }
  } else {
    proxy.$modal.msgError(res.msg || '上传失败')
  }
}

function handleUploadError() {
  proxy.$modal.closeLoading()
  proxy.$modal.msgError('上传失败')
}

function handleExceed() {
  proxy.$modal.msgError(`最多只能上传 ${props.limit} 个文件!`)
}

function handlePreview() {
  // el-image 组件自带预览功能
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  emitValue()
}

function triggerUpload() {
  triggerRef.value?.click()
}

function emitValue() {
  const value = fileList.value.map(f => f.url).join(',')
  emit('update:modelValue', value)
  emit('change', value)
}

defineExpose({ triggerUpload, getFiles: () => fileList.value })
</script>

<style scoped lang="scss">
.image-upload {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  position: relative;
  width: 60px;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  
  .image-thumbnail {
    width: 100%;
    height: 100%;
  }
  
  .image-actions {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    
    .action-icon {
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      
      &:hover {
        color: #409eff;
      }
      
      &.delete:hover {
        color: #f56c6c;
      }
    }
  }
  
  &:hover .image-actions {
    opacity: 1;
  }
  
  .file-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #c0c4cc;
  
  .empty-icon {
    font-size: 32px;
    margin-bottom: 4px;
  }
  
  .empty-text {
    font-size: 12px;
  }
}

.hidden-upload {
  display: none;
}
</style>
