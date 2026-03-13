import { constantRoutes } from "@/router";
import { getRouters } from "@/api/menu";
import Layout from "@/layout/index";
import ParentView from "@/components/ParentView";
import MicroAppContainer from "@/components/MicroAppContainer";
import { parseMicroAppConfig } from "@/config/microApps";

const permission = {
  state: {
    routes: [],
    addRoutes: [],
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes;
      state.routes = constantRoutes.concat(routes);
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise((resolve) => {
        // 向后端请求路由数据
        getRouters().then((res) => {
          const accessedRoutes = filterAsyncRouter(res.data);
          accessedRoutes.push({ path: "*", redirect: "/404", hidden: true });
          commit("SET_ROUTES", accessedRoutes);
          resolve(accessedRoutes);
        });
      });
    },
  },
};

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter((route) => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout;
      } else if (route.component === "ParentView") {
        route.component = ParentView;
      } else if (route.component === "MicroApp") {
        // 微应用组件特殊处理
        route.component = MicroAppContainer;
      } else if (
        typeof route.component === "string" &&
        route.component.trim().indexOf("micro:") === 0
      ) {
        // 微应用路径标识处理 (格式: micro:应用名:路径)
        const originalComponent = route.component.trim();
        route.component = MicroAppContainer;

        // 解析微应用配置
        route.meta = route.meta || {};
        route.meta.microApp = parseMicroAppConfig(
          originalComponent,
          route.path
        );
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    }
    return true;
  });
}

// 导出 filterAsyncRouter 供微前端环境使用
export { filterAsyncRouter };

export const loadView = (view) => {
  // 防止微应用路径误入loadView
  if (typeof view === "string" && view.indexOf("micro:") !== -1) {
    console.error("微应用路径不应该进入loadView:", view);
    return () => import("@/components/MicroAppContainer.vue");
  }

  // 兼容后端返回路径：允许带/或.vue后缀
  const normalized = String(view || "")
    .replace(/^\/+/, "")
    .replace(/\.vue$/i, "");

  // 路由懒加载，组件缺失时降级到 404，避免导航链路中断
  return (resolve) =>
    require(
      [`@/views/${normalized}`],
      resolve,
      (err) => {
        console.error("[permission/loadView] 组件加载失败:", view, err);
        require(["@/views/error/404.vue"], resolve);
      }
    );
};

// parseMicroAppConfig 已从 @/config/microApps 导入

export default permission;
