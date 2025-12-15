<template>
  <el-card class="report-card" shadow="hover">
    <div slot="header" class="card-header">
      <span class="card-title">{{ title }}</span>
      <div class="filter-area">
        <el-popover
          v-model="filterPanelVisible"
          placement="bottom-end"
          width="340"
          trigger="click"
          popper-class="pareto-filter-popover"
        >
          <div class="filter-panel">
            <div class="filter-row">
              <span class="filter-label">日期</span>
              <el-date-picker
                v-model="filterDate"
                type="date"
                placeholder="选择年月日"
                value-format="yyyy-MM-dd"
                clearable
                size="small"
              />
            </div>
            <div class="filter-row" v-if="$slots['extra-filter']">
              <span class="filter-label">其他</span>
              <div class="extra-filter">
                <slot name="extra-filter"></slot>
              </div>
            </div>
            <div class="filter-actions">
              <el-button size="mini" @click="handleReset">重置</el-button>
              <el-button type="primary" size="mini" @click="handleApply">应用</el-button>
            </div>
          </div>
          <template #reference>
            <el-input
              class="filter-trigger"
              size="small"
              readonly
              :value="filterSummary"
              placeholder="筛选条件"
              suffix-icon="el-icon-arrow-down"
            />
          </template>
        </el-popover>
      </div>
    </div>
    <div class="chart-container" v-loading="loading">
      <div ref="chartRef" class="chart"></div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "ParetoChart",
  props: {
    title: { type: String, required: true },
    fetchApi: { type: Function, required: true },
    extraParams: { type: Object, default: () => ({}) },
    barColor: { type: String, default: "#5470c6" },
    extraFilterSummary: { type: String, default: "" },
  },
  data() {
    return {
      filterDate: "",
      loading: false,
      chart: null,
      filterPanelVisible: false,
    };
  },
  computed: {
    filterSummary() {
      if (!this.filterDate && !this.extraFilterSummary) {
        return "全部数据";
      }
      return [this.filterDate, this.extraFilterSummary].filter(Boolean).join(" · ");
    },
  },
  watch: {
    extraParams: {
      deep: true,
      handler() {
        this.fetchData();
      },
    },
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
    handleApply() {
      this.filterPanelVisible = false;
      this.fetchData();
    },
    handleReset() {
      this.filterDate = "";
      this.$emit("filters-reset");
      this.filterPanelVisible = false;
      this.$nextTick(() => {
        this.fetchData();
      });
    },
    async fetchData() {
      this.loading = true;
      try {
        const params = { ...this.extraParams };
        if (this.filterDate) {
          const [year, month, day] = this.filterDate.split("-");
          params.year = year;
          params.month = month;
          params.day = day;
        }
        const res = await this.fetchApi(params);
        if (res.code === 200) {
          this.renderChart(res.data || []);
          this.$emit("data-loaded", res.data || []);
        }
      } catch (error) {
        console.error(`获取${this.title}失败:`, error);
        this.renderChart([]);
      } finally {
        this.loading = false;
      }
    },
    renderChart(data) {
      // 数据格式: { name: "xxx", num: 18, ... }
      // 按数量降序排序
      const sortedData = [...data].sort((a, b) => (b.num || b.count || b.value || 0) - (a.num || a.count || a.value || 0));
      const names = sortedData.map((item) => item.name);
      const values = sortedData.map((item) => item.num || item.count || item.value || 0);
      const total = values.reduce((sum, v) => sum + v, 0);
      
      // 计算累计占比
      let cumulative = 0;
      const cumulativePercent = values.map((v) => {
        cumulative += v;
        return total > 0 ? ((cumulative / total) * 100).toFixed(2) : 0;
      });

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
        legend: {
          data: ["问题数量", "累计占比"],
          bottom: 0,
        },
        grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
        xAxis: {
          type: "category",
          data: names,
          axisLabel: { color: "#666", rotate: 30, interval: 0 },
        },
        yAxis: [
          { type: "value", name: "数量", axisLabel: { color: "#666" } },
          { type: "value", name: "累计占比", max: 100, axisLabel: { color: "#666", formatter: "{value}%" } },
        ],
        series: [
          {
            name: "问题数量",
            type: "bar",
            data: values,
            barWidth: "50%",
            itemStyle: { color: this.barColor, borderRadius: [4, 4, 0, 0] },
            label: { show: true, position: "top", color: "#333", fontSize: 10 },
          },
          {
            name: "累计占比",
            type: "line",
            yAxisIndex: 1,
            data: cumulativePercent,
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            itemStyle: { color: "#ff9800" },
            lineStyle: { width: 2 },
            label: { show: true, position: "top", formatter: "{c}%", fontSize: 10 },
          },
        ],
      };
      this.chart?.setOption(option, true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/chart-card.scss";
.chart-container { height: 300px; }
.filter-trigger {
  width: 160px;
  cursor: pointer;
}
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.filter-label {
  width: 48px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}
.extra-filter {
  flex: 1;
  min-width: 0;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
::v-deep .pareto-filter-popover {
  padding: 12px 16px;
}
</style>
