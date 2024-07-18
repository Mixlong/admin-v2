<template>
  <el-tooltip
    class="item font16"
    effect="dark"
    :content="content"
    :placement="placement"
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
  name: "Tooltip",
  props: {
    content: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: ""
    },
    className: {
      type: [String, Array],
      default: () => []
    },
    placement: {
      type: String,
      default: "top"
    }
  },
  methods: {
    cellClick() {
      this.$emit("click");
    },
  },
};
</script>
