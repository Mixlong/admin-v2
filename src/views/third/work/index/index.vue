<template>
  <div class="app-container">
    <div class="flex align-center margin-bottom-sm justify-between">
      <el-row :gutter="10" class="flex align-center">
        <el-col :span="1.5">
          <el-button
            v-hasRole="['admin', 'project_manager']"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasRole="['admin', 'project_manager']"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="handleDel(1)"
            >删除</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            part="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            >导出</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <div class="margin-left">
            <el-checkbox v-model="isHover" @change="handleHover"
              >展示说明</el-checkbox
            >
          </div>
        </el-col>
      </el-row>
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        @submit.native.prevent
      >
        <el-form-item label="项目名" prop="key" class="margin-0">
          <el-select
            v-model="queryParams.key"
            placeholder="请选择"
            @change="changeState"
            size="small"
          >
            <el-option
              v-for="dict in nameDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目经理" prop="principal" class="margin-0">
          <el-select
            v-model="queryParams.principal"
            placeholder="请选择"
            @change="changeState"
          >
            <el-option
              v-for="dict in compData.pmDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态" prop="state" class="margin-0">
          <el-select
            v-model="state"
            placeholder="请选择"
            multiple
            @change="changeState"
            collapse-tags
            style="width: 195px"
          >
            <el-option
              v-for="dict in compData.stateDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="margin-0">
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
      </el-form>
    </div>
    <el-table
      ref="table1"
      border
      v-loading="loading"
      :data="projectList"
      @selection-change="handleSelectionChange"
      :span-method="objectSpanMethod"
      @row-click="handleCurrentChange"
      :cell-style="cellStyle"
      :row-style="rowStyle"
      @cell-click="cellClick"
      @cell-mouse-enter="cellMouseEnter"
      :height="tableHeight(80)"
      :header-cell-style="{ background: '#909399', color: '#000000' }"
    >
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column
        label="项目名"
        align="center"
        width="180px"
        class="flex flex-sub"
      >
        <template slot-scope="scope">
          <div
            class="flex flex-direction justify-center cont-name-wrap"
            :style="{
              minHeight: storeTableColor[scope.row.id].total * 40 + 'px',
            }"
          >
            <div
              style="margin: 10px"
              class="text-shadow"
              :class="{
                'text-red text-bold ':
                  boleTextHighlight('[' + scope.row.noteTime + ']') == 0,
                'text-blue text-bold ':
                  boleTextHighlight('[' + scope.row.noteTime + ']') == -1,
              }"
            >
              {{ scope.row.name }}
            </div>

            <el-row type="flex" class="bottom" justify="center">
              <el-col class="flex align-center justify-center">
                <div
                  class="margin-right-xs"
                  style="cursor: pointer"
                  @click.stop="handleSort(scope.row, 1)"
                  v-if="checkUserRole()"
                >
                  <i class="iconfont icon-xiangshangzhiding to-top"></i>
                </div>

                <div
                  class="margin-right-xs"
                  style="cursor: pointer"
                  @click.stop="handleSort(scope.row, 2)"
                  v-if="checkUserRole()"
                >
                  <i class="iconfont icon-xiangshang to-up"></i>
                </div>

                <div
                  class="margin-right-xs"
                  style="cursor: pointer"
                  @click.stop="handleSort(scope.row, 3)"
                  v-if="checkUserRole()"
                >
                  <i class="iconfont icon-xiangxia to-down"></i>
                </div>

                <div
                  class="margin-right-xs"
                  style="cursor: pointer"
                  @click.stop="handleSort(scope.row, 4)"
                  v-if="checkUserRole()"
                >
                  <i class="iconfont icon-xiangxiazhidi to-bottom"></i>
                </div>

                <!-- <div
                  style="cursor: pointer"
                  @click.stop="handleAddNotify(scope.row)"
                  v-if="checkUserRole() || checkRole(['sale'])"
                  class="notify"
                ></div> -->
                <div
                  style="cursor: pointer; padding: 4px; font-size: 18px"
                  @click.stop="handleAddPaper(scope.row)"
                  class="el-icon-s-promotion text-mauve"
                ></div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>

      <!--      <el-table-column label="产品类型"  align="center" width="80px">-->
      <!--        <template slot-scope="scope">-->
      <!--          <div>{{scope.row.productType}}</div>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column label="项目说明" align="center" width="210px">
        <template slot-scope="scope">
          <div>
            <el-popover
              width="400"
              v-if="isHover"
              trigger="hover"
              popper-class="custom-style"
              placement="right-start"
              :close-delay="0"
              transition=""
            >
              <p v-html="scope.row.desc"></p>
              <div class="text-blue">
                {{
                  scope.row.noteTime ? scope.row.noteTime : scope.row.createTime
                }}
                <span class="margin-right-xs"></span> by
                {{ scope.row.noteBy ? scope.row.noteBy : scope.row.createBy }}>
              </div>
              <div style="text-align: right; margin: 0"></div>
              <div
                slot="reference"
                v-html="scope.row.desc"
                :style="{
                  height: storeTableColor[scope.row.id].total * 40 + 'px',
                }"
              ></div>
            </el-popover>
            <div
              v-else
              v-html="scope.row.desc"
              :style="{
                height: storeTableColor[scope.row.id].total * 40 + 'px',
              }"
            ></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="150px">
        <!-- <template slot-scope="scope">
          <div>{{getProjectState(scope.row.state)}}</div>
        </template>-->
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.state"
            @change="changeEditState(scope.row)"
            placeholder="请选择"
          >
            <el-option
              v-hasRole="['admin', 'project_manager']"
              v-for="dict in compData.stateDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="项目经理" align="center" width="80px">
        <template slot-scope="scope">
          <div :class="{ 'text-red text-shadow': nickName == scope.row.pm }">
            {{ scope.row.pm }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="工作内容" align="center" width="80px">
        <template slot-scope="scope">
          <div>{{ getWork(scope.row.workId) }}</div>
        </template>
      </el-table-column>

      <el-table-column label="责任人" prop="userId" align="center" width="70px">
        <template slot-scope="scope">
          <div :class="{ 'text-red text-shadow': userId == scope.row.userId }">
            {{ getMember(scope.row.userId) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="进展履历"
        align="center"
        style="padding: 0"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div
            class="item-box item-box-item"
            :class="{
              'text-red': boleTextHighlight(item) == 0,
              'text-blue': boleTextHighlight(item) == -1,
            }"
            v-for="(item, index) in getRecordList(scope.row)"
            :key="index"
            @click="handleToProgress(scope.row)"
          >
            {{ item }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="50px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            style="font-size: 15px"
            v-if="checkUser(scope.row.userId)"
            size="small"
            type="text"
            icon="el-icon-circle-plus-outline"
            @click="handleAddProgress(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />-->
    <!-- 
    <el-dialog
      title="编辑计划"
      :visible.sync="editPlanVisible"
      width="480px"
      center
    >
      <el-form ref="planForm" :model="planForm" @submit.native.prevent>
        <el-form-item prop="name">
          <el-input
            ref="input"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="planForm.plan"
            placeholder="请输入计划"
            @keyup.ctrl.enter="lineFeedPlanForm()"
            @keyup.enter.exact.native.prevent="updatePlanSubmit(0)"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatePlanSubmit(1)">取 消</el-button>
        <el-button type="primary" @click="updatePlanSubmit(0)">确 定</el-button>
      </span>
    </el-dialog>
  -->

    <!-- <el-dialog
      title="请选择项目状态"
      :visible.sync="selectProjectStateVisible"
      width="480px"
      center
    >
      <el-form
        ref="form"
        :model="form"
        style="text-align: center"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="项目状态:">
          <el-select
            v-model="filedValue"
            @change="changeEditState"
            placeholder="请选择"
          >
            <el-option
              v-for="dict in compData.stateDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

   -->
    <el-dialog
      :close-on-click-modal="false"
      title="新增进展"
      :visible.sync="addProgressFormVisible"
      width="30%"
      center
    >
      <el-form
        ref="progressForm"
        :model="progressForm"
        :rules="progressRules"
        @submit.native.prevent
        prop="content"
      >
        <el-form-item prop="content">
          <el-input
            ref="createProgress"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="progressForm.content"
            placeholder="请输入进展"
            @keyup.ctrl.enter="lineFeedProgressForm()"
            @keyup.enter.exact.native.prevent="addProgressSubmit(0)"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addProgressSubmit(1)">取 消</el-button>
        <el-button type="primary" @click="addProgressSubmit(0)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      title="请确认是否删除"
      :visible.sync="delDialogVisible"
      width="30%"
      center
    >
      <el-row style="display: flex">
        <el-input
          auto-complete="off"
          placeholder="验证码"
          v-model="auth.code"
          style="width: 60%; margin-right: 20px"
        >
        </el-input>
        <img @click="getCode" :src="codeUrl" />
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDelSub(0)">取 消</el-button>
        <el-button type="primary" @click="handleDelSub(1)">确 定</el-button>
      </span>
    </el-dialog>

    <AddNotice ref="addNotice" />
    <CompAdd ref="compAdd" :compData="compData" />
    <CompPaper ref="compPaper" :compData="compData" title="飞鸽传书" />
  </div>
</template>

<script>
import {
  listProject,
  sortProject,
  editProject,
  deleteProject,
  dictPmProject,
  dictNameProject,
} from "@/api/third/project";
import { addProjectProgress } from "@/api/third/projectProgress";
import { memberDictUser } from "@/api/system/user";
import { getCodeImg } from "@/api/base/code";
import { checkPermi, checkRole } from "@/utils/permission";
import { taskDictDept } from "@/api/third/task";
import { mapGetters } from "vuex";
import AddNotice from "../note/components/notify";
import mixins from "./js/mixins";
import CompAdd from "./components/add";
import CompPaper from "@/views/third/work/paper/components/update";
export default {
  name: "BikeWork",
  mixins: [mixins],
  components: {
    CompAdd,
    AddNotice,
    CompPaper,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      delDialogVisible: false,
      selectProjectStateVisible: false,
      addProgressFormVisible: false,
      codeUrl: "",
      planForm: {},
      progressForm: {},
      storeTableColor: {},
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      // 非单个禁用
      single: true,
      state: undefined,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      projectList: [],
      memberDictMap: {},
      pmDictList: [],
      nameDictList: [],
      workList: [],
      workDictList: [],
      // 工作负责人
      workPrincipalList: [],
      progressDictList: [
        { k: 1, v: "计划中" },
        { k: 2, v: "已延期" },
        { k: 3, v: "已完成" },
      ],
      stateDictList: [],
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      roleProjectCheckedList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 40,
        key: undefined,
        states: undefined,
      },
      // 表单参数
      form: {},
      progressRules: {
        content: [{ required: true, message: "请输入进展", trigger: "blur" }],
      },
      isHover: true,
      compData: {
        workDictList: [],
        stateDictList: [],
        pmDictList: [],
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "roles", "nickName"]),
  },
  created() {
    let locHover = localStorage.getItem("isHover");
    this.isHover = locHover == "false" ? false : true;
  },
  mounted() {
    taskDictDept().then((response) => {
      for (let key of response.data) {
        key.check = false;
      }
      this.compData.workDictList = response.data;
    });
    this.getDicts("base_project_state").then((response) => {
      this.compData.stateDictList = response.data;
    });

    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.compData.memberDictList = response.data;
        this.compData.memberDictList.forEach((m) => {
          this.memberDictMap[m.dictValue] = m.dictLabel;
        });
      }
    });

    dictPmProject().then((response) => {
      if (response.code === 200) {
        this.compData.pmDictList = response.data;
      }
    });

    dictNameProject().then((response) => {
      if (response.code === 200) {
        this.nameDictList = response.data;
      }
    });

    this.getList(true);
  },

  methods: {
    checkRole,
    // lineFeedPlanForm() {
    //   this.planForm.plan = this.planForm.plan + "\n";
    // },
    // lineFeedForm() {
    //   this.filedValue = this.filedValue + "\n";
    // },
    lineFeedProgressForm() {
      this.progressForm.content = this.progressForm.content + "\n";
    },
    getRecordList(row) {
      if (row.progresss) {
        let list = row.progresss.split("&;");
        return list;
      }
      return [];
    },

    handleCurrentChange(row, event, column) {
      // console.log(row, event, column, event.currentTarget)
    },

    changeEditState(row) {
      editProject(Object.assign({ workIdList: [] }, row)).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("修改成功");
        }
      });
    },
    /** 查询客户列表 */

    getList(isScroll) {
      dictPmProject().then((response) => {
        if (response.code === 200) {
          this.compData.pmDictList = response.data;
        }
      });

      dictNameProject().then((response) => {
        if (response.code === 200) {
          this.nameDictList = response.data;
        }
      });

      this.loading = true;
      if (this.state) {
        this.queryParams.states = this.state.join(",");
      }

      listProject(this.queryParams).then((response) => {
        this.loading = false;
        let arrID = response.data.map((item) => item.id);
        let newArr = Array.from(new Set(arrID));
        let tableObj = {};
        let exportObj = {};
        let tableColor = "#ffffff";
        for (let key of newArr) {
          key += "";
          tableObj[key] = {
            index: arrID.indexOf(key),
            lastIndex: arrID.lastIndexOf(key),
            color: tableColor,
            total: arrID.lastIndexOf(key) - arrID.indexOf(key) + 1,
          };
          tableColor = tableColor == "#ffffff" ? "#E0E0E0" : "#ffffff";
          // exportObj[key] = {
          //   index: arrID.indexOf(key) == 0 ? 0 : arrID.indexOf(key),
          //   lastIndex: arrID.lastIndexOf(key),
          // };
        }

        this.storeTableColor = tableObj;
        let indexObj = {}; //表格动态合并计算下标
        let myMerges = []; //导出合并需要的计算row 下标
        for (let key in tableObj) {
          indexObj[tableObj[key].index] = tableObj[key].total;
          let arr = [];
          for (let i = 0; i < 4; i++) {
            arr.push({
              s: { r: tableObj[key].index + 1, c: i },
              e: { r: tableObj[key].lastIndex + 1, c: i },
            });
          }
          myMerges = myMerges.concat(arr);
        }
        this.tableCoalition = indexObj;
        this.myMerges = myMerges;
        this.projectList = response.data;
        if (isScroll) {
          this.$nextTick(() => {
            this.$refs.table1.bodyWrapper.scrollTop = sessionStorage.getItem(
              "tableScrollTop"
            );
          });
        }
      });
    },
    rowStyle({ row, rowIndex }) {
      let styleJson = {};
      styleJson.borderRight = "#1px solid red";
      styleJson.background = this.storeTableColor[row.id].color;
      // if ((rowIndex / 8) & (1 === 1)) {
      //   styleJson.background = "#E0E0E0";
      // } else {
      //   styleJson.background = "#ffffff";
      // }
      return styleJson;
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      let cellStyle;

      if (
        columnIndex === 1 ||
        columnIndex === 2 ||
        columnIndex === 4 ||
        columnIndex === 6 ||
        columnIndex === 7
      ) {
        cellStyle = "cursor:pointer;padding:0px";
      }
      if (columnIndex === 3) {
        if (row.state === "0") {
          cellStyle = "cursor:pointer;padding:0px;background:#606266";
        } else if (row.state === "1") {
          cellStyle = "cursor:pointer;padding:0px;";
        } else if (row.state === "2") {
          cellStyle = "cursor:pointer;padding:0px;background:#E6A23C";
        } else if (row.state === "3") {
          cellStyle = "cursor:pointer;padding:0px;background:#F56C6C";
        } else if (row.state === "4") {
          cellStyle = "cursor:pointer;padding:0px;background:#67C23A";
        } else if (row.state === "5") {
          cellStyle = "cursor:pointer;padding:0px;background:#409EFF";
        } else if (row.state === "7") {
          cellStyle = "cursor:pointer;padding:0px;background:#000000";
        }
      }

      return cellStyle;
    },
    /**判断履历进展为当日显示高亮红色 */
    boleTextHighlight(str) {
      let d = new Date(str.slice(1, 11)).setHours(0, 0, 0, 0);
      let today = new Date().setHours(0, 0, 0, 0);

      let obj = {
        "-86400000": "-1",
        0: "0",
        86400000: "1",
      };

      return obj[d - today] || -5;
    },
    cellMouseEnter(row, column, cell, event) {},
    headerRowStyle({ row, rowIndex }) {
      let styleJson = {};
      styleJson.background = "#ffffff";
      return styleJson;
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "项目名":
          this.handleUpdateProject({
            filed: "name",
            row,
            width: "490px",
            inline: false,
          });
          break;
        case "产品类型":
          this.handleUpdateProject("productType", column.label, row);
          break;
        case "项目说明":
          this.handleUpdateProject({
            filed: "desc",
            row,
            width: "910px",
            inline: false,
          });
          break;
        /*           case '状态':
              this.handleSelectState(row)
              break;*/
        case "项目经理":
          this.handleUpdateProject({
            filed: "pm",
            row,
            width: "320px",
            inline: false,
          });
          break;
        case "责任人":
          let item = Object.assign(row, { id: row.projectWorkId });
          this.handleUpdateProject({
            filed: "userId",
            row: item,
            width: "320px",
            inline: false,
          });
          break;
        // case "计划":
        //   this.handleUpdatePlan(row);
        //   break;
        default:
          break;
      }
    },
    // handleAddPrincipal() {
    //   this.workPrincipalList.push({});
    //   // this.workPrincipalList.push(Object.assign({}, tableItem))
    // },
    // handleRemovePrincipal(index) {
    //   this.workPrincipalList.splice(index, 1);
    // },
    changeState() {
      this.getList();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 用户状态修改
    handleStatusChange(row) {
      this.auth.id = row.id;
      this.auth.status = 1;
      this.auth.code = undefined;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    getWork(workId) {
      if (workId) {
        if (
          this.compData.workDictList.filter((item) => item.dictValue === workId)
            .length
        ) {
          return this.compData.workDictList.filter(
            (item) => item.dictValue === workId
          )[0].dictLabel;
        }
        return "";
      } else {
        return "";
      }
    },
    getMember(userId) {
      return this.memberDictMap[userId];
    },
    getProjectState(state) {
      return this.compData.stateDictList.filter((item) => item.k === state)[0]
        .v;
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.state = undefined;
      this.handleQuery();
    },
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.auth.uuid = res.uuid;
      });
    },
    handleDel() {
      this.getCode();
      this.delDialogVisible = true;
      this.auth.code = undefined;
    },
    handleDelSub(status) {
      if (status === 1) {
        if (this.auth.code) {
          let data = [];
          for (let i = 0; i < this.ids.length; i++) {
            let authData = {
              id: this.ids[i],
              code: this.auth.code,
              uuid: this.auth.uuid,
              status: status,
            };
            data.push(authData);
          }
          deleteProject(data).then((response) => {
            this.msgSuccess("删除成功");
            this.loading = false;
            this.delDialogVisible = false;
            this.getList();
          });
        } else {
          this.msgError("验证码不能为空");
        }
      } else {
        this.delDialogVisible = false;
      }
    },
    handleSort(row, target) {
      let data = {};
      data.id = row.id;
      data.sort = target;
      sortProject(data).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("操作成功");
          this.getList();
        }
      });
    },

    handleToProgress(row) {
      let queryParam = {
        workId: row.projectWorkId,
        projectId: row.id,
        projectUserId: row.userId,
      };
      this.$router.push({ path: "/prodData/workProgress", query: queryParam });
    },
    // handleSelectState(row) {
    //   this.form = Object.assign({}, row);
    //   this.selectProjectStateVisible = true;
    //   this.filedValue = row.state;
    // },

    handleUpdatePlan(row) {
      this.reset();
      this.planForm = Object.assign({}, row);
      this.planForm.id = this.planForm.projectWorkId;
      this.planForm.projectId = row.id;
      this.planForm.createTime = undefined;
      this.editPlanVisible = true;
      this.title = "编辑计划";
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    handleAdd() {
      this.handleUpdateProject({
        filed: "",
        row: {},
        width: "910px",
        inline: true,
        title: "添加项目",
      });
    },

    handleUpdateProject({ filed, row, width, inline, title }) {
      if (this.checkUserRole()) {
        this.$refs.compAdd.dialogVisible = true;
        this.$refs.compAdd.keyName = filed;
        this.$refs.compAdd.form = Object.assign({}, row);
        this.$refs.compAdd.form.createTime = "";
        this.$refs.compAdd.title = title || "编辑项目";
        this.$refs.compAdd.inline = inline;
        this.$refs.compAdd.width = width;
      }
    },

    handleAddProgress(row) {
      this.progressForm = Object.assign({}, row);
      this.progressForm.id = undefined;
      this.progressForm.projectId = row.id;
      this.addProgressFormVisible = true;
      this.title = "新增进展";
      this.$nextTick(() => {
        this.$refs.createProgress.focus();
      });
    },
    /** 提交按钮 */
    addProgressSubmit: function (status) {
      if (status === 0) {
        this.$refs["progressForm"].validate((valid) => {
          if (valid) {
            addProjectProgress(this.progressForm).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("操作成功");
                this.addProgressFormVisible = false;
                this.getList();
              }
            });
          }
        });
      } else {
        this.addProgressFormVisible = false;
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (
        columnIndex === 0 ||
        columnIndex === 1 ||
        columnIndex === 2 ||
        columnIndex === 3 ||
        columnIndex === 4
      ) {
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
    //**添加通知 */
    handleAddNotify(row) {
      this.$refs.addNotice.open = true;
      this.$refs.addNotice.form = {};
      this.$refs.addNotice.form.projectId = row.id;
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.addDateRange(this.queryParams, this.dateRange);
      let _this = this;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(function () {
        // return exportProject(queryParams);

        import("./js/Export2Excel").then((excel) => {
          const tHeader = [
            "项目名",
            "项目说明",
            "状态",
            "项目经理",
            "项目任务",
            "责任人",
            "进展履历",
          ];
          const filterVal = [
            "name",
            "desc",
            "state",
            "pm",
            "workId",
            "userId",
            "progresss",
          ];

          const list = _this.projectList;
          const data = _this.formatJson(filterVal, list);

          excel.export_json_to_excel({
            header: tHeader, //表头 必填
            data, //具体数据 必填
            filename: "项目看板", //非必填
            autoWidth: true, //非必填
            bookType: "xlsx", //非必填
            myMerges: _this.myMerges,
          });
        });
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "desc") {
            return v[j]
              ? v[j].replace(/<[^<>]+>/g, "\r").replace(/&nbsp;/gi, "")
              : "";
          } else if (j === "state") {
            return this.compData.stateDictList[
              this.compData.stateDictList.findIndex(
                (item) => item.dictValue == v[j]
              )
            ].dictLabel;
          } else if (j === "workId") {
            return this.getWork(v[j]);
          } else if (j === "userId") {
            return this.getMember(v[j]);
          } else if (j === "progresss") {
            return v[j]
              ? v[j].replace(/&;/g, "\r").replace(/&nbsp;/gi, "")
              : "";
          } else {
            return v[j];
          }
        })
      );
    },

    checkUserRole() {
      for (let i = 0; i < this.roles.length; i++) {
        if (this.roles[i] === "admin" || this.roles[i] === "project_manager") {
          return true;
        }
      }
      return false;
    },
    submitForm() {},
    cancel() {},
    checkUser(userId) {
      for (let i = 0; i < this.roles.length; i++) {
        if (this.roles[i] === "admin" || this.roles[i] === "project_manager") {
          return true;
        }
      }
      if (userId) {
        if (userId == this.userId) {
          return true;
        }
      }
      return false;
    },
    handleHover() {
      localStorage.setItem("isHover", this.isHover);
    },
    handleAddPaper(row) {
      this.$refs.compPaper.reset();
      this.$refs.compPaper.dialogVisible = true;
      this.$refs.compPaper.form.title = row.name;
      this.$refs.compPaper.form.remindType = 1;
      this.$refs.compPaper.form.projectId = row.id;
      this.$refs.compPaper.form.paperType = 2;
      this.$refs.compPaper.form.sendUser = this.userId;
    },
  },
  beforeDestroy() {
    sessionStorage.setItem(
      "tableScrollTop",
      this.$refs.table1.bodyWrapper.scrollTop
    );
  },
};
</script>
<style lang="scss">
.cont-name-wrap {
  position: relative;
  padding: 30px 0;
  .top {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .bottom {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
.custom-style.el-popover {
  box-shadow: 12px 12px 2px 0 rgba(0, 0, 0, 0.3);
}
</style>
<style lang="scss" scoped>
.coloraddStyle {
  font-weight: bold;
}
.notify {
  width: 32px !important;
  display: inline-block;
  height: 32px;
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url("data:image/png;base64,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");
}
.to-top {
  color: rgb(26, 144, 255);
}
.to-up {
  color: #1890ff;
}
.to-down {
  color: #1890ff;
}
.to-bottom {
  color: #1890ff;
}

.item-box {
  height: 20px;
  text-align: left;
  line-height: 20px;
}

.item-box-item {
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// table边框颜色
/deep/ .el-table--border:after,
/deep/ .el-table--group:after,
/deep/ .el-table:before {
  background-color: #cccccc;
}

/deep/ .el-table--border,
/deep/ .el-table--group {
  border-color: #cccccc;
}

/deep/ .el-table td,
/deep/ .el-table th.is-leaf {
  border-bottom: 1px solid #cccccc;
}

/deep/ .el-table--border th,
/deep/ .el-table--border th.gutter:last-of-type {
  border-bottom: 1px solid #cccccc;
}

/deep/ .el-table--border td,
/deep/ .el-table--border th {
  border-right: 1px solid #cccccc;
}

/*
  /deep/ .el-table--group, .el-table--border {
    border: 1px solid #CCCCCC !important;
  }

  /deep/ .el-table td,.building-top .el-table th.is-leaf {
    border-bottom:  1px solid #CCCCCC !important;
    border-right:  1px solid #CCCCCC !important;
  }
*/

/*/deep/ .el-table__body tr:hover>td{*/
/*  background-color: red!important;*/
/*}*/

/deep/ .el-table td {
  padding: 0px 0;
}
</style>
