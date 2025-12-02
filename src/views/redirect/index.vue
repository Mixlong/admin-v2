<template>
  <div class="redirect-container" v-loading="true" element-loading-text="页面跳转中...">
  </div>
</template>

<script>
import store from '@/store'

// 与权限守卫类似，但补齐了父子路径，避免相对路径导致 404
const joinPaths = (base, path) => {
  const clean = (p) => (p || '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
  const parts = [clean(base), clean(path)].filter(Boolean)
  return '/' + parts.join('/')
}

function getFirstAccessibleRoute(routes = [], base = '') {
  for (let route of routes) {
    if (route.hidden) continue

    const currentPath = route.path ? joinPaths(base, route.path) : base || '/'

    if (route.children && route.children.length > 0) {
      const firstChild = getFirstAccessibleRoute(route.children, currentPath)
      if (firstChild) return firstChild
    }

    if (route.redirect && route.redirect !== 'noRedirect') {
      const redirectPath =
        typeof route.redirect === 'string' && !route.redirect.startsWith('/')
          ? joinPaths(base, route.redirect)
          : route.redirect
      return redirectPath
    }

    if (route.path && route.path !== '*') {
      return currentPath || '/'
    }
  }
  return null
}

// 检查路由名称是否在用户权限路由中
function hasRoutePermission(routes = [], targetName) {
  for (let route of routes) {
    if (route.name === targetName) {
      return true
    }
    if (route.children && route.children.length > 0) {
      if (hasRoutePermission(route.children, targetName)) {
        return true
      }
    }
  }
  return false
}

export default {
  created() {
    const { name, id, ...otherParams } = this.$route.query;
    
    console.log('=== Redirect 组件 ===');
    console.log('目标页面 name:', name);
    console.log('参数 id:', id);
    console.log('完整参数:', this.$route.query);
    console.log('其他参数:', otherParams);
    
    // token已经在main.js被syncTokenFromUrl()处理并写入Cookie了
    // 所以这里不需要再处理token
    
    // 获取用户权限路由
    const routeTree =
      (store.getters && store.getters.permission_routes)?.length
        ? store.getters.permission_routes
        : (this.$router && this.$router.options && this.$router.options.routes) || [];
    
    console.log('用户权限路由:', routeTree);

    if (!name) {
      console.warn('未提供 name，尝试跳转到第一个菜单');
      const firstRoute = getFirstAccessibleRoute(routeTree || []);
      console.log('首个可访问路由:', firstRoute);
      if (firstRoute) {
        this.$router.replace(firstRoute);
        return;
      }
      this.$message.error('缺少跳转目标页面参数');
      this.handleBackToFirstMenu();
      return;
    }

    // 检查用户是否有目标路由的权限
    const hasPermission = hasRoutePermission(routeTree, name);
    console.log(`检查路由权限 [${name}]:`, hasPermission);

    if (!hasPermission) {
      console.warn(`用户没有路由 [${name}] 的权限，跳转到首页`);
      // this.$message.warning(`您没有访问页面 ${name} 的权限，已为您跳转到首页`);
      this.handleBackToFirstMenu();
      return;
    }

    // 构建跳转路由
    const routeConfig = {
      name: name
    };

    // 如果有 id 参数或其他参数，添加到 query 中
    if (id || Object.keys(otherParams).length > 0) {
      routeConfig.query = { 
        ...(id ? { id } : {}),
        ...otherParams  // 传递其他所有参数
      };
    }
    
    console.log('路由配置:', routeConfig);
    // 执行跳转
    console.log('开始执行跳转...');
    this.$router.push(routeConfig).catch(err => {
      console.error('跳转失败:', err);
      this.$message.error('页面跳转失败');
      this.handleBackToFirstMenu();
    });
  },
  methods: {
    handleBackToFirstMenu() {
      // 获取用户有权限访问的第一个菜单
      const routeTree =
        (store.getters && store.getters.permission_routes)?.length
          ? store.getters.permission_routes
          : (this.$router && this.$router.options && this.$router.options.routes) || [];
      const firstRoute = getFirstAccessibleRoute(routeTree || []);
      console.log('跳转到首个可访问路由:', firstRoute);
      if (firstRoute) {
        this.$router.replace(firstRoute);
      } else {
        // 如果找不到任何可访问路由，跳转到根路径
        this.$router.replace('/');
      }
    }
  }
};
</script>

<style scoped lang="scss">
.redirect-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}
</style>
