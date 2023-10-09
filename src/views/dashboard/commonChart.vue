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
  created() {
    console.log("我是echart");
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  methods: {
    initChart() {
      console.log("是否渲染");
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions();
    },
    setOptions() {
      this.chart.setOption(this.chartOption);
    },
  },
};
</script>