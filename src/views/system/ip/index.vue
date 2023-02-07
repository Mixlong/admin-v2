<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item prop="source"> </el-form-item>

      <!-- <el-form-item>
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
      </el-form-item> -->
      <el-row :gutter="20" class="fr mt5 flex align-center">
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
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" prop="name" align="center" />

      <el-table-column label="ip" prop="ip" align="center" />

      <el-table-column label="创建时间" prop="createTime" align="center" />
      <el-table-column label="状态" prop="ip" align="center" width="80">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status == 0">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <div>
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >
            </el-button>
            <el-button
              type="text"
              :class="[scope.row.status == 1 ? 'text-green' : 'text-red']"
              :icon="
                scope.row.status == 0
                  ? 'el-icon-video-pause'
                  : 'el-icon-video-play'
              "
              @click="handleAuth(scope.row)"
            >
            </el-button>
            <el-button
              type="text"
              class="text-red"
              icon="el-icon-delete  "
              @click="handleDelete(scope.row)"
            ></el-button>
          </div>
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
import { filterIpList, filterIpAuth, filterIpDelete } from "@/api/system/ip";
import CompUpdate from "./components/update";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
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
      loading: true,

      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      brandList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        source: undefined,
        customer: undefined,
        state: undefined,
      },
    };
  },

  mounted() {
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      params.state = params.state ? "1" : "";
      filterIpList(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加售后";
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

    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "修改需求" : title;
    },

    /** 按钮操作 */
    handleAuth(row) {
      let text = row.status == 0 ? "禁用" : "启用";
      this.$confirm("是否" + text + '"' + +row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return filterIpAuth([
            { id: row.id, status: row.status == 0 ? 1 : 0 },
          ]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("操作成功");
        });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否删除" + '"' + +row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return filterIpDelete([{ id: row.id, status: 0 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>
<style lang="scss"  scope >
.auth {
  text-align: center;
  margin-bottom: 10px;
}
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}
</style>
