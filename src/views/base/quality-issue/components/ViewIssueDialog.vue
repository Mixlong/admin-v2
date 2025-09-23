<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="质量异常详情"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="view-issue-dialog"
    top="0vh">

    <div class="issue-detail">
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">基本信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">订单号：</label>
                <span class="info-value">{{ issueData.orderNo || '--' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">线号：</label>
                <span class="info-value">{{ issueData.productionLine || '--' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">日期：</label>
                <span class="info-value">{{ formatDate(issueData.issueDate) }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">不良数量：</label>
                <span class="info-value">{{ issueData.defectQuantity || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">生产数量：</label>
                <span class="info-value">{{ issueData.productionQuantity || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">不良率：</label>
                <span class="info-value">{{ issueData.defectRate || '0%' }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">异常状态：</label>
                <el-tag :type="getStatusType(issueData.exceptionStatus)">
                  {{ getStatusText(issueData.exceptionStatus) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">责任归属部门：</label>
                <span class="info-value">{{ issueData.responsibility || '--' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">机型：</label>
                <span class="info-value">{{ issueData.customerModel || '--' }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="issueData.materialNo">
            <el-col :span="8">
              <div class="info-item">
                <label class="info-label">物料编码：</label>
                <span class="info-value">{{ issueData.materialNo || '--' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </fieldset>

      <!-- 问题分析 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">问题分析</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">问题描述：</label>
                <div class="info-content" v-if="issueData.problemDescription">
                  <div v-html="issueData.problemDescription"></div>
                </div>
                <span class="info-value" v-else>--</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="issueData.causeAnalysis">
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">原因分析：</label>
                <div class="info-content" v-if="issueData.causeAnalysis">
                  <div v-html="issueData.causeAnalysis"></div>
                </div>
                <span class="info-value" v-else>--</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </fieldset>

      <!-- 处理信息 -->
      <fieldset class="form-fieldset" v-if="showProcessInfo">
        <legend class="fieldset-legend">处理信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20" v-if="issueData.temporaryMeasures">
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">临时措施：</label>
                <div class="info-content">{{ issueData.temporaryMeasures }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="issueData.longTermImprovement">
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">长期改善对策：</label>
                <div class="info-content">{{ issueData.longTermImprovement }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="issueData.effectConfirmation">
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">确认效果：</label>
                <div class="info-content">{{ issueData.effectConfirmation }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </fieldset>

      <!-- 附件信息 -->
      <fieldset class="form-fieldset" v-if="issueData.problemImages && issueData.problemImages.trim()">
        <legend class="fieldset-legend">问题图片</legend>
        <div class="fieldset-content">
          <div class="image-gallery">
            <el-image
              v-for="(imageUrl, index) in imageList"
              :key="index"
              :src="imageUrl"
              :preview-src-list="imageList"
              class="gallery-image"
              fit="cover"
              lazy>
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
                <span>加载失败</span>
              </div>
            </el-image>
          </div>
        </div>
      </fieldset>

      <!-- 时间信息 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">时间信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">创建时间：</label>
                <span class="info-value">{{ formatDateTime(issueData.createTime) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">更新时间：</label>
                <span class="info-value">{{ formatDateTime(issueData.updateTime) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </fieldset>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit" v-if="canEdit">编辑</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ViewIssueDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    issueData: {
      type: Object,
      default: () => ({})
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    // 是否显示处理信息
    showProcessInfo() {
      return this.issueData.temporaryMeasures ||
             this.issueData.longTermImprovement ||
             this.issueData.effectConfirmation
    },

    // 处理图片列表
    imageList() {
      if (!this.issueData.problemImages) return []

      try {
        // 处理逗号分隔的图片URLs
        const urls = this.issueData.problemImages.split(',').map(url => url.trim()).filter(url => url)
        return urls
      } catch (error) {
        console.error('解析图片列表失败:', error)
        return []
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        // 重置滚动条到顶部
        this.$nextTick(() => {
          const dialogBody = document.querySelector('.view-issue-dialog .el-dialog__body')
          if (dialogBody) {
            dialogBody.scrollTop = 0
          }
        })
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
    },

    // 编辑
    handleEdit() {
      this.$emit('edit', this.issueData)
      this.dialogVisible = false
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        1: 'warning', // 待处理
        2: 'primary', // 处理中
        3: 'success', // 已完善
        4: 'info' // 已确认
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '待处理',
        2: '处理中',
        3: '已完善',
        4: '已确认'
      }
      return statusMap[status] || '未知'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return date.split(' ')[0] // 只显示日期部分
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      return dateTime
    },

  }
}
</script>

<style lang="scss" scoped>
.view-issue-dialog {
  .issue-detail {
    padding: 0;
  }

  .dialog-footer {
    text-align: right;
    padding: 20px 0 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;
  }
}

// 字段集样式
.form-fieldset {
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
  border-radius: 4px;

  .fieldset-legend {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    padding: 0 10px;
  }

  .fieldset-content {
    padding: 20px;
  }
}

// 信息项样式
.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;

  .info-label {
    font-weight: 500;
    color: #333;
    min-width: 120px;
    flex-shrink: 0;
    line-height: 1.5;
  }

  .info-value {
    color: #606266;
    flex: 1;
    line-height: 1.5;
  }

  .info-content {
    flex: 1;
    color: #606266;
    line-height: 1.6;

    // 富文本内容样式
    ::v-deep {
      p {
        margin: 0 0 8px 0;
        line-height: 1.6;
      }

      ul, ol {
        margin: 0 0 8px 0;
        padding-left: 20px;

        li {
          margin: 4px 0;
          line-height: 1.5;
        }
      }

      strong {
        font-weight: bold;
      }

      em {
        font-style: italic;
      }
    }
  }
}

// 图片画廊样式
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 8px;
}

.gallery-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
  }
}

// 图片加载失败样式
.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 12px;

  i {
    font-size: 24px;
    margin-bottom: 4px;
  }
}

// 状态标签样式调整
.el-tag {
  margin-left: 0;
}
</style>

<!-- 全局样式 -->
<style lang="scss">
.view-issue-dialog {
  .el-dialog__body {
    max-height: 75vh;
    overflow-y: auto;
    padding: 20px;
  }
}
</style>