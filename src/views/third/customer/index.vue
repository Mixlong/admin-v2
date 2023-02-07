<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="客户" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入客户名称"
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
    </el-form>

    <el-table
      v-loading="loading"
      :data="customerList"
      :height="tableHeight(38)"
      border
    >
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column
        label="品类"
        prop="category"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="型号" prop="name" align="center" width="120px" />
      <el-table-column
        label="型号编码"
        prop="model"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="ERP编码"
        prop="erp"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="描述" prop="desc" align="center" width="500">
        <template slot-scope="scope">
          <div class="text-left">{{ scope.row.desc }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="客户名称"
        prop="customerName"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="客户编码"
        prop="customerSn"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="客户端产品型号"
        prop="clientProductModel"
        align="center"
        width="120"
      />

      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="70"
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
        class-name="small-padding fixed-width"
        width="60"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasRole="['dev', 'sale']"
          ></el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleFile(scope.row)"
          >查看文件</el-button> -->
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
      width="540px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="客户名称:" prop="customerName">
          <el-input
            v-model="form.customerName"
            placeholder="请输入客户名称"
            style="width: 185px"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="客户编码:" prop="customerSn">
          <el-input
            v-model="form.customerSn"
            placeholder="请输入客户编码"
            maxlength="3"
            style="width: 185px"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="客户端产品型号:" prop="clientProductModel">
          <el-input
            v-model="form.clientProductModel"
            placeholder="请输入客户端产品型号"
            style="width: 185px"
            @keyup.enter.native.prevent="submitForm"
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
  listCustomer,
  authCustomer,
  addCustomer,
  editCustomer,
} from "@/api/third/customer";
import { listCategory } from "@/api/third/category";

export default {
  name: "BikeCustomer",
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
      // 总条数
      total: 0,
      // 用户表格数据
      customerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      genderOptions: [],
      categoryOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: undefined,
      },
      // 查询参数
      categoryQueryParams: {
        p: 1,
        l: 1000,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {},
  mounted() {
    listCategory(this.categoryQueryParams).then((response) => {
      this.categoryOptions = response.data.list;
    });
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listCustomer(this.queryParams).then((response) => {
        this.customerList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleFile(item) {
      this.$router.push({ path: "/fileConfig", query: item });
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === 0 ? "启用" : "停用";
      this.$confirm("确认要" + text + "吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let authData = { id: row.id, status: row.status };

          authCustomer(authData).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
          });
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
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
        l: 10,
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

    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加客户";
    },
    handleUpdate(row) {
      // this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改客户";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          editCustomer(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }
          });
        }
      });
    },
  },
};
</script>
