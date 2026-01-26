<template>
  <div class="formatted-text-editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="options"
      :style="styles"
      @text-change="handleTextChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  height: {
    type: Number,
    default: 200
  },
  minHeight: {
    type: Number,
    default: 150
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const quillEditorRef = ref()
const content = ref('')

const options = ref({
  theme: 'snow',
  bounds: document.body,
  debug: 'warn',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large'] }],
      ['clean']
    ]
  },
  placeholder: props.placeholder,
  readOnly: props.readOnly
})

const styles = computed(() => ({
  minHeight: `${props.minHeight}px`,
  height: props.height ? `${props.height}px` : 'auto'
}))

watch(
  () => props.modelValue,
  val => {
    if (val !== content.value) {
      content.value = val || ''
    }
  },
  { immediate: true }
)

function handleTextChange() {
  emit('update:modelValue', content.value)
}
</script>

<style scoped>
.formatted-text-editor {
  width: 100%;
}

.formatted-text-editor :deep(.ql-container) {
  font-size: 14px;
}

.formatted-text-editor :deep(.ql-editor) {
  min-height: 150px;
}

.formatted-text-editor :deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.formatted-text-editor :deep(.ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
