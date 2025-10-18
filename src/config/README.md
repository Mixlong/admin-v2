# Config 配置目录

## 目录结构

```
src/config/
├── fieldConfigs/          # 字段配置管理
│   └── packaging/        # 包装信息字段
│       ├── fields.js     # 字段定义（改这里）
│       ├── utils.js      # 工具函数
│       ├── index.js      # 统一导出
│       ├── README.md     # 使用说明
│       └── EXAMPLE.md    # 完全配置驱动方案
├── local-ip.json         # 本地IP配置
├── microApps.js          # 微应用配置
└── README.md
```

## 现状说明

### 当前方案
- ✅ **script 逻辑**：完全从配置读取（自动处理）
- ❌ **template**：还需要手动改字段名

**改字段需要改 2 处**：配置 + template

### 更好的方案（可选升级）
- ✅ **完全配置驱动**：template 用 `v-for` 从配置读取
- ✅ **真正统一**：改字段只需改配置 1 处

详见 [packaging/EXAMPLE.md](./fieldConfigs/packaging/EXAMPLE.md)

## 快速使用

### 修改字段

打开 `fieldConfigs/packaging/fields.js`：

```javascript
按键螺钉: {
  key: '按键螺钉',
  displayName: '按键螺钉',
  aliases: ['按栓螺丝', '按键螺丝'],  // 旧名字自动兼容
  formType: 'select',
  defaultValue: '锁上出货',
  options: [...]
}
```

然后在 template 改对应的 label 和 v-model。

**或者**按照 EXAMPLE.md 改造成完全配置驱动，就不用改 template 了。

## 详细文档

- [fieldConfigs/README.md](./fieldConfigs/README.md) - 字段配置总览
- [packaging/README.md](./fieldConfigs/packaging/README.md) - 包装信息说明  
- [packaging/EXAMPLE.md](./fieldConfigs/packaging/EXAMPLE.md) - 完全配置驱动方案
