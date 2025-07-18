<template>
  <div class="seamless-container">
    <ul class="header-tab">
      <li>序号</li>
      <li>机型</li>
      <li>订单号</li>
      <li>半成品</li>
      <li>成品</li>
      <li>配置</li>
      <li>包装</li>
      <li>计划数量</li>
      <li>备料状态</li>
      <li>计划完成时间</li>
      <li>达成率</li>
    </ul>
    <div class="scroll-box" v-if="tableData.length">
      <vue-seamless-scroll :data="tableData" :classOption="classOption">
        <ul
          class="production-row"
          v-for="(item, index) in tableData"
          :key="index"
          :class="productionRow(index)"
        >
          <li>{{ index + 1 }}</li>
          <li v-NoData="item.computerName"></li>
          <li v-NoData="item.orderNo"></li>
          <li v-NoData="item.iqcCount"></li>
          <li v-NoData="item.oqcCount"></li>
          <li v-NoData="item.dcdCount"></li>
          <li v-NoData="item.packCount"></li>
          <li v-NoData="item.num"></li>
          <li :style="preparationStatusStyle(item.preparationStatus)">
            {{ item.preparationStatus === 1 ? "已备料" : "未备料" }}
          </li>
          <li v-NoData="item.date"></li>
          <li :style="reactTxtStyle(item.reach)">
            {{ reachData(item.reach) }}
          </li>
        </ul>
      </vue-seamless-scroll>
    </div>

    <el-empty
      v-else
      description="暂无数据"
      :image-size="80"
      style="height: 100%"
    ></el-empty>
  </div>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      classOption: {
        autoPlay: true,
        step: 0.5,
        limitMoveNum: 11,
      },
    };
  },
  computed: {
    productionRow() {
      return (index) => {
        if (index % 2 === 0) {
          return "production-row-odd";
        } else {
          return "production-row-even";
        }
      };
    },
    preparationStatusStyle() {
      return (preparationStatus) => {
        return {
          color: preparationStatus === 1 ? "#FF386B" : "#FFFFFF",
        };
      };
    },
    reachData() {
      return (reach) => {
        if (reach) {
          return reach + "%"; // 确保返回的是字符串类型
        } else {
          return "- - -";
        }
      };
    },
    reactTxtStyle() {
      return (reach) => {
        if (!reach) {
          return { color: "#FFFFFF" };
        }
        if (reach < 70) {
          return { color: "#FF386B" };
        } else if (reach >= 70 && reach <= 80) {
          return { color: "#F5E74F" };
        } else if (reach > 80) {
          return { color: "#00E8B5" };
        }
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.seamless-container {
  height: 640px;
  overflow: hidden;

  .header-tab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 57px;
    background: linear-gradient(
      360deg,
      #1fb4ff8f 0%,
      rgba(31, 180, 255, 0) 100%
    );
    border: 1px solid #093d4d;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    font-style: normal;
    text-transform: none;

    li {
      width: calc(100% / 11);
      text-align: center;
      padding: 0 6px;
      box-sizing: border-box;

      &:first-child {
        width: 80px;
      }
      &:nth-child(3) {
        width: 12%;
      }
    }
  }

  .scroll-box {
    overflow: hidden;

    .production-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      color: #fff;

      li {
        width: calc(100% / 11);
        text-align: center;
        word-break: break-all;
        padding: 0 6px;
        box-sizing: border-box;

        &:first-child {
          width: 80px;
        }
        &:nth-child(3) {
          width: 12%;
        }
      }
    }

    .production-row-odd {
      background: rgba(54, 94, 114, 0.24);
    }

    .production-row-even {
      background: rgba(27, 112, 164, 0.4);
    }
  }
}
</style>