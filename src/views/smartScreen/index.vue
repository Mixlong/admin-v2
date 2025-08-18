<template>
  <div class="smart-screen-container" id="screen">
    <div class="header">
      <div class="logo">
        <img class="logo-icon" src="~@/assets/image/screen/power_logo.png" alt="logo" />
      </div>
      <div class="main-title">迪太科技生产智慧大屏</div>
      <div class="header-right">
        <span class="current-time">
          {{ currentTime }}
        </span>
        <span class="line"></span>
        <span class="currentDate">{{ currentDate }}</span>
        <span>{{ currentWeekday }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="main-content-box">
      <div class="content-left">
        <div class="content-left-top">
          <div class="content--top-item" v-for="(item, index) in todayInfoData" :key="index">
            <div class="main-title">
              {{ item.title }}
            </div>
            <div class="main-content">
              <div class="progress-wrapper">
                <div class="progress-box">
                  <!-- <el-progress
                    class="el-progress--circle-box"
                    type="circle"
                    :percentage="item.progress"
                    :width="89"
                    :stroke-width="10"
                    color="#00E8B5"
                    text-color="#fff"
                    define-back-color="#F6FFFC"
                  ></el-progress> -->

                  <EchartsProgress :percentage="item.progress" :size="140" :thresholds="progressThresholds"
                    :colors="progressColors" />
                </div>
              </div>
              <div class="main-right-box">
                <div class="top">
                  <svg-icon icon-class="smartScreen2" class="stat-icon" />
                  <span class="current-count">{{ item.value }}</span>
                  <span class="sub-title">{{ item.subTitle }}</span>
                </div>
                <div class="bottom">
                  <span class="sub-title">总数量</span>
                  <span class="total-count">{{ item.total }}</span>
                  <svg-icon icon-class="smartScreen1" class="stat-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="content-left-bottom">
          <div class="header-box">
            <div class="header-bg-box">
              <div class="main-title">生产实况</div>
            </div>
          </div>
          <div class="production-plant-box">
            <production-plant :tableData="productionSituationData"></production-plant>
          </div>
        </div>
      </div>

      <div class="content-right">
        <div class="production-alarm-box">
          <CommonData title="生产报警">
            <template #content>
              <AlarmTable :tableData="alarmData" />
              <van-notice-bar v-if="noticeData.length" class="notice-bar-box" scrollable left-icon="volume"
                background="rgba(255,56,107,0.25)">
                <span class="notice-box" v-for="(item, index) in noticeData" :key="index">
                  <span class="orderNo">{{ item.orderNo }}</span>
                  <span class="timeout-period">({{ item.time }}),</span>
                </span>
              </van-notice-bar>
            </template>
          </CommonData>
        </div>
        <div class="production-alarm-box">
          <CommonData title="生产资料准备情况">
            <template #content>
              <PreparationMeansProduction :tableData="preparationData" />
            </template>
          </CommonData>
        </div>
        <div class="production-alarm-box">
          <CommonData title="良率趋势图(近15天)">
            <template #content>
              <el-empty description="后续迭代" :image-size="80"></el-empty>
            </template>
          </CommonData>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getScreenTodayProgress,
  getScreenProductionMeans,
} from "@/api/smartScreen";
import { getLargeScreenAlerts } from "@/api/production-management/alerts";
import productionPlant from "./components/productionPlant.vue";
import CommonData from "./components/commonData.vue";
import AlarmTable from "./components/alarmTable.vue";
import PreparationMeansProduction from "./components/preparationMeansProduction.vue";
import CircularProgress from "./components/circularProgress.vue";
import EchartsProgress from "./components/echartsProgress.vue";
import { NoticeBar } from "vant";
import screenfull from "screenfull";
import autofit from "autofit.js";

export default {
  components: {
    productionPlant,
    CommonData,
    [NoticeBar.name]: NoticeBar,
    AlarmTable,
    PreparationMeansProduction,
    CircularProgress,
    EchartsProgress,
  },
  name: "smartScreen",
  data() {
    return {
      currentTime: "--",
      currentDate: "--",
      currentWeekday: "--",
      productionSituationData: [], // 生产实况
      alarmData: [], // 生产报警数据
      preparationData: [], // 生产资料准备情况
      todayInfoData: [
        {
          title: "今日直通运行情况",
          subTitle: "直通数",
          value: 0,
          total: 0,
          progress: 0,
        },
        {
          title: "今日生产进度情况",
          subTitle: "完成数量",
          value: 0,
          total: 0,
          progress: 0,
        },
      ],
      noticeData: [], // 通知数据
      headerTimer: null,
      pageDataTimer: null,
      // 可配置的指标区间参数
      progressThresholds: {
        good: 80,    // >= 80% 显示绿色
        warning: 50  // >= 50% 显示橙色，< 80%，< 50% 显示红色
      },
      progressColors: {
        good: '#00E8B5',     // 绿色
        warning: '#FF8C00',  // 橙色
        danger: '#FF4757'    // 红色
      }
    };
  },
  created() {
    this.getHeaderTime();
    this.getTodayInfo();
    this.getAlarmData();

    this.headerTimer = setInterval(() => {
      this.getHeaderTime();
    }, 1000);
    this.pageDataTimer = setInterval(() => {
      this.getTodayInfo();
      this.getAlarmData();
    }, 10 * 1000);
  },
  mounted() {
    autofit.init({
      el: "#screen",
    });
    screenfull.request();
  },
  destroyed() {
    clearInterval(this.headerTimer);
    clearInterval(this.pageDataTimer);
  },
  methods: {
    getHeaderTime() {
      this.currentTime = this.moment().format("HH:mm:ss");
      this.currentDate = this.moment().format("YYYY-MM-DD");
      this.currentWeekday = this.moment().locale("zh-cn").format("dddd");
    },

    getTodayInfo() {
      getScreenTodayProgress().then((res) => {
        const { data } = res;
        this.todayInfoData[0].value = data.throughCompleteNum;
        this.todayInfoData[0].total = data.throughTotalNum;
        if (data.throughTotalNum) {
          this.todayInfoData[0].progress = this.toPercentage(
            data.throughCompleteNum / data.throughTotalNum
          );
        }

        this.todayInfoData[1].value = data.productCompleteNum;
        this.todayInfoData[1].total = data.productNum;
        if (data.productNum) {
          this.todayInfoData[1].progress = this.toPercentage(
            data.productCompleteNum / data.productNum
          );
        }



        this.productionSituationData = data.list;
      });

      getScreenProductionMeans().then((res) => {
        this.preparationData = res.data;
      });
    },

    // 获取生产报警数据
    getAlarmData() {
      getLargeScreenAlerts().then((res) => {
        if (res.code === 200) {
          this.alarmData = res.data || [];
          
          // 生成通知数据（超时的报警）- 只有大于1天才进入横幅警报
          this.noticeData = this.alarmData
            .filter(item => {
              // 判断是否超时（只有包含"天"的报警才进入横幅）
              const duration = item.processDuration || '';
              return duration.includes('天');
            })
            .map(item => ({
              orderNo: item.workOrderNo,
              time: item.processDuration || '--'
            }));
        }
      }).catch((error) => {
        console.error('获取生产报警数据失败:', error);
        this.alarmData = [];
        this.noticeData = [];
      });
    },
    toPercentage(value) {
      const percentage = (value * 100).toFixed(1);
      if (percentage === "0.0") {
        return 0;
      } else if (percentage === "100.0") {
        return 100;
      } else {
        return percentage;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.smart-screen-container {
  width: 100%;
  height: 100%;
  background: url("~@/assets/image/screen/screen-bg.png") no-repeat center center #181843;
  background-size: 100% 100%;
  padding: 8px;
  box-sizing: border-box;

  .header {
    display: grid;
    grid-template-columns: 25% 1fr 25%;
    align-content: center;
    width: 100%;
    height: 63px;
    padding: 0 20px;
    background: url("~@/assets/image/screen/header_bg.png") no-repeat center center;
    background-size: 100% 100%;
    box-sizing: border-box;

    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 198px;
      height: 43px;
      background: url("~@/assets/image/screen/logo_bg.png") no-repeat center center;
      background-size: 100% 100%;

      .logo-icon {
        width: 106px;
        height: 29px;
      }
    }

    .main-title {
      font-weight: bold;
      font-size: 32px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 26px;
      color: #1fc6ff;

      .current-time {
        font-weight: bold;
      }

      .line {
        display: inline-block;
        height: 16px;
        width: 1px;
        background: #19659c;
        margin: 0 11px;
      }

      .currentDate {
        margin-right: 11px;
      }
    }
  }

  .main-content-box {
    margin: 24px 16px 10px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 800px;
    column-gap: 24px;

    .content-left {
      display: grid;
      grid-template-rows: 200px 1fr;
      row-gap: 24px;

      .content-left-top {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 32px;

        .content--top-item {
          display: grid;
          grid-template-rows: 42px 1fr;
          height: 200px;
          background: url(~@/assets/image/screen/Frame.png) no-repeat center center;
          background-size: 100% 100%;

          .main-title {
            display: flex;
            align-items: center;
            font-weight: bold;
            font-size: 20px;
            color: #ffffff;
            padding: 0 14px;
            box-sizing: border-box;
          }

          .main-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            position: relative;
            height: 100%;
            gap: 20px;

            .progress-wrapper {
              flex: 1;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .progress-box {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 140px;
              height: 140px;
              border: 1px solid rgba(31, 198, 255, 0.32);
              border-radius: 50%;
              box-sizing: border-box;
              flex-shrink: 0;

              .el-progress--circle-box {
                /deep/ .el-progress__text {
                  font-size: 16px !important;
                  font-weight: bold;
                }
              }
            }

            .main-right-box {
              width: 180px;
              /* 禁止在父级 flex 布局中被拉伸，占比固定 */
              flex: 0 0 220px;
              display: grid;
              row-gap: 6px;
              min-width: 0;
              flex-shrink: 0;

              .top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 14px;
                box-sizing: border-box;
                width: 100%;
                height: 50px;
                background: url(~@/assets/image/screen/Rectangle-bottom.png) no-repeat center center;
                background-size: 100% 100%;
                position: relative;

                .current-count {
                  font-weight: bold;
                  font-size: 26px;
                  color: #00e8b5;
                  margin-bottom: 5px;
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding-bottom: 8px;
                  box-sizing: border-box;
                }

                .sub-title {
                  font-weight: 400;
                  font-size: 14px;
                  color: #b4c0cc;
                  margin-bottom: 5px;
                  padding-bottom: 3px;
                }
              }

              .bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 14px;
                box-sizing: border-box;
                width: 100%;
                height: 50px;
                background: url(~@/assets/image/screen/Rectangle-top.png) no-repeat center center;
                background-size: 100% 100%;
                position: relative;

                .sub-title {
                  font-weight: 400;
                  font-size: 14px;
                  color: #b4c0cc;
                  margin-top: 10px;
                  padding-bottom: 3px;
                }

                .total-count {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 24px;
                  color: #ffffff;
                  margin: 0;
                  line-height: 1;
                  padding-top: 8px;
                  box-sizing: border-box;
                }
              }

              img {
                width: 22px;
                height: 22px;
              }

              .stat-icon {
                width: 22px;
                height: 22px;
                color: #00E8B5;
              }
            }
          }
        }
      }

      .content-left-bottom {
        background: url(~@/assets/image/screen/Rectangle_bg.png) no-repeat center center;
        background-size: 100% 100%;
        box-sizing: border-box;

        .header-box {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          .header-bg-box {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 668px;
            height: 45px;
            background: url(~@/assets/image/screen/Vector_bg.png) no-repeat center center;
            background-size: 100% 100%;

            &::before {
              position: absolute;
              content: "";
              bottom: -5px;
              width: 144px;
              height: 6px;
              background: url(~@/assets/image/screen/Rectangle_angle.png) no-repeat center center;
              background-size: 100% 100%;
            }

            .main-title {
              color: #fff;
              font-size: 20px;
              font-weight: bold;
            }
          }
        }

        .production-plant-box {
          padding: 20px 24px 24px;
          box-sizing: border-box;
          height: calc(100% - 45px);
        }
      }
    }

    .content-right {
      display: grid;
      grid-template-rows: repeat(3, 1fr);
      row-gap: 24px;
    }
  }

  .notice-bar-box {
    height: 44px;

    .notice-box {
      font-size: 20px;
      color: #ff0041;

      .orderNo {
        color: #fff;
        margin-right: 5px;
      }
    }
  }

  .progress-bar {
    width: 95px;
    height: 95px;
    font-size: 14px;
    font-weight: bold;
  }
}
</style>