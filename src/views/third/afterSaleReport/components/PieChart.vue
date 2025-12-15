<template>
  <el-card class="report-card" shadow="hover">
    <div slot="header" class="card-header">
      <span class="card-title">{{ title }}</span>
      <div class="filter-area">
        <el-popover
          v-model="filterPanelVisible"
          placement="bottom-end"
          width="360"
          trigger="click"
          popper-class="pie-filter-popover"
        >
          <div class="filter-panel">
            <div class="filter-row">
              <span class="filter-label">年份</span>
              <el-date-picker v-model="filterYear" type="year" placeholder="年" value-format="yyyy" clearable size="small" :append-to-body="true" @change="handleYearMonthChange" />
            </div>
            <div class="filter-row">
              <span class="filter-label">月份</span>
              <el-select v-model="filterMonth" placeholder="月" clearable size="small" @change="handleYearMonthChange">
                <el-option v-for="m in 12" :key="m" :label="m" :value="String(m).padStart(2, '0')"  style="width:100%"/>
              </el-select>
            </div>
            <div class="filter-row">
              <span class="filter-label">日期范围</span>
              <el-date-picker v-model="filterDayRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" value-format="yyyy-MM-dd" clearable size="small" :append-to-body="true" @change="handleDateRangeChange" />
            </div>
            <div class="filter-row" v-if="$slots['extra-filter']">
              <span class="filter-label">一级问题</span>
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
              size="mini"
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
  name: "PieChart",
  props: {
    title: { type: String, required: true },
    fetchApi: { type: Function, required: true },
    extraParams: { type: Object, default: () => ({}) },
    colors: { type: Array, default: null },
    extraFilterSummary: { type: String, default: "" },
  },
  data() {
    return {
      filterYear: "",
      filterMonth: "",
      filterDayRange: [],
      loading: false,
      chart: null,
      filterPanelVisible: false,
    };
  },
  computed: {
    filterSummary() {
      const parts = [];
      if (this.filterYear) {
        parts.push(`${this.filterYear}年`);
      }
      if (this.filterMonth) {
        parts.push(`${parseInt(this.filterMonth, 10)}月`);
      }
      if (this.filterDayRange && this.filterDayRange.length === 2) {
        parts.push(`${this.filterDayRange[0]} ~ ${this.filterDayRange[1]}`);
      }
      if (this.extraFilterSummary) {
        parts.push(this.extraFilterSummary);
      }
      return parts.length ? parts.join(" · ") : "全部数据";
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
    handleYearMonthChange() {
      // 选择年份或月份时，清除日期范围
      if (this.filterYear || this.filterMonth) {
        this.filterDayRange = [];
      }
    },
    handleDateRangeChange() {
      // 选择日期范围时，清除年份和月份
      if (this.filterDayRange && this.filterDayRange.length === 2) {
        this.filterYear = "";
        this.filterMonth = "";
      }
    },
    handleApply() {
      this.filterPanelVisible = false;
      this.fetchData();
    },
    handleReset() {
      this.filterYear = "";
      this.filterMonth = "";
      this.filterDayRange = [];
      this.filterPanelVisible = false;
      // 通知父组件重置额外筛选条件
      this.$emit("reset");
      this.$nextTick(() => {
        this.fetchData();
      });
    },
    async fetchData() {
      this.loading = true;
      try {
        const params = { ...this.extraParams };
        // 年份
        if (this.filterYear) {
          params.year = this.filterYear;
        }
        // 月份
        if (this.filterMonth) {
          params.month = this.filterMonth;
        }
        // 日期范围
        if (this.filterDayRange && this.filterDayRange.length === 2) {
          params.startDate = this.filterDayRange[0];
          params.endDate = this.filterDayRange[1];
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
      const defaultColors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"];
      const colorList = this.colors || defaultColors;
      const pieData = data.map((item, index) => ({
        name: item.name,
        value: item.num || item.count || item.value || 0,
        itemStyle: { color: colorList[index % colorList.length] },
      }));
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const option = {
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: {
          orient: "vertical",
          right: 10,
          top: "center",
          formatter: (name) => {
            const item = pieData.find((d) => d.name === name);
            if (item && total > 0) {
              return `${name}  ${((item.value / total) * 100).toFixed(2)}%`;
            }
            return name;
          },
        },
        series: [{
          name: this.title,
          type: "pie",
          radius: ["40%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
          label: { show: true, formatter: "{c} ({d}%)" },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
          data: pieData,
        }],
        color: colorList,
      };
      this.chart?.setOption(option, true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/chart-card.scss";
.report-card {
  position: relative;
}
.chart-container { height: 240px; }
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.filter-area {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.filter-trigger {
  width: 210px;
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
.filter-row > :last-child {
  flex: 1;
}
.filter-row ::v-deep(.el-input),
.filter-row ::v-deep(.el-select),
.filter-row ::v-deep(.el-date-editor) {
  width: 100%;
}
.filter-label {
  width: 70px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  text-align: right;
  padding-right: 10px;
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
::v-deep .pie-filter-popover {
  padding: 12px 16px;
}
</style>
