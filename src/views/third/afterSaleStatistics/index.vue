<template>
  <div class="app-container chart-box">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="客户名称" prop="customerId">
        <select-loadMore
          v-model="queryParams.customerId"
          style="width: 100%"
          :data="customerData.data"
          :page="customerData.page"
          :hasMore="customerData.more"
          dictLabel="name"
          dictValue="id"
          :request="getCustomerList"
          placeholder="请选择客户名称"
        >
        </select-loadMore>
      </el-form-item>
      <el-form-item label="品类" prop="categoryId">
        <select-loadMore
          v-model="queryParams.categoryId"
          style="width: 100%"
          :data="categoryData.data"
          :page="categoryData.page"
          :hasMore="categoryData.more"
          dictLabel="name"
          dictValue="id"
          :request="getCategoryList"
          placeholder="请选择产品品类"
        >
        </select-loadMore>
      </el-form-item>

      <el-form-item label="不良类型" prop="result">
        <select-loadMore
          v-model="queryParams.result"
          style="width: 100%"
          :data="afterSaleData.data"
          :page="afterSaleData.page"
          :hasMore="afterSaleData.more"
          dictLabel="result"
          dictValue="result"
          :request="getAfterSaleList"
          placeholder="请选择不良类型"
        >
        </select-loadMore>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="el-icon-crop" v-mThrottle="screenshot">
          截图
        </el-button>
      </el-form-item>
    </el-form>

    <div ref="snaphootBoxRef" class="padding-xs">
      <h1 class="text-white margin-bottom text-center font45" v-if="isCopyDate">
        {{ currentCopyDate }}
      </h1>
      <template v-if="isShow">
        <h2 class="text-white margin-bottom">当前状态</h2>
        <el-row type="flex" :gutter="20">
          <el-col :span="8">
            <!-- 问题根因状态 -->
            <problem-root-status :chartOption="problemRootStatusOption" />
          </el-col>
          <el-col :span="8">
            <!-- 不良仪表状态 -->
            <bad-meter-status :chartOption="badMeterStatusOption" />
          </el-col>
          <el-col :span="8">
            <!-- 新增不良投诉 -->
            <new-bad-complaint :chartOption="newBadComplaintOption" />
          </el-col>
        </el-row>
        <!-- 每周新增不良投诉数 -->
        <week-new-bad-complaint
          class="margin-top-lg"
          :chartOption="weekNewBadComplaintOption"
        />
        <h2 class="text-white margin-bottom" style="margin-top: 80px">
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

        <h2 class="text-white margin-bottom" style="margin-top: 80px">
          TOP问题排行
        </h2>
        <el-row type="flex" :gutter="20">
          <template v-if="!isTop1CustomerNameShow">
            <el-col :span="8">
              <!-- 产品排行 -->
              <product-rank-top1 :chartOption="productRankTop1Option" />
            </el-col>
            <el-col :span="8">
              <!-- 问题排行 -->
              <problem-rank-top1 :chartOption="problemRankTop1Option" />
            </el-col>
            <el-col :span="8">
              <!-- 机型问题排行 -->
              <model-rank-top1 :chartOption="modelProblemRankTop1Option" />
            </el-col>
          </template>
        </el-row>

        <el-row class="margin-top" type="flex" :gutter="20">
          <template v-if="!isTop2CustomerNameShow">
            <el-col :span="8">
              <!-- 产品排行 -->
              <product-rank-top2 :chartOption="productRankTop2Option" />
            </el-col>
            <el-col :span="8">
              <!-- 问题排行 -->
              <problem-rank-top2 :chartOption="problemRankTop2Option" />
            </el-col>
            <el-col :span="8">
              <!-- 机型问题排行 -->
              <model-rank-top2 :chartOption="modelProblemRankTop2Option" />
            </el-col>
          </template>
        </el-row>

        <el-row class="margin-top" type="flex" :gutter="20">
          <template v-if="!isTop3CustomerNameShow">
            <el-col :span="8">
              <!-- 产品排行 -->
              <product-rank-top3 :chartOption="productRankTop3Option" />
            </el-col>
            <el-col :span="8">
              <!-- 问题排行 -->
              <problem-rank-top3 :chartOption="problemRankTop3Option" />
            </el-col>
            <el-col :span="8">
              <!-- 机型问题排行 -->
              <model-rank-top3 :chartOption="modelProblemRankTop3Option" />
            </el-col>
          </template>
        </el-row>
      </template>
      <template v-else>
        <search-chart
          :chartOption="searchChartOption"
          height="450px"
        ></search-chart>
      </template>
    </div>
  </div>
</template>

<script>
import {
  afterStatusList,
  afterBadList,
  afterTopList,
  afterResultList,
  afterSearch,
  afterCategoryList,
} from "@/api/third/sale";
import { getCustomerList } from "@/api/order";

import commonData from "@/mixins/commonData";
import chartOptions from "./chartOptoins";
import problemRootStatus from "@/views/dashboard/commonChart";
import badMeterStatus from "@/views/dashboard/commonChart";
import newBadComplaint from "@/views/dashboard/commonChart";
import weekNewBadComplaint from "@/views/dashboard/commonChart";
import allCustomerRank from "@/views/dashboard/commonChart";
import allProductRank from "@/views/dashboard/commonChart";
import allProblemRank from "@/views/dashboard/commonChart";

import productRankTop1 from "@/views/dashboard/commonChart";
import problemRankTop1 from "@/views/dashboard/commonChart";
import modelRankTop1 from "@/views/dashboard/commonChart";

import productRankTop2 from "@/views/dashboard/commonChart";
import problemRankTop2 from "@/views/dashboard/commonChart";
import modelRankTop2 from "@/views/dashboard/commonChart";

import productRankTop3 from "@/views/dashboard/commonChart";
import problemRankTop3 from "@/views/dashboard/commonChart";
import modelRankTop3 from "@/views/dashboard/commonChart";

import searchChart from "@/views/dashboard/commonChart";

import html2canvas from "html2canvas";
import request from "@/utils/request";

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
    productRankTop1,
    problemRankTop1,
    modelRankTop1,
    productRankTop2,
    problemRankTop2,
    modelRankTop2,
    productRankTop3,
    problemRankTop3,
    modelRankTop3,
    searchChart,
  },
  data() {
    return {
      isCopyDate: false,
      isShow: true,
      isTop1CustomerNameShow: false,
      isTop2CustomerNameShow: false,
      isTop3CustomerNameShow: false,
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      afterSaleData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        customerId: undefined,
        categoryId: undefined,
        result: undefined,
      },
    };
  },
  computed: {
    currentCopyDate() {
      return this.moment().format("YYYY-MM-DD");
    },
  },
  watch: {
    "queryParams.customerId"(customerId) {
      if (customerId) {
        this.queryParams.categoryId = "";
        this.categoryData.data = [];
      }
    },
  },
  directives: {
    mThrottle: {
      bind(el, binding) {
        const throttle = (fn, delay = 500) => {
          let timer = null;
          return (...args) => {
            if (timer) return;
            timer = setTimeout(() => {
              fn.apply(this, args);
              timer = null;
            }, delay);
          };
        };

        el.addEventListener("click", throttle(binding.value));
      },
    },
  },
  created() {
    this.getAfterStatusList();
    this.getAfterBadList();
    this.getAfterTopList();
  },
  methods: {
    handleQuery() {
      const paramsLen = Object.values(this.queryParams).filter(
        (item) => item !== undefined && item !== ""
      ).length;

      if (paramsLen < 2) {
        return this.msgError("至少选择两个过滤条件");
      }

      this.resetChartData(this.searchChartOption);

      afterSearch(this.queryParams).then((res) => {
        this.isShow = false;
        if (res.data.length) {
          this.searchChartOption.title.text = "";
          this.setTopChartData(res.data, this.searchChartOption);
        } else {
          this.searchChartOption.title.text = "暂无数据";
        }
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.isShow = true;
      this.resetForm("queryForm");
    },
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
    },
    async getAfterBadList() {
      try {
        const { data } = await afterBadList();
        const { customerList, categoryList, questionList } = data;

        let xCustomerData = [],
          yLeftCustomerData = [],
          yRightCustomerData = [];
        customerList.forEach(({ name, num, percent }) => {
          xCustomerData.push(name);
          yLeftCustomerData.push(num);
          yRightCustomerData.push(Math.ceil(percent * 100));
        });

        this.allCustomerRankOption.xAxis[0].data = xCustomerData;
        this.allCustomerRankOption.series[0].data = yLeftCustomerData;
        this.allCustomerRankOption.series[1].data = yRightCustomerData;

        let xProductData = [],
          yLeftProductData = [],
          yRightProductData = [];
        categoryList.forEach(({ name, num, percent }) => {
          xProductData.push(name);
          yLeftProductData.push(num);
          yRightProductData.push(Math.ceil(percent * 100));
        });

        this.allProductRankOption.xAxis[0].data = xProductData;
        this.allProductRankOption.series[0].data = yLeftProductData;
        this.allProductRankOption.series[1].data = yRightProductData;

        let xProblemData = [],
          yLeftProblemData = [],
          yRightProblemData = [];
        questionList.forEach(({ name, num, percent }) => {
          xProblemData.push(name);
          yLeftProblemData.push(num);
          yRightProblemData.push(Math.ceil(percent * 100));
        });

        this.allProblemRankOption.xAxis[0].data = xProblemData;
        this.allProblemRankOption.series[0].data = yLeftProblemData;
        this.allProblemRankOption.series[1].data = yRightProblemData;
      } catch (error) {
        console.log(error);
      }
    },
    async getAfterTopList() {
      try {
        const { data } = await afterTopList();

        const top1CustomerName = data[0] && data[0].customerName;
        const top2CustomerName = data[1] && data[1].customerName;
        const top3CustomerName = data[2] && data[2].customerName;

        this.isTop1CustomerNameShow = this.Is_Empty(top1CustomerName);
        this.isTop2CustomerNameShow = this.Is_Empty(top2CustomerName);
        this.isTop3CustomerNameShow = this.Is_Empty(top3CustomerName);

        // top1
        this.productRankTop1Option.title.text = `TOP1: ${top1CustomerName}产品排行`;
        this.problemRankTop1Option.title.text = `${top1CustomerName}问题排行`;
        this.modelProblemRankTop1Option.title.text = `${top1CustomerName}机型问题排行`;

        const top1CategoryList = data[0] && data[0].categoryList;
        const top1QuestionList = data[0] && data[0].questionList;
        const top1ComputerList = data[0] && data[0].computerList;

        this.setTopChartData(top1CategoryList, this.productRankTop1Option);
        this.setTopChartData(top1QuestionList, this.problemRankTop1Option);
        this.setTopChartData(top1ComputerList, this.modelProblemRankTop1Option);

        // top2
        this.productRankTop2Option.title.text = `TOP2: ${top2CustomerName}产品排行`;
        this.problemRankTop2Option.title.text = `${top2CustomerName}问题排行`;
        this.modelProblemRankTop2Option.title.text = `${top2CustomerName}机型问题排行`;

        const top2CategoryList = data[1] && data[1].categoryList;
        const top2QuestionList = data[1] && data[1].questionList;
        const top2ComputerList = data[1] && data[1].computerList;

        this.setTopChartData(top2CategoryList, this.productRankTop2Option);
        this.setTopChartData(top2QuestionList, this.problemRankTop2Option);
        this.setTopChartData(top2ComputerList, this.modelProblemRankTop2Option);

        // top3
        this.productRankTop3Option.title.text = `TOP3: ${top3CustomerName}产品排行`;
        this.problemRankTop3Option.title.text = `${top3CustomerName}问题排行`;
        this.modelProblemRankTop3Option.title.text = `${top3CustomerName}机型问题排行`;

        const top3CategoryList = data[2] && data[2].categoryList;
        const top3QuestionList = data[2] && data[2].questionList;
        const top3ComputerList = data[2] && data[2].computerList;

        this.setTopChartData(top3CategoryList, this.productRankTop3Option);
        this.setTopChartData(top3QuestionList, this.problemRankTop3Option);
        this.setTopChartData(top3ComputerList, this.modelProblemRankTop3Option);
      } catch (error) {
        console.log(error);
      }
    },
    resetChartData(options, xAxisIndex = 0) {
      options.xAxis[xAxisIndex].data = [];
      options.series[0].data = [];
      options.series[1].data = [];
    },
    setTopChartData(dataList, options, xAxisIndex = 0) {
      dataList &&
        dataList.forEach(({ name, num, percent }) => {
          options.xAxis[xAxisIndex].data.push(name);
          options.series[0].data.push(num);
          options.series[1].data.push(Math.ceil(percent * 100));
        });
    },
    getCustomerList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerData.data = [...this.customerData.data, ...list];
          } else {
            this.customerData.data = list;
          }
          this.customerData.more = pageNum * pageSize < total;
          this.customerData.page = pageNum;
          resolve();
        });
      });
    },
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      const { customerId } = this.queryParams;
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword,
          customerId,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.categoryData.data = [...this.categoryData.data, ...list];
          } else {
            this.categoryData.data = list;
          }
          this.categoryData.more = pageNum * pageSize < total;
          this.categoryData.page = pageNum;
          resolve();
        });
      });
    },
    getAfterSaleList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterResultList({
          p: page,
          result: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.afterSaleData.data = [...this.afterSaleData.data, ...list];
          } else {
            this.afterSaleData.data = list;
          }
          this.afterSaleData.more = pageNum * pageSize < total;
          this.afterSaleData.page = pageNum;
          resolve();
        });
      });
    },
    screenshot() {
      this.isCopyDate = true;
      const loading = this.$loading({
        lock: true,
        text: "页面生成中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      this.$nextTick(() => {
        html2canvas(this.$refs.snaphootBoxRef, {
          useCORS: true,
          logging: false,
          backgroundColor: "#333",
        })
          .then((canvas) => {
            const url = canvas.toDataURL("image/png");
            this.downloadImg(url, `售后统计表-${this.currentCopyDate}`);
          })
          .finally(() => {
            this.isCopyDate = false;
            loading.close();
          });
      });
    },
    downloadImg(url, fileName = +new Date()) {
      let link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    },
    // 快照
    screenshot1() {
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(w, h);
      const numChunks = Math.ceil(h / window.innerHeight);
      const chunks = Array.from({ length: numChunks }, (_, i) => {
        this.captureChunk(
          i * window.innerHeight,
          i === numChunks - 1 ? h % window.innerHeight : window.innerHeight
        );
      });
      Promise.all(chunks).then((results) => {
        results.forEach((result) => {
          imageData.data.set(result.data, result.offset * w * 4);
        });
        ctx.putImageData(imageData, 0, 0);
        const img = canvas.toDataURL("image/png");
        console.log(img);
      });
    },
    captureChunk(offset, height) {
      return new Promise((resolve) => {
        const w = window.innerWidth;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.onload = () => {
          ctx.drawImage(image, 0, -offset);
          resolve({ data: ctx.getImageData(0, 0, w, height).data, offset });
        };
        image.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${window.innerHeight}" style="position:absolute;top:-${offset}px">${document.documentElement.outerHTML}</svg>`;
      });
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