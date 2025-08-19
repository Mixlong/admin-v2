<template>
  <div class="seamless-container" :class="{ 'full-height': !hasNotice }">
    <table>
      <thead>
        <tr>
          <th>工单号</th>
          <th>型号</th>
          <th>问题描述</th>
          <th>上报人</th>
          <th>责任归属</th>
          <th>处理时长</th>
        </tr>
      </thead>
    </table>
    <div class="scroll-box" v-if="tableData.length">
      <vue-seamless-scroll :data="tableData" :classOption="classOption">
        <table>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.workOrderNo }}</td>
              <td>{{ item.computerName }}</td>
              <td>{{ item.problemDesc }}</td>
              <td>{{ item.reporter }}</td>
              <td>{{ item.responsible }}</td>
              <td :style="durationStyle(item.processDuration)">{{ overdueTime(item.processDuration) }}</td>
            </tr>
          </tbody>
        </table>
      </vue-seamless-scroll>
    </div>

    <el-empty v-else description="后续迭代" :image-size="80" style="height: 100%"></el-empty>
  </div>
</template>

<script>
import vueSeamlessScroll from 'vue-seamless-scroll'

export default {
  components: {
    vueSeamlessScroll
  },
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    hasNotice: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      classOption: {
        autoPlay: true,
        step: 0.8, // 滚动速度
        limitMoveNum: 3, // 限制滚动条数
        hoverStop: true, // 鼠标悬停时停止滚动
        direction: 1, // 1向上 0向下
        openWatch: true, // 开启数据实时监控刷新dom
        singleHeight: 40, // 单步运动停止的高度
        singleWidth: 0,
        waitTime: 0 // 单步运动停止的时间(默认值1000ms)
      }
    };
  },
  computed: {
    overdueTime() {
      return (durationStr) => {
        // 如果是格式化字符串，直接返回
        if (typeof durationStr === 'string' && durationStr) {
          return durationStr;
        }

        // 如果是数字秒数，进行格式化
        if (typeof durationStr === 'number') {
          const seconds = durationStr;
          const days = Math.floor(seconds / (24 * 3600));
          const hours = Math.floor((seconds % (24 * 3600)) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = seconds % 60;

          let timeString = "";

          if (days > 0) {
            timeString += `${days}天`;
          }
          if (days > 0 && (hours > 0 || minutes > 0 || secs > 0)) {
            timeString += "";
          }
          if (hours > 0 || (days > 0 && minutes >= 0)) {
            timeString += `${hours}小时`;
          }
          if (hours > 0 && (minutes > 0 || secs > 0)) {
            timeString += "";
          }
          if (
            minutes > 0 ||
            (days > 0 && secs >= 0) ||
            (hours > 0 && secs >= 0)
          ) {
            timeString += `${minutes}分`;
          }
          if (minutes > 0 && secs > 0) {
            timeString += "";
          }
          if (secs > 0) {
            timeString += `${secs}秒`;
          }

          return timeString || "--";
        }

        return "--";
      };
    },
    durationStyle() {
      return (durationStr) => {
        // 如果是格式化字符串，通过关键词判断是否超期
        if (typeof durationStr === 'string') {
          const isOverdue = durationStr.includes('天') || durationStr.includes('小时');
          return {
            color: isOverdue ? "#FF386B" : "#FFFFFF",
          };
        }

        // 如果是数字，按原来的逻辑
        if (typeof durationStr === 'number') {
          const days = Math.floor(durationStr / (24 * 3600));
          return {
            color: days && durationStr ? "#FF386B" : "#FFFFFF",
          };
        }

        return {
          color: "#FFFFFF",
        };
      };
    },
  }
};
</script>

<style lang="scss" scoped>
.seamless-container {
  height: 220px;
  padding: 10px 20px;
  box-sizing: border-box;
  overflow: hidden;

  &.full-height {
    height: 264px;
    /* 220px + 44px(通知栏高度) = 264px */

    .scroll-box {
      height: 204px;
      /* 160px + 44px = 204px */
      overflow: hidden;
    }
  }

  .scroll-box {
    height: 160px;
    /* 固定滚动区域高度 */
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: none;
    text-align: center;

    thead {
      width: 100%;
      height: 40px;
      background: rgba(27, 112, 164, 0.4);
      font-weight: 400;
      font-size: 14px;
      color: #ffffff;
      font-style: normal;
      text-transform: none;

      th {
        &:nth-child(1) {
          width: 18%;
        }

        // 工单号
        &:nth-child(2) {
          width: 12%;
        }

        // 型号  
        &:nth-child(3) {
          width: 25%;
        }

        // 问题描述
        &:nth-child(4) {
          width: 15%;
        }

        // 上报人
        &:nth-child(5) {
          width: 15%;
        }

        // 责任归属
        &:nth-child(6) {
          width: 15%;
        }

        // 处理时长
      }
    }

    tbody {
      tr {
        height: 40px;
        color: #fff;
        font-weight: 500;

        td {
          &:nth-child(1) {
            width: 18%;
          }

          // 工单号
          &:nth-child(2) {
            width: 12%;
          }

          // 型号  
          &:nth-child(3) {
            width: 25%;
          }

          // 问题描述
          &:nth-child(4) {
            width: 15%;
          }

          // 上报人
          &:nth-child(5) {
            width: 15%;
          }

          // 责任归属
          &:nth-child(6) {
            width: 15%;
          }

          // 处理时长
        }
      }
    }
  }
}
</style>