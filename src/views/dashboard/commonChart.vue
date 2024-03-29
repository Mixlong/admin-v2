<template>
  <div :class="className" :style="{ width, height }"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "300px",
    },
    chartOption: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartOption: {
      deep: true,
      handler() {
        if (this.chart) this.initChart();
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      this.chart.showLoading({
        maskColor: "rgba(255, 255, 255, .2)"
      });
      this.setOptions();
    },
    setOptions() {
      setTimeout(() => {
        this.chart.hideLoading();
        this.chart.setOption(this.chartOption);
      }, 1000);
    },
  },
};
</script>