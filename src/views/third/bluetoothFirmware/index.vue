<template>
  <div class="app-container">
    <!-- 智能搜索表单 -->
    <IntelligentSearchForm :searchForm="queryParams" :fields="searchFields" @search="handleQuery" @reset="resetQuery"
      :defaultVisibleCount="4">
      <template #page-actions>
        <el-button v-hasPermi="['third:bluetoothFirmware:add']" type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="firmwareList" :height="tableHeight()" border>
      <el-table-column label="序号" type="index" width="60" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="版本号" prop="versionNumber" width="150" align="center"/>
      <el-table-column label="芯片平台" prop="chipPlatform" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="供应商" prop="customer" width="130" align="center" show-overflow-tooltip />
      <el-table-column label="项目" prop="project" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="版本描述" prop="versionDescription" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column label="状态" prop="statusName" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'info'" size="small">
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createBy" width="100" align="center" />

      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template slot-scope="scope">
          <div>
            {{ parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}") }}
          </div>
        </template>
       </el-table-column>

    <el-table-column label="操作" align="center" width="180" fixed="right">
      <template slot-scope="scope">
        <Tooltip v-hasPermi="['third:bluetoothFirmware:query']" icon="el-icon-view" content="详情" @click="handleDetail(scope.row)" />
        <Tooltip v-hasPermi="['third:bluetoothFirmware:history']" icon="el-icon-time" content="历史版本" @click="handleHistory(scope.row)" />
        <Tooltip v-hasPermi="['third:bluetoothFirmware:addVersion']" icon="el-icon-document-add" content="添加新固件" @click="handleAddNewVersion(scope.row)" />
        <Tooltip v-hasPermi="['third:bluetoothFirmware:edit']" icon="el-icon-edit" content="修改" @click="handleUpdate(scope.row)" />
        <Tooltip v-hasPermi="['third:bluetoothFirmware:remove']" icon="el-icon-delete" content="删除" class="text-red" @click="handleDelete(scope.row)" />
      </template>
    </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 新增/修改对话框 -->
    <AddFirmwareDialog v-if="addDialogVisible" :visible.sync="addDialogVisible" :firmware-data="currentFirmware"
      @success="handleDialogSuccess" />

    <!-- 详情对话框 -->
    <FirmwareDetailDialog v-if="detailDialogVisible" :visible.sync="detailDialogVisible"
      :firmware-data="currentFirmware" />

    <!-- 添加新版本对话框 -->
    <AddNewVersionDialog v-if="newVersionDialogVisible" :visible.sync="newVersionDialogVisible"
      :firmware-data="currentFirmware" @success="handleDialogSuccess" />

    <!-- 历史版本对话框 -->
    <HistoryDialog v-if="historyDialogVisible" :visible.sync="historyDialogVisible"
      :history-data="currentHistoryList" />
  </div>
</template>

<script>
import { getFirmwareList, deleteFirmware } from "@/api/third/bluetoothFirmware";
import AddFirmwareDialog from "./components/AddFirmwareDialog.vue";
import FirmwareDetailDialog from "./components/FirmwareDetailDialog.vue";
import AddNewVersionDialog from "./components/AddNewVersionDialog.vue";
import HistoryDialog from "./components/HistoryDialog.vue";
import IntelligentSearchForm from "@/components/IntelligentSearchForm";
import Pagination from "@/components/Pagination";
import Tooltip from "@/components/Tooltip";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";
import { parse } from "path-to-regexp";

export default {
  name: "BluetoothFirmware",
  components: {
    AddFirmwareDialog,
    FirmwareDetailDialog,
    AddNewVersionDialog,
    HistoryDialog,
    IntelligentSearchForm,
    Pagination,
    Tooltip,
    TypedSelectLoadMore,
  },
  data() {
    return {
      loading: false,
      firmwareList: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        versionNumber: undefined,
        chipPlatform: undefined,
        customer: undefined,
        project: undefined,
      },
      // 智能搜索表单字段配置
      searchFields: [
        {
          key: "versionNumber",
          label: "版本号",
          type: "input",
          placeholder: "请输入版本号",
        },
        {
          key: "chipPlatform",
          label: "芯片平台",
          type: "input",
          placeholder: "请输入芯片平台",
        },
        {
          key: "customer",
          label: "供应商",
          type: "input",
          placeholder: "请输入供应商",
        },
        {
          key: "project",
          label: "项目",
          type: "input",
          placeholder: "请输入项目",
        },
      ],
      addDialogVisible: false,
      detailDialogVisible: false,
      newVersionDialogVisible: false,
      historyDialogVisible: false,
      currentFirmware: null,
      currentFirmwareId: null,
      currentHistoryList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 表格高度计算
    tableHeight() {
      return window.innerHeight - 280;
    },
    // 查询列表
    getList() {
      this.loading = true;
      getFirmwareList(this.queryParams)
        .then((response) => {
          // 兼容两种数据结构：list 和 content
          this.firmwareList = response.data.list || response.data.content || [];
          this.total = response.data.total || response.data.totalElements || 0;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 搜索
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    // 重置
    resetQuery() {
      this.queryParams = {
        p: 1,
        l: 10,
        versionNumber: undefined,
        chipPlatform: undefined,
        customer: undefined,
        project: undefined,
      };
      this.handleQuery();
    },
    // 新增
    handleAdd() {
      this.currentFirmware = null;
      this.addDialogVisible = true;
    },
    // 修改
    handleUpdate(row) {
      this.currentFirmware = { ...row };
      this.addDialogVisible = true;
    },
    // 详情
    handleDetail(row) {
      this.currentFirmware = { ...row };
      this.detailDialogVisible = true;
    },
    // 历史版本
    handleHistory(row) {
      this.currentHistoryList = row.historyList || [];
      this.historyDialogVisible = true;
    },
    // 添加新版本
    handleAddNewVersion(row) {
      this.currentFirmware = { ...row };
      this.newVersionDialogVisible = true;
    },
    // 删除
    handleDelete(row) {
      this.$confirm(`确定要删除版本号为"${row.versionNumber}"的固件吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return deleteFirmware(row.id);
        })
        .then(() => {
          this.$message.success("删除成功");
          this.getList();
        })
        .catch(() => { });
    },
    // 对话框成功回调
    handleDialogSuccess() {
      this.getList();
    },
  },
};
</script>

<style scoped lang="scss">
.app-container {
  ::v-deep .el-table {
    .text-red {
      color: #f56c6c;
    }
  }
}
</style>
