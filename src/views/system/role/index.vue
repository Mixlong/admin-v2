<template>
  <div class="app-container role-permission-page">
    <!-- 顶部搜索栏 -->
    <div class="top-bar">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" @submit.native.prevent>
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            size="mini"
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 160px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 主体内容：左右分栏 -->
    <div class="main-content">
      <!-- 左侧：角色列表 -->
      <div class="role-list-panel">
        <div class="panel-header">
          <span class="panel-title">角色列表</span>
          <div class="panel-actions">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:role:add']">新增</el-button>
          </div>
        </div>
        <div class="role-list" v-loading="loading">
          <div
            v-for="role in roleList"
            :key="role.roleId"
            class="role-item"
            :class="{ active: selectedRole && selectedRole.roleId === role.roleId }"
            @click="selectRole(role)"
          >
            <div class="role-info">
              <i class="el-icon-user"></i>
              <div class="role-text-content">
                <div class="role-name">{{ role.roleName }}</div>
                <div class="role-key">{{ role.roleKey }}</div>
              </div>
            </div>
            <span v-if="selectedRole && selectedRole.roleId === role.roleId" class="role-count">
              {{ selectedMenuCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧：权限配置 -->
      <div class="permission-panel">
        <div class="panel-header">
          <span class="panel-title">权限管理</span>
          <div class="panel-actions" v-if="selectedRole">
            <el-button type="primary" @click="savePermission" :loading="saving">保存配置</el-button>

            <el-button size="mini" icon="el-icon-edit" @click="handleUpdate(selectedRole)" v-hasPermi="['system:role:edit']">编辑</el-button>
            <el-button size="mini" icon="el-icon-document-copy" @click="handleCopy(selectedRole)" v-hasPermi="['system:role:add']">复制</el-button>
            <el-button size="mini" icon="el-icon-delete" type="danger" @click="handleDelete(selectedRole)" v-hasPermi="['system:role:remove']">删除</el-button>
          </div>
        </div>

        <!-- 权限配置内容（使用 v-show 保持 DOM） -->
        <div v-show="selectedRole" class="permission-content">
          <!-- 目录分配 -->
          <div class="menu-permission">
            <div class="menu-header">
              <span>目录分配：</span>
              <div class="menu-actions">
                <el-button size="mini" @click="handleTreeNodeAll(true)">全选</el-button>
                <el-button size="mini" @click="handleTreeNodeAll(false)">取消</el-button>
              </div>
            </div>
            <div class="permission-tree-wrapper">
              <el-tree
                class="permission-tree"
                :data="menuOptions"
                show-checkbox
                ref="permissionMenu"
                node-key="id"
                :check-strictly="false"
                empty-text="加载中..."
                :props="defaultProps"
                @check-change="handleTreeCheck"
              ></el-tree>
            </div>
          </div>
 
        </div>

        <!-- 未选择角色提示（使用 v-show） -->
        <div v-show="!selectedRole" class="no-role-selected">
          <i class="el-icon-info"></i>
          <span>请从左侧选择一个角色</span>
        </div>
      </div>
    </div>

    <!-- 添加或修改角色对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body class="dialog-scroll">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menu"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, getRole, delRole, addRole, updateRole } from "@/api/system/role"
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu"

export default {
  name: "Role",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      loading: true,
      total: 0,
      roleList: [],
      title: "",
      open: false,
      menuExpand: false,
      menuNodeAll: false,
      queryParams: {
        p: 1,
        l: 1000, // 一次性加载全部角色
        roleName: undefined
      },
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      rules: {
        roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
        roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
        roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }]
      },
      // 权限配置相关
      selectedRole: null,
      menuOptions: [],
      selectedMenuCount: 0,
      saving: false,
      originalCheckedKeys: [], // 保存原始选中的key，用于取消
      // 操作权限
      actionPermissions: [
        { key: 'view', label: '访问管理' },
        { key: 'add', label: '新增' },
        { key: 'edit', label: '编辑' },
        { key: 'delete', label: '删除' },
        { key: 'copy', label: '复制' },
        { key: 'download', label: '下载' }
      ],
      checkedActions: ['view'] // 默认选中访问管理
    }
  },
  created() {
    this.getList()
    this.getMenuTreeselect()
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true
      listRole(this.queryParams).then(response => {
        this.roleList = response.rows
        this.total = response.total
        this.loading = false
        
        // 如果之前选中的角色还在列表中，保持选中
        if (this.selectedRole) {
          const found = this.roleList.find(r => r.roleId === this.selectedRole.roleId)
          if (found) {
            this.selectedRole = found
          } else {
            this.selectedRole = null
          }
        }
      })
    },
    
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
      })
    },

    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.menus
        return response
      })
    },
    
    /** 选择角色 */
    selectRole(role) {
      this.selectedRole = role
      this.checkedActions = ['view'] // 默认选中访问管理
      
      // 获取该角色的菜单权限
      roleMenuTreeselect(role.roleId).then(response => {
        this.$nextTick(() => {
          if (this.$refs.permissionMenu) {
            this.$refs.permissionMenu.setCheckedKeys([])
            this.originalCheckedKeys = response.checkedKeys || []
            response.checkedKeys.forEach((v) => {
              this.$refs.permissionMenu.setChecked(v, true, false)
            })
            this.updateSelectedMenuCount()
          }
        })
      })
    },
    
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getCheckedKeys()
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        let treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value
        }
      }
    },
    
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions: [])
      }
    },
    
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.form.menuCheckStrictly = value ? true: false
      }
    },
    
    /** 更新选中菜单数量 */
    updateSelectedMenuCount() {
      if (this.$refs.permissionMenu) {
        this.selectedMenuCount = this.$refs.permissionMenu.getCheckedKeys().length
      }
    },
    
    /** 权限树选中变化 */
    handleTreeCheck() {
      this.updateSelectedMenuCount()
    },
    
    /** 权限树全选/取消 */
    handleTreeNodeAll(checked) {
      if (this.$refs.permissionMenu) {
        this.$refs.permissionMenu.setCheckedNodes(checked ? this.menuOptions : [])
        this.updateSelectedMenuCount()
      }
    },
    
    /** 操作权限相关 */
    isActionChecked(key) {
      return this.checkedActions.includes(key)
    },
    
    toggleAction(key) {
      const index = this.checkedActions.indexOf(key)
      if (index > -1) {
        this.checkedActions.splice(index, 1)
      } else {
        this.checkedActions.push(key)
      }
    },
    
    /** 取消权限修改 */
    cancelPermission() {
      if (this.$refs.permissionMenu) {
        this.$refs.permissionMenu.setCheckedKeys([])
        this.originalCheckedKeys.forEach((v) => {
          this.$refs.permissionMenu.setChecked(v, true, false)
        })
        this.updateSelectedMenuCount()
      }
    },
    
    /** 保存权限配置 */
    savePermission() {
      if (!this.selectedRole) {
        this.$modal.msgWarning("请选择一个角色")
        return
      }
      
      this.saving = true
      
      // 获取选中的菜单
      let checkedKeys = this.$refs.permissionMenu.getCheckedKeys()
      let halfCheckedKeys = this.$refs.permissionMenu.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      
      // 先获取完整角色信息，确保不丢失其他字段
      getRole(this.selectedRole.roleId).then(response => {
        const data = {
          ...response.data,
          menuIds: checkedKeys,
          menuCheckStrictly: true,
          deptCheckStrictly: true
        }
        
        updateRole(data).then(response => {
          this.$modal.msgSuccess("保存成功")
          this.saving = false
          this.originalCheckedKeys = checkedKeys
          this.getList()
        }).catch(() => {
          this.saving = false
        })
      }).catch(() => {
        this.saving = false
      })
    },
    
    // 表单相关
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.menuExpand = false,
      this.menuNodeAll = false,
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      }
      this.resetForm("form")
    },
    
    cancel() {
      this.open = false
      this.reset()
    },
    
    handleQuery() {
      this.queryParams.p = 1
      this.getList()
    },
    
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    
    handleAdd() {
      this.reset()
      this.getMenuTreeselect()
      this.open = true
      this.title = "添加角色"
    },
    
    handleUpdate(row) {
      this.reset()
      const roleId = row.roleId || this.ids
      // 直接调用 API，不使用 getRoleMenuTreeselect，避免污染 menuOptions
      const roleMenuPromise = roleMenuTreeselect(roleId)
      getRole(roleId).then(response => {
        this.form = response.data
        this.open = true
        // 强制设置父子联动为 true（数据库没有这个字段）
        this.form.menuCheckStrictly = true 
        this.$nextTick(() => {
          roleMenuPromise.then(res => {
            // 修复1：赋值给 form.menuIds，防止提交时权限丢失
            this.form.menuIds = res.checkedKeys
            
            // 弹窗内 tree 回显
            let checkedKeys = res.checkedKeys
            if (this.$refs.menu) {
              checkedKeys.forEach((v) => {
                  this.$nextTick(()=>{
                      this.$refs.menu.setChecked(v, true ,false)
                  })
              })
            }
          })
        })
        this.title = "修改角色"
      })
    },
    
    handleCopy(row) {
      this.reset()
      // 直接调用 API，不使用 getRoleMenuTreeselect，避免污染 menuOptions
      const roleMenuPromise = roleMenuTreeselect(row.roleId)
      getRole(row.roleId).then(response => {
        this.form = {
          ...response.data,
          roleId: undefined,
          roleName: response.data.roleName + '（副本）',
          roleKey: response.data.roleKey + '_copy',
          menuCheckStrictly: true
        }
        this.open = true
        this.$nextTick(() => {
          roleMenuPromise.then(res => {
            // 保存菜单权限到 form.menuIds
            this.form.menuIds = res.checkedKeys
            
            // 在弹窗内的权限树上回显选中状态
            if (this.$refs.menu) {
              let checkedKeys = res.checkedKeys
              checkedKeys.forEach((v) => {
                this.$nextTick(() => {
                  this.$refs.menu.setChecked(v, true, false)
                })
              })
            }
          })
        })
        this.title = "复制角色"
      })
    },
    
    handleDelete(row) {
      this.$modal.confirm('是否确认删除角色"' + row.roleName + '"？').then(() => {
        return delRole(row.roleId)
      }).then(() => {
        this.getList()
        if (this.selectedRole && this.selectedRole.roleId === row.roleId) {
          this.selectedRole = null
        }
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.roleId != undefined) {
             // 兼容处理：如果弹窗内有树则获取，否则使用 handleUpdate 预加载的 menuIds
            if (this.$refs.menu) {
              this.form.menuIds = this.getMenuAllCheckedKeys()
            }
            
            updateRole(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
              
              // 关键修复：如果修改的是当前选中的角色，刷新右侧权限树
              if (this.selectedRole && this.selectedRole.roleId === this.form.roleId) {
                // 重新获取该角色的权限树选中状态
                 roleMenuTreeselect(this.form.roleId).then(res => {
                    if (this.$refs.permissionMenu) {
                      this.$refs.permissionMenu.setCheckedKeys(res.checkedKeys)
                      // 更新相关状态
                      this.originalCheckedKeys = res.checkedKeys
                      this.updateSelectedMenuCount()
                    }
                 })
              }
            })
          } else {
            if (this.$refs.menu) {
              this.form.menuIds = this.getMenuAllCheckedKeys()
            }
            addRole(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.role-permission-page {
  display: flex;
  flex-direction: column;
  // 固定高度，控制在一屏内（减去头部导航等高度）
  height: calc(100vh - 140px)!important;
  overflow: hidden;
  
  .top-bar {
    flex-shrink: 0;
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
      margin-bottom: 0;
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    min-height: 0; // 重要：允许 flex 子元素收缩
  }
}

// 左侧角色列表
.role-list-panel {
  width: 240px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fff;
  
  .panel-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;
    background: #f5f7fa;
    
    .panel-title {
      font-weight: bold;
      font-size: 14px;
    }
  }
  
  .role-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .role-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.2s;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: #ecf5ff;
      color: #409eff;
    }
    
    .role-info {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: hidden;
      
      .el-icon-user {
        margin-right: 8px;
        flex-shrink: 0;
      }
      
      .role-text-content {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .role-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        line-height: 1.2;
      }
      
      .role-key {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .role-count {
      background: #409eff;
      color: #fff;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      min-width: 20px;
      text-align: center;
      flex-shrink: 0;
      margin-left: 8px;
    }
  }
}

// 右侧权限配置
.permission-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  
  .panel-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;
    background: #f5f7fa;
    height:53px;
    .panel-title {
      font-weight: bold;
      font-size: 14px;
    }
  }
  
  // 权限配置内容容器
  .permission-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .permission-actions {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-button {
      margin-right: 8px;
      margin-bottom: 8px;
    }
    
    .action-count {
      background: rgba(255, 255, 255, 0.3);
      padding: 2px 6px;
      border-radius: 8px;
      margin-left: 4px;
      font-size: 12px;
    }
  }
  
  .menu-permission {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .menu-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e4e7ed;
    }
    
    .permission-tree-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 10px 16px;
    }
  }
  
  .permission-footer {
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
    text-align: right;
    background: #f5f7fa;
  }
  
  .no-role-selected {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #909399;
    
    .el-icon-info {
      font-size: 48px;
      margin-bottom: 16px;
    }
  }
}
</style>