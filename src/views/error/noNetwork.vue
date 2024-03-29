<template>
  <div class="wscn-http404-container">
    <h2 class="bullshit__oops">Error</h2>
    <p class="bullshit__headline">网络断连， 请检查网络</p>
  </div>
</template>
  
  <script>
export default {
  name: "NoNetwork",
};
</script>
<style lang="scss" scoped>
  .wscn-http404-container {
    margin: 200px auto;
    text-align: center;
    .bullshit__oops {
      font-size: 35px;
      color: #409EFF;
    }
    .bullshit__headline {
      font-size: 18px;
    }
  }
</style>
  