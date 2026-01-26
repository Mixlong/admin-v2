# 登录页面迁移说明

## 迁移内容

已将 V2 版本的登录逻辑完整迁移到 V3 版本，包括：

### 1. 基础登录功能
- 用户名/密码登录
- 记住密码功能
- 表单验证

### 2. 短信验证码二次验证
- 当登录返回 40010 错误码时，触发短信验证流程
- 选择管理员接收验证码
- 输入验证码完成二次验证
- 验证码倒计时功能（60秒）

### 3. UI 样式
- 采用 V2 的双栏布局设计
- 左侧：Logo + 标题
- 右侧：登录表单
- 响应式设计支持

## 主要改动

### 文件变更

1. **micro-apps/admin-fileconf-v3/src/views/login.vue**
   - 完整替换为 V2 的登录逻辑
   - 使用 Vue 3 Composition API 重写
   - 保留短信验证码弹窗功能

2. **micro-apps/admin-fileconf-v3/src/api/login.js**
   - 新增 `getSmsSend` - 发送短信验证码
   - 新增 `getSmsVerify` - 校验短信验证码
   - 新增 `getSmsUser` - 获取管理员列表

3. **micro-apps/admin-fileconf-v3/src/utils/request.js**
   - 修改响应拦截器，支持 40010 错误码处理
   - 当返回 40010 时，不显示错误消息，直接返回错误码
   - 其他非 200 错误码也返回错误码而不是 'error' 字符串

### 技术栈差异处理

| V2 (Options API) | V3 (Composition API) | 说明 |
|-----------------|---------------------|------|
| `this.$refs` | `ref()` + `.value` | 模板引用 |
| `data()` | `ref()` / `reactive()` | 响应式数据 |
| `computed` | `computed()` | 计算属性 |
| `watch` | `watch()` | 监听器 |
| `mounted` | `onMounted()` | 生命周期 |
| `destroyed` | `onUnmounted()` | 生命周期 |
| `this.$message` | `proxy.$message` | 全局方法 |

## 环境变量适配

V2 使用 `process.env.NODE_ENV`，V3 使用 `import.meta.env.MODE`：

```javascript
// V2
process.env.NODE_ENV === 'development'

// V3
import.meta.env.MODE === 'development'
```

### 环境配置文件

已更新以下环境配置文件：

#### .env.development（开发环境）
```bash
VITE_APP_TITLE = 迪太云
VITE_APP_ENV = 'development'
VITE_APP_BASE_API = 'http://test-admin.riding-evolved.com'
```

可选的开发环境 API 地址（已注释）：
- `http://192.168.2.127:8808`
- `http://192.168.2.21:8111`
- `http://192.168.2.26:8100`

#### .env.staging（测试环境）
```bash
VITE_APP_TITLE = 迪太云
VITE_APP_ENV = 'staging'
VITE_APP_BASE_API = 'http://test-admin.riding-evolved.com'
```

#### .env.production（生产环境）
```bash
VITE_APP_TITLE = 迪太云
VITE_APP_ENV = 'production'
VITE_APP_BASE_API = 'http://config-admin-api.riding-evolved.com'
```

## 后端接口要求

需要后端提供以下接口：

1. **POST /login** - 基础登录
   - 参数：`{ username, password, code, uuid }`
   - 成功返回：`{ code: 200, token: "..." }`
   - 需要短信验证时返回：`{ code: 40010, msg: "需要短信验证" }`

2. **POST /sms/send** - 发送短信验证码
   - 参数：`{ username, password, phone }`
   - 返回：`{ code: 200, msg: "发送成功" }`

3. **POST /sms/verify** - 校验短信验证码
   - 参数：`{ username, password, phone, code }`
   - 返回：`{ code: 200, data: { iamKey, iamValue, token } }`

4. **GET /sms/user** - 获取管理员列表
   - 返回：`{ code: 200, data: [{ dictLabel, dictValue }] }`

### 错误码说明

- **40010**：需要短信验证码二次验证
  - 前端收到此错误码后，会弹出短信验证码对话框
  - 不会显示错误消息，直接进入验证流程

## 使用说明

### 正常登录流程
1. 输入用户名和密码
2. 点击"登录"按钮
3. 登录成功，跳转到首页

### 短信验证流程
1. 输入用户名和密码
2. 点击"登录"按钮
3. 如果需要短信验证，弹出验证码对话框
4. 选择接收验证码的管理员
5. 点击"获取验证码"（开发环境可见）
6. 输入收到的验证码
7. 点击"确定"完成验证
8. 验证成功，跳转到首页

## 注意事项

1. **防重复提交**：登录和验证码提交都有 loading 状态防止重复点击
2. **验证码倒计时**：60秒倒计时，期间不能重复获取
3. **Cookie 存储**：记住密码功能使用 Cookie 存储（30天有效期）
4. **密码加密**：使用 jsencrypt 加密存储密码
5. **开发环境**：默认填充 admin/admin123，方便开发调试

## 测试建议

1. 测试正常登录流程
2. 测试短信验证流程（需要后端返回 40010）
3. 测试记住密码功能
4. 测试验证码倒计时
5. 测试表单验证
6. 测试响应式布局（不同屏幕尺寸）
