# RichTextDisplay 富文本预览组件

一个全局注册的富文本内容展示组件，支持 HTML 内容渲染、图片点击放大、滚动查看等功能。

## ✨ 特性

- 🎨 **富文本渲染** - 支持段落、标题、列表、表格、代码等 HTML 元素
- 🖼️ **图片放大** - 点击图片可放大预览，支持多图浏览
- 📏 **高度可配** - 支持自定义最大高度和宽度
- 📜 **滚动查看** - 内容超出时自动显示滚动条
- 🔒 **安全过滤** - 自动过滤危险标签和脚本
- 💅 **样式美化** - 内置美观的富文本样式和滚动条样式

## 📦 安装

组件已在 `main.js` 中全局注册，无需在页面中单独引入：

```javascript
// src/main.js
import RichTextDisplay from '@/components/RichTextDisplay'
Vue.component('RichTextDisplay', RichTextDisplay)
```

## 🚀 基础使用

### 1. 最简单的使用

```vue
<template>
  <RichTextDisplay :content="htmlContent" />
</template>

<script>
export default {
  data() {
    return {
      htmlContent: '<p>这是一段<strong>富文本</strong>内容</p>'
    }
  }
}
</script>
```

### 2. 表格中使用

```vue
<el-table-column label="富文本内容" width="200">
  <template slot-scope="{ row }">
    <RichTextDisplay
      :content="row.richContent"
      max-height="120px"
      placeholder="-"
    />
  </template>
</el-table-column>
```

### 3. 自定义高度和宽度

```vue
<RichTextDisplay
  :content="content"
  max-height="300px"
  max-width="800px"
  :scrollable="true"
/>
```

### 4. 禁用滚动

```vue
<RichTextDisplay
  :content="content"
  max-height="200px"
  :scrollable="false"
/>
```

## 📝 Props

| 参数 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| content | 富文本 HTML 内容 | String | `''` | - |
| placeholder | 内容为空时的占位文本 | String | `'-'` | - |
| maxHeight | 最大高度 | String | `'none'` | CSS 高度值，如 `'120px'` |
| maxWidth | 最大宽度 | String | `'100%'` | CSS 宽度值，如 `'800px'` |
| scrollable | 是否启用滚动 | Boolean | `true` | `true` / `false` |

## 🎯 功能说明

### 1. 图片放大功能

组件会自动监听富文本中的图片点击事件：

- 点击任意图片即可放大预览
- 支持多图切换浏览
- 使用 Element UI 的图片查看器

```vue
<!-- 富文本中包含图片 -->
<RichTextDisplay 
  :content="'<p>文字内容</p><img src=\"image1.jpg\" /><img src=\"image2.jpg\" />'" 
/>
```

### 2. 内容安全过滤

组件会自动过滤以下危险内容：

- `<script>` 标签
- `<iframe>` 标签
- `<object>` 和 `<embed>` 标签
- `on*` 事件属性（如 `onclick`）
- `javascript:` 协议

### 3. 滚动条样式

内置美观的滚动条样式：

- 滚动条宽度：6px
- 滚动条颜色：#dcdfe6
- 鼠标悬停色：#c0c4cc

### 4. 支持的 HTML 元素

组件内置了以下元素的样式：

- 段落：`<p>`
- 标题：`<h1>` ~ `<h6>`
- 列表：`<ul>`, `<ol>`, `<li>`
- 引用：`<blockquote>`
- 代码：`<code>`, `<pre>`
- 强调：`<strong>`, `<b>`, `<em>`, `<i>`
- 链接：`<a>`
- 表格：`<table>`, `<th>`, `<td>`
- 图片：`<img>`

## 💡 使用示例

### 示例 1：售后分析表格

```vue
<el-table-column label="发生原因" width="200">
  <template slot-scope="{ row }">
    <RichTextDisplay
      :content="row.analysisCause"
      max-height="120px"
      placeholder="-"
    />
  </template>
</el-table-column>

<el-table-column label="流出原因" width="200">
  <template slot-scope="{ row }">
    <RichTextDisplay
      :content="row.analysisOutflowCause"
      max-height="120px"
      placeholder="-"
    />
  </template>
</el-table-column>
```

### 示例 2：详情页展示

```vue
<el-form-item label="详细说明">
  <RichTextDisplay
    :content="form.description"
    max-height="400px"
    max-width="100%"
  />
</el-form-item>
```

### 示例 3：卡片中使用

```vue
<el-card>
  <div slot="header">富文本内容</div>
  <RichTextDisplay
    :content="cardContent"
    max-height="300px"
    placeholder="暂无内容"
  />
</el-card>
```

## 🎨 样式定制

如果需要覆盖默认样式，可以使用深度选择器：

```vue
<style scoped>
::v-deep .rich-text-display {
  .rich-text-content {
    font-size: 14px;
    
    p {
      margin-bottom: 12px;
    }
  }
}
</style>
```

## ⚠️ 注意事项

1. **XSS 安全**：组件已经做了基本的安全过滤，但建议后端也要做好内容过滤
2. **图片加载**：确保图片 URL 可访问，否则会显示裂图
3. **内容长度**：对于超长内容，建议设置合理的 `maxHeight` 避免页面卡顿
4. **性能优化**：大量使用时注意性能，可以考虑使用虚拟滚动

## 🔧 技术实现

- **HTML 渲染**：使用 `v-html` 指令
- **图片预览**：使用 Element UI 的 `ElImageViewer` 组件
- **安全过滤**：正则表达式过滤危险标签
- **事件委托**：通过容器监听图片点击事件

## 📄 更新日志

### v1.0.0 (2024-12-05)

- ✨ 新增图片点击放大功能
- ✨ 新增最大宽度配置
- ✨ 新增滚动开关配置
- 💄 优化滚动条样式
- 💄 优化图片鼠标悬停效果
- 🔒 增强内容安全过滤

## 📞 支持

如有问题或建议，请联系开发团队。
