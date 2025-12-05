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
  problemSource: string,               // 问题来源（必填）
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
  afterNewIdList: Array<string>,       // 新售后ID列表（用于关联新售后记录）
  createBy: string,                    // 创建人
  createTime: string,                  // 创建时间
  updateBy: string,                    // 更新人
  updateTime: string                   // 更新时间
}
```

## 页面功能

### 1. 列表页面 (index.vue)
- **搜索功能**
  - 问题来源
  - 问题描述
  - 责任人
  - 时间点范围

- **操作功能**
  - 新增：打开表单对话框
  - 编辑：加载数据到表单
  - 详情：查看完整信息
  - 删除：确认后删除记录

### 2. 表单组件 (ProblemForm.vue)
- **基本信息**
  - 问题来源（必填）
  - 时间点（必填）
  - 责任人（必填）
  - 问题描述（必填，最多500字）
  - 影响面（最多500字）
  - 问题分析（最多500字）

- **对策信息**
  - 内部对策（最多500字）
  - 外部对策（最多500字）

- **分析与确认**
  - 分析结果（最多500字）
  - 效果确认（最多500字）
  - 完成时间
  - 新售后ID列表（支持多选和自定义输入）

### 3. 详情组件 (ProblemDetail.vue)
- 基本信息展示
- 分析信息展示
- 对策信息展示
- 效果确认展示
- 关联新售后展示
- 创建信息展示

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

## 更新日志

### v1.0.0 (2024-12-05)
- 初始版本
- 实现基础的增删改查功能
- 支持问题分析和对策管理
- 支持关联新售后记录

