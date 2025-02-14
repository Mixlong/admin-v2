import request from "@/utils/request";

/**
 *  模块管理
 */

export function testProductList(params) {
  return request({
    url: "/test/product/list",
    method: "get",
    params,
  });
}

export function taskProductAuth(data) {
  return request({
    url: "/test/product/auth",
    method: "put",
    data,
  });
}

export function testProductAdd(data) {
  return request({
    url: "/test/product",
    method: "post",
    data,
  });
}

export function testProductEdit(data) {
  return request({
    url: "/test/product",
    method: "put",
    data,
  });
}

/**
 *  用例库
 */

export function testCaseList(params) {
  return request({
    url: "/test/case/list",
    method: "get",
    params,
  });
}

export function taskCaseAuth(data) {
  return request({
    url: "/test/case/auth",
    method: "put",
    data,
  });
}

export function testCaseAdd(data) {
  return request({
    url: "/test/case",
    method: "post",
    data,
  });
}

export function testCaseEdit(data) {
  return request({
    url: "/test/case",
    method: "put",
    data,
  });
}

export function testCaseState(data) {
  return request({
    url: "/test/case/state",
    method: "put",
    data,
  });
}

// 删除
export function testCaseDelete(data) {
  return request({
    url: "/test/case/delete",
    method: "delete",
    data,
  });
}


/**
 * 测试任务
 */

export function taskList(params) {
  return request({
    url: "/task/list",
    method: "get",
    params,
  });
}

export function taskInfo(id) {
  return request({
    url: "/task/info/" + id,
    method: "get",
  });
}

export function taskAuth(data) {
  return request({
    url: "/task/auth",
    method: "put",
    data,
  });
}

export function taskSave(data) {
  return request({
    url: "/task/save",
    method: "post",
    data,
  });
}

export function taskUpdate(data) {
  return request({
    url: "/task/update",
    method: "put",
    data,
  });
}

export function taskState(data) {
  return request({
    url: "/task/state",
    method: "put",
    data,
  });
}

export function taskComplete(id) {
  return request({
    url: "/task/complete/" + id,
    method: "put",
  });
}

/**
 * BUG管理
 */

export function testBugList(params) {
  return request({
    url: "/bug/list",
    method: "get",
    params,
  });
}

/**
 * 报告管理
 */

export function reportList(params) {
  return request({
    url: "/report/list",
    method: "get",
    params,
  });
}

export function resportGenerate(params) {
  return request({
    url: "/report/generate",
    method: "get",
    params,
  });
}

export function reportAuth(data) {
  return request({
    url: "/report/auth",
    method: "put",
    data,
  });
}

export function reportSave(data) {
  return request({
    url: "/report/save",
    method: "post",
    data,
  });
}

export function reportUpdate(data) {
  return request({
    url: "/report/update",
    method: "put",
    data,
  });
}

export function reportExcel(id) {
  return request({
    url: "/report/excel/" + id,
    method: "post",
  });
}

/**
 * STS 网页管理
 */

export function stsWebList(params) {
  return request({
    url: "/sts/web/list",
    method: "get",
    params,
  });
}

export function stsWebAuth(data) {
  return request({
    url: "/sts/web/auth",
    method: "put",
    data,
  });
}

export function stsWebSave(data) {
  return request({
    url: "/sts/web",
    method: "post",
    data,
  });
}

export function stsWebUpdate(data) {
  return request({
    url: "/sts/web",
    method: "put",
    data,
  });
}

/**
 * 设备管理
 */
export function stsDeviceList(params) {
  return request({
    url: "/sts/list",
    method: "get",
    params,
  });
}

// 设备迁移
export function stsEquipUpdate(data) {
  return request({
    url: "/sts/equip/update",
    method: "put",
    data,
  });
}

// 任务变更
export function stsTaskUpdate(data) {
  return request({
    url: "/sts/task/update",
    method: "put",
    data,
  });
}

// 测试结果
export function stsTestList(params) {
  return request({
    url: "/test/list",
    method: "get",
    params,
  });
}

// 导出
export function stsTestExport(params) {
  return request({
    url: "/test/export",
    method: "get",
    params,
  });
}



/***
 * sop管理
 */
export function sopList(params) {
  return request({
    url: "/management/list",
    method: "get",
    params,
  });
}

// 新增
export function sopSave(data) {
  return request({
    url: "/management/save",
    method: "post",
    data,
  });
}

// 修改
export function sopUpdate(data) {
  return request({
    url: "/management/update",
    method: "put",
    data,
  });
}

// 审核
export function sopState(data) {
  return request({
    url: "/management/state",
    method: "put",
    data,
  });
}

// 删除
export function sopDelete(data) {
  return request({
    url: "/management/delete",
    method: "delete",
    data,
  });
}

// 查看
export function sopInfo(id) {
  return request({
    url: "/management/process/" + id,
    method: "get",
  });
}

// 禁用、启用
export function sopAuth(data) {
  return request({
    url: "/management/auth",
    method: "put",
    data,
  });
}

// 用例导入
export function caseUpload(data) {
  return request({
    url: "/test/case/input",
    method: "put",
    data
  });
}

// pdf转换图片
export function fileConverter(data) {
  return request({
    url: "/file/converter",
    method: "post",
    data,
    isToken: false
  });
}

// 生产许可
export function computerLicenseList(params) {
  return request({
    url: "/computer/license/list",
    method: "get",
    params
  });
}

// 禁用、启用
export function computerUpdate(data) {
  return request({
    url: "/computer/license/update",
    method: "put",
    data
  });
}

// 操作记录
export function computerLogList(params) {
  return request({
    url: "/computer/log/list",
    method: "get",
    params
  });
}

// 配置总览
export function modelConfigList(params) {
  return request({
    url: "/model/config/list",
    method: "get",
    params
  });
}

// 临时配置信息
export function modelTempConfigList(computerName) {
  return request({
    url: `/model/config/temp/${computerName}`,
    method: "get"
  });
}

// 审核
export function modelConfigState(data) {
  return request({
    url: "/model/config/state",
    method: "put",
    data
  });
}


// 维修记录
export function recordList(params) {
  return request({
    url: "/maintenance/record/list",
    method: "get",
    params
  })
}

// 新增维修记录
export function recordSave(data) {
  return request({
    url: "/maintenance/record/save",
    method: "post",
    data
  })
}

// 修改维修记录
export function recordUpdate(data) {
  return request({
    url: "/maintenance/record/update",
    method: "put",
    data
  })
}

// 删除维修记录
export function recordDelete(data) {
  return request({
    url: "/maintenance/record/delete",
    method: "delete",
    data
  })
}

// 数据报表
export function recordDataReport(params) {
  return request({
    url: "/maintenance/record/data/report",
    method: "get",
    params
  })
}

/**
 * 气密性测试配置管理
 */
export function gasConfigList(params) {
  return request({
    url: "/tightness/config/list",
    method: "get",
    params
  })
}

// 新增
export function gasConfigSave(data) {
  return request({
    url: "/tightness/config/save",
    method: "post",
    data,
  });
}

// 修改
export function gasConfigUpdate(data) {
  return request({
    url: "/tightness/config/update",
    method: "put",
    data,
  });
}

export function gasConfigAuth(data) {
  return request({
    url: "/tightness/config/auth",
    method: "put",
    data,
  });
}

// 删除
export function gasConfigDelete(data) {
  return request({
    url: "/tightness/config/delete",
    method: "delete",
    data,
  });
}

// 导出
export function ConfigExport(data) {
  return request({
    url: "/computer/export",
    method: "post",
    data,
  });
}

// 根据品类查询型号配置情况
export function gasBulkConfigList(params) {
  return request({
    url: "/tightness/config/computer/config/list",
    method: "get",
    params
  })
}

// 批量导入气密性配置
export function gasBulkConfigAuth(data) {
  return request({
    url: "/tightness/config/import/config",
    method: "put",
    data,
  });
}