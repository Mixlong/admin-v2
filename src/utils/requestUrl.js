let url =
  process.env.NODE_ENV === "development"
    ? "http://192.168.2.126:8808"
    : // "http://config-admin-api.riding-evolved.com"
      process.env.VUE_APP_BASE_API;
export default url;
