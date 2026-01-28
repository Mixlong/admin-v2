// 兼容 Vite (import.meta.env) 与 Webpack (process.env) 的安全获取方式
let viteEnv = {};
try {
  // 使用运行时构造函数避免老版打包器解析 import.meta 时报错
  // es
  // lint-disable-next-line no-new-func
  viteEnv = new Function(
    'return typeof import.meta !== "undefined" ? import.meta.env : {}'
  )();
} catch (e) {
  viteEnv = {};
}

const nodeEnv =
  typeof process !== "undefined" && process.env ? process.env : {};

const currentEnv = viteEnv.MODE || nodeEnv.NODE_ENV || "development";
const productionBase =
  viteEnv.VITE_APP_BASE_API ||
  viteEnv.BASE_URL || // vite 兜底
  nodeEnv.VUE_APP_BASE_API ||
  "";

const baseApiList = {
  // 测试
  // development: "http://192.168.2.127:8808",
  development: "http://test-admin.riding-evolved.com",
  test: "http://test-admin.riding-evolved.com",
  // development: "http://192.168.2.43:8111",
  // development: "http://192.168.2.26:8100",
  development: "http://config-admin-api.riding-evolved.com",
  // 生产
  production: productionBase,
};

const url = baseApiList[currentEnv] || productionBase;

export default url;
