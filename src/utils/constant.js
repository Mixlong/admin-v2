// export const IP = 'http://172.16.0.151:5280'  // 公司
// export const WS = 'ws://172.16.0.151:8088/ws'  // 公司

// export const IP = 'http://192.168.3.7:5280'  // 家
// export const WS = 'ws://192.168.3.7:8088/ws'  // 家
//

import url from './requestUrl';
let i = url.indexOf ('//') + 2;
let y = url.lastIndexOf (':');
let newUrl = url.slice (i, y > i ? y : undefined);

// export const IP = 'http://chat-api.zjoker5.top'; // 外网
// export const WS = 'ws://' + newUrl + ':8089/ws'; // 外网
