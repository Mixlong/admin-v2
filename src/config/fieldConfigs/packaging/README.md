# 包装信息字段配置

## 现状说明

**目前方案**：配置文件管理 script 逻辑，template 还是手动写的
- ✅ script 里的逻辑都从配置读取（自动处理）
- ❌ template 里的字段还需要手动改（Vue 限制）

**改字段需要改 2 处**：
1. 配置文件的字段定义
2. template 的 label 和 v-model

## 更好的方案（可选）

**完全配置驱动**：template 也用 `v-for` 从配置读取

优势：**改字段真的只需改配置一处**

详见 [EXAMPLE.md](./EXAMPLE.md)

## 快速使用

### 修改字段

打开 `fields.js`：

```javascript
按键螺钉: {  // 改名字
  key: '按键螺钉',
  displayName: '按键螺钉',
  aliases: ['按栓螺丝', '按键螺丝'],  // 旧名字自动兼容
  formType: 'select',
  options: [...]
}
```

### 导入使用

```javascript
import { PACKAGING_FIELDS, getFieldValue } from '@/config/fieldConfigs/packaging'
```

## 文件说明

- `fields.js` - 字段定义（改字段在这里）
- `utils.js` - 工具函数
- `index.js` - 统一导出
- `EXAMPLE.md` - 完全配置驱动的方案示例
