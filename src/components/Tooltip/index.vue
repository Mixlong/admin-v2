<template>
  <el-tooltip
    class="item font16"
    effect="dark"
    :content="content"
    placement="top-end"
  >
    <el-button
      size="small"
      :icon="icon"
      type="text"
      :class="className"
      @click="cellClick"
    ></el-button>
  </el-tooltip>
</template>

<script>
export default {
  props: ["content", "icon", "className"],
  data() {
    return {};
  },
  methods: {
    cellClick() {
      this.$emit("click");
    },
  },
};
</script>
