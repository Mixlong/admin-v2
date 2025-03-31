<template>
  <div class="common-data-box">
    <div class="title" :style="titleStyle">{{ title }}</div>
    <slot name="content"></slot>
  </div>
</template>

<script>
export default {
  name: "commonData",
  props: {
    title: {
      type: String,
      default: "标题",
    },
    titleBackground: {
      type: String,
      default: "linear-gradient(90deg, rgba(31,180,255,.6) 10%, rgba(31,180,255,0) 100%)",
    },
  },
  data() {
    return {};
  },
  computed: {
    titleStyle() {
      return {
        background: this.titleBackground,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.common-data-box {
  height: 100%;
  background: url("~@/assets/image/screen/Group.png") no-repeat center center;
  background-size: 100% 100%;
  display: grid;
  grid-template-rows: 40px 1fr;

  .title {
    display: flex;
    align-items: center;
    padding-left: 23px;
    height: 40px;
    font-weight: bold;
    font-size: 20px;
    color: #ffffff;
  }
}
</style>