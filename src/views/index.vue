<template>
  <div class="dashboard-editor-container font14">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="8">
        <el-card shadow="nerver" class="production-box">
          <h3 class="text-center">生产计划表</h3>
          <div class="text-right margin-top-lg" v-if="checkRole(['PMC'])">
            <el-button
              type="primary"
              @click="$router.push('/www/planSchedule')"
            >
              去排产
            </el-button>
          </div>
          <div v-loading="isLoading">
            <div
              ref="productionRef"
              class="margin-top-lg production-list overflow-y"
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
                  <div
                    slot="description"
                    class="margin-top-xs margin-bottom-xs"
                  >
                    <template v-if="isListDataLen(listData)">
                      <div
                        class="text-blue margin-bottom-xs plan-title pointer"
                        v-for="(item, index) in listData"
                        :key="index"
                        @click="
                          $router.push({
                            name: 'PlanSchedule',
                            params: { listId: item.id },
                          })
                        "
                      >
                        {{ item.computerName }}
                        在{{ item.address }}
                        {{ item.process }}
                        {{ item.num }} pcs
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-black no-plan">暂无计划</span>
                    </template>
                  </div>
                </el-step>
              </el-steps>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="16">
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
  </div>
</template>

<script>
import PieChart from "./dashboard/PieChart";
import Log from "@/views/third/emphasis/components/log";
import Update from "@/views/third/emphasis/components/update";
import AddLog from "@/views/third/emphasis/components/addLog";
import { emphasisList, emphasisDel } from "@/api/third/emphasis";
import { homeProduction } from "@/api/home/index";
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
      productionList: {},
      openLog: false,
      openUpdate: false,
      openAddLog: false,
      logRow: {},
      rowUpdate: {},
      checked: false,
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
    getHomeProductionAll() {
      this.isLoading = true;
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
          this.isLoading = false;
          const dateArr = Object.keys(this.productionList);
          dateArr.forEach((date) => {
            if (this.isToday(date)) {
              this.$nextTick(() => {
                const todayItemOffsetTop =
                  document.getElementsByClassName("todayItemRef")[0].offsetTop;
                this.$refs.productionRef.scrollTop = todayItemOffsetTop;
              });
            } else {
              this.$refs.productionRef.scrollTop = 0;
            }
          });
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
  },
};
</script>

<style lang="scss">
.row-val-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-editor-container {
  padding: 10px 0;
  position: relative;

  .production-box {
    height: 89vh;
    max-height: calc(100vh - 104px);
    padding-bottom: 20px;
    box-sizing: border-box;

    .production-list {
      max-height: calc(100vh - 270px);

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
