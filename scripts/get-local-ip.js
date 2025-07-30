const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // 跳过内部和非IPv4地址
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return '127.0.0.1'; // 默认值
}

function updateMicroAppsConfig() {
  const localIP = getLocalIP();
  const configPath = path.join(__dirname, '../src/config/local-ip.json');
  
  // 创建配置文件
  const config = {
    localIP: localIP,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`本机IP地址已更新: ${localIP}`);
  console.log(`配置文件路径: ${configPath}`);
}

updateMicroAppsConfig();