<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="模块名称：" prop="productType">
        <el-select
          v-model="queryParams.productType"
          size="mini"
          filterable
          placeholder="请选择模块名称"
        >
          <el-option
            v-for="dict in moduleList"
            :key="dict.dictCode"
            :label="dict.dictValue"
            :value="dict.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态：" prop="status">
        <el-select
          v-model="queryParams.status"
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
        label="模块名称"
        prop="productName"
        align="center"
        width="250"
      />
      <el-table-column label="描述" prop="desc" align="center" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="140"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <!-- <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-delete"
            content="删除"
            class="text-red"
            @click="handleDelete(scope.row)"
          /> -->
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
      :visible.sync="dialogVisible"
      :title="title"
      :moduleList="moduleList"
    />
  </div>
</template>

<script>
import { testProductList, taskProductAuth } from "@/api/third/testApi";
import { commonStatusList } from "@/utils/commonData";

export default {
  components: {
    CompUpdate: () => import("./components/update"),
  },
  data() {
    return {
      // 模块名称
      moduleList: [],
      commonStatusList,
      // 遮罩层
      loading: false,
      dialogVisible: false,
      title: "",
      // 总条数
      total: 0,
      list: [],
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        productType: "",
        status: "",
      },
    };
  },
  created() {
    this.getDicts("test_moduleName").then((res) => {
      this.moduleList = res.data;
    });
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      testProductList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "新增测试模块";
    },
    handleUpdate(row) {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.title = "修改测试模块";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return taskProductAuth([{ id: row.id, status: row.status }]);
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
    // handleDelete(row) {
    //   this.$confirm(
    //     '是否确认删除产品类型为"' + row.name + '"的数据项?',
    //     "警告",
    //     {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning",
    //     }
    //   )
    //     .then(function () {
    //       return authComputer({ id: row.id, status: 1 });
    //     })
    //     .then(() => {
    //       this.getList();
    //       this.msgSuccess("删除成功");
    //     })
    //     .catch();
    // },
  },
};
</script>
