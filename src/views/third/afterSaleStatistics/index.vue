<template>
  <div class="app-container chart-box">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="客户名称" prop="customerName">
        <el-autocomplete
          v-model="queryParams.customerName"
          clearable
          style="width: 140px"
          :fetch-suggestions="querySearchAsync"
          placeholder="请选择客户名称"
          @change="handleQuery"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="品类" prop="categoryName">
        <el-select
          filterable
          allow-create
          clearable
          v-model="queryParams.categoryName"
          style="width: 140px"
          @change="changeCategory"
          placeholder="请选择品类"
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
          :loading="isCLoading"
          filterable
          remote
          clearable
          style="width: 140px"
          v-model="queryParams.computerName"
          placeholder="请选择型号"
          @change="handleQuery"
          :remote-method="getComputerNameList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item> -->
    </el-form>
    <h2 class="text-white margin-bottom-lg">当前状态</h2>
    <el-row type="flex" :gutter="20">
      <el-col :span="6">
        <!-- 问题根因状态 -->
        <problem-root-status :chartOption="problemRootStatusOption" />
      </el-col>
      <el-col :span="6">
        <!-- 不良仪表状态 -->
        <bad-meter-status :chartOption="badMeterStatusOption" />
      </el-col>
      <el-col :span="6">
        <!-- 新增不良投诉 -->
        <new-bad-complaint :chartOption="newBadComplaintOption" />
      </el-col>
      <el-col :span="6">
        <!-- 每周新增不良投诉数 -->
        <week-new-bad-complaint :chartOption="weekNewBadComplaintOption" />
      </el-col>
    </el-row>

    <h2 class="text-white margin-bottom-lg" style="margin-top: 150px">
      不良分布（OPEN汇总）
    </h2>
    <el-row type="flex" :gutter="20">
      <el-col :span="8">
        <!-- 所有客户排行 -->
        <all-customer-rank :chartOption="allCustomerRankOption" />
      </el-col>
      <el-col :span="8">
        <!-- 所有产品排行 -->
        <all-product-rank :chartOption="allProductRankOption" />
      </el-col>
      <el-col :span="8">
        <!-- 所有问题排行 -->
        <all-problem-rank :chartOption="allProblemRankOption" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { afterStatusList, afterBadList, afterTopList } from "@/api/third/sale";
import commonData from "@/mixins/commonData";
import chartOptions from "./chartOptoins";
import problemRootStatus from "@/views/dashboard/commonChart";
import badMeterStatus from "@/views/dashboard/commonChart";
import newBadComplaint from "@/views/dashboard/commonChart";
import weekNewBadComplaint from "@/views/dashboard/commonChart";
import allCustomerRank from "@/views/dashboard/commonChart";
import allProductRank from "@/views/dashboard/commonChart";
import allProblemRank from "@/views/dashboard/commonChart";

export default {
  mixins: [commonData, chartOptions],
  components: {
    problemRootStatus,
    badMeterStatus,
    newBadComplaint,
    weekNewBadComplaint,
    allCustomerRank,
    allProductRank,
    allProblemRank,
  },
  data() {
    return {
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        returnDate: undefined,
        customerName: null,
        computerName: undefined,
        status: null,
        state: undefined,
      },
    };
  },
  computed: {},
  created() {
    this.getAfterStatusList();
    this.getAfterBadList();
  },
  methods: {
    handleQuery() {},
    async getAfterStatusList() {
      const { data } = await afterStatusList();
      const {
        openNum,
        closeNum,
        computerList,
        todayNum,
        weekNum,
        moonNum,
        weekList,
      } = data;

      const problemRootStatusData = [
        { value: openNum, name: "OPEN" },
        { value: closeNum, name: "CLOSE" },
      ];

      const badMeterDir = {
        1: "研发处理中",
        2: "工厂处理中",
        3: "已发客户",
        4: "已报废",
      };

      let badMeterData = computerList.map(({ name, num }) => {
        return {
          name: badMeterDir[name],
          value: num,
        };
      });

      const weekBadData = [todayNum, weekNum, moonNum];

      let weekNewXData = [],
        weekNewBadData = [];
      weekList.sort((a, b) => a.name - b.name);

      weekList.forEach(({ name, num }) => {
        weekNewXData.push(`第${name}周`);
        weekNewBadData.push(num);
      });

      this.problemRootStatusOption.series[0].data = problemRootStatusData;

      this.badMeterStatusOption.series[0].data = badMeterData;

      this.newBadComplaintOption.series[0].data = weekBadData;

      this.weekNewBadComplaintOption.xAxis.data = weekNewXData;

      this.weekNewBadComplaintOption.series[0].data = weekNewBadData;
      console.log("我是父组件");
    },
    async getAfterBadList() {
      try {
        const { data } = await afterBadList();
        const { customerList, categoryList, questionList } = data;

        customerList.sort((a, b) => a.num - b.num);
        let xCustomerData = [],
          yLeftCustomerData = [],
          yRightCustomerData = [];
        customerList.forEach(({ name, num, percent }) => {
          xCustomerData.push(name);
          yLeftCustomerData.push(num);
          yRightCustomerData.push(percent.toFixed(2) * 100);
        });

        this.allCustomerRankOption.xAxis[0].data = xCustomerData;
        this.allCustomerRankOption.series[0].data = yLeftCustomerData;
        this.allCustomerRankOption.series[1].data = yRightCustomerData;

        categoryList.sort((a, b) => a.num - b.num);
        let xProductData = [],
          yLeftProductData = [],
          yRightProductData = [];
        categoryList.forEach(({ name, num, percent }) => {
          xProductData.push(name);
          yLeftProductData.push(num);
          yRightProductData.push(percent.toFixed(2) * 100);
        });

        this.allProductRankOption.xAxis[0].data = xProductData;
        this.allProductRankOption.series[0].data = yLeftProductData;
        this.allProductRankOption.series[1].data = yRightProductData;

        questionList.sort((a, b) => a.num - b.num);
        let xProblemData = [],
          yLeftProblemData = [],
          yRightProblemData = [];
        questionList.forEach(({ name, num, percent }) => {
          xProblemData.push(name);
          yLeftProblemData.push(num);
          yRightProblemData.push(percent.toFixed(2) * 100);
        });

        this.allProblemRankOption.xAxis[0].data = xProblemData;
        this.allProblemRankOption.series[0].data = yLeftProblemData;
        this.allProblemRankOption.series[1].data = yRightProblemData;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.chart-box {
  /deep/ .el-form-item__label {
    color: #fff;
  }
}
.app-container {
  background: rgba(51, 51, 51, 1);
}
</style>