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
              <AlarmTable :tableData="alarmData" :hasNotice="noticeData.length > 0" />
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
              <TrendChart :chartData="throughRateTrendData" height="100%" />
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
  getProductionMaterialsAlerts,
  getProductionScheduling,
  getThroughRateTrend,
  getThroughRateToday,
  getProductionRateToday,
} from "@/api/smartScreen";
import { getLargeScreenAlerts } from "@/api/production-management/alerts";
import categoryService from '@/utils/categoryService';
import productionPlant from "./components/productionPlant.vue";
import CommonData from "./components/commonData.vue";
import AlarmTable from "./components/alarmTable.vue";
import PreparationMeansProduction from "./components/preparationMeansProduction.vue";
import EchartsProgress from "./components/echartsProgress.vue";
import TrendChart from "./components/trendChart.vue";
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
    EchartsProgress,
    TrendChart,
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
      computerMap: new Map(), // 计算机ID到名称的映射
      categoryMap: new Map(), // 品类ID到名称的映射
      mappingLoaded: false, // 映射数据是否已加载完成
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
      throughRateTrendData: {}, // 直通率趋势数据（原始）
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

    // 并行加载数据，不阻塞页面初始显示
    this.initComputerMapping();
    this.getTodayInfo();
    this.getAlarmData();

    this.headerTimer = setInterval(() => {
      this.getHeaderTime();
    }, 1000);
    this.pageDataTimer = setInterval(() => {
      this.getTodayInfo();
      this.getAlarmData();
      this.loadThroughRateTrendData();
    }, 10 * 60 * 1000); // 10分钟刷新一次
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

    // 初始化计算机和品类映射（使用共享的CategoryService）
    async initComputerMapping() {
      try {
        const { categories, computers } = await categoryService.getCategoryData();

        // 构建品类映射
        categories.forEach(category => {
          this.categoryMap.set(category.id, category.name);
        });

        // 构建计算机映射
        computers.forEach(computer => {
          this.computerMap.set(computer.model, computer.name);
        });

        // 标记映射数据已加载完成
        this.mappingLoaded = true;

        // 映射加载完成后，更新已有数据中的型号名称
        this.updateComputerNames();

      } catch (error) {
        console.error('获取映射数据失败:', error);
        // 即使失败也设置标记，避免一直显示"获取中..."
        this.mappingLoaded = true;
      }
    },

    // 更新已有数据中的计算机名称
    updateComputerNames() {
      // 更新生产资料准备情况数据
      if (this.preparationData.length > 0) {
        this.preparationData = this.preparationData.map(item => ({
          ...item,
          computerName: this.getComputerName(item.computerId || item.computerName),
          categoryName: this.getCategoryName(item.categoryId)
        }));
      }

      // 更新生产实况数据
      if (this.productionSituationData.length > 0) {
        this.productionSituationData = this.productionSituationData.map(item => ({
          ...item,
          computerName: this.getComputerName(item.computerId || item.computerName)
        }));
      }
    },

    getTodayInfo() {
      // 并行获取所有今日数据
      Promise.all([
        getThroughRateToday(),
        getProductionRateToday()
      ]).then(([throughRateRes, productionRateRes]) => {
        // 处理今日直通率数据
        if (throughRateRes.code === 200 && throughRateRes.data) {
          const throughRateData = throughRateRes.data;
          // API返回格式: {"data":{"rate":0,"totalCount":0,"okCount":0},"code":200,"msg":"获取成功"}
          this.todayInfoData[0].value = throughRateData.okCount || 0;
          this.todayInfoData[0].total = throughRateData.totalCount || 0;
          this.todayInfoData[0].progress = throughRateData.rate || 0;
        }

        // 处理今日生产进度数据
        if (productionRateRes.code === 200 && productionRateRes.data) {
          const productionData = productionRateRes.data;
          // API返回格式: {"data":{"rate":0.00,"packagingTotalCount":0,"totalPlanCount":19},"code":200,"msg":"获取成功"}
          this.todayInfoData[1].value = productionData.packagingTotalCount || 0;
          this.todayInfoData[1].total = productionData.totalPlanCount || 0;
          this.todayInfoData[1].progress = productionData.rate || 0;
        }
      }).catch((error) => {
        console.error('获取新API数据失败，降级到原有接口:', error);
        // 降级到原有接口
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
        }).catch((fallbackError) => {
          console.error('原有接口也失败:', fallbackError);
        });
      });

      // 并行获取生产实况数据和生产资料数据
      this.loadProductionSituationData();
      this.loadMaterialsData();
      this.loadThroughRateTrendData();
    },

    // 生成模拟生产实况数据
    generateMockProductionData() {
      const mockData = [];
      const computerIds = ['C001', 'C002', 'C003', 'C004', 'C005'];
      const computerNames = ['迪太DT-8000', '迪太DT-9000', '迪太DT-7500', '迪太DT-6800', '迪太DT-8500'];
      const orderPrefixes = ['WO', 'PO', 'SO', 'MO'];

      for (let i = 0; i < 8; i++) {
        const computerId = computerIds[i % computerIds.length];
        const computerName = computerNames[i % computerNames.length];
        const orderPrefix = orderPrefixes[i % orderPrefixes.length];
        const orderNum = String(Math.floor(Math.random() * 9000) + 1000);
        const orderNo = `${orderPrefix}${orderNum}`;

        // 生成日期（最近7天内的随机日期）
        const daysAgo = Math.floor(Math.random() * 7);
        const feedingDate = this.moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');

        // 生成计划完成时间（未来1-5天）
        const futureDays = Math.floor(Math.random() * 5) + 1;
        const completeTime = this.moment().add(futureDays, 'days').add(Math.floor(Math.random() * 24), 'hours').format('YYYY-MM-DD HH:mm');

        // 生成数量数据
        const plannedCount = Math.floor(Math.random() * 500) + 100; // 100-600
        const completedCount = Math.floor(plannedCount * (0.3 + Math.random() * 0.7)); // 30%-100%完成
        const configCount = Math.floor(Math.random() * 8) + 2; // 2-10个配置

        // 计算达成率
        const reach = Math.round((completedCount / plannedCount) * 100);

        mockData.push({
          feedingDate: feedingDate,
          orderNo: orderNo,
          computerName: computerName,
          iqcCount: plannedCount, // 半成品（计划数量）
          oqcCount: completedCount, // 成品（完成数量）
          dcdCount: configCount, // 配置数量
          num: plannedCount, // 计划数量
          date: completeTime, // 计划完成时间
          reach: reach, // 达成率
          computerId: computerId,
          _mock: true // 标记为模拟数据
        });
      }

      return mockData;
    },

    // 加载生产实况数据 - 使用新的排产调度接口
    async loadProductionSituationData() {
      try {
        // 开发环境下可以使用模拟数据
        const useMockData = process.env.NODE_ENV !== 'development' && true; // 设置为true启用模拟数据

        if (useMockData) {
          this.productionSituationData = this.generateMockProductionData();
          return;
        }

        const res = await getProductionScheduling();
        if (res.code === 200) {
          // 将排产调度数据转换为生产实况格式
          this.productionSituationData = (res.data || []).map(item => {
            // 计算达成率 - 基于详情数据
            let reach = 0;
            if (item.detailList && item.detailList.length > 0) {
              const totalPlanned = item.detailList.reduce((sum, detail) => sum + (detail.num || 0), 0);
              const completed = item.orderQuantity || 0; // 使用订单数量作为完成数量的参考
              if (totalPlanned > 0) {
                reach = Math.round((completed / totalPlanned) * 100);
              }
            }

            return {
              feedingDate: this.formatDate(item.date), // 上料日期 = 生产日期
              orderNo: item.orderCode || item.no, // 工单号 = 订单编号或排产单号
              computerName: this.getComputerName(item.computerId), // 型号
              iqcCount: item.detailList ? item.detailList.reduce((sum, detail) => sum + (detail.num || 0), 0) : 0, // 半成品 = 计划数量总和
              oqcCount: item.orderQuantity || 0, // 成品 = 订单数量
              dcdCount: item.configList ? item.configList.length : 0, // 配置 = 配置列表数量
              num: item.num || item.orderQuantity || 0, // 计划数量
              date: this.formatDateTime(item.endDate), // 计划完成时间
              reach: reach, // 达成率
              // 保存原始ID用于后续映射更新
              computerId: item.computerId,
              // 保留原始数据用于调试
              _original: item
            };
          });
        }
      } catch (error) {
        console.error('获取生产实况数据失败:', error);
        this.productionSituationData = [];
      }
    },

    // 加载生产资料数据
    async loadMaterialsData() {
      try {
        const res = await getProductionMaterialsAlerts();
        if (res.code === 200) {
          // 转换新API数据结构，先显示基础数据
          this.preparationData = (res.data || []).map(item => {
            return {
              date: this.formatDate(item.date),
              orderNo: item.orderCode,
              computerName: this.getComputerName(item.computerId),
              configAuditStatus: this.getConfigAuditStatus(item.instrumentState),
              productionPermitStatus: item.isLicense,
              materialStatus: item.materialState,
              // 新增字段
              batchNo: item.batchNo || '--',
              categoryId: item.categoryId,
              categoryName: this.getCategoryName(item.categoryId),
              num: item.num || 0,
              schedulingId: item.schedulingId,
              // 保存原始ID用于后续映射更新
              computerId: item.computerId
            };
          });
        }
      } catch (error) {
        console.error('获取生产资料准备情况失败:', error);
        this.preparationData = [];
      }
    },

    // 加载直通率趋势数据
    async loadThroughRateTrendData() {
      try {
        const res = await getThroughRateTrend();
        if (res.code === 200) {
          this.throughRateTrendData = res.data || {};
        }
      } catch (error) {
        console.error('获取直通率趋势数据失败:', error);
        this.throughRateTrendData = {};
      }
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

    // 格式化日期时间戳
    formatDate(timestamp) {
      if (!timestamp) return '--';
      return this.moment(timestamp).format('YYYY-MM-DD');
    },

    // 格式化日期时间戳 - 包含时间
    formatDateTime(timestamp) {
      if (!timestamp) return '--';
      return this.moment(timestamp).format('YYYY-MM-DD HH:mm');
    },

    // 根据配置审核状态映射到显示状态
    getConfigAuditStatus(instrumentState) {
      // instrumentState: 0初始录入 1市场已确认 2研发已确认 3已发布
      // 映射为: 0未审核 1已审核
      return instrumentState >= 3 ? 1 : 0;
    },

    // 根据计算机ID获取计算机名称
    getComputerName(computerId) {
      if (!computerId) return '--';

      // 如果映射数据还未加载完成，显示"获取中..."
      if (!this.mappingLoaded) {
        return '获取中...';
      }

      // 映射完成后，返回映射的名称或原ID
      return this.computerMap.get(computerId) || computerId;
    },

    // 根据品类ID获取品类名称
    getCategoryName(categoryId) {
      if (!categoryId) return '--';

      // 如果映射数据还未加载完成，显示"获取中..."
      if (!this.mappingLoaded) {
        return '获取中...';
      }

      // 映射完成后，返回映射的名称或原ID
      return this.categoryMap.get(categoryId) || categoryId;
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