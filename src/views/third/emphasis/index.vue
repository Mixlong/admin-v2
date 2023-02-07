<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true">
      <el-row>
        <el-col :span="24" class="margin-bottom-xs">
          <div class="fr">
<!--            <el-checkbox v-model="checked" @change="getList" >-->
<!--              关联我的-->
<!--            </el-checkbox>-->
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              class="margin-left"
              >
              新增
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="elTable"
      class="sort-table emphasis-sort-table"
      :data="homeEmphasisLists"
      :height="tableHeight(+80)"
      :row-class-name="tableRowClassName"
      @cell-click="cellClick"
      border
    >
      <el-table-column
        prop="projectName"
        label="项目名称"
        align="center"
        width="250"
        header-align="center"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.projectName"></div>
        </template>
      </el-table-column>
      <el-table-column
        prop="customer"
        label="客户"
        align="left"
        width="200"
        header-align="center"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.customer"></div>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        align="left"
        width="200"
        header-align="center"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.type"></div>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="工作内容"
        align="left"
        header-align="center"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column
        prop="workPlan"
        label="计划"
        align="left"
        header-align="center"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.workPlan"></div>
        </template>
      </el-table-column>

      <el-table-column
        prop="createBy"
        label="创建人"
        align="center"
        width="80"
      />
      <el-table-column
        prop="content"
        label="关联人员"
        align="center"
        width="100"
      >
        <!-- <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="fnUserName(scope.row.userList)"
            placement="top-start"
          >
            <el-tag class="tag-style-index" >
              {{ fnUserName(scope.row.userList) }}
            </el-tag>
          </el-tooltip>
        </template> -->
      </el-table-column>
      <el-table-column label="操作" align="center" width="80">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['sys_admin', 'admin']) || scope.row.createUser == userId"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            v-if="checkRole(['sys_admin', 'admin']) || scope.row.createUser == userId"
            icon="el-icon-delete"
            :class="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <Update
      :visible.sync="openUpdate"
      :pmDictListOptions="pmDictListOptions"
      :stateOptions="stateOptions"
      :rowUpdate="rowUpdate"
    />
  </div>
</template>

<script>
import { emphasisList, emphasisDel, emphasisSort } from "@/api/third/emphasis";
import Sortable from "sortablejs";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";

import Update from "@/views/third/emphasis/components/update";

export default {
  components: {
    Update,
    Sortable,
  },

  filters: {},
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      homeEmphasisLists: [],
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
      openUpdate: false,
      logRow: {},
      rowUpdate: {},
      checked: false,
    };
  },
  computed: {
    ...mapGetters(["userId"]),
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
    getData() {
      //审批任务
      taskConfig().then((res) => {
        this.configList = res.data;
      });
      //售后任务
      taskSale().then((res) => {
        let { data } = res;
        this.saleList = data;
      });
      //送样任务
      taskSample().then((res) => {
        this.sampleList = res.data;
      });
      //项目任务
      taskProject().then((res) => {
        let { data } = res;
        this.projectList = data;
      });
    },
    getList() {
      //重点事项
      let { checked } = this;

      emphasisList().then((res) => {
        let { data } = res;

        if (checked) {
          let list = [];
          for (let key of data) {
            if (
              key.userList.findIndex((item) => item.userId == this.userId) > -1
            ) {
              list.push(key);
            }
          }
          this.homeEmphasisList = list;
        } else {
          this.homeEmphasisLists = data
          this.homeEmphasisList = data;
        }

        let { idx } = this.$route.query;
        if (idx) {
          setTimeout(
            function () {
              this.$refs.elTable.bodyWrapper.scrollTop = $(
                ".emphasis-sort-table table tbody tr:nth-child(" + idx + ")"
              ).position().top;
            }.bind(this),
            50
          );
        }
        this.initSort();
        localStorage.setItem("home-checked", checked);
      });
    },
    initSort() {
      if (this.checkRole(["sys_admin", "admin"])) {
        const tbody = document.querySelector(
          ".sort-table .el-table__body-wrapper tbody"
        );
        let _this = this;
        new Sortable(tbody, {
          onEnd: function (e) {
            let list = Object.assign([], _this.homeEmphasisList);
            list.splice(e.newIndex, 0, list.splice(e.oldIndex, 1)[0]);
            emphasisSort({
              idList: list.map((item) => item.id),
              sort: 2,
            }).then((res) => {});
          },
        });
      }
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
    userName(id) {
      let findData = this.pmDictListOptions.filter(
        (item) => item.dictValue == id
      );
      if (findData.length) {
        return findData[0].dictLabel;
      }
      return "admin";
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
    /**跳转过里添加高亮 */
    tableRowClassName({ row, rowIndex }) {
      let { idx } = this.$route.query;
      if (rowIndex == idx) {
        return "warning-row";
      }
    },
    progressHasHoverClass({ row, column, rowIndex, columnIndex }) {
      let className = "";
      if (this.checkRole(["task_director", "admin"])) {
        if (column.label == "日志") {
          className = "showIcon";
        }
      }
      if (column.label == "状态") {
        var arr = ["text-blue", "text-green", "text-gray", "text-gray"];
        className = arr[row.state - 1];
      }
      let curAr = ["项目名称", "客户", "类型", "工作内容", "计划", "创建人", "关联人员"];

      let isAuth =
        this.checkRole(["sys_admin", "admin"]) || row.createUser == this.userId;
      if (isAuth) {
        if (curAr.indexOf(column.label) > -1) {
          className += "  pointer";
        }
      }
      return className;
    },
    cellClick(row, column, cell, event) {
      let isAuth =
        this.checkRole(["sys_admin", "admin"]) || row.createUser == this.userId;
      switch (column.label) {
        case "事项":
          if (isAuth) {
            this.openUpdate = true;
            this.rowUpdate = row;
          }
          break;
        case "目标":
          if (isAuth) {
            this.openUpdate = true;
            this.rowUpdate = row;
          }
          break;
        case "内容":
          if (isAuth) {
            this.openUpdate = true;
            this.rowUpdate = row;
          }
          break;
        case "状态":
          if (isAuth) {
            this.openUpdate = true;
            this.rowUpdate = row;
          }
          break;
        case "关联人员":
          if (isAuth) {
            this.openUpdate = true;
            this.rowUpdate = row;
          }
          break;
        case "日志":
          this.logRow = row;
          this.openLog = true;
          break;
        default:
          break;
      }
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
    handleAdd() {
      this.openUpdate = true;
      this.rowUpdate = null;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否删除" + '"' + +row.projectName + '"的数据项?', "警告", {
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
    handleUpdate(row, showName, title) {
      this.$refs.Update.reset();
      this.$refs.Update.dialogVisible = true;
      this.$refs.Update.form = Object.assign({}, row);
      this.$refs.Update.showName = showName;
      this.$refs.Update.title = title == undefined ? "售后修改" : title;
    },
  },
};
</script>
<style lang="scss"  scope >
.tag-style-index {
  // line-height: normal;
  // height: auto;
  // min-height: 28px !important;
  // white-space: normal !important;
  // display: flex;
  // align-items: center;
  // justify-content: center;
  max-width: 80px;
  white-space: normal !important;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.emphasis-sort-table {
  .el-table__body tr:hover > td {
    background-color: transparent;
  }
  .warning-row {
    animation: twinkling 5s ease-in-out;
  }
}
.auth {
  text-align: center;
  margin-bottom: 10px;
}
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}
@keyframes twinkling {
  0% {
    // background: #fbbd08;
    // box-shadow: 0 0 0px 0px #fbbd08;
    box-shadow: inset 0px 15px 30px -15px #fbbd08,
      inset 0px -15px 30px -15px #fbbd08;
  }
  15% {
    box-shadow: none;
  }
  30% {
    box-shadow: inset 0px 15px 30px -15px #fbbd08,
      inset 0px -15px 30px -15px #fbbd08;
  }
  45% {
    box-shadow: none;
  }
  60% {
    box-shadow: inset 0px 15px 30px -15px #fbbd08,
      inset 0px -15px 30px -15px #fbbd08;
  }

  75% {
    box-shadow: none;
  }
  // 80% {
  //   box-shadow: inset 0px 15px 30px -15px #fbbd08,
  //     inset 0px -15px 30px -15px #fbbd08;
  // }
  100% {
    box-shadow: none;
  }
}
</style>
