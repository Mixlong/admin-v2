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

---

# DigiSmart 跳转处理 Mixin

用于处理从 **DigiSmart 桌面端应用**通过 URL 参数 `?id=xxx` 跳转到 Web 页面的场景。自动读取 ID 并执行查询，查询完成后会自动清除 URL 中的 id 参数。

## 使用场景

- **DigiSmart 桌面端跳转**: DigiSmart 应用点击某条记录，跳转到 Web 系统查看详情
- **支持分享链接**: 通过 URL 分享特定记录，打开后自动定位
- **保持界面整洁**: 不在界面上显示 ID 输入框，查询后自动清理 URL

## 使用方法

### 1. 基础用法

```javascript
// 在组件中引入 DigiSmart 跳转处理 mixin
import digiSmartJumpMixin from '@/mixins/digiSmartJump';

export default {
  mixins: [digiSmartJumpMixin],
  data() {
    return {
      queryParams: {
        p: 1,
        l: 30,
        id: null,  // 必须在 queryParams 中定义 id 字段
        // ... 其他查询参数
      }
    }
  },
  methods: {
    getList() {
      this.loading = true;
      someApi(this.queryParams).then(response => {
        this.auditList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
        // 查询完成后清除 DigiSmart 跳转 ID
        this.clearDigiSmartId();
      });
    }
  }
}
```

### 2. 完整示例（以审核列表为例）

```vue
<template>
  <div class="app-container">
    <!-- 搜索区域 - 不显示 ID 输入框 -->
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="版本号" prop="versionCode">
        <el-input v-model="queryParams.versionCode" clearable></el-input>
      </el-form-item>
      <!-- 其他搜索字段... -->
    </el-form>

    <!-- 表格 -->
    <el-table :data="auditList">
      <!-- 表格列... -->
    </el-table>
  </div>
</template>

<script>
import { sopAuditList } from "@/api/third/testApi";
import digiSmartJumpMixin from "@/mixins/digiSmartJump";

export default {
  name: "AuditList",
  mixins: [digiSmartJumpMixin],
  data() {
    return {
      auditList: [],
      queryParams: {
        p: 1,
        l: 30,
        versionCode: null,
        id: null  // 必需：用于接收 DigiSmart 跳转ID
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      sopAuditList(this.queryParams).then(response => {
        this.auditList = response.data.list;
        this.loading = false;
        // 查询完成后清除 DigiSmart 跳转 ID
        this.clearDigiSmartId();
      });
    }
  }
};
</script>
```

## 提供的方法

### initDigiSmartId()

自动在 `created` 钩子中调用，无需手动调用。

- **功能**: 读取 URL 参数中的 `id`（DigiSmart 跳转传递的 ID），并赋值给 `queryParams.id`
- **时机**: 组件创建时自动执行
- **日志**: 控制台输出 `[DigiSmart跳转] 接收到ID: xxx`

### clearDigiSmartId()

需要在数据请求成功后手动调用。

- **功能**: 清除 URL 中的 `id` 参数和 `queryParams.id`，恢复正常查询模式
- **时机**: 在数据查询的 `.then()` 回调中调用
- **日志**: 控制台输出 `[DigiSmart跳转] 已清除跳转ID，恢复正常查询模式`

## 工作流程

1. **DigiSmart 发起跳转**: 用户在桌面端点击记录，访问 `?id=f643df37bbe91d85cf48b3a571c7d6d4`
2. **自动读取 ID**: `created` 钩子自动执行 `initDigiSmartId()`，将 id 赋值给 `queryParams.id`
3. **执行查询**: `getList()` 执行查询，带上 DigiSmart 传递的 id 参数
4. **清理 URL**: 查询成功后调用 `clearDigiSmartId()`
5. **恢复正常**: URL 变为干净路径，`queryParams.id` 被清空
6. **后续操作不受影响**: 搜索、分页等操作正常进行

## 注意事项

1. **必须在 queryParams 中定义 `id: null` 字段**
2. **必须在数据查询成功后调用 `this.clearDigiSmartId()`**
3. **不要在模板中添加 ID 输入框**（DigiSmart 跳转是透明的，用户无需看到 ID）
4. **支持多页面使用**，各页面互不干扰
5. **开发时可查看控制台日志**，了解跳转状态

## 适用页面

该 mixin 特别适合以下 DigiSmart 跳转场景：
- **SOP 审核列表**: DigiSmart 查看审核详情
- **ECN 审核列表**: DigiSmart 查看变更详情
- **工单详情页**: DigiSmart 查看工单状态
- **任何需要从桌面端跳转的页面**
