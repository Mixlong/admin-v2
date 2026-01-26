import request from '@/utils/request'

/**
 * 菜单数据类型
 * @typedef {Object} MenuData
 * @property {number} [menuId] - 菜单ID
 * @property {string} menuName - 菜单名称
 * @property {number} [parentId] - 父菜单ID
 * @property {number} [orderNum] - 显示顺序
 * @property {string} [path] - 路由地址
 * @property {string} [component] - 组件路径
 * @property {string} [query] - 路由参数
 * @property {string} [isFrame] - 是否为外链（0是 1否）
 * @property {string} [isCache] - 是否缓存（0缓存 1不缓存）
 * @property {string} [menuType] - 菜单类型（M目录 C菜单 F按钮）
 * @property {string} [visible] - 菜单状态（0显示 1隐藏）
 * @property {string} [status] - 菜单状态（0正常 1停用）
 * @property {string} [perms] - 权限标识
 * @property {string} [icon] - 菜单图标
 * @property {number} [appType] - 应用类型（1微前端V2组件 2本地V3组件）
 * @property {string} [remark] - 备注
 */

/**
 * 查询菜单列表
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询菜单详细
 * @param {number} menuId - 菜单ID
 * @returns {Promise}
 */
export function getMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get'
  })
}

/**
 * 查询菜单下拉树结构
 * @returns {Promise}
 */
export function treeselect() {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  })
}

/**
 * 根据角色ID查询菜单下拉树结构
 * @param {number} roleId - 角色ID
 * @returns {Promise}
 */
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}

/**
 * 新增菜单
 * @param {MenuData} data - 菜单数据
 * @returns {Promise}
 */
export function addMenu(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data: data
  })
}

/**
 * 修改菜单
 * @param {MenuData} data - 菜单数据
 * @returns {Promise}
 */
export function updateMenu(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data: data
  })
}

/**
 * 删除菜单
 * @param {number} menuId - 菜单ID
 * @returns {Promise}
 */
export function delMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete'
  })
}