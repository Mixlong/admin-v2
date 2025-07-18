import request from "@/utils/request";


export function scriptList(params) {
  return request({
    url: "/script/list",
    method: "get",
    params,
  });
}

export function scriptUpdateLog(params) {
  return request({
    url: "/script/update/log",
    method: "get",
    params,
  });
}

export function scriptAuth(data) {
  return request({
    url: "/script/auth",
    method: "put",
    data,
  });
}

export function scriptAdd(data) {
  return request({
    url: "/script/add",
    method: "post",
    data,
  });
}

export function scriptUpdate(data) {
  return request({
    url: "/script/update",
    method: "put",
    data,
  });
}

