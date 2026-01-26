<template>
  <div class="table-actions">
    <template v-for="(action, index) in visibleActions" :key="index">
      <el-tooltip :content="action.label" placement="top" :disabled="!action.tooltip">
        <template v-if="!action.hidden">
          <el-button
            v-if="Array.isArray(action.permi) && action.permi.length"
            v-hasPermi="action.permi"
            :type="action.type || 'primary'"
            :icon="normalizeIcon(action.icon)"
            link
            :disabled="action.disabled"
            :class="action.class"
            @click="handleAction(action)"
          >
            <template v-if="!action.iconOnly">{{ action.label }}</template>
          </el-button>
          <el-button
            v-else
            :type="action.type || 'primary'"
            :icon="normalizeIcon(action.icon)"
            link
            :disabled="action.disabled"
            :class="action.class"
            @click="handleAction(action)"
          >
            <template v-if="!action.iconOnly">{{ action.label }}</template>
          </el-button>
        </template>
      </el-tooltip>
    </template>
    <!-- 更多操作 -->
    <el-dropdown v-if="moreActions.length > 0" trigger="click" @command="handleCommand">
      <el-button type="primary" link>
        更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <template v-for="(action, index) in moreActions" :key="index">
            <el-dropdown-item
              v-if="Array.isArray(action.permi) && action.permi.length"
              v-hasPermi="action.permi"
              :command="action"
              :disabled="action.disabled"
              :divided="action.divided"
            >
              <el-icon v-if="normalizeIcon(action.icon)"><component :is="normalizeIcon(action.icon)" /></el-icon>
              {{ action.label }}
            </el-dropdown-item>
            <el-dropdown-item
              v-else
              :command="action"
              :disabled="action.disabled"
              :divided="action.divided"
            >
              <el-icon v-if="normalizeIcon(action.icon)"><component :is="normalizeIcon(action.icon)" /></el-icon>
              {{ action.label }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  // 操作配置
  actions: { type: Array, default: () => [] },
  // 行数据
  row: { type: Object, default: () => ({}) },
  // 最大显示数量
  maxVisible: { type: Number, default: 3 }
})

const emit = defineEmits(['action'])

// 可见操作
const visibleActions = computed(() => {
  const filtered = props.actions.filter(a => !a.hidden)
  return filtered.slice(0, props.maxVisible)
})

// 更多操作
const moreActions = computed(() => {
  const filtered = props.actions.filter(a => !a.hidden)
  return filtered.slice(props.maxVisible)
})

function normalizeIcon(icon) {
  if (!icon) return undefined
  if (typeof icon === 'string') {
    const trimmed = icon.trim()
    return trimmed ? trimmed : undefined
  }
  return icon
}

// 处理操作
function handleAction(action) {
  if (action.onClick) {
    action.onClick(props.row)
  }
  emit('action', action.key || action.label, props.row)
}

// 处理下拉命令
function handleCommand(action) {
  handleAction(action)
}
</script>

<style lang="scss" scoped>
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .el-button + .el-button {
    margin-left: 0;
  }

  .text-danger {
    color: #f56c6c !important;
  }

  .text-success {
    color: #67c23a !important;
  }

  .text-warning {
    color: #e6a23c !important;
  }
}
</style>
