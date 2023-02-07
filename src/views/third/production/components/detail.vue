<template>
  <el-dialog
    title="详情"
    :visible.sync="ditailShow"
    width="980px"
    append-to-body
  >
    <el-table max-height="500px" border>
      <component :is="comAging" />
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  props: {
    comName: {
      type: String,
    },
    brandList: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      ditailShow: false,
      loading: false,
    };
  }
};
</script>

<style>
</style>