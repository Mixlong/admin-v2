let url = process.env.NODE_ENV === 'development'
  ? 'http://192.168.2.126:8808'
  // ? "http://39.104.202.51:18000"
  //"http://config-api.riding-evolved.com"
  //'http://192.168.2.22:8805'
  : process.env.VUE_APP_BASE_API
export default url;
