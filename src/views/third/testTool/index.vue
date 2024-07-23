<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" @submit.native.prevent>
      <el-form-item label="状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="请选择状态" clearable size="small" style="width: 185px"
          @change="handleQuery">
          <el-option :value="item.value" :label="item.label" v-for="(item, index) in stateList" :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="编号" prop="code">
        <el-input v-model.trim="queryParams.code" clearable placeholder="请输入编号"></el-input>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model.trim="queryParams.name" clearable placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="dut" prop="dut">
        <el-input v-model.trim="queryParams.dut" clearable placeholder="请输入dut"></el-input>
      </el-form-item>
      <el-form-item label="当前位置" prop="address">
        <el-input v-model.trim="queryParams.address" clearable placeholder="请输入当前位置"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

      <el-row :gutter="10" class="mt5 fr">
        <el-col :span="1.5">
          <el-button part="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" v-hasPermi="['testTool:add']"
            @click="handleAdd('compUpdate', '新增治具')">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="list" :cell-style="cellStyle" :height="tableHeight()" border
      @cell-click="cellClick">
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
              (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编号" prop="no" align="center" width="150" />
      <el-table-column label="名称" prop="name" align="center" width="130" />
      <el-table-column label="DUT" prop="type" align="center" width="150" />
      <el-table-column label="控制板" prop="controlBoard" align="center" width="150" />

      <el-table-column label="当前位置" align="center" prop="addr" width="150" />

      <el-table-column label="状态" align="center" prop="state" :formatter="fnStateName" width="80" />
      <el-table-column label="责任人" align="center" prop="principal" :formatter="fnPnName" width="100" />
      <el-table-column label="备注" align="center" prop="remark">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.remark"></div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="90">
        <template slot-scope="scope">
          <Tooltip v-if="scope.row.state == 0" icon="el-icon-right" content="借出"
            @click="handleAdd('lend', '', scope.row)" />
          <Tooltip :className="['text-pink']" v-if="scope.row.state == 1" icon="el-icon-back" content="归还"
            @click="handleAdd('return', '', scope.row)" />

          <Tooltip icon="el-icon-tickets" content="日志" @click="handleLog(scope.row)" />
          <Tooltip v-if="
            scope.row.state != 4 && checkPermi(['testTool:abandon', '*:*:*'])
          " icon="el-icon-video-pause" content="禁用" :className="['text-red']" @click="handleDelete(scope.row, 0)" />
          <Tooltip v-if="
            scope.row.state == 4 && checkPermi(['testTool:abandon', '*:*:*'])
          " icon="el-icon-video-play" content="启用" :className="['text-green']" @click="handleDelete(scope.row, 1)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />
    <CompUpdate ref="compUpdate" :pmDictListOptions="pmDictListOptions" />
    <Lend ref="lend" :pmDictListOptions="pmDictListOptions" />
    <Return ref="return" :pmDictListOptions="pmDictListOptions" />
    <Log ref="log" />
  </div>
</template>

<script>
import { toolList, toolDetail, toolDelete, toolUpdate, toolReturn } from "@/api/third/tool";
import CompUpdate from "./components/Update";
import Lend from "./components/Lend";
import Return from "./components/DReturn";
import Log from "./components/Log";
import { memberDictUser } from "@/api/system/user";
export default {
  name: 'TestTool',
  components: {
    Log,
    Return,
    Lend,
    CompUpdate,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 弹出层标题
      title: "",

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        state: undefined,
        code: '',
        name: '',
        dut: '',
        address: ''
      },
      stateList: [
        {
          value: 0,
          label: "闲置",
        },
        {
          value: 1,
          label: "使用中",
        },
        {
          value: 2,
          label: "升级中",
        },
        {
          value: 4,
          label: "禁用",
        },
      ],
      pmDictListOptions: [],
    };
  },

  mounted() {
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      toolList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (columnIndex == 1 ||
          columnIndex == 2 ||
          columnIndex == 4 ||
          columnIndex == 6 ||
          columnIndex == 7 ||
          columnIndex == 8) &&
        this.checkPermi(["testTool:add", "*:*:*"])
      ) {
        if (columnIndex != 0) {
          return `cursor: pointer;`;
        }
      }
    },
    /**
     * @description: 点击表格编辑内容
     * @param {*} row
     * @param {*} column
     * @param {*} cell
     * @param {*} event
     * @return {*}
     */
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "编号":
          this.handleUpdate(row, "no");
          break;
        case "名称":
          this.handleUpdate(row, "name");
          break;
        case "型号":
          this.handleUpdate(row, "type");
          break;
        case "名称":
          this.handleUpdate(row, "name");
          break;
        case "当前地址":
          this.handleUpdate(row, "addr");
          break;
        case "状态":
          this.handleUpdate(row, "state");
          break;
        case "责任人":
          this.handleUpdate(row, "principal");
          break;
        case "控制板":
          this.handleUpdate(row, "controlBoard");
          break;
        case "备注":
          this.handleUpdate(row, "remark");
          break;
        default:
          break;
      }
    },
    handleStartUsing(row) {
      let params = Object.assign({}, row);
      params.state = 0;
      toolUpdate(params).then((res) => {
        this.getList();
        this.$message({
          type: "success",
          message: "启用成功!",
        });
      });
    },
    handleDelete(row, type) {
      this.$confirm(`此操作将进行${type === 1 ? "启用" : "禁用"}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const fn = type === 1 ? toolReturn : toolDelete
        const data = type === 1 ? { id: row.id } : row.id
        fn(data).then(() => {
          this.getList();
          this.$message({
            type: "success",
            message: `${type === 1 ? "启用" : "禁用"}成功!`,
          });
        });
      }).catch(err => {
        console.log(err)
      })
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
    fnStateName(row) {
      if (row.state == 4) {
        return "禁用";
      }
      let { stateList } = this;
      let data = stateList.filter((item) => item.value == row.state);
      if (data.length) {
        return data[0].label;
      }
    },
    fnPnName(row) {
      let { pmDictListOptions } = this;
      if (!row.principal) {
        return " ";
      }
      let data = pmDictListOptions.filter(
        (item) => item.dictValue == row.principal
      );

      if (data.length) {
        return data[0].dictLabel;
      }
    },
    handleAdd(form, title, row) {
      this.$refs[form].dialogVisible = true;
      this.$refs[form].title = title;
      this.$refs[form].form = {};
      if (row) {
        this.$refs[form].form.id = row.id;
      }
      if (form == "compUpdate") {
        this.$refs[form].showName = "";
      }
    },
    handleUpdate(row, name) {
      if (this.checkPermi(["testTool:add", "*:*:*"])) {
        this.$refs["compUpdate"].dialogVisible = true;
        this.$refs["compUpdate"].title = "修改治具";
        if (row) {
          this.$refs["compUpdate"].form = Object.assign({}, row);
          this.$refs["compUpdate"].showName = name;
        }
      }
    },

    /**
     * @description: 日志显示
     * @param {*} row
     * @return {*}
     */
    handleLog(row) {
      toolDetail(row.id).then((res) => {
        this.$refs.log.list = res.data.logList;
        this.handleAdd("log");
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.addDateRange(this.queryParams, this.dateRange);
      let _this = this;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(function () {
        import("./js/Export2Excel").then((excel) => {
          const tHeader = [
            "编号",
            "名称",
            "DUT",
            "控制板",
            "当前位置",
            "状态",
            "责任人",
            "备注",
          ];
          const filterVal = [
            "no",
            "name",
            "type",
            "controlBoard",
            "addr",
            "state",
            "principal",
            "remark",
          ];

          const list = _this.list;
          const data = _this.formatJson(filterVal, list);
          excel.export_json_to_excel({
            header: tHeader, //表头 必填
            data, //具体数据 必填
            oldData: list,
            filename: "治具台账", //非必填
            autoWidth: true, //非必填
            bookType: "xlsx", //非必填
          });
        });
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "principal") {
            return this.fnPnName(v);
          } else if (j === "remark") {
            if (v[j]) {
              return v[j].replace(/<[^<>]+>/g, "\n").replace(/&nbsp;/gi, "");
            } else {
              return "";
            }
          } else if (j === "state") {
            return this.fnStateName(v);
          }
          return v[j];
        })
      );
    },
  },
};
</script>
