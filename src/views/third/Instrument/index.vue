<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="key">
        <el-select
          v-model="queryParams.key"
          @change="changeCategory"
          filterable
          allow-create
          clearable
          placeholder="请选择品类"
          style="width: 160px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="仪表型号" prop="computerId">
        <el-select
          :loading="isCLoading"
          filterable
          remote
          clearable
          v-model="queryParams.computerId"
          placeholder="请选择仪表型号"
          @change="getList()"
          :remote-method="getComputerNameList"
          style="width: 160px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-button
        class="fr"
        v-if="checkRole(['project_manager', 'admin', 'product'])"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        新增
      </el-button>
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
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import CompUpdate from "./components/updates";

import Cookies from "js-cookie";

export default {
  name: "Instrument",
  components: {
    CompUpdate,
  },
  data() {
    return {
      form: {},
      // 遮罩层
      loading: true,
      isCLoading: false,
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
      computerOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        key: "",
        computerId: "",
      },
    };
  },
  created() {
    this.getTypeCategory();
  },
  activated() {
    const { categoryId, computerId } = this.$route.params;

    if(categoryId && computerId) {
      this.queryParams.key = categoryId;
      this.changeCategory(categoryId);
      this.queryParams.computerId = computerId;
      this.getList();
    }
  },
  methods: {
    // 获取品类
    getTypeCategory() {
      categoryComputerDict().then((res) => {
        this.dictList = res.data;
        this.queryParams.key = this.dictList[0].id; // 默认取第一项
        this.getList();
      });
    },
    // 获取型号
    changeCategory(categoryId) {
      this.queryParams.computerId = "";

      this.computerOptions = this.dictList.filter(
        (item) => item.id === categoryId
      )[0].computerList;
    },
    // 型号查询
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listComputer(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
      }).finally(() => {
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
        data.otherOptions = data.otherOptions ? data.otherOptions : {};
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
          authFileConfig(data).then(() => {
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

        authFileConfig(data).then(() => {
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
      this.reset();
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      
      this.queryParams.key = this.dictList[0].id; // 默认取第一项
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
