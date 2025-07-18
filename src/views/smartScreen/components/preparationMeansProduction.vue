<template>
  <div class="seamless-container">
    <table>
      <thead>
        <tr>
          <th>生产日期</th>
          <th>订单号</th>
          <th>型号</th>
          <th>许可状态</th>
          <th>延期时长</th>
        </tr>
      </thead>
    </table>
    <div class="scroll-box" v-if="tableData.length">
      <vue-seamless-scroll :data="tableData" :classOption="classOption">
        <table>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.date }}</td>
              <td>{{ item.orderNo }}</td>
              <td>{{ item.computerName }}</td>
              <td :style="isLicenseStyle(item.isLicense)">
                {{ item.isLicense === 1 ? "已许可" : "未许可" }}
              </td>
              <td :style="durationStyle(item.isLicense, item.duration)">
                {{ overdueTime(item.duration) }}
              </td>
            </tr>
          </tbody>
        </table>
      </vue-seamless-scroll>
    </div>
    <el-empty v-else description="暂无数据" :image-size="80" style="height: 100%;"></el-empty>
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
    isLicenseStyle() {
      return (isLicense) => {
        return {
          color: isLicense === 1 ? "#00E8B5" : "#FFFFFF", // 根据isLicense的值设置颜色
        };
      };
    },
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

        return timeString || "- - -";
      };
    },
    durationStyle() {
      return (isLicense, duration) => {
        return {
          color: isLicense === 0 && duration ? "#FF386B" : "#FFFFFF",
        };
      };
    },
  }
};
</script>

<style lang="scss" scoped>
.seamless-container {
  height: 260px;
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