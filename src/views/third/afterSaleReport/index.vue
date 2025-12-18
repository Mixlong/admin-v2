<template>
  <div class="after-sale-report app-container">
    <!-- 第一行：每月客退趋势 -->
    <div class="chart-row">
      <monthly-trend-chart />
    </div>

    <!-- 第二行：三个饼图 -->
    <div class="chart-row pie-row">
      <pie-chart
        title="客退类型占比"
        :fetch-api="getAfterTypeRatio"
        :colors="afterTypeColors"
        @chart-click="handleAfterTypeClick"
      />
      <pie-chart
        ref="parentResponsibilityChart"
        title="一级责任占比"
        :fetch-api="getParentResponsibilityRatio"
        :extra-params="parentResponsibilityParams"
        :extra-filter-summary="selectedAfterTypeLabel"
        :colors="parentResponsibilityColors"
        @reset="handleResetAfterType"
      />
      <pie-chart
        ref="responsibilityChart"
        title="二级责任占比"
        :fetch-api="getResponsibilityRatio"
        :extra-params="responsibilityParams"
        :extra-filter-summary="responsibilityFilterSummary"
        :colors="responsibilityColors"
        @reset="handleResetResponsibility"
      >
        <template #extra-filter>
          <el-select
            v-model="selectedParentResponsibility"
            placeholder="请选择一级责"
            clearable
            size="mini"
            style="width: 100%"
            @change="handleParentResponsibilityChange"
          >
            <el-option
              v-for="item in responsibilityGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </template>
      </pie-chart>
    </div>

    <!-- 第三行：综合报表（4个帕累托图） -->
    <comprehensive-report />
  </div>
</template>

<script>
import MonthlyTrendChart from "./components/MonthlyTrendChart.vue";
import PieChart from "./components/PieChart.vue";
import ComprehensiveReport from "./components/ComprehensiveReport.vue";
import {
  getAfterTypeRatio,
  getParentResponsibilityRatio,
  getResponsibilityRatio,
} from "@/api/third/sale";

export default {
  name: "AfterSaleReport",
  components: {
    MonthlyTrendChart,
    PieChart,
    ComprehensiveReport,
  },
  dicts: ["responsibility_group"],
  data() {
    return {
      selectedParentResponsibility: "",
      selectedAfterType: "", // 选中的客退类型：1=大货，2=样品
      // 客退类型占比颜色：大货-青蓝色、样品-橙红色
      afterTypeColors: ["#4fc3f7", "#ff5722"],
      // 一级责任占比颜色：蓝色、橙色、绿色、黄色、棕色
      parentResponsibilityColors: ["#5b9bd5", "#ed7d31", "#70ad47", "#ffc000", "#a5644e", "#7030a0"],
      // 二级责任占比颜色：橙色系、绿色、蓝色等
      responsibilityColors: ["#ed7d31", "#f5a623", "#70ad47", "#5b9bd5", "#a5644e", "#ffc000", "#7030a0", "#44546a"],
    };
  },
  computed: {
    responsibilityGroupOptions() {
      return this.dict?.type?.responsibility_group || [];
    },
    // 一级责任占比的参数
    parentResponsibilityParams() {
      return {
        afterType: this.selectedAfterType || undefined,
      };
    },
    // 二级责任占比的参数
    responsibilityParams() {
      const params = {
        parentResponsibilityPerson: this.selectedParentResponsibility || undefined,
        afterType: this.selectedAfterType || undefined,
      };
      return params;
    },
    // 客退类型的显示文本
    selectedAfterTypeLabel() {
      if (!this.selectedAfterType) return "";
      return this.selectedAfterType === 1 ? "大货" : this.selectedAfterType === 2 ? "样品" : "";
    },
    // 二级责任占比的筛选条件汇总
    responsibilityFilterSummary() {
      const parts = [];
      if (this.selectedAfterTypeLabel) {
        parts.push(this.selectedAfterTypeLabel);
      }
      if (this.selectedParentResponsibility) {
        parts.push(this.selectedParentResponsibility);
      }
      return parts.join(" · ");
    },
  },
  methods: {
    getAfterTypeRatio,
    getParentResponsibilityRatio,
    getResponsibilityRatio,
    
    // 客退类型图表点击事件
    handleAfterTypeClick(params) {
      // params.name 是 "大货" 或 "样品"
      if (params.name === "大货") {
        this.selectedAfterType = 1;
      } else if (params.name === "样品" || params.name === "送样") {
        this.selectedAfterType = 2;
      }
      // 刷新一级责任和二级责任图表
      this.$refs.parentResponsibilityChart?.fetchData();
      this.$refs.responsibilityChart?.fetchData();
    },
    
    // 重置客退类型筛选
    handleResetAfterType() {
      this.selectedAfterType = "";
      this.$refs.parentResponsibilityChart?.fetchData();
    },
    
    // 重置二级责任筛选
    handleResetResponsibility() {
      this.selectedParentResponsibility = "";
      this.selectedAfterType = "";
      this.$refs.responsibilityChart?.fetchData();
    },
    
    handleParentResponsibilityChange() {
      // 触发二级责任图表刷新
      this.$refs.responsibilityChart?.fetchData();
    },
  },
};
</script>

<style lang="scss" scoped>
.after-sale-report {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.chart-row {
  margin-bottom: 16px;
}

.pie-row {
  display: flex;
  gap: 16px;

  > * {
    flex: 1;
    min-width: 0;
  }
}

@media screen and (max-width: 1400px) {
  .pie-row {
    flex-wrap: wrap;

    > * {
      flex: 1 1 calc(50% - 8px);
      min-width: 300px;
    }
  }
}

@media screen and (max-width: 768px) {
  .pie-row {
    flex-direction: column;

    > * {
      flex: 1 1 100%;
    }
  }
}
</style>
