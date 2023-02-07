<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="仪表名称/型号编码" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入仪表名称/型号编码"
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

      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasRole="['product']"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="computerList"
      :height="tableHeight()"
      border
    >
      <el-table-column align="center" label="序号" width="58" type="index" />
      <el-table-column
        align="center"
        label="品类"
        prop="category"
        width="130"
      />
      <el-table-column align="center" label="型号" prop="name" width="130" />
      <el-table-column
        align="center"
        label="型号编码"
        prop="model"
        width="100"
      />
      <el-table-column
        align="center"
        label="ERP编码"
        prop="erp"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column align="center" label="描述" prop="desc">
        <template slot-scope="scope">
          <div class="text-left">{{ scope.row.desc }}</div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="客户名称"
        prop="customerName"
        width="100"
      />
      <el-table-column
        align="center"
        label="客户编码"
        prop="customerSn"
        width="100"
      />
      <el-table-column
        align="center"
        label="客户端产品型号"
        prop="clientProductModel"
        width="120"
      />
      <el-table-column
        align="center"
        label="创建人"
        prop="createBy"
        width="110"
      />
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column
        align="center"
        label="操作"
        class-name="small-padding fixed-width"
        width="110"
      >
        <template slot-scope="scope">
          <el-button
            class="margin-right-xs text-blue"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasRole="['product']"
          ></el-button>
          <el-button
            class="text-red"
            type="text"
            icon="el-icon-delete"
            @click="handleStatusChange(scope.row)"
            v-hasPermi="['third:dev:auth']"
          ></el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleFile(scope.row)"
            v-hasRole="['dev','test','factory','sale']"
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
      width="740px"
      class=""
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
        <el-form-item label="品类" prop="categoryId">
          <el-select v-model="form.categoryId" clearable size="small">
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="型号:" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入仪表型号"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="型号编码:" prop="model">
          <el-input
            v-model="form.model"
            placeholder="请输入仪表型号"
            maxlength="3"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="ERP编码:" prop="erp">
          <el-input
            v-model="form.erp"
            placeholder="请输入ERP编码"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item
          label="描述:"
          prop="desc"
          style="width: 100%"
          class="form-textarea"
        >
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="form.desc"
            placeholder="请输入仪表描述"
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
  listComputer,
  authComputer,
  addComputer,
  editComputer,
} from "@/api/third/computer";
import { listCategory } from "@/api/third/category";

export default {
  name: "BikeComputer",
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
      computerList: [],
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
      rules: {
        name: [
          { required: true, message: "仪表名称不能为空", trigger: "blur" },
        ],
        model: [
          { required: true, message: "仪表编码不能为空", trigger: "blur" },
        ],
      },
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
      listComputer(this.queryParams).then((response) => {
        this.computerList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleFile(item) {
      this.$router.push({ path: "/fileConfig", query: item });
    },
    // 用户状态修改
    handleStatusChange(row) {
      this.$confirm("确认要删除" + row.name + "吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let authData = { id: row.id, status: 1 };
          authComputer(authData).then((response) => {
            this.msgSuccess("删除成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {});
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleAuth(status) {
      let text = status === 0 ? "启用" : "停用";
      this.$confirm('确认要"' + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let data = [];
          for (let i = 0; i < this.ids.length; i++) {
            let authData = { id: this.ids[i], status: status };
            data.push(authData);
          }
          this.loading = false;
          authComputer(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          status = status === "0" ? "1" : "0";
        });
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加仪表";
    },
    handleUpdate(row) {
      // this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改仪表";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editComputer(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addComputer(this.form).then((response) => {
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
