/**
 * 权限管理 Composable
 * 处理角色权限检查、字段编辑权限等逻辑
 */
import { ref, computed } from 'vue'
import {
  roleEditableColumns,
  roleNameMap,
  canAddOrderRoles,
  hasEditPermissionRoles
} from '../config/permissions'

export function usePermission() {
  // 模拟角色（用于测试，实际应从 store 获取）
  const mockRole = ref('ms')
  const mockRoles = ref(['ms'])

  // 是否有编辑权限
  const hasEditPermission = ref(true)

  /**
   * 检查是否拥有指定角色
   * @param {Array<string>} roles - 要检查的角色数组
   * @returns {boolean}
   */
  const checkRole = roles => {
    // 优先使用模拟角色（用于测试）
    if (mockRoles.value && mockRoles.value.length > 0) {
      return roles.some(role => mockRoles.value.includes(role))
    }

    // 生产环境：从父应用获取真实角色
    // 方式1: 通过 qiankun/wujie 的 props 传递
    // const userRoles = window.__POWERED_BY_WUJIE__ ? window.wujieProps?.userRoles : []

    // 方式2: 从主应用的 localStorage 读取
    // const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    // const userRoles = userInfo.roles || []

    return true
  }

  /**
   * 检查字段是否可编辑（根据当前角色）
   * @param {string} field - 字段名
   * @returns {boolean}
   */
  const isColumnEditable = field => {
    const currentRole = mockRole.value || 'ms'
    const editableFields = roleEditableColumns[currentRole] || []
    return editableFields.includes(field)
  }

  /**
   * 获取角色名称
   * @param {string} roleKey - 角色标识
   * @returns {string}
   */
  const getRoleName = roleKey => {
    return roleNameMap[roleKey] || roleKey
  }

  /**
   * 切换角色（仅用于测试）
   * @param {string} role - 角色标识
   */
  const switchRole = role => {
    mockRole.value = role
    mockRoles.value = [role]
    updateEditPermission()
  }

  /**
   * 更新编辑权限
   */
  const updateEditPermission = () => {
    hasEditPermission.value = checkRole(hasEditPermissionRoles)
  }

  /**
   * 是否可以新增订单
   */
  const canAddOrder = computed(() => checkRole(canAddOrderRoles))

  /**
   * 当前角色可编辑的字段列表
   */
  const currentEditableFields = computed(() => {
    const currentRole = mockRole.value || 'ms'
    return roleEditableColumns[currentRole] || []
  })

  return {
    mockRole,
    mockRoles,
    hasEditPermission,
    checkRole,
    isColumnEditable,
    getRoleName,
    switchRole,
    updateEditPermission,
    canAddOrder,
    currentEditableFields
  }
}
