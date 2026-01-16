<template>
  <div class="sidebar-wrapper" :class="{ 'has-logo': showLogo }">
    <!-- Logo区域 -->
    <div class="logo-section" v-if="showLogo">
      <div class="logo-container">
        <!-- 展开状态显示完整logo和系统名称 -->
        <template v-if="!isCollapse">
          <img :src="customImage == 0
              ? require('@/assets/logo/logo.png')
              : require('@/assets/logo/logo1.png')
            " alt="" class="logo-image" />
          <div class="system-name">运营管理平台</div>
        </template>
        <!-- 折叠状态显示字母D -->
        <div v-else class="logo-text">D</div>
      </div>
    </div>
    
    <!-- 菜单区域 -->
    <div class="menu-section">
      <el-scrollbar wrap-class="scrollbar-wrapper">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="variables.menuBg"
          :text-color="variables.menuText"
          :unique-opened="true"
          :active-text-color="settings.theme"
          :collapse-transition="false"
          mode="vertical"
        >
          <sidebar-item
            v-for="(route, index) in permission_routes"
            :key="route.path + index"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import SidebarItem from "./SidebarItem";
import variables from "@/assets/styles/variables.scss";

export default {
  components: { SidebarItem },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["permission_routes", "sidebar"]),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    customImage() {
      return this.$store.state.settings.customImage;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.sidebar-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $menuBg;
}

.logo-section {
  display: flex;
  align-items: center;
  // justify-content: center;
  height: 84px;
  padding: 0 15px;
  border-bottom: 1px solid if($darkTheme, rgba(255, 255, 255, 0.1), #e2e8f0);
  
  .logo-container {
    display: flex;
    // align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-left:8px;
    .logo-image {
      max-width: 104px;
      max-height: 40px;
      width: auto;
      height: auto;
      object-fit: contain;
      margin-bottom: 4px;
    }
    
    .system-name {
      font-size: 25px;
      font-weight: 700;
      color: rgb(64, 158, 255);
      // text-align: center;
      line-height: 1.2;
      white-space: nowrap;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: if($darkTheme, #ffffff, #303133);
      text-align: center;
      line-height: 1;
      user-select: none;
    }
  }
}

.menu-section {
  flex: 1;
  overflow: hidden;
  
  .scrollbar-wrapper {
    height: 100%;
  }
}

// 收缩状态样式
.sidebar-wrapper:not(.has-logo) .logo-section,
.has-logo.collapsed .logo-section {
  padding: 15px 10px;
  
  .logo-container {
    .logo-image {
      max-width: 32px;
      max-height: 32px;
    }
  }
}
</style>
