<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:03
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-02-02 18:43:08
 * @FilePath: \FILECONF-UI\src\components\PreviewImg\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-image :style="{ width, height, borderRadius }" :src="url"  fit="contain" :preview-src-list="srcList" :z-index="10000">
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