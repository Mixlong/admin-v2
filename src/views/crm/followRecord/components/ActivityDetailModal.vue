<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="跟进记录详情"
    width="700px"
    center
    class="activity-detail-modal"
    :close-on-click-modal="false"
    :before-close="handleClose"
    top="0vh"
  >
    <div v-if="activity" class="activity-detail">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-title">
          <i class="el-icon-document"></i>
          跟进记录信息
        </div>
        <div class="info-grid">
          <div class="info-item info-item--span2">
            <div class="info-label">跟进内容</div>
            <div class="info-value content-text">{{ activity.followContent || activity.title || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">跟进方式</div>
            <div class="info-value">
              <el-tag :type="getMethodColor(activity.followMethod || activity.type)" size="small">
                {{ getMethodText(activity.followMethod || activity.type) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">客户名称</div>
            <div class="info-value">{{ activity.customerName || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">联系人</div>
            <div class="info-value">{{ activity.contactName || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">跟进人</div>
            <div class="info-value user-info">
              <el-avatar :size="20" class="bg-blue-600">
                {{ (activity.follower || activity.assigneeName || '').charAt(0) }}
              </el-avatar>
              <span>{{ activity.follower || activity.assigneeName || '-' }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">跟进时间</div>
            <div class="info-value">{{ formatDateTime(activity.followTime || activity.plannedTime) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatDateTime(activity.createTime || activity.actualTime) }}</div>
          </div>
        </div>
      </div>

      <!-- 跟进结果 -->
      <div v-if="activity.result" class="info-section">
        <div class="section-title">
          <i class="el-icon-success"></i>
          跟进结果
        </div>
        <div class="result-content">{{ activity.result }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ActivityDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    activity: {
      type: Object,
      default: null
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },

    handleEdit() {
      if (this.activity) {
        this.$router.push(`/crm/activity/edit/${this.activity.id}`)
        this.handleClose()
      }
    },

    handleComplete() {
      this.$message.success('活动已标记为完成')
      this.$emit('refresh')
      this.handleClose()
    },

    // 辅助函数
    getMethodColor(method) {
      const colorMap = {
        // 中文值
        '电话沟通': '',
        '客户拜访': 'success',
        '邮件沟通': 'warning',
        '微信沟通': 'info',
        '会议': 'info',
        '其他': 'danger',
        // 英文值
        'call': '',
        'visit': 'success',
        'email': 'warning',
        'wechat': 'info',
        'meeting': 'info',
        'other': 'danger'
      }
      return colorMap[method] || ''
    },

    getMethodText(method) {
      const textMap = {
        // 英文值转中文
        'call': '电话跟进',
        'visit': '客户拜访',
        'email': '邮件沟通',
        'wechat': '微信沟通',
        'meeting': '会议',
        'other': '其他',
        // 中文值保持不变
        '电话跟进': '电话跟进',
        '客户拜访': '客户拜访',
        '邮件沟通': '邮件沟通',
        '微信沟通': '微信沟通',
        '会议': '会议',
        '其他': '其他'
      }
      return textMap[method] || method
    },

    getTypeColor(type) {
      const colorMap = {
        call: '',
        visit: 'success',
        email: 'warning',
        meeting: 'info',
        other: 'danger'
      }
      return colorMap[type] || ''
    },

    getTypeText(type) {
      const textMap = {
        call: '电话跟进',
        visit: '客户拜访',
        email: '邮件沟通',
        meeting: '会议',
        other: '其他'
      }
      return textMap[type] || type
    },

    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        ongoing: 'info',
        completed: 'success',
        cancelled: 'danger'
      }
      return typeMap[status] || ''
    },

    getStatusText(status) {
      const textMap = {
        pending: '待执行',
        ongoing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return textMap[status] || status
    },

    getPriorityColor(priority) {
      const colorMap = {
        high: '#f56565',
        medium: '#ed8936',
        low: '#48bb78'
      }
      return colorMap[priority] || '#718096'
    },

    getPriorityText(priority) {
      const textMap = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return textMap[priority] || priority
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.activity-detail-modal .el-dialog {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.activity-detail-modal .el-dialog__body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.activity-detail {
  font-size: 14px;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  background: linear-gradient(90deg, #e8f4ff 0%, transparent 100%);
  padding: 8px 0 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: #ebeef5;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.info-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  min-height: 48px;
  background-color: #fff;
}

.info-item--span2 {
  grid-column: span 2;
}

.info-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
  padding: 10px 8px;
  border-right: 1px solid #ebeef5;
}

.info-value {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  padding: 12px 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.dialog-footer {
  text-align: right;
}

/* Element UI 样式优化 */
.activity-detail-modal :deep(.el-descriptions) {
  border-radius: 8px;
}

.activity-detail-modal :deep(.el-descriptions__label) {
  background-color: #fafafa !important;
  font-weight: 500;
}

.activity-detail-modal :deep(.el-tag) {
  border-radius: 4px;
}

.activity-detail-modal :deep(.el-avatar) {
  background-color: #409eff;
}
</style>