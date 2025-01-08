<template>
  <div>
    <div class="flex justify-between align-center">
      <span></span>
      <h3 class="text-center">生产计划表</h3>
      <div class="text-right" v-if="checkRole(['PMC'])">
        <el-button
          type="primary"
          size="mini"
          @click="$router.push('/www/planSchedule')"
        >
          去排产
        </el-button>
        <el-button type="success" size="mini" @click="getHomeProductionAll">
          刷新
        </el-button>
      </div>
    </div>
    <el-table
      classs="plan-order-table"
      ref="planOrderRef"
      v-loading="isLoading"
      :data="productionList"
      :height="isTestTabHeight"
      @cell-dblclick="onDbClick"
      :cell-class-name="getCellClassName"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="date" label="日期" align="center" width="120">
        <template slot-scope="{ row }">
          {{ parseTime(row.date, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column prop="computerName" label="型号" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.computerName" style="text-decoration: underline;">
            {{ row.computerName }}
          </span>
          <span v-else>- - -</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="生产地点"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.address"></span>
      </el-table-column>
      <el-table-column
        prop="process"
        label="生产阶段"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.process"></span>
      </el-table-column>
      <el-table-column prop="num" label="生产数量" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.num"></span>
      </el-table-column>
      <el-table-column label="SMT资料" align="center">
        <el-table-column
          prop="pucsStatus"
          label="JS脚本"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[1].length"
              :row="row"
              currentDataName="JS脚本"
              :currentIndex="1"
            >
            </miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="hardStatus"
          label="硬件资料"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[2].length"
              :row="row"
              currentDataName="硬件资料"
              :currentIndex="2"
            >
            </miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="softStatus"
          label="软件资料"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[3].length"
              :row="row"
              currentDataName="软件资料"
              :currentIndex="3"
            ></miss-data>

            <template v-else> - - - </template>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="组装资料" align="center">
        <el-table-column
          prop="configStatus"
          label="配置文件"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[4].length"
              :row="row"
              currentDataName="配置文件"
              :currentIndex="4"
            ></miss-data>

            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="testStatus"
          label="测试上位机"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[5].length"
              :row="row"
              currentDataName="测试上位机"
              :currentIndex="5"
            ></miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="snStatus"
          label="SN规则"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <miss-data
              v-if="row.mapFile[6].length"
              :row="row"
              currentDataName="SN规则"
              :currentIndex="6"
            ></miss-data>

            <template v-else> - - - </template>
          </template>
        </el-table-column> -->
      </el-table-column>
      <el-table-column
        prop="customerStatus"
        label="客户确认状态"
        align="center"
        width="140"
      >
        <template v-slot="{ row, $index }">
          <el-dropdown trigger="click" style="width: 100%">
            <el-button
              :type="row.customerStatus === 0 ? 'danger' : 'primary'"
              size="mini"
              plain
              style="width: 100%; font-size: 11px"
              :disabled="!row.num"
            >
              {{ isStatusText(row.customerStatus, row.customerDate) }}
              <i class="el-icon-arrow-down el-icon--right" v-if="checkRole(['product']) && row.num > 0"></i>
            </el-button>
            <el-dropdown-menu
              slot="dropdown"
              :disabled="checkRole(['product']) && row.num > 0"
            >
              <el-dropdown-item @click.native="handleCustomerStatus(0, row)">
                未确认
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleCustomerStatus(1, row)">
                已确认
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleSelDate(1, row)">
                选择日期
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>

      <el-table-column
        prop="testStatus"
        label="测试状态"
        align="center"
        width="140"
      >
        <template v-slot="{ row, $index }">
          <el-dropdown trigger="click" style="width: 100%">
            <el-button
              :type="row.testStatus === 0 ? 'danger' : 'primary'"
              size="mini"
              plain
              style="width: 100%; font-size: 11px"
              :disabled="!row.num"
            >
              {{ isStatusText(row.testStatus, row.testDate) }}
              <i class="el-icon-arrow-down el-icon--right" v-if="checkRole(['test']) && row.num > 0"></i>
            </el-button>
            <el-dropdown-menu
              slot="dropdown"
              v-if="checkRole(['test']) && row.num > 0"
            >
              <el-dropdown-item @click.native="handleTestStatus(0, row)">
                未确认
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleTestStatus(1, row)">
                已确认
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleSelDate(2, row)">
                选择日期
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column
        prop="isLicense"
        label="许可状态"
        align="center"
        width="140"
      >
        <template v-slot="{ row, $index }">
          <el-tag v-if="row.isLicense === 1" type="primary" style="width: 100%; color: #07a707">
            已许可
          </el-tag>
          <el-tag v-if="row.isLicense !== 1" type="danger" style="width: 100%">
            未许可
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

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
import { homeProduction, homeProductionStatus } from "@/api/home/index";

export default {
  name: "proPlanOrder",
  data() {
    return {
      isLoading: true,
      isTitle: "",
      dialogVisible: false,
      dateTime: "",
      currentSelTimeType: null,
      currentSelData: {},
      dateRange: [],
      productionList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 24 * 3600 * 1000;
        },
      },
    };
  },
  components: {
    MissData: () => import("./MissData.vue"),
  },
  computed: {
    isToday() {
      return (date) => {
        return (
          this.moment(date).format("YYYY-MM-DD") === this.moment().format("YYYY-MM-DD")
        );
      };
    },
    isTestTabHeight() {
      return "calc(100vh - 200px)";
    },
    hopeDateStyle() {
      return (hopeDate, result) => {
        // 预计时间
        const expectedTime = this.moment(hopeDate);

        const now = this.moment();

        const diffInHours = expectedTime.diff(now, "hours");
        let bgStyle = "";

        if (result === "OK") {
          bgStyle = "bg-green-noHurry ";
        } else if (result === "NG") {
          bgStyle = "bg-danger ";
        } else {
          // 判断时间差
          if (diffInHours <= 8) {
            bgStyle = "bg-danger ";
          } else if (diffInHours <= 16) {
            bgStyle = "bg-warning ";
          } else if (diffInHours <= 32) {
            bgStyle = "bg-yellow ";
          } else {
            bgStyle = "bg-green-noHurry ";
          }
        }
        return bgStyle + `${result === "OK" ? "" : "pointer"} text-black`;
      };
    },
    bgResultStyle() {
      return (result) => {
        if (result === "OK") {
          return "bg-green-noHurry text-black";
        } else if (result === "NG") {
          return "bg-danger text-black";
        } else {
          return "";
        }
      };
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
  },
  created() {
    this.getHomeProductionAll();
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
          const totalData = {
            ...res[0].data,
            ...res[1].data,
            ...res[2].data,
          };

          this.productionList = this.handleTransData(totalData);

          if (isUpdate) {
            this.$nextTick(() => {
              this.scrollToToday();
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    scrollToToday() {
      const todayIndex = this.productionList.findIndex((item) =>
        this.isToday(item.date)
      );

      if (todayIndex !== -1) {
        const tableBody =
          this.$refs.planOrderRef.$el.querySelector(".el-table__body");
        const rowElement = tableBody.querySelector(
          `.el-table__row:nth-child(${todayIndex + 1})`
        );
        if (rowElement) {
          const rowTop = rowElement.offsetTop;
          const tableBodyWrapper = this.$refs.planOrderRef.$el.querySelector(
            ".el-table__body-wrapper"
          );
          tableBodyWrapper.scrollTop = rowTop - tableBody.offsetTop;
        }
      }
    },
    handleTransData(totalData) {
      try {
        let newData = [];

        for (let time in totalData) {
          if (!totalData[time].length) {
            newData.push({
              date: +new Date(time),
              map: { 1: 0, 2: 4, 3: 0, 4: 0, 5: 2, 6: 1 },
              mapFile: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
              },
              list: [],
            });
          } else {
            newData.push(...totalData[time]);
          }
        }

        return newData;
      } catch (error) {}
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
        .then(() => {
          this.msgSuccess("操作成功");
          this.getHomeProductionAll(false);
        })
        .catch(() => {
          this.msgError("操作失败");
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
        .then(() => {
          this.msgSuccess("操作成功");
          this.getHomeProductionAll(false);
        })
        .catch(() => {
          this.msgError("操作失败");
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
      if (!this.checkRole(["PMC"]) || !item.computerName) {
        return;
      }

      this.$router.push({
        name: "PlanSchedule",
        params: { listId: item.id },
      });
    },
    onDbClick(row, column, cell, event) {
      switch (column?.label) {
        // case "PCBA资料":
        //   this.onCellStateClick(row);
        //   break;
        case "JS脚本":
          this.onCellStateClick(row, row.map[1], row?.mapFile[1]?.length);
          break;
        case "硬件资料":
          this.onCellStateClick(row, row.map[2], row?.mapFile[2]?.length);
          break;
        case "软件资料":
          this.onCellStateClick(row, row.map[3], row?.mapFile[3]?.length);
          break;
        case "配置文件":
          this.onCellStateClick(row, row.map[4], row?.mapFile[4]?.length);
          break;
        case "测试上位机":
          this.onCellStateClick(row, row.map[5], row?.mapFile[5]?.length);
          break;
        case "STS系统":
          this.onCellStateClick(row);
          break;
        case "SN规则":
          this.onCellStateClick(row, row.map[6], row?.mapFile[6]?.length);
          break;
        case "期望日期":
          row.result !== "OK" && this.onShowDia(row, 1);
          break;
        // case "备注":
        //   this.onShowDia(row, 2);
        //   break;
        case "责任人":
          row.result !== "OK" && this.onShowDia(row, 3);
          break;
        case "结果":
          this.onShowDia(row, 4);
          break;
      }
    },
    tableRowClassName({ row, rowIndex }) {
      return this.isToday(row.date) ? "success-row" : "";
    },
    getCellClassName({ row, column }) {
      const { map, mapFile, hopeDate, result, date, computerName } = row;
      const { label } = column;
      switch (label) {
        case "型号":
          return computerName ? "pointer" : "";
        // case "PCBA资料":
        //   return this.getDataState(PCBAState);
        case "JS脚本":
          return this.getDataState(map[1], mapFile[1]?.length);
        case "硬件资料":
          return this.getDataState(map[2], mapFile[2]?.length);
        case "软件资料":
          return this.getDataState(map[3], mapFile[3]?.length);
        case "配置文件":
          return this.getDataState(map[4], mapFile[4]?.length);
        case "测试上位机":
          return this.getDataState(map[5], mapFile[5]?.length);
        // case "STS系统":
        //   return this.getDataState(stsState);
        case "SN规则":
          return this.getDataState(map[6], mapFile[6]?.length);
        case "期望日期":
          return this.hopeDateStyle(hopeDate, result);
        // case "备注":
        case "责任人":
          return `${result === "OK" ? "" : "pointer"}`;
        case "结果":
          return `${this.bgResultStyle(result)} pointer`;
      }
    },
    getDataState(state, fileLen) {
      if (!fileLen) return null;
      switch (state) {
        case 0: // 待上传
          return "bg-danger pointer";
        case 1: // 待审核
          return "bg-yellow pointer";
        case 2: // 测试审核通过
          return "bg-primary pointer";
        case 3: // 未通过
          return "bg-warning pointer";
        case 4: // 审核通过
          return "bg-success";
      }
    },
  },
};
</script>
<style>
.success-row {
  background: #ebfae2 !important;
}
</style>
<style lang="scss">
.bg-success {
  background-color: #c6efce !important;
}
.bg-primary {
  background-color: #00b0f0 !important;
}
.bg-warning {
  background-color: #ffc000 !important;
}
.bg-danger {
  background-color: #f56c6c !important;
}
.bg-yellow {
  background-color: yellow !important;
}
.bg-header-lightBlue {
  background-color: #92cddc !important;
}
.bg-header-deepBlue {
  background-color: #00b0f0 !important;
}
.bg-green-noHurry {
  background-color: green;
}
.font-black {
  color: #000;
}
.font-correct {
  color: #007b74;
}
</style>