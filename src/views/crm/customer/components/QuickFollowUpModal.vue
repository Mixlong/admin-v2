<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title=""
    width="600px"
    center
    :before-close="handleClose"
    class="quick-followup-dialog"
    :show-close="false"
    :close-on-click-modal="false"
  >
    <!-- 头部操作栏 -->
    <div class="dialog-header">
      <div class="header-left">
        <el-button size="small">多操作</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus">
          从客户添加
        </el-button>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-arrow-right" size="small" circle />
        <el-button icon="el-icon-full-screen" size="small" circle />
        <el-button icon="el-icon-close" size="small" circle @click="handleClose" />
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="followup-tabs">
      <!-- 快速跟进 -->
      <el-tab-pane label="快速跟进" name="quick">
        <div class="quick-followup-content">
          <!-- 跟进记录输入 -->
          <div class="input-section">
            <el-input
              v-model="followUpContent"
              type="textarea"
              :rows="3"
              placeholder="请填写跟进记录"
              class="followup-input"
            />
          </div>

          <!-- 搜索框 -->
          <div class="search-section">
            <el-input
              v-model="searchText"
              placeholder="搜索跟进记录"
              prefix-icon="el-icon-search"
              clearable
              class="search-input"
            />
          </div>

          <!-- 跟进记录列表 -->
          <div class="followup-list">
            <div
              v-for="item in filteredFollowUpList"
              :key="item.id"
              class="followup-record"
            >
              <div class="record-header">
                <div class="user-info">
                  <el-avatar :size="32" class="user-avatar">
                    {{ item.user.charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ item.user }}</div>
                    <div class="record-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>

              <div class="record-content">
                <div class="content-text">{{ item.content }}</div>
                <div class="follow-method">
                  <span class="method-label">跟进方式：</span>
                  <span class="method-value">{{ item.method }}</span>
                </div>
                <div class="record-actions">
                  <el-button type="text" size="small">查看</el-button>
                  <el-button type="text" size="small">编辑</el-button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="filteredFollowUpList.length === 0"
              description="暂无跟进记录"
              :image-size="80"
            />
          </div>

          <!-- 底部操作按钮 -->
          <div class="bottom-actions">
            <el-button type="primary" @click="handleSaveFollowUp">
              保存跟进记录
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 数据日志 -->
      <el-tab-pane label="数据日志" name="logs">
        <div class="logs-content">
          <el-timeline>
            <el-timeline-item
              v-for="log in dataLogs"
              :key="log.id"
              :timestamp="log.time"
              placement="top"
            >
              <div class="log-item">
                <div class="log-user">{{ log.user }}</div>
                <div class="log-action">{{ log.action }}</div>
                <div class="log-details" v-if="log.details">{{ log.details }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>

          <el-empty
            v-if="dataLogs.length === 0"
            description="暂无数据日志"
            :image-size="80"
          />
        </div>
      </el-tab-pane>

      <!-- 评论 -->
      <el-tab-pane label="评论" name="comments">
        <div class="comments-content">
          <!-- 评论输入 -->
          <div class="comment-input-section">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="添加评论..."
              class="comment-input"
            />
            <div class="comment-actions">
              <el-button type="primary" size="small" @click="handleAddComment">
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <el-avatar :size="28" class="comment-avatar">
                  {{ comment.user.charAt(0) }}
                </el-avatar>
                <div class="comment-meta">
                  <div class="comment-user">{{ comment.user }}</div>
                  <div class="comment-time">{{ comment.time }}</div>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>

          <el-empty
            v-if="comments.length === 0"
            description="暂无评论"
            :image-size="80"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
export default {
  name: 'QuickFollowUpModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activeTab: 'quick',
      followUpContent: '',
      searchText: '',
      commentContent: '',

      // 跟进记录列表
      followUpList: [
        {
          id: '1',
          user: '张工',
          time: '2025-08-25 18:01',
          content: '初次电话联系，了解客户基本需求，客户对工业自动化解决方案表示兴趣',
          method: '电话沟通'
        },
        {
          id: '2',
          user: '李经理',
          time: '2025-08-24 14:30',
          content: '现场拜访客户，详细介绍产品功能和技术优势，客户反馈积极',
          method: '线下拜访'
        },
        {
          id: '3',
          user: '王助理',
          time: '2025-08-23 10:15',
          content: '通过微信发送产品资料和报价单，客户表示需要内部讨论',
          method: '微信沟通'
        }
      ],

      // 数据日志
      dataLogs: [
        {
          id: '1',
          user: '系统',
          time: '2025-08-25 18:01',
          action: '创建客户记录',
          details: '客户信息初始化完成'
        },
        {
          id: '2',
          user: '张工',
          time: '2025-08-25 16:30',
          action: '更新客户状态',
          details: '从"潜在客户"更改为"意向客户"'
        },
        {
          id: '3',
          user: '李经理',
          time: '2025-08-24 14:30',
          action: '添加跟进记录',
          details: '记录客户拜访情况'
        }
      ],

      // 评论列表
      comments: [
        {
          id: '1',
          user: '张工',
          time: '2025-08-25 18:01',
          content: '这个客户很有潜力，建议重点跟进'
        },
        {
          id: '2',
          user: '李经理',
          time: '2025-08-24 14:30',
          content: '客户对我们的产品很感兴趣，可以安排技术交流'
        }
      ]
    }
  },

  computed: {
    // v-model for dialog visibility
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },

    // 计算属性 - 过滤跟进记录
    filteredFollowUpList() {
      if (!this.searchText) {
        return this.followUpList
      }

      const search = this.searchText.toLowerCase()
      return this.followUpList.filter(item =>
        item.content.toLowerCase().includes(search) ||
        item.user.toLowerCase().includes(search) ||
        item.method.toLowerCase().includes(search)
      )
    }
  },

  methods: {
    handleClose() {
      this.dialogVisible = false
      // 重置表单
      this.followUpContent = ''
      this.searchText = ''
      this.commentContent = ''
      this.activeTab = 'quick'
    },

    handleSaveFollowUp() {
      if (!this.followUpContent.trim()) {
        this.$message.warning('请填写跟进记录')
        return
      }

      // 添加新的跟进记录
      const newRecord = {
        id: Date.now().toString(),
        user: '当前用户', // 这里应该是当前登录用户
        time: new Date().toLocaleString('zh-CN'),
        content: this.followUpContent,
        method: '系统记录' // 这里可以让用户选择跟进方式
      }

      this.followUpList.unshift(newRecord)
      this.followUpContent = ''

      this.$message.success('跟进记录保存成功')
      this.$emit('refresh')
    },

    handleAddComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }

      // 添加新评论
      const newComment = {
        id: Date.now().toString(),
        user: '当前用户', // 这里应该是当前登录用户
        time: new Date().toLocaleString('zh-CN'),
        content: this.commentContent
      }

      this.comments.unshift(newComment)
      this.commentContent = ''

      this.$message.success('评论发表成功')
    }
  }
}
</script>

<style scoped>
.quick-followup-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.quick-followup-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.quick-followup-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 75vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.header-left {
  display: flex;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 4px;
}

.followup-tabs {
  padding: 0 20px;
}

.followup-tabs :deep(.el-tabs__header) {
  margin: 0 0 20px 0;
}

.quick-followup-content {
  min-height: 500px;
}

.input-section {
  margin-bottom: 16px;
}

.followup-input :deep(.el-textarea__inner) {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  max-width: 300px;
}

.followup-list {
  max-height: 400px;
  overflow-y: auto;
}

.followup-record {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
}

.record-header {
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: #1890ff;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.record-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.record-content {
  padding-left: 44px;
}

.content-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
  font-size: 14px;
}

.follow-method {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.method-label {
  color: #999;
}

.method-value {
  color: #666;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.bottom-actions {
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

/* 数据日志样式 */
.logs-content {
  min-height: 400px;
  padding: 20px 0;
}

.log-item {
  padding: 8px 0;
}

.log-user {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.log-action {
  color: #666;
  margin-top: 4px;
  font-size: 13px;
}

.log-details {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

/* 评论样式 */
.comments-content {
  min-height: 400px;
}

.comment-input-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 16px;
}

.comment-input {
  margin-bottom: 8px;
}

.comment-actions {
  text-align: right;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-avatar {
  background: #52c41a;
}

.comment-user {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  color: #666;
  line-height: 1.5;
  font-size: 14px;
  padding-left: 36px;
}
</style>