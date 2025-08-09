<template>
  <div class="seamless-container">
    <ul class="header-tab">
      <li>上料日期</li>
      <li>工单号</li>
      <li>型号</li>
      <li>半成品</li>
      <li>成品</li>
      <li>配置</li>
      <li>计划数量</li>
      <li>计划完成时间</li>
      <li>达成率</li>
    </ul>
    <div class="scroll-box" v-if="tableData.length">
      <vue-seamless-scroll :data="tableData" :classOption="classOption">
        <ul class="production-row" v-for="(item, index) in tableData" :key="index" :class="productionRow(index)">
          <li v-NoData="item.feedingDate || '25/10/13'"></li>
          <li v-NoData="item.orderNo"></li>
          <li v-NoData="item.computerName"></li>
          <li v-NoData="item.iqcCount"></li>
          <li v-NoData="item.oqcCount"></li>
          <li v-NoData="item.dcdCount"></li>
          <li v-NoData="item.num"></li>
          <li v-NoData="item.date"></li>
          <li class="reach-rate" :style="reactTxtStyle(item.reach)">
            <div class="reach-progress">
              <div class="progress-bar" :style="progressBarStyle(item.reach)"></div>
              <span class="progress-text">{{ reachData(item.reach) }}</span>
            </div>
          </li>
        </ul>
      </vue-seamless-scroll>
    </div>

    <el-empty v-else description="暂无数据" :image-size="80" style="height: 100%"></el-empty>
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
    progressBarStyle() {
      return (reach) => {
        let backgroundColor = "#FF386B"; // 红色（低于70%）
        if (reach >= 70 && reach <= 80) {
          backgroundColor = "#F5E74F"; // 黄色（70%-80%）
        } else if (reach > 80) {
          backgroundColor = "#00E8B5"; // 绿色（大于80%）
        }
        return {
          width: `${reach || 0}%`,
          backgroundColor: backgroundColor,
        };
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
    background: linear-gradient(360deg,
        #1fb4ff8f 0%,
        rgba(31, 180, 255, 0) 100%);
    border: 1px solid #093d4d;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    font-style: normal;
    text-transform: none;

    li {
      width: calc(100% / 9);
      text-align: center;
      padding: 0 6px;
      box-sizing: border-box;

      &:nth-child(1) {
        width: 9%; // 上料日期
      }

      &:nth-child(2) {
        width: 14%; // 工单号
      }

      &:nth-child(3) {
        width: 9%; // 型号
      }

      &:nth-child(4) {
        width: 9%; // 半成品
      }

      &:nth-child(5) {
        width: 9%; // 成品
      }

      &:nth-child(6) {
        width: 7%; // 配置
      }

      &:nth-child(7) {
        width: 11%; // 计划数量
      }

      &:nth-child(8) {
        width: 15%; // 计划完成时间
      }

      &:nth-child(9) {
        width: 17%; // 达成率
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
      font-size: 12px;

      li {
        width: calc(100% / 9);
        text-align: center;
        word-break: break-all;
        padding: 0 6px;
        box-sizing: border-box;

        &:nth-child(1) {
          width: 9%; // 上料日期
        }

        &:nth-child(2) {
          width: 14%; // 工单号
        }

        &:nth-child(3) {
          width: 9%; // 型号
        }

        &:nth-child(4) {
          width: 9%; // 半成品
        }

        &:nth-child(5) {
          width: 9%; // 成品
        }

        &:nth-child(6) {
          width: 7%; // 配置
        }

        &:nth-child(7) {
          width: 11%; // 计划数量
        }

        &:nth-child(8) {
          width: 15%; // 计划完成时间
        }

        &:nth-child(9) {
          width: 17%; // 达成率
        }
      }

      .reach-rate {
        position: relative;

        .reach-progress {
          position: relative;
          width: 100%;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;

          .progress-bar {
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
          }

          .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 11px;
            font-weight: bold;
            z-index: 2;
          }
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