/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-29 15:08:44
 * @FilePath: \FILECONF-UI\src\utils\permission.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import store from "@/store";

/**
 * 字符权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export function checkPermi(value) {
  if (value && Array.isArray(value) && value.length > 0) {
    const permissions = store.getters && store.getters.permissions;
    const permissionDatas = value;

    const hasPermission = permissions.some((permission) =>
      permissionDatas.includes(permission)
    );

    return hasPermission;
  } else {
    console.error(
      `need roles! Like checkPermi="['system:user:add','system:user:edit']"`
    );
    return false;
  }
}

/**
 * 角色权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export function checkRole(value) {
  if (value && Array.isArray(value) && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value

    const hasRole = roles.some(role => {
      return permissionRoles.includes(role)
    })

    return hasRole;
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`)
    return false
  }
}

