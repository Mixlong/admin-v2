/**
 * 生产报警管理相关类型定义
 */

// 生产报警对象接口
export const ProductionAlert = {
  id: '',                      // 主键ID
  workOrderNo: '',             // 工单号
  categoryName: '',            // 品类名称
  computerName: '',            // 型号名称
  problemDesc: '',             // 问题描述
  processType: 0,              // 处理状态 0.无需处理 1.待处理 2处理中 3.已处理待验证 4.已验证
  reporter: '',                // 上报人
  responsible: '',             // 责任归属人
  responsibleDept: '',         // 责任归属部门
  processName: '',             // 处理人
  processStartTime: '',        // 处理开始时间
  processEndTime: '',          // 处理完成时间
  processTime: '',             // 处理时长
  processDuration: '',         // 处理时长（格式化字符串）
  verificationTime: '',        // 验证时间
  remark: '',                  // 备注
  createdTime: '',             // 记录创建时间
  isDel: 0                     // 删除状态 0正常 1已删除
}

// 分页查询参数接口
export const AlertsQueryParams = {
  p: 1,                        // 页码
  l: 20,                       // 每页大小
  workOrderNo: '',             // 工单号
  categoryName: '',            // 品类名称
  computerName: '',            // 型号名称
  processType: null,           // 处理状态
  reporter: '',                // 上报人
  responsible: '',             // 责任归属人
  responsibleDept: '',         // 责任归属部门
  processName: '',             // 处理人
  startTime: null,             // 开始时间
  endTime: null                // 结束时间
}

// 分页响应接口
export const PageResponse = {
  list: [],                    // 数据列表
  pageNum: 1,                  // 当前页码
  pageSize: 20,                // 每页大小
  pages: 1,                    // 总页数
  total: 0                     // 总记录数
}

// API通用响应接口
export const ApiResponse = {
  code: 200,                   // 状态码
  msg: '',                     // 响应消息
  data: null                   // 响应数据
}

// 表单验证规则
export const alertFormRules = {
  workOrderNo: [
    { required: true, message: '请输入工单号', trigger: 'blur' },
    { min: 1, max: 50, message: '工单号长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  categoryName: [
    { required: true, message: '请选择品类名称', trigger: 'change' }
  ],
  computerName: [
    { required: true, message: '请选择型号名称', trigger: 'change' }
  ],
  problemDesc: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 1, max: 500, message: '问题描述长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  reporter: [
    { required: true, message: '请输入上报人', trigger: 'blur' }
  ]
}

// 处理状态选项
export const processTypeOptions = [
  { label: '无需处理', value: 0 },
  { label: '待处理', value: 1 },
  { label: '处理中', value: 2 },
  { label: '已处理待验证', value: 3 },
  { label: '已验证', value: 4 }
]

// 处理状态颜色映射
export const processTypeColors = {
  0: 'info',      // 无需处理 - 灰色
  1: 'warning',   // 待处理 - 橙色
  2: 'primary',   // 处理中 - 蓝色
  3: 'success',   // 已处理待验证 - 绿色
  4: 'success'    // 已验证 - 绿色
}