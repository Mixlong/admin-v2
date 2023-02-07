<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          size="small"
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>

      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          size="small"
          v-model="queryParams.customerOrderNo"
          placeholder="请输入客户订单号"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="迪太订单号" prop="dtOrderNo">
        <el-input
          size="small"
          v-model="queryParams.dtOrderNo"
          placeholder="请输入迪太订单号"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="型号" prop="model">
        <el-input
          size="small"
          v-model="queryParams.model"
          placeholder="请输入型号"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
      <el-row :gutter="20" class="fr mt5 flex align-center">
        <el-col :span="1.5">
          <el-button
            v-if="checkRole(['sale', 'admin'])"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="table"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
      row-class-name="row-height"
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="订单信息" prop="ecn" align="center" width="220">
        <template slot-scope="scope">
          <div class="text-left order-info-list">
            <el-row :gutter="10" v-if="scope.row.customerName">
              <el-col :span="10">客户名称:</el-col>
              <el-col :span="14">{{ scope.row.customerName }}</el-col>
            </el-row>
            <el-row v-if="scope.row.customerOrderNo">
              <el-col :span="10">客户订单号:</el-col>
              <el-col :span="14">{{ scope.row.customerOrderNo }}</el-col>
            </el-row>
            <el-row v-if="scope.row.customerGoodsNo">
              <el-col :span="10">客户料号:</el-col>
              <el-col :span="14">{{ scope.row.customerGoodsNo }}</el-col>
            </el-row>
            <el-row v-if="scope.row.dtGoodsNo">
              <el-col :span="10">迪太料号:</el-col>
              <el-col :span="14">{{ scope.row.dtGoodsNo }}</el-col>
            </el-row>
            <el-row v-if="scope.row.dtOrderNo">
              <el-col :span="10">迪太订单号:</el-col>
              <el-col :span="14">{{ scope.row.dtOrderNo }}</el-col>
            </el-row>
            <el-row v-if="scope.row.model">
              <el-col :span="10">型号:</el-col>
              <el-col :span="14">{{ scope.row.model }}</el-col>
            </el-row>
            <el-row v-if="scope.row.configVersion">
              <el-col :span="10">配置版本:</el-col>
              <el-col :span="14">{{ scope.row.configVersion }}</el-col>
            </el-row>
            <el-row v-if="scope.row.quantity">
              <el-col :span="10">数量:</el-col>
              <el-col :span="14">{{ scope.row.quantity }}</el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="订单需求"
        prop="projectName"
        align="center"
        width="400"
      >
        <template slot-scope="scope">
          <div v-html="scope.row.orderDemand" class="text-left"></div>
        </template>
      </el-table-column>

      <el-table-column
        label="交付时间"
        prop="productCode"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          {{
            scope.row.deliveryTime ? scope.row.deliveryTime.slice(0, 11) : ""
          }}
        </template>
      </el-table-column>
      <el-table-column label="遗留问题" align="center" class-name="hover-none">
        <template slot-scope="scope">
          <div class="container-list">
            <div
              v-for="(item, index) in scope.row.judgeDetailList"
              :key="index"
              @mouseover="mouseOver(scope.$index, index)"
              @mouseleave="mouseLeave(scope.$index, index)"
              class="text-left justify-start"
              @click="handleUpdateAddTo(scope.row, item, 'problem')"
            >
              <div
                style="width: 100%"
                v-html="item.problem"
                class="text-left padding-xs"
              ></div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="责任领域"
        align="center"
        class-name="hover-none"
        width="130"
      >
        <template slot-scope="scope">
          <div class="container-list">
            <div
              v-for="(item, index) in scope.row.judgeDetailList"
              :key="index"
              @mouseover="mouseOver(scope.$index, index)"
              @mouseleave="mouseLeave(scope.$index, index)"
              @click="handleUpdateAddTo(scope.row, item, 'dept')"
              class="erase-ui"
            >
              <el-select
                :disabled="!checkRole(['sale', 'admin'])"
                v-model="item.dept"
                placeholder="请选择"
                style="width: 100%"
                @change="updateRow(scope.row, item)"
              >
                <el-option
                  v-for="(item, index) in deptList"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="负责人"
        align="center"
        class-name="hover-none"
        width="80"
      >
        <template slot-scope="scope">
          <div class="container-list">
            <div
              v-for="(item, index) in scope.row.judgeDetailList"
              :key="index"
              @mouseover="mouseOver(scope.$index, index)"
              @mouseleave="mouseLeave(scope.$index, index)"
              @click="handleUpdateAddTo(scope.row, item, 'principal')"
              class="erase-ui"
            >
              <el-select
                :disabled="!checkRole(['sale', 'admin'])"
                v-model="item.principal"
                placeholder="请选择"
                style="width: 100%"
                @change="updateRow(scope.row, item)"
              >
                <el-option
                  v-for="(item, index) in pmDictList"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="计划完成时间"
        prop="afterVersion"
        align="center"
        class-name="hover-none"
        width="140"
      >
        <template slot-scope="scope">
          <div class="container-list">
            <div
              v-for="(item, index) in scope.row.judgeDetailList"
              :key="index"
              @mouseover="mouseOver(scope.$index, index)"
              @mouseleave="mouseLeave(scope.$index, index)"
              @click="handleUpdateAddTo(scope.row, item, 'planDoneTime')"
            >
              <div
                v-if="
                  new Date(item.planDoneTime).getTime() >
                    new Date().getTime() && item.state == 1
                "
              >
                <div
                  class="text-shadow mb5"
                  :class="[difference(item.planDoneTime)]"
                >
                  {{ item.planDoneTime ? item.planDoneTime.slice(0, 11) : "" }}
                </div>
                <div
                  class="flex justify-center align-center"
                  style="transform: scale(0.8)"
                >
                  <FlipDown
                    :endDate="new Date(item.planDoneTime).getTime()"
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
                    item.state == 2 ? 'text-green' : 'text-red text-bold',
                  ]"
                >
                  {{ item.planDoneTime ? item.planDoneTime.slice(0, 11) : "" }}
                </div>
                <span v-if="item.state != 2" class="text-red text-shadow"
                  >已逾期</span
                >
                <!-- <span v-else class="text-green text-shadow">已完成</span> -->
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        prop="state"
        align="center"
        class-name="hover-none"
        width="80"
      >
        <template slot-scope="scope">
          <div class="container-list">
            <div
              v-for="(item, index) in scope.row.judgeDetailList"
              :key="index"
              @mouseover="mouseOver(scope.$index, index)"
              @mouseleave="mouseLeave(scope.$index, index)"
              @click="handleUpdateAddTo(scope.row, item, 'state')"
              :class="[item.state == 1 ? 'text-blue' : 'text-green']"
              class="erase-ui"
            >
              <el-select
                :disabled="!checkRole(['sale', 'admin'])"
                v-model="item.state"
                placeholder="请选择"
                style="width: 100%"
                @change="updateRow(scope.row, item)"
              >
                <el-option
                  v-for="(item, index) in stateList"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="60">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['sale', 'admin'])"
            icon="el-icon-circle-plus"
            content="编辑"
            @click="handleAddTo(scope.row)"
          />
          <br />
          <Tooltip
            v-if="checkRole(['sale', 'admin'])"
            icon="el-icon-delete"
            :class="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
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
    <CompUpdate ref="compUpdate" />
    <AddTo
      ref="addTo"
      :deptList="deptList"
      :pmDictList="pmDictList"
      :stateList="stateList"
    />
  </div>
</template>

<script>
import { addClass, removeClass } from "@/utils";
import { judgeList, judgeAuth, judgeOrderUpdate } from "@/api/third/judge";
import CompUpdate from "./components/update";
import AddTo from "./components/addTo";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
export default {
  components: {
    CompUpdate,
    AddTo,
    FlipDown,
  },

  filters: {},
  data() {
    return {
      open: false,
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
      brandList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        customerName: "",
        customerOrderNo: "",
        dtOrderNo: "",
        model: "",
      },
      detailData: {},
      deptList: [],
      pmDictList: [],
      stateList: [
        {
          dictValue: "1",
          dictLabel: "进行中",
        },
        {
          dictValue: "2",
          dictLabel: "已完成",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  async mounted() {
    await this.getDicts("judge_dept").then((res) => {
      this.deptList = res.data;
    });

    await memberDictUser().then((response) => {
      this.pmDictList = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      judgeList(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
        this.$nextTick(() => {
          let { brandList } = this;
          let rowAll = $(".row-height");

          let ul2 = document.getElementsByClassName("container-list");

          for (let i = 0; i < rowAll.length; i++) {
            let score =
              rowAll[i].clientHeight / brandList[i].judgeDetailList.length;
            score = score > 58 ? score : 68;
            let currUl = $($(".row-height")[i]).find(".container-list");
            let firstHeight = 0;
            for (let k = 0; k < currUl.length; k++) {
              let divChild = $($(currUl[k])).find(">div");
              for (let f = 0; f < divChild.length; f++) {
                if (k > 0) {
                  let fd = $($(currUl[0])).find(">div");
                  firstHeight = $($(fd)[f]).css("height");
                  $($(divChild)[f]).css("height", firstHeight);
                }
                $($(divChild)[f]).css("minHeight", score + "px");
              }
            }
          }
        });
      });
    },

    updateRow(parent, row) {
      this.$confirm("检测您更改信息, 是否提交?", "提示", {
        confirmButtonText: "保存",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let param = Object.assign({ judgeId: parent.id }, row);
          judgeOrderUpdate(param).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("修改成功");
              this.dialogVisible = false;
              this.getList();
            }
          });
        })
        .catch(() => {
          this.getList();
        });
    },
    // 移入
    mouseOver(pIndex, index) {
      let ul2 = $($(".row-height")[pIndex]).find(".container-list");
      for (var i = 0; i < ul2.length; i++) {
        for (let y = 0; y < ul2[i].children.length; y++) {
          addClass(ul2[i].children[y], "upon-none");
          if (index == y) {
            addClass(ul2[i].children[y], "hover-col");
          }
        }
      }
    },
    // 移出
    mouseLeave(pIndex) {
      let ul2 = $($(".row-height")[pIndex]).find(".container-list");
      for (var i = 0; i < ul2.length; i++) {
        for (let y = 0; y < ul2[i].children.length; y++) {
          removeClass(ul2[i].children[y], "upon-none");
          removeClass(ul2[i].children[y], "hover-col");
        }
      }
    },
    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加订单决策";
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      let params = Object.assign({}, row);

      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "修改ECN" : title;
    },
    handleAddTo(row) {
      this.$refs.addTo.reset();
      this.$refs.addTo.dialogVisible = true;
      let params = Object.assign({}, row);
      this.$refs.addTo.form = {};
      this.$refs.addTo.form.judgeId = row.id;
      this.$refs.addTo.showName = null;
      this.$refs.addTo.title = "新增问题";
    },
    handleUpdateAddTo(parent, row, name) {
      if (!this.checkRole(["sale", "admin"])) {
        return;
      }
      this.$refs.addTo.reset();
      this.$refs.addTo.dialogVisible = true;
      let params = Object.assign({}, row);
      this.$refs.addTo.form = {};
      this.$refs.addTo.showName = name;

      this.$refs.addTo.form = Object.assign({ judgeId: parent.id }, row);
      this.$refs.addTo.title = "";
    },
    cellClick(row, column, cell, event) {
      if (!this.checkRole(["sale", "admin"])) {
        return;
      }
      switch (column.label) {
        case "订单信息":
          this.handleUpdate(row, "", "订单信息");
          break;
        case "订单需求":
          this.handleUpdate(row, "", "订单信息");
          break;
        case "交付时间":
          this.handleUpdate(row, "", "订单信息");
          break;

        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (!this.checkRole(["sale", "admin"])) {
        return;
      }
      return `cursor: pointer;`;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否确认删除?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return judgeAuth([{ id: row.id, status: 1 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /**时间日期计算大于48小时=2天 显示黑色 、24=1天的显示橘色 、  12小=半天显示红色**/
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
    deptName(row) {
      let index = this.deptList.findIndex((item) => item.dictValue == row.dept);
      if (index > -1) {
        return this.deptList[index].dictLabel;
      }
    },
    principalName(row) {
      let index = this.pmDictList.findIndex(
        (item) => item.dictValue == row.principal
      );
      if (index > -1) {
        return this.pmDictList[index].dictLabel;
      }
    },
    stateName(row) {
      let index = this.stateList.findIndex(
        (item) => item.dictValue == row.state
      );
      if (index > -1) {
        return this.stateList[index].dictLabel;
      }
    },
  },
};
</script>
<style lang="scss"  scope >
.order-info-list {
  .el-row {
    > .el-col:first-child {
      text-align: left;
      color: #999;
    }
  }
}
.erase-ui {
  input {
    border: 0;
    background: transparent;
    padding: 0 !important;
    text-align: center;
  }
  .el-input__suffix {
    display: none;
  }
  &.text-green {
    input {
      color: #39b54a !important;
    }
  }
  &.text-blue {
    input {
      color: #0081ff !important;
    }
  }
}
.container-list {
  width: 100%;
  // position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  > div {
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    justify-content: center;
    border-bottom: 1px solid #dfe6ec;
    transition: background-color 0.25s ease;
    position: relative;
    &:last-child {
      border-color: transparent;
    }
    &.hover-col {
      background: #f5f7fa !important;
    }
    &.position-top-white {
      // &:after {
      //   content: "";
      //   position: absolute;
      //   bottom: 0;
      //   left: 0;
      //   display: block;
      //   width: calc(100%);
      //   height: 40px;
      //   background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
      // }
    }
  }
}
.hover-none {
  padding: 0 !important;
  &:hover {
    background: #fff !important;
  }
  .cell {
    padding: 0 !important;
  }
}
.upon-none {
  background: #fff !important;
}

.hover-row {
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
</style>
