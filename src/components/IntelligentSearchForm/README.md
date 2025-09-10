# IntelligentSearchForm 使用说明

## 新增配置选项

### 手动控制显示字段数量

可以通过 `defaultVisibleCount` 属性手动指定默认显示的字段数量：

```vue
<template>
  <!-- 示例1: 固定显示3个字段 -->
  <IntelligentSearchForm
    :searchForm="searchForm"
    :fields="fields"
    :defaultVisibleCount="3"
    @search="handleSearch"
  />

  <!-- 示例2: 自动计算（默认行为） -->
  <IntelligentSearchForm
    :searchForm="searchForm"
    :fields="fields"
    :defaultVisibleCount="0"
    @search="handleSearch"
  />

  <!-- 示例3: 限制最大显示字段数量 -->
  <IntelligentSearchForm
    :searchForm="searchForm"
    :fields="fields"
    :defaultVisibleCount="0"
    :maxVisibleCount="4"
    @search="handleSearch"
  />

  <!-- 示例4: 自定义标签宽度 -->
  <IntelligentSearchForm
    :searchForm="searchForm"
    :fields="fields"
    labelWidth="90px"
    @search="handleSearch"
  />
</template>
```

### Props 说明

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultVisibleCount` | Number | 0 | 手动指定默认显示的字段数量。0表示使用自动计算 |
| `maxVisibleCount` | Number | 6 | 最大显示字段数量限制 |
| `labelWidth` | String | '68px' | 表单标签宽度，支持px、rem等CSS单位 |

### 优先级说明

1. **手动配置优先**: 如果设置了 `defaultVisibleCount > 0`，将优先使用手动配置
2. **自动计算**: 如果 `defaultVisibleCount = 0`，使用改进的自动计算算法
3. **数量限制**: 无论手动还是自动，都会受到 `maxVisibleCount` 限制

### 自动计算算法改进

- **空间利用优化**: 改进了可用宽度计算，确保有空间时能够显示更多字段
- **安全边距**: 为按钮区域预留足够空间，防止覆盖
- **响应式**: 支持容器大小变化时动态重新计算
- **最小保证**: 即使空间很小，也至少显示1个字段

## 字段级别配置

每个字段都支持单独配置，可以覆盖全局设置：

```vue
<template>
  <IntelligentSearchForm
    :searchForm="searchForm"
    :fields="searchFields"
    labelWidth="68px"
    @search="handleSearch"
  />
</template>

<script>
export default {
  data() {
    return {
      searchForm: { /* ... */ },
      searchFields: [
        {
          key: 'workOrderNo',
          label: '工单号',
          component: 'el-input',
          sort: 1,
          // 字段级别配置
          labelWidth: '80px',        // 单独设置标签宽度
          width: '200px',            // 单独设置输入框宽度
          size: 'small',             // 单独设置尺寸
          clearable: false,          // 单独设置是否可清空
          placeholder: '请输入工单号', // 单独设置占位符
          fieldClass: 'custom-field', // 单独设置CSS类
          fieldStyle: { marginRight: '20px' }, // 单独设置样式
          props: {                   // 传递给组件的其他属性
            maxlength: 20
          }
        },
        {
          key: 'categoryName',
          label: '品类名称',
          component: 'el-select',
          sort: 2,
          labelWidth: '90px',        // 较长标签需要更大宽度
          width: '160px',
          props: {
            options: [/* 选项数据 */]
          }
        },
        {
          key: 'dateRange',
          label: '创建时间',
          component: 'el-date-picker',
          sort: 3,
          labelWidth: '70px',
          width: '300px',            // 日期范围需要更大宽度
          props: {
            type: 'datetimerange',
            rangeSeparator: '至'
          }
        }
      ]
    }
  }
}
</script>
```

### 字段配置属性说明

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `labelWidth` | String | 单独设置该字段的标签宽度，覆盖全局设置 |
| `width` | String | 设置输入组件的宽度 |
| `size` | String | 设置组件尺寸 (`large`/`medium`/`small`/`mini`) |
| `clearable` | Boolean | 是否可清空，默认 `true` |
| `placeholder` | String | 占位符文本 |
| `fieldClass` | String | 添加到 `el-form-item` 的CSS类 |
| `fieldStyle` | Object | 添加到 `el-form-item` 的内联样式 |
| `props` | Object | 传递给具体组件的其他属性 |

### 使用建议

1. **固定布局场景**: 使用 `defaultVisibleCount` 手动指定
2. **响应式场景**: 使用自动计算 (`defaultVisibleCount="0"`)
3. **空间受限**: 设置较小的 `maxVisibleCount` 值
4. **标签长度不一**: 为长标签字段单独设置 `labelWidth`
5. **输入框大小不同**: 为不同类型字段单独设置 `width`
