<template>
  <div class="coust-style">
    <!-- 模块4 -->
    <div class="post-form model-wrap margin-top-sm">
      <div class="model-wrap-style">
        <div class="title" style="padding-left: 30px">
          <div>{{ title }} <slot name="title" /></div>
        </div>
      </div>
      <div class="model-content" style="padding: 30px 20px">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalStyle",
  props: {
    title: {},
  },
};
</script>

<style lang="scss">
.coust-style {
  .el-form-item {
    margin-bottom: 10px;
  }
  .el-form-item__label {
    color: #999;
  }
}
</style>
