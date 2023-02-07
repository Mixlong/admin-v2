<template>
  <div
    class="app-container"
    id="table_box"
    div
    :style="{ height: pageHeight + 'px', overflowY: 'scroll' }"
  >
    <div @click="handleUpdate('修改项目', '')" ref="topHeader">
      <el-card shadow="hover">
        <el-row style="cursor: pointer">
          <el-col :span="24" class="flex">
            <div class="align-stretch flex justify-center" style="width: 100%">
              <div class="flex justify-center align-center flex-direction">
                <div>
                  <div
                    class="cover"
                    :style="borderStyle()"
                    style="border-radius: 100%"
                  >
                    <el-image
                      :src="
                        detailData.cover
                          ? detailData.cover
                          : require('@/assets/image/wenanfengmian.png')
                      "
                      fit="cover"
                      style="width: 60px; height: 60px; border-radius: 100%"
                    />
                  </div>
                </div>
              </div>
              <div
                class="font14 flex flex-row justify-between self-stretch flex-sub padding-left"
              >
                <div class="flex flex-direction justify-between padding-bottom">
                  <div class="margin-top">
                    <span class="margin-right-sm">项目名称:</span
                    >{{ detailData.name }}
                  </div>
                  <div class="flex margin-top">
                    <span class="margin-right-sm">项目经理:</span>
                    <div v-if="detailData.pm">
                      {{ pnName() }}
                    </div>
                  </div>

                  <div class="flex margin-top">
                    <span class="margin-right-sm">项目状态:</span>
                    <div v-if="detailData.state">{{ stateName() }}</div>
                  </div>
                </div>
                <el-row
                  class="flex-sub flex header-container-html"
                  :gutter="15"
                  style="padding-left: 50px"
                >
                  <el-col :span="6" class="flex-sub">
                    <span class="margin-bottom-xs flex">项目描述:</span>
                    <div
                      class="flex-sub"
                      style="
                        border-radius: 5px;
                        padding: 10px;
                        min-height: 185px;
                        background-color: #f8f8f8;
                        max-height: 185px;
                        overflow-y: scroll;
                      "
                    >
                      <div v-html="detailData.desc"></div>
                    </div>
                  </el-col>
                  <el-col :span="6" class="flex-sub">
                    <div
                      class="flex-sub"
                      @click.stop="handleUpdate('市场声音', 'marketFeedback')"
                      style="width: 100%"
                      v-if="detailData"
                    >
                      <span class="margin-bottom-xs flex">市场声音:</span>
                      <div
                        class="flex-sub"
                        style="
                          border-radius: 5px;
                          padding: 10px;
                          min-height: 185px;
                          background-color: #f8f8f8;
                          max-height: 185px;
                          overflow-y: scroll;
                        "
                      >
                        <div v-html="detailData.marketFeedback"></div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="6" class="flex-sub">
                    <div
                      class="flex-sub"
                      @click.stop="handleUpdate('项目计划', 'plan')"
                      style="width: 100%"
                    >
                      <span class="margin-bottom-xs flex">项目计划:</span>
                      <div
                        class="flex-sub"
                        style="
                          border-radius: 5px;
                          padding: 10px;
                          min-height: 185px;
                          background-color: #f8f8f8;
                          max-height: 185px;
                          overflow-y: scroll;
                        "
                      >
                        <div v-html="detailData.plan"></div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="6" class="flex-sub">
                    <div
                      class="flex-sub"
                      @click.stop="handleUpdate('风险提示', 'progress')"
                      style="width: 100%"
                      v-if="detailData"
                    >
                      <span
                        class="margin-bottom-xs flex"
                        :class="[textHighlight(detailData.noteTime)]"
                        >风险提示:
                      </span>

                      <div
                        class="flex-sub flex flex-direction justify-between"
                        style="
                          border-radius: 5px;
                          padding: 10px;
                          min-height: 185px;
                          background-color: #f8f8f8;
                          max-height: 185px;
                          overflow-y: scroll;
                        "
                      >
                        <div v-html="detailData.progress"></div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-col>
        </el-row>
        <Scale :detailData="detailData" @change="getList" />
      </el-card>
    </div>

    <!-- <div
      class="flex justify-end margin-top-sm"
      v-if="checkRole(['project_manager', 'admin'])"
    >
      <el-button type="primary" size="small" @click.stop="handleTask"
        >新增任务</el-button
      >
    </div> -->
    <el-table
      ref="table"
      @cell-click="cellClick"
      :cell-class-name="progressHasHoverClass"
      v-loading="loading"
      :data="list"
      class="margin-top-sm"
      :cell-style="cellStyle"
      border
      v-sticky="{
        top: 0,
        parent: '#table_box',
      }"
      :span-method="objectSpanMethod"
    >
      <el-table-column label="领域" align="center" prop="workId" width="120">
        <template slot-scope="scope">
          <div class="flex justify-between align-center">
            <i
              v-if="checkRole(['project_manager', 'admin'])"
              class="el-icon-circle-plus text-blue font18"
              style="cursor: pointer"
              @click="speedinessAddTask(scope.row)"
            ></i>
            <div class="flex-sub text-left padding-left-xs">
              {{ table_detp_name(scope.row) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="负责人"
        align="center"
        prop="principal"
        :formatter="table_principal_name"
        width="80"
      />
      <el-table-column
        label="项目任务"
        align="center"
        prop="content"
        width="280"
      >
        <template slot="header" slot-scope="scope">
          <div class="flex align-center justify-center">
            <span>项目任务</span>
            <i
              v-if="checkRole(['project_manager', 'admin'])"
              class="el-icon-circle-plus text-blue font18 margin-left-sm"
              style="cursor: pointer"
              @click.stop="handleTask"
            ></i>
          </div>
        </template>
        <template slot-scope="scope">
          <div v-html="scope.row.content" class="text-left"></div>
        </template>
      </el-table-column>
      <el-table-column label="进展&问题" align="center" prop="problem">
        <template slot-scope="scope">
          <div class="flex align-center progress-text">
            <div class="add-icon">
              <i
                v-if="checkRole(['project_manager', 'admin'])"
                class="el-icon-circle-plus text-blue font18"
                style="cursor: pointer"
                @click.stop="problemAdd(scope.row)"
              ></i>
            </div>
            <div>
              <div
                v-for="(item, o) in scope.row.progressList"
                :key="o"
                class="text-left"
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
      <el-table-column
        label="进度"
        align="center"
        prop="progressBar"
        width="200"
      >
        <template slot-scope="scope">
          <div class="padding-lr-xs" style="position: relative; top: -9px">
            <el-slider
              class="slider-style"
              :step="10"
              @change="changeProgressBar(scope.row)"
              :disabled="
                !checkRole(['project_manager', 'admin']) || scope.row.state == 1
              "
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
      <el-table-column
        label="完成计划"
        align="center"
        prop="doneTime"
        width="210"
      >
        <template slot-scope="scope">
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
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="130"
        class-name="small-padding fixed-width btn-icon-style text-left"
        v-if="checkRole(['project_manager', 'admin'])"
      >
        <template slot-scope="scope">
          <div class="text-left padding-lr-xs">
            <el-button
              type="text"
              icon="el-icon-edit"
              class="text-blue"
              @click="handleTaskUpdate(scope.row)"
            ></el-button>
            <el-button
              type="text"
              icon="el-icon-document"
              class="text-cyan"
              @click="handleLog(scope.row)"
            ></el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              class="text-red"
              @click="handleDelete(scope.row)"
            ></el-button>
            <el-button
              v-if="scope.row.state == 0 && scope.row.progressBar >= 100"
              type="text"
              icon="el-icon-check"
              class="text-green"
              @click="handleSuccess(scope.row)"
            ></el-button>
            <el-button
              v-if="scope.row.state == 1 && scope.row.progressBar >= 100"
              type="text"
              icon="el-icon-refresh-right"
              class="text-cyan"
              @click="handleRefresh(scope.row)"
            ></el-button>
            <img
              v-if="scope.row.fileUrl"
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
          </div>
        </template>
      </el-table-column>
    </el-table>
    <CompUpdate
      :worKListOptions="worKListOptions"
      :pmDictListOptions="pmDictListOptions"
      :stateListOptions="stateListOptions"
      @success="getList"
      ref="compUpdate"
    />
    <CompTaskUpdate
      :title="title"
      ref="compTaskUpdate"
      :worKListOptions="worKListOptions"
      @returnTaskMemberOptions="changeTaskMember"
      @progressChange="progressLogRefresh"
    />
    <CompLog ref="compLog" :visible.sync="openLog" />
    <ProgressLog
      ref="progressLog"
      :visible.sync="openProgressLog"
      @update="problemEdit"
    />
  </div>
</template>
<script>
import Sortable from "sortablejs";
import { dictPmProject, detailInfoProject } from "@/api/third/project";
import {
  projectList,
  taskDelete,
  taskDictDept,
  manageSort,
} from "@/api/third/task";
import { urlDownload } from "@/utils";
import CompUpdate from "../components/Update";
import Scale from "../components/Scale.vue";
import CompTaskUpdate from "@/views/third/task/components/update";
import FlipDown from "vue-flip-down";
import { manageMember } from "@/api/third/task";
import CompLog from "@/views/third/task/components/log";
import ProgressLog from "@/views/third/task/components/progressLog";

export default {
  components: {
    CompUpdate,
    CompTaskUpdate,
    FlipDown,
    Sortable,
    Scale,
    CompLog,
    ProgressLog,
  },
  data() {
    return {
      pageHeight: 960,
      openProgressLog: false,
      openLog: false,
      list: [],
      loading: false,
      queryParams: {
        p: 1,
        l: 50,
        id: "",
        key: "",
      },
      title: "",
      detailData: {},
      worKListOptions: [], //工作内容
      pmDictListOptions: [], //责任人
      stateListOptions: [], //状态
    };
  },
  mounted() {
    this.getList();
    this.getDicts("base_project_state").then((res) => {
      this.stateListOptions = res.data;
    });
    dictPmProject().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
    });
    this.initSort();
  },
  methods: {
    initSort() {
      if (this.checkRole(["project_manager", "admin"])) {
        const tbody = document.querySelector(".el-table__body-wrapper tbody");
        let _this = this;

        new Sortable(tbody, {
          onEnd: function (e) {
            let list = Object.assign([], _this.list);
            list.splice(e.newIndex, 0, list.splice(e.oldIndex, 1)[0]);

            manageSort({
              idList: list.map((item) => item.id),
              sort: 2,
            }).then((res) => {
              _this.list = [];
              let top =
                document.getElementById("table_box").scrollTop ||
                document.body.scrollTop ||
                window.pageYOffset;
              _this.getList(top);
            });
          },
        });
      }
    },

    getList(num) {
      let { query } = this.$route;
      this.loading = true;
      this.queryParams.projectId = query.id;
      projectList(this.queryParams).then((res) => {
        let { data } = res;
        for (let key of data.list) {
          key.progressBar = key.progressBar > 0 ? key.progressBar : 0;
          if (key.progressList.length) {
            key.progressList.reverse();
          }
        }
        let tableObj = {};
        let deptId = data.list.map((item) => item.workId);
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
        this.list = Object.assign([], data.list);
        this.loading = false;
      });

      //项目详情
      detailInfoProject(query.id).then((res) => {
        let detailData = res.data;
        taskDictDept().then((res) => {
          let { data } = res;
          let allId = detailData.workList.map((item) => item.workId);
          for (let key of data) {
            //禁用不是当前领域的select
            key.disabled = !(allId.indexOf(key.dictValue) > -1);
          }
          let workNameArr = [];
          for (let key of allId) {
            let lendata = data.filter((k) => k.dictValue == key);
            if (lendata.length) {
              workNameArr.push(lendata[0]);
            }
          }
          detailData.work = workNameArr;
          this.worKListOptions = data;

          this.detailData = detailData;
          if (num) {
            setTimeout(() => {
              document.getElementById("table_box").scrollTop = num;
            }, 300);
          } else {
            this.getheight();
          }
        });
      });
    },
    getheight() {
      let obj = this.$refs.topHeader;
      let h = window.getComputedStyle(obj).height; //通过这个方法，获取宽高

      this.pageHeight = document.documentElement.clientHeight - 104; //截取字符串，并将数字字符串，转成number类型
    },
    // 日志
    handleLog(row) {
      this.$refs.compLog.id = row.id;
      this.$refs.compLog.getList(row.id);
      this.openLog = true;
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "领域":
          // if (row.userId == this.userId || checkRole(["task_director"])) {
          //   this.handleUpdate(row, "dept");
          // }
          break;
        case "项目任务":
          if (this.checkRole(["project_manager", "admin"])) {
            this.handleTaskUpdate(row, "content");
          }
          break;
        case "进展&问题":
          if (this.checkRole(["project_manager", "admin"])) {
            this.$refs.progressLog.id = row.id;
            this.$refs.progressLog.form = row;
            this.$refs.progressLog.getList(row.id);
            this.openProgressLog = true;
          }

          break;
        case "负责人":
          if (this.checkRole(["project_manager", "admin"])) {
            this.handleTaskUpdate(row, "principal");
          }
          break;
        case "完成计划":
          if (this.checkRole(["project_manager", "admin"])) {
            this.handleTaskUpdate(row, "doneTime");
          }

          break;

        default:
          break;
      }
    },
    /**判断履历进展为当日显示高亮红色 */
    textHighlight(endTime) {
      if (!endTime) {
        return;
      }

      let dateBegin = new Date();
      let dateEnd = new Date(endTime);
      let dateDiff = dateBegin.getTime() - dateEnd.getTime(); //时间差的毫秒数
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
        className = "text-black";
      } else if (hours >= 24) {
        className = "text-blue";
      } else {
        className = "text-red";
      }
      return className;
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
    downloadUlr(row) {
      urlDownload(row.fileUrl);
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
    /**判断履历进展为当日显示高亮红色 */
    boleTextHighlight(str) {
      let time = str.updateTime ? str.updateTime : str.createTime;
      let d = new Date(time).setHours(0, 0, 0, 0);
      let today = new Date().setHours(0, 0, 0, 0);

      let obj = {
        "-86400000": "-1",
        0: "0",
        86400000: "1",
      };

      return obj[d - today] || -5;
    },
    problemAdd(row) {
      if (this.checkRole(["project_manager", "admin"])) {
        let parmas = Object.assign({}, row, { problem: "" });
        this.handleTaskUpdate(parmas, "problem");
      }
    },
    problemEdit(row, item) {
      let parmas = Object.assign({}, row, {
        problem: item.content,
        problemId: item.id,
      });
      this.handleTaskUpdate(parmas, "problem");
    },
    //修改后更新进展记录列表
    progressLogRefresh() {
      this.$refs.progressLog.getList();
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        columnIndex == 1 ||
        columnIndex == 2 ||
        columnIndex == 3 ||
        columnIndex == 5
      ) {
        return `cursor: pointer;`;
      } else {
        return ``;
      }
    },
    progressHasHoverClass({ row, column, rowIndex, columnIndex }) {
      if (this.checkRole(["project_manager", "admin"])) {
        if (column.label == "进展&问题") {
          return "showIcon";
        }
      }
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
    handleUpdate(title, showName) {
      if (this.checkRole(["project_manager", "admin"])) {
        this.$refs.compUpdate.title = title;
        this.$refs.compUpdate.reset();
        this.$refs.compUpdate.form = Object.assign({}, this.detailData);
        this.$refs.compUpdate.dialogFormVisible = true;
        this.$refs.compUpdate.showName = showName;
      }
    },
    handleTaskUpdate(row, name) {
      this.title = "";
      this.$refs.compTaskUpdate.showName = name;
      this.$refs.compTaskUpdate.dialogVisible = true;
      this.$refs.compTaskUpdate.reset();
      this.$refs.compTaskUpdate.form = Object.assign({}, row);
      this.$refs.compTaskUpdate.disableObj = {
        projectId: true,
        problem: name == "problem" ? false : true,
      };
    },
    stateName() {
      let data = this.stateListOptions.filter(
        (item) => item.dictValue == this.detailData.state
      );
      if (data.length) {
        return data[0].dictLabel;
      }
    },
    pnName() {
      let data = this.pmDictListOptions.filter(
        (item) => item.dictValue == this.detailData.pm
      );
      if (data.length) {
        return data[0].dictLabel;
      }
    },

    handleTask() {
      this.$refs.compTaskUpdate.dialogVisible = true;
      this.$refs.compTaskUpdate.reset();
      this.$refs.compTaskUpdate.disableObj = {
        projectId: true,
      };
      this.$refs.compTaskUpdate.form = {
        projectId: this.$route.query.id,
      };
      this.$refs.compTaskUpdate.showName = "";
      this.title = "添加任务";
    },
    speedinessAddTask(row) {
      this.$refs.compTaskUpdate.dialogVisible = true;
      this.$refs.compTaskUpdate.reset();
      this.$refs.compTaskUpdate.disableObj = {
        projectId: true,
        workId: true,
      };
      this.$refs.compTaskUpdate.form = {
        projectId: this.$route.query.id,
        workId: row.workId,
      };
      this.$refs.compTaskUpdate.showName = "";
      this.title = "添加任务";
    },
    table_detp_name(row) {
      if (row && row.workId) {
        let data = this.worKListOptions.filter(
          (item) => item.dictValue == row.workId
        );

        if (data.length) {
          return data[0].dictLabel;
        }
      }
    },

    borderStyle() {
      let row = this.detailData;
      let cellStyle = "";
      if (row.state === "0") {
        cellStyle = "border:10px solid #606266";
      } else if (row.state === "1") {
        cellStyle = "border:1px solid #ccc; ";
      } else if (row.state === "2") {
        cellStyle = " border:10px solid #E6A23C";
      } else if (row.state === "3") {
        cellStyle = "border:10px solid #F56C6C";
      } else if (row.state === "4") {
        cellStyle = "border:10px solid #67C23A";
      } else if (row.state === "5") {
        cellStyle = "border:10px solid #409EFF";
      } else if (row.state === "7") {
        cellStyle = "border:10px solid #000000";
      }
      return cellStyle;
    },
    table_principal_name(val) {
      if (val && val.principal) {
        let findItem = this.taskMemberOptions.filter(
          (item) => item.dictValue == val.principal
        );
        if (findItem.length) {
          return findItem[0].dictLabel;
        }
      }
      return "未知";
    },
    changeTaskMember(val) {
      this.taskMemberOptions = val;
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
  },
};
</script>

<style lang="scss">
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
.btn-icon-style {
  .el-button {
    i {
      transform: scale(1.2);
    }
  }
}
.header-container-html {
  p {
    margin-top: 0;
    margin-bottom: 5px;
  }
}
</style>