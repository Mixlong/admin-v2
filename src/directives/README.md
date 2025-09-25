# Vue 表单校验错误滚动指令

## 功能说明

`v-form-scroll-error` 指令可以自动在表单校验失败时滚动到第一个错误字段并高亮显示，提升用户体验。

## 使用方法

### 1. 基础使用

在表单元素上添加 `v-form-scroll-error` 指令：

```vue
<template>
  <el-form 
    ref="form" 
    :model="form" 
    :rules="rules" 
    v-form-scroll-error
  >
    <el-form-item label="品类" prop="categoryId">
      <el-select v-model="form.categoryId">
        <el-option label="选项1" value="1" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="版本号" prop="versionCode">
      <el-input v-model="form.versionCode" placeholder="请输入版本号" />
    </el-form-item>
    
    <!-- 数组字段 -->
    <div v-for="(item, index) in form.list" :key="index" class="workspace-item">
      <el-form-item :prop="`list[${index}].indexNum`" :rules="rules.indexNum">
        <el-input v-model="item.indexNum" placeholder="序号" />
      </el-form-item>
      
      <el-form-item :prop="`list[${index}].spendTime`" :rules="rules.spendTime">
        <el-time-picker v-model="item.timeValue" placeholder="请选择工时" />
      </el-form-item>
    </div>
    
    <el-button @click="submitForm">提交</el-button>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        categoryId: '',
        versionCode: '',
        list: [
          { indexNum: '', spendTime: null, timeValue: null }
        ]
      },
      rules: {
        categoryId: [
          { required: true, message: '请选择品类', trigger: 'change' }
        ],
        versionCode: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ],
        indexNum: [
          { required: true, message: '请输入序号', trigger: 'change' }
        ],
        spendTime: [
          { required: true, message: '请选择工时', trigger: 'change' }
        ]
      }
    };
  },
  methods: {
    submitForm() {
      // 正常调用 validate，指令会自动处理错误滚动
      this.$refs.form.validate((valid) => {
        if (valid) {
          console.log('表单校验通过，可以提交');
          // 提交逻辑...
        }
        // 不需要处理校验失败的情况，指令会自动滚动到错误位置
      });
    }
  }
};
</script>
```

### 2. 高级配置

可以通过指令值传递配置选项：

```vue
<el-form 
  v-form-scroll-error="{
    offset: 100,
    behavior: 'smooth',
    debug: true,
    container: null
  }"
>
</el-form>
```

#### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `offset` | Number | 80 | 滚动偏移量（px） |
| `behavior` | String | 'smooth' | 滚动行为：'smooth' \| 'auto' |
| `debug` | Boolean | false | 是否开启调试模式 |
| `container` | Element | null | 自定义滚动容器 |

### 3. 在对话框中使用

指令会自动检测对话框环境并适配：

```vue
<el-dialog :visible.sync="dialogVisible">
  <el-form 
    ref="dialogForm" 
    v-form-scroll-error
  >
    <!-- 表单内容 -->
  </el-form>
</el-dialog>
```

## 支持的字段类型

### 普通字段
- `categoryId` - 选择框
- `versionCode` - 文本输入框  
- `desc` - 文本域
- `name` - 姓名输入框
- `email` - 邮箱输入框
- `phone` - 电话输入框

### 数组字段
- `list[0].indexNum` - 序号输入框
- `list[0].spendTime` - 时间选择器
- `list[0].remark` - 备注文本域
- `list[0].file` - 文件上传区域

## 自定义字段映射

如果需要支持更多字段类型，可以修改 `form-scroll-error.js` 中的字段选择器映射：

```javascript
// 在 findSimpleFieldElement 函数中添加
const fieldSelectors = {
  // 现有映射...
  customField: ['input[placeholder*="自定义"]', 'input[name="customField"]'],
  // 添加更多映射...
};

// 在 findFieldInContainer 函数中添加
const fieldSelectors = {
  // 现有映射...
  customArrayField: ['input[placeholder*="自定义数组字段"]'],
  // 添加更多映射...
};
```

## 常见问题

### Q: 为什么没有滚动到错误位置？

A: 检查以下几点：
1. 确保表单元素上添加了 `v-form-scroll-error` 指令
2. 检查控制台是否有报错信息
3. 确保字段的 `prop` 属性设置正确
4. 对于自定义字段，可能需要添加字段选择器映射

### Q: 如何调试字段查找问题？

A: 启用调试模式：

```vue
<el-form v-form-scroll-error="{ debug: true }">
```

然后查看控制台输出的详细信息。

### Q: 如何在数组字段中使用？

A: 确保数组项有合适的容器类名（如 `.workspace-item`, `.array-item`, `.list-item`），并且 `prop` 属性格式正确：

```vue
<div class="workspace-item">
  <el-form-item :prop="`list[${index}].fieldName`">
    <!-- 输入控件 -->
  </el-form-item>
</div>
```

## 注意事项

1. 指令会自动重写表单的 `validate` 方法，在原有功能基础上增加错误滚动
2. 高亮效果会在3秒后自动消失
3. 指令优先使用 `scrollIntoView` API，然后尝试对话框内滚动
4. 支持多种容器环境：普通页面、对话框、抽屉等

## 版本兼容性

- Vue 2.x
- Element UI
- 现代浏览器（支持 `scrollIntoView` 和 `scrollTo` API）