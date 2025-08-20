<template>
  <div class="seamless-container">
    <table>
      <thead>
        <tr>
          <th>生产日期</th>
          <th>订单号</th>
          <th>批次号</th>
          <th>型号</th>
          <th>配置审核状态</th>
          <th>生产许可状态</th>
          <th>备料状态</th>
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
              <td>{{ item.batchNo }}</td>
              <td>{{ item.computerName }}</td>
              <td :style="isLicenseStyle(item.configAuditStatus)">
                {{ item.configAuditStatus === 1 ? "已审核" : "未审核" }}
              </td>
              <td :style="isLicenseStyle(item.productionPermitStatus)">
                {{ item.productionPermitStatus === 1 ? "已许可" : "未许可" }}
              </td>
              <td :style="materialStatusStyle(item.materialStatus)">
                {{ getMaterialStatusText(item.materialStatus) }}
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
  },
  data() {
    return {
      classOption: {
        autoPlay: true,
        step: 5, // 滚动速度
        limitMoveNum: 5, // 每屏显示5条数据（200px/40px=5条）
        hoverStop: false, // 鼠标悬停时停止滚动
        direction: 1, // 1向上 0向下
        openWatch: true, // 开启数据实时监控刷新dom
        singleHeight: 200, // 一屏的高度（显示区域高度）
        singleWidth: 0,
        waitTime: 10000 // 每屏停留10秒钟
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
    materialStatusStyle() {
      return (status) => {
        // 只有已完成(状态2)显示绿色，其他都是白色
        return {
          color: status === 2 ? "#00E8B5" : "#FFFFFF"
        };
      };
    },
    getMaterialStatusText() {
      return (status) => {
        const texts = {
          0: "未备料",
          1: "备料中",
          2: "已备料"
        };
        return texts[status] || "未知";
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
    height: 200px; // 设置滚动区域固定高度，与AlarmTable相近
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
          width: 12%;
        }

        // 生产日期
        &:nth-child(2) {
          width: 18%;
        }

        // 订单号
        &:nth-child(3) {
          width: 12%;
        }

        // 批次号
        &:nth-child(4) {
          width: 15%;
        }

        // 型号
        &:nth-child(5) {
          width: 15%;
        }

        // 配置审核状态
        &:nth-child(6) {
          width: 14%;
        }

        // 生产许可状态
        &:nth-child(7) {
          width: 14%;
        }

        // 备料状态
      }
    }

    tbody {
      tr {
        height: 40px;
        color: #fff;
        font-weight: 500;

        td {
          &:nth-child(1) {
            width: 12%;
          }

          // 生产日期
          &:nth-child(2) {
            width: 18%;
          }

          // 订单号
          &:nth-child(3) {
            width: 12%;
          }

          // 批次号
          &:nth-child(4) {
            width: 15%;
          }

          // 型号
          &:nth-child(5) {
            width: 15%;
          }

          // 配置审核状态
          &:nth-child(6) {
            width: 14%;
          }

          // 生产许可状态
          &:nth-child(7) {
            width: 14%;
          }

          // 备料状态
        }
      }
    }
  }
}
</style>