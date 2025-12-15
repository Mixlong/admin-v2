<template>
  <el-card class="report-card" shadow="hover">
    <div slot="header" class="card-header">
      <span class="card-title">每月客退趋势</span>
      <div class="filter-area">
        <el-date-picker
          v-model="filterYear"
          type="year"
          placeholder="选择年份"
          value-format="yyyy"
          clearable
          size="mini"
          @change="fetchData"
        />
      </div>
    </div>
    <div class="chart-container" v-loading="loading">
      <div ref="chartRef" class="chart"></div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from "echarts";
import { getMonthlyTrend } from "@/api/third/sale";

export default {
  name: "MonthlyTrendChart",
  data() {
    return {
      filterYear: "",
      loading: false,
      chart: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.chart = echarts.init(this.$refs.chartRef);
      this.fetchData();
    });
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.chart?.dispose();
  },
  methods: {
    handleResize() {
      this.chart?.resize();
    },
    async fetchData() {
      this.loading = true;
      try {
        const params = {};
        if (this.filterYear) {
          params.year = this.filterYear;
        }
        const res = await getMonthlyTrend(params);
        if (res.code === 200) {
          this.renderChart(res.data || []);
        }
      } catch (error) {
        console.error("获取每月客退趋势失败:", error);
        this.renderChart([]);
      } finally {
        this.loading = false;
      }
    },
    renderChart(data) {
      // 数据格式: { name: "2025-01", num: 18, ... }
      const months = data.map((item) => {
        // 从 "2025-01" 提取月份显示为 "1月"
        const parts = item.name.split("-");
        return parseInt(parts[1], 10) + "月";
      });
      const values = data.map((item) => item.num);
      const option = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: { type: "category", data: months, axisLabel: { color: "#666" } },
        yAxis: { type: "value", axisLabel: { color: "#666" }, splitLine: { show: false } },
        series: [{
          name: "客退数量",
          type: "bar",
          data: values,
          barWidth: "40%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#3459a5" },
              { offset: 0.5, color: "#bdd7ee" },
              { offset: 1, color: "#3459a5" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          label: { show: true, position: "top", color: "#333" },
        }],
      };
      this.chart?.setOption(option, true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/chart-card.scss";
.chart-container { height: 280px; }
</style>
