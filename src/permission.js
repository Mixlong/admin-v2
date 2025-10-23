import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import { getToken } from "@/utils/auth";
import { start, done } from "@/utils/nprogress";

const whiteList = ["/login", "/auth-redirect", "/bind", "/register", "/survey"];

// 获取第一个可访问的菜单路径
function getFirstAccessibleRoute(routes) {
  for (let route of routes) {
    // 跳过隐藏的路由
    if (route.hidden) {
      continue;
    }
    
    // 如果有子路由，递归查找
    if (route.children && route.children.length > 0) {
      const firstChild = getFirstAccessibleRoute(route.children);
      if (firstChild) {
        return firstChild;
      }
    }
    
    // 如果当前路由有 path 且不是重定向路由
    if (route.path && route.path !== '*') {
      // 构建完整路径
      return route.path;
    }
  }
  return null;
}

router.beforeEach((to, from, next) => {
  start();
  if (getToken()) {

    if (to.matched && to.matched.length > 2) {
      to.matched.splice(1, to.matched.length - 2)
    }

    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === "/login") {
      // 登录后跳转到第一个有权限的菜单
      const firstRoute = getFirstAccessibleRoute(store.getters.permission_routes);
      next({ path: firstRoute || "/" });
      done();
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store
          .dispatch("GetInfo")
          .then((res) => {
            // 拉取user_info
            const roles = res.roles;
            store.dispatch("GenerateRoutes", { roles }).then((accessRoutes) => {
              // 测试 默认静态页面
              // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes); // 动态添加可访问路由表
              // store.commit('SOCKET_SEND')

              // 预加载微应用
              if (window.Vue && window.Vue.prototype.$preloadMicroApps) {
                window.Vue.prototype.$preloadMicroApps()
              }

              // 如果访问的是根路径，重定向到第一个有权限的菜单
              if (to.path === '/' || to.path === '') {
                const firstRoute = getFirstAccessibleRoute(accessRoutes);
                if (firstRoute && firstRoute !== '/') {
                  next({ path: firstRoute, replace: true });
                  return;
                }
              }

              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
            });
          })
          .catch((err) => {
            store.dispatch("FedLogOut").then(() => {
              Message.error(err);
              next({ path: "/" });
            });
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`); // 否则全部重定向到登录页
      done();
    }
  }
});

router.afterEach(() => {
  done();
});
