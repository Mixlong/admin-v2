<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="协议名称" prop="agreementName">
        <el-input
          v-model.trim.lazy="queryParams.agreementName"
          clearable
          size="mini"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="协议版本" prop="agreementVersion">
        <el-input
          v-model.trim="queryParams.agreementVersion"
          clearable
          size="mini"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-select v-model="queryParams.status" clearable size="mini">
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
        </el-select>
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
      <el-table-column label="协议名称" prop="agreementName" align="center" />
      <el-table-column
        label="协议版本"
        prop="agreementVersion"
        align="center"
      />
      <el-table-column label="脚本文件" prop="file" align="center">
        <template slot-scope="scope">
          <el-link @click="urlDownload(scope.row.file)">
            {{ transFileUrl(scope.row.file) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="脚本更新日志" prop="remark" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="handleSeeScriptLog(scope.row.id)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" :disabled="!scope.row.remark" @click="handleSeeRemark(scope.row.remark)">查看</el-button>
        </template>
      </el-table-column>
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
        width="120"
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

    <CompUpdate ref="compUpdate" :visible.sync="dialogVisible" :title="title" />
    <ScriptLog ref="scriptLogRef" :visible.sync="isScriptLog" title="脚本更新日志" />
    <RemarkInfo ref="remarkInfoRef"></RemarkInfo>
  </div>
</template>

<script>
import { scriptList, scriptAuth } from "@/api/third/simulateScript";
import { commonStatusList } from "@/utils/commonData";
import ScriptLog from "./components/scriptLog.vue";
import RemarkInfo from "./components/remarkInfo.vue";

export default {
  name: "SimulateScript",
  components: {
    CompUpdate: () => import("./components/update"),
    ScriptLog,
    RemarkInfo
  },
  data() {
    return {
      isMyDialog: false,
      lovingVue: true,
      commonStatusList,
      // 遮罩层
      loading: false,
      dialogVisible: false,
      isScriptLog: false,
      title: "",
      // 总条数
      total: 0,
      list: [],
      // 芯片版本
      cidOptions: [],
      // 测试协议
      testAgreementList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        agreementName: "",
        agreementVersion: "",
        status: "",
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      scriptList(this.queryParams)
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
      this.title = "新增模拟脚本";
    },
    handleUpdate(row) {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.title = "修改模拟脚本";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm(`确认要${text}吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return scriptAuth([{ id: row.id, status: row.status }]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
        });
    },
    handleSeeScriptLog(scriptId) {
      this.isScriptLog = true;

      this.$refs.scriptLogRef.queryParams.scriptId = scriptId;
      this.$refs.scriptLogRef.getList()
    },
    handleSeeRemark(remark) {
      this.$refs.remarkInfoRef.dialogVisible = true;
      this.$refs.remarkInfoRef.remark = remark;
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