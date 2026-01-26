<template>
  <div class="form-group-wrapper">
    <div class="form-group-title">
      <span class="title-text">{{ title }}</span>
      <div v-if="extra" class="title-extra" @click="handleExtraClick">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>
    <div class="form-group-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  extra: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['extra-click'])

function handleExtraClick() {
  emit('extra-click')
}
</script>

<style scoped lang="scss">
.form-group-wrapper {
  margin-bottom: 20px;

  .form-group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #f5f7fa;
    border-left: 3px solid #409eff;
    font-size: 14px;
    font-weight: 500;
    color: #303133;

    .title-text {
      flex: 1;
    }

    .title-extra {
      font-size: 12px;
      font-weight: normal;
      color: #909399;
    }
  }

  .form-group-content {
    padding: 0 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    padding: 16px;
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .form-group-wrapper {
    .form-group-title {
      background: #1d1e1f;
      color: #e5eaf3;
    }

    .form-group-content {
      background: #141414;
      border-color: #414243;
    }
  }
}
</style>
