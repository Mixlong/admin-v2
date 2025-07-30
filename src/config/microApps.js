// 微应用配置文件
import localIPConfig from './local-ip.json';

// 获取本机IP地址
function getLocalIP() {
  // 在浏览器环境中，我们使用当前页面的hostname
  if (typeof window !== 'undefined') {
    // 如果是localhost或127.0.0.1，尝试使用真实IP
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 开发环境下，使用脚本生成的动态IP地址
      return localIPConfig.localIP || '192.168.2.15';
    }
    return hostname;
  }
  return localIPConfig.localIP || '192.168.2.15'; // 使用脚本生成的动态IP
}

const LOCAL_IP = getLocalIP();

function getMicroAppUrl(devPort) {
  if (process.env.NODE_ENV === 'development') {
    return `http://${LOCAL_IP}:${devPort}`;
  } else if (process.env.VUE_APP_ENV === 'test') {
    return 'http://test-cloud.riding-evolved.com/admin-v3/';
  } else {
    return 'http://cloud-v3.riding-evolved.com';
  }
}

export const MICRO_APP_CONFIG = {
  'ruoyi-admin': {
    name: 'ruoyi-admin',
    url: getMicroAppUrl(3002),
    alive: true,
    description: 'RuoYi管理系统模块'
  }
}

// 根据路径前缀自动识别微应用
export const AUTO_MICRO_ROUTES = {
  '/ruoyi-admin': 'ruoyi-admin'
}

// 解析微应用配置
export function parseMicroAppConfig(component, routePath) {
  // 格式: micro:应用名:子路径
  // 例如: micro:ruoyi-admin:index
  console.log('解析微应用配置:', component, routePath)

  const parts = component.split(':');
  const appName = parts[1];
  const subPath = parts[2] || '';

  console.log('解析结果:', { appName, subPath, parts })

  const config = MICRO_APP_CONFIG[appName];
  if (!config) {
    console.warn(`未找到微应用配置: ${appName}`, Object.keys(MICRO_APP_CONFIG));
    return null;
  }

  // 选项1: 为每个子路径创建独立实例（当前行为）
  const uniqueName = subPath ? `${appName}-${subPath}` : appName;

  // 选项2: 共享同一个iframe实例（所有subPath使用同一个iframe）
  // const uniqueName = appName;

  const result = {
    ...config,
    name: uniqueName, // 使用包含subPath的唯一名称
    alive: true, // 启用保活模式
    props: {
      subPath,
      routePath,
      timestamp: Date.now()
    }
  };

  console.log('最终配置:', result)
  return result;
}

// 根据路径自动判断是否为微应用
export function isMicroAppRoute(path) {
  return Object.keys(AUTO_MICRO_ROUTES).some(prefix => path.startsWith(prefix));
}

// 获取微应用名称
export function getMicroAppName(path) {
  for (const [prefix, appName] of Object.entries(AUTO_MICRO_ROUTES)) {
    if (path.startsWith(prefix)) {
      return appName;
    }
  }
  return null;
}

// 打印当前配置信息
console.log('微应用配置信息:', {
  localIP: LOCAL_IP,
  environment: process.env.NODE_ENV,
  apps: Object.keys(MICRO_APP_CONFIG)
});