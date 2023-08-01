<template>
  <div
    id="app"
    :style="{
      backgroundImage:
        customImage > 0
          ? 'url(' +
            require('@/assets/theme/smallDemo' + customImage + '.png') +
            ')'
          : '',
    }"
    :class="{ 'theme-style': customImage > 0}"
  >
    <router-view />
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "App",
  computed: {
    ...mapState({
      customImage: (state) => state.settings.customImage,
    }),
  },
  data() {
    return {
      image: "",
    };
  },
  mounted() {
    // this.image = require("@/assets/theme/smallDemo" +
    //   this.customImage +
    //   ".png");
  },
};
</script>
<style lang='scss'>
#app {
  background-position: center 0;
  background-repeat: no-repeat;
  transition: background 1s ease;
  background-size: cover;
}
.app-container {
  height: calc(100vh - 70px);
  overflow-y: scroll;
}
.theme-style {
  .tags-view-container {
    box-shadow: none !important;
    border-bottom: none !important;
  }
  .navbar-wrap-style,
  .tags-view-container,
  .el-menu,
  .el-menu-item,
  .scrollbar-wrapper,
  .el-submenu .el-submenu__title {
    background: transparent !important;
  }

  .app-breadcrumb.el-breadcrumb .no-redirect,
  .el-breadcrumb__inner.is-link,
  .el-breadcrumb__inner a,
  .right-menu,
  .right-menu .text-red {
    color: #fff !important;
  }
  .hamburger {
    background-color: #fff !important;
  }

  &#app .el-submenu .el-submenu__title,
  .el-menu-item,
  .sidebar-container .is-active > .el-submenu__title,
  .el-submenu__title i,
  .company-name {
    border-left: transparent solid 6px !important;
    color: #fff !important;
  }
  .el-scrollbar__thumb {
    width: 0 !important;
  }
  .el-menu-item.is-active,
  &#app .sidebar-container .nest-menu .el-submenu > .el-submenu__title:hover,
  &#app .sidebar-container .el-submenu .el-menu-item:hover,
  &#app .sidebar-container .el-submenu__title:hover,
  &#app .sidebar-container .submenu-title-noDropdown:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all 0.1s;
  }
  .scrollbar-wrapper {
    border: 0 !important;
  }
  &#app .sidebar-container.has-logo .el-scrollbar,
  .hasTagsView .app-main {
    padding-left: 0 !important;
  }
}
</style>