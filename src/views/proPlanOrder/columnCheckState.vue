<template>
  <div class="flex align-center justify-center column-state-img">
    <StatusFlag bgColor="green" v-if="state === 1"></StatusFlag>
    <StatusFlag class="pointer" bgColor="red" v-else></StatusFlag>
  </div>
</template>

<script>
import StatusFlag from "./StatusFlag.vue";

export default {
  props: {
    state: {
      type: Number,
    },
  },
  components: {
    StatusFlag
  },
};
</script>
<style lang="scss" scoped>
.column-state-img {
  img {
    width: 15px;
    height: 15px;
  }
}
</style>