<template>
  <el-dialog
    title="售后问题处理详情"
    :visible="visible"
    width="1000px"
    append-to-body
    center
    top="0vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <div v-loading="loading" class="detail-container">
      <!-- 基本信息 -->
      <el-descriptions
        title="基本信息"
        :column="3"
        border
        :label-style="labelStyle"
      >
        <el-descriptions-item label="问题来源">
          {{ detailData.problemSource || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="时间点">
          {{ parseTime(detailData.problemTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="责任人">
          {{ detailData.responsiblePerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="3">
          {{ detailData.problemDescription || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="影响面" :span="3">
          {{ detailData.impactScope || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 分析信息 -->
      <el-descriptions
        title="分析信息"
        :column="1"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="问题分析（过程）">
          <div class="text-content">{{ detailData.problemAnalysis || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="分析结果">
          <div class="text-content">{{ detailData.analysisResult || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 对策信息 -->
      <el-descriptions
        title="对策信息"
        :column="2"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="内部对策">
          <div class="text-content">{{ detailData.internalMeasures || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="外部对策">
          <div class="text-content">{{ detailData.externalMeasures || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 效果确认 -->
      <el-descriptions
        title="效果确认"
        :column="2"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="效果确认">
          <div class="text-content">{{ detailData.effectivenessConfirmation || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ parseTime(detailData.completionTime) || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联售后 -->
      <el-descriptions
        v-if="detailData.afterNewIdList && detailData.afterNewIdList.length > 0"
        title="关联新售后"
        :column="1"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="新售后ID列表">
          <el-tag
            v-for="(id, index) in detailData.afterNewIdList"
            :key="index"
            type="info"
            size="small"
            class="margin-right-xs"
          >
            {{ id }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 创建信息 -->
      <el-descriptions
        title="创建信息"
        :column="2"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="创建人">
          {{ detailData.createBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(detailData.createTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新人">
          {{ detailData.updateBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(detailData.updateTime) || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>
</template>

<script>
import { afterProblemDetail } from "@/api/third/afterProblem";

export default {
  name: "ProblemDetail",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      detailData: {},
      labelStyle: {
        width: '140px',
        textAlign: 'center',
        fontWeight: '600',
        backgroundColor: '#F5F7FA'
      }
    };
  },
  methods: {
    /** 打开详情 */
    async open(id) {
      this.loading = true;
      try {
        const { data } = await afterProblemDetail(id);
        this.detailData = data || {};
        
        // 处理 afterNewIdList
        if (this.detailData.afterNewIdList && typeof this.detailData.afterNewIdList === 'string') {
          try {
            this.detailData.afterNewIdList = JSON.parse(this.detailData.afterNewIdList);
          } catch (e) {
            this.detailData.afterNewIdList = [];
          }
        }
      } catch (error) {
        console.error("获取详情失败:", error);
        this.msgError("获取详情失败");
      } finally {
        this.loading = false;
      }
    },

    /** 关闭对话框 */
    close() {
      this.$emit("update:visible", false);
      this.detailData = {};
    }
  }
};
</script>

<style lang="scss" scoped>
.detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.margin-top {
  margin-top: 20px;
}

.margin-right-xs {
  margin-right: 5px;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

::v-deep .el-descriptions__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #DCDFE6;
}

::v-deep .el-descriptions-item__content {
  word-break: break-word;
}
</style>

