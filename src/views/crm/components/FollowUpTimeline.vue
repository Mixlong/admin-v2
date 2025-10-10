<template>
  <div class="followup-timeline">
    <div class="timeline-header">
      <h4>跟进记录</h4>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="showAddForm = true"
      >
        添加跟进
      </el-button>
    </div>

    <!-- 跟进记录时间线 -->
    <el-timeline class="mt-4">
      <el-timeline-item
        v-for="item in followUpList"
        :key="item.id"
        :timestamp="formatTime(item.createTime)"
        placement="top"
        :color="getTimelineColor(item.type)"
        :icon="getTimelineIcon(item.type)"
        size="large"
      >
        <el-card class="followup-card">
          <div class="followup-header">
            <div class="followup-title">
              <span class="followup-type">{{ getTypeText(item.type) }}</span>
              <span class="followup-subject">{{ item.subject }}</span>
            </div>
            <div class="followup-actions">
              <el-button
                type="primary"
                link
                size="small"
                icon="el-icon-edit"
                @click="editFollowUp(item)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                icon="el-icon-delete"
                @click="deleteFollowUp(item)"
              >
                删除
              </el-button>
            </div>
          </div>

          <div class="followup-content">
            <p>{{ item.content }}</p>
          </div>

          <div class="followup-meta">
            <div class="meta-item">
              <i class="el-icon-user"></i>
              <span>{{ item.creatorName }}</span>
            </div>
            <div v-if="item.contactName" class="meta-item">
              <i class="el-icon-phone"></i>
              <span>联系人：{{ item.contactName }}</span>
            </div>
            <div v-if="item.nextFollowUp" class="meta-item">
              <i class="el-icon-date"></i>
              <span>下次跟进：{{ formatDateTime(item.nextFollowUp) }}</span>
            </div>
          </div>

          <!-- 附件列表 -->
          <div v-if="item.attachments && item.attachments.length > 0" class="followup-attachments">
            <div class="attachments-title">
              <i class="el-icon-paperclip"></i>
              <span>附件 ({{ item.attachments.length }})</span>
            </div>
            <div class="attachments-list">
              <el-tag
                v-for="file in item.attachments"
                :key="file.id"
                class="attachment-tag"
                @click="downloadAttachment(file)"
              >
                {{ file.name }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 空状态 -->
      <el-empty
        v-if="followUpList.length === 0"
        description="暂无跟进记录"
        :image-size="100"
      />
    </el-timeline>

    <!-- 添加跟进弹框 -->
    <AddFollowUpModal
      :visible.sync="showAddForm"
      :customer-id="customerId"
      @refresh="getFollowUpList"
    />
  </div>
</template>

<script>
import AddFollowUpModal from '../customer/components/FollowUpModal.vue'

export default {
  name: 'FollowUpTimeline',
  components: {
    AddFollowUpModal
  },
  props: {
    customerId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      followUpList: [],
      showAddForm: false,
      loading: false
    }
  },
  mounted() {
    this.getFollowUpList()
  },
  methods: {
    async getFollowUpList() {
      this.loading = true
      try {
        // 模拟API调用
        const mockData = [
          {
            id: '1',
            type: 'call',
            subject: '了解采购需求',
            content: '与客户张总通话30分钟，了解到客户有ERP系统升级需求，预算在50-80万之间。客户比较关注系统稳定性和售后服务。',
            createTime: '2024-01-20 14:30',
            creatorName: '王销售',
            contactName: '张总',
            nextFollowUp: '2024-01-25 10:00',
            attachments: [
              { id: 'f1', name: '需求调研表.xlsx' },
              { id: 'f2', name: '产品介绍.pdf' }
            ]
          },
          {
            id: '2',
            type: 'visit',
            subject: '现场演示产品',
            content: '到客户公司进行产品演示，客户对我们的解决方案很满意，特别是库存管理模块。现场有5个人参与，包括IT部门和业务部门负责人。',
            createTime: '2024-01-18 15:00',
            creatorName: '李顾问',
            contactName: '张总',
            nextFollowUp: '',
            attachments: []
          },
          {
            id: '3',
            type: 'email',
            subject: '发送产品资料',
            content: '向客户发送了详细的产品介绍资料和报价单。邮件已确认送达，客户表示会在3个工作日内回复。',
            createTime: '2024-01-15 09:30',
            creatorName: '王销售',
            contactName: '李经理',
            nextFollowUp: '',
            attachments: [
              { id: 'f3', name: '产品报价单.xlsx' }
            ]
          }
        ]

        this.followUpList = mockData
      } finally {
        this.loading = false
      }
    },
    editFollowUp(item) {
      // TODO: 打开编辑弹框
      this.$message.info('编辑功能开发中')
    },
    async deleteFollowUp(item) {
      try {
        await this.$confirm(
          `确定要删除这条跟进记录吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // TODO: 调用删除API
        this.$message.success('删除成功')
        this.getFollowUpList()
      } catch {
        // 用户取消删除
      }
    },
    downloadAttachment(file) {
      // TODO: 实现文件下载
      this.$message.info('下载功能开发中')
    },
    getTypeText(type) {
      const typeMap = {
        call: '电话沟通',
        visit: '客户拜访',
        email: '邮件往来',
        meeting: '会议讨论',
        other: '其他'
      }
      return typeMap[type] || type
    },
    getTimelineColor(type) {
      const colorMap = {
        call: '#67c23a',
        visit: '#409eff',
        email: '#e6a23c',
        meeting: '#f56c6c',
        other: '#909399'
      }
      return colorMap[type] || '#909399'
    },
    getTimelineIcon(type) {
      // 这里可以返回不同的图标类名
      return 'el-icon-phone'
    },
    formatTime(time) {
      return new Date(time).toLocaleString('zh-CN')
    },
    formatDateTime(datetime) {
      if (!datetime) return ''
      return new Date(datetime).toLocaleString('zh-CN', {
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
.followup-timeline {
  padding: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeline-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.followup-card {
  margin-left: 8px;
}

.followup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.followup-title {
  flex: 1;
}

.followup-type {
  display: inline-block;
  background: #f0f2f5;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.followup-subject {
  font-weight: 500;
  font-size: 14px;
}

.followup-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #666;
}

.followup-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.followup-attachments {
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.attachments-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.attachment-tag:hover {
  background-color: #409eff;
  color: white;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #999;
}
</style>