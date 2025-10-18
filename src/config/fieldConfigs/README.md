# 字段配置管理

## 目录结构

```
fieldConfigs/
├── packaging/       # 包装信息字段配置
│   ├── index.js    # 统一导出
│   ├── fields.js   # 字段定义（改字段在这里）
│   ├── utils.js    # 工具函数
│   └── README.md
└── README.md       # 本文档
```

## 现有模块

### packaging（包装信息）

```javascript
import { PACKAGING_FIELDS, getFieldValue } from '@/config/fieldConfigs/packaging'
```

详见 [packaging/README.md](./packaging/README.md)

## 添加新模块

参考 `packaging/` 的结构，创建新目录即可：

```
your-module/
├── index.js      # 统一导出
├── fields.js     # 字段定义
├── utils.js      # 工具函数（可选）
└── README.md
```
