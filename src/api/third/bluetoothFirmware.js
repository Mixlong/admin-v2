import request from "@/utils/request";

// 分页查询蓝牙固件管理列表（包含历史记录）
export function getFirmwareList(params) {
  return request({
    url: "/bluetooth/firmware/list",
    method: "get",
    params,
  });
}

// 查询蓝牙固件管理详情（包含历史记录）
export function getFirmwareDetail(id) {
  return request({
    url: `/bluetooth/firmware/detail/${id}`,
    method: "get",
  });
}

// 新增蓝牙固件管理
export function addFirmware(data) {
  return request({
    url: "/bluetooth/firmware/add",
    method: "post",
    data,
  });
}

// 修改蓝牙固件管理
export function updateFirmware(data) {
  return request({
    url: "/bluetooth/firmware/update",
    method: "put",
    data,
  });
}

// 删除蓝牙固件管理
export function deleteFirmware(id) {
  return request({
    url: `/bluetooth/firmware/delete/${id}`,
    method: "delete",
  });
}

// 添加新固件（更新版本信息）
export function addNewFirmware(id, params) {
  return request({
    url: `/bluetooth/firmware/add-new-firmware/${id}`,
    method: "put",
    params,
  });
}
