# 统一管理方案说明

## 核心思想

**改配置文件一处，所有地方自动生效！**

## 完整示例

### 1. 配置文件（fields.js）

```javascript
支架螺丝: {
  key: '支架螺丝',              // 字段key
  displayName: '支架螺丝',      // 显示名称
  formType: 'select',          // 表单类型
  width: '230',                // 列宽
  defaultValue: '锁上出货',    // 默认值
  options: [                    // 选项
    { label: '锁上出货', value: '锁上出货' },
    { label: '不锁，以附件出货', value: '不锁，以附件出货' },
    { label: '不涉及', value: '不涉及' }
  ]
}
```

### 2. 模板（从配置读取）

**❌ 之前的写法（硬编码）：**
```vue
<el-table-column label="支架螺丝" width="230">
  <el-select v-model="formData.解件出库方式.支架螺丝">
    <el-option label="锁上出货" value="锁上出货" />
    <el-option label="不锁，以附件出货" value="不锁，以附件出货" />
    <el-option label="不涉及" value="不涉及" />
  </el-select>
</el-table-column>
```

**✅ 现在的写法（配置驱动）：**
```vue
<!-- 遍历配置文件，自动生成表单 -->
<el-table-column 
  v-for="field in PACKAGING_FIELDS.解件出库方式.fields"
  :key="field.key"
  :label="field.displayName"
  :width="field.width"
  :min-width="field.minWidth"
>
  <!-- select 类型 -->
  <el-select 
    v-if="field.formType === 'select'"
    v-model="formData.解件出库方式[field.key]"
  >
    <el-option 
      v-for="opt in field.options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
  
  <!-- richtext 类型 -->
  <Editor 
    v-else-if="field.formType === 'richtext'"
    v-model="formData.解件出库方式[field.key]"
    :min-height="field.minHeight"
  />
</el-table-column>
```

## 修改字段名

### 场景：把"支架螺丝"改成"支架螺钉"

**只需改一处（fields.js）：**
```javascript
支架螺钉: {  // 改这里
  key: '支架螺钉',              // 改这里
  displayName: '支架螺钉',      // 改这里
  aliases: ['支架螺丝'],        // 旧名字自动兼容
  formType: 'select',
  width: '230',
  defaultValue: '锁上出货',
  options: [...]
}
```

**template 自动生效，无需修改任何代码！** ✨

## 代码结构

```
配置文件（fields.js）
  ↓ 定义所有字段
Template（v-for 循环）
  ↓ 自动读取配置
自动渲染表单
```

## 优势对比

| 操作 | 硬编码方式 | 配置驱动方式 |
|------|-----------|-------------|
| 改字段名 | 改 5+ 处代码 | **改配置 1 处** ✅ |
| 改选项 | 改 template | **改配置 1 处** ✅ |
| 改默认值 | 改 data 定义 | **改配置 1 处** ✅ |
| 改宽度 | 改 template | **改配置 1 处** ✅ |
| 新增字段 | 改多处 | **配置加 1 项** ✅ |

## 实施建议

### 方案 A：渐进式改造（推荐）
1. 保持现有 template 不动
2. 先用配置文件管理 script 逻辑
3. 有时间再改造 template 为循环方式

### 方案 B：一步到位
1. 修改 template 为 v-for 循环方式
2. 完全从配置读取
3. 充分测试

---

**这才是真正的统一管理！** 🎯

