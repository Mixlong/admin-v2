/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-08-17 13:30:11
 * @FilePath: \FILECONF-UI\src\utils\requestUrl.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let url = process.env.NODE_ENV === 'development'
  ? 
  'http://192.168.2.126:8808'
  // "http://config-admin-api.riding-evolved.com"
  : process.env.VUE_APP_BASE_API
export default url;
