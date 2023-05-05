<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="系列名称/型号:">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择系列名称/型号"
          style="width: 100%"
          clearable
          @change="chooseType"
        >
          <el-option
            v-for="(item, index) in dictOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模块名称:">
        <el-select
          v-model="queryParams.module"
          placeholder="请选择模块名称"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="(item, index) in moduleOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
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
            >新增</el-button
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
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="装备类型" align="center" prop="name" />
      <el-table-column label="装备型号" align="center" prop="code" />
      <el-table-column label="模块名称" align="center" prop="moduleName" />
      <el-table-column
        label="覆盖范围"
        align="center"
        prop="updateCondition"
        :formatter="fnUpdateCondition"
      />
      <el-table-column
        label="版本号"
        align="center"
        prop="versionName"
        width="100"
      />
      <el-table-column
        label="版本序号"
        align="center"
        prop="versionCode"
        width="100"
      />
      <el-table-column label="版本描叙" align="center" prop="explains" />
      <el-table-column
        label="强制升级"
        align="center"
        prop="forceUpdate"
        width="80"
      >
        <template slot-scope="scope">
          {{ scope.row.forceUpdate == 1 ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
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
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
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
          <svg-icon
            icon-class="xiazai"
            class-name="card-panel-icon pointer margin-left-xs"
            @click="handleDownload(scope.row)"
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

    <CompUpdate
      ref="compUpdate"
      :conditionOptions="conditionOptions"
      :title="title"
    />
  </div>
</template>

<script>
import {
  listSoft,
  authSoft,
  deleteSoft,
  detailSoft,
  typeDictList,
  moduleDictList,
} from "@/api/pucs/soft";
import CompUpdate from "./components/update";
export default {
  components: {
    CompUpdate,
  },
  data() {
    return {
      dictOptions: [], // 类型字典
      moduleOptions: [], // 模块字典
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
      // 用户表格数据
      list: [],
      // moduleOptions: [],
      conditionOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        type: "",
        module: "",
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "品类名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    "queryParams.type"(val) {
      if (val) {
        this.getModuleDictList();
      }
    },
  },
  mounted() {
    this.getTypeDictList();
    this.getDicts("pucs_update_condition").then((res) => {
      this.conditionOptions = res.data;
      this.getList();
    });
  },
  methods: {
    chooseType() {
      this.queryParams.module = "";
    },
    // 类型字典
    getTypeDictList() {
      typeDictList().then((res) => {
        this.dictOptions = res.data;
      });
    },
    // 模块字典
    getModuleDictList() {
      moduleDictList({ type: this.queryParams.type }).then((res) => {
        this.moduleOptions = res.data;
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listSoft(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
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
        deleteSoft(data).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    fnUpdateCondition(row, inx, val) {
      for (let key of this.conditionOptions) {
        if (key.dictLabel == val) {
          return key.dictValue;
        }
      }
    },
    handleDownload(row) {
      this.urlDownload(row.fileUrl);
      // var name = row.fileUrl;
      // var url = row.fileUrl;
      // var suffix = url.substring(url.lastIndexOf("."), url.length);
      // const a = document.createElement("a");
      // a.setAttribute("download", name + suffix);
      // a.setAttribute("target", "_blank");
      // a.setAttribute("href", url);
      // a.click();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let data = [];
      let text = "";
      if (row == 0 || row == 1) {
        text = row === 0 ? "启用" : "禁用";
        data = this.ids.map((item) => {
          return { id: item, status: row };
        });
      } else {
        text = row.status === 0 ? "启用" : "禁用";
        let authData = { id: row.id, status: row.status };
        data.push(authData);
      }

      this.$confirm("确认要" + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          authSoft(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        type: "",
        module: "",
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
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
          authCategory(data).then((response) => {
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
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "添加软件";
    },
    handleUpdate(row) {
      this.$refs.compUpdate.dialogVisible = true;
      detailSoft(row.id).then((res) => {
        let data = JSON.parse(JSON.stringify(row));
        if (data.updateCondition == 4) {
          data.targetId = data.targetId.split(",");
        }
        this.$refs.compUpdate.form = data;
        this.$refs.compUpdate.form.targetId;
        this.title = "修改软件";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCategory(this.form).then((response) => {
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
