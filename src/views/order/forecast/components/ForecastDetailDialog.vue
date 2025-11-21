<template>
  <el-dialog title="预测订单详情" :visible.sync="visible" width="900px" @close="handleClose" top="0"
    :close-on-click-modal="false" class="dialog-scroll">
    <el-descriptions border :column="2" label-class-name="desc-label">
      <el-descriptions-item label="客户名称">
        {{ detail.customerName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="产品品类">
        {{ detail.categoryName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="预测数量">
        {{
          detail.forecastQuantity !== undefined &&
            detail.forecastQuantity !== null
            ? detail.forecastQuantity
            : "-"
        }}
      </el-descriptions-item>
      <el-descriptions-item label="预计下单日期">
        {{ formatDate(detail.expectedOrderDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="期望交货日期">
        {{ formatDate(detail.expectedDeliveryDate) }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="客户订单号">
        {{ detail.orderNo || "-" }}
      </el-descriptions-item> -->
      <el-descriptions-item label="创建时间">
        {{ formatDate(detail.createTime, "{y}-{m}-{d} {h}:{i}") }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="正式订单录入时间">
        {{ formatDate(detail.formalOrderTime, "{y}-{m}-{d} {h}:{i}") }}
      </el-descriptions-item> -->
      <!-- <el-descriptions-item label="订单取消">
        <el-tag v-if="detail.orderCancel === 1" type="danger" size="small">
          是
        </el-tag>
        <el-tag v-else type="success" size="small">否</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="转正式订单">
        <el-tag
          v-if="detail.convertToFormal === 1"
          type="success"
          size="small"
        >
          是
        </el-tag>
        <el-tag v-else type="info" size="small">否</el-tag>
      </el-descriptions-item> -->
    </el-descriptions>

    <section class="rich-section">
      <h4>研发关键风险&对策(项目经理)</h4>
      <div class="rich-text" v-html="detail.rdRiskCountermeasure || '<span>-</span>'" />
    </section>

    <section class="rich-section">
      <h4>关键物料采购风险&备货对策(采购)</h4>
      <div class="rich-text" v-html="detail.procurementRiskCountermeasure || '<span>-</span>'" />
    </section>

    <section class="rich-section">
      <h4>生产计划风险&对策(PMC)</h4>
      <div class="rich-text" v-html="detail.productionRiskCountermeasure || '<span>-</span>'" />
    </section>

    <section class="rich-section">
      <h4>相关决策意见备注(市场)</h4>
      <div class="rich-text" v-html="detail.decisionRemark || '<span>-</span>'" />
    </section>
  </el-dialog>
</template>

<script>
import { parseTime } from "@/utils/ruoyi";

export default {
  name: "ForecastDetailDialog",
  data: function () {
    return {
      visible: false,
      detail: {},
    };
  },
  methods: {
    open: function (record) {
      this.detail = record ? Object.assign({}, record) : {};
      this.visible = true;
    },
    handleClose: function () {
      this.visible = false;
      this.detail = {};
    },
    formatDate: function (value, format) {
      var fmt = format || "{y}-{m}-{d}";
      if (!value) {
        return "-";
      }
      return parseTime(value, fmt);
    },
  },
};
</script>

<style lang="scss" scoped>
.rich-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 8px;
    font-size: 14px;
    color: #303133;
  }

  .rich-text {
    padding: 10px;
    min-height: 60px;
    border-radius: 4px;
    line-height: 1.6;
    background-color: #f8f9fb;

    ::v-deep {
      p {
        margin: 5px 0;
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 8px 0;
        border-radius: 4px;
      }
    }
  }
}
</style>
