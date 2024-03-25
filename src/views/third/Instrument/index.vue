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
          v-model="queryParams.key"
          filterable
          @change="changeCategory"
          placeholder="请选择"
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
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button type="primary" @click="getList">刷新</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="产品型号"
        prop="name"
        align="center"
        width="180"
      />
      <el-table-column label="描述" prop="desc" align="center">
        <span slot-scope="scope" v-NoData="scope.row.desc" />
      </el-table-column>
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
      <el-table-column label="操作" align="center" width="180">
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
import {
  listComputer,
  detailComputer,
  authComputer,
  changeStatus,
} from "@/api/third/computer";
import { typeCategory } from "@/api/third/category";

import CompUpdate from "./components/updates";

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
        l: 20,
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
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form.categoryId = this.queryParams.key;
      this.$refs.compUpdate.title = "添加子产品";
      this.$refs.compUpdate.isCopyProduct = true;
    },
    handleUpdate(row) {
      this.$refs.compUpdate.reset();
      detailComputer(row.id).then((res) => {
        let { data } = res;
        data.instrumentModel = data.instrumentModel ? data.instrumentModel : {};
        this.$refs.compUpdate.dialogVisible = true;
        this.$refs.compUpdate.disabled = true;
        this.$refs.compUpdate.isCopyProduct = false;
        this.$refs.compUpdate.form = Object.assign({}, data);
        this.$refs.compUpdate.title = "修改子产品";
      });
    },
    rowStyle({ row, rowIndex }) {
      let styleJson = {};
      styleJson.cursor = "pointer";
      return styleJson;
    },
    cellClick(row, column, cell, event) {
      this.handleUpdate(row);
    },
    handleAuthChange(row, type) {
      let params = {};
      params.state = type;
      params.id = row.id;
      instrumentState(params).then((res) => {
        if (res.code == 200) {
          this.msgSuccess("确认成功！");
          this.getList();
        }
      });
    },
    handleStatusChange(auth) {
      if (auth === 1) {
        this.authDialogVisible = false;
        // 不通过
        // 检查原因是否为空
        if (this.auth.why) {
          this.loading = true;
          let data = [];
          let authData = { id: this.auth.id, why: this.auth.why, status: 1 };
          data.push(authData);
          authFileConfig(data).then((response) => {
            this.msgSuccess("拒绝通过审核成功");
            this.form.status = 1;
            this.loading = false;
            this.getList();
          });
        } else {
          this.msgError("原因不能为空");
        }
      } else if (auth === 0) {
        this.authDialogVisible = false;
        // 通过
        this.auth.why = "";
        this.loading = true;
        let data = [];
        let authData = { id: this.auth.id, why: "", status: 0 };
        data.push(authData);

        authFileConfig(data).then((response) => {
          this.msgSuccess("通过审核成功");
          this.form.status = 0;
          this.loading = false;
          this.getList();
        });
      }
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return changeStatus({ id: row.id, status: row.status });
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.urls = [];
      this.reset();
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

    handleExport() {
      let { ids } = this;
      if (ids.length <= 0) {
        this.msgError("请勾选要导出的列表");
      } else {
        instrumentExport({
          key: ids.toString(),
        }).then((response) => {
          this.download(response.msg);
        });
      }
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
        });
    },
  },
};
</script>
<style lang="scss">
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
