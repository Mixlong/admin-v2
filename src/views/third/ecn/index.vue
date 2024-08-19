<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="ECN编号" prop="ecn">
        <el-input
          v-model="queryParams.ecn"
          placeholder="请输入ECN编号"
          clearable
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>

      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="产品代号" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入产品代号"
          clearable
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
      <el-row :gutter="20" class="fr mt5 flex align-center">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-user-solid"
            v-hasPermi="['ECN:People:Add']"
            @click="handleAddPeople"
          >
            人员管理
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['ecn:add']"
            type="primary"
            icon="el-icon-plus"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="ECN编号" prop="ecn" align="center" />
      <el-table-column label="项目名称" prop="projectName" align="center" />
      <el-table-column label="产品代号" prop="productCode" align="center" />
      <el-table-column
        label="申请部门"
        prop="reqUnit"
        align="center"
        :formatter="reqUnitFormatter"
      />
      <el-table-column label="初审状态" prop="firstState" align="center">
        <template slot-scope="{ row }">
          <el-tag type="warning" v-show="row.firstState === 0">待审核</el-tag>
          <el-tag type="success" v-show="row.firstState === 1">已审核</el-tag>
          <el-tag type="danger" v-show="row.firstState === 2">已驳回</el-tag>

          <div style="margin-top: 5px">审核人：{{ row.firstPerson }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="会审状态"
        prop="changeContent"
        align="center"
        width="220"
      >
        <template slot-scope="{ row }">
          <div style="display: grid; row-gap: 5px">
            <div
              v-for="item in row.list"
              :key="item.id"
              class="flex align-center"
            >
              <div class="flex-sub text-left">
                {{ TriageList[item.field] }}
                --
                <span class="normal-wrap"> {{ item.fieldName }}</span>
              </div>
              <el-tag type="warning" v-show="item.state === 0">待审核</el-tag>
              <el-tag type="success" v-show="item.state === 1">已审核</el-tag>
              <el-tag type="danger" v-show="item.state === 2">已驳回</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="终审状态" prop="secondState" align="center">
        <template slot-scope="{ row }">
          <el-tag type="warning" v-show="row.secondState === 0">待审核</el-tag>
          <el-tag type="success" v-show="row.secondState === 1">已审核</el-tag>
          <el-tag type="danger" v-show="row.secondState === 2">已驳回</el-tag>

          <div style="margin-top: 5px">审核人：{{ row.secondPerson }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="申请人"
        prop="createBy"
        align="center"
        width="100"
      />
      <el-table-column
        label="申请时间"
        prop="createTime"
        align="center"
        sortable
        width="120"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="170"
        class-name="small-padding"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <Tooltip
            v-hasPermi="['ecn:update']"
            v-show="row.secondState !== 1"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(row)"
          />
          <Tooltip
            v-show="row.firstPerson === nickName && row.firstState !== 1"
            class="text-orange"
            icon="el-icon-coordinate"
            :content="`待 （${row.firstPerson}） 初审`"
            @click="handleAuthFlag(row, 1)"
          />

          <Tooltip
            v-show="
              row.firstPerson === nickName &&
              row.firstState === 1 &&
              row.list[0].state === 0
            "
            class="text-grey"
            icon="el-icon-circle-check"
            content="撤销初审"
            @click="handleResetCheck(row, 1)"
          />

          <span v-for="item in row.list" :key="item.id">
            <Tooltip
              style="margin-left: 5px"
              v-if="
                item.fieldName === nickName &&
                item.state !== 1 &&
                row.firstState === 1
              "
              class="text-orange"
              icon="el-icon-coordinate"
              :content="`待 （${item.fieldName}） ${
                item.state === 2 ? '重新' : ''
              }会审`"
              @click="handleAuthFlag(item, 2)"
            />

            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 2
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销采购会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 3
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销品质会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 4
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销生产会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 5
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销工程会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 6
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销研发会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 7
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销仓库会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 8
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销市场会审"
              @click="handleResetCheck(item, 2)"
            />
            <Tooltip
              style="margin-left: 5px"
              v-show="
                item.fieldName === nickName &&
                item.state === 1 &&
                item.field === 9
              "
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销PMC会审"
              @click="handleResetCheck(item, 2)"
            />
          </span>

          <Tooltip
            v-show="
              row.secondPerson === nickName &&
              row.secondState !== 1 &&
              isSecondStateFlag(row)
            "
            class="text-orange"
            icon="el-icon-coordinate"
            :content="`待 （${row.secondPerson}） 终审`"
            @click="handleAuthFlag(row, 3)"
          />
          <Tooltip
            v-show="row.secondPerson === nickName && row.secondState === 1"
            class="text-grey"
            icon="el-icon-circle-check"
            content="撤销终审"
            @click="handleResetCheck(row, 3)"
          />
          <Tooltip
            class="text-green"
            icon="el-icon-view"
            content="详情"
            @click="handleDetail(row)"
          />

          <!-- <Tooltip
            :className="['text-orange']"
            icon="el-icon-folder"
            content="导出"
            @click="handleExport(row)"
          /> -->

          <Tooltip
            v-hasPermi="['ecn:delete']"
            icon="el-icon-delete"
            :class="['text-red']"
            content="删除"
            @click="handleDelete(row)"
          />

          <Tooltip
            v-if="row.file"
            icon="el-icon-download"
            content="附件下载"
            @click="urlDownload(row.file)"
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
      :classifyList="classifyList"
      :involveUnitList="involveUnitList"
    />
    <CompDetail
      ref="compDetail"
      :classifyList="classifyList"
      :involveUnitList="involveUnitList"
      :deptOptions="deptOptions"
    />

    <!-- 审核人员管理 -->
    <el-dialog
      title="ECN审核人员管理"
      :visible.sync="isPeopleManageVisible"
      top="2vh"
      center
      append-to-body
      width="600px"
      :close-on-click-modal="false"
    >
      <el-row type="flex" justify="center">
        <el-col :span="2"></el-col>
        <el-col :span="20">
          <el-form
            ref="peopleForm"
            :model="peopleManageForm"
            :rules="peopleManageRules"
            label-width="100px"
            label-position="left"
            class="input-width"
          >
            <el-form-item label="初审人员：" prop="firstAuditorData">
              <el-select
                class="w100"
                v-model="peopleManageForm.firstAuditorData"
                filterable
                multiple
                clearable
                placeholder="请选择初审人员"
              >
                <el-option
                  v-for="item in pmDictListOptions"
                  :key="item.userId"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="会审人员："></el-form-item>
            <el-form-item>
              <el-form-item label="采购：" prop="buyerData" label-width="70px">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.buyerData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择采购人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="品质：" prop="QAData" label-width="70px">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.QAData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择品质人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="生产："
                prop="productData"
                label-width="70px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.productData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择生产人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="工程："
                prop="engineerData"
                label-width="70px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.engineerData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择工程人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="研发："
                prop="researchData"
                label-width="70px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.researchData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择研发人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="仓库："
                prop="warehouseData"
                label-width="70px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.warehouseData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择仓库人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="市场："
                prop="marketerData"
                label-width="70px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.marketerData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择市场人员"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="PMC：" prop="pmcData" label-width="70px">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.pmcData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in pmDictListOptions"
                    :key="item.userId"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form-item>

            <el-form-item label="终审人员：" prop="finalJudgmentData">
              <el-select
                class="w100"
                v-model="peopleManageForm.finalJudgmentData"
                filterable
                multiple
                clearable
                placeholder="请选择终审人员"
              >
                <el-option
                  v-for="item in pmDictListOptions"
                  :key="item.userId"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPeopleForm">确 定</el-button>
        <el-button @click="isPeopleManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 审核 -->
    <el-dialog
      title="请确认是否通过"
      :visible.sync="authDialogVisible"
      width="600px"
      center
      :close-on-click-modal="false"
    >
      <el-form
        ref="authForm"
        :model="authForm"
        class="form-data"
        :inline="false"
      >
        <el-form-item
          label="通过状态"
          prop="state"
          :rules="[
            {
              required: true,
              message: '请选择通过状态',
              trigger: 'change',
            },
          ]"
        >
          <el-radio-group v-model="authForm.state">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <transition name="el-fade-in-linear">
          <el-form-item class="auth" prop="remark" v-if="authForm.state === 1">
            <el-input
              v-model="authForm.remark"
              class="width-100-style"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="请输入备注信息"
            />
          </el-form-item>
          <el-form-item class="auth" prop="result" v-if="authForm.state === 2">
            <el-input
              v-model="authForm.result"
              class="width-100-style"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="请输入不通过的理由"
            />
          </el-form-item>
        </transition>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAuthForm">确 定</el-button>
        <el-button @click="authDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  bomList,
  bomAuth,
  ecnFirstState,
  ecnFieldState,
  ecnSecondState,
  ecnPersonEdit,
  ecnPersonList,
} from "@/api/third/ecn";
import { dictUserList } from "@/api/system/user";
import CompUpdate from "./components/update";
import CompDetail from "./components/detail";
import { mapGetters } from "vuex";
import { listDept } from "@/api/system/dept";

export default {
  name: "Ecn",
  components: {
    CompUpdate,
    CompDetail,
  },
  data() {
    return {
      open: false,
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      isPeopleManageVisible: false,
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
      authForm: {
        state: 1,
        remark: "",
        result: "",
      },
      // 初审： 1， 会审： 2， 终审： 3
      isAuthFlag: 1,
      // 修改的数据
      isAuthAlterData: {},
      // 审核人员列表
      pmDictListOptions: [],
      // 部门
      deptOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        ecn: "",
        projectName: "",
        productCode: "",
      },
      detailData: {},
      classifyList: [],
      involveUnitList: [],
      peopleManageForm: {
        firstAuditorData: [],
        buyerData: [],
        QAData: [],
        productData: [],
        engineerData: [],
        researchData: [],
        warehouseData: [],
        marketerData: [],
        pmcData: [],
        finalJudgmentData: [],
      },
      // 会审人员
      TriageList: {
        2: "采购",
        3: "品质",
        4: "生产",
        5: "工程",
        6: "研发",
        7: "仓库",
        8: "市场",
        9: "PMC",
      },
      peopleManageRules: {
        firstAuditorData: [
          {
            required: true,
            message: "请选择初审人员",
            trigger: "change",
          },
        ],
        buyerData: [
          {
            required: true,
            message: "请选择采购人员",
            trigger: "change",
          },
        ],
        QAData: [
          {
            required: true,
            message: "请选择品质人员",
            trigger: "change",
          },
        ],
        productData: [
          {
            required: true,
            message: "请选择生产人员",
            trigger: "change",
          },
        ],
        engineerData: [
          {
            required: true,
            message: "请选择工程人员",
            trigger: "change",
          },
        ],
        researchData: [
          {
            required: true,
            message: "请选择研发人员",
            trigger: "change",
          },
        ],
        warehouseData: [
          {
            required: true,
            message: "请选择仓库人员",
            trigger: "change",
          },
        ],
        marketerData: [
          {
            required: true,
            message: "请选择市场人员",
            trigger: "change",
          },
        ],
        pmcData: [
          {
            required: true,
            message: "请选择PMC人员",
            trigger: "change",
          },
        ],
        finalJudgmentData: [
          {
            required: true,
            message: "请选择终审人员",
            trigger: "change",
          },
        ],
      },
      // 初审人员
      firstAuditorData: [],
      // 终审人员
      finalJudgmentData: [],
    };
  },
  computed: {
    ...mapGetters(["userId", "nickName"]),
    isSecondStateFlag() {
      return (row) => {
        return (
          row.firstState === 1 && row.list.every((item) => item.state === 1)
        );
      };
    },
  },
  watch: {
    isPeopleManageVisible(bool) {
      if (bool) {
        this.getTotalPeopleData();
      }
    },
  },
  created() {
    this.getTreeselect();
  },
  async mounted() {
    await this.getDicts("ecn_classify_name").then((res) => {
      this.classifyList = res.data;
    });
    await this.getDicts("ecn_involveUnit").then((res) => {
      this.involveUnitList = res.data;
    });
    this.getList();

    // 获取人员列表
    this.getCheckPeopleList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      bomList(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 生成ECN
    generateDTString() {
      const date = new Date(); // 获取当前日期和时间
      const year = date.getFullYear(); // 获取年份
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 获取月份，月份是从0开始的
      const day = date.getDate().toString().padStart(2, "0"); // 获取日期
      const hours = date.getHours().toString().padStart(2, "0"); // 获取小时
      const minutes = date.getMinutes().toString().padStart(2, "0"); // 获取分钟
      const seconds = date.getSeconds().toString().padStart(2, "0"); // 获取秒
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0"); // 获取毫秒

      // 拼接字符串
      const dtString = `DT-ECN${String(year).slice(
        -2
      )}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
      return dtString;
    },
    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.title = "添加ECN";
      this.$refs.compUpdate.form.ecn = this.generateDTString();
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
    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((res) => {
        this.deptOptions = res.data;
      });
    },
    //
    reqUnitFormatter(row, column, cellvalue, index) {
      return this.deptOptions.find((item) => item.deptId === +row.reqUnit)?.deptName;
    },
    getCheckPeopleList() {
      dictUserList().then((res) => {
        this.pmDictListOptions = res.data;
      });
    },
    // 获取人员列表
    getTotalPeopleData() {
      const requestList = [
        this.getPeopleList(1),
        this.getPeopleList(2),
        this.getPeopleList(3),
        this.getPeopleList(4),
        this.getPeopleList(5),
        this.getPeopleList(6),
        this.getPeopleList(7),
        this.getPeopleList(8),
        this.getPeopleList(9),
        this.getPeopleList(10),
      ];
      Promise.all(requestList).then((res) => {
        const [
          firstAuditorData,
          buyerData,
          QAData,
          productData,
          engineerData,
          researchData,
          warehouseData,
          marketerData,
          finalJudgmentData,
          pmcData,
        ] = res;

        this.peopleManageForm = {
          firstAuditorData,
          buyerData,
          QAData,
          productData,
          engineerData,
          researchData,
          warehouseData,
          marketerData,
          finalJudgmentData,
          pmcData
        };
      });
    },
    getPeopleList(type) {
      return new Promise((resolve) => {
        try {
          ecnPersonList({ type, p: 1, l: 50 }).then((res) => {
            const { list } = res.data;
            resolve(list.map((item) => item.personnel));
          });
        } catch (error) {
          console.error(error);
        }
      });
    },
    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      let params = Object.assign({}, row);

      params.list.forEach((item) => {
        if (item.field === 2) {
          params.selBuyerData = item.fieldName;
          params.buyerTxt = item.programme;
        } else if (item.field === 3) {
          params.selQAData = item.fieldName;
          params.QADataTxt = item.programme;
        } else if (item.field === 4) {
          params.selProductData = item.fieldName;
          params.productDataTxt = item.programme;
        } else if (item.field === 5) {
          params.selEngineerData = item.fieldName;
          params.engineerDataTxt = item.programme;
        } else if (item.field === 6) {
          params.selResearchData = item.fieldName;
          params.researchDataTxt = item.programme;
        } else if (item.field === 7) {
          params.selWarehouseData = item.fieldName;
          params.warehouseDataTxt = item.programme;
          params.finishedHandleTxt = item.treatment;
        } else if (item.field === 8) {
          params.selMarketerData = item.fieldName;
          params.marketerDataTxt = item.programme;
        } else if (item.field === 9) {
          params.selPmcData = item.fieldName;
          params.pmcDataTxt = item.programme;
        }
      });

      params.changeCause = params.changeCause.split(",");
      params.involveUnit = params.involveUnit.split(",").map((item) => +item);
      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "修改ECN" : title;
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "实现方案":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "scheme", "实现方案");
          break;
        case "导入计划":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "plan", "");
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (column.label == "实现方案" || column.label == "导入计划") &&
        (row.principal == this.userId || this.checkRole(["admin"]))
      ) {
        return `cursor: pointer;`;
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否确认删除?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return bomAuth([{ id: row.id, status: 1 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    handleExport(row) {
      let parmas = Object.assign({}, row);
      parmas = this.handleforData(parmas);
      import("./js/export").then((excel) => {
        excel.export_json_to_excel({
          header: [], //表头 必填
          data: parmas, //具体数据 必填
          filename: row.projectName, //非必填
          autoWidth: true, //非必填
          bookType: "xlsx", //非必填
        });
      });
    },
    handleforData(parmas) {
      let classifyName = "";
      let involveName = "";
      let involveUnit = parmas.involveUnit.split(",");
      let changeCause = parmas.changeCause.split(",");
      //分类
      for (let key of this.classifyList) {
        let findVal = changeCause.findIndex((item) => item == key.dictValue);

        classifyName +=
          (findVal > -1 ? "■" : "□") + key.dictLabel + "         ";
      }
      //涉及领域
      for (let key of this.involveUnitList) {
        let findVal = involveUnit.findIndex((item) => item == key.dictValue);
        involveName +=
          (findVal > -1 ? "■" : "□") + key.dictLabel + "                 ";
      }

      parmas.involveUnit = involveName;
      parmas.changeCause = classifyName;
      return parmas;
    },
    handleDetail(row) {
      this.$refs.compDetail.dialogVisible = true;
      let params = Object.assign({}, row);

      params.changeCause = params.changeCause.split(",");
      params.involveUnit = params.involveUnit.split(",").map((item) => +item);

      // 分类
      const changeCauseData = [];
      params.changeCause.forEach((item) => {
        this.classifyList.forEach((cItem) => {
          if (item === cItem.dictValue) {
            changeCauseData.push(cItem);
          }
        });
      });

      params.changeCauseData = changeCauseData;

      // 领域
      const involveUnitData = [];
      params.involveUnit.forEach((item) => {
        this.involveUnitList.forEach((cItem) => {
          if (item === +cItem.dictValue) {
            involveUnitData.push(cItem);
          }
        });
      });

      params.involveUnitData = involveUnitData;

      console.log(params);
      this.$refs.compDetail.form = params;
    },
    // ECN人员管理
    handleAddPeople() {
      this.isPeopleManageVisible = true;
      this.resetPeopleForm();
    },
    resetPeopleForm() {
      this.peopleManageForm = {
        firstAuditorData: [],
        buyerData: [],
        QAData: [],
        productData: [],
        engineerData: [],
        researchData: [],
        warehouseData: [],
        marketerData: [],
        pmcData: [],
        finalJudgmentData: [],
      };
      this.resetForm("peopleForm");
    },
    // ECN审核人员管理
    submitPeopleForm() {
      this.$refs["peopleForm"].validate((valid) => {
        if (valid) {
          const {
            firstAuditorData,
            buyerData,
            QAData,
            productData,
            engineerData,
            researchData,
            warehouseData,
            marketerData,
            pmcData,
            finalJudgmentData,
          } = this.peopleManageForm;

          const setPeopleList = (data, type) => {
            return data.map((personnel) => {
              return {
                type,
                personnel,
              };
            });
          };

          const list = [
            ...setPeopleList(firstAuditorData, 1),
            ...setPeopleList(buyerData, 2),
            ...setPeopleList(QAData, 3),
            ...setPeopleList(productData, 4),
            ...setPeopleList(engineerData, 5),
            ...setPeopleList(researchData, 6),
            ...setPeopleList(warehouseData, 7),
            ...setPeopleList(marketerData, 8),
            ...setPeopleList(finalJudgmentData, 9),
            ...setPeopleList(pmcData, 10),
          ];

          ecnPersonEdit(list).then((res) => {
            console.log(res);
            if (res.data) {
              this.msgSuccess("操作成功");
              this.isPeopleManageVisible = false;
            }
          });
        }
      });
    },

    handleAuthFlag(row, isAuthFlag) {
      this.resetAuthForm();

      this.isAuthAlterData = Object.assign({}, row);
      this.isAuthFlag = isAuthFlag;
      this.authDialogVisible = true;

      if (isAuthFlag === 1) {
        this.authForm = {
          state: row.firstState || 1,
          remark: row.remark,
          result: row.result,
        };
      }

      if (isAuthFlag === 2) {
        this.authForm = {
          state: row.state || 1,
          remark: row.remark,
          result: row.result,
        };
      }

      if (isAuthFlag === 1) {
        this.authForm = {
          state: row.secondState || 1,
          remark: row.finalRemark,
          result: row.finalResult,
        };
      }

      console.log(this.authForm);
    },

    // 撤销审核
    handleResetCheck(row, flag) {
      this.$confirm("确定要撤销终审吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 撤销初审
          if (flag === 1) {
            const data = {
              ...row,
              state: 0,
            };

            ecnFirstState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 撤销会审
          if (flag === 2) {
            const data = {
              field: row.field,
              fieldName: row.fieldName,
              id: row.id,
              bomChangeId: row.bomChangeId,
              state: 0,
            };

            ecnFieldState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 撤销终审
          if (flag === 3) {
            const data = {
              ...row,
              state: 0,
            };

            ecnSecondState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
        })
        .catch(() => {});
    },
    resetAuthForm() {
      this.authForm = {
        state: 1,
      };
      this.resetForm("authForm");
    },
    // 审核
    submitAuthForm() {
      this.$refs["authForm"].validate((valid) => {
        if (valid) {
          // 初审
          if (this.isAuthFlag === 1) {
            const data = {
              id: this.isAuthAlterData.id,
              ...this.authForm,
            };
            ecnFirstState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 会审
          if (this.isAuthFlag === 2) {
            const data = {
              field: this.isAuthAlterData.field,
              fieldName: this.isAuthAlterData.fieldName,
              id: this.isAuthAlterData.id,
              bomChangeId: this.isAuthAlterData.bomChangeId,
              ...this.authForm,
            };

            ecnFieldState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
          // 终审
          if (this.isAuthFlag === 3) {
            const data = {
              id: this.isAuthAlterData.id,
              ...this.authForm,
            };

            ecnSecondState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
        }
      });
    },
  },
};
</script>
<style lang="scss"  scope >
.auth {
  text-align: center;
  margin-bottom: 10px;
}
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}
.mask-layer {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.open-detail-style {
  div {
    > span {
      &:first-child {
        color: #666;
        margin-right: 10px;
      }
    }
  }
}
</style>
