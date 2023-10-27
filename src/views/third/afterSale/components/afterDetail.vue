<template>
  <el-dialog
    class="after-detail-box"
    :visible="visible"
    width="1000px"
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
      direction="vertical"
      :colon="false"
      :column="4"
      border
    >
      <el-descriptions-item label="问题编号">{{
        detailInfo.reportNum
      }}</el-descriptions-item>
      <el-descriptions-item label="产品SN">{{
        detailInfo.sn
      }}</el-descriptions-item>
      <el-descriptions-item label="客退人">{{
        detailInfo.returnName
      }}</el-descriptions-item>
      <el-descriptions-item label="客退物流单号">{{
        detailInfo.logisticsNo
      }}</el-descriptions-item>
      <el-descriptions-item label="迪太接收人">{{
        detailInfo.receiveName
      }}</el-descriptions-item>
      <el-descriptions-item label="客诉现象">{{
        detailInfo.result
      }}</el-descriptions-item>
      <el-descriptions-item label="处理进展">
        <span v-if="detailInfo.state == 1" class="text-red">现象复测</span>
        <span v-if="detailInfo.state == 2" class="text-blue">分类处理</span>
        <span v-if="detailInfo.state == 3" class="text-cyan">问题处理</span>
        <span v-if="detailInfo.state == 4" class="text-orange">处理类型</span>
        <span v-if="detailInfo.state == 5" class="text-yellow">维修处理</span>
        <span v-if="detailInfo.state == 6" class="text-green">处理完成</span>
      </el-descriptions-item>
      <el-descriptions-item label="是否到附件">{{
        detailInfo.isFreight === 0 ? "是" : "否"
      }}</el-descriptions-item>
      <el-descriptions-item label="问题根因" :span="3">{{
        detailInfo.rootMatter
      }}</el-descriptions-item>
      <el-descriptions-item label="根因分类">{{
        directionLabel(rootClassify, detailInfo.rootMatterType)
      }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="isCustomerShow"
      class="margin-top-sm"
      title="返回客户信息"
      direction="vertical"
      :colon="false"
      :column="4"
      border
    >
      <el-descriptions-item label="返回日期">{{
        isReturnDate
      }}</el-descriptions-item>
      <el-descriptions-item label="寄件部门">{{
        detailInfo.logisticsEntity.mailingDepartment
      }}</el-descriptions-item>
      <el-descriptions-item label="寄件人">{{
        detailInfo.logisticsEntity.sender
      }}</el-descriptions-item>
      <el-descriptions-item label="处理周期">{{
        isTreat
      }}</el-descriptions-item>
      <el-descriptions-item label="收件人">{{
        detailInfo.logisticsEntity.recipient
      }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{
        detailInfo.logisticsEntity.phone
      }}</el-descriptions-item>
      <el-descriptions-item label="物流付款方式">{{
        detailInfo.isPay === 0 ? "月付" : "到付"
      }}</el-descriptions-item>
      <el-descriptions-item label="物流单号">{{
        detailInfo.mailingNumber
      }}</el-descriptions-item>
      <el-descriptions-item label="收件地址" :span="3">{{
        detailInfo.address
      }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      v-if="isAttachmentInfo"
      class="margin-top-sm"
      title="附件信息"
      direction="vertical"
      :colon="false"
      :column="1"
      border
    >
      <el-descriptions-item label="不良图片">
        <preview-img
          width="80px"
          height="80px"
          class="margin-right-sm"
          v-for="(item, index) in checkListArr(detailInfo.file)"
          :key="index"
          :url="item"
          :srcList="[item]"
        />
      </el-descriptions-item>
      <el-descriptions-item label="不良视频">
        <el-upload-sortable
          v-model="detailInfo.video"
          :isVideo="true"
          isDisabled
          :max="checkListArr(detailInfo.video).length"
          accept="video/mp4"
          :imgW="150"
          :imgH="98"
        />
      </el-descriptions-item>
      <el-descriptions-item label="8D报告文件">
        {{ detailInfo.report }}
        <el-button
          v-if="detailInfo.report"
          class="text-blue"
          type="text"
          @click="urlDownload(detailInfo.report)"
        >
          下载
        </el-button>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script>
import { afterInfo } from "@/api/third/sale";
import ElUploadSortable from "@/components/el-upload-sortable";

export default {
  components: {
    ElUploadSortable,
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
    rootClassify: Array,
    directionLabel: Function,
  },
  data() {
    return {
      detailInfo: {
        logisticsEntity: {},
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
        if (list) {
          let listArr = list.split(",");
          return type === 1 ? listArr[0] : listArr;
        }
      };
    },
    isAttachmentInfo() {
      const { file, video, report } = this.detailInfo;
      return !(!file && !video && !report);
    },
    isCustomerShow() {
      return !this.Is_Empty(this.detailInfo.logisticsEntity);
    },
    isReturnDate() {
      const { returnDate } = this.detailInfo.logisticsEntity;
      return this.moment(returnDate).format("YYYY-MM-DD");
    },
    isTreat() {
      const { returnDate } = this.detailInfo;
      const returnCustomerDate = this.isReturnDate;
      if (returnDate && returnCustomerDate) {
        const remainingDay =
          new Date(returnCustomerDate) - new Date(returnDate);
        return remainingDay / (24 * 3600 * 1000) + "天";
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    async getAfterInfo(detailId) {
      try {
        const { data } = await afterInfo(detailId);
        this.detailInfo = data;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.after-detail-box {
  .el-dialog__body {
    max-height: 90vh;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>