<template>
  <div :class="classObj" class="app-wrapper" :style="{'--current-color': theme}">
    <div
      v-if="device === 'mobile' && sidebar.opened && !isMicroApp"
      class="drawer-bg"
      @click="handleClickOutside"
    />

    <!-- 侧边栏占满高度 - 微前端环境下隐藏 -->
    <sidebar v-if="!isMicroApp" class="sidebar-container" />

    <!-- 右侧主要内容区域 -->
    <div :class="{ hasTagsView: needTagsView && !isMicroApp, 'micro-app-container': isMicroApp }" class="main-container">
      <div v-if="!isMicroApp" :class="{ 'fixed-header': fixedHeader }">
        <navbar/>
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings && !isMicroApp">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script>
import RightPanel from "@/components/RightPanel";
import { AppMain, Navbar, Settings, Sidebar, TagsView } from "./components";
import ResizeMixin from "./mixin/ResizeHandler";
import { mapState } from "vuex";

export default {
  name: "Layout",
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView,
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      theme: state => state.settings.theme,
      sidebar: (state) => state.app.sidebar,
      device: (state) => state.app.device,
      showSettings: (state) => state.settings.showSettings,
      needTagsView: (state) => state.settings.tagsView,
      fixedHeader: (state) => state.settings.fixedHeader,
      isFromExternal: (state) => state.app.isFromExternal,
    }),
    // 判断是否在微前端环境下运行
    isMicroApp() {
      return window.__POWERED_BY_WUJIE__ || false
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened && !this.isMicroApp,
        openSidebar: this.sidebar.opened && !this.isMicroApp,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === "mobile",
        'micro-app-mode': this.isMicroApp
      };
    },
  },
  created() {
    // 初始化外部跳转标记（从Vuex持久化读取）
    this.$store.dispatch('app/initExternalFlag');
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/mixin.scss";
@import "~@/assets/styles/variables.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }

  // 微前端模式：占满容器高度
  &.micro-app-mode {
    height: 100%;
    min-height: 100%;
  }
}

.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 10;
}

.main-container {
  flex: 1;
  margin-left: $sideBarWidth;
  min-height: 100vh;
  max-width: calc(100vw - #{$sideBarWidth});
  width: calc(100vw - #{$sideBarWidth});
  transition: margin-left 0.28s, max-width 0.28s, width 0.28s;
  position: relative;
  overflow-x: hidden;

  // 微前端模式：移除margin，占满全屏
  &.micro-app-container {
    margin-left: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    min-height: 100% !important;
    height: 100% !important;
    display: flex;
    flex-direction: column;
  }
}

.hideSidebar .main-container {
  margin-left: $hideSideBarWidth;
  max-width: calc(100vw - #{$hideSideBarWidth});
  width: calc(100vw - #{$hideSideBarWidth});
}

.main-container.no-sidebar {
  margin-left: 0;
  max-width: 100vw;
  width: 100vw;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 8;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: $sideBarWidth;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: left 0.28s, width 0.28s;
}

.hideSidebar .fixed-header {
  left: $hideSideBarWidth;
  width: calc(100% - #{$hideSideBarWidth});
}

.mobile .fixed-header {
  left: 0;
  width: 100%;
}

// 外部跳转时隐藏navbar，app-main占满高度
.main-container.no-navbar {
  .app-main {
    padding-top: 0 !important;
    min-height: 100vh !important;
  }
}
</style>
