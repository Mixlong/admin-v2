const baseApiList = {
  // 测试
  development: "http://192.168.2.126:8808",
  // development: "http://test-admin.riding-evolved.com",
  // 生产
  production: process.env.VUE_APP_BASE_API,
};

const currentEnv = process.env.NODE_ENV;

const url = baseApiList[currentEnv];

export default url;
