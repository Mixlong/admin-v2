<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          style="max-width: 140px"
          @change="changeCategory"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          clearable
          placeholder="请选择型号"
          @change="getList"
          style="width: 160px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="箱号" prop="boxNo">
        <el-input
          v-model="queryParams.boxNo"
          placeholder="请输入箱号"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          v-model="queryParams.customerOrderNo"
          placeholder="请输入客户订单号"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入SN"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="时间" prop="erp">
        <el-date-picker
          style="max-width: 300px"
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
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" />
      <el-table-column label="整机 SN" prop="sn" align="center" />
      <el-table-column
        label="客户订单号"
        prop="customerOrderNo"
        align="center"
      />
      <el-table-column label="迪太订单号" prop="salesOrderNo" align="center" />
      <el-table-column label="箱号" prop="boxNo" align="center" />
      <el-table-column
        label="装箱时间"
        prop="packingTime"
        align="center"
        width="135"
      />
      <el-table-column label="版本信息" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="onSeeDetail(scope.row.list)"
            >查看</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="配件信息" align="center" width="100">
        <template>
          <el-button type="text">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="测试信息" align="center" width="100">
        <template>
          <el-button type="text">查看</el-button>
        </template>
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

    <el-dialog
      title="版本信息"
      :visible.sync="ditailShow"
      width="780px"
      append-to-body
    >
      <el-table :data="versionDetail" bordered>
        <el-table-column label="APP版本" prop="appVersion" />
        <el-table-column label="UI版本" prop="uiVersion" />
        <el-table-column label="boot版本" prop="bootVersion" />
        <el-table-column label="hw版本" prop="hwVersion" />
        <el-table-column label="工序" prop="process" />
        <el-table-column label="创建者" prop="createBy" />
        <el-table-column label="创建时间" prop="createTime">
          <template slot-scope="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  categoryComputerDict,
  editFileConfig,
  agingList,
  confList,
  fctList,
  fqcList,
  oqcList,
  undoneList,
  waterProofList,
  recordList,
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
      versionDetail: [],
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
    onSeeDetail(list) {
      this.versionDetail = list;
      this.ditailShow = true;
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      recordList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
      this.getList();
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0].computerList;
    },
    /** 搜索按钮操作 */
    handleQuery() {
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
    }
  },
};
</script>
