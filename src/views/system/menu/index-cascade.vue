<template>
  <div class="app-container menu-cascade-page">
    <!-- 顶部搜索栏 -->
    <div class="top-bar">
      <el-form :model="queryParams" ref="queryForm" :inline="true" size="small">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input
            v-model="queryParams.menuName"
            placeholder="请输入菜单名称"
            clearable
            size="mini"
            style="width: 200px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="菜单状态"
            clearable
            size="mini"
            style="width: 120px"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:menu:add']">新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 主体内容：级联面板 -->
    <div class="main-content" v-loading="loading">
      <!-- 一级菜单 -->
      <div class="cascade-panel level-1">
        <div class="panel-header">
          <span class="panel-title">
            <i class="el-icon-menu"></i>
            一级菜单
          </span>
          <span class="panel-count">{{ level1Menus.length }}</span>
        </div>
        <div class="menu-list">
          <div
            v-for="menu in level1Menus"
            :key="menu.menuId"
            class="menu-item"
            :class="{
              active: selectedLevel1 && selectedLevel1.menuId === menu.menuId,
              'has-children': hasChildren(menu)
            }"
            @click="selectLevel1(menu)"
          >
            <div class="menu-info">
              <i :class="getMenuTypeIcon(menu)" class="menu-icon"></i>
              <div class="menu-content">
                <div class="menu-name">{{ menu.menuName }}</div>
                <div class="menu-meta">
                  <el-tag :type="getMenuTypeTagType(menu)" size="mini">{{ getMenuTypeText(menu) }}</el-tag>
                  <span class="menu-status" :class="menu.status === '0' ? 'normal' : 'disabled'">
                    {{ menu.status === '0' ? '正常' : '停用' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="menu-actions">
              <i v-if="hasChildren(menu)" class="el-icon-arrow-right"></i>
              <el-badge v-if="hasChildren(menu)" :value="getChildrenCount(menu)" class="children-badge"></el-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- 二级菜单 -->
      <div class="cascade-panel level-2" v-if="selectedLevel1">
        <div class="panel-header">
          <span class="panel-title">
            <i class="el-icon-document"></i>
            二级菜单
          </span>
          <span class="panel-subtitle">{{ selectedLevel1.menuName }}</span>
          <span class="panel-count">{{ level2Menus.length }}</span>
        </div>
        <div class="menu-list">
          <div
            v-for="menu in level2Menus"
            :key="menu.menuId"
            class="menu-item"
            :class="{
              active: selectedLevel2 && selectedLevel2.menuId === menu.menuId,
              'has-children': hasChildren(menu)
            }"
            @click="selectLevel2(menu)"
          >
            <div class="menu-info">
              <i :class="getMenuTypeIcon(menu)" class="menu-icon"></i>
              <div class="menu-content">
                <div class="menu-name">{{ menu.menuName }}</div>
                <div class="menu-meta">
                  <el-tag :type="getMenuTypeTagType(menu)" size="mini">{{ getMenuTypeText(menu) }}</el-tag>
                  <span v-if="menu.component" class="menu-path">{{ menu.component }}</span>
                </div>
              </div>
            </div>
            <div class="menu-actions">
              <i v-if="hasChildren(menu)" class="el-icon-arrow-right"></i>
              <el-badge v-if="hasChildren(menu)" :value="getChildrenCount(menu)" class="children-badge"></el-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- 三级菜单/按钮 -->
      <div class="cascade-panel level-3" v-if="selectedLevel2">
        <div class="panel-header">
          <span class="panel-title">
            <i class="el-icon-setting"></i>
            三级菜单/按钮
          </span>
          <span class="panel-subtitle">{{ selectedLevel2.menuName }}</span>
          <span class="panel-count">{{ level3Menus.length }}</span>
        </div>
        <div class="menu-list">
          <div
            v-for="menu in level3Menus"
            :key="menu.menuId"
            class="menu-item"
            :class="{ active: selectedLevel3 && selectedLevel3.menuId === menu.menuId }"
            @click="selectLevel3(menu)"
          >
            <div class="menu-info">
              <i :class="getMenuTypeIcon(menu)" class="menu-icon"></i>
              <div class="menu-content">
                <div class="menu-name">{{ menu.menuName }}</div>
                <div class="menu-meta">
                  <el-tag :type="getMenuTypeTagType(menu)" size="mini">{{ getMenuTypeText(menu) }}</el-tag>
                  <span v-if="menu.perms" class="menu-perms">{{ menu.perms }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情/操作面板 -->
      <div class="cascade-panel detail-panel" v-if="selectedLevel1 || selectedLevel2 || selectedLevel3">
        <div class="panel-header">
          <span class="panel-title">
            <i class="el-icon-info"></i>
            菜单详情
          </span>
        </div>
        <div class="detail-content">
          <div class="detail-section" v-if="currentMenu">
            <div class="detail-item">
              <label>菜单名称：</label>
              <span>{{ currentMenu.menuName }}</span>
            </div>
            <div class="detail-item">
              <label>菜单类型：</label>
              <el-tag :type="getMenuTypeTagType(currentMenu)" size="small">
                {{ getMenuTypeText(currentMenu) }}
              </el-tag>
            </div>
            <div class="detail-item" v-if="currentMenu.icon">
              <label>菜单图标：</label>
              <svg-icon :icon-class="currentMenu.icon" />
              <span style="margin-left: 8px;">{{ currentMenu.icon }}</span>
            </div>
            <div class="detail-item">
              <label>显示排序：</label>
              <span>{{ currentMenu.orderNum }}</span>
            </div>
            <div class="detail-item" v-if="currentMenu.path">
              <label>路由地址：</label>
              <span>{{ currentMenu.path }}</span>
            </div>
            <div class="detail-item" v-if="currentMenu.component">
              <label>组件路径：</label>
              <span>{{ currentMenu.component }}</span>
            </div>
            <div class="detail-item" v-if="currentMenu.perms">
              <label>权限标识：</label>
              <el-tag size="small">{{ currentMenu.perms }}</el-tag>
            </div>
            <div class="detail-item" v-if="currentMenu.menuType === 'C'">
              <label>应用类型：</label>
              <el-tag :type="currentMenu.appType === 2 ? 'success' : 'primary'" size="small">
                {{ currentMenu.appType === 2 ? 'V3主应用' : 'V2微前端' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>菜单状态：</label>
              <el-tag :type="currentMenu.status === '0' ? 'success' : 'danger'" size="small">
                {{ currentMenu.status === '0' ? '正常' : '停用' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>创建时间：</label>
              <span>{{ parseTime(currentMenu.createTime) }}</span>
            </div>
          </div>

          <div class="detail-actions">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="handleUpdate(currentMenu)"
              v-hasPermi="['system:menu:edit']"
            >
              修改
            </el-button>
            <el-button
              type="success"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd(currentMenu)"
              v-hasPermi="['system:menu:add']"
            >
              新增子菜单
            </el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete(currentMenu)"
              v-hasPermi="['system:menu:remove']"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="700px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" :activeIcon="form.icon" @selected="selected" />
                <el-input
                  slot="reference"
                  v-model="form.icon"
                  placeholder="点击选择图标"
                  readonly
                >
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px; width: 16px"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
                class="w100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="是否外链">
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item label="权限标识">
              <el-input v-model="form.perms" placeholder="请权限标识" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="显示状态">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="菜单状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="是否缓存">
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="应用类型">
              <el-radio-group v-model="form.appType">
                <el-radio :label="1">V2微前端</el-radio>
                <el-radio :label="2">V3主应用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMenu,
  getMenu,
  delMenu,
  addMenu,
  updateMenu,
} from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "MenuCascade",
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 菜单树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 显示状态数据字典
      visibleOptions: [],
      // 菜单状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        status: undefined,
      },
      // 选中的菜单
      selectedLevel1: null,
      selectedLevel2: null,
      selectedLevel3: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" },
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" },
        ],
        path: [
          { required: true, message: "路由地址不能为空", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    // 一级菜单列表
    level1Menus() {
      return this.menuList.filter(menu => !menu.parentId || menu.parentId === 0);
    },
    // 二级菜单列表
    level2Menus() {
      if (!this.selectedLevel1) return [];
      return this.menuList.filter(menu => menu.parentId === this.selectedLevel1.menuId);
    },
    // 三级菜单列表
    level3Menus() {
      if (!this.selectedLevel2) return [];
      return this.menuList.filter(menu => menu.parentId === this.selectedLevel2.menuId);
    },
    // 当前选中的菜单
    currentMenu() {
      return this.selectedLevel3 || this.selectedLevel2 || this.selectedLevel1;
    },
  },
  created() {
    this.getList();
    this.getDicts("sys_show_hide").then((response) => {
      this.visibleOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then((response) => {
        this.menuList = response.data;
        this.loading = false;
      });
    },
    /** 选择一级菜单 */
    selectLevel1(menu) {
      this.selectedLevel1 = menu;
      this.selectedLevel2 = null;
      this.selectedLevel3 = null;
    },
    /** 选择二级菜单 */
    selectLevel2(menu) {
      this.selectedLevel2 = menu;
      this.selectedLevel3 = null;
    },
    /** 选择三级菜单 */
    selectLevel3(menu) {
      this.selectedLevel3 = menu;
    },
    /** 判断是否有子菜单 */
    hasChildren(menu) {
      return this.menuList.some(m => m.parentId === menu.menuId);
    },
    /** 获取子菜单数量 */
    getChildrenCount(menu) {
      return this.menuList.filter(m => m.parentId === menu.menuId).length;
    },
    /** 获取菜单类型图标 */
    getMenuTypeIcon(menu) {
      const iconMap = {
        'M': 'el-icon-folder',
        'C': 'el-icon-document',
        'F': 'el-icon-setting'
      };
      return iconMap[menu.menuType] || 'el-icon-menu';
    },
    /** 获取菜单类型文本 */
    getMenuTypeText(menu) {
      const textMap = {
        'M': '目录',
        'C': '菜单',
        'F': '按钮'
      };
      return textMap[menu.menuType] || '';
    },
    /** 获取菜单类型标签类型 */
    getMenuTypeTagType(menu) {
      const typeMap = {
        'M': 'warning',
        'C': 'primary',
        'F': 'info'
      };
      return typeMap[menu.menuType] || '';
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children,
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then((response) => {
        this.menuOptions = [];
        const menu = { menuId: 0, menuName: "主类目", children: [] };
        menu.children = this.handleTree(response.data, "menuId");
        this.menuOptions.push(menu);
      });
    },
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0",
        appType: 1,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "添加菜单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜单";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const { menuType, parentId } = this.form;
          if (menuType === "M" && parentId !== 0) {
            this.form.component = "ParentView";
          }

          if (this.form.menuId != undefined) {
            updateMenu(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.menuName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delMenu(row.menuId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-cascade-page {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.top-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.cascade-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.level-1 {
    width: 300px;
    flex-shrink: 0;
  }

  &.level-2 {
    width: 320px;
    flex-shrink: 0;
  }

  &.level-3 {
    width: 320px;
    flex-shrink: 0;
  }

  &.detail-panel {
    flex: 1;
    min-width: 300px;
  }
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(to bottom, #fafafa, #fff);

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 16px;
      color: #409EFF;
    }
  }

  .panel-subtitle {
    font-size: 12px;
    color: #909399;
    flex: 1;
  }

  .panel-count {
    background: #409EFF;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }
}

.menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.menu-item {
  padding: 12px 16px;
  margin-bottom: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  background: #fff;

  &:hover {
    background: #f5f7fa;
    border-color: #e4e7ed;
  }

  &.active {
    background: #ecf5ff;
    border-color: #409EFF;

    .menu-name {
      color: #409EFF;
      font-weight: 600;
    }
  }

  &.has-children {
    .menu-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.menu-icon {
  font-size: 20px;
  color: #909399;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;

  .menu-path,
  .menu-perms {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.menu-status {
  &.normal {
    color: #67C23A;
  }

  &.disabled {
    color: #F56C6C;
  }
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #C0C4CC;

  .el-icon-arrow-right {
    font-size: 14px;
  }

  .children-badge {
    ::v-deep .el-badge__content {
      background-color: #409EFF;
      font-size: 11px;
      height: 16px;
      line-height: 16px;
      padding: 0 5px;
    }
  }
}

.detail-content {
  padding: 20px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F2F6FC;

  &:last-child {
    border-bottom: none;
  }

  label {
    width: 100px;
    color: #909399;
    font-size: 13px;
    flex-shrink: 0;
  }

  span {
    color: #303133;
    font-size: 13px;
    flex: 1;
  }
}

.detail-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;

  .el-button {
    flex: 1;
  }
}
</style>
