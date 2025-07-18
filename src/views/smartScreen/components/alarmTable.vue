<template>
  <div class="seamless-container">
    <table>
      <thead>
        <tr>
          <th>订单号</th>
          <th>型号</th>
          <th>问题类型</th>
          <th>上报人</th>
          <th>处理时长</th>
        </tr>
      </thead>
    </table>
    <div class="scroll-box" v-if="tableData.length">
      <vue-seamless-scroll :data="tableData" :classOption="classOption">
        <table>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.orderNo }}</td>
              <td>{{ item.model }}</td>
              <td>{{ item.problem }}</td>
              <td>{{ item.configuration }}</td>
              <td :style="durationStyle(item.packaging)">{{ overdueTime(item.packaging) }}</td>
            </tr>
          </tbody>
        </table>
      </vue-seamless-scroll>
    </div>

    <el-empty
      v-else
      description="后续迭代"
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
        limitMoveNum: 5,
      }
    };
  },
  computed: {
    overdueTime() {
      return (seconds) => {
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
      };
    },
    durationStyle() {
      return (duration) => {
        const days = Math.floor(duration / (24 * 3600));
        return {
          color: days && duration ? "#FF386B" : "#FFFFFF",
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

  .scroll-box {
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
        width: calc(100% / 5);
      }
    }

    tbody {
      tr {
        height: 40px;
        color: #fff;
        font-weight: 500;

        td {
          width: calc(100% / 5);
        }
      }
    }
  }
}
</style>