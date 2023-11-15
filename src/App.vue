<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:03
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-10-31 18:32:22
 * @FilePath: \FILECONF-UI\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div
      v-if="isOnLine"
      id="app"
      :style="{ backgroundImage: bgImage }"
      :class="{ 'theme-style': customImage > 0 }"
    >
      <router-view />
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "App",
  components: {
    NoWekwork: () => import("@/views/error/noNetwork")
  },
  data() {
    return {
      isOnLine: navigator.onLine,
    };
  },
  computed: {
    ...mapState({
      customImage: (state) => state.settings.customImage,
    }),
    bgImage() {
      const customImage = this.customImage;
      if (customImage > 0) {
        const imageSrc = require(`@/assets/theme/smallDemo${customImage}.png`);
        return `url(${imageSrc})`;
      }
    },
  }
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
  overflow-y: auto;
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