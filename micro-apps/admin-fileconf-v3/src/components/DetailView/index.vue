<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="900px"
    destroy-on-close
  >
    <div v-loading="loading">
      <template v-for="block in schema.blocks" :key="block.title">
        <div v-if="isVisible(block)" class="dd-section">
          <h4 v-if="block.title">{{ block.title }}</h4>
          
          <!-- 普通详情 - Grid 布局 -->
          <template v-if="block.type !== 'table'">
            <el-row :gutter="0" class="detail-grid">
              <template v-for="f in block.fields" :key="f.key">
                <el-col v-if="isVisible(f)" :span="f.span === 2 ? 24 : 12">
                  <div class="cell">
                    <span class="label">{{ f.label }}</span>
                    <span v-if="f.render === 'html'" class="value" v-html="get(data, f.key) || '-'"></span>
                    <span v-else class="value">{{ render(f) }}</span>
                  </div>
                </el-col>
              </template>
            </el-row>
          </template>
          
          <!-- 表格明细 -->
          <el-table
            v-else
            :data="get(data, block.source)"
            border
            size="small"
          >
            <el-table-column
              v-for="c in block.columns"
              :key="c.key"
              :prop="c.key"
              :label="c.label"
            >
              <template #default="{ row }">
                {{ render(c, row) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from '@/utils/request'

const visible = ref(false)
const loading = ref(false)
const title = ref('')
const data = reactive({})
const schema = reactive({ blocks: [], cols: 2 })

/** 对外暴露：打开弹窗 */
async function open({ title: t, id, schema: s, data: d }) {
  title.value = t || '详情'
  Object.assign(schema, s)
  Object.keys(data).forEach(k => delete data[k])
  
  if (d) {
    Object.assign(data, d)
    visible.value = true
    return
  }
  
  if (s.fetch?.url) {
    loading.value = true
    try {
      const url = s.fetch.url.replace('{id}', id)
      const res = await request.get(url)
      Object.assign(data, res.data || {})
    } finally {
      loading.value = false
    }
  }
  visible.value = true
}

/** 字段渲染 */
function render(field, row = data) {
  const val = get(row, field.key)
  
  if (field.render === 'dict') {
    return field.map?.[val] ?? val ?? '-'
  }
  if (field.render === 'money') {
    return val != null ? Number(val).toFixed(2) : '-'
  }
  if (field.render === 'datetime') {
    return val || '-'
  }
  if (field.render === 'boolean') {
    return val ? '是' : '否'
  }
  if (field.render === 'size') {
    return val ? `${(val / 1024 / 1024).toFixed(2)} MB` : '-'
  }
  if (typeof field.render === 'function') {
    return field.render(val, row)
  }
  
  return val ?? '-'
}

/** 条件显示 */
function isVisible(node) {
  if (!node.visibleOn) return true
  try {
    return new Function('data', `return ${node.visibleOn}`)(data)
  } catch {
    return true
  }
}

/** 支持 a.b.c */
function get(obj, path) {
  if (!path) return undefined
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
}

defineExpose({ open })
</script>

<style scoped>
.dd-section {
  margin-bottom: 16px;
}

.dd-section h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #303133;
}

.detail-grid {
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.detail-grid .cell {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  font-size: 12px;
  line-height: 1.5;
}

.detail-grid .label {
  flex-shrink: 0;
  width: 100px;
  padding: 8px 12px;
  background: var(--el-descriptions-item-bordered-label-background, #f5f7fa);
  color: #606266;
  font-weight: 500;
  border-right: 1px solid #ebeef5;
}

.detail-grid .value {
  flex: 1;
  padding: 8px 12px;
  color: #303133;
  word-break: break-all;
}
</style>
