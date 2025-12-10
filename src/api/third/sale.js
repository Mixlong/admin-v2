import request from "@/utils/request";

export function saleList(query) {
  return request({
    url: "/sale/list",
    method: "get",
    params: query,
  });
}

export function saleDetail(query) {
  return request({
    url: "/sale/detail/" + query,
    method: "get",
    params: query,
  });
}

export function saleAuth(query) {
  return request({
    url: "/sale/auth/",
    method: "put",
    data: query,
  });
}

// export function saleUpdate(query) {
//     return request({
//         url: '/sale',
//         method: 'put',
//         data: query,
//     });
// }

export function saleAdd(query) {
  return request({
    url: "/sale",
    method: "post",
    data: query,
  });
}

export function saleState(query) {
  return request({
    url: "/sale/state",
    method: "put",
    data: query,
  });
}

// 售后支持 - 分页查询列表
export function afterList(params) {
  return request({
    url: "/after/new/list",
    method: "get",
    params,
  });
}

// 新增
export function saleSave(data) {
  return request({
    url: "/after/new/add",
    method: "post",
    data,
  });
}

// 修改
export function saleUpdate(data) {
  return request({
    url: "/after/new/update",
    method: "put",
    data,
  });
}

// 打开关闭售后
export function saleOperation(data) {
  return request({
    url: "/after/operation",
    method: "put",
    data,
  });
}

// 删除
export function saleDelete(id) {
  return request({
    url: `/after/new/delete/${id}`,
    method: "delete",
  });
}

// 详情
export function afterInfo(detailId) {
  return request({
    url: `/after/new/detail/${detailId}`,
    method: "get",
  });
}

// 处理
export function afterHandle(data) {
  return request({
    url: "/after/handle",
    method: "put",
    data,
  });
}

// 批量处理
export function afterBatchHandle(data) {
  return request({
    url: "/after/batch/handle",
    method: "put",
    data,
  });
}

export function saleExport(params) {
  return request({
    url: "/after/export",
    method: "get",
    params,
  });
}

// 批量导出
export function afterMultipleDownload(data) {
  return request({
    url: "/after/new/export",
    method: "post",
    data,
  });
}

// 处理进展
export function afterHandleDetail(afterSaleId) {
  return request({
    url: `/after/handle/detail/${afterSaleId}`,
    method: "get",
  });
}

// 统计表 --- 当前状态
export function afterStatusList(params) {
  return request({
    url: "/after/status/list",
    method: "get",
    params
  });
}
// 统计表 --- 不良分布
export function afterBadList(params) {
  return request({
    url: "/after/bad/list",
    method: "get",
    params
  });
}
// 统计表 --- TOP问题排行
export function afterTopList(params) {
  return request({
    url: "/after/top/list",
    method: "get",
    params
  });
}

export function afterSearch(params) {
  return request({
    url: "/after/search",
    method: "get",
    params,
  });
}

// 品类 （可根据客户id查询）
export function afterCategoryList(params) {
  return request({
    url: "/after/category/list",
    method: "get",
    params,
  });
}

// 售后图表查询
export function afterResultList(params) {
  return request({
    url: "/after/result/list",
    method: "get",
    params,
  });
}

// 批量物流信息输入
export function afterLogistics(data) {
  return request({
    url: "/after/logistics",
    method: "put",
    data,
  });
}


// ========== 售后统计报表 API ==========

// 每月客退趋势
export function getMonthlyTrend(params) {
  return request({
    url: "/report/monthly-trend",
    method: "get",
    params,
  });
}

// 客退类型占比
export function getAfterTypeRatio(params) {
  return request({
    url: "/report/after-type-ratio",
    method: "get",
    params,
  });
}

// 一级责任占比
export function getParentResponsibilityRatio(params) {
  return request({
    url: "/report/parent-responsibility-ratio",
    method: "get",
    params,
  });
}

// 二级责任占比
export function getResponsibilityRatio(params) {
  return request({
    url: "/report/responsibility-ratio",
    method: "get",
    params,
  });
}

// 一级问题帕累托图
export function getProblemMajorPareto(params) {
  return request({
    url: "/report/problem-major-pareto",
    method: "get",
    params,
  });
}

// 二级问题帕累托图
export function getProblemMinorPareto(params) {
  return request({
    url: "/report/problem-minor-pareto",
    method: "get",
    params,
  });
}

// 仪表型号帕累托图
export function getComputerModelPareto(params) {
  return request({
    url: "/report/computer-model-pareto",
    method: "get",
    params,
  });
}
