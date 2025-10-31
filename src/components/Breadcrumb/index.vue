
<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path + '-' + index">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // 直接根据实际路由层级显示，不自动添加"首页"
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)

      // 基于title去重，避免重复显示相同名称的面包屑
      const seenTitles = new Set()
      this.levelList = matched
        .filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
        .filter(item => {
          // 使用title作为唯一标识，过滤重复的标题
          const title = item.meta.title
          if (seenTitles.has(title)) {
            return false
          }
          seenTitles.add(title)
          return true
        })
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim() === '首页'
    },
    pathCompile(path) {
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;
  color: #515a6e !important;

  .no-redirect {
    color: #515a6e !important;
    cursor: text;
  }
  
  // 面包屑链接颜色
  a {
    color: #515a6e !important;
    text-decoration: none;
    
    &:hover {
      color: #515a6e !important;
    }
  }
  
  // 面包屑分隔符颜色
  :deep(.el-breadcrumb__separator) {
    color: #515a6e !important;
  }
}
</style>
