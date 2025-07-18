<template>
  <el-dialog
    title="录入SN"
    :visible="isSnShow"
    append-to-body
    width="500px"
    center
    :close-on-click-modal="false"
    @close="$emit('update:isSnShow', false)"
  >
    <el-input
      v-model="snList"
      ref="snRef"
      type="textarea"
      rows="10"
      placeholder="请扫码录入SN"
    />
    <b>多个以换行分隔</b>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="isLoading" type="primary" @click="handleSubmit">
        确 定
      </el-button>
      <el-button @click="handelCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sampleAddSn } from "@/api/third/sample";

export default {
  props: {
    isSnShow: {
      type: Boolean,
      default: false,
    },
    sampleId: {
      type: String,
      default: "",
    },
    snData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      snList: "",
      isLoading: false,
    };
  },
  watch: {
    isSnShow(val) {
      if (val) {
        if (this.snData.length) {
          const snData = this.snData.join() + ",";
          this.snList = snData.replaceAll(",", "\r\n");
        }
        this.$nextTick(() => {
          this.$refs.snRef.focus();
        });
      }
    },
  },
  methods: {
    convertRichTextToCommaSeparated(richText) {
      let commaSeparated = richText.replace(/[\r\n]+/g, ";").trim();
      if (commaSeparated.endsWith(";")) {
        commaSeparated = commaSeparated.slice(0, -1).split(";");
      } else {
        commaSeparated = commaSeparated.split(";");

      }
      return commaSeparated;
    },
    handleSubmit() {
      if (!this.snList) {
        this.msgError("请先录入SN");
        return;
      }

      this.isLoading = true;
      let snList = this.convertRichTextToCommaSeparated(this.snList);
      snList = [...new Set(snList)]
      sampleAddSn({
        list: snList,
        sampleId: this.sampleId,
      })
        .then(() => {
          this.msgSuccess("录入成功");
          this.snList = "";
          this.$parent.getList();
          this.$emit("update:isSnShow", false);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handelCancel() {
      this.snList = "";
      this.$emit("update:isSnShow", false);
    },
  },
};
</script>

<style></style>
