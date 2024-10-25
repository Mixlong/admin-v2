<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          filterable
          allow-create
          clearable
          placeholder="请选择品类"
          style="width: 160px"
          @change="changeCategory"
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
          v-model="queryParams.computerId"
          :loading="isCLoading"
          filterable
          remote
          clearable
          placeholder="请选择仪表型号"
          :remote-method="getComputerNameList"
          style="width: 160px"
          @change="getList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select
          style="width: 140px"
          clearable
          v-model="queryParams.status"
          placeholder="请选择审核状态"
          @change="getList"
        >
          <el-option
            v-for="(value, key) in statusOptions"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态" prop="computerStatus">
        <el-select
          style="width: 140px"
          clearable
          v-model="queryParams.computerStatus"
          placeholder="请选择产品状态"
          @change="getList"
        >
          <el-option
            v-for="(value, key) in commonStatusList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="ERP编码" prop="erp">
        <el-input
          v-model="queryParams.erp"
          placeholder="请输入ERP编码"
          clearable
          @keyup.enter.native="getList"
          style="width: 140px"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          v-hasPermi="['third:cad:query']"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
          v-hasPermi="['third:cad:reset']"
        >
          重置
        </el-button>
        <el-button
          type="warning"
          v-if="checkRole(['test'])"
          v-hasPermi="['third:cad:batchFirstCheck']"
          @click="handleAuthBatchChange"
        >
          批量初审
        </el-button>
        <el-button
          type="warning"
          v-if="checkRole(['DATA_MANAGER'])"
          v-hasPermi="['third:cad:batchFinalCheck']"
          @click="handleAuthBatchChange"
        >
          批量终审
        </el-button>
        <el-button
          v-hasPermi="['third:cad:missionOrder']"
          type="warning"
          @click="onCreateTaskCode"
        >
          任务令
        </el-button>
        <!-- <el-button v-if="checkRole(['product'])" type="danger"  :disabled="multiple"
          @click="handleResetCheck">重置审核</el-button> -->
      </el-form-item>
    </el-form>
    <div class="file_config_Sn_box">
      <span>
        <b>Sn：</b>
        {{ fileConfigSnData.sn || "- - -" }}
      </span>
      <span class="margin-left">
        <b>pcbaSn：</b>
        {{ fileConfigSnData.pcbaSn || "- - -" }}
      </span>
    </div>
    <el-table
      ref="multipleTableRef"
      v-loading="loading"
      :data="brandList"
      :row-key="getRowKeys"
      :height="tableHeight(35)"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :reserve-selection="true"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column
        label="品类"
        prop="category"
        align="center"
        width="150"
      />
      <el-table-column
        label="型号"
        prop="computer"
        align="center"
        width="150"
      />
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
          <span
            v-if="isStsType(row.type) && row.stsContent && row.dataType === 2"
          >
            STS: {{ row.stsContent }}
          </span>

          <!-- STS程序脚本 -->
          <span v-if="row.dataType === 3" class="text-green">
            STS脚本： {{ row.jsContent }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="产品状态"
        prop="computerStatus"
        align="center"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag :type="isComputerStatus(row.computerStatus)">
            {{ row.computerStatus ? "禁用" : "启用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" width="105">
        <template slot-scope="scope">
          <el-tag :type="isCheckType(scope.row)">
            {{ statusOptions[scope.row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="scope.row.createBy || scope.row.updateBy"
        ></span>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="140">
        <span slot-scope="scope" v-NoData="scope.row.updateTime"></span>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            v-hasPermi="['third:cad:edit']"
            @click="handleUpdate(scope.row)"
          />

          <Tooltip
            icon="el-icon-coordinate"
            class="text-orange"
            content="初审"
            v-hasPermi="['third:cad:firstCheck']"
            v-if="scope.row.status == 1 && checkRole(['test'])"
            @click="handleAuthChange(scope.row, 1)"
          />

          <Tooltip
            icon="el-icon-coordinate"
            class="text-orange"
            content="终审"
            v-hasPermi="['third:cad:finalCheck']"
            v-if="scope.row.status == 4 && checkRole(['DATA_MANAGER'])"
            @click="handleAuthChange(scope.row, 4)"
          />

          <Tooltip
            icon="el-icon-circle-check"
            class="text-orange"
            content="重置审核"
            v-hasPermi="['third:cad:resetCheck']"
            v-if="isSResetCheck(scope.row)"
            @click="handleResetCheck(scope.row)"
          />

          <Tooltip
            icon="el-icon-download"
            class="text-orange"
            content="下载STS脚本"
            v-hasPermi="['third:cad:downloadSts']"
            v-if="scope.row.jsFile"
            @click="zipFile(scope.row.jsFile)"
          />

          <Tooltip
            icon="el-icon-download"
            class="text-orange"
            :content="`下载${scope.row.typeName}`"
            v-hasPermi="['third:cad:downloadFile']"
            v-if="isDownloadUrl(scope.row)"
            @click="zipFile(scope.row.url)"
          />

          <Tooltip
            icon="el-icon-refresh-right"
            content="初审撤回"
            v-hasPermi="['third:cad:resetFinalCheck']"
            v-if="scope.row.status == 4 && checkRole(['test'])"
            @click="handleRevocation(scope.row)"
          />

          <Tooltip
            icon="el-icon-refresh-right"
            content="终审撤回"
            v-hasPermi="['third:cad:resetChecked']"
            v-if="scope.row.status == 2 && checkRole(['DATA_MANAGER'])"
            @click="handleRevocation(scope.row)"
          />

          <!-- 批量同步 -->
          <Tooltip
            v-hasPermi="['third:cad:batch']"
            icon="el-icon-s-claim"
            content="批量同步"
            @click="handleUpdate(scope.row, (isBatchSync = true))"
          />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :ls="[20, 50, 100, 300, 500]"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <el-dialog
      title="请确认是否通过"
      :visible.sync="authDialogVisible"
      width="40%"
      center
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="auth" class="form-data" :inline="false">
        <el-form-item class="auth" label="拒审原因">
          <el-input
            class="width-100-style"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="auth.why"
            placeholder="不通过则需要输入原因"
          />
        </el-form-item>
        <el-form-item label="批量同步" v-if="auth.id">
          <el-select
            ref="select"
            v-model="auth.idList"
            multiple
            class="similar-style width-100-style"
            placeholder=""
          >
            <el-option
              :disabled="disabledName == dict.computer"
              v-for="dict in similarList"
              :key="dict.id"
              :label="dict.computer"
              :value="dict.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="auth">
          <el-button @click="handleStatusChange(3)">不通过</el-button>
          <el-button
            type="primary"
            @click="handleStatusChange(checkRole(['DATA_MANAGER']) ? 2 : 4)"
          >
            通过
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <CompUpdate ref="compUpdate" :dictList="dictList" :isStsType="isStsType" />

    <!-- 任务令 -->
    <task-code
      :visible.sync="isTaskCodeFlag"
      :createTaskData="createTaskData"
    ></task-code>
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
} from "@/api/third/fileConfig";
import { commonStatusList } from "@/utils/commonData";
import { mapGetters, mapState } from "vuex";
import CompUpdate from "./components/update";

export default {
  name: "FileConfig",
  components: {
    CompUpdate,
    TaskCode: () => import("./components/taskCode"),
  },
  data() {
    return {
      commonStatusList,
      isCLoading: false,
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
      auth: { id: undefined, why: "", idList: [] },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        key: undefined,
        status: undefined,
        type: undefined,
        computerId: undefined,
        categoryId: undefined,
        erp: undefined,
      },
      similarList: [],
      disabledName: "",
      fileConfigSnData: {}
    };
  },
  computed: {
    ...mapState({
      statusOptions: (state) => state.commonData.statusOptions,
    }),
    ...mapGetters("commonData", ["isCheckType"]),
    isComputerStatus() {
      return (status) => {
        return status ? "danger" : "success";
      };
    },
    isSResetCheck() {
      return ({ computerStatus, status }) => {
        return (
          this.checkRole(["product"]) &&
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
        ];

        return typeList.includes(type);
      };
    },
    isFileConfigSnData() {
      return Object.keys(this.fileConfigSnData)?.length;
    },
  },
  created() {
    this.getCaategoryData();
  },
  activated() {
    this.getList();
  },
  methods: {
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
    getCaategoryData() {
      categoryComputerDict().then((response) => {
        this.dictList = response.data;

        this.getPathData();
      });
    },
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

      this.getList();
    },
    onCreateTaskCode() {
      this.isTaskCodeFlag = true;
      this.createTaskData = {
        categoryId: this.queryParams.categoryId,
        computerId: this.queryParams.computerId,
      };
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listFileConfig(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
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
      if(row.computerStatus) {
        return false;
      } else if((this.checkRole(['test']) && row.status === 1) || (this.checkRole(['DATA_MANAGER']) && row.status === 4)) {
        return true;
      }
    },
    handleAuthChange(row, status) {
      if (this.handleProPermit(row.isLicense)) return;

      this.auth.why = "";
      this.authDialogVisible = true;
      this.auth.id = row.id;
      this.auth.why = row.why;
      this.auth.idList = [];
      this.checkStatus = status;
      this.$refs.compUpdate
        .changeCategory2(row.categoryId)
        .then((computerFormOptions) => {
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
    handleAuthBatchChange() {
      if (this.ids.length === 0) {
        return this.msgError("请选择批量处理项");
      }

      this.auth.why = "";
      this.auth.id = "";
      this.authDialogVisible = true;
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
          return { id: item };
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

      if (auth.id == "") {
        data = ids.map((item) => {
          return { id: item, why: auth.why, status };
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
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
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.title = isBatchSync ? "批量同步" : "修改";
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
  b {
    color: #67c23a;
  }
}
/* .Cad-option-box {
  column-gap: 10px;
  .el-button {
    margin: 0;
  }
} */
</style>
