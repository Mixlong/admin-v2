<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="版本更新通知"
    width="850px"
    top="0vh"
    :close-on-click-modal="false"
    custom-class="version-update-dialog"
    @close="handleClose"
  >
    <!-- 版本信息 -->
    <div class="version-info">
      <div class="version-header">
        <span class="version-number">{{ versionInfo.version }}</span>
        <el-tag v-if="!versionInfo.isFirstTime" type="danger" size="small" effect="plain">新版本</el-tag>
        <el-tag v-else type="success" size="small" effect="plain">当前版本</el-tag>
      </div>
      <div class="version-meta">
        <span class="meta-item">
          <i class="el-icon-document"></i>
          {{ versionInfo.updateCount }} 项更新
        </span>
        <span v-if="systemCount > 1" class="meta-item">
          <i class="el-icon-menu"></i>
          {{ systemCount }} 个模块
        </span>
      </div>
    </div>
    <!-- 更新内容 -->
    <div class="update-section">
      <div v-if="groupedUpdates.length > 0" class="update-list">
        <!-- 按系统分组显示 -->
        <div
          v-for="(group, groupIndex) in groupedUpdates"
          :key="groupIndex"
          class="system-group"
        >
          <!-- 系统名称标题 -->
          <div class="system-title">
            <i class="el-icon-menu"></i>
            <span>{{ group.system }}</span>
            <span class="update-count">({{ group.updates.length }}项)</span>
          </div>
          
          <!-- 该系统下的更新列表 -->
          <div class="system-updates">
            <div
              v-for="(item, index) in group.updates"
              :key="index"
              class="update-item-wrapper"
            >
              <div class="update-item">
                <span class="item-text">{{ item.text || item }}</span>
              </div>
              <!-- 图片展示 -->
              <div v-if="item.images && item.images.length > 0" class="item-images">
                <el-image
                  v-for="(img, imgIndex) in item.images"
                  :key="imgIndex"
                  :src="img"
                  :preview-src-list="item.images"
                  fit="contain"
                  class="update-image"
                >
                  <div slot="error" class="image-error">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无更新内容" :image-size="80"></el-empty>
    </div>

    <!-- 底部操作 -->
    <div slot="footer" class="dialog-footer">
      <el-button size="small" icon="el-icon-document" @click="viewFullHistory">
        查看历史记录
      </el-button>
      <div class="footer-right">
        <el-button type="primary" @click="handleConfirm">我知道了</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'VersionUpdateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    versionInfo: {
      type: Object,
      default: () => ({
        version: '',
        date: '',
        system: '',
        updates: [],
        updateCount: 0
      })
    }
  },
  data() {
    return {
      dialogVisible: this.visible
    }
  },
  computed: {
    dialogTitle() {
      return `🎉 版本更新通知 - ${this.versionInfo.version}`
    },
    // 按系统分组的更新内容
    groupedUpdates() {
      if (!this.versionInfo.updates || this.versionInfo.updates.length === 0) {
        return []
      }
      
      const groups = {}
      
      this.versionInfo.updates.forEach(item => {
        // 支持字符串或对象格式
        const update = typeof item === 'string' 
          ? { text: item, images: [], system: '其他' }
          : { ...item, system: item.system || '其他' }
        
        const systemName = update.system
        if (!groups[systemName]) {
          groups[systemName] = []
        }
        groups[systemName].push(update)
      })
      // 转换为数组格式
      return Object.keys(groups).map(systemName => ({
        system: systemName,
        updates: groups[systemName]
      }))
 
    },
    
    // 系统数量
    systemCount() {
      return this.groupedUpdates.length
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 计算全局索引（跨分组的连续序号）
     */
    getGlobalIndex(groupIndex, itemIndex) {
      let globalIndex = 0
      // 累加前面所有分组的更新数量
      for (let i = 0; i < groupIndex; i++) {
        globalIndex += this.groupedUpdates[i].updates.length
      }
      // 加上当前项的索引（从0开始）再加1
      return globalIndex + itemIndex + 1
    },
    
    handleConfirm() {
      this.$emit('confirm', this.versionInfo)
      this.dialogVisible = false
    },
    
    handleClose() {
      this.$emit('close')
      this.dialogVisible = false
    },
    
    viewFullHistory() {
      // 触发事件，让父组件打开完整的版本历史对话框
      this.$emit('view-history')
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .version-update-dialog {
  .el-dialog__body {
    padding: 0 24px;
    max-height: 60vh;
    overflow-y: auto;
    
    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;
      
      &:hover {
        background-color: #909399;
      }
    }
  }
  
  .el-dialog__footer {
    padding: 12px 24px;
    border-top: 1px solid #ebeef5;
  }
}

// 版本信息
.version-info {
  display: flex;
  position: sticky;
  z-index: 10;
  top: 0;;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  .version-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .version-number {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .version-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #606266;
      
      i {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

// 更新内容区域
.update-section {
  padding: 20px 0;
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }
  
  .update-list {
    max-width: 100%;
    overflow: hidden;
    
    // 系统分组
    .system-group {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .system-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: #f5f7fa;
        border-left: 3px solid #409eff;
        border-radius: 4px;
        margin-bottom: 16px;
        color: #303133;
        font-size: 15px;
        font-weight: 600;
        
        i {
          font-size: 16px;
          color: #409eff;
        }
        
        .update-count {
          font-size: 13px;
          font-weight: 400;
          color: #909399;
        }
      }
      
      .system-updates {
        padding-left: 8px;
      }
    }
    
    .update-item-wrapper {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        margin-bottom: 0;
        border-bottom: none;
        padding-bottom: 0;
      }
    }
    
    .update-item {
      display: flex;
      align-items: flex-start;
      line-height: 1.6;
      margin-bottom: 4px;
      
      .item-index {
        color: #409eff;
        font-weight: 500;
        margin-right: 8px;
        flex-shrink: 0;
      }
      
      .item-text {
        flex: 1;
        color: #606266;
        font-size: 14px;
      }
    }
    
    .item-images {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding-left: 22px;
      max-width: 100%;
      
      .update-image {
        width: 140px;
        height: 90px;
        border-radius: 4px;
        border: 1px solid #ebeef5;
        cursor: pointer;
        transition: all 0.3s;
        background: #f5f7fa;
        flex-shrink: 0;
        
        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          transform: scale(1.02);
        }
        
        ::v-deep img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      
      .image-error {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: #f5f7fa;
        color: #c0c4cc;
        font-size: 24px;
      }
    }
  }
}

// 底部操作
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>
