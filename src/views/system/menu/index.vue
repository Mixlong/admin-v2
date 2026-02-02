<template>
  <div class="app-container menu-page">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <el-form :model="queryParams" ref="queryForm" :inline="true" size="small">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input
            v-model="queryParams.menuName"
            placeholder="请输入菜单名称"
            clearable
            @keyup.enter.native="handleQuery"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="菜单状态"
            clearable
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
          <el-button type="primary" icon="el-icon-search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleAdd(null)"
            v-hasPermi="['system:menu:add']"
            >新增</el-button
          >
        </el-form-item>
      </el-form>

      <!-- <el-button-group style="margin-left: auto">
        <el-button
          size="small"
          :type="viewMode === 'mind' ? 'primary' : ''"
          icon="el-icon-share"
          @click="viewMode = 'mind'"
        >
          层级视图
        </el-button>
        <el-button
          size="small"
          :type="viewMode === 'table' ? 'primary' : ''"
          icon="el-icon-menu"
          @click="viewMode = 'table'"
        >
          表格
        </el-button>
      </el-button-group> -->
    </div>

    <!-- 思维导图视图 -->
    <div
      v-show="viewMode === 'mind'"
      class="mind-container"
      @click="hideContextMenu"
      @contextmenu.prevent="hideContextMenu"
    >
      <div class="column-tree">
        <div v-for="column in columns" :key="column.level" class="column">
          <div class="column-header">
            <span>{{ column.title }}</span>
            <el-radio-group
              v-model="columnFilters[column.level]"
              size="mini"
              class="column-filter"
              @change="onColumnFilterChange(column.level)"
            >
              <el-radio label="">全部</el-radio>
              <el-radio label="0">显示</el-radio>
              <el-radio label="1">隐藏</el-radio>
            </el-radio-group>
            <el-button
              size="mini"
              type="primary"
              plain
              :disabled="!canAddInColumn(column.level)"
              @click.stop="addInColumn(column.level)"
            >
              新增
            </el-button>
          </div>
          <div class="column-body">
            <div
              v-for="item in getColumnItems(column)"
              :key="item.id"
              class="column-item"
              :class="{ active: isActive(item, column.level) }"
              @click.stop="selectNode(item, column.level)"
              @contextmenu.prevent.stop="openContextMenu($event, item)"
            >
              <span class="type-tag" :class="getMenuTypeClass(item.raw)">
                {{ getMenuTypeLabel(item.raw) }}
              </span>
              <span class="item-label">{{ item.label }}</span>
              <span
                class="visible-tag"
                :class="getVisibleClass(item.raw)"
                :title="getVisibleLabel(item.raw)"
              >
                <i
                  class="el-icon-view visibility-icon"
                  :class="{ hidden: isVisibleHidden(item.raw) }"
                ></i>
              </span>
              <i
                v-if="item.raw && item.raw.menuType === 'M'"
                class="el-icon-arrow-right item-arrow"
              ></i>
            </div>
            <div v-if="!column.items.length" class="column-empty">暂无数据</div>
          </div>
        </div>
      </div>

      <div
        v-show="contextMenu.visible"
        class="tree-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <div class="menu-item" @click.stop="contextAdd">新增子节点</div>
        <div class="menu-item" @click.stop="contextEdit">编辑</div>
        <div class="menu-item danger" @click.stop="contextDelete">删除</div>
      </div>
    </div>

    <!-- 表格视图 -->
    <!-- <div v-show="viewMode === 'table'" class="table-container">
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="menuId"
        :height="tableHeight()"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        :indent="20"
      >
        <el-table-column
          prop="menuName"
          label="菜单名称"
          align="left"
          width="220"
        >
          <template slot-scope="scope">
            <i :class="getMenuIcon(scope.row)" style="margin-right: 5px"></i>
            {{ scope.row.menuName }}
          </template>
        </el-table-column>
        <el-table-column
          prop="orderNum"
          align="center"
          label="排序"
          width="60"
        ></el-table-column>
        <el-table-column
          prop="perms"
          label="权限标识"
          align="center"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="component"
          label="组件路径"
          align="center"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '0' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === "0" ? "正常" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="230">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:menu:edit']"
              >修改</el-button
            >
            <el-button
              type="text"
              icon="el-icon-plus"
              @click="handleAdd(scope.row)"
              v-hasPermi="['system:menu:add']"
              >新增</el-button
            >
            <el-button
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:menu:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div> -->

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
                <IconSelect
                  ref="iconSelect"
                  :activeIcon="form.icon"
                  @selected="selected"
                />
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
                  <i
                    v-else
                    slot="prefix"
                    class="el-icon-search el-input__icon"
                  />
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
              <el-input
                v-model="form.perms"
                placeholder="请权限标识"
                maxlength="50"
              />
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
  name: "Menu",
  components: { Treeselect, IconSelect },
  data() {
    return {
      loading: true,
      viewMode: "mind", // mind: 树形图, table: 表格
      menuList: [],
      allMenuList: [],
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
      columns: [],
      activePath: [],
      activePaths: [],
      activeLevelSets: [],
      activeMode: "single", // single: 单一路径, multi: 多路径
      columnFilters: {},
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        node: null,
      },
    };
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
      listMenu().then((response) => {
        this.allMenuList = this.handleTree(response.data, "menuId");
        this.applyLocalFilter();
        this.loading = false;
      });
    },

    applyLocalFilter() {
      const keyword = (this.queryParams.menuName || "").trim().toLowerCase();
      const hasKeyword = keyword.length > 0;
      const status = this.queryParams.status;
      const hasStatus =
        status !== undefined && status !== null && status !== "";
      const hasSearch = hasKeyword || hasStatus;

      const matchNode = (node) => {
        const nameOk =
          !hasKeyword ||
          String(node.menuName || "")
            .toLowerCase()
            .includes(keyword);
        const statusOk = !hasStatus || String(node.status) === String(status);
        return nameOk && statusOk;
      };

      const findAllMatchPaths = (nodes, path, out) => {
        if (!nodes || !nodes.length) return;
        for (const node of nodes) {
          const nextPath = [...path, node.menuId];
          if (matchNode(node)) out.push(nextPath);
          if (node.children && node.children.length) {
            findAllMatchPaths(node.children, nextPath, out);
          }
        }
      };

      this.menuList = this.allMenuList;
      if (!hasSearch) {
        this.activeMode = "single";
        this.activePath = [];
        this.activePaths = [];
        this.activeLevelSets = [];
      } else {
        const paths = [];
        findAllMatchPaths(this.menuList, [], paths);
        if (paths.length) {
          this.activeMode = "multi";
          this.activePaths = paths;
        } else {
          this.activeMode = "single";
          this.activePaths = [];
          this.activePath = [];
          this.activeLevelSets = [];
        }
      }
      if (this.viewMode === "mind") {
        this.$nextTick(() => {
          this.buildColumns();
        });
      }
    },

    buildColumns() {
      const columns = [];
      const level1 = this.menuList.map((menu) => this.mapNode(menu));
      columns.push({
        level: 1,
        title: "一级",
        items: level1,
      });

      if (this.activeMode === "multi" && this.activePaths.length) {
        const activeLevelSets = [];
        this.activePaths.forEach((path) => {
          path.forEach((id, index) => {
            if (!activeLevelSets[index]) activeLevelSets[index] = new Set();
            activeLevelSets[index].add(id);
          });
        });
        this.activeLevelSets = activeLevelSets;

        let level = 2;
        let parents = activeLevelSets[0]
          ? Array.from(activeLevelSets[0])
              .map((id) => this.findNodeById(id))
              .filter(Boolean)
          : [];
        while (parents.length) {
          const items = [];
          const seen = new Set();
          parents.forEach((parent) => {
            (parent.children || []).forEach((child) => {
              if (!seen.has(child.menuId)) {
                seen.add(child.menuId);
                items.push(this.mapNode(child));
              }
            });
          });
          if (!items.length) break;
          columns.push({
            level,
            title: `第${level}级`,
            items,
          });
          const nextActiveSet = activeLevelSets[level - 1];
          parents = nextActiveSet
            ? items
                .filter((item) => nextActiveSet.has(item.id))
                .map((item) => this.findNodeById(item.id))
                .filter(Boolean)
            : [];
          level += 1;
        }
      } else {
        if (level1.length && !this.activePath[0]) {
          this.activePath = [level1[0].id];
        }

        if (this.activePath.length) {
          const nextPath = [];
          let parent = null;
          for (let i = 0; i < this.activePath.length; i++) {
            const id = this.activePath[i];
            const node = this.findNodeById(id, parent);
            if (!node) break;
            nextPath.push(id);
            parent = node;
            if (node.children && node.children.length) {
              const items = node.children.map((menu) => this.mapNode(menu));
              if (items.length) {
                const nextId =
                  this.activePath[i + 1] &&
                  items.some((it) => it.id === this.activePath[i + 1])
                    ? this.activePath[i + 1]
                    : items[0].id;
                if (!nextPath[i + 1]) nextPath[i + 1] = nextId;
                columns.push({
                  level: i + 2,
                  title: `第${i + 2}级`,
                  items,
                });
              }
            }
          }
          this.activePath = nextPath;
        }
      }

      this.columns = columns;
      this.columns.forEach((col) => {
        if (!(col.level in this.columnFilters)) {
          this.$set(this.columnFilters, col.level, "0");
        }
      });
    },

    mapNode(menu) {
      return {
        id: menu.menuId,
        label: menu.menuName,
        raw: menu,
      };
    },

    findNodeById(id, parent) {
      if (!id) return null;
      const list = parent ? parent.children || [] : this.menuList;
      const stack = [...list];
      while (stack.length) {
        const node = stack.shift();
        if (node.menuId === id) return node;
        if (node.children && node.children.length) {
          stack.push(...node.children);
        }
      }
      return null;
    },

    selectNode(item, level) {
      if (this.activeMode === "multi") {
        this.activeMode = "single";
        this.activePaths = [];
        this.activeLevelSets = [];
      }
      const index = level - 1;
      this.activePath = [...this.activePath.slice(0, index), item.id];
      this.buildColumns();
    },

    isActive(item, level) {
      if (this.activeMode === "multi") {
        const set = this.activeLevelSets[level - 1];
        return !!(set && set.has(item.id));
      }
      return this.activePath[level - 1] === item.id;
    },

    onColumnFilterChange(level) {
      if (!(level in this.columnFilters)) {
        this.$set(this.columnFilters, level, "");
      }
    },

    getColumnItems(column) {
      const filter = this.columnFilters[column.level];
      if (filter === undefined || filter === null || filter === "") {
        return column.items;
      }
      return column.items.filter(
        (item) => String(item.raw && item.raw.visible) === String(filter)
      );
    },

    getMenuTypeLabel(menu) {
      const typeMap = { M: "目录", C: "菜单", F: "按钮" };
      return typeMap[menu.menuType] || "未知";
    },

    getMenuTypeClass(menu) {
      const typeMap = { M: "type-m", C: "type-c", F: "type-f" };
      return typeMap[menu.menuType] || "type-unknown";
    },

    getVisibleLabel(menu) {
      const value = menu && menu.visible != null ? String(menu.visible) : "";
      if (!this.visibleOptions || !this.visibleOptions.length) {
        return value === "1" ? "隐藏" : "显示";
      }
      const match = this.visibleOptions.find(
        (item) => String(item.dictValue) === value
      );
      if (match && match.dictLabel) return match.dictLabel;
      return value === "1" ? "隐藏" : "显示";
    },

    getVisibleClass(menu) {
      const value = menu && menu.visible != null ? String(menu.visible) : "";
      return value === "1" ? "visible-hidden" : "visible-show";
    },

    isVisibleHidden(menu) {
      const value = menu && menu.visible != null ? String(menu.visible) : "";
      return value === "1";
    },

    /** 获取菜单类型图标 */
    getMenuIcon(menu) {
      const iconMap = {
        M: "el-icon-folder",
        C: "el-icon-document",
        F: "el-icon-setting",
      };
      return iconMap[menu.menuType] || "el-icon-menu";
    },

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
      this.applyLocalFilter();
    },

    resetQuery() {
      this.resetForm("queryForm");
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

    hideContextMenu() {
      if (this.contextMenu.visible) {
        this.contextMenu.visible = false;
      }
    },

    openContextMenu(event, item) {
      const container = this.$el.querySelector(".mind-container");
      const rect = container
        ? container.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 };
      const menuWidth = 140;
      const menuHeight = 110;
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      if (rect.width) {
        x = Math.min(x, rect.width - menuWidth);
      }
      if (rect.height) {
        y = Math.min(y, rect.height - menuHeight);
      }
      this.contextMenu = {
        visible: true,
        x: Math.max(0, x),
        y: Math.max(0, y),
        node: item,
      };
    },

    canAddInColumn(level) {
      if (level === 1) return true;
      if (this.activeMode === "multi") {
        const set = this.activeLevelSets[level - 2];
        return !!(set && set.size);
      }
      return !!this.activePath[level - 2];
    },

    addInColumn(level) {
      if (level === 1) {
        this.handleAdd({ menuId: 0 });
        return;
      }
      const parentId =
        this.activeMode === "multi"
          ? this.activeLevelSets[level - 2]
            ? Array.from(this.activeLevelSets[level - 2])[0]
            : null
          : this.activePath[level - 2];
      if (parentId) {
        const parent = this.findNodeById(parentId);
        this.handleAdd(parent || { menuId: 0 });
      }
    },

    contextAdd() {
      const node = this.contextMenu.node;
      if (!node) return;
      const row = node.raw || { menuId: 0 };
      this.hideContextMenu();
      this.handleAdd(row);
    },

    contextEdit() {
      const node = this.contextMenu.node;
      if (!node || !node.raw) return;
      this.hideContextMenu();
      this.handleUpdate(node.raw);
    },

    contextDelete() {
      const node = this.contextMenu.node;
      if (!node || !node.raw) return;
      this.hideContextMenu();
      this.handleDelete(node.raw);
    },
  },
  watch: {
    viewMode(val) {
      if (val === "mind") {
        this.$nextTick(() => {
          this.buildColumns();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-page {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.top-toolbar {
  background: #fff;
  padding: 16px 20px 0;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  .el-form {
    margin-bottom: 0;
    flex: 1;
  }

  .el-button-group .el-button + .el-button {
    margin-left: 8px;
  }
}

.mind-container,
.table-container {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  padding: 0;
}

.mind-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 0;
  height: 0;
}

.column-tree {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: stretch;
}

.column {
  min-width: 240px;
  max-width: 320px;
  flex: 0 0 auto;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.column-header {
  padding: 10px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  background: #f1f5f9;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.column-filter {
  margin-left: auto;
}

.column-filter ::v-deep .el-radio {
  margin-right: 8px;
  font-weight: 400;
}

.column-filter ::v-deep .el-radio__input {
  display: none;
}

.column-filter ::v-deep .el-radio__label {
  padding-left: 0;
  color: #6b7280;
  font-size: 12px;
}

.column-filter ::v-deep .el-radio__label .visibility-icon {
  font-size: 14px;
}

.visibility-icon.hidden {
  position: relative;
}

.visibility-icon.hidden::after {
  content: "";
  position: absolute;
  left: -1px;
  right: -1px;
  top: 50%;
  height: 1.5px;
  background: currentColor;
  transform: rotate(-25deg);
}

.table-container ::v-deep .el-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.table-container ::v-deep .el-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.table-container ::v-deep .el-table td {
  border-bottom: 1px solid #f1f5f9;
}

.table-container ::v-deep .el-table__row:hover td {
  background: #f9fafb;
}

.table-container ::v-deep .el-table .cell {
  padding-left: 12px;
  padding-right: 12px;
}

.column-filter ::v-deep .el-radio__input.is-checked + .el-radio__label {
  color: #2563eb;
  font-weight: 600;
}

.column-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.column-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.column-item.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  font-size: 12px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid transparent;
  flex: 0 0 auto;
}

.type-tag.type-m {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.type-tag.type-c {
  background: #ecfeff;
  color: #0e7490;
  border-color: #a5f3fc;
}

.type-tag.type-f {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.type-tag.type-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.visible-tag {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  font-size: 12px;
  border-radius: 0;
  border: none;
  flex: 0 0 auto;
  color: #9ca3af;
  background: transparent;
  min-width: auto;
  justify-content: center;
}

.visible-tag.visible-show {
  color: #9ca3af;
  background: transparent;
  border-color: transparent;
}

.visible-tag.visible-hidden {
  color: #9ca3af;
  background: transparent;
  border-color: transparent;
}

.item-label {
  font-size: 13px;
  color: #111827;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.item-arrow {
  margin-left: 8px;
  color: #9ca3af;
  font-size: 12px;
}

.column-empty {
  padding: 12px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.tree-context-menu {
  position: absolute;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  min-width: 120px;
  z-index: 10;
}

.tree-context-menu .menu-item {
  padding: 6px 12px;
  font-size: 12px;
  color: #111827;
  cursor: pointer;
  user-select: none;
}

.tree-context-menu .menu-item:hover {
  background: #f3f4f6;
}

.tree-context-menu .menu-item.danger {
  color: #dc2626;
}

.tree-context-menu .menu-item.disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.tree-context-menu .menu-item.disabled:hover {
  background: transparent;
}
</style>
