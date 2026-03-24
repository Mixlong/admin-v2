<template>
  <!-- 软件数据 -->
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select v-model="validCategoryId" filterable clearable placeholder="请选择品类" style="width: 140px"
          @change="changeCategory" :loading="isDictLoading" :disabled="isDictLoading">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id">
            {{ dict.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="computerId">
        <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
          placeholder="请选择仪表型号" :remote-method="getComputerNameList" style="width: 140px" @change="getList">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
        </el-select>
      </el-form-item>
      <el-form-item label="ERP编码" prop="erp">
        <el-input v-model="queryParams.erp" placeholder="请输入" clearable @keyup.enter.native="getList"
          style="width: 140px" />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select style="width: 100px" clearable v-model="queryParams.status" @change="getList">
          <el-option v-for="(value, key) in statusOptions" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态" prop="computerStatus">
        <el-select v-model="queryParams.computerStatus" style="width: 100px" clearable @change="getList">
          <el-option v-for="(value, key) in commonStatusList" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>

       <el-form-item>
         <el-button type="primary" icon="el-icon-search" @click="handleQuery">
           搜索
         </el-button>
         <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
         <el-button type="warning" v-hasPermi="['third:cad:batchFirstCheck']"
           @click="handleAuthBatchChange(1)">
           批量初审
         </el-button>
        <el-button type="warning" v-hasPermi="['third:cad:batchFinalCheck']"
          @click="handleAuthBatchChange(2)">
          批量终审
        </el-button>
        <el-dropdown class="margin-left-xs margin-right-xs" size="mini" split-button
          v-hasPermi="['third:cad:missionOrder']" type="success" trigger="click" @click="onCreateTaskCode"
          @command="handleToTestRecord">
          任务令
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="A">测试记录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-hasPermi="['third:cad:fileBatchConfig']" type="danger" @click="handleFileBatchSyncConfig">
          同步文件
        </el-button>
        <!-- <el-button v-if="checkRole(['product'])" type="danger"  :disabled="multiple"
          @click="handleResetCheck">重置审核</el-button> -->
      </el-form-item>
    </el-form>
    <div class="file_config_Sn_box">
      <div class="file-config-sn-content">
        <span>
          <b>Sn：</b>
          {{ fileConfigSnData.sn || "- - -" }}
        </span>
        <span class="margin-left">
          <b>pcbaSn：</b>
          {{ fileConfigSnData.pcbaSn || "- - -" }}
        </span>
        <span class="margin-left" v-if="fileConfigSnData.txFileUrl">
          <b>腾讯文档：</b>
          <a :href="fileConfigSnData.txFileUrl" v-if="fileConfigSnData.txFileUrl" target="_blank"
            style="color: #409eff; display: inline-block; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ fileConfigSnData.txFileUrl }}
          </a>
          <el-link :underline="false" icon="el-icon-document-copy" v-clipboard:copy="fileConfigSnData.txFileUrl"
            v-clipboard:success="() => {
              msgSuccess('复制成功')
            }" style="float:right" v-if="fileConfigSnData.txFileUrl">复制</el-link>
        </span>
      </div>

      <span
        class="issue-toolbar-btn"
        @click="handleViewHistoricalIssues()"
      >
        历史问题
      </span>
    </div>

    <el-table ref="multipleTableRef" v-loading="loading" :data="brandList" :row-key="getRowKeys"
      :height="tableHeight(-5)" :row-class-name="tableRowClassName" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" :reserve-selection="true"
        :selectable="checkSelectable" />
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column label="品类" prop="category" align="center" width="130" />
      <el-table-column label="型号" prop="computer" align="center" width="130" />
      <el-table-column label="ERP编码" prop="erp" align="center" width="130">
        <span slot-scope="scope" v-NoData="scope.row.erp"></span>
      </el-table-column>
      <el-table-column label="属性" prop="typeName" align="center" />
      <el-table-column label="属性描述" prop="content" align="center">
        <template slot-scope="{ row }">
          <!-- PC上位机 -->
          <template v-if="row.dataType === 1">
            {{ row.content || "- - -" }}
          </template>

          <!-- STS网页 -->
          <span v-if="isStsType(row.type) && row.stsContent && row.dataType === 2">
            STS: {{ row.stsContent }}
          </span>

          <!-- STS程序脚本 -->
          <span v-if="row.dataType === 3" class="text-green">
            STS脚本： {{ row.jsContent }}
          </span>

          <!-- 模拟脚本 -->
          <span v-if="row.dataType === 4" class="text-green">
            协议名称： {{ row.content }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="产品状态" prop="computerStatus" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag :type="isComputerStatus(row.computerStatus)">
            {{ row.computerStatus ? "禁用" : "启用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否许可" prop="isLicense" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag :type="Number(row.isLicense) === 1 ? 'success' : 'info'">
            {{ Number(row.isLicense) === 1 ? "许可" : "不许可" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="isCheckType(scope.row)">
            {{ statusOptions[scope.row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" width="90">
        <span slot-scope="scope" v-NoData="scope.row.createBy || scope.row.updateBy"></span>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="150" sortable>
        <span slot-scope="scope" v-NoData="scope.row.updateTime"></span>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <Tooltip icon="el-icon-edit" content="编辑" v-hasPermi="['third:cad:edit']" @click="handleUpdate(scope.row)" />

          <Tooltip icon="el-icon-coordinate" class="text-orange" content="初审" v-hasPermi="['third:cad:firstCheck']"
            v-if="scope.row.status == 1" @click="handleAuthChange(scope.row, 1)" />

          <Tooltip icon="el-icon-coordinate" class="text-orange" content="终审" v-hasPermi="['third:cad:finalCheck']"
            v-if="scope.row.status == 4" @click="handleAuthChange(scope.row, 4)" />

          <Tooltip icon="el-icon-circle-check" class="text-orange" content="重置审核" v-hasPermi="['third:cad:resetCheck']"
            v-if="isSResetCheck(scope.row)" @click="handleResetCheck(scope.row)" />

          <Tooltip v-if="scope.row.type === 'ble_ota_fw'" icon="el-icon-link" class="text-primary" content="蓝牙关联"
            v-hasPermi="['third:cad:bleAssociation']" @click="handleBluetoothAssociation(scope.row)" />

          <Tooltip icon="el-icon-download" class="text-orange" content="下载STS脚本" v-hasPermi="['third:cad:downloadSts']"
            v-if="scope.row.jsFile" @click="zipFile(scope.row.jsFile)" />

          <template v-if="scope.row.type === 'simulate_script_file' && scope.row.file">
            <Tooltip icon="el-icon-download" class="text-orange" :content="`下载${scope.row.content}脚本`"
              v-hasPermi="['third:cad:downloadFile']" @click="zipFile(scope.row.file)" />
          </template>
          <template v-else>
            <Tooltip v-if="isDownloadUrl(scope.row)" icon="el-icon-download" class="text-orange"
              :content="`下载${scope.row.typeName}`" v-hasPermi="['third:cad:downloadFile']"
              @click="zipFile(scope.row.url)" />
          </template>

          <Tooltip icon="el-icon-refresh-right" content="初审撤回" v-hasPermi="['third:cad:resetFinalCheck']"
            v-if="scope.row.status == 4" @click="handleRevocation(scope.row)" />

          <Tooltip icon="el-icon-refresh-right" content="终审撤回" v-hasPermi="['third:cad:resetChecked']"
            v-if="scope.row.status == 2" @click="handleRevocation(scope.row)" />

          <Tooltip v-hasPermi="['third:cad:batch']" icon="el-icon-s-claim" content="批量同步"
            @click="handleUpdate(scope.row, (isBatchSync = true))" />
        </template>
      </el-table-column>
    </el-table>

    <pagination
    style="margin-top:0"
    v-if="total > 0" :total="total" :ls="[20, 50, 100, 300, 500]" :page.sync="queryParams.p"
      :limit.sync="queryParams.l" @pagination="getList" />

    <el-dialog
      title="历史问题列表"
      :visible.sync="historicalIssuesDialogVisible"
      width="1200px"
      center
      custom-class="historical-issues-dialog"
      append-to-body
    >
      <el-form :inline="true" class="issue-dialog-filter">
        <el-form-item label="所属品类">
          <el-select
            v-model="historicalIssuesFilter.categoryId"
            filterable
            clearable
            placeholder="请选择品类"
            style="width: 180px"
            @change="handleHistoricalIssuesCategoryChange"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号">
          <el-select
            v-model="historicalIssuesFilter.computerId"
            filterable
            clearable
            placeholder="请选择仪表型号"
            style="width: 220px"
          >
            <el-option
              v-for="dict in historicalIssuesComputerOptions"
              :key="dict.id || dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleHistoricalIssuesSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetHistoricalIssuesSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="issue-dialog-table-wrap">
        <el-table
          v-loading="historicalIssuesLoading"
          :data="historicalIssuesList"
          border
          height="calc(70vh - 64px)"
        >
          <el-table-column label="序号" width="58" align="center">
            <template slot-scope="scope">
              {{ (historicalIssuesQuery.p - 1) * historicalIssuesQuery.l + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="品类" prop="categoryName" align="center" width="140" show-overflow-tooltip />
          <el-table-column label="型号" prop="computerName" align="center" width="160" show-overflow-tooltip />
          <el-table-column label="问题点" prop="historicalIssues" align="center" show-overflow-tooltip />
          <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
          <el-table-column label="处理时间" prop="updateTime" align="center" width="180">
            <template slot-scope="{ row }">
              {{ row.updateTime || "- - -" }}
            </template>
          </el-table-column>
          <el-table-column label="处理状态" align="center" width="120">
            <template slot-scope="{ row }">
              <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" size="mini">
                {{ Number(row.status) === 1 ? "已处理" : "未处理" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination
        style="margin-top:0"
        v-if="historicalIssuesTotal > 0"
        :total="historicalIssuesTotal"
        :ls="[10, 20, 50, 100]"
        :page.sync="historicalIssuesQuery.p"
        :limit.sync="historicalIssuesQuery.l"
        @pagination="fetchHistoricalIssues"
      />
    </el-dialog>

    <el-dialog title="请确认是否通过" :visible.sync="authDialogVisible" width="40%" center :close-on-click-modal="false">
      <el-form ref="form" :model="auth" class="form-data" :inline="false">
        <el-form-item class="auth" label="拒审原因">
          <el-input class="width-100-style" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="auth.why"
            placeholder="不通过则需要输入原因" />
        </el-form-item>
        <el-form-item label="批量同步" v-if="auth.id">
          <el-select ref="select" v-model="auth.idList" multiple class="similar-style width-100-style" placeholder="">
            <el-option :disabled="disabledName == dict.computer" v-for="dict in similarList" :key="dict.id"
              :label="dict.computer" :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="auth">
          <el-button @click="handleStatusChange(3)">不通过</el-button>
          <el-button type="primary" @click="
            handleStatusChange(
              checkPermi(['third:cad:finalCheck']) &&
                (auth.status === 4 || isBatchType === 2)
                ? 2
                : 4
            )
            ">
            通过
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <CompUpdate ref="compUpdate" v-model="showUpdateDialog" :dictList="dictList" :isStsType="isStsType"
      v-if="showUpdateDialog" />

    <!-- 任务令 -->
    <task-code :visible.sync="isTaskCodeFlag" :createTaskData="createTaskData"></task-code>

    <!-- 批量同步文件 -->
    <BatchSyncConfig ref="batchSyncConfigRef"> </BatchSyncConfig>

    <!-- 蓝牙固件关联对话框 -->
    <BluetoothAssociationDialog
      v-if="bluetoothAssociationVisible"
      :visible.sync="bluetoothAssociationVisible"
      :file-config-data="currentFileConfig"
      @confirm="handleBluetoothAssociationConfirm"
    />
  </div>
</template>

<script>
import {
  listFileConfig,
  authFileConfig,
  resetFileConfig,
  categoryComputerDict,
  computerDictList,
  fileCancel,
  computerNameList,
  fileConfigSn,
  editFileConfig,
  listFileConfigIssues,
} from "@/api/third/fileConfig";
import { commonStatusList } from "@/utils/commonData";
import { categoryComputerDictMixins } from "@/mixins/common";
import { mapGetters, mapState } from "vuex";
import CompUpdate from "./components/update";
import BatchSyncConfig from "./components/batchSyncConfig.vue";
import BluetoothAssociationDialog from "./components/BluetoothAssociationDialog.vue";

const PAGE_CACHE_KEY = "third-cad-file-page-state";

export default {
  name: "FileConfig",
  mixins: [categoryComputerDictMixins],
  components: {
    CompUpdate,
    TaskCode: () => import("./components/taskCode"),
    BatchSyncConfig,
    BluetoothAssociationDialog,
  },
  data() {
    return {
      commonStatusList,
      isCLoading: false,
      isDictLoading: true, // 品类数据加载状态
      isInitialized: false, // 是否已经初始化
      checkStatus: null,
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      isTaskCodeFlag: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      brandList: [],
      // 弹出层标题
      // 是否显示弹出层
      // 日期范围
      dateRange: [],
      fileList: [],
      dictList: [],
      categoryOptions: [],
      computerOptions: [],
      fileTypeList: [],
      fileListCover: [],
      createTaskData: {},
      auth: { id: undefined, why: "", idList: [], status: undefined },
      isBatchType: undefined,
      // 查询参数
      queryParams: {
        p: 1,
        l: 100,
        key: undefined,
        status: undefined,
        type: undefined,
        computerId: undefined,
        categoryId: undefined,
        erp: undefined,
      },
      similarList: [],
      disabledName: "",
      fileConfigSnData: {},
      showUpdateDialog: false,
      bluetoothAssociationVisible: false,
      currentFileConfig: null,
      isRestoringSelection: false,
      historicalIssuesDialogVisible: false,
      historicalIssuesLoading: false,
      historicalIssuesList: [],
      historicalIssuesTotal: 0,
      historicalIssuesQuery: {
        p: 1,
        l: 10,
      },
      historicalIssuesFilter: {
        categoryId: "",
        computerId: "",
      },
      historicalIssuesComputerOptions: [],
    };
  },
  computed: {
    ...mapState({
      statusOptions: (state) => state.commonData.statusOptions,
    }),
    ...mapGetters("commonData", ["isCheckType"]),
    // 确保categoryId是有效的
    validCategoryId: {
      get() {
        if (!this.queryParams.categoryId || !this.dictList.length) return '';
        const validCategory = this.dictList.find(dict => dict.id === this.queryParams.categoryId);
        return validCategory ? this.queryParams.categoryId : '';
      },
      set(value) {
        this.queryParams.categoryId = value;
      }
    },
    isComputerStatus() {
      return (status) => {
        return status ? "danger" : "success";
      };
    },
    isSResetCheck() {
      return ({ computerStatus, status }) => {
        return (
          this.checkPermi(['third:cad:resetCheck']) &&
          !computerStatus &&
          (status === 2 || status === 4)
        );
      };
    },
    isDownloadUrl() {
      return ({ computerStatus, status, url, dataType }) => {
        return (
          !computerStatus &&
          dataType === 1 &&
          url &&
          (status !== 2 || status !== 4 || status === 2)
        );
      };
    },
    isStsType() {
      return (type) => {
        const typeList = [
          "iqc_tool",
          "fqc_tool_soft",
          "oqc_tool_soft",
          "config_tools",
          "pack_file",
          "update_file",
          "maintenance_file",
        ];

        return typeList.includes(type);
      };
    },
    isFileConfigSnData() {
      return Object.keys(this.fileConfigSnData)?.length;
    },
  },
  watch: {
    authDialogVisible(bool) {
      if (!bool) {
        this.isBatchType = undefined;
      }
    },
    historicalIssuesDialogVisible(bool) {
      if (!bool) {
        this.historicalIssuesList = [];
        this.historicalIssuesTotal = 0;
        this.historicalIssuesQuery.p = 1;
      }
    },
    $route: {
      async handler(route) {
        if (route.name === "FileConfig") {
          const { categoryId, computerId } = route?.params || {};

          if (this.isInitialized && !categoryId && !computerId) {
            return;
          }

          this.isDictLoading = true; // 开始加载

          try {
            this.dictList = await this.getCategoryData();
            await this.initializeRouteState(route);
            this.handleQuery();
            this.isInitialized = true;
          } finally {
            this.isDictLoading = false; // 加载完成
          }
        }
      },
      immediate: true,
    }
  },
  // beforeRouteEnter(to, from, next) {
  //   next((vm) => {
  //     vm.getCategoryData();
  //     vm.getList();
  //   });
  // },
  activated() {
    if (this.isInitialized) {
      this.getFileConfigSn();
      this.getList();
    }
  },
  deactivated() {
    this.savePageState();
  },
  beforeDestroy() {
    this.savePageState();
  },
  methods: {
    getDefaultQueryParams() {
      return {
        p: 1,
        l: 100,
        key: undefined,
        status: undefined,
        type: undefined,
        computerId: undefined,
        categoryId: undefined,
        erp: undefined,
      };
    },
    getPageState() {
      try {
        return JSON.parse(sessionStorage.getItem(PAGE_CACHE_KEY) || "{}");
      } catch (error) {
        console.error("读取 CAD 文件页缓存失败:", error);
        return {};
      }
    },
    setPageState(state) {
      sessionStorage.setItem(PAGE_CACHE_KEY, JSON.stringify(state));
    },
    getCurrentProjectCacheKey() {
      const { categoryId, computerId } = this.queryParams;
      if (!categoryId || !computerId) return "";
      return `${categoryId}_${computerId}`;
    },
    getCachedQueryParams() {
      const state = this.getPageState();
      return state.queryParams || null;
    },
    savePageState() {
      const state = this.getPageState();
      const nextState = {
        ...state,
        queryParams: {
          ...this.getDefaultQueryParams(),
          ...this.queryParams,
        },
      };

      this.setPageState(nextState);
      this.saveCurrentProjectSelection();
    },
    saveCurrentProjectSelection(selection = this.ids) {
      const projectKey = this.getCurrentProjectCacheKey();
      if (!projectKey) return;

      const state = this.getPageState();
      const projectSelections = state.projectSelections || {};

      projectSelections[projectKey] = (selection || []).map((item) => item.id);

      this.setPageState({
        ...state,
        projectSelections,
      });
    },
    getCurrentProjectSelectionIds() {
      const projectKey = this.getCurrentProjectCacheKey();
      if (!projectKey) return [];

      const state = this.getPageState();
      const projectSelections = state.projectSelections || {};

      return projectSelections[projectKey] || [];
    },
    restoreTableSelection() {
      this.$nextTick(() => {
        const tableRef = this.$refs.multipleTableRef;
        if (!tableRef) return;

        const selectedIds = this.getCurrentProjectSelectionIds();
        const selectedRows = this.brandList.filter((row) =>
          selectedIds.includes(row.id)
        );

        this.isRestoringSelection = true;
        tableRef.clearSelection();
        selectedRows.forEach((row) => {
          tableRef.toggleRowSelection(row, true);
        });

        this.ids = selectedRows;
        this.single = selectedRows.length !== 1;
        this.multiple = !selectedRows.length;

        this.$nextTick(() => {
          this.isRestoringSelection = false;
          this.saveCurrentProjectSelection(selectedRows);
        });
      });
    },
    async initializeRouteState(route) {
      const { categoryId, computerId } = route?.params || {};
      const cachedQueryParams = this.getCachedQueryParams();
      const nextQueryParams = {
        ...this.getDefaultQueryParams(),
      };

      if (cachedQueryParams) {
        Object.assign(nextQueryParams, cachedQueryParams);
      }

      if (categoryId && computerId) {
        nextQueryParams.categoryId = categoryId;
        nextQueryParams.computerId = computerId;
      } else if (!nextQueryParams.categoryId) {
        nextQueryParams.categoryId = this.dictList[0]?.id;
      }

      const validCategory = this.dictList.find(
        (dict) => dict.id === nextQueryParams.categoryId
      );
      nextQueryParams.categoryId = validCategory
        ? nextQueryParams.categoryId
        : this.dictList[0]?.id;

      this.queryParams = {
        ...this.queryParams,
        ...nextQueryParams,
      };

      const targetComputerId = this.queryParams.computerId;
      await this.changeCategory(this.queryParams.categoryId);

      const hasCurrentComputer = this.computerOptions.some(
        (item) => item.model === targetComputerId
      );

      this.queryParams.computerId = hasCurrentComputer ? targetComputerId : "";
    },
    async getFileConfigSn() {
      const { categoryId, computerId } = this.queryParams;
      if (categoryId && computerId) {
        const result = await fileConfigSn({
          categoryId,
          computerId,
        });

        this.fileConfigSnData = result.data ?? {};
      }
    },
    // getCategoryData() {
    //   categoryComputerDict().then((response) => {
    //     this.dictList = response.data;

    //     this.getPathData();
    //   });
    // },
    getPathData() {
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, computerId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);

        if (this.$route.query.model) {
          computerId = this.$route.query.model;
        }
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
    },
    onCreateTaskCode() {
      this.isTaskCodeFlag = true;
      this.createTaskData = {
        categoryId: this.queryParams.categoryId,
        computerId: this.queryParams.computerId,
      };
    },
    handleToTestRecord(command) {
      if (command === "A") {
        this.handleNameToPage("testModelRecord");
      }
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listFileConfig(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
        this.savePageState();
        this.restoreTableSelection();
      });
    },
    tableRowClassName({ row }) {
      if (row.computerStatus) {
        return "disabled";
      }
    },
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    checkSelectable(row) {
      if (
        (this.checkPermi(['third:cad:batchFirstCheck']) && row.status === 1) ||
        (this.checkPermi(['third:cad:batchFinalCheck']) && row.status === 4)
      ) {
        return true;
      }
      return false;
    },
    handleAuthChange(row, status) {
      if (this.handleProPermit(row.isLicense)) return;
      
      // 重置 auth 对象的属性，而不是替换整个对象
      this.auth.id = row.id;
      this.auth.why = row.why || "";
      this.auth.idList = [];
      this.auth.status = row.status;
      this.checkStatus = status;
      this.authDialogVisible = true;
      
      // 使用 categoryComputerDict 获取品类数据，而不是依赖 compUpdate 组件
      categoryComputerDict().then((response) => {
        const categoryData = response.data.find(item => item.id === row.categoryId);
        const computerFormOptions = categoryData ? categoryData.computerList : [];
        
        computerDictList({
          categoryId: row.categoryId,
          type: row.type,
          status,
        }).then((res) => {
          this.disabledName = "";
          for (let key of computerFormOptions) {
            if (key.model == row.computerId) {
              this.disabledName = key.name;
            }
          }
          this.similarList = res.data;
        });
      });
    },
    handleAuthBatchChange(type) {
      if (this.ids.length === 0) {
        return this.msgError("请选择批量处理项");
      }

      // 重置 auth 对象的属性
      this.auth.why = "";
      this.auth.id = undefined;
      this.auth.status = undefined;
      this.auth.idList = [];
      this.authDialogVisible = true;
      this.isBatchType = type;
    },
    getRowKeys(row) {
      return row.id;
    },
    // 重置审核
    handleResetCheck(row) {
      if (this.handleProPermit(row.isLicense)) return;

      let data = null;
      if (this.multiple) {
        data = [{ id: row.id }];
      } else {
        data = this.ids.map((item) => {
          return { id: item.id };
        });
      }
      this.$confirm("确认要重置审核吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return resetFileConfig(data);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("重置审核成功");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleStatusChange(status) {
      let data = [];
      let { ids, auth } = this;

      if (!auth.id || auth.id === "") {
        if (this.isBatchType === 1) {
          const flag = ids.some((item) => item.status !== 1);
          if (flag) {
            this.msgError("批量初审中只能包含待初审项");
            return;
          }
        } else if (this.isBatchType === 2) {
          const flag = ids.some((item) => item.status !== 4);
          if (flag) {
            this.msgError("批量终审中只能包含待终审项");
            return;
          }
        }

        data = ids.map((item) => {
          return { id: item.id, why: auth.why, status };
        });
      } else {
        let { idList } = this.auth;
        if (idList.length) {
          data = idList.map((item) => {
            return { id: item, why: auth.why, status };
          });
        }
        data.push({ id: auth.id, why: auth.why, status });
      }

      if (status === 3) {
        // 不通过 检查原因是否为空
        if (!auth.why) {
          return this.msgError("原因不能为空");
        }
      }

      authFileConfig(data).then((response) => {
        let { code } = response;
        if (code == 200) {
          this.authDialogVisible = false;
          this.msgSuccess("操作成功！");
          this.ids = [];
          this.resetTableSelection("multipleTableRef");
          this.getList();
        }
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.urls = [];
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getFileConfigSn();
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.fileConfigSnData = {};
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection;
      this.single = selection.length != 1;
      this.multiple = !selection.length;
      if (this.isRestoringSelection) return;
      this.saveCurrentProjectSelection(selection);
    },
    //生产许可判断
    handleProPermit(permitStatus) {
      if (permitStatus === 1) {
        this.msgWarning("当前项“生产许可”已打开, 不能操作！");
        return true;
      }
    },
    // 蓝牙地址转化
    handleBleVersionlist(copyRow) {
      let bleVersionList = [{ bleName: "" }];
      if (copyRow.type === "ble_version" && !this.Is_Empty(copyRow.content)) {
        let bleNameList = copyRow.content.split(",");

        bleVersionList = bleNameList.map((bleName) => {
          return { bleName };
        });
      }
      return bleVersionList;
    },
    handleUpdate(row, isBatchSync) {
      if (!isBatchSync && this.handleProPermit(row.isLicense)) return;

      let copyRow = JSON.parse(JSON.stringify(row));

      // 先打开对话框，然后等待组件创建完成
      this.showUpdateDialog = true;

      this.$nextTick(() => {
        // 确保组件已经创建
        if (this.$refs.compUpdate) {
          this.$refs.compUpdate.reset();
          this.$refs.compUpdate.changeCategory2(copyRow.categoryId);

          // 蓝牙地址转化
          const bleVersionList = this.handleBleVersionlist(copyRow);

          // 整机SN的长度转化
          if (copyRow.type === "dt_pack_sn" && !this.Is_Empty(copyRow.content)) {
            const packContentAndLen = copyRow.content.split(",");

            copyRow.content = packContentAndLen[0];
            copyRow.packSnLen = packContentAndLen[1];
          }

          this.$refs.compUpdate.form = Object.assign(
            { idList: [], content: "", testInfo: [], bleVersionList },
            copyRow
          );

          this.$refs.compUpdate.form.firmwareConf = copyRow.firmwareConf
            ? copyRow.firmwareConf
            : {};
          if (this.$refs.compUpdate.form.firmwareConf.mid) {
            this.$refs.compUpdate.changeMidValue(
              this.$refs.compUpdate.form.firmwareConf.mid,
              false
            );
          }
          this.$refs.compUpdate.form.firmwareConf.fileConfId = copyRow.id;
          this.$refs.compUpdate.boleConfig =
            copyRow.type == "boot_file" ||
            copyRow.type == "app_file" ||
            copyRow.type == "ui_data";
          this.$refs.compUpdate.isBatchSync = isBatchSync;
          this.$refs.compUpdate.title = isBatchSync ? "批量同步" : "修改";
        }
      });
    },
    handleRevocation(row) {
      if (this.handleProPermit(row.isLicense)) return;

      this.$confirm("确认要撤销审核吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return fileCancel({ id: row.id });
        })
        .then(() => {
          this.getList();
          this.msgSuccess("撤销成功！");
        })
        .catch((err) => {
          console.log(err);
        });
    },
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
    getSelectedComputerOption() {
      const { categoryId, computerId } = this.queryParams;
      if (!categoryId || !computerId) return null;

      const currentCategory = this.dictList.find((item) => item.id === categoryId);
      const categoryComputerList = currentCategory?.computerList || [];
      const candidateList = [...this.computerOptions, ...categoryComputerList];

      return candidateList.find(
        (item) =>
          item.id === computerId ||
          item.model === computerId ||
          item.name === computerId
      );
    },
    getHistoricalIssuesComputerOptions(categoryId) {
      const currentCategory = this.dictList.find((item) => item.id === categoryId);
      return currentCategory?.computerList || [];
    },
    syncHistoricalIssuesFilter() {
      this.historicalIssuesFilter.categoryId = this.queryParams.categoryId || "";
      this.historicalIssuesFilter.computerId = this.queryParams.computerId || "";
      this.historicalIssuesComputerOptions = this.getHistoricalIssuesComputerOptions(
        this.historicalIssuesFilter.categoryId
      );
    },
    getHistoricalIssueQueryParams() {
      const selectedComputer = this.historicalIssuesComputerOptions.find(
        (item) =>
          item.model === this.historicalIssuesFilter.computerId ||
          item.id === this.historicalIssuesFilter.computerId ||
          item.name === this.historicalIssuesFilter.computerId
      );
      const categoryId = this.historicalIssuesFilter.categoryId || "";
      const computerId =
        this.historicalIssuesFilter.computerId ||
        selectedComputer?.model ||
        selectedComputer?.id ||
        "";

      return {
        categoryId,
        computerId,
      };
    },
    handleHistoricalIssuesCategoryChange(value) {
      this.historicalIssuesComputerOptions = this.getHistoricalIssuesComputerOptions(value);
      this.historicalIssuesFilter.computerId = "";
    },
    handleHistoricalIssuesSearch() {
      this.historicalIssuesQuery.p = 1;
      this.fetchHistoricalIssues();
    },
    resetHistoricalIssuesSearch() {
      this.syncHistoricalIssuesFilter();
      this.historicalIssuesQuery.p = 1;
      this.fetchHistoricalIssues();
    },
    // 批量同步文件
    handleFileBatchSyncConfig() {
      this.$refs.batchSyncConfigRef.dialogVisible = true;
    },
    async fetchHistoricalIssues() {
      const { categoryId, computerId } = this.getHistoricalIssueQueryParams();

      if (!categoryId) {
        this.msgWarning("请先选择品类");
        return;
      }

      this.historicalIssuesDialogVisible = true;
      this.historicalIssuesLoading = true;

      try {
        const params = {
          categoryId,
          p: this.historicalIssuesQuery.p,
          l: this.historicalIssuesQuery.l,
        };
        if (computerId) {
          params.computerId = computerId;
        }

        const res = await listFileConfigIssues(params);

        this.historicalIssuesList = res?.data?.list || [];
        this.historicalIssuesTotal = res?.data?.total || 0;
      } catch (error) {
        console.error("获取历史问题列表失败:", error);
        this.historicalIssuesList = [];
        this.historicalIssuesTotal = 0;
        this.msgError("获取历史问题列表失败");
      } finally {
        this.historicalIssuesLoading = false;
      }
    },
    async handleViewHistoricalIssues() {
      this.syncHistoricalIssuesFilter();
      this.historicalIssuesQuery.p = 1;
      await this.fetchHistoricalIssues();
    },
    // 蓝牙固件关联 - 打开独立对话框
    handleBluetoothAssociation(row) {
      console.log("🚀 ~ row:", row)
      if (this.handleProPermit(row.isLicense)) return;
      
      this.currentFileConfig = row;
      this.bluetoothAssociationVisible = true;
    },
    // 蓝牙固件关联确认
    handleBluetoothAssociationConfirm(data) {
      const { associationType, firmwareInfo, isDelete } = data;
      
      // 复制当前行的完整数据
      const updateData = JSON.parse(JSON.stringify(this.currentFileConfig));
      
      // 删除不需要的字段
      delete updateData.createTime;
      delete updateData.updateTime;
      delete updateData.updateBy;
      
      // 删除关联操作
      if (isDelete || !firmwareInfo) {
        updateData.bluetoothFirmwareId = null;
        // 调用API保存
        editFileConfig(updateData).then(response => {
          if (response.code === 200) {
            this.msgSuccess('已清除蓝牙固件关联');
            this.getList();
          }
        }).catch(error => {
          console.error('清除关联失败:', error);
          this.msgError('清除关联失败，请重试');
        });
        return;
      }
      
      if (associationType === 1) {
        // 临时关联：更新 URL
        updateData.url = firmwareInfo.url || firmwareInfo.fileUrl || '';
        updateData.bluetoothFirmwareId = null;
      } else if (associationType === 2) {
        // 永久关联：设置 bluetoothFirmwareId
        updateData.bluetoothFirmwareId = firmwareInfo.id;
        // 永久关联时不清空 url，保留原有值
      }
      
      // 调用API保存
      editFileConfig(updateData).then(response => {
        if (response.code === 200) {
          this.msgSuccess(associationType === 1 ? '临时关联成功' : '永久关联成功');
          this.getList();
        }
      }).catch(error => {
        console.error('蓝牙固件关联失败:', error);
        this.msgError('关联失败，请重试');
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.auth {
  text-align: center;
  margin-bottom: 10px;
}

.width-100-style {
  width: 100%;
}

.file_config_Sn_box {
  background: #f0f9eb;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  b {
    color: #67c23a;
  }
}

.file-config-sn-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.issue-dialog-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

:deep(.issue-dialog-filter .el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.issue-toolbar-btn {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 14px;
  font-weight: 500;
  color: #e6a23c;
  cursor: pointer;
  line-height: 1;
}

.issue-toolbar-count {
  margin-left: 2px;
}

.issue-dialog-header {
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
}

.issue-dialog-table-wrap {
  max-height: 70vh;
}

:deep(.historical-issues-dialog .pagination-container) {
  padding: 12px 0 0;
}

:deep(.historical-issues-dialog .el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 20px;
}

/* .Cad-option-box {
  column-gap: 10px;
  .el-button {
    margin: 0;
  }
} */
</style>
