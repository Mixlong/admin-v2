<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2024-01-02 20:28:53
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-05 18:47:46
 * @FilePath: \FILECONF-UI\src\views\www\prodData\columnState.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <span v-if="state === 0" class="font-black">待上传</span>
    <span v-if="state === 1" class="font-black">待初审</span>
    <span v-if="state === 4" class="font-black">待终审</span>
    <i v-if="state === 2" class="el-icon-check font16 font-correct"></i>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Number,
    }
  }
};
</script>