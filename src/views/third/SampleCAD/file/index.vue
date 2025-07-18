<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          clearable
          placeholder="请选择品类"
          @change="getList"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select
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
      <el-form-item label="客户" prop="customerName">
        <el-autocomplete
          v-model="queryParams.customerName"
          clearable
          :fetch-suggestions="querySearchAsync"
          placeholder="请选择客户"
          @change="getList"
        />
      </el-form-item>
      <el-form-item label="属性" prop="typeName">
        <el-input
          v-model="queryParams.typeName"
          clearable
          placeholder="请输入属性"
        />
      </el-form-item>
      <el-form-item label="送样单号" prop="number">
        <select-loadMore
          v-model="queryParams.number"
          :data="sampleNumberData.data"
          :page="sampleNumberData.page"
          :hasMore="sampleNumberData.more"
          :request="getSampleNumberList"
          placeholder="请选择送样单号"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="warning"
          :disabled="multiple"
          v-if="checkRole(['test', 'admin', 'DATA_MANAGER'])"
          @click="handleAuthBatchChange"
        >
          {{ batchCheck }}
        </el-button>
        <!-- <el-button v-if="checkRole(['product'])" type="danger"  :disabled="multiple"
          @click="handleResetCheck">重置审核</el-button> -->
      </el-form-item>
    </el-form>
    <el-table
      border
      v-loading="loading"
      :data="brandList"
      :row-key="getRowKeys"
      :height="tableHeight()"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :reserve-selection="true"
        :selectable="checkSelectable"
      />
      <el-table-column
        label="品类"
        prop="category"
        align="center"
        width="120"
        fixed="left"
      />
      <el-table-column
        label="送样单号"
        prop="number"
        align="center"
        width="160"
        fixed="left"
      >
        <span slot-scope="{ row }" v-NoData="row.number"></span>
      </el-table-column>
      <el-table-column
        label="客户"
        prop="customerName"
        align="center"
        width="120"
      />
      <el-table-column
        label="属性"
        prop="typeName"
        align="center"
        width="250"
      />
      <el-table-column label="属性描述" prop="content" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.type === 'simulate_script_file'" class="text-green">
            协议名称： {{ row.content }}
          </span>
          <span v-else v-NoData="row.content"></span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="updateBy"
        width="100"
      >
        <span slot-scope="{ row }" v-NoData="row.updateBy"></span>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="140">
        <span slot-scope="{ row }" v-NoData="row.updateTime"></span>
      </el-table-column>
      <el-table-column
        label="产品状态"
        prop="computerStatus"
        align="center"
        width="90"
      >
        <template slot-scope="{ row }">
          <el-tag :type="isComputerStatus(row.computerStatus)">
            {{ row.computerStatus ? "禁用" : "启用" }}
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
      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            v-if="checkRole(['dev', 'soft_internship', 'admin'])"
            @click="handleUpdate(scope.row)"
          />

          <el-tooltip
            class="item font16"
            effect="dark"
            content="审核"
            placement="top-end"
            v-if="scope.row.status == 1 && checkRole(['test', 'admin'])"
          >
            <el-button
              icon="el-icon-coordinate"
              type="text"
              class="text-orange"
              @click="handleAuthChange(scope.row, 1)"
            ></el-button>
          </el-tooltip>

          <el-tooltip
            v-if="isSResetCheck(scope.row)"
            class="item font16"
            effect="dark"
            content="重置审核"
            placement="top-end"
          >
            <el-button
              icon="el-icon-circle-check"
              type="text"
              @click="handleResetCheck(scope.row)"
            ></el-button>
          </el-tooltip>

          <!-- 模拟脚本文件 -->
          <template
            v-if="scope.row.type === 'simulate_script_file' && scope.row.file"
          >
            <Tooltip
              icon="el-icon-download"
              class="text-orange"
              :content="`下载${scope.row.content}脚本`"
              @click="zipFile(scope.row.file)"
            />
          </template>
          <template v-else>
            <el-tooltip
              v-if="isDownloadUrl(scope.row)"
              class="item font16"
              effect="dark"
              content="下载"
              placement="top-end"
            >
              <svg-icon
                icon-class="xiazai"
                class-name="card-panel-icon pointer margin-left-xs"
                @click="zipFile(scope.row.url)"
              />
            </el-tooltip>
          </template>

          <Tooltip
            icon="el-icon-refresh-right"
            content="撤回"
            class="margin-left-xs"
            v-if="scope.row.status == 4 && checkRole(['test', 'admin'])"
            @click="handleRevocation(scope.row.id)"
          />

          <Tooltip
            icon="el-icon-refresh-right"
            content="撤回"
            class="margin-left-xs"
            v-if="scope.row.status == 2 && checkRole(['DATA_MANAGER'])"
            @click="handleRevocation(scope.row.id)"
          />

          <!-- 批量同步 -->
          <!-- <Tooltip
            icon="el-icon-s-claim"
            content="批量同步"
            class="margin-left-xs"
            v-if="checkRole(['dev'])"
            @click="handleUpdate(scope.row, (isBatchSync = true))"
          /> -->
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
    <CompUpdate ref="compUpdate" :dictList="dictList" />
  </div>
</template>

<script>
import {
  sampleSoftList,
  sampleAuthFileConfig,
  sampleResetFileConfig,
  categoryComputerDict,
  sampleFileCancel,
} from "@/api/third/fileConfig";
import { sampleNumberList, listCustomer } from "@/api/third/sample";
import { mapGetters } from "vuex";
import CompUpdate from "./components/update";

export default {
  name: "CadFileConfig",
  components: {
    CompUpdate,
  },
  data() {
    return {
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
      fileTypeList: [],
      fileListCover: [],
      auth: { id: undefined, why: "", idList: [] },
      statusOptions: {
        0: "待上传",
        1: "待初审",
        2: "已审核",
        3: "未通过",
        4: "审核通过",
      },
      sampleNumberData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: undefined,
        status: undefined,
        customerName: undefined,
        number: undefined,
      },
      similarList: [],
      disabledName: "",
    };
  },
  computed: {
    ...mapGetters("commonData", ["isCheckType"]),
    batchCheck() {
      if (this.checkRole(["DATA_MANAGER"])) {
        return "批量终审";
      } else {
        return "批量初审";
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
          this.checkRole(["product"]) &&
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
            this.checkRole(["test", "dev", "factory"])) ||
            status === 2)
        );
      };
    },
  },
  watch: {
    $route: {
      handler(routePage) {
        if (routePage.name === "CadFileConfig") {
          const { number } = routePage.params;

          if (number) {
            this.queryParams.number = number;
          }

          this.handleQuery();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });
  },
  methods: {
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
    },
    getSampleNumberList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        sampleNumberList({
          p: page,
          num: keyword,
        }).then((res) => {
          let { list, total, pageNum, pageSize } = res.data;
          if (list.length) {
            list = list.map((item) => {
              return {
                label: item,
                value: item,
              };
            });
          }
          if (more) {
            this.sampleNumberData.data = [
              ...this.sampleNumberData.data,
              ...list,
            ];
          } else {
            this.sampleNumberData.data = list;
          }
          this.sampleNumberData.more = pageNum * pageSize < total;
          this.sampleNumberData.page = pageNum;
          resolve();
        });
      });
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      sampleSoftList(this.queryParams).then((response) => {
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
    },
    handleAuthBatchChange() {
      this.auth.why = "";
      this.auth.id = "";
      this.authDialogVisible = true;
    },
    getRowKeys(row) {
      return row.id;
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
          return sampleResetFileConfig(data);
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

      sampleAuthFileConfig(data).then((response) => {
        let { code } = response;
        if (code == 200) {
          this.authDialogVisible = false;
          this.msgSuccess("操作成功！");
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
      this.queryParams = {};
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row, isBatchSync) {
      // shit 改不动了
      this.$refs.compUpdate.reset();

      this.$refs.compUpdate.form = Object.assign(
        { idList: [], content: "", testInfo: [] },
        row
      );
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
      this.$refs.compUpdate.boleConfig =
        row.type == "boot_file" ||
        row.type == "app_file" ||
        row.type == "ui_data";
      this.$refs.compUpdate.isBatchSync = isBatchSync;
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.title = isBatchSync ? "批量同步" : "修改";
    },
    handleRevocation(id) {
      sampleFileCancel({ id }).then((res) => {
        let { code } = res;
        if (code == 200) {
          this.getList();
          this.msgSuccess("撤销成功！");
        }
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
</style>
