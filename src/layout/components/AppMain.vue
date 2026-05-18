<template>
  <section class="app-main">
    <keep-alive :include="cachedViews">
      <router-view v-if="!$route.meta.link" />
    </keep-alive>
  </section>
</template>

<script>
export default {
  name: "AppMain",
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews;
    },
    key() {
      return this.$route.path;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  box-sizing: border-box;
  background-color: #d4d9e1; /* 浅灰背景，与深色侧边栏形成对比 */
}

// 微前端模式下，使用100%高度
.micro-app-mode .app-main {
  min-height: 100%;
  height: 100%;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
    box-sizing: border-box;
    background-size: 50%;
  }

  .fixed-header + .app-main {
    padding-top: 80px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 6px;
  
  &:hover {
    background-color: #a8a8a8;
  }
}

// 修复 el-table 固定列遮挡滚动条的问题
.el-table__fixed {
  pointer-events: none;
  
  // 允许固定列内的按钮等元素可以点击
  .el-table__fixed-body-wrapper,
  .el-table__fixed-header-wrapper,
  .el-table__fixed-footer-wrapper {
    pointer-events: auto;
  }
  
  // 确保固定列内容可以交互
  .el-table__body,
  .el-table__header,
  .el-table__footer {
    pointer-events: auto;
  }
}

// 确保表格滚动条可见且可以交互
.el-table__body-wrapper {
  &::-webkit-scrollbar {
    height: 12px;
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 6px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}
</style>
