# 微前端集成检查清单

## ✅ 配置完成检查

### V3 主应用

- [x] 安装 `wujie-vue3` 依赖
- [x] 创建 `src/config/microApps.js` 配置文件
- [x] 创建 `src/components/MicroAppContainer.vue` 容器组件
- [x] 在 `src/main.js` 中注册 Wujie
- [x] 在 `src/router/index.js` 中配置微应用路由
- [x] 配置统一开关管理

### V2 子应用

- [x] 安装 `wujie-vue2` 依赖
- [x] 在 `src/main.js` 中添加生命周期钩子
- [x] 配置路由模式（微前端模式下使用 hash）
- [x] 在 `vue.config.js` 中配置 CORS
- [x] 配置主子应用数据同步

### 工具和文档

- [x] 创建启动脚本 `start-micro-apps.sh`
- [x] 创建停止脚本 `stop-micro-apps.sh`
- [x] 创建配置检查脚本 `check-micro-config.sh`
- [x] 创建完整集成文档
- [x] 更新主 README

## 🧪 测试清单

### 基础功能测试

- [ ] V2 子应用可以独立启动和访问
- [ ] V3 主应用可以独立启动和访问
- [ ] V2 可以在 V3 中正常加载
- [ ] 配置检查脚本运行正常

### 数据同步测试

- [ ] 登录后 Token 正确同步到子应用
- [ ] 用户信息正确同步到子应用
- [ ] 权限信息正确同步到子应用
- [ ] 子应用可以使用主应用的 Token 调用 API

### 路由测试

- [ ] 主应用可以跳转到子应用路由
- [ ] 子应用内部路由跳转正常
- [ ] 子应用可以跳转回主应用
- [ ] 浏览器前进后退按钮正常工作

### 样式测试

- [ ] 主子应用样式不冲突
- [ ] 子应用样式正常显示
- [ ] 全局样式不互相影响

### 性能测试

- [ ] 子应用加载速度正常
- [ ] 切换路由时子应用保活正常
- [ ] 内存占用正常

## 🚀 部署清单

### 开发环境

- [ ] V2 子应用在 8080 端口启动
- [ ] V3 主应用在 5173 端口启动
- [ ] 本地 IP 配置正确

### 测试环境

- [ ] 配置测试环境域名
- [ ] 配置 Nginx 反向代理
- [ ] 测试环境集成正常

### 生产环境

- [ ] 配置生产环境域名
- [ ] 配置 Nginx 反向代理
- [ ] 生产环境集成正常
- [ ] 性能优化完成

## 📝 文档清单

- [x] MICRO_FRONTEND_INTEGRATION.md - 完整集成文档
- [x] MICRO_FRONTEND_QUICK_START.md - 快速启动指南
- [x] MICRO_FRONTEND_SUMMARY.md - 完成总结
- [x] MICRO_FRONTEND_CHECKLIST.md - 检查清单
- [x] README.md - 主 README 更新

## 🔧 配置文件清单

### V3 主应用
- [x] `micro-apps/admin-fileconf-v3/package.json`
- [x] `micro-apps/admin-fileconf-v3/src/config/microApps.js`
- [x] `micro-apps/admin-fileconf-v3/src/components/MicroAppContainer.vue`
- [x] `micro-apps/admin-fileconf-v3/src/main.js`
- [x] `micro-apps/admin-fileconf-v3/src/router/index.js`

### V2 子应用
- [x] `package.json`
- [x] `src/main.js`
- [x] `src/router/index.js`
- [x] `vue.config.js`

### 工具脚本
- [x] `start-micro-apps.sh`
- [x] `stop-micro-apps.sh`
- [x] `check-micro-config.sh`

## ✅ 验证步骤

1. **运行配置检查**
   ```bash
   ./check-micro-config.sh
   ```
   确保所有检查项通过

2. **启动应用**
   ```bash
   ./start-micro-apps.sh
   ```

3. **访问测试**
   - 访问 V3: http://localhost:5173
   - 登录系统
   - 访问 V2 路由: http://localhost:5173/v2/xxx
   - 验证功能正常

4. **停止应用**
   ```bash
   ./stop-micro-apps.sh
   ```

## 🎯 下一步行动

1. [ ] 运行配置检查脚本
2. [ ] 启动应用进行测试
3. [ ] 完成基础功能测试
4. [ ] 完成数据同步测试
5. [ ] 完成路由测试
6. [ ] 配置生产环境
7. [ ] 部署到测试环境
8. [ ] 部署到生产环境

## 📞 问题反馈

如遇到问题，请检查：
1. 配置检查脚本输出
2. 浏览器控制台错误
3. 网络请求是否正常
4. CORS 配置是否正确

参考文档：
- [完整集成文档](./MICRO_FRONTEND_INTEGRATION.md)
- [常见问题](./MICRO_FRONTEND_INTEGRATION.md#七常见问题)
