import request from "@/utils/request";

export function schemeTypeList(params) {
  return request({
    url: "/scheme/type/list",
    method: "get",
    params,
  });
}

// 属性列表
export function schemeTypePtList(params) {
  return request({
    url: "/scheme/type/property/list",
    method: "get",
    params,
  });
}

// 已选属性列表
export function schemeTypePtPick(params) {
  return request({
    url: "/scheme/type/property/pick",
    method: "get",
    params,
  });
}

// 详情
export function schemeTypeInfo(id) {
  return request({
    url: "/scheme/type/info/" + id,
    method: "get",
  });
}

// 保存
export function schemeTypeSave(data) {
  return request({
    url: "/scheme/type/save",
    method: "post",
    data,
  });
}

// 修改
export function schemeTypeUpdate(data) {
  return request({
    url: "/scheme/type/update",
    method: "put",
    data,
  });
}

/***
 *  生产资料归类
 */

export function meansList(params) {
  return request({
    url: "/means/list",
    method: "get",
    params,
  });
}

// 详情
export function meansInfo(id) {
  return request({
    url: "/means/info/" + id,
    method: "get",
  });
}

// 保存
export function meansSave(data) {
  return request({
    url: "/means/save",
    method: "post",
    data,
  });
}

// 修改
export function meansUpdate(data) {
  return request({
    url: "/means/update",
    method: "put",
    data,
  });
}

// 删除
export function meansDelete(data) {
    return request({
      url: "/means/delete",
      method: "delete",
      data,
    });
  }
