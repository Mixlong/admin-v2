# V3 环境配置说明

## 配置文件

V3 使用 Vite 的环境变量配置方式，配置文件位于项目根目录：

- `.env.development` - 开发环境
- `.env.staging` - 测试环境
- `.env.production` - 生产环境

## 当前配置

### 开发环境 (.env.development)

```bash
# 页面标题
VITE_APP_TITLE = 迪太云

# 开发环境配置
VITE_APP_ENV = 'development'

# 迪太云/开发环境
VITE_APP_BASE_API = 'http://test-admin.riding-evolved.com'
```

**可选的开发环境 API 地址**（已注释，需要时取消注释）：
```bash
# VITE_APP_BASE_API = 'http://192.168.2.127:8808'
# VITE_APP_BASE_API = 'http://192.168.2.21:8111'
# VITE_APP_BASE_API = 'http://192.168.2.26:8100'
```

### 测试环境 (.env.staging)

```bash
# 页面标题
VITE_APP_TITLE = 迪太云

# 测试环境配置
VITE_APP_ENV = 'staging'

# 迪太云/测试环境
VITE_APP_BASE_API = 'http://test-admin.riding-evolved.com'

# 是否在打包时开启压缩，支持 gzip 和 brotli
VITE_BUILD_COMPRESS = gzip
```

### 生产环境 (.env.production)

```bash
# 页面标题
VITE_APP_TITLE = 迪太云

# 生产环境配置
VITE_APP_ENV = 'production'

# 迪太云/生产环境
VITE_APP_BASE_API = 'http://config-admin-api.riding-evolved.com'

# 是否在打包时开启压缩，支持 gzip 和 brotli
VITE_BUILD_COMPRESS = gzip
```

## 使用方式

### 在代码中访问环境变量

```javascript
// 获取 API 基础地址
const baseURL = import.meta.env.VITE_APP_BASE_API

// 获取应用标题
const title = import.meta.env.VITE_APP_TITLE

// 获取当前环境
const env = import.meta.env.MODE // 'development' | 'staging' | 'production'

// 判断是否为开发环境
const isDev = import.meta.env.MODE === 'development'
```

### 运行不同环境

```bash
# 开发环境
npm run dev

# 测试环境构建
npm run build:stage

# 生产环境构建
npm run build:prod
```

## 与 V2 的差异

| 项目 | V2 (Webpack) | V3 (Vite) |
|------|-------------|-----------|
| 配置文件 | `src/utils/requestUrl.js` | `.env.*` 文件 |
| 环境变量前缀 | `VUE_APP_` | `VITE_APP_` |
| 访问方式 | `process.env.VUE_APP_*` | `import.meta.env.VITE_APP_*` |
| 环境判断 | `process.env.NODE_ENV` | `import.meta.env.MODE` |
| 配置方式 | JavaScript 对象 | 环境变量文件 |

## 注意事项

1. **环境变量必须以 `VITE_` 开头**才能在客户端代码中访问
2. **修改 `.env` 文件后需要重启开发服务器**才能生效
3. **不要在 `.env` 文件中存储敏感信息**（如密钥、密码等）
4. **生产环境的配置应该在部署时通过环境变量注入**，而不是硬编码在代码中

## 切换开发环境 API

如果需要切换到本地开发环境，编辑 `.env.development` 文件：

```bash
# 注释掉当前的
# VITE_APP_BASE_API = 'http://test-admin.riding-evolved.com'

# 取消注释需要的地址
VITE_APP_BASE_API = 'http://192.168.2.21:8111'
```

然后重启开发服务器：
```bash
npm run dev
```

## API 地址说明

| 地址 | 说明 | 用途 |
|------|------|------|
| `http://test-admin.riding-evolved.com` | 测试服务器 | 开发/测试环境 |
| `http://config-admin-api.riding-evolved.com` | 生产服务器 | 生产环境 |
| `http://192.168.2.127:8808` | 本地开发 | 本地调试 |
| `http://192.168.2.21:8111` | 本地开发 | 本地调试 |
| `http://192.168.2.26:8100` | 本地开发 | 本地调试 |
