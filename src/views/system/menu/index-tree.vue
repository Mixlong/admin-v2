<template>
  <div class="app-container menu-tree-page">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜单名称"
          clearable
          size="small"
          style="width: 250px"
          prefix-icon="el-icon-search"
          @input="handleSearch"
        />
        <el-select
          v-model="filterStatus"
          placeholder="菜单状态"
          clearable
          size="small"
          style="width: 120px; margin-left: 10px"
          @change="handleSearch"
        >
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          style="margin-left: 10px"
          @click="handleAdd(null)"
          v-hasPermi="['system:menu:add']"
        >
          新增根菜单
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button
            size="small"
            :type="viewMode === 'tree' ? 'primary' : ''"
            icon="el-icon-share"
            @click="viewMode = 'tree'"
          >
            树状图
          </el-button>
          <el-button
            size="small"
            :type="viewMode === 'list' ? 'primary' : ''"
            icon="el-icon-menu"
            @click="viewMode = 'list'"
          >
            列表
          </el-button>
        </el-button-group>
        <el-button
          size="small"
          icon="el-icon-refresh"
          @click="getList"
          style="margin-left: 10px"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 树状图视图 -->
    <div class="tree-view-container" v-if="viewMode === 'tree'" v-loading="loading">
      <div class="tree-canvas" :style="canvasStyle">
        <div class="tree-root">
          <div class="root-node">
            <div class="node-content root-content">
              <i class="el-icon-s-home"></i>
              <span>菜单管理</span>
              <el-badge :value="menuTreeData.length" class="node-badge" />
            </div>
          </div>

          <!-- 一级菜单 -->
          <div class="tree-level level-1">
            <div
              v-for="(menu1, index1) in menuTreeData"
              :key="menu1.menuId"
              class="tree-branch"
              :class="{ 'branch-expanded': menu1.expanded }"
            >
              <!-- 连接线 -->
              <div class="branch-line">
                <div class="line-horizontal"></div>
                <div class="line-vertical" v-if="index1 < menuTreeData.length - 1"></div>
              </div>

              <!-- 一级节点 -->
              <div class="tree-node" @click="toggleNode(menu1)">
                <div class="node-content" :class="getNodeClass(menu1)">
                  <div class="node-header">
                    <i :class="getMenuTypeIcon(menu1)"></i>
                    <span class="node-title">{{ menu1.menuName }}</span>
                    <el-badge
                      v-if="menu1.children && menu1.children.length > 0"
                      :value="menu1.children.length"
                      class="node-badge"
                    />
                  </div>
                  <div class="node-meta">
                    <el-tag :type="getMenuTypeTagType(menu1)" size="mini">
                      {{ getMenuTypeText(menu1) }}
                    </el-tag>
                    <span class="node-status" :class="menu1.status === '0' ? 'status-normal' : 'status-disabled'">
                      {{ menu1.status === '0' ? '正常' : '停用' }}
                    </span>
                  </div>
                  <div class="node-actions">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-edit"
                      @click.stop="handleUpdate(menu1)"
                      v-hasPermi="['system:menu:edit']"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-plus"
                      @click.stop="handleAdd(menu1)"
                      v-hasPermi="['system:menu:add']"
                    >
                      添加
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      @click.stop="handleDelete(menu1)"
                      v-hasPermi="['system:menu:remove']"
                    >
                      删除
                    </el-button>
                  </div>
                  <i
                    v-if="menu1.children && menu1.children.length > 0"
                    class="expand-icon"
                    :class="menu1.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
                  ></i>
                </div>
              </div>

              <!-- 二级菜单 -->
              <div class="tree-level level-2" v-if="menu1.expanded && menu1.children && menu1.children.length > 0">
                <div
                  v-for="(menu2, index2) in menu1.children"
                  :key="menu2.menuId"
                  class="tree-branch"
                  :class="{ 'branch-expanded': menu2.expanded }"
                >
                  <!-- 连接线 -->
                  <div class="branch-line">
                    <div class="line-horizontal"></div>
                    <div class="line-vertical" v-if="index2 < menu1.children.length - 1"></div>
                  </div>

                  <!-- 二级节点 -->
                  <div class="tree-node" @click="toggleNode(menu2)">
                    <div class="node-content" :class="getNodeClass(menu2)">
                      <div class="node-header">
                        <i :class="getMenuTypeIcon(menu2)"></i>
                        <span class="node-title">{{ menu2.menuName }}</span>
                        <el-badge
                          v-if="menu2.children && menu2.children.length > 0"
                          :value="menu2.children.length"
                          class="node-badge"
                        />
                      </div>
                      <div class="node-meta">
                        <el-tag :type="getMenuTypeTagType(menu2)" size="mini">
                          {{ getMenuTypeText(menu2) }}
                        </el-tag>
                        <span v-if="menu2.component" class="node-path">{{ menu2.component }}</span>
                      </div>
                      <div class="node-actions">
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-edit"
                          @click.stop="handleUpdate(menu2)"
                          v-hasPermi="['system:menu:edit']"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-plus"
                          @click.stop="handleAdd(menu2)"
                          v-hasPermi="['system:menu:add']"
                        >
                          添加
                        </el-button>
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-delete"
                          @click.stop="handleDelete(menu2)"
                          v-hasPermi="['system:menu:remove']"
                        >
                          删除
                        </el-button>
                      </div>
                      <i
                        v-if="menu2.children && menu2.children.length > 0"
                        class="expand-icon"
                        :class="menu2.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
                      ></i>
                    </div>
                  </div>

                  <!-- 三级菜单 -->
                  <div class="tree-level level-3" v-if="menu2.expanded && menu2.children && menu2.children.length > 0">
                    <div
                      v-for="(menu3, index3) in menu2.children"
                      :key="menu3.menuId"
                      class="tree-branch"
                    >
                      <!-- 连接线 -->
                      <div class="branch-line">
                        <div class="line-horizontal"></div>
                        <div class="line-vertical" v-if="index3 < menu2.children.length - 1"></div>
                      </div>

                      <!-- 三级节点 -->
                      <div class="tree-node">
                        <div class="node-content" :class="getNodeClass(menu3)">
                          <div class="node-header">
                            <i :class="getMenuTypeIcon(menu3)"></i>
                            <span class="node-title">{{ menu3.menuName }}</span>
                          </div>
                          <div class="node-meta">
                            <el-tag :type="getMenuTypeTagType(menu3)" size="mini">
                              {{ getMenuTypeText(menu3) }}
                            </el-tag>
                            <span v-if="menu3.perms" class="node-perms">{{ menu3.perms }}</span>
                          </div>
                          <div class="node-actions">
                            <el-button
                              type="text"
                              size="mini"
                              icon="el-icon-edit"
                              @click.stop="handleUpdate(menu3)"
                              v-hasPermi="['system:menu:edit']"
                            >
                              编辑
                            </el-button>
                            <el-button
                              type="text"
                              size="mini"
                              icon="el-icon-delete"
                              @click.stop="handleDelete(menu3)"
                              v-hasPermi="['system:menu:remove']"
                            >
                              删除
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图（原有表格） -->
    <div class="list-view-container" v-if="viewMode === 'list'" v-loading="loading">
      <el-table
        :data="menuList"
        row-key="menuId"
        :height="tableHeight()"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        :indent="20"
      >
        <el-table-column prop="menuName" label="菜单名称" align="left" width="220">
          <template slot-scope="scope">
            <span :style="getMenuNameStyle(scope.row)">
              <i :class="getMenuIcon(scope.row)" style="margin-right: 5px;"></i>
              {{ scope.row.menuName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" align="center" width="100">
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" align="center" label="排序" width="60"></el-table-column>
        <el-table-column prop="perms" label="权限标识" align="center" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="component" label="组件路径" align="center" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">修改</el-button>
            <el-button type="text" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">新增</el-button>
            <el-button type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" :visible.sync="open" width="700px" append-to-body>
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
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" :activeIcon="form.icon" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                  <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon" style="height: 32px; width: 16px" />
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
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" class="w100" />
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
                <el-radio v-for="dict in visibleOptions" :key="dict.dictValue" :label="dict.dictValue">
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="菜单状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">
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
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "MenuTree",
  components: { Treeselect, IconSelect },
  data() {
    return {
      loading: true,
      viewMode: 'tree', // tree: 树状图, list: 列表
      searchKeyword: '',
      filterStatus: undefined,
      menuList: [],
      menuTreeData: [],
      menuOptions: [],
      visibleOptions: [],
      statusOptions: [],
      queryParams: {
        menuName: undefined,
        status: undefined,
      },
      title: "",
      open: false,
      form: {},
      rules: {
        menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
        orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
        path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
      },
    };
  },
  computed: {
    canvasStyle() {
      return {
        minWidth: '100%',
        minHeight: '100%',
      };
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
        this.menuList = this.handleTree(response.data, "menuId");
        this.buildTreeData();
        this.loading = false;
      });
    },
    /** 构建树状图数据 */
    buildTreeData() {
      const addExpandedProp = (nodes) => {
        return nodes.map(node => ({
          ...node,
          expanded: false,
          children: node.children ? addExpandedProp(node.children) : undefined
        }));
      };
      this.menuTreeData = addExpandedProp(this.menuList);
    },
    /** 搜索过滤 */
    handleSearch() {
      this.queryParams.menuName = this.searchKeyword;
      this.queryParams.status = this.filterStatus;
      this.getList();
    },
    /** 切换节点展开状态 */
    toggleNode(node) {
      this.$set(node, 'expanded', !node.expanded);
    },
    /** 展开所有节点 */
    expandAll(nodes) {
      nodes.forEach(node => {
        this.$set(node, 'expanded', true);
        if (node.children) {
          this.expandAll(node.children);
        }
      });
    },
    /** 折叠所有节点 */
    collapseAll(nodes) {
      nodes.forEach(node => {
        this.$set(node, 'expanded', false);
        if (node.children) {
          this.collapseAll(node.children);
        }
      });
    },
    /** 获取节点样式类 */
    getNodeClass(menu) {
      return {
        'node-directory': menu.menuType === 'M',
        'node-menu': menu.menuType === 'C',
        'node-button': menu.menuType === 'F',
        'node-disabled': menu.status === '1'
      };
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
    /** 获取菜单图标（列表视图） */
    getMenuIcon(row) {
      return this.getMenuTypeIcon(row);
    },
    /** 获取菜单名称样式（列表视图） */
    getMenuNameStyle(row) {
      const styleMap = {
        'M': 'font-weight: 600; color: #303133;',
        'C': 'font-weight: 500; color: #606266;',
        'F': 'font-weight: 400; color: #909399;'
      };
      return styleMap[row.menuType] || '';
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
    selected(name) {
      this.form.icon = name;
    },
    cancel() {
      this.open = false;
      this.reset();
    },
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
    handleQuery() {
      this.getList();
    },
    resetQuery() {
      this.searchKeyword = '';
      this.filterStatus = undefined;
      this.queryParams = {
        menuName: undefined,
        status: undefined,
      };
      this.handleQuery();
    },
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
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜单";
      });
    },
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
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
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
.menu-tree-page {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.top-toolbar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
}

.tree-view-container,
.list-view-container {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: auto;
  padding: 20px;
}

.tree-canvas {
  padding: 20px;
}

.tree-root {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.root-node {
  margin-bottom: 40px;
}

.root-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;

  i {
    font-size: 20px;
  }

  .node-badge {
    ::v-deep .el-badge__content {
      background-color: #fff;
      color: #667eea;
      border: none;
    }
  }
}

.tree-level {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &.level-1 {
    width: 100%;
    align-items: center;
  }

  &.level-2 {
    margin-left: 60px;
    margin-top: 20px;
  }

  &.level-3 {
    margin-left: 60px;
    margin-top: 20px;
  }
}

.tree-branch {
  position: relative;
  display: flex;
  flex-direction: column;

  &.branch-expanded {
    .tree-node .expand-icon {
      transform: rotate(0deg);
    }
  }
}

.branch-line {
  position: absolute;
  left: -40px;
  top: 20px;

  .line-horizontal {
    width: 40px;
    height: 2px;
    background: #dcdfe6;
  }

  .line-vertical {
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background: #dcdfe6;
  }
}

.tree-node {
  cursor: pointer;
  transition: all 0.3s;
}

.node-content {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px 18px;
  min-width: 260px;
  max-width: 360px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &.node-directory {
    border-color: #e6a23c;
    background: linear-gradient(to bottom, #fef9f0, #fff);

    &:hover {
      border-color: #f56c6c;
      box-shadow: 0 4px 16px rgba(230, 162, 60, 0.3);
    }
  }

  &.node-menu {
    border-color: #409eff;
    background: linear-gradient(to bottom, #f0f7ff, #fff);

    &:hover {
      border-color: #66b1ff;
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
    }
  }

  &.node-button {
    border-color: #909399;
    background: linear-gradient(to bottom, #f4f4f5, #fff);

    &:hover {
      border-color: #b3b6ba;
      box-shadow: 0 4px 16px rgba(144, 147, 153, 0.2);
    }
  }

  &.node-disabled {
    opacity: 0.6;
    background: #f5f7fa;
  }
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  i {
    font-size: 18px;
    color: inherit;
  }

  .node-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    flex: 1;
  }

  .node-badge {
    ::v-deep .el-badge__content {
      background-color: #409eff;
      border: none;
      height: 18px;
      line-height: 18px;
      padding: 0 6px;
      font-size: 11px;
    }
  }
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;

  .node-path,
  .node-perms {
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .node-status {
    font-size: 12px;

    &.status-normal {
      color: #67c23a;
    }

    &.status-disabled {
      color: #f56c6c;
    }
  }
}

.node-actions {
  display: flex;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;

  .el-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.expand-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #c0c4cc;
  transition: transform 0.3s;
}
</style>
