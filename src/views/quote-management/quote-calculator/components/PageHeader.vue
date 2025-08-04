<template>
  <div class="page-header">
    <div class="header-left">
      <div class="language-selector">
        <span class="language-label">规格属性:</span>
        <el-radio-group v-model="currentLanguage" @change="handleLanguageChange" size="mini">
          <el-radio-button label="zh">中文</el-radio-button>
          <el-radio-button label="en">English</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="header-center">
      <h1 class="page-title">销售报价计算器</h1>
    </div>

    <div class="header-actions">
      <el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['quote:calculation:export']">
        导出
      </el-button>
      <el-button type="success" icon="el-icon-plus" @click="handleAddNew" v-hasPermi="['quote:calculation:add']">
        新增
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  data() {
    return {
      currentLanguage: 'zh'
    }
  },
  methods: {
    handleExport() {
      this.$emit('export')
    },

    handleClearAll() {
      this.$emit('clear-all')
    },

    handleAddNew() {
      this.$emit('add-new')
    },

    handleLanguageChange(language) {
      // 触发规格属性语言切换事件
      this.$emit('language-change', language)
      // 保存规格属性语言设置
      localStorage.setItem('spec-language', language)
    }
  },
  mounted() {
    // 从本地存储恢复规格属性语言设置
    const savedLanguage = localStorage.getItem('spec-language')
    if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage
    }
    // 初始化时触发语言切换事件，确保父组件同步
    this.$emit('language-change', this.currentLanguage)
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #ffffff;
  padding: 32px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
    position: absolute;
    left: 24px;
  }

  .header-center {
    display: flex;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      letter-spacing: 0.5px;
    }
  }

  .language-selector {
    display: flex;
    align-items: center;
    gap: 8px;

    .language-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
    }

    .el-radio-group {
      margin-left: 8px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    position: absolute;
    right: 24px;
  }
}

@media (max-width: 1200px) {
  .page-header {
    padding: 28px 20px;

    .header-left {
      gap: 20px;

      .page-title {
        font-size: 20px;
      }
    }

    .header-actions {
      gap: 10px;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 24px 18px;

    .header-left {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
      width: 100%;

      .page-title {
        font-size: 18px;
        text-align: center;
        width: 100%;
      }
    }

    .header-actions {
      width: 100%;
      justify-content: center;

      .el-button {
        flex: 1;
        max-width: 120px;
      }
    }
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px 16px;

    .header-left {
      .page-title {
        font-size: 16px;
      }
    }

    .header-actions {
      flex-direction: column;
      gap: 8px;

      .el-button {
        max-width: none;
        width: 100%;
      }
    }
  }
}
</style>