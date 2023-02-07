<template>
  <div class="app-container assigned-page">
    <Header @refresh="checkChange"></Header>

    <el-table
      :span-method="objectSpanMethod"
      :cell-class-name="progressHasHoverClass"
      @cell-click="cellClick"
      :cell-style="cellStyle"
      :row-style="rowStyle"
      v-loading="loading"
      :data="list"
      :height="tableHeightCust ? tableHeightCust : tableHeight(10)"
      border
      ref="table"
      :row-class-name="rowClassName"
    >
      <el-table-column
        label="来源"
        align="center"
        prop="projectName"
        width="200"
      >
        <template slot-scope="scope">
          <!-- <span v-if="scope.row.tableId == '0'" class="text-orange"
            >私有项目({{ scope.row.createBy }})</span
          >
          <span v-else>{{ scope.row.projectName }}</span> -->
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目任务" align="center" prop="desc" width="280">
        <template slot-scope="scope">
          <div
            class="position-top-wrap"
            :class="'overText' + scope.$index"
            v-if="scope.row.content"
          >
            <el-popover
              width="400"
              trigger="hover"
              popper-class="custom-style-task"
              placement="right-start"
              :close-delay="0"
            >
              <p v-html="scope.row.content" class="text-left"></p>
              <div
                slot="reference"
                class="text-left position-top"
                :class="[
                  'row-name' + scope.$index + myTask,
                  scope.row.overflow
                    ? scope.$index % 2 == 0
                      ? 'whiteBg-overflow'
                      : 'grayBg-overflow'
                    : '',
                  ,
                ]"
              >
                <div v-html="scope.row.content"></div>
                <i
                  class="el-icon-arrow-down more-icon"
                  v-if="scope.row.overflow"
                ></i>
              </div>
            </el-popover>
          </div>
          <!-- <div class="text-left" v-html="scope.row.content" class=""></div> -->
        </template>
      </el-table-column>

      <el-table-column
        v-if="myTask"
        label="责任人"
        align="center"
        width="70"
        :formatter="table_principal_name"
      />

      <el-table-column label="进展&问题" align="center" prop="problem">
        <template slot-scope="scope">
          <div class="flex align-center progress-text">
            <div class="add-icon">
              <i
                v-if="
                  checkRole(['task_director', 'admin']) ||
                  scope.row.principal == userId ||
                  scope.row.userId == userId
                "
                class="el-icon-circle-plus text-blue font18"
                style="cursor: pointer"
                @click.stop="problemAdd(scope.row)"
              ></i>
            </div>
            <div>
              <div
                v-for="(item, o) in scope.row.progressList"
                :key="o"
                class="text-left margin-left-xs"
                :class="{
                  'text-red': boleTextHighlight(item) == 0,
                  'text-blue': boleTextHighlight(item) == -1,
                }"
              >
                【{{
                  (item.updateTime ? item.updateTime : item.createTime).slice(
                    0,
                    11
                  )
                }}】:
                <span v-html="item.content"></span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="problem" v-if="myTask">
        <template slot-scope="scope">
          <div>
            <span v-if="scope.row.accept == 0">待确认</span>
            <span v-if="scope.row.accept == 1" class="text-green">已同意</span>
            <span v-if="scope.row.accept == 2" class="text-red">已拒绝</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="进度"
        align="center"
        width="200"
        class-name="progressBar-style"
      >
        <template slot-scope="scope">
          <div
            class="padding-lr-xs"
            style="position: relative; top: -9px"
            v-if="scope.row.type != 3 && scope.row.doneTime"
          >
            <el-slider
              class="slider-style"
              :step="10"
              @change="changeProgressBar(scope.row)"
              :disabled="verifySliderDisabled(scope.row)"
              v-model="scope.row.progressBar"
              :class="{
                'wait-confirm':
                  scope.row.progressBar >= 100 && scope.row.state == 0,
                finish: scope.row.progressBar >= 100 && scope.row.state == 1,
              }"
              :marks="{
                50: {
                  style: {
                    color:
                      scope.row.progressBar < 100
                        ? '#1989FA'
                        : scope.row.state == 0
                        ? '#f37b1d'
                        : '#39b54a',
                    fontSie: 12,
                  },
                  label:
                    scope.row.progressBar >= 100
                      ? scope.row.state == 0
                        ? '待确认'
                        : '已完成'
                      : scope.row.progressBar + '%' || '0%',
                },
              }"
            ></el-slider>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="完成倒计时" align="center" width="190">
        <template slot-scope="scope">
          <div v-if="scope.row.doneTime">
            <div
              v-if="
                new Date(scope.row.doneTime).getTime() > new Date().getTime() &&
                scope.row.state == 0
              "
            >
              <div
                class="text-shadow mb5"
                :class="[difference(scope.row.doneTime)]"
              >
                {{ scope.row.doneTime }}
              </div>
              <div class="flex justify-center align-center">
                <FlipDown
                  :endDate="new Date(scope.row.doneTime).getTime()"
                  :type="4"
                  :theme="1"
                  :timeUnit="['天', ':', ':']"
                  class="flip-down-style text-center"
                />
              </div>
            </div>
            <div v-else>
              <div
                class="text-shadow"
                :class="[
                  scope.row.state == 1 ? 'text-green' : 'text-red text-bold',
                ]"
              >
                {{ scope.row.doneTime }}
              </div>
              <span v-if="scope.row.state == 0" class="text-red text-shadow"
                >已逾期</span
              >
              <span v-else class="text-green text-shadow">已完成</span>
            </div>
          </div>
          <div v-else class="text-gray">待定</div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <template
            v-if="
              scope.row.accept == 0 &&
              scope.row.principal == userId &&
              !scope.row.projectId
            "
          >
            <el-tooltip
              class="item"
              effect="dark"
              content="接受"
              placement="top-end"
            >
              <img
                style="
                  width: 17px;
                  cursor: pointer;
                  vertical-align: middle;
                  position: relative;
                  top: -3px;
                "
                :src="require('@/assets/image/receive.png')"
                alt=""
                @click.stop="handleAcceptRejection(scope.row, 1)"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="拒绝"
              placement="top-end"
            >
              <img
                class="margin-lr-xs"
                style="
                  width: 17px;
                  cursor: pointer;
                  vertical-align: middle;
                  position: relative;
                  top: -3px;
                "
                :src="require('@/assets/image/reject.png')"
                alt=""
                @click.stop="handleAcceptRejection(scope.row, 2)"
              />
            </el-tooltip>
          </template>
          <Tooltip
            icon="el-icon-tickets"
            content="操作日志"
            @click="handleLog(scope.row)"
          />

          <Tooltip
            v-if="
              scope.row.state == 0 &&
              scope.row.progressBar >= 100 &&
              (userId == scope.row.userId ||
                checkRole(['task_director', 'admin']))
            "
            :className="['text-green']"
            icon="el-icon-check"
            content="完成"
            @click="handleSuccess(scope.row)"
          />
          <Tooltip
            v-if="
              scope.row.state == 0 &&
              (userId == scope.row.userId ||
                checkRole(['task_director', 'admin']))
            "
            icon="el-icon-delete"
            :className="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
          />
          <Tooltip
            v-if="
              scope.row.state == 1 &&
              scope.row.progressBar >= 100 &&
              (userId == scope.row.userId ||
                checkRole(['task_director', 'admin']))
            "
            icon="el-icon-refresh-right"
            :className="['text-cyan']"
            content="回退未完成状态"
            @click="handleRefresh(scope.row)"
          />
          <el-tooltip
            class="item"
            effect="dark"
            content="附件"
            placement="top-end"
            v-if="scope.row.fileUrl"
          >
            <img
              class="margin-left-xs"
              style="
                width: 17px;
                cursor: pointer;
                vertical-align: middle;
                position: relative;
                top: -3px;
              "
              :src="require('@/assets/image/xiazai.png')"
              alt=""
              @click.stop="downloadUlr(scope.row)"
            />
          </el-tooltip>
          <Tooltip
            content="移交任务"
            icon="el-icon-user-solid"
            @click="cellClick(scope.row, { label: '责任人' })"
            v-if="!myTask && userId == scope.row.principal"
          />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <CompUpdate
      ref="compUpdate"
      :title="title"
      :worKListOptions="worKListOptions"
      :taskMemberOptions="taskMemberOptions"
      @progressChange="progressLogRefresh"
    />
    <CompLog ref="compLog" :visible.sync="dialogVisible" />
    <ProgressLog
      ref="progressLog"
      :visible.sync="openProgressLog"
      @update="problemEdit"
    />
  </div>
</template>

<script>
import { manageList, taskDelete, manageMember } from "@/api/third/task";
import CompUpdate from "../components/update";
import CompLog from "../components/log";
import ProgressLog from "../components/progressLog";
import Header from "./components/Header";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import { urlDownload } from "@/utils";
import { dictPmProject } from "@/api/third/project";
import { taskDictDept, myCreateTask } from "@/api/third/task";
export default {
  props: ["myTask", "tableHeightCust"],
  components: {
    CompUpdate,
    FlipDown,
    CompLog,
    Header,
    ProgressLog,
  },
  data() {
    return {
      dialogVisible: false,
      openProgressLog: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],

      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
      },
      // 表单参数
      form: {},
      worKListOptions: [], //部门
      taskMemberOptions: [], //责任人
    };
  },
  computed: {
    ...mapGetters(["userId", "avatar", "nickName"]),
  },
  async mounted() {
    await taskDictDept().then((res) => {
      this.worKListOptions = res.data;
      this.getList();
    });
    dictPmProject().then((res) => {});
    await memberDictUser().then((response) => {
      if (response.code === 200) {
        this.taskMemberOptions = response.data;
      }
    });

    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true;
      let { query } = this.$route;
      let params = Object.assign({}, this.queryParams);
      //没id时查询当前账户的数据
      if (!query.id) {
        query.id = this.userId;
        query.name = this.nickName;
        query.cover = this.avatar;
      }
      params.principal = query.id;
      params.state = this.queryParams.state ? "" : 0;
      if (this.myTask) {
        await myCreateTask(params).then((response) => {
          let { data } = response;
          this.handleData(data);
        });
      } else {
        await manageList(params).then((response) => {
          let { data } = response;
          this.handleData(data);
        });
      }
      this.$nextTick(() => {
        let element = this.$refs.table;
        let me = this;

        setTimeout(() => {
          me.renderingComplete();
        }, 500);
      });
    },
    renderingComplete() {
      let { list } = this;
      list.forEach((item, i) => {
        let pn = document.querySelector(".row-" + i + this.myTask);

        let p = pn ? pn.clientHeight : 0;
        let cn = document.querySelector(".row-name" + i + this.myTask);

        let c = cn ? cn.clientHeight : 0;

        p = p < 67 ? 67 : p;
        item.overflow = p < c && c > 42;
      });
      this.list = Object.assign([], list);
      this.loading = false;
    },
    handleData(data) {
      for (let key of data.list) {
        key.progressBar = key.progressBar > 0 ? key.progressBar : 0;
        if (key.progressList.length) {
          key.progressList.reverse();
        }
      }
      let tableObj = {};
      let icc = 0;
      for (let key of data.list) {
        if (key.problem) {
          key.problem = key.problem.split("&;");
        }
        icc += 1;
        key.tableId = key.projectId == null ? icc + "" : key.projectId;
      }
      let deptId = data.list.map((item) => item.tableId);
      let newArr = Array.from(new Set(deptId));
      let tableColor = "#ffffff";
      for (let key of newArr) {
        key += "";
        tableObj[key] = {
          index: deptId.indexOf(key),
          lastIndex: deptId.lastIndexOf(key),
          color: tableColor,
          total: deptId.lastIndexOf(key) - deptId.indexOf(key) + 1,
        };
        tableColor =
          tableColor == "#ffffff" ? "rgba(224,224,224,.4)" : "#ffffff";
      }
      this.storeTableColor = tableObj;
      let indexObj = {}; //表格动态合并计算下标
      for (let key in tableObj) {
        indexObj[tableObj[key].index] = tableObj[key].total;
      }
      this.tableCoalition = indexObj;

      this.list = data.list;
      this.total = data.total;
    },
    //撤回
    handleRefresh(row) {
      let params = {};
      params.id = row.id;
      params.state = 0;
      manageMember(params).then(() => {
        this.getList();
        this.$message({
          type: "success",
          message: "操作成功!",
        });
      });
    },
    progressHasHoverClass({ row, column, rowIndex, columnIndex }) {
      if (this.checkRole(["task_director", "admin"])) {
        if (column.label == "进展&问题") {
          return "showIcon";
        }
      }
    },
    checkChange(val) {
      this.queryParams.state = val;
      this.getList();
    },
    // 部门回显
    table_detp_name(val) {
      let findItem = this.worKListOptions.filter(
        (item) => item.dictValue == val.workId
      );
      if (findItem.length) {
        return findItem[0].dictLabel;
      }
      return "未知";
    },
    // 责任人回显
    table_principal_name(val) {
      let findItem = this.taskMemberOptions.filter(
        (item) => item.dictValue == val.principal
      );
      if (findItem.length) {
        return findItem[0].dictLabel;
      }
      return "未知";
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "来源":
          let { type, source } = row;
          let url = "";
          let params = {};

          switch (type) {
            case 1:
              url = "/prodData/govern";
              params = {
                id: row.projectId,
              };
              break;
            case 2:
              url = "";
              params = {};
              break;
            case 3:
              url = "/prodData/demand";
              params = {
                name: row.sourceName,
              };
              break;
            case 4:
              url = "/prodData/sample";
              params = {
                name: row.sourceName,
              };
              break;
            case 5:
              url = "/prodData/afterSale";
              params = {
                name: row.sourceName,
              };
              break;
          }

          this.$router.push({
            path: url,
            query: params,
          });
          break;
        case "项目任务":
          if (
            row.userId == this.userId ||
            this.checkRole(["task_director", "admin"])
          ) {
            this.handleUpdate(row, "content");
          }
          break;
        case "进展&问题":
          if (
            row.principal == this.userId ||
            row.userId == this.userId ||
            this.checkRole(["task_director"])
          ) {
            this.$refs.progressLog.id = row.id;
            this.$refs.progressLog.form = row;
            this.$refs.progressLog.getList(row.id);
            this.openProgressLog = true;
          }

          break;
        case "责任人":
          if (
            row.userId == this.userId ||
            this.checkRole(["task_director", "admin"])
          ) {
            this.handleUpdate(row, "principal");
          }
          break;
        case "完成倒计时":
          if (
            row.state == 0 &&
            (this.userId == row.userId ||
              this.checkRole(["task_director", "admin"]))
          ) {
            this.handleUpdate(row, "doneTime");
          }

          break;
        case "附件":
          if (
            row.state == 0 &&
            (this.userId == row.userId ||
              this.checkRole(["task_director", "admin"]))
          ) {
            this.handleUpdate(row, "fileUrl");
          }

          break;
        default:
          break;
      }
    },
    verifySliderDisabled(row) {
      if (
        this.checkRole(["task_director", "admin"]) ||
        (row.state == 0 && row.principal == this.userId)
      ) {
        return false;
      }

      return true;
    },
    problemAdd(row) {
      if (this.isRole(row)) {
        let parmas = Object.assign({}, row, { problem: "" });
        this.handleUpdate(parmas, "problem");
      }
    },
    problemEdit(row, item) {
      if (this.isRole(row)) {
        let parmas = Object.assign({}, row, {
          problem: item.content,
          problemId: item.id,
        });
        this.handleUpdate(parmas, "problem");
      }
    },
    isRole(row) {
      return (
        row.principal == this.userId ||
        this.checkRole(["task_director", "admin"]) ||
        row.userId == this.userId
      );
    },
    urlName(row) {
      let { fileUrl } = row;
      if (fileUrl) {
        return fileUrl.slice(fileUrl.lastIndexOf("/") + 1);
      }
      return;
    },
    //进度条
    changeProgressBar(row) {
      let params = {};
      params.id = row.id;
      params.progressBar = row.progressBar;
      manageMember(params).then((res) => {
        if (res.code != 200) {
          this.msgError("接口异常，更改进度操作失败！");
        }
      });
    },
    // 删除
    handleDelete(row) {
      this.$confirm("此操作将进行取消任务, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        taskDelete([{ id: row.id, status: 1 }]).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "取消成功!",
          });
        });
      });
    },

    // 日志
    handleLog(row) {
      this.$refs.compLog.id = row.id;
      this.$refs.compLog.getList(row.id);
      this.dialogVisible = true;
    },
    // 完成
    handleSuccess(row) {
      this.$confirm("此操作将操作完成任务, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        let params = {};
        params.id = row.id;
        params.state = 1;
        manageMember(params).then(() => {
          this.getList();
          this.$message({
            type: "success",
            message: "操作成功!",
          });
        });
      });
    },
    //修改后更新进展记录列表
    progressLogRefresh() {
      this.$refs.progressLog.getList();
    },
    //私有项目接受拒绝操作
    handleAcceptRejection(row, state) {
      let params = {};
      params.id = row.id;
      params.accept = state;
      manageMember(params).then(() => {
        this.getList();
        this.$message({
          type: "success",
          message: "操作成功!",
        });
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    difference(endTime) {
      let dateBegin = new Date();
      let dateEnd = new Date(endTime);
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
      if (dayDiff >= 2) {
        className = "text-black";
      } else if (dayDiff == 1) {
        className = "text-orange";
      } else if (hours >= 12) {
        className = "text-red";
      } else {
        className = "text-red text-bold";
      }
      return className;
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleUpdate(row, name) {
      // this.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.form.targetId;
      this.$refs.compUpdate.showName = name;
      this.title = "";
    },
    handleGuideJS(item) {
      this.open = true;
      this.form.id = item.id;
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (this.tableCoalition[rowIndex] != undefined) {
          return {
            rowspan: this.tableCoalition[rowIndex],
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (this.myTask) {
        if (
          columnIndex == 0 ||
          columnIndex == 1 ||
          columnIndex == 2 ||
          columnIndex == 4 ||
          columnIndex == 5
        ) {
          return `cursor: pointer;`;
        }
      } else {
        return `cursor: pointer;`;
      }
    },
    rowStyle({ row, rowIndex }) {
      let styleJson = {};
      styleJson.borderRight = "#1px solid red";
      styleJson.background = this.storeTableColor[row.tableId].color;
      return styleJson;
    },
    downloadUlr(row) {
      urlDownload(row.fileUrl);
    },
    /**判断履历进展为当日显示高亮红色 */
    boleTextHighlight(str) {
      let d = new Date(str.createTime).setHours(0, 0, 0, 0);
      let today = new Date().setHours(0, 0, 0, 0);

      let obj = {
        "-86400000": "-1",
        0: "0",
        86400000: "1",
      };

      return obj[d - today] || -5;
    },
    rowClassName({ row, rowIndex }) {
      return "row-" + rowIndex + this.myTask;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang='scss'>
.assigned-page {
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: transparent;
  }
}
.position-top-wrap {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  .more-icon {
    opacity: 0.6;
    position: absolute;
    bottom: 0;
    left: 50%;
    z-index: 10;
    font-size: 16px;
  }
}
.grayBg-overflow,
.whiteBg-overflow {
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    display: block;
    width: calc(100%);
    height: 60px;

    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
  }
}

.position-top {
  > div {
    padding: 10px 10px 0 10px;
    p {
      margin: 0;
    }
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
.flip-down-style {
  .time-box {
    font-size: 12px;
    height: 25px !important;
    line-height: 25px !important;
    // background-color: #f37b1d;
    // &::after,
    // &::before {
    //   background-color: #f37b1d;
    // }
  }
  .time-box > div.base .base-b {
    display: none;
  }
  .time-unit {
    line-height: normal;
    display: inline-flex;
    align-items: center;
  }
  // .time-box > div.face {
  //   background-color: #f37b1d;
  // }
  // .time-box > div.back {
  //   background-color: #f37b1d;
  // }
}
.slider-style {
  .el-slider__bar,
  .el-slider__runway {
    height: 10px;
    border-radius: 6px;
  }
  .el-slider__stop {
    display: none;
  }
  .el-slider__button-wrapper {
    top: -13px;
  }
}
.progressBar-style {
  padding: 0 !important;
  .cell {
    padding: 10px 10px;
  }
}
.wait-confirm {
  .el-slider__runway.disabled .el-slider__bar,
  .el-slider__bar {
    background-color: #f37b1d;
  }
}
.finish {
  .el-slider__runway.disabled .el-slider__bar,
  .el-slider__bar {
    background-color: #39b54a;
  }
}
.btn-icon-style {
  .el-button {
    i {
      transform: scale(1.2);
    }
  }
}
</style>