<template>
  <div>
    <!-- 图片上传 -->
    <el-upload
      v-if="type == 'url'"
      ref="uploadRef"
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      style="display: none"
    />
    <!-- 文件上传 -->
    <el-upload
      v-if="type == 'url'"
      ref="fileUploadRef"
      :action="uploadUrl"
      :before-upload="handleBeforeUploadFile"
      :on-success="handleUploadFileSuccess"
      :on-error="handleUploadFileError"
      name="file"
      :show-file-list="false"
      style="display: none"
    />
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="options"
      :style="styles"
      @text-change="handleTextChange"
      @ready="handleEditorReady"
    />
  </div>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const { proxy } = getCurrentInstance()

const quillEditorRef = ref()
const uploadRef = ref()
const fileUploadRef = ref()
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/oss/batch-upload')

const props = defineProps({
  modelValue: { type: String },
  height: { type: Number, default: null },
  minHeight: { type: Number, default: null },
  readOnly: { type: Boolean, default: false },
  fileSize: { type: Number, default: 5 },
  type: { type: String, default: 'url' },
  placeholder: { type: String, default: '请输入内容' }
})

const emit = defineEmits(['update:modelValue'])

const options = ref({
  theme: 'snow',
  bounds: document.body,
  debug: 'warn',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  },
  placeholder: props.placeholder,
  readOnly: props.readOnly
})

const styles = computed(() => {
  const style = {}
  if (props.minHeight) style.minHeight = `${props.minHeight}px`
  if (props.height) style.height = `${props.height}px`
  return style
})

const content = ref('')

watch(() => props.modelValue, v => {
  if (v !== content.value) {
    content.value = v == undefined ? '<p></p>' : v
  }
}, { immediate: true })

function handleTextChange() {
  emit('update:modelValue', content.value)
}

// 编辑器准备就绪
function handleEditorReady(quill) {
  if (props.type === 'url') {
    // 自定义图片上传
    const toolbar = quill.getModule('toolbar')
    toolbar.addHandler('image', value => {
      if (value) {
        const input = uploadRef.value?.$el?.querySelector('input[type="file"]')
        if (input) input.click()
      } else {
        quill.format('image', false)
      }
    })
    
    // 添加文件上传按钮
    nextTick(() => {
      const container = quillEditorRef.value?.$el
      const toolbarEl = container?.querySelector('.ql-toolbar')
      if (toolbarEl && !toolbarEl.querySelector('.ql-file')) {
        const fileButton = document.createElement('button')
        fileButton.type = 'button'
        fileButton.className = 'ql-file'
        fileButton.innerHTML = `<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M5,3 L5,15 L13,15 L13,6 L10,3 L5,3 Z M10,3 L10,6 L13,6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`
        fileButton.title = '上传文件'
        fileButton.addEventListener('click', () => {
          const input = fileUploadRef.value?.$el?.querySelector('input[type="file"]')
          if (input) input.click()
        })
        toolbarEl.appendChild(fileButton)
      }
    })
    
    // 粘贴图片处理
    quill.root.addEventListener('paste', handlePasteCapture, true)
  }
}

// 图片上传前校检
function handleBeforeUpload(file) {
  const type = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
  if (!type.includes(file.type)) {
    proxy.$modal.msgError('图片格式错误!')
    return false
  }
  if (props.fileSize && file.size / 1024 / 1024 > props.fileSize) {
    proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
    return false
  }
  return true
}

// 图片上传成功
function handleUploadSuccess(res) {
  if (res.code == 200 || res.code == 0) {
    const quill = quillEditorRef.value?.getQuill()
    if (!quill) return
    
    const length = quill.getSelection()?.index || 0
    let imageUrl = ''
    if (Array.isArray(res.data)) {
      imageUrl = res.data[0]?.url
    } else if (res.data?.url) {
      imageUrl = res.data.url
    } else if (res.url) {
      imageUrl = res.url
    }
    
    if (imageUrl) {
      quill.insertEmbed(length, 'image', imageUrl)
      quill.setSelection(length + 1)
      proxy.$modal.msgSuccess('图片上传成功')
    } else {
      proxy.$modal.msgError('获取图片地址失败')
    }
  } else {
    proxy.$modal.msgError(res.msg || '图片上传失败')
  }
}

function handleUploadError() {
  proxy.$modal.msgError('图片上传失败')
}

// 文件上传前校检
function handleBeforeUploadFile(file) {
  const maxSize = 50
  if (file.size / 1024 / 1024 > maxSize) {
    proxy.$modal.msgError(`上传文件大小不能超过 ${maxSize} MB!`)
    return false
  }
  return true
}

// 文件上传成功
function handleUploadFileSuccess(res, file) {
  if (res.code == 200 || res.code == 0) {
    const quill = quillEditorRef.value?.getQuill()
    if (!quill) return
    
    const length = quill.getSelection()?.index || 0
    let fileUrl = ''
    if (Array.isArray(res.data)) {
      fileUrl = res.data[0]?.url
    } else if (res.data?.url) {
      fileUrl = res.data.url
    } else if (res.url) {
      fileUrl = res.url
    }
    
    if (fileUrl) {
      const fileName = file.name
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
      
      if (imageExts.includes(fileExt)) {
        quill.insertEmbed(length, 'image', fileUrl)
        quill.setSelection(length + 1)
      } else {
        quill.insertText(length, fileName, 'link', fileUrl)
        quill.setSelection(length + fileName.length)
      }
      proxy.$modal.msgSuccess(`文件上传成功：${fileName}`)
    } else {
      proxy.$modal.msgError('获取文件地址失败')
    }
  } else {
    proxy.$modal.msgError(res.msg || '文件上传失败')
  }
}

function handleUploadFileError() {
  proxy.$modal.msgError('文件上传失败')
}

// 粘贴图片处理
function handlePasteCapture(e) {
  const clipboard = e.clipboardData || window.clipboardData
  if (clipboard?.items) {
    for (let i = 0; i < clipboard.items.length; i++) {
      const item = clipboard.items[i]
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        uploadImageFile(file)
      }
    }
  }
}

// 上传图片文件
async function uploadImageFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch(uploadUrl.value, {
      method: 'POST',
      body: formData
    })
    const res = await response.json()
    handleUploadSuccess(res)
  } catch (error) {
    proxy.$modal.msgError('图片上传失败')
  }
}
</script>

<style>
.editor-img-uploader { display: none; }
.editor, .ql-toolbar { white-space: pre-wrap !important; line-height: normal !important; }
.quill-img { display: none; }

/* 文件上传按钮样式 */
.ql-snow .ql-toolbar button.ql-file { width: 28px; height: 28px; }
.ql-snow .ql-toolbar button.ql-file svg { width: 18px; height: 18px; }
.ql-snow .ql-toolbar button.ql-file:hover { color: #06c; }
.ql-snow .ql-toolbar button.ql-file .ql-stroke { stroke: #444; }
.ql-snow .ql-toolbar button.ql-file:hover .ql-stroke { stroke: #06c; }

.ql-snow .ql-tooltip[data-mode='link']::before { content: '请输入链接地址:'; }
.ql-snow .ql-tooltip.ql-editing a.ql-action::after { border-right: 0px; content: '保存'; padding-right: 0px; }
.ql-snow .ql-tooltip[data-mode='video']::before { content: '请输入视频地址:'; }
.ql-snow .ql-picker.ql-size .ql-picker-label::before, .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: '14px'; }
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before, .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before { content: '10px'; }
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before, .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before { content: '18px'; }
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before, .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before { content: '32px'; }
.ql-snow .ql-picker.ql-header .ql-picker-label::before, .ql-snow .ql-picker.ql-header .ql-picker-item::before { content: '文本'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before { content: '标题1'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before { content: '标题2'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before { content: '标题3'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before { content: '标题4'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before { content: '标题5'; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before, .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before { content: '标题6'; }
.ql-snow .ql-picker.ql-font .ql-picker-label::before, .ql-snow .ql-picker.ql-font .ql-picker-item::before { content: '标准字体'; }
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before { content: '衬线字体'; }
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before { content: '等宽字体'; }
</style>
