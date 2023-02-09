<template>
  <div class="app-container font12">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      class="flex justify-between"
    >
      <el-form-item label="产品品类：">
        <el-select
          size="small"
          v-model="queryParams.key"
          filterable
          @change="changeCategory"
          placeholder="请选择产品品类"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="checkRole(['project_manager', 'admin', 'product'])"
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button type="primary" size="small" @click="getList">刷新</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>
            {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="版本号" prop="name" align="center" width="200" />
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
        width="140"
      />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="warning" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
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
import { typeCategory } from "@/api/third/category";

import CompUpdate from "./components/update";

export default {
  components: {
    CompUpdate,
  },
  filters: {},
  data() {
    return {
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
        const firstId = res.data[0].id;
        this.queryParams.key = firstId;
        this.getList();
      });
    },
    changeCategory(key) {
      this.queryParams.key = key;
      this.getList();
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除产品型号为"' + row.name + '"的数据项?',
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
<style lang="scss"  >
.auth {
  text-align: center;
  margin-bottom: 10px;
}

.box-card-style {
  position: relative;
  overflow: visible;
  background: rgba(197, 183, 206, 0.2);

  .el-card__body {
    height: calc(100% - 40px);
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
  }

  .el-button {
    width: 100%;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .position-abs {
    position: absolute;
    right: -120px;
    bottom: 0;
    width: 120px;
  }
}
</style>
