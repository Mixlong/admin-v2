<template>
  <div class="read-more">
    <div
      class="read-more__content"
      :style="readMoreContent"
      ref="readMoreContentRef"
    >
      <slot></slot>
    </div>
    <div
      class="read-more__toggle"
      :style="toggleStyle"
      @click.stop="handleReadMore"
    >
      <span>{{ closeText }}</span>
      <i class="u-icon__icon el-icon-arrow-down"></i>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    showHeight: {
      type: [String, Number],
      default: 200,
    },
    closeText: {
      type: String,
      default: "展开阅读全文",
    },
    openText: {
      type: String,
      default: "收起",
    },
  },
  data() {
    return {
        isLongContent: false, // 是否需要隐藏一部分内容
        status: 'close', // 当前隐藏与显示的状态，close-收起状态，open-展开状态
        contentHeight: 100, // 内容高度
    };
  },
  computed: {
    readMoreContent() {
      return {
        height: this.showHeight + "px",
        overflow: "hidden",
      };
    },
    toggleStyle() {
      return {
        marginTop: -(this.showHeight / 2) + "px",
        paddingTop: this.showHeight / 2 + "px",
        backgroundImage:
          "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 80%)",
      };
    },
    innerShadowStyle() {
        if(this.status === "open") return {}
        else return this.shadowStyle
    },
  },
  methods: {
    handleReadMore() {},
  },
};
</script>

<style lang="scss" scoped>
.read-more {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: auto;
  align-items: stretch;
  .read-more__toggle {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    font-weight: normal;
    overflow-wrap: normal;
    font-size: 14px;
    color: rgb(41, 121, 255);
    line-height: 14px;
    .u-icon__icon {
      font-size: 16px;
      line-height: 16px;
      margin-left: 5px;
    }
  }
}
</style>
