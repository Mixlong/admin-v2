<template>
  <div class="flex align-center justify-center column-state-img">
    <img v-if="state === 0" src="./imgs/blue.png" title="待上传" />
    <img v-if="state === 1" src="./imgs/yellow.png" title="待初审" />
    <img v-if="state === 2" src="./imgs/orange.png" title="待终审" />
    <img v-if="state === 3" src="./imgs/red.png" title="未通过" />
    <img v-if="state === 4" src="./imgs/green.png" title="已审核" />
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Number,
    },
  },
};
</script>
<style lang="scss" scoped>
.column-state-img {
  img {
    width: 16px;
    height: 16px;
  }
}
</style>