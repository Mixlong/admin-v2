<template>
  <div class="app-container chart-box">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="日期" prop="type">
        <el-select v-model="queryParams.type" @change="getRecordDataReportList">
          <el-option
            v-for="(value, key) in dateList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="品类" prop="categoryName">
        <select-loadMore
          v-model="queryParams.categoryName"
          style="width: 100%"
          :data="categoryData.data"
          :page="categoryData.page"
          :hasMore="categoryData.more"
          dictLabel="name"
          dictValue="name"
          :request="getCategoryList"
          placeholder="请选择产品品类"
        >
        </select-loadMore>
      </el-form-item>

      <el-form-item label="线号" prop="lineNum">
        <el-select
          v-model="queryParams.lineNum"
          clearable
          size="mini"
          placeholder="请选择线号"
        >
          <el-option
            v-for="(dict, index) in testLineList"
            :key="index"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="getRecordDataReportList"
        >
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
      <el-row type="flex" :gutter="20">
        <el-col :span="12">
          <!-- 维修状态不良數量 -->
          <problem-root-status :chartOption="problemRootStatusOption" />
        </el-col>
        <el-col :span="12">
          <!-- 线号不良数量 -->
          <bad-meter-status :chartOption="badMeterStatusOption" />
        </el-col>
      </el-row>
      <!-- 每周新增不良投诉数 -->
      <week-new-bad-complaint
        v-if="isDateTypeShow"
        class="margin-top-lg"
        :chartOption="weekNewBadComplaintOption"
      />

      <h2 class="text-white margin-bottom" style="margin-top: 80px">
        {{ dateType }} - 维修不良: 按线号分布
      </h2>
      <el-row :gutter="20">
        <el-col :lg="8">
          <!-- 总体不良分布 -->
          <all-customer-rank :chartOption="allCustomerRankOption" />
        </el-col>
        <el-col :lg="8" class="default_gap">
          <!-- 一线不良分布 -->
          <all-product-rank :chartOption="allProductRankOption" />
        </el-col>
        <el-col :lg="8">
          <!-- 二线不良分布 -->
          <all-problem-rank :chartOption="allProblemRankOption" />
        </el-col>
      </el-row>

      <h2 class="text-white margin-bottom" style="margin-top: 80px">
        {{ dateType }} - 维修不良: 按品类分布
      </h2>
      <el-row :gutter="20">
        <el-col :lg="8">
          <!-- 总仪表不良分布 -->
          <all-customer-rank :chartOption="allCategoryRankOption" />
        </el-col>
        <el-col :lg="8" class="default_gap">
          <!-- 彩屏仪表不良分布 -->
          <all-product-rank :chartOption="colorCategoryRankOption" />
        </el-col>
        <el-col :lg="8">
          <!-- 数码管仪表不良分布 -->
          <all-problem-rank :chartOption="displayCategoryRankOption" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { recordDataReport } from "@/api/third/testApi";
import { afterCategoryList } from "@/api/third/sale";

import commonData from "@/mixins/commonData";
import chartOptions from "./chartOptoins";
import problemRootStatus from "@/views/dashboard/commonChart";
import badMeterStatus from "@/views/dashboard/commonChart";
import newBadComplaint from "@/views/dashboard/commonChart";
import weekNewBadComplaint from "@/views/dashboard/commonChart";
import allCustomerRank from "@/views/dashboard/commonChart";
import allProductRank from "@/views/dashboard/commonChart";
import allProblemRank from "@/views/dashboard/commonChart";

import html2canvas from "html2canvas";

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
      // 线号
      testLineList: [],
      // 查询日期
      dateList: {
        0: "今日",
        1: "本周",
        2: "本月",
        3: "最近12个月",
      },
      isCopyDate: false,
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        type: "2",
        categoryName: undefined,
        lineNum: undefined,
      },
    };
  },
  computed: {
    currentCopyDate() {
      return this.moment().format("YYYY-MM-DD");
    },
    isDateTypeShow() {
      return this.queryParams.type !== "0";
    },
    dateType() {
      const { type } = this.queryParams;
      return this.dateList[type];
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
    // 线号
    this.getDicts("sts_test_line").then((res) => {
      this.testLineList = res.data;
    });

    // 数据
    this.getRecordDataReportList();
  },
  methods: {
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
    },
    async getRecordDataReportList() {
      const { data } = await recordDataReport(this.queryParams);
      const {
        total,
        processed,
        pending,
        list,
        dateList,
        lineTotalBadList,
        lineOneBadList,
        lineTwoBadList,
        categoryTotalList,
        categoryOneList,
        categoryTwoList,
      } = data;

      // 维修处理状态数量
      const problemRootStatusData = [
        { value: total, name: "总数" },
        { value: processed, name: "已处理" },
        { value: pending, name: "待处理" },
      ];

      // 线号不良数量
      let badMeterData = [];
      if (!this.Is_Empty(list)) {
        this.badMeterStatusOption.title.text = "线号不良数量";
        this.badMeterStatusOption.title.top = 10;
        badMeterData = list.map(({ name, num }) => {
          return {
            name,
            value: num,
          };
        });
      } else {
        this.noData(this.badMeterStatusOption);
      }

      // 不良数量
      const newBadComplaintX = [];
      const newBadComplaintY = [];

      if (!this.Is_Empty(dateList)) {
        dateList.forEach(({ name, num }) => {
          newBadComplaintX.push(name);
          newBadComplaintY.push(num);
        });
      }

      this.problemRootStatusOption.series[0].data = problemRootStatusData;

      this.badMeterStatusOption.series[0].data = badMeterData;

      this.weekNewBadComplaintOption.xAxis.data = newBadComplaintX;
      this.weekNewBadComplaintOption.series[0].data = newBadComplaintY;

      // 总体不良分布
      this.setChartsLine(lineTotalBadList, this.allCustomerRankOption);
      // 一线不良分布
      this.setChartsLine(lineOneBadList, this.allProductRankOption);
      // 二线不良分布
      this.setChartsLine(lineTwoBadList, this.allProblemRankOption);

      // 总仪表不良分布
      this.setChartsLine(categoryTotalList, this.allCategoryRankOption);
      // 彩屏仪表不良分布
      this.setChartsLine(categoryOneList, this.colorCategoryRankOption);
      // 数码管仪表不良分布
      this.setChartsLine(categoryTwoList, this.displayCategoryRankOption);
    },
    setChartsLine(sourceData, targetData) {
      const xData = [],
        yLData = [],
        yRData = [];

      if (!this.Is_Empty(sourceData)) {
        sourceData.forEach(({ name, num, percent }) => {
          xData.push(name);
          yLData.push(num);
          yRData.push(Math.ceil(percent * 100));
        });
      }

      targetData.xAxis[0].data = xData;
      targetData.series[0].data = yLData;
      targetData.series[1].data = yRData;
    },
    noData(targetData) {
      targetData.title.text = "暂无数据";
      targetData.title.top = "center";
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
    loadingFn() {
      return new Promise((resolve) => {
        const loading = this.$loading({
          lock: true,
          text: "页面生成中...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });

        setTimeout(() => {
          resolve(loading);
        }, 1000);
      });
    },
    async screenshot() {
      this.isCopyDate = true;
      const loading = await loadingFn();
      
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

@media screen and (max-width: 1200px) {
  .default_gap {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
