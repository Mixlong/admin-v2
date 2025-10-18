<template>
  <div
    v-if="isOnLine"
    id="app"
  >
    <router-view />
    <theme-picker />
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";

export default {
  name: "App",
  components: {
    NoWekwork: () => import("@/views/error/noNetwork"),
    ThemePicker,
  },
  mounted() {
    // 已通过组件 class 和 CSS 控制菜单字体样式，无需 JavaScript 操作
  },
  metaInfo() {
    return {
      title:
        this.$store.state.settings.dynamicTitle &&
        this.$store.state.settings.title,
      titleTemplate: (title) => {
        return title
          ? `${title} - ${process.env.VUE_APP_TITLE}`
          : process.env.VUE_APP_TITLE;
      },
    };
  },
  data() {
    return {
      isOnLine: navigator.onLine,
    };
  },
};
</script>
<style lang='scss'>
#app .theme-picker {
  display: none;
}

.app-container {
  height: calc(100vh - 100px);
  overflow-y: auto;
}
</style>