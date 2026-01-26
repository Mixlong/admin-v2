<template>
  <div class="search-wrapper">
    <el-form :model="form" inline size="small">
      <!-- 左侧：搜索条件 -->
      <el-form-item label="客户名称">
        <el-input
          v-model="form.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="配置型号">
        <el-input
          v-model="form.configModel"
          placeholder="请输入配置型号"
          clearable
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="客户订单号">
        <el-input
          v-model="form.customerOrderNo"
          placeholder="请输入客户订单号"
          clearable
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('search')">搜索</el-button>
        <el-button @click="$emit('reset')">重置</el-button>
      </el-form-item>

      <!-- 右侧：角色切换 -->
      <div class="role-switcher">
        <i class="el-icon-user" style="color: #409eff; margin-right: 5px"></i>
        <el-select
          :model-value="currentRole"
          placeholder="切换角色测试"
          size="small"
          style="width: 130px"
          @update:model-value="$emit('role-change', $event)"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <el-button v-if="canAddOrder" type="primary" size="small" @click="$emit('add')">
        新增订单
      </el-button>
      <el-button type="success" size="small" @click="$emit('save')"> 保存修改 </el-button>
      <el-button type="warning" size="small" @click="$emit('export')"> 导出Excel </el-button>
      <el-button size="small" icon="el-icon-setting" @click="$emit('show-column-config')">
        列配置
      </el-button>
      <el-button size="small" @click="$emit('reset-columns')"> 重置列配置 </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { roleOptions } from '../config'

defineProps({
  form: {
    type: Object,
    required: true
  },
  currentRole: {
    type: String,
    default: 'market'
  },
  canAddOrder: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'search',
  'reset',
  'role-change',
  'add',
  'save',
  'export',
  'show-column-config',
  'reset-columns'
])
</script>

<style lang="scss" scoped>
.search-wrapper {
  background: #fff;
  padding: 15px 15px 0;
  border-radius: 10px 10px 0 0;
  :deep(.el-form) {
    display: flex;
    flex-wrap: nowrap;

    :deep(.el-form-item) {
      margin-bottom: 15px;
      margin-right: 10px;
    }
  }

  .role-switcher {
    display: inline-flex;
    align-items: center;
    margin-left: auto;
    margin-right: 10px;
    margin-bottom: 15px;
  }
}
</style>
