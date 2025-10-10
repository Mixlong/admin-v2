<template>
  <el-card class="search-toolbar">
    <div class="toolbar-content">
      <!-- 左侧操作按钮 -->
      <div class="toolbar-left">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="$emit('add')"
        >
          {{ addText }}
        </el-button>

        <el-button
          v-if="showImport"
          size="small"
          icon="el-icon-upload2"
          @click="$emit('import')"
        >
          批量导入
        </el-button>

        <el-button
          v-if="showExport"
          size="small"
          icon="el-icon-download"
          @click="$emit('export')"
        >
          导出
        </el-button>

        <!-- 额外按钮插槽 -->
        <slot name="extra-buttons" />
      </div>

      <!-- 右侧搜索区域 -->
      <div class="toolbar-right">
        <!-- 搜索输入框 -->
        <el-input
          :value="searchValue"
          :placeholder="searchPlaceholder"
          prefix-icon="el-icon-search"
          size="small"
          style="width: 250px"
          clearable
          @input="handleSearch"
        />

        <!-- 筛选器插槽 -->
        <slot name="filters" />
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'SearchToolbar',
  props: {
    searchValue: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: '请输入搜索关键词'
    },
    addText: {
      type: String,
      default: '新建'
    },
    showImport: {
      type: Boolean,
      default: true
    },
    showExport: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleSearch(value) {
      this.$emit('search', value)
    }
  }
}
</script>

<style scoped>
.search-toolbar {
  margin-bottom: 16px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>