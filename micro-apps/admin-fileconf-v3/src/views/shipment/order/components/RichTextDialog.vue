<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    append-to-body
    class="rich-text-dialog"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <Editor
        v-if="!readonly"
        :model-value="content"
        :placeholder="placeholder"
        :height="300"
        @update:model-value="$emit('update:content', $event)"
      />
      <div v-else class="readonly-content">
        <div class="rich-text-display" v-html="content || '暂无内容'"></div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">
          {{ readonly ? '关闭' : '取消' }}
        </el-button>
        <el-button 
          v-if="!readonly" 
          type="primary" 
          @click="$emit('save')"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import Editor from '@/components/Editor/index.vue'
import { richTextFieldTitles, richTextFieldPlaceholders } from '../config/columns'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ''
  },
  field: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:visible', 'update:content', 'save'])

const dialogTitle = computed(() => {
  const action = props.readonly ? '查看' : '编辑'
  const fieldTitle = richTextFieldTitles[props.field] || ''
  return `${action}${fieldTitle}`
})

const placeholder = computed(() => {
  return richTextFieldPlaceholders[props.field] || '请输入内容'
})
</script>

<style lang="scss" scoped>
.rich-text-dialog {
  .dialog-content {
    min-height: 300px;
  }
  
  .readonly-content {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 300px;
    
    .rich-text-display {
      :deep(img) {
        max-width: 100%;
        height: auto;
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
