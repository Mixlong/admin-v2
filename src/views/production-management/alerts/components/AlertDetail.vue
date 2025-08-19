<template>
  <el-dialog title="报警详情" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false" top="0"
    @close="handleClose" class="alert-detail-dialog">
    <div class="detail-container">
      <!-- 基本信息 -->
      <el-card shadow="never" class="info-card">
        <div slot="header" class="card-header">
          <span>基本信息</span>
          <el-tag :type="getStatusColor(alertData.processType)" size="small">
            {{ getStatusLabel(alertData.processType) }}
          </el-tag>
        </div>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="工单号">{{ alertData.workOrderNo }}</el-descriptions-item>
              <el-descriptions-item label="品类名称">{{ alertData.categoryName }}</el-descriptions-item>
              <el-descriptions-item label="型号名称">{{ alertData.computerName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="上报人">{{ alertData.reporter }}</el-descriptions-item>
              <el-descriptions-item label="责任人">{{ alertData.responsible }}</el-descriptions-item>
              <el-descriptions-item label="责任部门">{{ alertData.responsibleDept }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="创建时间">{{ formatDateTime(alertData.createdTime) }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ alertData.processName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理时长">{{ alertData.processDuration || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- 问题描述 -->
      <el-card shadow="never" class="info-card">
        <div slot="header">问题描述</div>
        <div class="problem-content">{{ alertData.problemDesc }}</div>
      </el-card>

      <!-- 备注信息 -->
      <el-card shadow="never" class="info-card" v-if="alertData.remark">
        <div slot="header">备注信息</div>
        <div class="remark-content">{{ alertData.remark }}</div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script>
import { processTypeOptions, processTypeColors } from '@/types/production-alerts'

export default {
  name: 'AlertDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alertData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    getStatusColor(status) {
      return processTypeColors[status] || 'info'
    },

    getStatusLabel(status) {
      const option = processTypeOptions.find(item => item.value === status)
      return option ? option.label : '未知'
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    handleEdit() {
      this.$emit('edit', this.alertData)
      this.handleClose()
    },

    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-detail-dialog {
  .detail-container {
    .info-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .problem-content {
        line-height: 1.6;
        color: #606266;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
      }

      .remark-content {
        line-height: 1.6;
        padding: 15px;
      }
    }
  }

  .dialog-footer {
    text-align: right;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>