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
          <li v-NoData="formatDate(item.date)"></li>
          <li v-NoData="item.orderCode"></li>
          <li v-NoData="item.computerName"></li>
          <li v-NoData="item.ipqcNum"></li>
          <li v-NoData="item.oqcNum"></li>
          <li v-NoData="item.packagingNum"></li>
          <li v-NoData="item.num"></li>
          <li v-NoData="formatDate(item.endDate)"></li>
          <li class="reach-rate">
            <div class="reach-progress">
              <div class="progress-bar" :style="progressBarStyle(Number(item._original.achievementRate))"></div>
            </div>
            <span class="progress-text" :style="reactTxtStyle(Number(item._original.achievementRate))">{{
              item._original.achievementRate
              }}</span>
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
        step: 0.5, // 步长
        limitMoveNum: 11, // 启动无缝滚动的数据量
        hoverStop: false, // 鼠标悬停时不停止滚动
        direction: 1, // 向上滚动
        singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动)
        singleWaitTime: 1000, // 单步运动停止的时间(默认值1000ms)
        isRemUnit: true, // 是否开启rem度量
        delay: 1000, // 动画延迟时间
        ease: 'ease-in', // 动画效果
        count: 0, // 动画循环次数，0为无限循环
        copyHtml: true, // 是否可以复制
        autoPlay: true, // 是否自动播放
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
      return (achievementRate) => {
        if (achievementRate !== null && achievementRate !== undefined) {
          return achievementRate + "%"; // 确保返回的是字符串类型
        } else {
          return "- - -";
        }
      };
    },
    reactTxtStyle() {

      return (achievementRate) => {
        // if (achievementRate === null || achievementRate === undefined) {
        //   return { color: "#FFFFFF" };
        // }
        // if (achievementRate < 70) {
        //   return { color: "#FF386B" };
        // } else if (achievementRate >= 70 && achievementRate <= 80) {
        //   return { color: "#F5E74F" };
        // } else if (achievementRate > 80) {
        //   return { color: "#00E8B5" };
        // }
        return { color: "#FFFFFF" };
      };
    },
    progressBarStyle() {
      return (achievementRate) => {
        let backgroundColor = "#FF386B"; // 红色（低于70%）
        if (achievementRate >= 70 && achievementRate <= 80) {
          backgroundColor = "#F5E74F"; // 黄色（70%-80%）
        } else if (achievementRate > 80) {
          backgroundColor = "#00E8B5"; // 绿色（大于80%）
        }
        return {
          width: `${achievementRate || 0}%`,
          backgroundColor: backgroundColor,
        };
      };
    },
  },
  methods: {
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '- - -';
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}`;
    }
  }
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
    border-image-source: linear-gradient(180deg, rgba(90, 211, 251, 0) 0%, #5AD3FB 100%),
      linear-gradient(0deg, #093D4D, #093D4D);
    border-image-slice: 1;
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
      text-shadow:
        -1px -1px 0 #0a3a4a,
        1px -1px 0 #0a3a4a,
        -1px 1px 0 #0a3a4a,
        1px 1px 0 #0a3a4a,
        0 -1px 0 #0a3a4a,
        0 1px 0 #0a3a4a,
        -1px 0 0 #0a3a4a,
        1px 0 0 #0a3a4a;

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
      font-size: 15px;

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
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;

        .reach-progress {
          position: relative;
          width: 80px; // 增加进度条宽度
          height: 7px; // 保持细线条
          background: #171D38;
          border-radius: 10px;
          overflow: hidden;
          margin-right: 10px;

          .progress-bar {
            height: 100%;
            border-radius: 2px;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 15px;
          font-weight: 500;
          color: inherit;
          white-space: nowrap;
          min-width: 35px;
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