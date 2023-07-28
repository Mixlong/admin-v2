<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          style="width: 160px"
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
      <el-form-item label="整机SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入整机SN"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          v-model="queryParams.customerOrderNo"
          placeholder="请输入客户订单号"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="箱号" prop="boxNo">
        <el-input
          v-model="queryParams.boxNo"
          placeholder="请输入箱号"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
      <el-table-column label="整机SN" prop="sn" align="center" />
      <el-table-column label="客户订单号" prop="customerOrderNo" align="center" />
      <el-table-column label="迪太订单号" prop="salesOrderNo" align="center" />
      <el-table-column label="箱号" prop="boxNo" align="center" />
      <el-table-column label="装箱时间" prop="packingTime" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.packingTime) }}
        </template>
      </el-table-column>
      <el-table-column label="版本信息" align="center" width=100>
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="配件信息" align="center" width=100>
        <template slot-scope="{ row }">
          <el-button type="text" @click="$router.push(`/www/PartInfoView/parts?sn=${row.sn}`)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="测试信息" align="center" width=100>
        <template slot-scope="{ row }">
          <el-button type="text" @click="$router.push(`/STS/stsTestResult?sn=${row.sn}`)">查看</el-button>
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

    <el-dialog
      title="版本信息"
      :visible.sync="isStsDetailShow"
      width="700px"         
      center
      append-to-body
      top="1vh"
    >
      <el-table :data="stsDetail" bordered height="450">
        <el-table-column
          label="环节"
          prop="process"
          width="120"
          align="center"
        />
        <el-table-column
          label="HW版本"
          prop="hwVersion"
          align="center"
        />
        <el-table-column label="UI版本" prop="uiVersion" align="center" />
        <el-table-column label="BOOT版本" prop="bootVersion" align="center" />
        <el-table-column label="APP版本" prop="appVersion" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>
  
  <script>
import { categoryComputerDict, recordList } from "@/api/third/fileConfig";

export default {
  name: "BikeFileConfig",
  data() {
    return {
      isStsDetailShow: false,
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dictList: [],
      brandList: [],
      testList: [],
      computerOptions: [],
      testDetail: [],
      stsDetail: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        processName: "",
        result: "",
      }
    };
  },
  created() {
    const { recordId } = this.$route.query;
    if (recordId) {
      this.queryParams.recordId = recordId;
    }
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });
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
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      recordList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 测试详情 
    seeDetail(row) {
      this.isStsDetailShow = true;

      this.stsDetail = row.list;
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
      this.queryParams.recordId = "";
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>