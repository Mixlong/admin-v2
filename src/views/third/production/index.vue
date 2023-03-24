<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryId">
        <el-select
          size="small"
          v-model="queryParams.category"
          @change="changeCategory"
          placeholder="请选择"
          clearable
          style="max-width: 140px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerId">
        <el-input
          style="max-width: 130px"
          placeholder="请输入型号"
          size="small"
          clearable
          v-model="queryParams.model"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="箱号" prop="computerId">
        <el-input
          style="max-width: 130px"
          placeholder="请输入型号"
          size="small"
          clearable
          v-model="queryParams.boxNo"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="订单号" prop="order">
        <el-input
          style="max-width: 130px"
          placeholder="请输入型号"
          size="small"
          clearable
          v-model="queryParams.order"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="SN" prop="status">
        <el-input
          style="max-width: 130px"
          v-model="queryParams.sn"
          placeholder="请输入SN"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间" prop="erp">
        <el-date-picker
          style="max-width: 300px"
          size="small"
          v-model="dateRange"
          type="daterange"
          unlink-panels
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
          @change="handleQuery"
        ></el-date-picker>
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
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="品类"
        prop="category"
        align="center"
        width="100"
      />
      <el-table-column label="型号" prop="model" align="center" />
      <el-table-column label="SN" prop="sn" align="center" />
      <el-table-column label="箱号" prop="boxNo" align="center" />
      <el-table-column label="订单号" prop="order" align="center" />
      <el-table-column
        label="装箱时间"
        prop="packageTime"
        align="center"
        width="130"
      />
      <el-table-column label="版本号" align="center">
        <el-table-column
          label="HW 版本号"
          prop="hwVersion"
          align="center"
        ></el-table-column>
        <el-table-column
          label="BOOT 版本号"
          prop="bootVersion"
          align="center"
        ></el-table-column>
        <el-table-column
          label="UI 版本号"
          prop="uiVersion"
          align="center"
        ></el-table-column>
        <el-table-column
          label="APP 版本号"
          prop="appVersion"
          align="center"
        ></el-table-column>
      </el-table-column>
      <el-table-column label="测试环节" align="center">
        <el-table-column label="FCT" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 1)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="半成品" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 2)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="FQC" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 3)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="防水" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 4)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="配置工位" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 5)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="老化测试" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 6)"
            >查看</el-button
          >
        </el-table-column>
        <el-table-column label="OQC测试" align="center">
          <el-button
            slot-scope="scope"
            type="text"
            @click="onSeeDetail(scope.row.id, 7)"
            >查看</el-button
          >
        </el-table-column>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
    <CompUpdate ref="compUpdate" :dictList="dictList" />
    <!-- 查看详情 -->
    <!-- <com-detail ref="comDetail" :comName="comName" /> -->
    <el-dialog
      title="详情"
      :visible.sync="ditailShow"
      width="780px"
      append-to-body
    >
      <component :is="comName" :dataList="dataList" />
    </el-dialog>
  </div>
</template>

<script>
import {
  categoryComputerDict,
  editFileConfig,
  computerDictList,
  productList,
  agingList,
  confList,
  fctList,
  fqcList,
  oqcList,
  undoneList,
  waterProofList,
} from "@/api/third/fileConfig";

import axios from "axios";
import CompUpdate from "./components/update";
export default {
  components: {
    CompUpdate,
    "com-detail": () => import("./components/detail.vue"),
    aging: () => import("./components/aging.vue"),
    "see-detail": () => import("./components/seeDetail.vue"),
  },
  name: "BikeFileConfig",
  data() {
    return {
      ditailShow: false,
      dataList: [],
      comName: null,
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
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
      statusOptions: [
        { key: "待上传 ", value: 0 },
        { key: "待审核", value: 1 },
        { key: "已审核", value: 2 },
        { key: "未通过", value: 3 },
      ],
      fileTypeList: [],
      fileListCover: [],
      auth: { id: undefined, why: "", idList: [] },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        category: "",
        model: "",
        order: "",
        sn: "",
        beginTime: "",
        endTime: "",
      },
      similarList: [],
      disabledName: "",
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      timeVal: "",
    };
  },
  created() {
    const { orderId } = this.$route.query;
    if (orderId) {
      this.queryParams.order = orderId;
    }
  },
  mounted() {
    categoryComputerDict().then((response) => {
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
    onSeeDetail(id, type) {
      this.comName = type === 6 ? "aging" : "see-detail";
      switch (type) {
        case 1:
          this.getFctList(id);
          break;
        case 2:
          this.getUndoneList(id);
          break;
        case 3:
          this.getFqcList(id);
          break;
        case 4:
          this.getWaterProofList(id);
          break;
        case 5:
          this.getConfList(id);
          break;
        case 6:
          this.getAgingList(id);
          break;
        case 7:
          this.getOqcList(id);
          break;
      }
      this.ditailShow = true;
    },
    // 获取老化测试报告
    getAgingList(id) {
      agingList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // 获取配置工位报告
    getConfList(id) {
      confList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // fqc
    getFqcList(id) {
      fqcList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // 获取fct测试报告
    getFctList(id) {
      fctList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // 获取oqc测试报告
    getOqcList(id) {
      oqcList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // 获取半成品测试报告
    getUndoneList(id) {
      undoneList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    // 获取防水测试报告
    getWaterProofList(id) {
      waterProofList({ devProductionId: id }).then((res) => {
        this.dataList = [res.data];
      });
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      productList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    changeCategory() {
      this.queryParams.computerId = "";
      this.getList();
    },
    changeComputer(val) {
      this.getList();
    },
    changeStatus(val) {
      this.getList();
    },
    downloadFile(url) {
      axios({
        method: "get",
        url,
        responseType: "arraybuffer",
      }).then((res) => {
        let headers = res.headers;
        let blob = new Blob([res.data], {
          type: headers["content-type"],
        });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        let i = url.lastIndexOf("/");
        let fileName = url.slice(i + 1);

        link.download = fileName;
        link.click();
      });
    },
    checkSelectable(row) {
      return row.status == 1;
    },
    handleAuthChange(row) {
      this.auth.why = "";
      this.auth.id = row.id;
      this.auth.why = row.why;
      this.auth.idList = [];

      this.$refs.compUpdate
        .changeCategory2(row.categoryId)
        .then((computerFormOptions) => {
          computerDictList({
            categoryId: row.categoryId,
            type: row.type,
            status: 1,
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
      if (this.dateRange) {
        this.queryParams.beginTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.beginTime = "";
        this.queryParams.endTime = "";
      }
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        p: 1,
        l: 20,
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
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
      this.$refs.compUpdate.boleConfig =
        row.type == "boot_file" ||
        row.type == "app_file" ||
        row.type == "ui_data";
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.title = "修改";
      this.title = "修改";
    },
    handleRevocation(row) {
      editFileConfig(row).then((res) => {
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
