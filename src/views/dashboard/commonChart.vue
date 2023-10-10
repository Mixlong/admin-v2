<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-10-09 11:27:20
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-10-10 11:18:57
 * @FilePath: \FILECONF-UI\src\views\dashboard\commonChart.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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