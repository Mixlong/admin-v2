<template>
  <el-dialog
    title="包装信息"
    :visible.sync="isDialogVisible"
    width="50%"
    center
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="package-info-box" v-html="packagingInfo"></div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isDialogVisible: false,
      packagingInfo: "",
    };
  },
};
</script>

<style lang="scss" scoped>
.package-info-box {
  max-height: 500px;
  overflow: hidden;
  overflow-y: auto;
}
</style>