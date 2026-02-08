<template>
  <div class="comprehensive-report">
    <!-- 筛选条件 -->
    <el-form :model="filterParams" inline class="search-form" size="mini">
      <el-form-item label="年份">
        <el-date-picker v-model="filterParams.year" type="year"  size="mini" placeholder="请选择" value-format="yyyy" clearable style="width: 100px" @change="handleYearMonthChange" />
      </el-form-item>
      <el-form-item label="月份">
        <el-select v-model="filterParams.month" placeholder="请选择" size="mini" clearable style="width:90px" @change="handleYearMonthChange">
          <el-option v-for="m in 12" :key="m" :label="m" :value="String(m).padStart(2, '0')" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="-"   size="mini"   start-placeholder="开始日" end-placeholder="结束日" value-format="yyyy-MM-dd" clearable style="width: 220px" @change="handleDateRangeChange" />
      </el-form-item>
      <el-form-item label="客退类型">
        <el-select v-model="filterParams.afterType" placeholder="请选择" clearable style="width: 120px" size="mini">
          <el-option label="大货" :value="1" />
          <el-option label="样品" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户">
        <TypedSelectLoadMore v-model="filterParams.customerId" type="customer" placeholder="请选择" custom-style="width: 150px" clearable />
      </el-form-item>
      <el-form-item label="品类">
        <TypedSelectLoadMore v-model="filterParams.categoryId" type="category" placeholder="请选择" custom-style="width: 120px" clearable />
      </el-form-item>
      <el-form-item label="一级问题">
        <el-select v-model="filterParams.confirmMajorClass" placeholder="请选择" clearable style="width: 120px" @change="handleMajorClassChange">
          <el-option v-for="dict in majorClassOptions" :key="dict.value" :label="dict.label" :value="dict.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="二级问题">
        <el-select v-model="filterParams.confirmMinorClass" placeholder="请选择" clearable style="width: 120px" :disabled="!filterParams.confirmMajorClass">
          <el-option v-for="dict in filteredMinorOptions" :key="dict.value" :label="dict.label" :value="dict.label" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="fetchData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 4个帕累托图 -->
    <div class="charts-grid" v-loading="loading">
      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">一级问题统计</span>
        </div>
        <div class="chart-container">
          <div ref="majorClassChart" class="chart"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">二级问题统计</span>
        </div>
        <div class="chart-container">
          <div ref="minorClassChart" class="chart"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">客户统计</span>
        </div>
        <div class="chart-container">
          <div ref="customerChart" class="chart"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">品类统计</span>
        </div>
        <div class="chart-container">
          <div ref="categoryChart" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { getComprehensiveReport } from "@/api/third/sale";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore/index.vue";

export default {
  name: "ComprehensiveReport",
  components: { TypedSelectLoadMore },
  dicts: ["after_problem_major_class", "after_problem_minor_class"],
  data() {
    return {
      loading: false,
      dateRange: [],
      filterParams: {
        year: "",
        month: "",
        startDate: "",
        endDate: "",
        afterType: "",
        customerId: "",
        categoryId: "",
        confirmMajorClass: "",
        confirmMinorClass: "",
      },
      // 图表实例
      charts: {
        majorClass: null,
        minorClass: null,
        customer: null,
        category: null,
      },
      // 保存图表原始数据用于点击查找
      chartData: {
        customerList: [],
        categoryList: [],
      },
    };
  },
  computed: {
    // 一级问题选项（从字典获取，过滤掉"未复现"和"客户误判"）
    majorClassOptions() {
      const excludeLabels = ["未复现", "客户误判"];
      const options = this.dict?.type?.after_problem_major_class || [];
      return options.filter((item) => !excludeLabels.includes(item.label));
    },
    // 过滤后的二级问题选项（根据一级问题，过滤掉"客户问题"）
    filteredMinorOptions() {
      const majorDict = this.dict?.type?.after_problem_major_class || [];
      const minorDict = this.dict?.type?.after_problem_minor_class || [];
      const normalize = (val) => (val === undefined || val === null ? "" : String(val).trim().toLowerCase());
      if (!this.filterParams.confirmMajorClass) {
        return [];
      }
      const selectedMajorNormalized = normalize(this.filterParams.confirmMajorClass);
      const selectedMajor = majorDict.find((item) => normalize(item.label) === selectedMajorNormalized || normalize(item.value) === selectedMajorNormalized) || {};
      const selectedMajorLabel = normalize(selectedMajor.label || this.filterParams.confirmMajorClass);
      const selectedMajorValue = normalize(selectedMajor.value);
      // 过滤掉"客户问题"
      const excludeLabels = ["客户问题"];
      return minorDict.filter((item) => {
        // 排除特定选项
        if (excludeLabels.includes(item.label)) {
          return false;
        }
        // 兼容不同的字典数据结构
        const remarkRaw = item.raw?.remark ?? item.raw?.dictRemark ?? item.remark ?? item.dictRemark ?? "";
        const remarkList = remarkRaw.split(/[,，]/).map((v) => normalize(v)).filter(Boolean);
        if (remarkList.length === 0) {
          return false;
        }
        return remarkList.some((remark) => remark === selectedMajorLabel || (selectedMajorValue && remark === selectedMajorValue));
      });
    },
  },
  mounted() {
    this.initCharts();
    this.fetchData();
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    Object.values(this.charts).forEach((chart) => chart?.dispose());
  },
  methods: {
    initCharts() {
      this.$nextTick(() => {
        this.charts.majorClass = echarts.init(this.$refs.majorClassChart);
        this.charts.minorClass = echarts.init(this.$refs.minorClassChart);
        this.charts.customer = echarts.init(this.$refs.customerChart);
        this.charts.category = echarts.init(this.$refs.categoryChart);
        // 绑定点击事件
        this.bindChartClickEvents();
      });
    },
    // 绑定图表点击事件
    bindChartClickEvents() {
      // 一级问题图表点击
      this.charts.majorClass?.on("click", (params) => {
        if (params.seriesType === "bar") {
          this.filterParams.confirmMajorClass = params.name;
          // 清空二级问题选择
          this.filterParams.confirmMinorClass = "";
          this.fetchData();
        }
      });
      // 二级问题图表点击
      this.charts.minorClass?.on("click", (params) => {
        if (params.seriesType === "bar") {
          this.filterParams.confirmMinorClass = params.name;
          this.fetchData();
        }
      });
      // 客户图表点击 - 直接通过 dataIndex 获取对应数据的 businessId
      this.charts.customer?.on("click", (params) => {
        if (params.seriesType === "bar") {
          const customer = this.chartData.customerList[params.dataIndex];
          if (customer && customer.businessId) {
            this.filterParams.customerId = customer.businessId;
            this.fetchData();
          }
        }
      });
      // 品类图表点击 - 直接通过 dataIndex 获取对应数据的 businessId
      this.charts.category?.on("click", (params) => {
        if (params.seriesType === "bar") {
          const category = this.chartData.categoryList[params.dataIndex];
          if (category && category.businessId) {
            this.filterParams.categoryId = category.businessId;
            this.fetchData();
          }
        }
      });
    },
    handleResize() {
      Object.values(this.charts).forEach((chart) => chart?.resize());
    },
    handleYearMonthChange() {
      // 选择年份或月份时，清除日期范围
      if (this.filterParams.year || this.filterParams.month) {
        this.dateRange = [];
        this.filterParams.startDate = "";
        this.filterParams.endDate = "";
      }
      this.fetchData();
    },
    handleDateRangeChange(val) {
      if (val && val.length === 2) {
        this.filterParams.startDate = val[0];
        this.filterParams.endDate = val[1];
        // 选择日期范围时，清除年份和月份
        this.filterParams.year = "";
        this.filterParams.month = "";
      } else {
        this.filterParams.startDate = "";
        this.filterParams.endDate = "";
      }
      this.fetchData();
    },
    resetFilter() {
      this.dateRange = [];
      this.filterParams = {
        year: "",
        month: "",
        startDate: "",
        endDate: "",
        afterType: "",
        customerId: "",
        categoryId: "",
        confirmMajorClass: "",
        confirmMinorClass: "",
      };
      this.fetchData();
    },
    // 一级问题变化时清空二级问题
    handleMajorClassChange() {
      this.filterParams.confirmMinorClass = "";
    },
    async fetchData() {
      this.loading = true;
      try {
        const params = {};
        Object.keys(this.filterParams).forEach((key) => {
          if (this.filterParams[key]) {
            params[key] = this.filterParams[key];
          }
        });
        const res = await getComprehensiveReport(params);
        if (res.code === 200) {
          const data = res.data || {};
          // 保存原始数据用于点击查找
          this.chartData.customerList = data.customerList || [];
          this.chartData.categoryList = data.categoryList || [];
          // 渲染图表
          this.renderParetoChart(this.charts.majorClass, data.majorClassList || [], "一级问题", "#4874cb");
          this.renderParetoChart(this.charts.minorClass, data.minorClassList || [], "二级问题", "#4874cb");
          this.renderParetoChart(this.charts.customer, data.customerList || [], "客户", "#e54c5e");
          this.renderParetoChart(this.charts.category, data.categoryList || [], "品类", "#f2ba02");
        }
      } catch (error) {
        console.error("获取综合报表数据失败:", error);
      } finally {
        this.loading = false;
      }
    },
    renderParetoChart(chart, data, title, barColor) {
      if (!chart || !data.length) {
        chart?.setOption({ title: { text: "暂无数据", left: "center", top: "center", textStyle: { color: "#111111" } }, series: [] }, true);
        return;
      }
      const deepBlack = "#111111";
      const names = data.map((item) => item.name);
      const values = data.map((item) => item.num);
      const percents = data.map((item) => item.percent);
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross" },
          formatter: (params) => {
            const bar = params.find((p) => p.seriesType === "bar");
            const line = params.find((p) => p.seriesType === "line");
            return `${bar?.name}<br/>问题数量: ${bar?.value}<br/>累计占比: ${line?.value}%`;
          },
        },
        legend: { data: ["问题数量", "累计占比"], bottom: 25, textStyle: { color: deepBlack } },
        grid: { left: "3%", right: "4%", bottom: "20%", top: "10%", containLabel: true },
        dataZoom: [
          {
            type: "slider",
            show: data.length > 8,
            xAxisIndex: 0,
            start: 0,
            end: data.length > 8 ? Math.round((8 / data.length) * 100) : 100,
            height: 15,
            bottom: 5,
            borderColor: "transparent",
            backgroundColor: "#f5f5f5",
            fillerColor: "rgba(64, 158, 255, 0.2)",
            handleStyle: { color: "#409eff" },
          },
        ],
        xAxis: {
          type: "category",
          data: names,
          axisLabel: { color: deepBlack, rotate: 30, interval: 0, fontSize: 10 },
          axisLine: { show: true },
          splitLine: { show: false },
        },
        yAxis: [
          { type: "value", name: "问题数量", axisLabel: { color: deepBlack }, nameTextStyle: { color: deepBlack }, splitLine: { show: false } },
          { type: "value", name: "累计占比", max: 100, axisLabel: { color: deepBlack, formatter: "{value}%" }, nameTextStyle: { color: deepBlack }, splitLine: { show: false } },
        ],
        series: [
          {
            name: "问题数量",
            type: "bar",
            data: values,
            barWidth: "50%",
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: this.lightenColor(barColor, 10) },
                { offset: 0.5, color: barColor },
                { offset: 1, color: this.lightenColor(barColor, 10) },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            label: { show: true, position: "top", color: deepBlack, fontSize: 10 },
          },
          {
            name: "累计占比",
            type: "line",
            yAxisIndex: 1,
            data: percents,
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            itemStyle: { color: "#ff9800" },
            lineStyle: { width: 2 },
            label: { show: true, position: "top", formatter: "{c}%", fontSize: 9, color: deepBlack },
          },
        ],
      };
      chart.setOption(option, true);
    },
    // 颜色变亮
    lightenColor(hex, percent) {
      const num = parseInt(hex.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
      const B = Math.min(255, (num & 0x0000ff) + amt);
      return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    },
  },
};
</script>


<style lang="scss" scoped>
.comprehensive-report {
  margin-top: 16px;
}

.search-form {
  margin-bottom: 16px;
  padding: 18px 20px 0;
  background: #fff;
  border-radius: 4px;

  ::v-deep .el-form-item {
    margin-bottom: 18px;
    margin-right: 16px;
  }

  ::v-deep .el-form-item__label {
    color: #606266;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  border-radius: 8px;

  ::v-deep .el-card__header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
  }

  ::v-deep .el-card__body {
    padding: 16px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
