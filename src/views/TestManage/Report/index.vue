<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="报告标题：" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入报告标题"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="测试对象：" prop="target">
        <el-input
          v-model="queryParams.target"
          placeholder="请输入测试对象"
          clearable
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
      <el-table-column label="报告标题" prop="title" align="center" show-overflow-tooltip />
      <el-table-column label="测试对象" prop="target" align="center" show-overflow-tooltip />
      <el-table-column label="测试范围" prop="range" align="center" show-overflow-tooltip />
      <el-table-column label="风险" prop="risk" align="center" show-overflow-tooltip />
      <el-table-column label="测试时间" align="center" width="200">
        <template slot-scope="{ row }">
          <span class="text-green">
            开始时间：{{ parseTime(row.startTime) }}
          </span>
          <span class="text-red">结束时间：{{ parseTime(row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
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
        width="90"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template slot-scope="scope" v-if="scope.row.status === 0">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            v-if="checkRole(['test', 'admin']) && !scope.row.url"
            icon="el-icon-tickets"
            content="生成excel"
            @click="handleExcel(scope.row)"
          />
          <template v-if="scope.row.url">
            <Tooltip
              icon="el-icon-download"
              content="下载报告"
              class="text-green"
              @click="urlDownload(scope.row.url)"
            />
            <Tooltip
              icon="el-icon-view"
              content="预览报告"
              class="text-red"
              @click="ReadOfficeFile(scope.row.url)"
            />
          </template>
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
import { reportList, reportAuth, reportExcel } from "@/api/third/testApi";
import { commonStatusList } from "@/utils/commonData";

export default {
  name: 'Report',
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
        title: "",
        target: "",
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
      reportList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "新增测试报告";
    },
    handleUpdate(row) {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.title = "修改测试报告";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return reportAuth([{ id: row.id, status: row.status }]);
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
    /** 生成excel按钮操作 */
    handleExcel(row) {
      this.$confirm("是否要生成excel文件?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return reportExcel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("excel生成成功");
        })
        .catch();
    },
  },
};
</script>
