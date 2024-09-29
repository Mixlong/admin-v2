import request from "@/utils/request";

// 列表
export function deliveryList(params) {
  return request({
    url: "/delivery/management/list",
    method: "get",
    params,
  });
}

// 新增
export function addDelivery(data) {
  return request({
    url: "/delivery/management/save",
    method: "post",
    data,
  });
}

// 修改
export function updateDelivery(data) {
  return request({
    url: "/delivery/management/update",
    method: "put",
    data,
  });
}

// 取消
export function cancelDelivery(id) {
  return request({
    url: "/delivery/management/cancel/" + id,
    method: "put",
  });
}

// 删除
export function deleteDelivery(data) {
  return request({
    url: "/delivery/management/delete",
    method: "delete",
    data,
  });
}

// 发货
export function outputDelivery(data) {
  return request({
    url: "/delivery/management/output",
    method: "post",
    data,
  });
}

// 出货详情
export function deliveryDetail(id) {
  return request({
    url: "/delivery/management/detail/" + id,
    method: "get",
  });
}
