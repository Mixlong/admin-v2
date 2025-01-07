<template>
  <div class="dashboard-editor-container font14 app-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="14">
        <el-card shadow="nerver" class="production-box">
          <h3 class="text-center">生产计划表</h3>
          <div class="text-right margin-top-lg" v-if="checkRole(['PMC'])">
            <el-button
              type="primary"
              size="mini"
              @click="$router.push('/www/planSchedule')"
            >
              去排产
            </el-button>
            <el-button
              type="success"
              size="mini"
              @click="getHomeProductionAll"
            >
              刷新
            </el-button>
          </div>
          <div v-loading="isLoading" class="margin-top-lg">
            <el-row :gutter="20">
              <el-col :span="12">
                <b class="padding-left-lg">日期</b>
              </el-col>
              <el-col :span="4" class="text-center">
                <b>客户确认状态</b>
              </el-col>
              <el-col :span="4" class="text-center">
                <b>测试状态</b>
              </el-col>
              <el-col :span="4" class="text-center">
                <b>许可状态</b>
              </el-col>
            </el-row>

            <div
              ref="productionRef"
              class="production-list overflow-y margin-top-xs"
            >
              <el-steps direction="vertical">
                <el-step
                  :class="{ todayItemRef: isToday(date) }"
                  v-for="(listData, date) in productionList"
                  :key="date"
                >
                  <template slot="icon">
                    <div></div>
                  </template>
                  <div slot="title" class="text-black date-title">
                    {{ date }}
                    <span v-show="isToday(date)">
                      (<span class="today-txt">今日</span>)
                    </span>
                  </div>
                  <div slot="description" class="prod-order-box">
                    <template v-if="isListDataLen(listData)">
                      <el-row
                        :gutter="20"
                        v-for="(item, index) in listData"
                        :key="index"
                      >
                        <el-col :span="24">
                          <el-col :span="12">
                            <div
                              :class="['text-blue', 'plan-title', { 'pointer': checkRole(['PMC']) }]"
                              @click="toPlanSchedule(item)"
                            >
                              {{ item.computerName }}
                              在{{ item.address }}
                              {{ item.process }}
                              {{ item.num }} pcs
                            </div>
                          </el-col>
                          <el-col :span="4" class="text-center">
                            <el-dropdown trigger="click" style="width: 100%">
                              <el-button
                                :type="
                                  item.customerStatus === 0
                                    ? 'danger'
                                    : 'primary'
                                "
                                size="mini"
                                plain
                                style="width: 100%"
                              >
                                {{
                                  isStatusText(
                                    item.customerStatus,
                                    item.customerDate
                                  )
                                }}
                                <i
                                  class="el-icon-arrow-down el-icon--right"
                                ></i>
                              </el-button>
                              <el-dropdown-menu
                                slot="dropdown"
                                v-if="checkRole(['product'])"
                              >
                                <el-dropdown-item
                                  @click.native="handleCustomerStatus(0, item)"
                                >
                                  未确认
                                </el-dropdown-item>
                                <el-dropdown-item
                                  @click.native="handleCustomerStatus(1, item)"
                                >
                                  已确认
                                </el-dropdown-item>
                                <el-dropdown-item
                                  @click.native="handleSelDate(1, item)"
                                >
                                  选择日期
                                </el-dropdown-item>
                                <!-- <el-dropdown-item>
                                  <el-popover
                                    placement="right"
                                    width="400"
                                    trigger="hover"
                                  >
                                    <el-date-picker
                                      v-model="item.customerDate"
                                      type="date"
                                      placeholder="选择日期"
                                      value-format="timestamp"
                                    >
                                    </el-date-picker>
                                    <template #reference>
                                      <span>选择日期</span>
                                    </template>
                                  </el-popover>
                                </el-dropdown-item> -->

                                <!-- <el-dropdown-item
                                  v-for="(label, value) in customerStatusTextList"
                                  :command="value"
                                >
                                  {{ label }}
                                </el-dropdown-item> -->
                              </el-dropdown-menu>
                            </el-dropdown>
                          </el-col>
                          <el-col :span="4" class="text-center">
                            <el-dropdown trigger="click" style="width: 100%">
                              <el-button
                                :type="
                                  item.testStatus === 0 ? 'danger' : 'primary'
                                "
                                size="mini"
                                plain
                                style="width: 100%"
                              >
                                {{
                                  isStatusText(item.testStatus, item.testDate)
                                }}
                                <i
                                  class="el-icon-arrow-down el-icon--right"
                                ></i>
                              </el-button>
                              <el-dropdown-menu
                                slot="dropdown"
                                v-if="checkRole(['test'])"
                              >
                                <el-dropdown-item
                                  @click.native="handleTestStatus(0, item)"
                                >
                                  未确认
                                </el-dropdown-item>
                                <el-dropdown-item
                                  @click.native="handleTestStatus(1, item)"
                                >
                                  已确认
                                </el-dropdown-item>
                                <el-dropdown-item
                                  @click.native="handleSelDate(2, item)"
                                >
                                  选择日期
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                          </el-col>
                          <el-col :span="4" class="text-center">
                            <el-button
                              v-show="item.isLicense === 1"
                              type="primary"
                              size="mini"
                              plain
                              style="margin: 0; width: 100%"
                            >
                              已许可
                            </el-button>
                            <el-button
                              v-show="item.isLicense !== 1"
                              type="danger"
                              size="mini"
                              plain
                              style="margin: 0; width: 100%"
                            >
                              未许可
                            </el-button>
                          </el-col>
                        </el-col>
                        <el-col :span="24">
                          <el-divider></el-divider>
                        </el-col>
                      </el-row>
                    </template>
                    <template v-else>
                      <div class="text-black no-plan margin-top-xs margin-bottom-xs">暂无计划</div>
                    </template>
                  </div>
                </el-step>
              </el-steps>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="10">
        <el-card shadow="always" class="production-box">
          <el-row class="margin-bottom-xs">
            <el-col :offset="8" :span="8" class="text-center">重点事项 </el-col>
            <el-col class="text-gray text-right font14" :span="8">
              <span class="margin-left">
                共{{ homeEmphasisList.length }}条
              </span>
            </el-col>
          </el-row>
          <el-table
            class="sort-table"
            :data="homeEmphasisList"
            :height="tableHeightFull"
            header-cell-class-name="bg-white"
            border
            @row-click="rowClick"
            cell-class-name="pointer"
          >
            <el-table-column
              prop="content"
              label="内容"
              align="left"
              header-align="center"
            >
              <template slot-scope="scope">
                <div v-html="scope.row.content"></div>
              </template>
            </el-table-column>
            <el-table-column
              label="日志"
              align="center"
              prop="problem"
              width="666px"
            >
              <template slot-scope="scope">
                <div class="flex align-center progress-text">
                  <div class="add-icon">
                    <i
                      v-if="scope.row.createUser == userId"
                      class="el-icon-circle-plus text-blue font18"
                      style="cursor: pointer"
                      @click.stop="handleLogAdd(scope.row)"
                    ></i>
                  </div>
                  <div>
                    <div
                      v-for="(item, o) in scope.row.logList"
                      :key="o"
                      class="text-left margin-left-xs"
                      :class="difference(item.logTime)"
                    >
                      <template v-if="o < 1">
                        【{{ item.logTime.slice(0, 11) }}】:
                        <span v-html="item.note"></span>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <!-- <Log
      ref="log"
      :visible.sync="openLog"
      :logRow="logRow"
      @openUpdate="handleUpdateLog"
      @openAdd="handleAddLog"
      :isEdit="userId == logRow.createUser"
    /> -->
    <!-- <Update
      :visible.sync="openUpdate"
      :pmDictListOptions="pmDictListOptions"
      :stateOptions="stateOptions"
      :rowUpdate="rowUpdate"
    /> -->
    <!-- <AddLog :visible.sync="openAddLog" :logRow="logRow" /> -->

    <el-dialog
      :title="isTitle"
      :visible.sync="dialogVisible"
      width="350px"
      top="2vh"
      center
    >
      <el-date-picker
        v-model="dateTime"
        type="date"
        placeholder="选择日期"
        value-format="timestamp"
        :picker-options="pickerOptions"
        style="width: 100%"
      >
      </el-date-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PieChart from "./dashboard/PieChart";
import Log from "@/views/third/emphasis/components/log";
import Update from "@/views/third/emphasis/components/update";
import AddLog from "@/views/third/emphasis/components/addLog";
import { emphasisList, emphasisDel } from "@/api/third/emphasis";
import { homeProduction, homeProductionStatus } from "@/api/home/index";
import { memberDictUser } from "@/api/system/user";
import { mapGetters } from "vuex";

export default {
  name: "Index",
  components: {
    PieChart,
    Log,
    Update,
    AddLog,
  },
  data() {
    return {
      isTitle: "",
      dialogVisible: false,
      dateTime: "",
      currentSelTimeType: null,
      currentSelData: {},
      isLoading: false,
      homeEmphasisList: [],
      pmDictListOptions: [],
      stateOptions: [
        {
          key: "进行中",
          value: 1,
        },
        {
          key: "已完成",
          value: 2,
        },

        {
          key: "暂停",
          value: 3,
        },
        {
          key: "已取消",
          value: 4,
        },
      ],
      customerStatusTextList: {
        0: "未确认",
        1: "已确认",
        2: "选择日期",
      },
      productionList: {},
      openLog: false,
      openUpdate: false,
      openAddLog: false,
      logRow: {},
      rowUpdate: {},
      checked: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 24 * 3600 * 1000;
        },
      },
    };
  },
  computed: {
    ...mapGetters(["userId"]),
    isListDataLen() {
      return (listData) => {
        if (listData.length > 0) {
          return true;
        } else {
          return false;
        }
      };
    },
    productionTitle() {
      return (data) => {
        if (data) {
          return `${data.computerName}${data.address}${data.num}pcs`;
        }
      };
    },
    isToday() {
      return (date) => {
        return date === this.moment().format("YYYY-MM-DD");
      };
    },
    tableHeight() {
      let win = document.documentElement.clientHeight;
      return (win - 272) / 2;
    },
    tableHeightFull() {
      let win = document.documentElement.clientHeight;
      return win - 150;
    },
    // 客户确认状态选择值
    isStatusText() {
      return (status, date) => {
        switch (status) {
          case 0:
            return "未确认";
          case 1:
            return "已确认";
          case 2:
            const finishedTime = this.moment.unix(date).format("MM/DD");
            return `预计${finishedTime}完成`;
          default:
            return "请选择";
        }
      };
    },
    // 测试状态选择值
    // isTestStatusText() {
    //   return (status) => {
    //     switch (status) {
    //       case 0:
    //         return "未完成";
    //       case 1:
    //         return "已完成";
    //     }
    //   };
    // },
  },
  created() {
    this.getHomeProductionAll();
  },
  mounted() {
    this.checked =
      localStorage.getItem("home-checked") == "true" ? true : false || false;
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
    getHomeProductionAll(isUpdate = true) {
      isUpdate && (this.isLoading = true);
      const data = Promise.all([
        homeProduction({ type: 1 }),
        homeProduction({ type: 2 }),
        homeProduction({ type: 4 }),
      ]);
      data
        .then((res) => {
          this.productionList = {
            ...res[0].data,
            ...res[1].data,
            ...res[2].data,
          };

          if (isUpdate) {
            this.isLoading = false;
            const dateArr = Object.keys(this.productionList);
            dateArr.forEach((date) => {
              if (this.isToday(date)) {
                this.$nextTick(() => {
                  const todayItemOffsetTop =
                    document.getElementsByClassName("todayItemRef")[0]
                      .offsetTop;
                  this.$refs.productionRef.scrollTop = todayItemOffsetTop - 40;
                });
              } else {
                this.$refs.productionRef.scrollTop = 0;
              }
            });
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    getList() {
      // 暂时先去掉（接口已换）  2023/4/12
      //重点事项
      // emphasisList().then((res) => {
      //   let { data } = res;
      //   if (checked) {
      //     let list = [];
      //     for (let key of data) {
      //       if (
      //         key.userList.findIndex((item) => item.userId == this.userId) > -1
      //       ) {
      //         list.push(key);
      //       }
      //     }
      //     this.homeEmphasisList = list;
      //   } else {
      //     this.homeEmphasisList = data;
      //   }
      //   localStorage.setItem("home-checked", checked);
      // });
    },

    replaceHtml(str) {
      if (str) {
        return str.replace(/<[^<>]+>/g, "").replace(/&nbsp;/gi, "");
      }
      return "";
    },
    jumpMyTask() {
      this.$router.push({
        path: "/prodData/myTask",
      });
    },
    jump() {
      this.$router.push({
        path: "/productData/fileConfig",
        query: {
          status: 1,
        },
      });
    },
    fnUserName(list, id) {
      let value = "";
      for (let key of list) {
        let findData = this.pmDictListOptions.filter(
          (item) => item.dictValue == key.userId
        );
        if (findData.length) {
          value += "、" + findData[0].dictLabel;
        }
      }
      return value ? value.slice(1) : "";
    },
    fnStateName(row) {
      let findData = this.stateOptions.filter(
        (item) => item.value == row.state
      );
      if (findData.length) {
        return findData[0].key;
      }
      return "";
    },
    rowClick(row, column) {
      let index = this.homeEmphasisList.findIndex((item) => item.id == row.id);

      this.$router.push({
        path: "/prodData/emphasis",
        query: { idx: index },
      });
    },
    sampleRowClick(row, column, event) {
      this.$router.push({
        path: "/prodData/sample",
        query: {
          name: row.customerName,
        },
      });
    },
    handleLogAdd(row) {
      this.logRow = row;
      this.openAddLog = true;
    },
    saleRowClick(row) {
      this.$router.push({
        path: "/prodData/afterSale",
        query: {
          name: row.product,
        },
      });
    },
    rowStyle() {
      return { cursor: "pointer" };
    },
    jumpProject(row) {
      this.$router.push({
        path: "/prodData/govern",
        query: {
          id: row.id,
        },
      });
    },
    /**判断履历进展为当日显示高亮红色 */
    difference(endTime) {
      let dateBegin = new Date(endTime);
      let dateEnd = new Date();
      let dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
      let dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
      let leave1 = dateDiff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      let hours = Math.floor(leave1 / (3600 * 1000)); //计算出小时数
      //计算相差分钟数
      let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      let minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
      //计算相差秒数
      let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      let seconds = Math.round(leave3 / 1000);
      let className = "";
      if (dayDiff <= 3) {
        className = "text-red";
      }
      return className;
    },
    handleUpdateLog(row) {
      this.logRow.isAdd = false;
      this.logRow.update = row;
      this.openAddLog = true;
    },
    handleAddLog() {
      delete this.logRow.update;

      this.openAddLog = true;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否删除" + '"' + +row.title + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return emphasisDel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    // 客户确认状态
    handleCustomerStatus(customerStatus, data) {
      let { customerDate, id, testDate, testStatus } = data;
      customerDate =
        customerDate && String(customerDate).length === 13
          ? Math.floor(customerDate / 1000)
          : "";

      homeProductionStatus({
        customerDate,
        customerStatus,
        schedulingId: id,
        testDate,
        testStatus,
      })
        .then((res) => {
          console.log(res);
          this.getHomeProductionAll(false);
        })
        .finally(() => {
          this.dialogVisible = false;
        });
    },

    // 测试确认状态
    handleTestStatus(testStatus, data) {
      let { customerDate, id, testDate, customerStatus } = data;
      testDate =
        testDate && String(testDate).length === 13
          ? Math.floor(testDate / 1000)
          : "";

      homeProductionStatus({
        customerDate,
        customerStatus,
        schedulingId: id,
        testDate,
        testStatus,
      })
        .then((res) => {
          console.log(res);
          this.getHomeProductionAll(false);
        })
        .finally(() => {
          this.dialogVisible = false;
        });
    },

    // 客户确认选择日期
    handleSelDate(type, data) {
      this.currentSelTimeType = type;
      this.currentSelData = Object.assign({}, data);

      this.isTitle = type === 1 ? "客户确认日期" : "测试确认日期";
      this.dialogVisible = true;
      this.dateTime = "";

      if (type === 1 && data.customerDate) {
        this.dateTime = data.customerDate * 1000;
      }

      if (type === 2 && data.testDate) {
        this.dateTime = data.testDate * 1000;
      }
    },
    handleSubmit() {
      if (!this.dateTime) {
        this.msgWarning("请选择日期");
        return;
      }

      if (this.currentSelTimeType === 1) {
        const data = { ...this.currentSelData, customerDate: this.dateTime };
        this.handleCustomerStatus(2, data);
      }

      if (this.currentSelTimeType === 2) {
        const data = { ...this.currentSelData, testDate: this.dateTime };
        this.handleTestStatus(2, data);
      }
    },

    toPlanSchedule(item) {
      if(!this.checkRole(['PMC'])) {
        return
      }

      this.$router.push({
        name: "PlanSchedule",
        params: { listId: item.id },
      });
    },
  },
};
</script>

<style lang="scss">
.row-val-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prod-order-box {
  .el-row {
    .el-col {
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.3s ease;
      padding: 4px;
      border-radius: 6px;
      box-sizing: border-box;
      &:hover {
        background: #f5f5f5;
      }

      .el-divider {
        margin: 4px 0;
        background: #f1f1f1;
      }
    }
  }
}

.dashboard-editor-container {
  padding: 10px;
  position: relative;

  .production-box {
    height: 100vh;
    max-height: calc(100vh - 70px);
    padding-bottom: 20px;
    box-sizing: border-box;

    .production-list {
      max-height: calc(100vh - 310px);

      /* 
        修改步骤条圆圈样式
      */
      .el-step__head {
        width: 12px;

        .el-step__line {
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
        }

        .el-step__icon {
          width: 12px;
          height: 12px;
        }
      }

      .el-step__description {
        padding-right: 0;
      }

      .plan-title,
      .date-title {
        font-size: 13px;
      }
    }

    .no-plan {
      font-size: 13px;
    }

    .today-txt {
      color: red;
      font-weight: bold;
    }
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .el-card__body {
    padding: 15px 20px 0px 20px;
  }

  .more-style {
    height: 36px;
  }

  .home-html-style {
    p {
      margin: 0;
    }
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

.progress-text {
  .add-icon {
    transition: all 0.15s linear;
    min-width: 0;
    width: 0;
    opacity: 0;
  }
}

.showIcon {
  &:hover {
    .add-icon {
      min-width: 25px;
      width: 25px;
      opacity: 1;
    }
  }
}
</style>
