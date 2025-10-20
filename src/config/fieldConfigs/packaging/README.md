# 包装信息字段配置

## 使用方法

```javascript
// 导入
import { PACKAGING_FIELDS, getFieldValue } from '@/config/fieldConfigs/packaging'

// 获取字段值（自动处理历史字段名）
const value = getFieldValue(data, '解件出库方式', '按键螺丝')
```

## 修改字段

打开 `fields.js`，找到对应字段修改：

```javascript
按键螺钉: {  // 改名字
  key: '按键螺钉',
  displayName: '按键螺钉',
  aliases: ['按栓螺丝', '按键螺丝']  // 旧名字加这里，自动兼容
}
```

## 文件说明

- `fields.js` - 字段定义（改字段在这里）
- `utils.js` - 工具函数（自动处理兼容）
- `index.js` - 统一导出
