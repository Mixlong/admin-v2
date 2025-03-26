<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      v-show="showSearch"
      @submit.native.prevent
    >
      <el-form-item label="客户" prop="name">
        <select-loadMore
          v-model="queryParams.name"
          :data="customerData.data"
          :page="customerData.page"
          :hasMore="customerData.more"
          dictLabel="name"
          dictValue="name"
          :request="getCustomerData"
          placeholder="请选择客户名称"
        >
        </select-loadMore>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          v-hasPermi="['third:customer:add']"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="customerList"
      :height="tableHeight()"
    >
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column label="客户名称" prop="name" align="center" />
      <el-table-column label="客户编号" prop="no" align="center" />
      <el-table-column label="状态" prop="status" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            v-hasPermi="['third:customer:update']"
            @click="handleUpdate(row)"
          />

          <Tooltip
            icon="el-icon-document"
            content="客户地址"
            v-hasPermi="['third:customer:address']"
            @click="handleNameToPage('CustomerAddress', { name: row.name })"
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
      width="400px"
      append-to-body
      center
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="客户名称:" prop="name">
          <el-input
            v-model.trim="form.name"
            clearable
            placeholder="请输入客户名称"
          />
        </el-form-item>
        <el-form-item label="客户编号:" prop="no">
          <el-input
            v-model.trim="form.no"
            clearable
            placeholder="请输入客户编号"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isSubLoading" @click="submitForm">
          确 定
        </el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addCustomer,
  editCustomer,
  authCustomer,
  getCustomerList,
} from "@/api/order";
import { listCustomer } from "@/api/third/sample";

export default {
  name: "Customer",
  data() {
    return {
      showSearch: true,
      isSubLoading: false,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户表格数据
      customerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        name: undefined,
      },
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "客户名称不能为空", trigger: "blur" },
        ],
        no: [{ required: true, message: "客户编号不能为空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      getCustomerList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.customerList = list;
        this.total = total;
        this.loading = false;
      });
    },
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...list];
          } else {
            this.customerData.data = list;
          }
          this.customerData.more = pageNum * pageSize < total;
          this.customerData.page = pageNum;
          resolve();
        });
      });
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
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加客户";
    },
    handleUpdate(row) {
      this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改客户";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          if (this.form.id) {
            editCustomer(this.form).then((res) => {
              if (res.code === 200) {
                this.msgSuccess("修改成功");
                this.isSubLoading = false;
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCustomer(this.form).then((res) => {
              if (res.code === 200) {
                this.msgSuccess("新增成功");
                this.isSubLoading = false;
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
