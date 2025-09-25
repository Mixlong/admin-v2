# Dynamic Table Height Mixin

动态表格高度计算 Mixin，用于自动计算表格高度，响应搜索表单区域的折叠/展开。

## 使用方法

### 1. 基础用法

```javascript
// 在组件中引入mixin
import dynamicTableHeightMixin from "@/mixins/dynamicTableHeight";

export default {
  mixins: [dynamicTableHeightMixin],
  // ... 其他配置
};
```

```html
<!-- 在模板中使用动态高度 -->
<el-table :height="dynamicTableHeight" ...>
  <!-- 表格内容 -->
</el-table>
```

### 2. IntelligentSearchForm 字段配置优化

新版本支持将排序权重直接整合到字段配置中：

```javascript
// 新的推荐配置方式
searchFields: [
  {
    key: 'workOrderNo',
    label: '工单号',
    component: 'el-autocomplete',
    sort: 1    // 直接在字段中配置排序权重（数字越小越靠前）
  },
  {
    key: 'categoryName',
    label: '品类名称',
    component: 'el-select',
    sort: 2
  }
]

// 旧的配置方式（仍支持，但已废弃）
fieldPriorities: {
  workOrderNo: 10,
  categoryName: 9
}
```

### 3. 自定义配置

```javascript
mounted() {
  // 使用自定义配置初始化
  this.initDynamicTableHeight({
    searchFormSelector: '.my-search-form',  // 自定义搜索表单选择器
    topOffset: 200,                         // 自定义顶部固定区域高度
    minHeight: 400,                         // 自定义最小表格高度
    debounceTime: 150                       // 自定义防抖时间
  })
}
```

### 4. 手动刷新

```javascript
methods: {
  handleSomeAction() {
    // 某些操作后手动刷新表格高度
    this.refreshTableHeight()
  }
}
```

## 配置选项

| 参数               | 类型   | 默认值                     | 描述               |
| ------------------ | ------ | -------------------------- | ------------------ |
| searchFormSelector | String | '.intelligent-search-form' | 搜索表单容器选择器 |
| topOffset          | Number | 244                        | 顶部固定区域高度   |
| minHeight          | Number | 300                        | 表格最小高度       |
| debounceTime       | Number | 100                        | 防抖时间(ms)       |

## 提供的属性

- `dynamicTableHeight`: 计算出的动态表格高度

## 提供的方法

- `initDynamicTableHeight(options)`: 初始化动态表格高度
- `calculateTableHeight(customConfig)`: 计算表格高度
- `refreshTableHeight()`: 手动重新计算表格高度

## 工作原理

1. **监听机制**: 使用 ResizeObserver 监听搜索表单区域的高度变化
2. **计算公式**: `表格高度 = 窗口高度 - 顶部固定区域 - 搜索表单高度`
3. **防抖优化**: 避免频繁计算，提升性能
4. **自动清理**: 组件销毁时自动清理监听器

## 注意事项

1. 确保页面中存在搜索表单容器元素
2. 根据实际页面布局调整 `topOffset` 参数
3. 在开发环境下会输出详细的计算日志
4. 支持浏览器的 ResizeObserver API（现代浏览器都支持）
