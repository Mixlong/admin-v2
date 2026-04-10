<template>
  <div class="app-container">
    <el-row>
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form
          :model="queryParams"
          ref="queryForm"
          :inline="true"
          v-show="showSearch"
          label-width="88px"
        >
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              size="small"
              style="width: 185px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              size="small"
              style="width: 185px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 185px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              type="cyan"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >
              搜索
            </el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['system:user:add']"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:user:edit']"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-refresh"
              size="mini"
              @click="openAuditReassignDialog()"
              v-hasPermi="['system:user:edit']"
            >
              变更审核人
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:user:remove']"
            >
              删除
            </el-button>
          </el-col>
        </el-row>
        <el-row class="userList-box">
          <el-col v-for="(item, index) in userList" :key="index" :span="6">
            <Item
              :content="item"
              @changeEdit="handleUpdate"
              @delete="handleDelete"
              @reset="handleResetPwd"
            />
          </el-col>
        </el-row>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.p"
          :limit.sync="queryParams.l"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="710px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="110px"
        class="form-data-inline"
        inline
      >
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" />
        </el-form-item>

        <el-form-item label="用户姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户名称" />
        </el-form-item>

        <el-form-item label="用户手机号" prop="phonenumber">
          <el-input
            v-model="form.phonenumber"
            type="number"
            placeholder="请输入用户手机号"
          />
        </el-form-item>

        <el-form-item
          v-if="form.userId == undefined"
          label="用户密码"
          prop="password"
        >
          <el-input
            v-model="form.password"
            placeholder="请输入用户密码"
            type="password"
          />
        </el-form-item>

        <el-form-item label="归属部门" prop="deptId">
          <treeselect
            v-model="form.deptId"
            :options="deptOptions"
            :disable-branch-nodes="true"
            :show-count="true"
            placeholder="请选择归属部门"
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
              :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="用户类型" prop="userType">
          <el-radio-group v-model="form.userType">
            <el-radio
              v-for="dict in userTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
              >{{ dict.dictLabel }}</el-radio
            >
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
              >{{ dict.dictLabel }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-checkbox
            v-model="upload.updateSupport"
          />是否更新已经存在的用户数据
          <el-link type="info" style="font-size: 12px" @click="importTemplate">
            下载模板
          </el-link>
        </div>
        <div class="el-upload__tip" style="color: red" slot="tip">
          提示：仅允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="变更审核人"
      :visible.sync="auditReassign.open"
      width="760px"
      append-to-body
      :close-on-click-modal="false"
      @close="resetAuditReassign"
    >
      <el-form
        ref="auditReassignForm"
        :model="auditReassign.form"
        :rules="auditReassign.rules"
        label-width="110px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="原审核人" prop="fromUserId">
              <el-select
                v-model="auditReassign.form.fromUserId"
                filterable
                clearable
                placeholder="请选择原审核人"
                style="width: 100%"
              >
                <el-option
                  v-for="item in auditReassign.userOptions"
                  :key="item.userId"
                  :label="item.nickName || item.userName"
                  :value="item.userId"
                >
                  <span>{{ item.nickName || item.userName }}</span>
                  <span class="audit-user-option">{{ item.userName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新审核人" prop="toUserId">
              <el-select
                v-model="auditReassign.form.toUserId"
                filterable
                clearable
                placeholder="请选择新审核人"
                style="width: 100%"
              >
                <el-option
                  v-for="item in reassignTargetOptions"
                  :key="item.userId"
                  :label="item.nickName || item.userName"
                  :value="item.userId"
                >
                  <span>{{ item.nickName || item.userName }}</span>
                  <span class="audit-user-option">{{ item.userName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="处理模块">
          <el-checkbox-group v-model="auditReassign.form.moduleCodes">
            <el-checkbox
              v-for="item in auditModuleOptions"
              :key="item.code"
              :label="item.code"
            >
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="audit-reassign-tip">
            不选则默认处理全部已接入模块
          </div>
        </el-form-item>

        <el-form-item label="转派备注" prop="remark">
          <el-input
            v-model="auditReassign.form.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入转派备注"
          />
        </el-form-item>
      </el-form>

      <div v-if="auditReassign.previewData" class="audit-preview">
        <div class="audit-preview__header">
          <div class="audit-preview__title">影响预览</div>
          <div class="audit-preview__summary">
            共影响
            <span>{{ auditReassign.previewData.totalAffected || 0 }}</span>
            条数据
          </div>
        </div>
        <el-table
          :data="auditReassign.previewData.moduleResults || []"
          size="mini"
          border
        >
          <el-table-column prop="moduleName" label="模块" min-width="140" />
          <el-table-column prop="affectedCount" label="影响数量" width="100" />
          <el-table-column prop="detail" label="说明" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="auditReassign.open = false">取 消</el-button>
        <el-button
          type="primary"
          plain
          :loading="auditReassign.previewLoading"
          @click="handleAuditPreview"
        >
          预览影响
        </el-button>
        <el-button
          type="primary"
          :loading="auditReassign.submitLoading"
          @click="handleAuditExecute"
        >
          执行变更
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate,
  dictUserList,
  previewAuditReassign,
  executeAuditReassign,
} from "@/api/system/user";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import Item from "./profile/Item.vue";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "User",
  components: { Treeselect, Item },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 用户类型字典
      userTypeOptions: [
        { dictValue: '00', dictLabel: '普通用户' },
        { dictValue: '01', dictLabel: '管理员' }
      ],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      auditModuleOptions: [
        { code: "TODO", name: "待办与交办" },
        { code: "BOM_CHANGE", name: "硬件 ECR/N 审核" },
        { code: "SOFTWARE_ECR", name: "软件 ECR/N 审核" },
        { code: "ORDER_CHANGE", name: "订单 BOM 变更审核" },
        { code: "SOP", name: "SOP 审核" },
        { code: "TRIAL_APPLY", name: "试产申请审核" },
        { code: "ORDER_JUDGE", name: "订单评审审核" },
        { code: "CONFIG", name: "审核配置" },
      ],
      auditReassign: {
        open: false,
        previewLoading: false,
        submitLoading: false,
        previewData: null,
        userOptions: [],
        form: {
          fromUserId: undefined,
          toUserId: undefined,
          moduleCodes: [],
          remark: "",
        },
        rules: {
          fromUserId: [
            { required: true, message: "请选择原审核人", trigger: "change" },
          ],
          toUserId: [
            { required: true, message: "请选择新审核人", trigger: "change" },
          ],
        },
      },
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        // headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        nickName: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        userType: [
          { required: true, message: "请选择用户类型", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    reassignTargetOptions() {
      return this.auditReassign.userOptions.filter(
        (item) => item.userId !== this.auditReassign.form.fromUserId
      );
    },
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_user_sex").then((response) => {
      this.sexOptions = response.data;
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      let cellStyle;
      if (row.online == 1) {
        cellStyle = "background:rgba(103,194,58,0.4)";
      }
      return cellStyle;
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm(
        '确认要"' + text + '""' + row.userName + '"用户吗?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        userType: "00", // 默认为系统用户
        remark: undefined,
        postIds: [],
        roleIds: [],
      };
      this.resetForm("form");
    },
    resetAuditReassign() {
      this.auditReassign.previewLoading = false;
      this.auditReassign.submitLoading = false;
      this.auditReassign.previewData = null;
      this.auditReassign.form = {
        fromUserId: undefined,
        toUserId: undefined,
        moduleCodes: [],
        remark: "",
      };
      if (this.$refs.auditReassignForm) {
        this.$refs.auditReassignForm.clearValidate();
      }
    },
    ensureAuditUserOptions() {
      if (this.auditReassign.userOptions.length) {
        return Promise.resolve(this.auditReassign.userOptions);
      }
      return dictUserList().then((response) => {
        this.auditReassign.userOptions = response.data || [];
        return this.auditReassign.userOptions;
      });
    },
    openAuditReassignDialog(row) {
      this.ensureAuditUserOptions().then(() => {
        this.auditReassign.open = true;
        this.auditReassign.previewData = null;
        this.auditReassign.form = {
          fromUserId: row ? row.userId : undefined,
          toUserId: undefined,
          moduleCodes: [],
          remark: "",
        };
        this.$nextTick(() => {
          if (this.$refs.auditReassignForm) {
            this.$refs.auditReassignForm.clearValidate();
          }
        });
      });
    },
    getAuditReassignPayload() {
      const payload = {
        fromUserId: this.auditReassign.form.fromUserId,
        toUserId: this.auditReassign.form.toUserId,
        remark: this.auditReassign.form.remark,
      };
      if (this.auditReassign.form.moduleCodes.length) {
        payload.moduleCodes = this.auditReassign.form.moduleCodes;
      }
      return payload;
    },
    handleAuditPreview() {
      this.$refs["auditReassignForm"].validate((valid) => {
        if (!valid) {
          return;
        }
        if (this.auditReassign.form.fromUserId === this.auditReassign.form.toUserId) {
          this.msgError("原审核人与新审核人不能相同");
          return;
        }
        this.auditReassign.previewLoading = true;
        previewAuditReassign(this.getAuditReassignPayload())
          .then((response) => {
            this.auditReassign.previewData = response.data || {};
            this.msgSuccess("预览成功");
          })
          .finally(() => {
            this.auditReassign.previewLoading = false;
          });
      });
    },
    handleAuditExecute() {
      this.$refs["auditReassignForm"].validate((valid) => {
        if (!valid) {
          return;
        }
        if (this.auditReassign.form.fromUserId === this.auditReassign.form.toUserId) {
          this.msgError("原审核人与新审核人不能相同");
          return;
        }
        this.auditReassign.submitLoading = true;
        executeAuditReassign(this.getAuditReassignPayload())
          .then((response) => {
            this.auditReassign.previewData = response.data || this.auditReassign.previewData;
            this.msgSuccess("审核人变更成功");
            this.auditReassign.open = false;
          })
          .finally(() => {
            this.auditReassign.submitLoading = false;
          });
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getTreeselect();
      getUser().then((response) => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.form.userType =response.data.userType|| row.userType  ;
        console.log("🚀 ~ file: index.vue:529 ~ response.data.userType|| row.userType :", response.data,row )
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
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
      const userIds = row.userId || this.ids;
      this.$confirm(
        '是否确认删除用户编号为"' + userIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有用户数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportUser(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
  },
};
</script>
<style lang="scss">
.app-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px 16px 8px;
  box-sizing: border-box;
}

.app-container .head-container {
  padding: 8px 8px 0;
}

.app-container .el-form {
  margin-bottom: 10px;
}

.app-container .mb8 {
  margin-bottom: 12px;
}

.app-container .el-button + .el-button {
  margin-left: 8px;
}

.audit-user-option {
  float: right;
  color: #909399;
  font-size: 12px;
}

.audit-reassign-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.audit-preview {
  margin-top: 8px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.audit-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.audit-preview__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.audit-preview__summary {
  font-size: 13px;
  color: #606266;
}

.audit-preview__summary span {
  color: #e6a23c;
  font-weight: 600;
}

.userList-box {
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 4px 12px;
}

.userList-box .el-col {
  padding: 8px 6px;
}
</style>
