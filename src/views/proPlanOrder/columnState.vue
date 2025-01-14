<template>
  <div class="flex align-center justify-center">
      <img v-if="state === 0" src="./imgs/blue.png" /> 
      <img v-if="state === 1" src="./imgs/yellow.png" />
      <img v-if="state === 2" src="./imgs/orange.png" />
      <img v-if="state === 3" src="./imgs/red.png" />
      <img v-if="state === 4" src="./imgs/green.png" />
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