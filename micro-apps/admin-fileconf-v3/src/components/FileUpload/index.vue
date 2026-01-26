<template>
  <div class="upload-file">
    <!-- 紧凑模式：标题 + 按钮在一行，下面文件列表可滚动 -->
    <template v-if="compact">
      <div v-if="!hideHeader" class="compact-header">
        <span class="compact-title">{{ title }}</span>
        <el-button v-if="!disabled" type="primary" link class="add-btn" @click="triggerUpload">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="compact-file-list" :class="{ 'layout-row': layout === 'row', 'layout-column': layout === 'column' }" :style="{ maxHeight: listHeight }">
        <div v-if="fileList.length > 0" class="file-items">
          <div
            v-for="(file, index) in fileList"
            :key="file.uid"
            class="file-item-preview"
          >
            <!-- 图片类型直接显示缩略图 -->
            <template v-if="isImageFile(file.name)">
              <el-image
                :src="getFileUrl(file)"
                :preview-src-list="imagePreviewList"
                :initial-index="getImageIndex(file)"
                fit="cover"
                class="file-thumbnail"
              />
            </template>
            <!-- 其他文件显示图标 -->
            <template v-else>
              <div class="file-icon-box" @click="handlePreview(file)">
                <el-icon class="file-type-icon"><Document /></el-icon>
                <span class="file-ext">{{ getFileExt(file.name) }}</span>
              </div>
            </template>
            <el-tooltip :content="getFileName(file.name)" placement="top" :show-after="500">
              <span class="file-name-text">{{ getFileName(file.name) }}</span>
            </el-tooltip>
            <!-- column 模式下的操作按钮 -->
            <div v-if="layout === 'column'" class="action-btns">
              <el-icon class="preview-btn" @click.stop="handlePreview(file)"><View /></el-icon>
              <el-icon v-if="!disabled" class="delete-btn" @click.stop="handleDelete(index)"><Close /></el-icon>
            </div>
            <!-- row 模式下的删除按钮 -->
            <el-icon v-else-if="!disabled" class="delete-btn" @click.stop="handleDelete(index)"><Close /></el-icon>
          </div>
        </div>
        <div v-else class="empty-tip">{{ emptyText }}</div>
      </div>
      <!-- 隐藏的上传组件 -->
      <el-upload
        ref="uploadRef"
        :action="uploadFileUrl"
        :data="data"
        :limit="limit"
        :multiple="true"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        :disabled="disabled"
        :accept="acceptStr"
        class="hidden-upload"
      >
        <template #trigger>
          <span ref="triggerRef"></span>
        </template>
      </el-upload>
    </template>

    <!-- 默认模式 -->
    <template v-else>
      <el-upload
        multiple
        :action="uploadFileUrl"
        ref="fileUpload"
        :before-upload="handleBeforeUpload"
        v-if="!disabled"
        :file-list="fileList"
        :data="data"
        :limit="limit"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        :on-success="handleUploadSuccess"
        :show-file-list="false"
        class="upload-file-uploader"
      >
        <el-button type="primary">选取文件</el-button>
      </el-upload>
      <div v-if="showTip && !disabled" class="el-upload__tip">
        请上传
        <template v-if="fileSize">
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType">
          格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
        </template>
        的文件
      </div>
      <transition-group
        ref="uploadFileList"
        class="upload-file-list el-upload-list el-upload-list--text"
        name="el-fade-in-linear"
        tag="ul"
      >
        <li
          v-for="(file, index) in fileList"
          :key="file.uid"
          class="el-upload-list__item ele-upload-list__item-content"
        >
          <el-link :href="`${baseUrl}${file.url}`" :underline="false" target="_blank">
            <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
          </el-link>
          <div class="ele-upload-list__item-content-action">
            <el-link v-if="!disabled" :underline="false" type="danger" @click="handleDelete(index)">&nbsp;删除</el-link>
          </div>
        </li>
      </transition-group>
    </template>

    <!-- 文件预览弹窗 -->
    <FilePreview v-model="previewVisible" :url="previewUrl" :name="previewName" />
  </div>
</template>

<script setup>
import { Plus, Document, Close, View } from '@element-plus/icons-vue'
import FilePreview from '@/components/FilePreview/index.vue'
import Sortable from 'sortablejs'

const props = defineProps({
  modelValue: [String, Object, Array],
  action: { type: String, default: '/oss/batch-upload' },
  data: { type: Object },
  limit: { type: Number, default: 5 },
  fileSize: { type: Number, default: 50 },
  fileType: { type: Array, default: () => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'jpg', 'jpeg', 'png'] },
  isShowTip: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  drag: { type: Boolean, default: true },
  // 紧凑模式相关
  compact: { type: Boolean, default: false },
  title: { type: String, default: '' },
  listHeight: { type: String, default: '120px' },
  emptyText: { type: String, default: '暂无文件' },
  hideHeader: { type: Boolean, default: false },
  // 布局模式：row(行模式，横向排列) / column(列模式，纵向排列)
  layout: { type: String, default: 'row' }
})

const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:modelValue'])
const number = ref(0)
const uploadList = ref([])
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + props.action)
const fileList = ref([])
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))

// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')
const previewName = ref('')

// 上传组件 ref
const uploadRef = ref(null)
const triggerRef = ref(null)

// 计算 accept 字符串
const acceptStr = computed(() => {
  if (!props.fileType || !props.fileType.length) return ''
  return props.fileType.map(t => `.${t}`).join(',')
})

// 图片预览列表（只包含图片文件）
const imagePreviewList = computed(() => {
  return fileList.value
    .filter(f => isImageFile(f.name))
    .map(f => getFileUrl(f))
})

// 判断是否是图片文件
function isImageFile(name) {
  if (!name) return false
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
}

// 获取文件扩展名
function getFileExt(name) {
  if (!name) return ''
  return (name.split('.').pop() || '').toUpperCase()
}

// 获取图片在预览列表中的索引
function getImageIndex(file) {
  const imageFiles = fileList.value.filter(f => isImageFile(f.name))
  return imageFiles.findIndex(f => f.uid === file.uid)
}

// 获取文件完整URL
function getFileUrl(file) {
  const url = file.url
  if (!url) return ''
  if (url.startsWith('http')) return url
  return baseUrl + url
}

watch(
  () => props.modelValue,
  val => {
    if (val) {
      let temp = 1
      const list = Array.isArray(val) ? val : props.modelValue.split(',')
      fileList.value = list.map(item => {
        if (typeof item === 'string') {
          item = { name: item, url: item }
        }
        item.uid = item.uid || new Date().getTime() + temp++
        return item
      })
    } else {
      fileList.value = []
      return []
    }
  },
  { deep: true, immediate: true }
)

function handleBeforeUpload(file) {
  if (props.fileType.length) {
    const fileName = file.name.split('.')
    const fileExt = fileName[fileName.length - 1]
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join('/')}格式文件!`)
      return false
    }
  }
  if (file.name.includes(',')) {
    proxy.$modal.msgError('文件名不正确，不能包含英文逗号!')
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  proxy.$modal.loading('正在上传文件，请稍候...')
  number.value++
  return true
}

function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadError() {
  proxy.$modal.msgError('上传文件失败')
  proxy.$modal.closeLoading()
}

function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    // 兼容 /oss/batch-upload 和 /common/upload 两种返回格式
    const url = res.data?.[0]?.url || res.url || res.fileName
    if (url) {
      uploadList.value.push({ name: file.name, url: url })
    }
    uploadedSuccessfully()
  } else {
    number.value--
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(res.msg)
    proxy.$refs.fileUpload?.handleRemove(file)
    uploadedSuccessfully()
  }
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  emit('update:modelValue', listToString(fileList.value))
}

function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    emit('update:modelValue', listToString(fileList.value))
    proxy.$modal.closeLoading()
  }
}

function getFileName(name) {
  if (!name) return ''
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1)
  } else {
    return name
  }
}

function listToString(list, separator) {
  let strs = ''
  separator = separator || ','
  for (const i in list) {
    if (list[i].url) {
      strs += list[i].url + separator
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : ''
}

// 触发上传（紧凑模式使用）
function triggerUpload() {
  triggerRef.value?.click()
}

// 预览文件
function handlePreview(file) {
  const url = file.url
  if (!url) return
  previewUrl.value = url.startsWith('http') ? url : baseUrl + url
  previewName.value = getFileName(file.name)
  previewVisible.value = true
}

onMounted(() => {
  if (props.drag && !props.disabled && !props.compact) {
    nextTick(() => {
      const element = proxy.$refs.uploadFileList?.$el || proxy.$refs.uploadFileList
      if (element) {
        Sortable.create(element, {
          ghostClass: 'file-upload-darg',
          onEnd: evt => {
            const movedItem = fileList.value.splice(evt.oldIndex, 1)[0]
            fileList.value.splice(evt.newIndex, 0, movedItem)
            emit('update:modelValue', listToString(fileList.value))
          }
        })
      }
    })
  }
})

defineExpose({ triggerUpload, getFiles: () => fileList.value })
</script>

<style scoped lang="scss">
.file-upload-darg {
  opacity: 0.5;
  background: #c8ebfb;
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
  transition: none !important;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}

/* 紧凑模式样式 */
.compact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: #e8f5e9;
  border-bottom: 1px solid #c8e6c9;
  
  .compact-title {
    font-size: 13px;
    font-weight: 600;
    color: #2e7d32;
  }
  
  .add-btn {
    font-size: 18px;
    padding: 0;
    
    &:hover {
      color: #1b5e20;
    }
  }
}

.compact-file-list {
  overflow-y: auto;
  padding: 8px;
  background: #fff;
  min-height: 60px;
  
  .file-items {
    display: flex;
    gap: 8px;
  }
  
  // 行模式：横向排列，换行
  &.layout-row .file-items {
    flex-wrap: wrap;
    flex-direction: row;
  }
  
  // 列模式：纵向排列
  &.layout-column .file-items {
    flex-direction: column;
  }
  
  // 列模式下的文件项样式
  &.layout-column .file-item-preview {
    flex-direction: row;
    width: 100%;
    padding: 6px 8px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .file-thumbnail {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }
    
    .file-icon-box {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      
      .file-type-icon {
        font-size: 16px;
      }
      
      .file-ext {
        font-size: 8px;
      }
    }
    
    .file-name-text {
      flex: 1;
      margin-top: 0;
      margin-left: 8px;
      text-align: left;
      max-width: none;
      font-size: 12px;
    }
    
    .action-btns {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s;
      
      .preview-btn {
        color: #409eff;
        font-size: 14px;
        cursor: pointer;
        
        &:hover {
          color: #66b1ff;
        }
      }
      
      .delete-btn {
        position: static;
        width: auto;
        height: auto;
        background: transparent;
        color: #f56c6c;
        font-size: 14px;
        
        &:hover {
          color: #f78989;
          background: transparent;
        }
      }
    }
    
    &:hover {
      background: #e8f4ff;
      
      .action-btns {
        opacity: 1;
      }
    }
  }
  
  .file-item-preview {
    position: relative;
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .file-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      cursor: pointer;
    }
    
    .file-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      background: #f5f7fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #409eff;
        background: #ecf5ff;
      }
      
      .file-type-icon {
        font-size: 20px;
        color: #409eff;
      }
      
      .file-ext {
        font-size: 10px;
        color: #909399;
        margin-top: 2px;
      }
    }
    
    .file-name-text {
      font-size: 10px;
      color: #606266;
      margin-top: 4px;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      cursor: default;
    }
    
    .delete-btn {
      position: absolute;
      top: -6px;
      right: 0;
      width: 16px;
      height: 16px;
      background: #f56c6c;
      border-radius: 50%;
      color: #fff;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      
      &:hover {
        background: #f78989;
      }
    }
    
    &:hover .delete-btn {
      opacity: 1;
    }
  }
  
  .empty-tip {
    text-align: center;
    color: #c0c4cc;
    font-size: 12px;
    padding: 20px 0;
  }
}

.hidden-upload {
  display: none;
}
</style>
