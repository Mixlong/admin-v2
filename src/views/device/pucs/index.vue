<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="PUCS名称" prop="pucsName">
        <el-input
          v-model="queryParams.pucsName"
          placeholder="请输入PUCS名称"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部署工厂" prop="factoryName">
        <el-select
          size="small"
          v-model="queryParams.factoryName"
          placeholder="请选择"
          @change="getList"
          clearable
        >
          <el-option
            placeholder="请选择部署工厂"
            v-for="item in factoryOptions"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="系列名称/型号" prop="type">
        <el-select
          size="small"
          v-model="queryParams.type"
          placeholder="请选择系列名称/型号"
          @change="getList"
          clearable
        >
          <el-option
            v-for="item in typeDictList"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
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
      </el-form-item>

      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-check"
            size="mini"
            :disabled="multiple"
            @click="handleStatusChange(0)"
            >启用</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-close"
            size="mini"
            :disabled="multiple"
            @click="handleStatusChange(1)"
            >禁用</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      border
      @selection-change="handleSelectionChange"
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="装备名称"
        align="center"
        prop="name"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="装备型号"
        align="center"
        prop="type"
        width="150"
        :formatter="fnFactoryType"
        show-overflow-tooltip
      />
      <el-table-column label="装备ID" align="center" prop="cpuId" show-overflow-tooltip />
      <el-table-column
        label="部署工厂"
        align="center"
        prop="factoryName"
        width="120"
        :formatter="fnFactoryName"
      />
      <el-table-column label="本地IP" align="center" prop="domainIp" width="100" />
      <el-table-column
        label="在测工序"
        align="center"
        prop="processName"
        width="90"
      />
      <el-table-column
        label="在测DUT"
        align="center"
        prop="dutName"
        :formatter="fnDutName"
        width="100"
      />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <span :class="[scope.row.status == 0 ? 'text-green' : 'text-red']">
            {{ scope.row.status == 0 ? "启用" : "禁用" }}
          </span>
          /
          <span :class="[scope.row.online == 1 ? 'text-green' : 'text-red']">
            {{ scope.row.online == 1 ? "在线" : "离线" }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" width="90">
        <template slot-scope="scope">
          <div
            v-for="(item, index) in stateList"
            :key="index"
            :class="[item.class]"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.stateNote"
              placement="top-end"
              v-if="scope.row.state == item.value && scope.row.state == 3"
            >
              <span>
                {{ item.key }}
              </span>
            </el-tooltip>
            <span v-else-if="scope.row.state == item.value">
              {{ item.key }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="实时日志" align="center" width="80">
        <template slot-scope="scope">
          <el-button type="text" @click="onSeeDetail(scope.row.id)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        header-align="center"
        class-name="small-padding fixed-width"
        align="center"
        fixed="right"
        width="160"
      >
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.status == 0 ? '禁用' : '启用'"
            placement="top-end"
          >
            <el-button
              type="text"
              :icon="
                scope.row.status == 0
                  ? 'el-icon-video-pause'
                  : 'el-icon-video-play'
              "
              :class="[scope.row.status == 0 ? 'text-red' : 'text-green']"
              @click="handleStatusChange(scope.row)"
              >{{ scope.row.status == 0 ? "" : "" }}</el-button
            >
          </el-tooltip>

          <Tooltip
            icon="el-icon-view"
            content="详情"
            @click="handleDetail(scope.row)"
          />

          <el-tooltip
            class="item"
            effect="dark"
            content="加载测试程序"
            placement="top-end"
            v-if="checkRole(['dev', 'admin'])"
          >
            <el-button
              icon="el-icon-magic-stick"
              type="text"
              class="text-mauve"
              @click="handleUpdateTestUpload(scope.row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            class="item font16"
            effect="dark"
            content="审核"
            placement="top-end"
            v-if="scope.row.state == 1 && checkRole(['test', 'admin'])"
          >
            <el-button
              icon="el-icon-coordinate"
              type="text"
              class="text-orange"
              @click="handleVerify(scope.row)"
            ></el-button>
          </el-tooltip>

          <div
            :class="{
              iflex: scope.row.testJs || scope.row.firmware,
            }"
            class="hidden"
          >
            <svg-icon
              icon-class="xiazai"
              class-name="card-panel-icon pointer margin-left-xs"
              @click="handleDownload(scope.row)"
            />
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
    <!-- <el-dialog
      title="请确认是否通过"
      :visible="authDialogVisible"
      width="40%"
      center
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" class="form-data">
 
        <el-form-item class="auth">
          <el-button @click="handleApprove(3)">不通过</el-button>
          <el-button type="primary" @click="handleApprove(2)">通过</el-button>
        </el-form-item>
      </el-form>
    </el-dialog> -->
    <DetailList ref="detailList" />
    <CompUpdate
      ref="compUpdate"
      :processOptions="processOptions"
      :dutOptions="dutOptions"
      :typeDictList="typeDictList"
      :factoryOptions="factoryOptions"
      :listComputerData="listComputerData"
      :pucsVersionData="pucsVersionData"
      :title="title"
      :type="updateType"
    />
    <FormUpload
      ref="compUpdateLok"
      :processOptions="processOptions"
      :dutOptions="dutOptions"
      :factoryOptions="factoryOptions"
      :title="title"
      :type="updateType"
    />
    <dutDetail :detailId="detailId" ref="dutDetail" />
  </div>
</template>

<script>
import {
  pucsList,
  pucsAuth,
  authLine,
  pucsState,
  getFileName,
  pucsLoadInfo,
  pucsVersion,
} from "@/api/pucs";
import { typeDictList } from "@/api/pucs/soft";
import { dictFactory } from "@/api/factory";

import { categoryComputerDict } from "@/api/third/fileConfig";
import DetailList from "./components/detail";
import CompUpdate from "./components/update";
import FormUpload from "./components/formUpload";
import { listModelDict } from "@/api/third/computer";
import axios from "axios";

export default {
  name: 'Pucs',
  components: {
    DetailList,
    CompUpdate,
    FormUpload,
    dutDetail: () => import("./components/dutDetail.vue"),
  },
  data() {
    return {
      authDialogVisible: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      formUpload: {},
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      processOptions: [],
      dutOptions: [],
      typeDictList: [],
      factoryOptions: [],
      listComputerData: [],
      pucsVersionData: [],
      updateType: 1,
      stateList: [
        { key: "待上传", value: 0, class: "text-cyan" },
        { key: "待审核", value: 1, class: "text-orange" },
        { key: "已审核", value: 2, class: "text-green" },
        { key: "已驳回", value: 3, class: "text-red" },
      ],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        pucsName: "",
        factoryName: "",
        type: "",
      },
      // 表单参数
      form: {},
      detailId: null,
    };
  },
  created() {
    this.getOptions();
    this.getTypeDictList();
    this.getListComputer();
    this.getPucsVersion();
  },
  methods: {
    onSeeDetail(id) {
      this.detailId = id;
      this.$refs.dutDetail.clearTxt();
      this.$refs.dutDetail.dialogVisible = true;
    },
    // 系列型号
    getTypeDictList() {
      typeDictList().then((res) => {
        this.typeDictList = res.data;
      });
    },
    // 产品型号
    getListComputer() {
      listModelDict().then((res) => {
        this.listComputerData = res.data;
      });
    },
    // 方案版本
    getPucsVersion() {
      pucsVersion().then((res) => {
        this.pucsVersionData = res.data;
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      pucsList(this.queryParams).then((response) => {
        let list = response.data.list;
        for (let key of list) {
          let dutIndex = this.dutOptions.findIndex(
            (item) => item.model == key.dutId
          );
          let proIndex = this.processOptions.findIndex(
            (item) => item.dictCode == key.processId
          );
          if (dutIndex > -1) {
            key.dutName = this.dutOptions[dutIndex].name;
          }
          if (proIndex > -1) {
            key.processName = this.processOptions[proIndex].dictLabel;
          }
        }
        this.list = list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleVerify(row) {
      this.title = "审核详情";
      this.updateType = 4;
      let params = Object.assign({}, row);
      this.$refs.compUpdateLok.form.id = params.id;
      this.$refs.compUpdateLok.getInfo();
      this.$refs.compUpdateLok.dialogVisible = true;
    },

    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "PUCS名称":
          this.handleUpdate(row);
          break;
        case "部署工厂":
          this.handleUpdateFactory(row);
          break;
        case "在测DUT":
          this.handleUpdateTest(row);
          break;
        case "生产工序":
          this.handleUpdateTest(row);
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        column.label == "PUCS名称" ||
        column.label == "部署工厂" ||
        column.label == "在测DUT" ||
        column.label == "生产工序"
      ) {
        return `cursor: pointer;`;
      }
    },
    getOptions() {
      axios
        .all([
          categoryComputerDict(),
          this.getDicts("pucs_process_label"),
          dictFactory(),
        ])
        .then((res) => {
          this.dutOptions = res[0].data;
          this.processOptions = res[1].data;
          this.factoryOptions = res[2].data;
          this.getList();
        });
    },
    // 用户状态修改
    handleStatusChange(row) {
      let data = [];
      let text = "";
      if (row == 0 || row == 1) {
        text = row === 0 ? "启用" : "禁用";
        data = this.ids.map((item) => {
          return { id: item, status: row };
        });
      } else {
        text = row.status === 0 ? "禁用" : "启用";
        let authData = { id: row.id, status: row.status == 0 ? 1 : 0 };
        data.push(authData);
      }

      this.$confirm("确认要" + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.loading = true;

        pucsAuth(data).then((response) => {
          this.msgSuccess(text + "成功");
          this.loading = false;
          this.getList();
        });
      });
    },

    handleOnlineChange(row) {
      let data = [];
      let text = "";
      if (row == 0 || row == 1) {
        text = row === 0 ? "在线" : "离线";
        data = this.ids.map((item) => {
          return { id: item, status: row };
        });
      } else {
        text = row.status === 0 ? "在线" : "离线";
        let authData = { id: row.id, status: row.status };
        data.push(authData);
      }

      this.$confirm('确认要"' + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          authLine(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        id: undefined,
        p: 1,
        l: 50,
        key: undefined,
      };
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
      this.multiple = !selection.length;
    },
    handleAuth(status) {
      let text = status === 0 ? "启用" : "停用";
      this.$confirm('确认要"' + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let data = [];
          for (let i = 0; i < this.ids.length; i++) {
            let authData = { id: this.ids[i], status: status };
            data.push(authData);
          }
          this.loading = false;
          authCategory(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          status = status === "0" ? "1" : "0";
        });
    },
    handleUpdate(row) {
      this.title = "修改PUCS名称";
      this.updateType = 3;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.dialogVisible = true;
    },
    //部署工厂
    handleUpdateFactory(row) {
      this.title = "更新部署工厂";
      this.updateType = 1;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.dialogVisible = true;
    },

    handleUpdateTest(row) {
      this.title = "在测DUT";
      this.updateType = 2;
      let params = Object.assign({}, row);
      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.dialogVisible = true;
    },

    handleUpdateTestUpload(row) {
      this.title = "加载测试程序";
      this.updateType = 4;
      let params = Object.assign({}, row);

      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleDetail(row) {
      this.$refs.detailList.getList(row);
    },
    // 系列
    fnFactoryType(row) {
      const data =
        row.type &&
        this.typeDictList.filter((item) => item.dictValue === row.type);
      return data && data[0].dictLabel;
    },
    fnFactoryName(row, c, val) {
      for (let key of this.factoryOptions) {
        if (key.id == row.factoryId) {
          return key.name;
        }
      }
    },
    fnDutName(row) {
      let data = this.dutOptions.filter((item) => item.id == row.dutCode);
      if (data.length) {
        return data[0].name;
      }
      return "";
    },
    async handleDownload(row) {
      let arr = [];
      if (row.firmware) {
        let res = await getFileName(row.firmware);
        arr.push(res.data.url);
      }
      if (row.testJs) {
        let res = await getFileName(row.testJs);
        arr.push(res.data.url);
      }
      this.zipFile(arr.toString(), "PUCS下载文件");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
