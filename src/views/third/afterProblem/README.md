# 售后问题处理模块

## 功能概述
售后问题处理模块用于记录、跟踪和管理售后过程中发现的问题，包括问题分析、对策制定和效果确认等完整流程。

## 目录结构
```
afterProblem/
├── index.vue                    # 主页面（列表）
├── components/
│   ├── ProblemForm.vue         # 新增/编辑表单
│   └── ProblemDetail.vue       # 详情查看
└── README.md                    # 说明文档
```

## API接口
位置：`src/api/third/afterProblem.js`

### 接口列表
- `afterProblemList(params)` - 分页查询列表
- `afterProblemDetail(id)` - 查询详情
- `afterProblemAdd(data)` - 新增
- `afterProblemUpdate(data)` - 修改
- `afterProblemDelete(id)` - 删除

## 数据字段说明

### 售后问题处理实体
```javascript
{
  id: string,                          // 主键ID
  problemSource: string,               // 问题来源（售后记录ID，必填）
  problemSourceSn: string,             // 问题来源SN（用于显示）
  problemSourceCustomer: string,       // 问题来源客户名称（用于显示）
  problemDescription: string,          // 问题描述（必填）
  problemTime: string,                 // 时间点（必填）
  responsiblePerson: string,           // 责任人（必填）
  impactScope: string,                 // 影响面
  problemAnalysis: string,             // 问题分析（过程）
  analysisResult: string,              // 分析结果
  internalMeasures: string,            // 内部对策
  externalMeasures: string,            // 外部对策
  effectivenessConfirmation: string,   // 效果确认
  completionTime: string,              // 完成时间
  afterNewIdList: Array<string>,       // 新售后ID列表（售后记录ID数组）
  createBy: string,                    // 创建人
  createTime: string,                  // 创建时间
  updateBy: string,                    // 更新人
  updateTime: string                   // 更新时间
}
```

**重要说明：**
- `problemSource`: 存储的是售后记录的ID（而非SN），用于数据关联
- `problemSourceSn`: 存储售后记录的SN，用于界面显示
- `problemSourceCustomer`: 存储售后记录的客户名称，用于界面显示
- `afterNewIdList`: 存储的是售后记录ID的数组，用于关联多个新售后记录

## 页面功能

### 1. 列表页面 (index.vue)

#### ✨ 智能搜索表单
使用 `IntelligentSearchForm` 组件，提供更好的搜索体验：
- **问题来源**：文本输入
- **问题描述**：文本输入
- **责任人**：文本输入
- **时间点**：日期范围选择（自定义字段）
- **默认显示**：前 4 个搜索项
- **最多显示**：6 个搜索项
- **展开/收起**：支持动态展开收起搜索项

#### 🎯 操作功能
- **新增**：打开表单对话框
- **编辑**：加载数据到表单
- **详情**：查看完整信息
- **删除**：确认后删除记录

### 2. 表单组件 (ProblemForm.vue)

表单采用**四个主要分组**，对应 8D 报告的标准结构：

#### 📌 问题点
- **问题来源**（必填，文本输入）
- **时间点**（必填，日期时间选择器）
- **问题描述**（必填，富文本编辑器）

#### 🔬 迪太研发&品质
- **问题分析（过程）**（富文本编辑器）
- **分析结果**（富文本编辑器）

#### 🛠️ 对策
- **影响面**（富文本编辑器）
- **内部对策**（富文本编辑器）
- **外部对策**（富文本编辑器）

#### 📊 改善跟踪
- **责任人**（必填，文本输入）
- **完成时间**（日期时间选择器）
- **效果确认**（富文本编辑器）
- **新售后ID列表**（表格多选）
  - 📋 使用表格形式选择售后记录
  - 🔍 支持搜索SN或客户名称
  - 📄 支持分页（10/20/50/100 条/页）
  - ✅ 实时显示已选择数量
  - 🎯 显示完整的售后记录信息：
    - 序号
    - 产品SN
    - 客户名称
    - 客诉日期
    - 问题状态（OPEN/CLOSE）
  - 💾 保留选中状态（跨页选择）

**特色功能：**
- ✅ 使用 `<fieldset>` + `<legend>` 实现美观的分组样式
- ✅ 使用富文本编辑器（Editor）支持格式化文本输入
- ✅ 使用项目标准 flex 布局样式
- ✅ **表格选择器**：新售后ID列表使用表格形式，支持搜索、分页和多选
- ✅ **跨页选择**：表格使用 `reserve-selection` 保留跨页选中状态
- ✅ **实时反馈**：显示已选择的售后记录数量
- ✅ **自动加载**：对话框打开时自动加载售后记录列表

### 3. 详情组件 (ProblemDetail.vue)

详情组件按照**相同的四个分组**展示信息：

#### 📌 问题点
- 问题来源：显示为可点击的链接，点击可跳转到售后详情页
- 自动加载并显示关联的售后记录信息（SN + 客户名称）
- 时间点
- 问题描述（支持HTML渲染）

#### 🔬 迪太研发&品质
- 问题分析（过程）（支持HTML渲染）
- 分析结果（支持HTML渲染）

#### 🛠️ 对策
- 影响面（支持HTML渲染）
- 内部对策（支持HTML渲染）
- 外部对策（支持HTML渲染）

#### 📊 改善跟踪
- 责任人
- 完成时间
- 效果确认（支持HTML渲染）
- 关联新售后：以标签形式展示所有关联的售后记录ID

#### 📝 创建信息
- 创建人、创建时间
- 更新人、更新时间

**特色功能：**
- ✅ 问题来源显示为链接，支持快速跳转到关联的售后记录详情
- ✅ 自动从后端加载完整的售后记录信息
- ✅ 富文本内容使用 `v-html` 渲染，保留格式
- ✅ 使用 flex 布局优化显示效果
- ✅ 分组结构与表单保持一致，便于理解

## 使用方法

### 1. 路由配置
在路由文件中添加：
```javascript
{
  path: '/afterProblem',
  component: () => import('@/views/third/afterProblem/index'),
  name: 'AfterProblem',
  meta: { title: '售后问题处理', icon: 'problem' }
}
```

### 2. 菜单配置
在系统菜单管理中添加菜单项，指向路由 `/afterProblem`

### 3. 权限配置（可选）
如需权限控制，可在按钮上添加 `v-hasPermi` 指令：
```vue
<el-button v-hasPermi="['afterProblem:add']">新增</el-button>
<el-button v-hasPermi="['afterProblem:edit']">编辑</el-button>
<el-button v-hasPermi="['afterProblem:delete']">删除</el-button>
```

## 组件调用示例

### 在父组件中使用
```vue
<template>
  <div>
    <!-- 表单组件 -->
    <problem-form
      ref="problemFormRef"
      :visible.sync="formVisible"
      @success="handleSuccess"
    />
    
    <!-- 详情组件 -->
    <problem-detail
      ref="problemDetailRef"
      :visible.sync="detailVisible"
    />
  </div>
</template>

<script>
import ProblemForm from './components/ProblemForm'
import ProblemDetail from './components/ProblemDetail'

export default {
  components: {
    ProblemForm,
    ProblemDetail
  },
  data() {
    return {
      formVisible: false,
      detailVisible: false
    }
  },
  methods: {
    // 新增
    handleAdd() {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.problemFormRef.reset()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.problemFormRef.setFormData(row)
      })
    },
    
    // 查看详情
    handleDetail(id) {
      this.detailVisible = true
      this.$nextTick(() => {
        this.$refs.problemDetailRef.open(id)
      })
    },
    
    // 成功回调
    handleSuccess() {
      // 刷新列表等操作
    }
  }
}
</script>
```

## 注意事项

1. **日期格式**：所有日期时间字段使用 `yyyy-MM-dd HH:mm:ss` 格式
2. **数组字段**：`afterNewIdList` 在前端是数组，提交到后端时会转换为字符串数组
3. **字数限制**：文本域字段均有500字符限制，带字数统计
4. **必填校验**：问题来源、问题描述、时间点、责任人为必填项

## 后端接口要求

### 列表查询接口
- **URL**: `GET /after/problem/list`
- **参数**: 
  - `p`: 页码
  - `l`: 每页条数
  - `problemSource`: 问题来源（可选）
  - `problemDescription`: 问题描述（可选）
  - `responsiblePerson`: 责任人（可选）
  - `startTime`: 开始时间（可选）
  - `endTime`: 结束时间（可选）
- **返回**:
```json
{
  "code": 200,
  "data": {
    "list": [],
    "total": 0
  }
}
```

### 详情查询接口
- **URL**: `GET /after/problem/detail/{id}`
- **返回**:
```json
{
  "code": 200,
  "data": {
    "id": "1",
    "problemSource": "客户反馈",
    ...
  }
}
```

### 新增接口
- **URL**: `POST /after/problem/add`
- **请求体**: 售后问题处理实体
- **返回**:
```json
{
  "code": 200,
  "data": true,
  "msg": "操作成功"
}
```

### 修改接口
- **URL**: `PUT /after/problem/update`
- **请求体**: 售后问题处理实体（需包含id）
- **返回**:
```json
{
  "code": 200,
  "data": true,
  "msg": "操作成功"
}
```

### 删除接口
- **URL**: `DELETE /after/problem/delete/{id}`
- **返回**:
```json
{
  "code": 200,
  "data": true,
  "msg": "操作成功"
}
```

## 样式说明

本模块使用项目标准的 flex 布局样式：

```scss
.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}
```

这些样式类可以直接在组件中使用，确保与项目其他模块保持一致的视觉风格。

## 组件依赖

本模块依赖以下组件：
- `IntelligentSearchForm`: 智能搜索表单组件（支持动态展开收起）
- `Editor`: 富文本编辑器组件（`@/components/Editor`）
- `el-table`: Element UI 表格组件（用于售后记录选择）
- `el-pagination`: Element UI 分页组件

确保这些组件在项目中已正确注册。

## 表单结构说明

表单采用 **8D 报告（8 Disciplines）** 的标准结构设计，分为四个主要部分：

```
┌─────────────────────────────────────────────────────────┐
│ 📌 问题点                                                │
│  - 问题来源、时间点、问题描述                            │
├─────────────────────────────────────────────────────────┤
│ 🔬 迪太研发&品质                                         │
│  - 问题分析（过程）、分析结果                            │
├─────────────────────────────────────────────────────────┤
│ 🛠️ 对策                                                  │
│  - 影响面、内部对策、外部对策                            │
├─────────────────────────────────────────────────────────┤
│ 📊 改善跟踪                                              │
│  - 责任人、完成时间、效果确认、新售后ID列表               │
└─────────────────────────────────────────────────────────┘
```

这种结构：
1. 符合质量管理的标准流程
2. 便于问题的系统化管理
3. 清晰地区分问题识别、分析、解决和跟踪各个阶段

## 更新日志

### v1.4.0 (2024-12-05)
- **智能搜索表单**：使用 `IntelligentSearchForm` 组件替换原有搜索表单
  - 支持动态展开收起搜索项
  - 更好的用户体验和视觉效果
- **表格选择器**：新售后ID列表改用表格多选方式
  - 支持搜索、分页和跨页选择
  - 显示完整的售后记录信息
  - 实时显示已选择数量
- **简化问题来源**：改为普通文本输入，更灵活

### v1.3.0 (2024-12-05)
- **表单结构重构**：按照 8D 报告标准，将表单重组为四个主要分组
  - 📌 问题点
  - 🔬 迪太研发&品质
  - 🛠️ 对策
  - 📊 改善跟踪
- **富文本编辑器**：所有多行文本字段改用 `Editor` 富文本编辑器
- **视觉优化**：使用 `<fieldset>` + `<legend>` 实现更美观的分组样式
- 详情组件同步更新，使用 `v-html` 渲染富文本内容

### v1.2.0 (2024-12-05)
- **重要更新**：问题来源现在存储售后记录的ID，实现真正的数据关联
- 添加辅助字段 `problemSourceSn` 和 `problemSourceCustomer` 用于显示
- 详情页面自动加载并显示关联的售后记录完整信息
- 问题来源在详情页面显示为可点击链接，支持跳转到售后详情
- 新售后ID列表也存储售后记录的ID数组

### v1.1.0 (2024-12-05)
- 优化问题来源选择：从输入框改为从售后记录列表中选择
- 优化新售后ID列表：从自定义输入改为从售后记录列表中多选
- 添加 flex 布局样式支持
- 优化下拉选项显示，同时显示SN和客户名称
- 支持售后记录的搜索和分页加载

### v1.0.0 (2024-12-05)
- 初始版本
- 实现基础的增删改查功能
- 支持问题分析和对策管理
- 支持关联新售后记录

