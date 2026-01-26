# FormCreate 分组表单使用指南

## 📋 目标效果

根据你的截图，表单有以下特点：
- ✅ 分组标题（基本信息、机型配置、客户要求等）
- ✅ 区域边框
- ✅ 带操作按钮的分组（如"添加机型配置"）
- ✅ 富文本编辑器
- ✅ 灰色背景标题栏

## 🎨 实现方案

### 方案一：使用自定义 FormGroupTitle 组件（推荐）

```javascript
export const createCustomerFormRule = () => [
  // ========== 分组1: 基本信息 ==========
  {
    type: 'FormGroupTitle',
    field: 'group_basic',
    title: '基本信息',
    children: [
      {
        type: 'input',
        field: 'customerName',
        title: '客户名称',
        props: { placeholder: '请选择客户名称' },
        validate: [{ required: true, message: '请输入客户名称' }],
        col: { span: 12 }
      },
      {
        type: 'input',
        field: 'qualityOwner',
        title: '质量负责人',
        props: { placeholder: '请选择质量负责人' },
        validate: [{ required: true, message: '请选择质量负责人' }],
        col: { span: 12 }
      },
      {
        type: 'input',
        field: 'projectOwner',
        title: '项目负责人',
        props: { placeholder: '请选择项目负责人' },
        validate: [{ required: true, message: '请选择项目负责人' }],
        col: { span: 12 }
      },
      {
        type: 'input',
        field: 'marketOwner',
        title: '市场负责人',
        props: { placeholder: '请选择市场负责人' },
        validate: [{ required: true, message: '请选择市场负责人' }],
        col: { span: 12 }
      },
      {
        type: 'input',
        field: 'customerShipping',
        title: '客户出货方',
        props: {
          type: 'textarea',
          rows: 3,
          placeholder: '请输入客户出货方'
        },
        col: { span: 24 }
      }
    ]
  },

  // ========== 分组2: 机型配置（带添加按钮） ==========
  {
    type: 'FormGroupTitle',
    field: 'group_model',
    title: '机型配置',
    props: {
      extra: '添加机型配置' // 右上角按钮文字
    },
    on: {
      'extra-click': '$addModel' // 触发外部方法
    },
    children: [
      {
        type: 'select',
        field: 'modelType1',
        title: '机型型号1',
        props: { placeholder: '请选择品类' },
        options: [],
        validate: [{ required: true, message: '请选择机型型号' }],
        col: { span: 12 }
      },
      {
        type: 'input',
        field: 'modelConfig1',
        title: '机型配置1',
        props: { placeholder: '请输入机型配置' },
        col: { span: 12 }
      }
    ]
  },

  // ========== 分组3: 客户要求（标准） - 富文本编辑器 ==========
  {
    type: 'FormGroupTitle',
    field: 'group_requirements',
    title: '客户要求（标准）',
    children: [
      {
        type: 'Editor', // 使用项目中已有的富文本组件
        field: 'productCertification',
        title: '产品认证',
        props: {
          placeholder: '请输入产品认证要求...',
          height: 200
        },
        col: { span: 12 }
      },
      {
        type: 'Editor',
        field: 'environmentalRequirements',
        title: '环保要求',
        props: {
          placeholder: '请输入环保要求...',
          height: 200
        },
        col: { span: 12 }
      }
    ]
  }
]
```

### 在页面中使用

```vue
<template>
  <el-dialog v-model="dialogVisible" title="新增" width="1200px">
    <form-create
      v-model:api="fApi"
      v-model:value="form"
      :rule="formRule"
      :option="formOption"
    />
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { createCustomerFormRule } from './customerFormRule'

const fApi = ref(null)
const form = ref({})
const formRule = computed(() => {
  return createCustomerFormRule().map(rule => {
    // 注入外部方法
    if (rule.on && rule.on['extra-click'] === '$addModel') {
      rule.on['extra-click'] = handleAddModel
    }
    return rule
  })
})

const formOption = {
  form: {
    labelWidth: '120px',
    size: 'default'
  },
  row: {
    gutter: 20
  },
  submitBtn: false,
  resetBtn: false
}

// 添加机型配置方法
function handleAddModel() {
  console.log('添加机型配置')
  // 动态添加表单字段逻辑
}

async function handleSubmit() {
  try {
    await fApi.value.validate()
    const formData = fApi.value.formData()
    console.log('表单数据:', formData)
    // 提交逻辑
  } catch (error) {
    console.error('验证失败:', error)
  }
}
</script>
```

## 🎯 方案二：使用 HTML 标题（简单场景）

如果不需要复杂的分组功能，可以使用简单的 HTML 标题：

```javascript
export const simpleFormRule = [
  // HTML 标题
  {
    type: 'html',
    html: '<div class="form-section-title">基本信息</div>',
    col: { span: 24 }
  },

  // 表单字段
  {
    type: 'input',
    field: 'name',
    title: '名称',
    col: { span: 12 }
  }
]
```

配合样式：

```scss
.form-section-title {
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #f5f7fa;
  border-left: 3px solid #409eff;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}
```

## 🚀 方案三：使用 Element Plus Card 组件

```javascript
{
  type: 'ElCard',
  props: {
    header: '基本信息',
    shadow: 'never'
  },
  children: [
    {
      type: 'input',
      field: 'name',
      title: '名称',
      col: { span: 12 }
    }
  ]
}
```

## 📝 完整功能示例

### 1. 动态添加/删除表单项

```javascript
// 在组件中维护动态表单项数组
const modelConfigs = ref([{ id: 1 }])

// 生成动态表单规则
const formRule = computed(() => {
  const rules = [
    {
      type: 'FormGroupTitle',
      title: '机型配置',
      props: {
        extra: '添加机型配置'
      },
      on: {
        'extra-click': addModelConfig
      },
      children: []
    }
  ]

  // 动态添加机型配置字段
  modelConfigs.value.forEach((config, index) => {
    rules[0].children.push(
      {
        type: 'select',
        field: `modelType${config.id}`,
        title: `机型型号${index + 1}`,
        col: { span: 11 }
      },
      {
        type: 'input',
        field: `modelConfig${config.id}`,
        title: `机型配置${index + 1}`,
        col: { span: 11 }
      },
      {
        type: 'ElButton',
        props: {
          icon: 'Delete',
          type: 'danger',
          link: true
        },
        on: {
          click: () => removeModelConfig(config.id)
        },
        col: { span: 2 }
      }
    )
  })

  return rules
})

function addModelConfig() {
  modelConfigs.value.push({
    id: Date.now()
  })
}

function removeModelConfig(id) {
  const index = modelConfigs.value.findIndex(c => c.id === id)
  if (index > -1) {
    modelConfigs.value.splice(index, 1)
  }
}
```

### 2. 富文本编辑器集成

需要先在 FormCreate 中注册你的 Editor 组件：

```javascript
// main.js
import Editor from '@/components/Editor'
formCreate.component('Editor', Editor)
```

然后在配置中使用：

```javascript
{
  type: 'Editor',
  field: 'content',
  title: '内容',
  props: {
    height: 300
  }
}
```

## 💡 样式自定义

你可以通过 CSS 变量自定义分组样式：

```scss
// 全局样式或组件内样式
:deep(.form-group-title) {
  background: #f0f2f5; // 修改背景色
  border-left-color: #1890ff; // 修改边框颜色
  font-size: 15px; // 修改字体大小
}

:deep(.form-group-content) {
  padding: 24px; // 修改内边距
  border-radius: 8px; // 修改圆角
}
```

## 🎨 效果预览

你的表单最终会呈现为：

```
┌─────────────────────────────────────────┐
│ 基本信息                                 │
├─────────────────────────────────────────┤
│ 客户名称: [____] | 质量负责人: [____]    │
│ 项目负责人: [____] | 市场负责人: [____]  │
│ 客户出货方: [________________]           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 机型配置           [+ 添加机型配置]      │
├─────────────────────────────────────────┤
│ 机型型号1: [____] | 机型配置1: [____]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 客户要求（标准）                         │
├─────────────────────────────────────────┤
│ 产品认证:        | 环保要求:             │
│ [富文本编辑器]   | [富文本编辑器]        │
└─────────────────────────────────────────┘
```

## 📚 参考资源

- FormCreate 官方文档: https://www.form-create.com/v3/guide/
- 自定义组件: https://www.form-create.com/v3/guide/component.html
- 动态表单: https://www.form-create.com/v3/guide/update.html
