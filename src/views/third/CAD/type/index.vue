<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="文件属性" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入文件属性键或值"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            v-hasPermi="['third:cad:type:add']"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="typeList"
      border
      :height="tableHeight()"
    >
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column label="键" prop="key" align="center" width="140" />
      <el-table-column label="值" prop="value" align="center" width="140" />
      <el-table-column label="上传文件" align="center" width="140">
        <template slot-scope="scope">
          <el-tag :type="scope.row.up === 1 ? 'success' : 'danger'">
            {{ scope.row.up === 1 ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" align="center" width="140" />
      <el-table-column label="可见性" align="center">
        <template slot-scope="scope">
          <el-tag
            v-for="tag in scope.row.typeRoleList"
            :key="tag.id"
            style="margin-right: 15px"
          >
            {{ getRoleName(tag.roleId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="140"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="140"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
      >
        <template slot-scope="scope">
          <Tooltip
            v-hasPermi="['third:cad:type:update']"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />

          <Tooltip
            v-hasPermi="['third:cad:type:delete']"
            icon="el-icon-delete"
            :className="['text-red']"
            content="删除"
            @click="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="760px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="110px"
        @submit.native.prevent
        class="form-data-inline"
        inline
      >
        <el-form-item label="键:" prop="key">
          <el-input
            v-model="form.key"
            placeholder="请输入文件属性名称"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="值:" prop="value">
          <el-input
            v-model="form.value"
            placeholder="请输入文件属性名称"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="排序:" prop="sort">
          <el-input
            v-model="form.sort"
            type="text"
            oninput="value=value.replace(/[^\d]/g,'')"
            placeholder="数字越小越靠前"
            maxLength="5"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="需要上传文件:">
          <el-radio-group v-model="form.up">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="可见性"
          style="width: 100%"
          class="flex checkbox-wrap"
        >
          <el-checkbox-group class="role-type" v-model="roleTypeCheckedList">
            <el-checkbox
              v-for="(item, index) in roleTypeDictList"
              :key="index"
              :label="item.roleName"
            >
              {{ item.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isSubLoading" @click="submitForm">
          确 定
        </el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      title="请确认是否删除"
      :visible.sync="delDialogVisible"
      width="400px"
      center
    >
      <el-row style="display: flex">
        <el-input
          auto-complete="off"
          placeholder="验证码"
          v-model="auth.code"
          style="width: 60%; margin-right: 20px"
          clearable
          size="medium"
          @keyup.enter.native="handleDel(1)"
        >
        </el-input>
        <img @click="getCode" :src="codeUrl" />
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDel(0)">取 消</el-button>
        <el-button type="primary" @click="handleDel(1)"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listType,
  authType,
  listRoleType,
  addType,
  editType,
} from "@/api/third/type";
import { getCodeImg } from "@/api/base/code";
import { commonJs } from "@/mixins/common";

export default {
  name: "CadType",
  mixins: [commonJs],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      codeUrl: "",
      // 非单个禁用
      single: true,
      delDialogVisible: false,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      typeList: [],
      roleTypeDictList: [],
      roleTypeDictMap: {},
      roleTypeDictMap2: {},
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      roleTypeCheckedList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      genderOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: undefined,
      },
      // 表单参数
      form: {
        up: "",
      },
      // 表单校验
      rules: {
        key: [
          { required: true, message: "文件属性键不能为空", trigger: "blur" },
        ],
        value: [
          { required: true, message: "文件属性值不能为空", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    delDialogVisible(bool) {
      if (bool) {
        this.getCode();
      }
    },
  },
  mounted() {
    listRoleType().then((response) => {
      this.roleTypeDictList = response.data;
      this.roleTypeDictList.forEach((row) => {
        this.roleTypeDictMap[row.roleId] = {
          roleKey: row.roleKey,
          roleName: row.roleName,
        };
        this.roleTypeDictMap2[row.roleName] = {
          roleKey: row.roleKey,
          roleId: row.roleId,
        };
      });
    });

    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listType(this.queryParams).then((response) => {
        this.typeList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.auth.uuid = res.uuid;
      });
    },
    getRoleName(roleId) {
      if (this.roleTypeDictMap[roleId]) {
        return this.roleTypeDictMap[roleId].roleName;
      }
      return undefined;
    },
    handleDel(status) {
      if (status === 1) {
        this.getCode();
        if (this.auth.code) {
          authType(this.auth).then((res) => {
            this.delDialogVisible = false;
            this.msgSuccess("删除成功");
            this.loading = false;
            this.getList();
          });
        } else {
          this.msgError("验证码不能为空");
        }
      } else {
        this.delDialogVisible = false;
      }
    },
    // 用户状态修改
    handleStatusChange(row) {
      this.delDialogVisible = true;
      this.auth.id = row.id;
      this.auth.status = 1;
      this.auth.code = undefined;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        id: undefined,
        up: "",
        key: undefined,
        typeRoleList: [],
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleAdd() {
      this.reset();
      this.roleTypeCheckedList = [];
      this.form.up = 0;
      this.open = true;
      this.title = "添加文件属性";
    },
    handleUpdate(row) {
      console.log('row', row)
      this.reset();
      this.form = Object.assign({}, row);

      this.roleTypeCheckedList = [];
      this.form.typeRoleList = [];
      row.typeRoleList.forEach((item) => {
        this.roleTypeCheckedList.push(
          this.roleTypeDictMap[item.roleId].roleName
        );
      });

      this.open = true;
      this.title = "修改文件属性";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          this.form.typeRoleList = [];
          this.roleTypeCheckedList.forEach((r) => {
            this.form.typeRoleList.push(this.roleTypeDictMap2[r]);
          });

          if (this.form.id !== undefined) {
            editType(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.isSubLoading = false;
                  this.open = false;
                  this.getList();
                }
              })
              .catch(() => {
                this.isSubLoading = false;
              });
          } else {
            addType(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.isSubLoading = false;
                  this.open = false;
                  this.getList();
                }
              })
              .catch(() => {
                this.isSubLoading = false;
              });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.checkbox-wrap {
  .el-form-item__content {
    width: 80%;
    .role-type {
      display: grid;
      grid-auto-rows: 30px;
      grid-template-columns: auto auto auto auto;
    }
  }
}
</style>
