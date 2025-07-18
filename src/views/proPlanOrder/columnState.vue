<template>
  <div class="flex align-center justify-center column-state-img">
    <StatusFlag bgColor="green" v-if="state === 1"></StatusFlag>
    <StatusFlag bgColor="red" v-else></StatusFlag>
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