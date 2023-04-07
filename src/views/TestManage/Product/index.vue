<template>
  <div class="app-container font12">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="产品类型：" prop="key">
        <el-select
          v-model="queryParams.key"
          size="mini"
          filterable
          placeholder="请选择产品类型"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态：" prop="computerStatus">
        <el-select
          v-model="queryParams.computerStatus"
          clearable
          placeholder="请选择产品状态"
          @change="getList"
          style="width: 140px"
        >
          <el-option
            v-for="(value, key) in commonStatusList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="checkRole(['test', 'admin'])"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="产品类型"
        prop="name"
        align="center"
        width="200"
      />
      <el-table-column label="描述" prop="desc" align="center" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="120"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="150"
      />
      <el-table-column label="操作" align="center" width="140">
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            icon="el-icon-delete"
            content="删除"
            class="text-red"
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

    <CompUpdate ref="compUpdate" />
  </div>
</template>

<script>
import { listComputer, authComputer, changeStatus } from "@/api/third/version";
import { commonStatusList } from "@/utils/commonData";
import { typeCategory } from "@/api/third/category";
import CompUpdate from "./components/update";

export default {
  components: {
    CompUpdate,
  },
  filters: {},
  data() {
    return {
      commonStatusList,
      form: {},
      urls: [],
      // 遮罩层
      loading: false,
      authDialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        key: "",
        computerStatus: "",
      },
    };
  },
  mounted() {
    this.getTypeCategory();
  },
  methods: {
    // 获取品类
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
        // const firstId = res.data[0].id;
        // this.queryParams.key = firstId;
        this.getList();
      });
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listComputer(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form.categoryId = this.queryParams.key;
      this.$refs.compUpdate.title = "新增版本";
    },
    handleUpdate(row) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.title = "修改版本";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return changeStatus([{ id: row.id, status: row.status }]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
        });
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
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除产品类型为"' + row.name + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return authComputer({ id: row.id, status: 1 });
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch();
    },
  },
};
</script>
