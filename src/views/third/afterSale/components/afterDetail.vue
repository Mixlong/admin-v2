<template>
  <el-dialog
    class="after-detail-box dialog-scroll"
    :visible="visible"
    width="1200px"
    append-to-body
    center
    top="0vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <template slot="title">
      <div>
        <h2>{{ mainTitle }}</h2>
        <span>{{ detailInfo.returnDate }}</span>
      </div>
    </template>
    <el-descriptions
      title="基本信息"
      :colon="false"
      :column="3"
      :label-style="{ width: '120px', textAlign: 'center' }"
      border
    >
      <!-- 第一行：客退日期、客户名称、迪太接收人 -->
      <el-descriptions-item label="客退日期">
        {{ detailInfo.returnDate }}
      </el-descriptions-item>
      <el-descriptions-item label="客户名称">
        {{ detailInfo.customerName }}
      </el-descriptions-item>
      <el-descriptions-item label="迪太接收人">
        {{ detailInfo.receiveName }}
      </el-descriptions-item>

      <!-- 第二行：客退类型、客诉现象、客退单号 -->
      <el-descriptions-item label="客退类型">
        {{
          detailInfo.afterType === 1
            ? "大货"
            : detailInfo.afterType === 2
            ? "样品"
            : "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="客诉现象">
        {{ detailInfo.result || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="客退单号">
        {{ detailInfo.logisticsNo || "-" }}
      </el-descriptions-item>

      <!-- 第三行：发生阶段、客退清单、是否到付件 -->
      <el-descriptions-item label="发生阶段">
        {{ detailInfo.generatorStage || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="客退清单">
        {{ formatInventory(detailInfo.inventory) }}
      </el-descriptions-item>
      <el-descriptions-item label="是否到付件">
        {{ detailInfo.isFreight === 0 ? "是" : "否" }}
      </el-descriptions-item>

      <!-- 第四行：客退方、客退方信息（占2列） -->
      <el-descriptions-item label="客退方">
        {{ detailInfo.returnParty || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="客退方信息" :span="2">
        {{ detailInfo.returnName }} / {{ detailInfo.returnPhone }} -
        {{ detailInfo.returnAddress }}
      </el-descriptions-item>

      <el-descriptions-item label="处理类型">
        {{ detailInfo.processType || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="品类">
        {{ detailInfo.categoryName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="仪表型号">
        {{ detailInfo.computerName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="产品SN">
        {{ detailInfo.sn || "-" }}
      </el-descriptions-item>

      <!-- 问题状态 -->
      <el-descriptions-item label="问题状态">
        <el-tag v-if="detailInfo.status === 0" type="danger">OPEN</el-tag>
        <el-tag v-else-if="detailInfo.status === 1" type="success"
          >CLOSE</el-tag
        >
      </el-descriptions-item>
      <el-descriptions-item label="处理时效(h)">
        {{ detailInfo.processingTime || "-" }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="isLogisticsShow"
      class="margin-top-sm"
      title="返还信息"
      :colon="false"
      :column="3"
      :label-style="{ width: '120px', textAlign: 'center' }"
      border
    >
      <el-descriptions-item label="返回日期">
        {{ isReturnDate }}
      </el-descriptions-item>
      <el-descriptions-item label="寄件人">
        {{ detailInfo.logistics.sender }}
      </el-descriptions-item>
      <el-descriptions-item label="寄件单号">
        {{ detailInfo.logistics.mailingNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="收件人">
        {{ detailInfo.logistics.recipient }}
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">
        {{ detailInfo.logistics.phone }}
      </el-descriptions-item>
      <el-descriptions-item label="收件地址" :span="3">
        {{ detailInfo.logistics.address }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      class="margin-top-sm"
      title="问题分析与对策"
      :colon="false"
      :column="3"
      :label-style="{ width: '120px', textAlign: 'center' }"
      border
    >
      <el-descriptions-item label="一级问题">
        {{ detailInfo.confirmMajorClass || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="二级问题">
        {{ detailInfo.confirmMinorClass || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="分析负责人">
        {{ detailInfo.locationAnalyst || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="一级责任">
        {{ detailInfo.parentResponsibilityPerson }}
      </el-descriptions-item>
      <el-descriptions-item label="二级责任">
        {{ detailInfo.responsibilityPerson }}
      </el-descriptions-item>
      <el-descriptions-item label="处理完成时间">
        {{ detailInfo.locationHandleTime || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="改善责任人">
        {{ detailInfo.problemResponsiblePerson || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="完成时间">
        {{ detailInfo.completionTime || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="3">
        {{ detailInfo.locationRemark || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="定位结果" :span="3">
        <RichTextDisplay
          :content="detailInfo.locationResult"
          max-height="200px"
          placeholder="-"
        />
      </el-descriptions-item>
      <el-descriptions-item label="发生原因" :span="3">
        <RichTextDisplay
          :content="detailInfo.analysisCause"
          max-height="2000px"
          placeholder="-"
        />
      </el-descriptions-item>
      <el-descriptions-item label="流出原因" :span="3">
        <RichTextDisplay
          :content="detailInfo.analysisOutflowCause"
          max-height="2000px"
          placeholder="-"
        />
      </el-descriptions-item>
      <el-descriptions-item label="内部对策" :span="3">
        <RichTextDisplay
          :content="detailInfo.internalMeasures"
          max-height="2000px"
          placeholder="-"
        />
      </el-descriptions-item>
      <el-descriptions-item label="外部对策" :span="3">
        <RichTextDisplay
          :content="detailInfo.externalMeasures"
          max-height="200px"
          placeholder="-"
        />
      </el-descriptions-item>
      <el-descriptions-item label="问题照片" :span="3">
        <preview-img
          v-show="detailInfo.file"
          width="80px"
          height="80px"
          class="margin-right-sm"
          v-for="(item, index) in checkListArr(detailInfo.file)"
          :key="index"
          :url="item"
          :srcList="[item]"
        />
        <span v-if="!detailInfo.file">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="问题视频" :span="3">
        <el-upload-sortable
          v-show="detailInfo.video"
          v-model="detailInfo.video"
          :isVideo="true"
          isDisabled
          :max="videoListLen(detailInfo.video)"
          accept="video/mp4"
          :imgW="150"
          :imgH="98"
        />
        <span v-if="!detailInfo.video">-</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script>
import { afterInfo } from "@/api/third/sale";
import ElUploadSortable from "@/components/el-upload-sortable";
import RichTextDisplay from "@/components/RichTextDisplay";
import globalData from "../mixins/global";
import { formattedTime } from "@/utils/ruoyi";

export default {
  mixins: [globalData],
  components: {
    ElUploadSortable,
    RichTextDisplay,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    detailId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      detailInfo: {
        logistics: {},
      },
    };
  },
  computed: {
    mainTitle() {
      if (this.detailInfo.id) {
        const { customerName, categoryName, computerName } = this.detailInfo;
        return `${customerName}${categoryName}（${computerName}）售后详情`;
      }
    },
    checkListArr() {
      return (list, type) => {
        if (!this.Is_Empty(list)) {
          let listArr = list.split(",");
          return type === 1 ? listArr[0] : listArr;
        }
      };
    },
    videoListLen() {
      return (video) => {
        if (!this.Is_Empty(video)) return this.checkListArr(video).length;
      };
    },
    isLogisticsShow() {
      return !this.Is_Empty(this.detailInfo.logistics);
    },
    isReturnDate() {
      const { returnDate } = this.detailInfo.logistics || {};
      return returnDate ? this.moment(returnDate).format("YYYY-MM-DD") : "";
    },
  },
  methods: {
    formattedTime,
    close() {
      this.$emit("update:visible", false);
    },
    async getAfterInfo(detailId, item) {
      try {
        if (item) {
          this.detailInfo = { ...item };
        }
        const { data } = await afterInfo(detailId);
        // 详情接口字段不全时，保留列表中的数据
        this.detailInfo = { ...data, ...this.detailInfo };
      } catch (error) {
        console.error(error);
      }
    },
    // 格式化客退清单显示
    formatInventory(inventory) {
      if (!inventory) return "";

      // 如果是数组，直接用顿号连接
      if (Array.isArray(inventory)) {
        return inventory.join("、");
      }

      // 如果是字符串，尝试解析 JSON
      if (typeof inventory === "string") {
        try {
          const parsed = JSON.parse(inventory);
          if (Array.isArray(parsed)) {
            return parsed.join("、");
          }
          return inventory;
        } catch (e) {
          // 不是 JSON 格式，直接返回
          return inventory;
        }
      }

      return inventory;
    },
    // 格式化责任判定显示（一级 / 二级）
    formatResponsibility(group, determination) {
      if (!group && !determination) return "-";
      if (group && determination) {
        return `${group} / ${determination}`;
      }
      return group || determination;
    },
  },
};
</script>

<style lang="scss" scoped>
.after-detail-box {
  // 统一所有描述列表的列宽
  /deep/ .el-descriptions {
    margin-bottom: 20px;

    table {
      table-layout: fixed;
      width: 100%;
    }

    .el-descriptions-item__label {
      width: 120px !important;
      min-width: 120px;
      max-width: 120px;
      background-color: #fafafa;
    }

    .el-descriptions-item__content {
      width: calc((100% - 360px) / 3) !important;
      word-break: break-word;
    }

    // 跨列的内容（如备注、富文本字段）
    .el-descriptions-item__cell[colspan="3"] {
      .el-descriptions-item__content {
        width: calc(100% - 120px) !important;
      }
    }
  }

  // 描述列表标题样式
  /deep/ .el-descriptions__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
