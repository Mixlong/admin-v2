
<template>
  <el-image :style="{ width, height, lineHeight: height, borderRadius }" :src="url"  fit="contain" :preview-src-list="srcList" :z-index="10000">
    <div slot="error">暂无图片</div>
    <div slot="placeholder">
      <i class="el-icon-loading"></i>
    </div>
  </el-image>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: "120px",
    },
    height: {
      type: String,
      default: "120px",
    },
    borderRadius: {
      type: String,
      default: '8px'
    },
    url: {
      type: String,
    },
    srcList: {
      type: Array,
      default: () => [],
    },
  },
};
</script>