<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="名称" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入名称"
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
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
      <el-row :gutter="10" class="mt5 fr">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >

          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleMultipleDelete"
            >删除</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="58" align="center" type="index" />

      <el-table-column label="名称" align="center" prop="name" />

      <el-table-column label="描述" align="center" prop="desc" width="300" />

      <el-table-column label="联系人" align="center" prop="contact" />
      <el-table-column label="联系方式" align="center" prop="phone" />
      <el-table-column label="地址" align="center" prop="address" width="200" />
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="110px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      />

      <el-table-column
        label="操作"
        align="center"
        width="80"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            icon="el-icon-delete"
            :className="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
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
      width="740px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.native.prevent
        class="form-data-inline"
        inline
      >
        <el-form-item label="名称:" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="联系人:" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系方式:" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入联系方式"
            maxlength="11"
            oninput="value=value.replace(/[^0-9]/g,'')"
          />
        </el-form-item>
        <el-form-item label="地址:" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item label="描述:" prop="desc" class="form-textarea">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="form.desc"
            placeholder="请输入描述"
          />
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
import {
  listFactory,
  authFactory,
  updateFactory,
  addFactory,
} from "@/api/factory";
export default {
  name: "BikeCategory",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],

      delDialogVisible: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: "工厂名不能为空", trigger: "blur" }],
        contact: [
          { required: true, message: "联系人不能为空", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "联系方式不能为空", trigger: "blur" },
        ],
        address: [{ required: true, message: "地址不能为空", trigger: "blur" }],
      },
    };
  },

  mounted() {
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listFactory(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    handleDel(status) {
      this.getCode();
      if (status === 1) {
        if (this.auth.code) {
          authCategory(this.auth).then((response) => {
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
      this.getCode();
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
        p: 1,
        l: 50,
        key: undefined,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },

    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加工厂";
    },
    handleUpdate(row) {
      // this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改工厂";
    },

    handleMultipleDelete() {
      this.postDelete(
        this.ids.map((item) => {
          return {
            id: item,
            status: 1,
          };
        })
      );
    },
    handleDelete(row) {
      this.postDelete([{ id: row.id, status: 1 }]);
    },
    postDelete(data) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        authFactory(data).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateFactory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addFactory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
