<template>
  <el-dialog
    title="备注详情"
    :visible.sync="dialogVisible"
    width="600px"
    top="-2vh"
    append-to-body
    center
    :close-on-click-modal="false"
  >
    <el-card shadow="never">
      {{ remark }}
    </el-card>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      remark: "",
      dialogVisible: false,
    };
  },
};
</script>