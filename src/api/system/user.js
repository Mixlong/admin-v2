import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function listUser(query) {
  return request({
    url: "/system/user/list",
    method: "get",
    params: query,
  });
}

// 查询 PUCS 申请人员列表
export function listPucsUser(query) {
  return request({
    url: "/system/user/list/pucs",
    method: "get",
    params: query,
  });
}

// 查询用户列表，用于流程里的用户选择
export function selectUser(query) {
  return request({
    // url: '/system/user/selectUser',
    url: "/system/user/list",
    method: "get",
    params: query,
  });
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    // url: '/system/user/deptTree',
    url: "/system/dept/treeselect",
    method: "get",
  });
}

/**
 * 2021-06-10
 * 原来接口查询是项目经理，现在换成查询所有用户，返回前端字段不同，避免批量处理，直接重写字段名称
 * */
export function memberDictUser() {
  return new Promise((resolve) => {
    request({
      url: "/system/user/list/user",
      method: "get",
    }).then((res) => {
      let { code } = res;
      if (code == 200) {
        for (let key of res.data) {
          key.dictLabel = key.userName;
          key.dictValue = key.userId;
          key.roleKey = key.roleKey;
        }
      }
      resolve(res);
    });
  });
}

export function dutyUserList() {
  return request({
    url: "/system/user/list/dict",
    method: "get",
  });
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: "/system/user/" + praseStrEmpty(userId),
    method: "get",
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: "/system/user",
    method: "post",
    data: data,
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: "/system/user",
    method: "put",
    data: data,
  });
}

// 删除用户
export function delUser(userId) {
  return request({
    url: "/system/user/" + userId,
    method: "delete",
  });
}

// 预览审核人变更影响范围
export function previewAuditReassign(data) {
  return request({
    url: "/audit/reassign/preview",
    method: "post",
    data,
  });
}

// 执行审核人变更
export function executeAuditReassign(data) {
  return request({
    url: "/audit/reassign/execute",
    method: "post",
    data,
  });
}

// 导出用户
export function exportUser(query) {
  return request({
    url: "/system/user/export",
    method: "get",
    params: query,
  });
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password,
  };
  return request({
    url: "/system/user/resetPwd",
    method: "put",
    data: data,
  });
}

// 用户状态修改
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status,
  };
  return request({
    url: "/system/user/changeStatus",
    method: "put",
    data: data,
  });
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: "/system/user/profile",
    method: "get",
  });
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: "/system/user/profile",
    method: "put",
    data: data,
  });
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword,
  };
  return request({
    url: "/system/user/profile/updatePwd",
    method: "put",
    params: data,
  });
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: "/system/user/profile/avatar",
    method: "post",
    data: data,
  });
}

// 查询用户角色授权信息
export function getAuthRole(userId) {
  return request({
    url: "/system/user/authRole/" + userId,
    method: "get",
  });
}

// 保存用户角色授权
export function updateAuthRole(data) {
  return request({
    url: "/system/user/authRole",
    method: "put",
    data: data,
  });
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: "/system/user/importTemplate",
    method: "get",
  });
}

// 查询所有用户
export function dictUserList() {
  return request({
    url: "/system/user/list/dict",
    method: "get",
  });
}

// 清除用户安全令牌
export function clearSecurity(data) {
  return request({
    url: "/clear/security/" + data,
    method: "post",
  });
}
