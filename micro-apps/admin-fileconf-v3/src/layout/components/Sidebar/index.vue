<template>
  <div class="sidebar-wrapper" :class="{ 'has-logo': showLogo }">
    <!-- Logo区域 -->
    <div class="logo-section" v-if="showLogo">
      <div class="logo-container">
        <!-- 展开状态显示完整logo和系统名称 -->
        <template v-if="!isCollapse">
          <img :src="customImage == 0
              ? logoImage1
              : logoImage2
            " alt="" class="logo-image" />
          <div class="system-name">迪太云管理系统</div>
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
          :active-text-color="theme"
          :collapse-transition="false"
          mode="vertical"
        >
          <SidebarItem
            v-for="(route, index) in sidebarRouters"
            :key="route.path + index"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import logoImage1 from '@/assets/logo/logo.png'
import logoImage2 from '@/assets/logo/logo1.png'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const showLogo = computed(() => settingsStore.sidebarLogo)
const theme = computed(() => settingsStore.theme)
const customImage = computed(() => settingsStore.customImage || 0)
const isCollapse = computed(() => !appStore.sidebar.opened)

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables.module.scss" as *;

.sidebar-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $menuBg;
}

.logo-section {
  display: flex;
  align-items: center;
  height: 84px;
  padding: 0 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .logo-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-left: 8px;
    
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
      line-height: 1.2;
      white-space: nowrap;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      text-align: center;
      line-height: 1;
      user-select: none;
    }
  }
}

.menu-section {
  flex: 1;
  overflow: hidden;
  margin-top: 40px;
  
  :deep(.el-scrollbar) {
    height: calc(100% - 100px);
    border-radius: 6px;
  }
  
  .scrollbar-wrapper {
    height: 100%;
  }
  
  /* 一级菜单样式 */
  :deep(.first-level-menu),
  :deep(.first-level-menu span) {
    font-size: 15px !important;
    font-weight: 700 !important;
  }
  
  :deep(.first-level-submenu > .el-sub-menu__title),
  :deep(.first-level-submenu > .el-sub-menu__title span) {
    font-size: 15px !important;
    font-weight: 700 !important;
  }
  
  /* 直接选择el-menu下的一级菜单 */
  :deep(.el-menu > .el-sub-menu > .el-sub-menu__title),
  :deep(.el-menu > .el-sub-menu > .el-sub-menu__title span),
  :deep(.el-menu > .el-menu-item),
  :deep(.el-menu > .el-menu-item span) {
    font-size: 15px !important;
    font-weight: 700 !important;
  }
  
  /* 二级及以下菜单样式 */
  :deep(.nest-menu .el-sub-menu__title),
  :deep(.nest-menu .el-sub-menu__title span),
  :deep(.nest-menu .el-menu-item),
  :deep(.nest-menu .el-menu-item span) {
    font-size: 14px !important;
    font-weight: 400 !important;
  }
  
  /* 激活状态 */
  :deep(.el-menu-item.is-active) {
    color: $menuActiveText !important;
    background-color: $menuHover !important;
  }
  
  /* hover状态 */
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: $menuHover !important;
  }
}

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
