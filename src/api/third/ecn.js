import request from "@/utils/request";

// 查询仪表列表
export function bomAdd(data) {
  return request({
    url: "/bom",
    method: "post",
    data,
  });
}

export function bomUpdate(data) {
  return request({
    url: "/bom",
    method: "put",
    data,
  });
}

export function bomDetail(id) {
  return request({
    url: "/bom/detail/" + id,
    method: "get",
  });
}

export function bomList(params) {
  return request({
    url: "/bom/list",
    method: "get",
    params,
  });
}

export function bomAuth(data) {
  return request({
    url: "/bom/auth",
    method: "put",
    data,
  });
}

// ECN人员列表
export function ecnPersonList(params) {
  return request({
    url: "/bom/personnel/list",
    method: "get",
    params,
  });
}
// Bom人员列表
export function BomPersonList(params) {
  return request({
    url: "/bom/order/personnel/list",
    method: "get",
    params,
  });
}

// ECN人员管理
export function ecnPersonEdit(data) {
  return request({
    url: "/bom/personnel/edit",
    method: "put",
    data,
  });
}
export function personBomEdit(data) {
  return request({
    url: "/bom/order/personnel/edit",
    method: "put",
    data,
  });
}
// 初审
export function ecnFirstState(data) {
  return request({
    url: "/bom/first/state",
    method: "put",
    data,
  });
}
// 会审
export function ecnFieldState(data) {
  return request({
    url: "/bom/field/state",
    method: "put",
    data,
  });
}
// PMC终审
export function ecnPmcState(data) {
  return request({
    url: "/bom/pmc/state",
    method: "put",
    data
  });
}
// 终审
export function ecnSecondState(data) {
  return request({
    url: "/bom/second/state",
    method: "put",
    data,
  });
}
export function ecnSystemState(data) {
  return request({
    url: "/bom/system/state",
    method: "put",
    data,
  });
}
