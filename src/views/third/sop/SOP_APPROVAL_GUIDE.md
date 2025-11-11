# SOP 审批流程使用指南

## 📋 功能概述

SOP 模块已升级为**三级审批流程**，实现了：
- **会审**：品质部门对 SOP 进行专业审核
- **工程审**：工程部门对 SOP 进行技术审核
- **终审**：最终审核确认，通过后 SOP 正式生效

**注意**：审核操作不在列表页进行，审核人员需要进入详情页或专门的审核页面进行审核操作。

## 🔑 核心特性

### 1. 人员管理
- **入口**：页面顶部「人员管理」按钮
- **权限**：`sop:people:add`
- **功能**：统一配置各审批环节的审核人员

#### 人员配置项：
| 配置项 | 说明 | 字段名 |
|--------|------|--------|
| **会审人员** | 品质部门审核人员 | `qualityData` |
| **工程审人员** | 工程部门审核人员 | `engineerData` |
| **终审人员** | 最终审核人员 | `finalData` |

**注意**：
- 每个配置项支持多选
- 人员配置后立即生效
- 审核操作在详情页或审核页面进行

### 2. 审批流程

#### 流程顺序
```
1. 创建 SOP
   ↓
2. 会审（qualityState）- 品质审核
   ↓
3. 工程审（engineerState）- 工程技术审核
   ↓
4. 终审（finalState）- 最终审核
   ↓
5. 完成
```

#### 审批状态
| 状态值 | 标签 | 颜色 | 说明 |
|--------|------|------|------|
| 0 | 待审核 | 橙色 | 等待审核 |
| 1 | 已审核 | 绿色 | 审核通过 |
| 2 | 已驳回 | 红色 | 审核不通过 |

### 3. 操作权限控制

#### 创建者权限
- ✅ 可以编辑（终审通过前）
- ✅ 可以删除
- ✅ 可以查看

#### 审核人权限
- ✅ 可以在详情页或审核页面进行审核
- ✅ 可以查看

#### 其他人权限
- ✅ 仅可查看

## 🎯 使用流程

### Step 1: 配置审核人员

1. 点击页面顶部「人员管理」按钮
2. 在弹窗中选择各环节审核人员：
   - 会审人员：选择 1-N 个用户（品质部门）
   - 工程审人员：选择 1-N 个用户（工程部门）
   - 终审人员：选择 1-N 个用户
3. 点击「确定」保存配置

### Step 2: 创建 SOP

1. 点击「新增」按钮
2. 填写 SOP 信息（品类、版本号、描述等）
3. 上传封面图、排拉表、历史文件
4. 配置工位信息
5. 提交保存

### Step 3: 审核流程

**注意**：审核操作不在列表页进行，审核人员需要进入详情页或专门的审核页面

#### 会审（品质审核）

**审核人**：配置的会审人员

**操作**：
1. 查看待审核的 SOP
2. 点击「查看」进入详情页
3. 在详情页中进行审核操作
4. 选择审核状态并填写审核意见

**状态变化**：
- 通过：`qualityState` 变为 1，进入工程审环节
- 不通过：`qualityState` 变为 2，SOP 被驳回

#### 工程审

**审核人**：配置的工程审人员

**前置条件**：会审已通过（`qualityState === 1`）

**操作**：
1. 查看待审核的 SOP
2. 进入详情页进行审核
3. 填写工程审核意见

**状态变化**：
- 通过：`engineerState` 变为 1，进入终审环节
- 不通过：`engineerState` 变为 2，SOP 被驳回

#### 终审

**审核人**：配置的终审人员

**前置条件**：
- 会审已通过（`qualityState === 1`）
- 工程审已通过（`engineerState === 1`）

**操作**：
1. 查看待审核的 SOP
2. 进入详情页进行终审
3. 填写终审意见

**状态变化**：
- 通过：`finalState` 变为 1，SOP 正式生效 ✅
- 不通过：`finalState` 变为 2，SOP 被驳回

## 📊 表格列说明

| 列名 | 说明 | 数据字段 |
|------|------|----------|
| 序号 | 行号 | - |
| 品类 | SOP 所属品类 | `categoryName` |
| 版本号 | SOP 版本号 | `versionCode` |
| 描述 | SOP 描述信息 | `desc` |
| **会审状态** | 品质会审状态和审核人 | `qualityState` / `qualityPerson` |
| **工程审状态** | 工程审核状态和审核人 | `engineerState` / `engineerPerson` |
| **终审状态** | 终审审核状态和审核人 | `finalState` / `finalPerson` |
| 创建人 | SOP 创建者 | `createBy` |
| 更新时间 | 最后更新时间 | `updateTime` |
| 操作 | 查看、编辑、删除等操作 | - |

## 🔌 后端 API 接口

### 1. 获取审核人员列表
```
GET /management/personList
返回：{
  qualityData: "用户1,用户2",
  engineerData: "用户3,用户4",
  finalData: "用户5,用户6"
}
```

### 2. 编辑审核人员
```
PUT /management/personEdit
请求体：{
  qualityData: "用户1,用户2",
  engineerData: "用户3,用户4",
  finalData: "用户5,用户6"
}
```

**注意**：以下审核接口在详情页或审核页面调用，不在列表页使用

### 3. 会审
```
PUT /management/qualityState
请求体：{
  id: SOP ID,
  state: 1 | 2,  // 1-通过，2-不通过
  remark: "备注",
  result: "不通过理由"
}
```

### 4. 工程审
```
PUT /management/engineerState
请求体：{
  id: SOP ID,
  state: 1 | 2,
  remark: "备注",
  result: "不通过理由"
}
```

### 5. 终审
```
PUT /management/finalState
请求体：{
  id: SOP ID,
  state: 1 | 2,
  remark: "备注",
  result: "不通过理由"
}
```

## 📝 数据库字段说明

建议在 SOP 表中添加以下字段：

```sql
-- 会审相关（品质）
qualityState INT DEFAULT 0 COMMENT '会审状态：0-待审核，1-已审核，2-已驳回',
qualityPerson VARCHAR(50) COMMENT '会审人',
qualityTime DATETIME COMMENT '会审时间',
qualityRemark TEXT COMMENT '会审备注',

-- 工程审相关
engineerState INT DEFAULT 0 COMMENT '工程审状态：0-待审核，1-已审核，2-已驳回',
engineerPerson VARCHAR(50) COMMENT '工程审人',
engineerTime DATETIME COMMENT '工程审时间',
engineerRemark TEXT COMMENT '工程审备注',

-- 终审相关
finalState INT DEFAULT 0 COMMENT '终审状态：0-待审核，1-已审核，2-已驳回',
finalPerson VARCHAR(50) COMMENT '终审人',
finalTime DATETIME COMMENT '终审时间',
finalRemark TEXT COMMENT '终审备注'
```

审核人员配置表：

```sql
CREATE TABLE sop_audit_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quality_data TEXT COMMENT '会审人员（逗号分隔）',
  engineer_data TEXT COMMENT '工程审人员（逗号分隔）',
  final_data TEXT COMMENT '终审人员（逗号分隔）',
  update_time DATETIME COMMENT '更新时间',
  update_by VARCHAR(50) COMMENT '更新人'
);
```

## 🎨 样式说明

审批状态使用不同颜色区分：
- **待审核**：橙色 `#e6a23c`
- **已审核**：绿色 `#67c23a`
- **已驳回**：红色 `#f56c6c`

操作按钮颜色：
- **审核按钮**：橙色
- **撤销按钮**：灰色
- **查看按钮**：绿色
- **编辑按钮**：蓝色
- **删除按钮**：红色

## ⚠️ 注意事项

1. **审批顺序**：必须按照会审 → 工程审 → 终审的顺序进行
2. **权限控制**：
   - 只有配置的审核人员才能进行审核
   - 创建者在终审通过后无法编辑
   - 审核操作在详情页或审核页面进行，不在列表页
3. **数据一致性**：
   - 审核通过后，需要记录审核人和审核时间
   - 后端需要验证审批顺序和权限
4. **用户体验**：
   - 列表页仅展示审核状态和审核人
   - 审核人信息显示在状态标签下方
   - 操作按钮简洁明了

## 🚀 未来扩展

可以考虑的扩展功能：

1. **审核历史**：记录每次审核的详细历史
2. **消息通知**：审核通过/驳回时通知相关人员
3. **审核意见**：支持多轮审核意见的记录
4. **批量审核**：支持批量选择进行审核
5. **审核统计**：统计各环节的审核效率
6. **自定义流程**：支持配置不同品类的审批流程

## 📞 技术支持

如有问题，请联系开发团队。
