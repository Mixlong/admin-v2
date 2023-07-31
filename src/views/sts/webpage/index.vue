<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          clearable
          placeholder="请选择品类"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="测试工序" prop="processesId">
        <el-select
          v-model="queryParams.processesId"
          clearable
          size="mini"
          placeholder="请选择测试工序"
          style="width: 100%"
        >
          <el-option
            v-for="(dict, index) in processesList"
            :key="index"
            :label="dict.dictLabel"
            :value="String(dict.dictCode)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input
          v-model="queryParams.version"
          clearable
          size="mini"
          placeholder="请输入版本号"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
      </el-form-item>
      <el-button
        v-if="checkRole(['test', 'admin'])"
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        class="fr"
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
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="测试工序" prop="processesName" align="center" />
      <el-table-column label="版本号" prop="version" align="center" />
      <el-table-column label="文件包" prop="file" align="center">
        <template slot-scope="scope">
          <el-link @click="urlDownload(scope.row.file)">{{
            transFileUrl(scope.row.file)
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" />
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
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
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
      :visible.sync="dialogVisible"
      :title="title"
      :cidOptions="cidOptions"
      :dictList="dictList"
      :processesList="processesList"
    />
  </div>
</template>

<script>
import { stsWebList, stsWebAuth } from "@/api/third/testApi";
import { commonStatusList } from "@/utils/commonData";
import { categoryComputerDict } from "@/api/third/fileConfig";

export default {
  components: {
    CompUpdate: () => import("./components/update"),
  },
  data() {
    return {
      lovingVue: true,
      commonStatusList,
      // 遮罩层
      loading: false,
      dialogVisible: false,
      title: "",
      // 总条数
      total: 0,
      dictList: [],
      list: [],
      // 芯片版本
      cidOptions: [],
      // 测试协议
      testAgreementList: [],
      // 测试工序
      processesList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: "",
        processesId: "",
        version: "",
      },
    };
  },
  created() {
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });

    this.getDicts("sys_test_session").then((res) => {
      this.processesList = res.data;
    });
    this.getList();
  },
  methods: {

    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      stsWebList(this.queryParams)
        .then((response) => {
          this.list = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
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
          return stsWebAuth([{ id: row.id, status: row.status }]);
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
  },
};
</script>