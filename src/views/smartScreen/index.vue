<template>
  <dv-full-screen-container>
    <div class="smart-screen-container">
      <div class="header">
        <div class="logo">
          <img
            class="logo-icon"
            src="~@/assets/image/screen/power_logo.png"
            alt="logo"
          />
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
            <div
              class="content--top-item"
              v-for="(item, index) in todayInfoData"
              :key="index"
            >
              <div class="main-title">
                {{ item.title }}
              </div>
              <div class="main-content">
                <div class="progress-box">
                  <el-progress
                    type="circle"
                    :percentage="item.progress"
                    :width="89"
                    :stroke-width="10"
                    color="#00E8B5"
                    text-color="#fff"
                    define-back-color="#F6FFFC"
                  ></el-progress>
                </div>
                <div class="main-right-box">
                  <div class="top">
                    <img
                      src="~@/assets/image/screen/XMLID-flud.png"
                      alt="XMLID-flud"
                    />
                    <span class="current-count">{{ item.value }}</span>
                    <span class="sub-title">{{ item.subTitle }}</span>
                  </div>
                  <div class="bottom">
                    <span class="sub-title">总数量</span>
                    <span class="total-count">{{ item.total }}</span>
                    <img
                      src="~@/assets/image/screen/XMLID.png"
                      alt="XMLID-flud"
                    />
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
            <!-- <dv-border-box-11 title="生产实况" :color="['#196E96']"> -->
            <div class="production-plant-box">
              <production-plant></production-plant>
            </div>
            <!-- </dv-border-box-11> -->
          </div>
        </div>
        <div class="content-right"></div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>
import {
  getScreenTodayProgress,
  getScreenProductionMeans,
} from "@/api/smartScreen";
import productionPlant from "./components/productionPlant.vue";

export default {
  components: { productionPlant },
  name: "smartScreen",
  data() {
    return {
      currentTime: "--",
      currentDate: "--",
      currentWeekday: "--",
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
        {
          title: "今日备料情况",
          subTitle: "备料数量",
          value: 0,
          total: 0,
          progress: 0,
        },
      ],
      headerTimer: null,
    };
  },
  created() {
    this.headerTimer = setInterval(() => {
      this.getHeaderTime();
    }, 1000);
    this.getTodayInfo();
  },
  destroyed() {
    clearInterval(this.headerTimer);
  },
  methods: {
    getHeaderTime() {
      this.currentTime = this.moment().format("HH:mm:ss");
      this.currentDate = this.moment().format("YYYY-MM-DD");
      this.currentWeekday = this.moment().locale("zh-cn").format("dddd");
    },

    getTodayInfo() {
      getScreenTodayProgress().then((res) => {
        console.log(res);
        const { data } = res;
        this.todayInfoData[0].value = data.throughCompleteNum;
        this.todayInfoData[0].total = data.throughTotalNum;
        if (data.throughTotalNum) {
          this.todayInfoData[0].progress =
            data.throughCompleteNum / data.throughTotalNum;
        }

        this.todayInfoData[1].value = data.productCompleteNum;
        this.todayInfoData[1].total = data.productNum;
        if (data.productNum) {
          this.todayInfoData[1].progress =
            data.productCompleteNum / data.productNum;
        }

        this.todayInfoData[2].value = data.preparationCompleteNum;
        this.todayInfoData[2].total = data.preparationTotalNum;
        if (data.preparationTotalNum) {
          this.todayInfoData[2].progress =
            data.preparationCompleteNum / data.preparationTotalNum;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.smart-screen-container {
  width: 100%;
  height: 100%;
  background: url("~@/assets/image/screen/screen-bg.png") no-repeat center
    center #181843;
  background-size: 100% 100%;
  padding: 8px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 63px 1fr;

  .header {
    display: grid;
    grid-template-columns: 25% 1fr 25%;
    align-content: center;
    width: 100%;
    height: 63px;
    padding: 0 20px;
    background: url("~@/assets/image/screen/header_bg.png") no-repeat center
      center;
    background-size: 100% 100%;
    box-sizing: border-box;

    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 198px;
      height: 43px;
      background: url("~@/assets/image/screen/logo_bg.png") no-repeat center
        center;
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
    grid-template-columns: 1fr 714px;
    column-gap: 24px;

    .content-left {
      display: grid;
      grid-template-rows: 200px 1fr;
      row-gap: 24px;
      .content-left-top {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 20px;

        .content--top-item {
          display: grid;
          grid-template-rows: 42px 1fr;
          height: 200px;
          background: url(~@/assets/image/screen/Frame.png) no-repeat center
            center;
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
            padding: 0 23px;

            .progress-box {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 107px;
              height: 107px;
              border: 1px solid rgba(31, 198, 255, 0.32);
              border-radius: 50%;
              box-sizing: border-box;
            }

            .main-right-box {
              display: grid;
              row-gap: 7px;
              .top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 14px;
                box-sizing: border-box;
                width: 182px;
                height: 50px;
                background: url(~@/assets/image/screen/Rectangle-bottom.png)
                  no-repeat center center;
                background-size: 100% 100%;

                .current-count {
                  font-weight: bold;
                  font-size: 26px;
                  color: #00e8b5;
                  margin-bottom: 5px;
                }

                .sub-title {
                  font-weight: 400;
                  font-size: 14px;
                  color: #b4c0cc;
                  margin-bottom: 5px;
                }
              }

              .bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 14px;
                box-sizing: border-box;
                width: 182px;
                height: 50px;
                background: url(~@/assets/image/screen/Rectangle-top.png)
                  no-repeat center center;
                background-size: 100% 100%;

                .sub-title {
                  font-weight: 400;
                  font-size: 14px;
                  color: #b4c0cc;
                  margin-top: 10px;
                }

                .total-count {
                  font-weight: bold;
                  font-size: 26px;
                  color: #ffffff;
                  margin-top: 10px;
                }
              }

              img {
                width: 22px;
                height: 22px;
              }
            }
          }
        }
      }

      .content-left-bottom {
        background: url(~@/assets/image/screen/Rectangle_bg.png) no-repeat
          center center;
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
            background: url(~@/assets/image/screen/Vector_bg.png) no-repeat
              center center;
            background-size: 100% 100%;

            &::before {
              position: absolute;
              content: "";
              bottom: -5px;
              width: 144px;
              height: 6px;
              background: url(~@/assets/image/screen/Rectangle_angle.png) no-repeat
                center center;
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

    }
  }
}
</style>