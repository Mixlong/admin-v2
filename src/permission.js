import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import { getToken } from "@/utils/auth";
import { start, done } from "@/utils/nprogress";
import { filterAsyncRouter } from "@/store/modules/permission";

const whiteList = [
  "/login",
  "/auth-redirect",
  "/bind",
  "/register",
  "/survey",
  "/digiSmart/redirect",
];

// 获取第一个可访问的菜单路径
function getFirstAccessibleRoute(routes, parentPath = "") {
  for (let route of routes) {
    // 跳过隐藏的路由
    if (route.hidden) {
      continue;
    }

    // 构建当前路由的完整路径
    let fullPath = route.path;
    if (fullPath && !fullPath.startsWith("/") && parentPath) {
      // 相对路径，需要拼接父路径
      fullPath = parentPath.endsWith("/")
        ? parentPath + fullPath
        : parentPath + "/" + fullPath;
    }

    // 如果有子路由，递归查找（传递当前完整路径作为父路径）
    if (route.children && route.children.length > 0) {
      const firstChild = getFirstAccessibleRoute(route.children, fullPath);
      if (firstChild) {
        return firstChild;
      }
    }

    // 如果当前路由有 path 且不是重定向路由，且不是纯目录（没有 component 或 redirect 为 noRedirect 的目录）
    // 只有叶子节点或有实际组件的路由才返回
    if (
      fullPath &&
      fullPath !== "*" &&
      route.component &&
      route.redirect !== "noRedirect"
    ) {
      return fullPath;
    }
  }
  return null;
}

// 是否允许与主应用同步（路由/菜单/消息）
function isMainAppSyncEnabled() {
  return (
    window.__POWERED_BY_WUJIE__ &&
    window.$wujie?.props?.syncWithMain !== false &&
    process.env.VUE_APP_WUJIE_SYNC_MAIN !== "false"
  );
}

// 记录原始目标路由，用于动态路由加载后重新导航
let pendingRoute = null;
// 标记是否正在加载动态路由
let isLoadingRoutes = false;
// 记录重试次数，防止无限循环
let retryCount = 0;
const MAX_RETRY = 2;

router.beforeEach((to, from, next) => {
  start();
  const token = getToken();
  const isWujie = window.__POWERED_BY_WUJIE__;
  const allowMainSync = isMainAppSyncEnabled();
  console.log(
    "[Permission] 路由守卫检查 - to:",
    to.path,
    "- from:",
    from.path,
    "- hasToken:",
    !!token,
    "- isWujie:",
    isWujie,
    "- roles:",
    store.getters.roles.length,
    "- retryCount:",
    retryCount
  );

  // 在微前端环境下，如果要跳转到 404
  if (allowMainSync && to.path === "/404") {
    // 检查重试次数，防止无限循环
    if (retryCount >= MAX_RETRY) {
      console.log("[Permission] 微前端环境，重试次数已达上限，允许跳转到 404");
      retryCount = 0;
      next();
      return;
    }

    // 从 wujie 传入的 props 或 URL 获取原始路径
    let originalPath = null;

    // 尝试从 window.$wujie.props 获取当前路由信息
    if (window.$wujie?.props?.currentRoute?.path) {
      originalPath = window.$wujie.props.currentRoute.path;
      console.log("[Permission] 从 wujie props 获取原始路径:", originalPath);
    }

    // 如果没有，尝试从 hash 获取
    if (!originalPath) {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#")) {
        originalPath = hash.slice(1).split("?")[0];
        console.log("[Permission] 从 hash 获取原始路径:", originalPath);
      }
    }

    if (
      originalPath &&
      originalPath !== "/404" &&
      originalPath !== "/" &&
      originalPath !== to.path
    ) {
      // 如果 roles 为空，说明动态路由还没加载，记录原始路径等待加载完成
      if (store.getters.roles.length === 0) {
        pendingRoute = originalPath;
        console.log(
          "[Permission] 微前端环境，roles 为空，记录待处理路径:",
          pendingRoute
        );
        // 继续执行，让后面的逻辑去加载用户信息和动态路由
      } else if (!isLoadingRoutes) {
        // roles 已有值但还是跳转到 404，说明动态路由可能刚加载完，尝试重新导航
        retryCount++;
        console.log(
          "[Permission] 微前端环境，roles 已有值但跳转到 404，尝试导航到:",
          originalPath,
          "重试次数:",
          retryCount
        );
        next({ path: originalPath, replace: true });
        return;
      }
    }
  } else {
    // 不是 404，重置重试次数
    retryCount = 0;
  }

  if (token) {
    // 注释掉：这段代码会删除路由的中间层级，导致面包屑和标签页显示错误
    // console.log('🌟 进入路由前 to.matched:', to.matched.map(m => ({path: m.path, name: m.name, title: m.meta?.title, component: m.components?.default?.name})));

    // if (to.matched && to.matched.length > 2) {
    //   console.log('🌟 删除中间层级前:', to.matched.map(m => ({path: m.path, title: m.meta?.title})));
    //   to.matched.splice(1, to.matched.length - 2)
    //   console.log('🌟 删除中间层级后:', to.matched.map(m => ({path: m.path, title: m.meta?.title})));
    // }

    to.meta.title && store.dispatch("settings/setTitle", to.meta.title);
    /* has token*/
    if (to.path === "/login") {
      // 登录后跳转到第一个有权限的菜单
      document.body.classList.add("loaded");
      const firstRoute = getFirstAccessibleRoute(
        store.getters.permission_routes
      );
      next({ path: firstRoute || "/" });
      done();
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        console.log("[Permission] 开始获取用户信息...");
        isLoadingRoutes = true;
        store
          .dispatch("GetInfo")
          .then((res) => {
            console.log("[Permission] 用户信息获取成功:", res);
            // 拉取user_info
            const roles = res.roles;

            // ✅ 在微前端环境下，尝试使用 admin-v3 传来的菜单数据
            console.log("🚀 ~ isWujie:", isWujie);
            console.log("🚀 ~ window.$wujie?.props:", window.$wujie?.props);

            const menuData = window.$wujie?.props?.menuData;
            // 检查 menuData 是否有效（存在且有内容）
            const hasValidMenuData =
              allowMainSync &&
              menuData &&
              Array.isArray(menuData) &&
              menuData.length > 0;

            if (hasValidMenuData) {
              try {
                console.log(
                  "[Permission] 微前端环境，使用 admin-v3 传来的菜单数据, 数量:",
                  menuData.length
                );
                // ⚠️ 重要：深拷贝 menuData，避免修改 Vue 3 的 Proxy 对象
                const menuDataCopy = JSON.parse(JSON.stringify(menuData));
                // 将字符串组件名转换为实际组件对象
                const accessRoutes = filterAsyncRouter(menuDataCopy);
                accessRoutes.push({
                  path: "*",
                  redirect: "/404",
                  hidden: true,
                });
                router.addRoutes(accessRoutes);
                // 同步到 store
                store.commit("SET_ROUTES", accessRoutes);
                isLoadingRoutes = false;
                document.body.classList.add("loaded");

                // 预加载微应用
                if (window.Vue && window.Vue.prototype.$preloadMicroApps) {
                  window.Vue.prototype.$preloadMicroApps();
                }

                // 如果访问的是根路径，重定向到第一个有权限的菜单
                if (to.path === "/" || to.path === "") {
                  const firstRoute = getFirstAccessibleRoute(accessRoutes);
                  if (firstRoute && firstRoute !== "/") {
                    next({ path: firstRoute, replace: true });
                    return;
                  }
                }

                next({ ...to, replace: true });
                return;
              } catch (err) {
                console.error(
                  "[Permission] 处理 menuData 失败，回退到独立模式:",
                  err
                );
                // 继续执行下面的 GenerateRoutes
              }
            } else {
              console.log(
                "[Permission] 微前端环境但 menuData 无效，回退到独立模式"
              );
            }

            // ❌ 独立运行模式，调用 GenerateRoutes
            store.dispatch("GenerateRoutes", { roles }).then((accessRoutes) => {
              // 测试 默认静态页面
              // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes); // 动态添加可访问路由表
              isLoadingRoutes = false;
              // store.commit('SOCKET_SEND')

              // ✅ 权限 + 路由加载完成，移除首屏 loading
              document.body.classList.add("loaded");

              // 预加载微应用
              if (window.Vue && window.Vue.prototype.$preloadMicroApps) {
                window.Vue.prototype.$preloadMicroApps();
              }

              // 如果访问的是根路径，重定向到第一个有权限的菜单
              if (to.path === "/" || to.path === "") {
                const firstRoute = getFirstAccessibleRoute(accessRoutes);
                if (firstRoute && firstRoute !== "/") {
                  next({ path: firstRoute, replace: true });
                  return;
                }
              }

              // 在微前端环境下，如果有待处理的路由，导航到该路由
              if (allowMainSync && pendingRoute) {
                const targetPath = pendingRoute;
                pendingRoute = null;
                console.log(
                  "[Permission] 微前端环境，导航到待处理路径:",
                  targetPath
                );
                next({ path: targetPath, replace: true });
                return;
              }

              // 如果当前要跳转到 404，尝试从 wujie props 获取原始路径
              if (allowMainSync && to.path === "/404") {
                let originalPath = window.$wujie?.props?.currentRoute?.path;
                if (!originalPath) {
                  const hash = window.location.hash;
                  if (hash && hash.startsWith("#")) {
                    originalPath = hash.slice(1).split("?")[0];
                  }
                }
                if (
                  originalPath &&
                  originalPath !== "/404" &&
                  originalPath !== "/"
                ) {
                  console.log(
                    "[Permission] 微前端环境，从 404 导航到原始路径:",
                    originalPath
                  );
                  next({ path: originalPath, replace: true });
                  return;
                }
              }

              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
            });
          })
          .catch((err) => {
            console.error("[Permission] 获取用户信息失败:", err);
            isLoadingRoutes = false;
            // ✅ 错误分支也要移除 loading
            document.body.classList.add("loaded");
            // 在微前端环境下，不要自己处理登出，通知主应用处理
            if (allowMainSync && window.$wujie?.bus) {
              console.log("[Permission] 微前端环境，通知主应用处理登出");
              window.$wujie.bus.$emit("session-expired", { message: err });
              done();
              return;
            }
            store.dispatch("FedLogOut").then(() => {
              Message.error(err);
              next({ path: "/" });
            });
          });
      } else {
        // ✅ roles 已有值，直接移除 loading
        document.body.classList.add("loaded");
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      document.body.classList.add("loaded");
      next();
    } else {
      // 在微前端环境下，不要跳转到登录页，通知主应用处理
      if (allowMainSync && window.$wujie?.bus) {
        console.log("[Permission] 微前端环境无 token，通知主应用处理");
        document.body.classList.add("loaded");
        window.$wujie.bus.$emit("session-expired", { redirect: to.fullPath });
        done();
        return;
      }
      document.body.classList.add("loaded");
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`); // 否则全部重定向到登录页
      done();
    }
  }
});

router.afterEach((to) => {
  done();

  // 如果在微前端环境下运行，且允许与主应用同步路由
  const allowMainSync = isMainAppSyncEnabled() && window.$wujie?.bus;

  if (allowMainSync) {
    // 不要通知 V3 跳转到错误页面（404、401、login 等）
    const ignorePaths = ["/404", "/401", "/login"];
    if (ignorePaths.includes(to.path)) {
      console.log("📤 V2 跳转到错误页面，不通知 V3:", to.path);
      return;
    }

    const routeData = {
      path: to.path,
      fullPath: to.fullPath,
      query: to.query,
      params: to.params,
      name: to.name,
      meta: to.meta,
    };
    console.log("📤 V2通知V3路由变化:", routeData);
    window.$wujie.bus.$emit("sub-app-route-change", routeData);
  }
});
