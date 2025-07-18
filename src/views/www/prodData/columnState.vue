<template>
  <div>
    <span v-if="state === 0" class="font-black">待上传</span>
    <span v-if="state === 1" class="font-black">待审核</span>
    <span v-if="state === 2" class="font-black">待终审</span>
    <span v-if="state === 3" class="font-black">未通过</span>
    <i v-if="state === 4" class="el-icon-check font16 font-correct"></i>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Number,
    }
  },
};
</script>