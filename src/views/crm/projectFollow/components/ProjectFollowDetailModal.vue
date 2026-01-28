<template>
  <el-dialog
    title="项目跟进详情"
    :visible.sync="dialogVisible"
    width="900px"
    center
    :before-close="handleClose"
    class="project-follow-detail-dialog dialog-scroll"
    :close-on-click-modal="false"
    top="0vh"
  >
    <div v-if="projectFollow" class="project-follow-detail">
      <!-- 基本信息 -->
      <fieldset class="detail-fieldset">
        <legend>基本信息</legend>
        <div class="detail-item">
          <label>项目名称：</label>
          <span>{{ projectFollow.projectName || "-" }}</span>
        </div>

        <div class="detail-item">
          <label>客户简称：</label>
          <span>{{ projectFollow.customerName || "-" }}</span>
        </div>

        <!-- <div class="detail-item">
          <label>产品类型：</label>
          <span>{{ projectFollow.productType || "-" }}</span>
        </div> -->

        <div class="detail-item">
          <label>项目阶段：</label>
          <span>{{ getProjectNodeText(projectFollow.projectNode) }}</span>
        </div>

        <div class="detail-item">
          <label>需求总表链接：</label>
          <div class="detail-content">
            <a
              v-if="projectFollow.requirementLink"
              :href="projectFollow.requirementLink"
              target="_blank"
              class="link"
            >
              {{ projectFollow.requirementLink }}
            </a>
            <span v-else>-</span>
          </div>
        </div>
      </fieldset>

      <!-- 项目详情 -->
      <fieldset class="detail-fieldset">
        <legend>项目详情</legend>

        <div class="detail-item">
          <label>项目背景</label>
          <div class="detail-content">
            {{ projectFollow.projectBackground || "-" }}
          </div>
        </div>

        <div class="detail-item">
          <label>项目进度：</label>
          <div class="detail-content">
            {{ projectFollow.progress || "-" }}
          </div>
        </div>
      </fieldset>

      <!-- 系统信息 -->
      <fieldset class="detail-fieldset">
        <legend>系统信息</legend>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>销售经理：</label>
              <span>{{ projectFollow.createBy || "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>交付经理：</label>
              <span>{{ projectFollow.createBy || "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>创建时间：</label>
              <span>{{ formatDateTime(projectFollow.createTime) }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>更新者：</label>
              <span>{{ projectFollow.updateBy || "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>更新时间：</label>
              <span>{{ formatDateTime(projectFollow.updateTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ProjectFollowDetailModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    projectFollow: {
      type: Object,
      default: null,
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },

    handleEdit() {
      this.$emit("edit", this.projectFollow);
      this.handleClose();
    },

    // 项目阶段类型
    getProjectNodeType(projectNode) {
      const typeMap = {
        requirement: "primary", // 需求分析 - 蓝色
        design: "success", // 方案设计 - 绿色
        development: "warning", // 开发阶段 - 橙色
        testing: "danger", // 测试阶段 - 红色
        deployment: "info", // 部署上线 - 灰色
        acceptance: "success", // 验收完成 - 绿色
        finished: "", // 项目结束 - 默认
      };
      return typeMap[projectNode] || "primary";
    },

    // 项目阶段文本
    getProjectNodeText(projectNode) {
      const textMap = {
        requirement: "需求分析",
        design: "方案设计",
        development: "开发阶段",
        testing: "测试阶段",
        deployment: "部署上线",
        acceptance: "验收完成",
        finished: "项目结束",
      };
      return textMap[projectNode] || projectNode;
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return "-";
      return new Date(dateTime).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.project-follow-detail-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.project-follow-detail-dialog :deep(.el-dialog__body) {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.project-follow-detail {
  font-size: 14px;
}

.detail-fieldset {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.detail-fieldset legend {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 0 8px;
  margin-left: 8px;
  background: #fff;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  min-height: 32px;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
  min-width: 140px;
  width: 140px;
  margin-right: 12px;
  flex-shrink: 0;
  line-height: 32px;
  text-align: right;
}

.detail-item span {
  color: #303133;
  word-break: break-all;
  line-height: 32px;
}

.detail-content {
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  min-height: 60px;
  flex: 1;
}

.link {
  color: #409eff;
  text-decoration: none;
  line-height: 32px;
}

.link:hover {
  text-decoration: underline;
}

.dialog-footer {
  text-align: right;
}

/* Element UI 组件样式优化 */
.project-follow-detail-dialog :deep(.el-progress) {
  margin-top: 4px;
}

.project-follow-detail-dialog :deep(.el-tag) {
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-follow-detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item label {
    min-width: auto;
    margin-bottom: 4px;
    line-height: 1.4;
  }
}
</style>
