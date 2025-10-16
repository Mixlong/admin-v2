<template>
  <div :class="classObj" class="app-wrapper" :style="{'--current-color': theme}">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />

    <!-- 侧边栏占满高度 -->
    <sidebar class="sidebar-container" />
    
    <!-- 右侧主要内容区域 -->
    <div :class="{ hasTagsView: needTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <div>
          <navbar />
        </div>
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
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
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === "mobile",
      };
    },
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
}

.hideSidebar .main-container {
  margin-left: $hideSideBarWidth;
  max-width: calc(100vw - #{$hideSideBarWidth});
  width: calc(100vw - #{$hideSideBarWidth});
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
</style>
