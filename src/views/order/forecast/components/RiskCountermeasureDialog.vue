<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="risk-editor" v-loading="detailLoading">
      <tinymce
        v-if="dialogVisible"
        v-model="form.content"
        :height="260"
        :placeholder="`请输入${currentTypeLabel}内容`"
      />
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        保 存
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import tinymce from "@/views/components/Editor";
import { updateForecast } from "@/api/order/forecast.js";

export default {
  name: "RiskCountermeasureDialog",
  components: {
    tinymce,
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      detailLoading: false,
      recordData: null,
      form: {
        id: "",
        type: "rd",
        content: "",
      },
      typeMap: {
        rd: {
          label: "研发关键风险&对策(项目经理)",
          field: "rdRiskCountermeasure",
        },
        procurement: {
          label: "关键物料采购风险&备货对策(采购)",
          field: "procurementRiskCountermeasure",
        },
        production: {
          label: "生产计划风险&对策(PMC)",
          field: "productionRiskCountermeasure",
        },
        decision: {
          label: "相关决策意见备注(市场)",
          field: "decisionRemark",
        },
      },
    };
  },
  computed: {
    currentTypeLabel() {
      return this.typeMap[this.form.type]?.label || "风险对策";
    },
    dialogTitle() {
      return `填写${this.currentTypeLabel}`;
    },
  },
  methods: {
    open(record, type) {
      this.form.type = type || "rd";
      this.recordData = record ? { ...record } : null;
      this.form.id = record?.id || "";

      const typeMeta = this.typeMap[this.form.type];
      if (typeMeta && record) {
        this.form.content = record[typeMeta.field] || "";
      } else {
        this.form.content = "";
      }

      this.dialogVisible = true;
    },
    handleSubmit() {
      if (!this.form.id) {
        this.$message.error("缺少预测订单信息");
        return;
      }

      const typeMeta = this.typeMap[this.form.type];
      if (!typeMeta) {
        this.$message.error("未知的风险类型");
        return;
      }

      if (!this.recordData) {
        this.$message.warning("数据加载中，请稍后重试");
        return;
      }

      const content = this.form.content || "";
      if (!content.trim()) {
        this.$message.warning("请输入风险对策内容");
        return;
      }

      const payload = { ...this.recordData, id: this.form.id };
      delete payload.createBy;
      delete payload.createTime;
      delete payload.updateBy;
      delete payload.updateTime;
      delete payload.updateTimeStart;
      delete payload.updateTimeEnd;
      payload[typeMeta.field] = content;

      this.submitLoading = true;
      updateForecast(payload)
        .then(() => {
          this.msgSuccess("保存成功");
          this.dialogVisible = false;
          this.$emit("refresh");
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
    handleClose() {
      this.form = {
        id: "",
        type: "rd",
        content: "",
      };
      this.submitLoading = false;
      this.detailLoading = false;
      this.recordData = null;
    },
  },
};
</script>

<style scoped>
.risk-editor {
  min-height: 260px;
}
</style>
