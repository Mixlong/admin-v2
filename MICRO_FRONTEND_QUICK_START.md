# 微前端快速启动指南

## 一、快速启动（推荐）

### 方式一：使用启动脚本（macOS/Linux）

```bash
# 启动所有应用
./start-micro-apps.sh

# 停止所有应用
./stop-micro-apps.sh
```

### 方式二：手动启动

**1. 启动 V2 子应用**

```bash
cd /Users/dragons/Desktop/project/FILECONF-UI
npm run dev
```

**2. 启动 V3 主应用**

```bash
cd micro-apps/admin-fileconf-v3
npm run dev
```

## 二、访问地址

- **V3 主应用**: http://localhost:5173
- **V2 子应用**: http://localhost:8080
- **V2 在 V3 中**: http://localhost:5173/v2/xxx

## 三、配置开关

编辑 `micro-apps/admin-fileconf-v3/src/config/microApps.js`:

```javascript
export const MICRO_APP_CONFIG = {
  'admin-v2': {
    enabled: true, // 改为 false 即可禁用 V2 子应用
  }
}
```

## 四、常见问题

### 1. 子应用加载失败

- 确保 V2 子应用已启动（端口 8080）
- 检查浏览器控制台是否有 CORS 错误
- 检查 `microApps.js` 中的 URL 配置

### 2. Token 同步失败

- 检查浏览器控制台是否有 `main-store-sync` 事件
- 确保 V2 的 `src/main.js` 已添加微前端生命周期钩子

### 3. 路由跳转失败

- 确保 V2 使用 `hash` 模式
- 检查路由前缀配置是否正确

## 五、详细文档

查看完整文档: [MICRO_FRONTEND_INTEGRATION.md](./MICRO_FRONTEND_INTEGRATION.md)
