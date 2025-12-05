# 出货订单管理系统 - 环境配置说明

## 技术栈

- **前端框架**: Vue 3.5.16 (Composition API)
- **构建工具**: Vite 6.3.5
- **表格组件**: vxe-table 4.9.5
- **UI组件库**: Element Plus 2.9.9
- **富文本编辑器**: Quill 2.0.2 + @vueup/vue-quill 1.2.0
- **Excel导出**: ExcelJS 4.4.0 + vxe-table-plugin-export-xlsx 4.0.7
- **状态管理**: Pinia 3.0.2
- **HTTP客户端**: Axios 1.9.0
- **工具库**: xe-utils 3.5.30

## 开发工具

- **代码规范**: ESLint 8.57.1 + Prettier 3.4.2
- **Vue插件**: @vitejs/plugin-vue 5.2.4
- **自动导入**: unplugin-auto-import 0.18.6

## 环境要求

- Node.js >= 20.18.0
- npm >= 10.8.2

## 安装依赖

```bash
npm install
```

## 开发命令

```bash
# 启动开发服务器 (端口: 3002)
npm run dev

# 代码检查和修复
npm run lint

# 代码格式化
npm run format

# 生产构建
npm run build:prod

# 测试环境构建
npm run build:test

# 预览构建结果
npm run preview
```

## 开发服务器配置

- **端口**: 3002
- **主机**: 0.0.0.0 (允许外部访问)
- **跨域**: 已启用 CORS
- **代理**: /dev-api -> http://localhost:8080

## 代码规范

### ESLint 配置

- 基于 Vue 3 推荐规则
- 集成 Prettier 格式化
- 支持 Composition API 全局变量

### Prettier 配置

- 不使用分号
- 单引号
- 每行最大100字符
- 不使用尾随逗号

## 构建优化

### 代码分割策略

- `vxe-table`: vxe-table + xe-utils
- `element-plus`: element-plus + @element-plus/icons-vue
- `quill`: quill + @vueup/vue-quill
- `exceljs`: exceljs
- `vue-vendor`: vue + vue-router + pinia

### 构建配置

- 输出目录: `admin-v3/`
- 静态资源目录: `assets/`
- Chunk 大小警告限制: 2000KB

## 子应用访问问题解决

如果子应用无法访问，请确保：

1. Vite 配置中 `host: '0.0.0.0'` 已设置
2. CORS 已启用
3. 防火墙允许 3002 端口
4. 主应用的微前端配置正确

## 下一步

环境配置完成后，可以开始实施以下任务：

- [ ] 任务2: 项目结构搭建
- [ ] 任务3: 基础组件封装
- [ ] 任务4: 数据加载与管理

## 相关文档

- [需求文档](../../.kiro/specs/shipment-order-enhancements/requirements.md)
- [设计文档](../../.kiro/specs/shipment-order-enhancements/design.md)
- [任务列表](../../.kiro/specs/shipment-order-enhancements/tasks.md)
