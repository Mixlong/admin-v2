<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          @change="changeCategory"
          filterable
          allow-create
          clearable
          placeholder="请选择所属品类"
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
      <el-form-item label="产品型号" prop="projectId">
        <el-select
          v-model="queryParams.projectId"
          @change="changeComputer"
          :loading="isCLoading"
          :remote-method="getComputerNameList"
          filterable
          remote
          clearable
          placeholder="请选择产品型号"
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
      <el-form-item label="审核状态" prop="status">
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择审核状态"
          @change="getList"
          style="width: 140px"
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
          v-model="queryParams.computerStatus"
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
          type="primary"
          icon="el-icon-search"
          v-hasPermi="['third:epc:query']"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          v-hasPermi="['third:epc:reset']"
          @click="resetQuery"
        >
          重置
        </el-button>
        <el-button
          type="warning"
          v-hasPermi="['third:epc:batchFirstCheck']"
          @click="handleAuthBatchChange"
        >
          批量初审
        </el-button>
        <el-button
          type="warning"
          v-hasPermi="['third:epc:batchFinalCheck']"
          @click="handleAuthBatchChange"
        >
          批量终审
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="multipleTableRef"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight(35)"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        width="150"
      />
      <el-table-column
        label="产品型号"
        prop="versionName"
        align="center"
        width="150"
      />
      <el-table-column
        label="属性"
        prop="typeName"
        align="center"
        width="150"
      />
      <el-table-column label="属性描述" prop="content" align="center">
        <span slot-scope="{ row }" v-html="row.content"></span>
      </el-table-column>
      <el-table-column
        label="产品状态"
        prop="categoryStatus"
        align="center"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag :type="isComputerStatus(row.categoryStatus)">
            {{ row.categoryStatus ? "禁用" : "启用" }}
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
            v-hasPermi="['third:epc:edit']"
            @click="handleUpdate(scope.row)"
          />

          <Tooltip
            icon="el-icon-coordinate"
            class="text-orange"
            content="初审"
            v-hasPermi="['third:epc:firstCheck']"
            v-if="scope.row.status == 1"
            @click="handleAuthChange(scope.row, 1)"
          />

          <Tooltip
            icon="el-icon-coordinate"
            class="text-orange"
            content="终审"
            v-hasPermi="['third:epc:finalCheck']"
            v-if="scope.row.status == 4"
            @click="handleAuthChange(scope.row, 4)"
          />

          <Tooltip
            icon="el-icon-circle-check"
            class="text-orange"
            content="重置审核"
            v-hasPermi="['third:epc:resetCheck']"
            v-if="isSResetCheck(scope.row)"
            @click="handleResetCheck(scope.row)"
          />

          <Tooltip
            icon="el-icon-download"
            class="text-orange"
            content="下载"
            v-hasPermi="['third:epc:downloadFile']"
            v-if="isDownloadUrl(scope.row)"
            @click="zipFile(scope.row.url)"
          />

          <Tooltip
            icon="el-icon-refresh-right"
            content="终审撤回"
            v-hasPermi="['third:epc:resetFinalCheck']"
            v-if="scope.row.status == 4"
            @click="handleRevocation(scope.row.id)"
          />

          <Tooltip
            icon="el-icon-refresh-right"
            content="审核完毕撤回"
            v-hasPermi="['third:epc:resetChecked']"
            v-if="scope.row.status == 2"
            @click="handleRevocation(scope.row.id)"
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
            v-model="auth.why"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="不通过则需要输入原因"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="批量同步" v-if="auth.id">
          <el-select
            ref="select"
            v-model="auth.idList"
            multiple
            placeholder="请选择"
            style="width: 100%"
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
            @click="handleStatusChange(checkRole(['fo_test', 'admin']) ? 2 : 4)"
          >
            通过
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <CompUpdate ref="compUpdate" :dictList="dictList" />
  </div>
</template>

<script>
import {
  listFileConfig,
  authFileConfig,
  resetFileConfig,
  computerDictList,
  fileCancel,
  fileVersionList,
  computerNameList,
} from "@/api/third/epc/versionManage";
import { commonStatusList } from "@/utils/commonData";
import { mapGetters, mapState } from "vuex";
import CompUpdate from "./components/update";

export default {
  name: "ProjectManage",
  components: {
    CompUpdate,
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
      auth: { id: undefined, why: "", idList: [] },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        key: undefined,
        status: undefined,
        type: undefined,
        projectId: undefined,
        categoryId: undefined,
        erp: undefined,
      },
      similarList: [],
      disabledName: "",
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
          this.checkRole(["fo_test"]) &&
          !computerStatus &&
          (status === 2 || status === 4)
        );
      };
    },
    isDownloadUrl() {
      return ({ computerStatus, status, url }) => {
        return (
          !computerStatus &&
          url &&
          (((status !== 2 || status !== 4) &&
            this.checkRole(["test", "dev"])) ||
            status === 2)
        );
      };
    },
  },
  mounted() {
    fileVersionList().then((response) => {
      this.dictList = response.data;
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerId = this.$route.query.model;
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
      this.getList();
    });
  },
  methods: {
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
      this.queryParams.versionId = "";
      this.getList();
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    changeComputer() {
      this.getList();
    },
    checkSelectable(row) {
      if (row.computerStatus) {
        return false;
      } else if (this.checkRole(["DATA_MANAGER"]) && row.status === 4) {
        return true;
      } else if (
        !this.checkRole(["DATA_MANAGER", "product"]) &&
        row.status == 1
      ) {
        return true;
      } else if (
        this.checkRole(["product"]) &&
        (row.status === 2 || row.status === 4)
      ) {
        return true;
      }
    },
    handleAuthChange(row, status) {
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
    // 重置审核
    handleResetCheck(row) {
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
    handleUpdate(row, typeName = "") {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.changeCategory2(row.categoryId);
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.form.firmwareConf = row.firmwareConf
        ? row.firmwareConf
        : {};
      if (this.$refs.compUpdate.form.firmwareConf.mid) {
        this.$refs.compUpdate.changeMidValue(
          this.$refs.compUpdate.form.firmwareConf.mid,
          false
        );
      }

      this.$refs.compUpdate.form.firmwareConf.fileConfId = row.id;
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.title = "修改";
      this.$refs.compUpdate.typeName = typeName;
      this.title = "修改";
    },
    handleRevocation(id) {
      fileCancel({ id }).then((res) => {
        let { code } = res;
        if (code == 200) {
          this.getList();
          this.msgSuccess("撤销成功！");
        }
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
</style>
