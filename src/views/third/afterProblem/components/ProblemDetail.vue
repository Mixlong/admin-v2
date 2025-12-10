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
      <!-- 问题点 -->
      <el-descriptions
        title="问题点"
        :column="2"
        border
        :label-style="labelStyle"
      >
        <el-descriptions-item label="问题来源">
          <div class="flex align-center" v-if="afterSaleInfo">
            <el-link type="primary" @click="viewAfterSale(detailData.problemSource)">
              {{ afterSaleInfo.sn }}
            </el-link>
            <span style="margin-left: 8px; color: #909399; font-size: 12px;">
              {{ afterSaleInfo.customerName }}
            </span>
          </div>
          <span v-else>{{ detailData.problemSourceSn || detailData.problemSource || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="时间点">
          {{ parseTime(detailData.problemTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">
          <div class="text-content" v-html="detailData.problemDescription || '-'"></div>
          <el-link 
            v-if="hasBusinessRecords"
            type="primary" 
            :underline="false"
            @click="handleViewBusinessRecords"
            style="margin-top: 5px; font-size: 12px;"
          >
            {{ getBusinessLinkText(detailData.problemSource) }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 迪太研发&品质 -->
      <el-descriptions
        title="迪太研发&品质"
        :column="1"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="问题分析（过程）">
          <div class="text-content" v-html="detailData.problemAnalysis || '-'"></div>
        </el-descriptions-item>
        <el-descriptions-item label="分析结果">
          <div class="text-content" v-html="detailData.analysisResult || '-'"></div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 对策 -->
      <el-descriptions
        title="对策"
        :column="1"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="影响面">
          <div class="text-content" v-html="detailData.impactScope || '-'"></div>
        </el-descriptions-item>
        <el-descriptions-item label="内部对策">
          <div class="text-content" v-html="detailData.internalMeasures || '-'"></div>
        </el-descriptions-item>
        <el-descriptions-item label="外部对策">
          <div class="text-content" v-html="detailData.externalMeasures || '-'"></div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 改善跟踪 -->
      <el-descriptions
        title="改善跟踪"
        :column="2"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="责任人">
          {{ detailData.responsiblePerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ parseTime(detailData.completionTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="效果确认" :span="2">
          <div class="text-content" v-html="detailData.effectivenessConfirmation || '-'"></div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 分析报告 -->
      <el-descriptions
        title="分析报告"
        :column="2"
        border
        class="margin-top"
        :label-style="labelStyle"
      >
        <el-descriptions-item label="是否需要报告">
          <el-tag :type="detailData.needReport === 1 ? 'success' : 'info'" size="small">
            {{ detailData.needReport === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分析报告文件">
          <div v-if="detailData.needReport === 1 && detailData.reportFile">
            <div v-for="(file, index) in reportFileList" :key="index" class="file-item">
              <i class="el-icon-document"></i>
              <span class="file-name">{{ file.name }}</span>
              <div class="file-actions">
                <el-link 
                  type="primary"
                  :underline="false"
                  @click="handlePreview(file)"
                >
                  <i class="el-icon-view"></i> 预览
                </el-link>
                <el-link 
                  type="primary"
                  :underline="false"
                  style="margin-left: 10px;"
                  @click="urlDownload(file.url)"
                >
                  <i class="el-icon-download"></i> 下载
                </el-link>
              </div>
            </div>
          </div>
          <span v-else-if="detailData.needReport === 1">未上传</span>
          <span v-else>-</span>
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
          <div class="flex align-center" style="flex-wrap: wrap; gap: 8px;">
            <el-tag
              v-for="(id, index) in detailData.afterNewIdList"
              :key="index"
              type="info"
              size="small"
            >
              {{ id }}
            </el-tag>
          </div>
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

    <!-- 售后记录选择器 -->
    <AfterSaleRecordSelector
      :visible.sync="afterSaleDialogVisible"
      :after-problem-id="detailData.id"
      :view-only="true"
    />

    <!-- 制程记录选择器 -->
    <ProductionRecordSelector
      :visible.sync="productionDialogVisible"
      :after-problem-id="detailData.id"
      :view-only="true"
    />

    <!-- 品质记录选择器 -->
    <QualityRecordSelector
      :visible.sync="qualityDialogVisible"
      :after-problem-id="detailData.id"
      :view-only="true"
    />

    <!-- 文件预览 -->
    <FilePreview
      :visible.sync="previewVisible"
      :file-url="previewFileUrl"
      :file-name="previewFileName"
    />
  </el-dialog>
</template>

<script>
import { afterInfo } from "@/api/third/sale";
import { urlDownload } from "@/utils";
import AfterSaleRecordSelector from "./AfterSaleRecordSelector";
import ProductionRecordSelector from "./ProductionRecordSelector";
import QualityRecordSelector from "./QualityRecordSelector";
import FilePreview from "@/components/FilePreview";

export default {
  name: "ProblemDetail",
  components: {
    AfterSaleRecordSelector,
    ProductionRecordSelector,
    QualityRecordSelector,
    FilePreview
  },
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
      afterSaleInfo: null, // 关联的售后记录信息
      // 选择器对话框显示状态
      afterSaleDialogVisible: false,
      productionDialogVisible: false,
      qualityDialogVisible: false,
      // 文件预览
      previewVisible: false,
      previewFileUrl: "",
      previewFileName: "",
      labelStyle: {
        width: '140px',
        textAlign: 'center',
        fontWeight: '600',
        backgroundColor: '#F5F7FA'
      }
    };
  },
  computed: {
    /** 是否有关联记录 */
    hasBusinessRecords() {
      return this.businessIdList && this.businessIdList.length > 0;
    },
    /** 关联记录ID列表 */
    businessIdList() {
      if (!this.detailData) return [];
      
      // 优先使用 businessIdList
      if (this.detailData.businessIdList) {
        if (Array.isArray(this.detailData.businessIdList)) {
          return this.detailData.businessIdList;
        }
        // 如果是字符串，尝试解析
        if (typeof this.detailData.businessIdList === 'string') {
          try {
            // 先尝试 JSON 解析
            return JSON.parse(this.detailData.businessIdList);
          } catch (e) {
            // JSON 解析失败，尝试逗号分隔
            return this.detailData.businessIdList.split(',').map(id => id.trim()).filter(Boolean);
          }
        }
      }
      
      // 其次使用 businessIds
      if (this.detailData.businessIds) {
        if (Array.isArray(this.detailData.businessIds)) {
          return this.detailData.businessIds;
        }
        // 如果是字符串，尝试解析
        if (typeof this.detailData.businessIds === 'string') {
          try {
            // 先尝试 JSON 解析
            return JSON.parse(this.detailData.businessIds);
          } catch (e) {
            // JSON 解析失败，尝试逗号分隔
            return this.detailData.businessIds.split(',').map(id => id.trim()).filter(Boolean);
          }
        }
      }
      
      return [];
    },
    /** 报告文件列表 */
    reportFileList() {
      if (!this.detailData.reportFile) return [];
      
      // reportFile 是逗号分隔的文件URL字符串
      const fileUrls = this.detailData.reportFile.split(',').filter(Boolean);
      
      return fileUrls.map(url => {
        // 从URL中提取文件名
        const fileName = url.split('/').pop() || '分析报告';
        return {
          url: url,
          name: decodeURIComponent(fileName)
        };
      });
    }
  },
  methods: {
    /** 打开详情 */
    open(row) {
      // 直接使用列表数据，不再调用详情接口
      this.detailData = { ...row };
      
      // 处理 afterNewIdList
      if (this.detailData.afterNewIdList && typeof this.detailData.afterNewIdList === 'string') {
        try {
          this.detailData.afterNewIdList = JSON.parse(this.detailData.afterNewIdList);
        } catch (e) {
          this.detailData.afterNewIdList = [];
        }
      }
      
      // 加载关联的售后记录信息
      if (this.detailData.problemSource) {
        this.loadAfterSaleInfo(this.detailData.problemSource);
      }
    },

    /** 加载售后记录信息 */
    async loadAfterSaleInfo(afterSaleId) {
      try {
        const { data } = await afterInfo(afterSaleId);
        this.afterSaleInfo = data;
      } catch (error) {
        console.error("加载售后记录信息失败:", error);
        this.afterSaleInfo = null;
      }
    },

    /** 查看售后详情 */
    viewAfterSale(afterSaleId) {
      // 跳转到售后详情页面或打开售后详情弹窗
      this.$router.push({
        path: '/third/afterSale',
        query: { id: afterSaleId }
      });
    },

    /** 获取业务记录链接文本 */
    getBusinessLinkText(source) {
      const linkMap = {
        '1': '查看售后记录',
        '2': '查看制程记录',
        '3': '查看品质记录'
      };
      return linkMap[String(source)] || '查看关联记录';
    },

    /** 查看业务记录 */
    handleViewBusinessRecords() {
      console.log('[详情页] 查看业务记录, 问题ID:', this.detailData.id);
      console.log('[详情页] 问题来源:', this.detailData.problemSource);
      
      // 根据问题来源打开对应的对话框
      const source = String(this.detailData.problemSource);
      if (source === '1') {
        this.afterSaleDialogVisible = true;
      } else if (source === '2') {
        this.productionDialogVisible = true;
      } else if (source === '3') {
        this.qualityDialogVisible = true;
      }
    },

    /** 预览文件 */
    handlePreview(file) {
      // 所有支持的文件类型都使用预览组件
      this.previewFileUrl = file.url;
      this.previewFileName = file.name;
      this.previewVisible = true;
    },

    /** 关闭对话框 */
    close() {
      this.$emit("update:visible", false);
      this.detailData = {};
      this.afterSaleInfo = null;
      // 关闭所有选择器对话框
      this.afterSaleDialogVisible = false;
      this.productionDialogVisible = false;
      this.qualityDialogVisible = false;
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

// Flex布局样式
.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
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

// 文件项样式
.file-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  
  > i {
    color: #409eff;
    font-size: 16px;
    flex-shrink: 0;
  }

  .file-name {
    margin-left: 8px;
    flex: 1;
    color: #303133;
    font-size: 14px;
  }

  .file-actions {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
  
  & + .file-item {
    border-top: 1px dashed #e4e7ed;
    margin-top: 5px;
    padding-top: 10px;
  }
}
</style>

