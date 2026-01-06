<template>
  <div class="app-container trial-apply-box">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      size="mini"
      class="search-form"
    >
      <el-form-item label="试产编号" prop="ecn">
        <el-input
          v-model.trim="queryParams.ecn"
          placeholder="请输入试编号"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 200px"
        ></el-input>
      </el-form-item>

      <el-form-item label="产品品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          @change="changeCategory"
          placeholder="请选择产品品类"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="产品型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          clearable
          filterable
          @change="getList"
          placeholder="请选择产品型号"
          style="width: 200px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
          size="mini"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" @click="resetQuery" size="mini"
          >重置</el-button
        >
      </el-form-item>

      <div class="operation-btns">
        <el-button
          type="primary"
          icon="el-icon-user-solid"
          v-hasPermi="['trial:apply:personnel']"
          @click="handleAddPeople"
          >人员管理</el-button
        >
        <el-button
          v-hasPermi="['trial:apply:add']"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          >新增</el-button
        >
      </div>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight(0)" border>
      <el-table-column label="序号" type="index" width="55" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="试产编号" prop="ecn" align="center"/>
      <el-table-column label="产品品类" prop="categoryName" align="center"/>
      <el-table-column label="产品型号" prop="computerName" align="center" width="167" />
      <el-table-column
        label="申请部门"
        prop="reqUnit"
        align="center"
        :formatter="reqUnitFormatter"
        width="80"
      />
      <el-table-column
        label="申请人"
        prop="applicant"
        align="center"
        width="85"
      />
      <!-- 初审状态 -->
      <el-table-column
        label="初审"
        prop="firstState"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-tag type="warning" v-if="row.firstState === 0">待审核</el-tag>
          <el-tag type="success" v-if="row.firstState === 1">已审核</el-tag>
          <el-tag type="danger" v-if="row.firstState === 2">已驳回</el-tag>
          <div style="margin-top: 5px">审核人：{{ row.firstPerson }}</div>
        </template>
      </el-table-column>

      <!-- 会审状态 -->
      <el-table-column label="会审"  align="center" width="668">
        <template slot-scope="{ row }">
          <div style="display: flex; row-gap: 5px; flex-wrap: wrap">
            <div
              v-for="item in row.list"
              :key="item.id"
              class="align-center check-box"
              style="flex-basis: 160px; display: flex; padding: 0 5px"
            >
              <div class="flex-sub text-left">
                {{ TriageList[item.field] }}
                --
                <span class="normal-wrap">{{ item.fieldName }}</span>
              </div>
              <el-tag type="warning" v-if="item.state === 0">待审核</el-tag>
              <el-tag type="success" v-if="item.state === 1">已审核</el-tag>
              <el-tag type="danger" v-if="item.state === 2">已驳回</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
            <!-- PMC审核状态 -->
      <el-table-column
        label="PMC"
        prop="thirdState"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-tag type="warning" v-if="row.thirdState === 0">待审核</el-tag>
          <el-tag type="success" v-if="row.thirdState === 1">已审核</el-tag>
          <el-tag type="danger" v-if="row.thirdState === 2">已驳回</el-tag>
          <div style="margin-top: 5px">审核人：{{ row.thirdPerson }}</div>
        </template>
      </el-table-column>

      <!-- 终审状态 -->
      <el-table-column
        label="终审"
        prop="fourthState"
        align="center"
        width="110"
      >
        <template slot-scope="{ row }">
          <el-tag type="warning" v-if="getFinalState(row) === 0">待审核</el-tag>
          <el-tag type="success" v-if="getFinalState(row) === 1">已审核</el-tag>
          <el-tag type="danger" v-if="getFinalState(row) === 2">已驳回</el-tag>
          <div style="margin-top: 5px">审核人：{{ row.finalPerson }}</div>
        </template>
      </el-table-column>
 
 

 
      <el-table-column
        label="申请时间"
        prop="createTime"
        align="center"
        sortable
        width="110"
      >
      <template slot-scope="{ row }">
        {{ parseTime(row.createTime, '{y}-{m}-{d}') }}
      </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="88">
        <template slot-scope="{ row }">
          <div class="table-options-col" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
            <Tooltip
              icon="el-icon-view"
              content="查看详情"
              @click="handleDetail(row)"
            />

            <Tooltip
              v-hasPermi="['trial:apply:update']"
              v-show="getFinalState(row) !== 1 && row.applicant === nickName"
              icon="el-icon-edit"
              content="编辑"
              @click="handleUpdate(row)"
            />

            <!-- 初审 -->
            <Tooltip
              v-show="row.firstPerson === nickName && row.firstState !== 1"
              class="text-orange"
              icon="el-icon-coordinate"
              :content="`待 （${row.firstPerson}） 初审`"
              @click="handleAuthFlag(row, 1)"
            />

            <Tooltip
              v-show="isFirstStateFlag(row)"
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销初审"
              @click="handleResetCheck(row, 1)"
            />

            <!-- 会审：需初审完成 -->
            <template v-for="item in row.list">
              <Tooltip
                :key="item.id + '-review'"
                style="margin-left: 5px"
                v-if="
                  item.fieldName === nickName &&
                  item.state !== 1 &&
                  row.firstState === 1
                "
                class="text-orange"
                icon="el-icon-coordinate"
                :content="`待（${TriageList[item.field]}）--（${
                  item.fieldName
                }） ${item.state === 2 ? '重新' : ''}会审`"
                @click="handleAuthFlag(item, 2)"
              />

              <Tooltip
                :key="item.id + '-cancel-2'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 2 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（采购）-（${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-3'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 3 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（品质）- （${item.fieldName}）会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-4'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 4 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（生产）- （${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-5'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 5 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（工程）- （${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-6'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 6 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（研发）- （${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-7'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 7 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（仓库）- （${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
              <Tooltip
                :key="item.id + '-cancel-8'"
                style="margin-left: 5px"
                v-show="
                  item.fieldName === nickName &&
                  item.state === 1 &&
                  item.field === 8 &&
                  isFourthStateFlag(row)
                "
                class="text-grey"
                icon="el-icon-circle-check"
                :content="`撤销（市场）-（${item.fieldName}） 会审`"
                @click="handleResetCheck(item, 2)"
              />
            </template>

            <!-- PMC审：需初审、会审完成 -->
            <Tooltip
              v-show="
                row.thirdPerson === nickName &&
                row.thirdState !== 1 &&
                row.firstState === 1 &&
                isAllSecondReviewPassed(row)
              "
              class="text-orange"
              icon="el-icon-coordinate"
              :content="`待 （${row.thirdPerson}） PMC审`"
              @click="handleAuthFlag(row, 4)"
            />

            <Tooltip
              v-show="isThirdStateFlag(row)"
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销PMC审"
              @click="handleResetCheck(row, 4)"
            />

            <!-- 终审：需初审、会审、PMC完成 -->
            <Tooltip
              v-show="
                row.finalPerson === nickName &&
                getFinalState(row) !== 1 &&
                row.firstState === 1 &&
                isAllSecondReviewPassed(row) &&
                row.thirdState === 1
              "
              class="text-orange"
              icon="el-icon-coordinate"
              :content="`待 （${row.finalPerson}） 终审`"
              @click="handleAuthFlag(row, 5)"
            />

            <Tooltip
              v-show="isFourthStateFlag(row)"
              class="text-grey"
              icon="el-icon-circle-check"
              content="撤销终审"
              @click="handleResetCheck(row, 5)"
            />

            <Tooltip
              v-hasPermi="['trial:apply:delete']"
              v-show="row.applicant === nickName && row.firstState === 0"
              icon="el-icon-delete"
              class="text-red"
              content="删除"
              @click="handleDelete(row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 表单弹窗 -->
    <form-dialog ref="formDialog" :dictList="dictList" />

    <!-- 审核弹窗 -->
    <audit-dialog ref="auditDialog" />

    <!-- 详情弹窗 -->
    <detail-dialog ref="detailDialog" />

    <!-- 人员管理弹窗 -->
    <el-dialog
      title="试产申请审核人员管理"
      :visible.sync="isPeopleManageVisible"
      top="2vh"
      center
      append-to-body
      width="600px"
      :close-on-click-modal="false"
    >
      <el-row type="flex" justify="center">
        <el-col :xs="0" :span="2"></el-col>
        <el-col :xs="24" :span="20">
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
                  v-for="(item, index) in pmDictListOptions"
                  :key="index"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="会审人员："></el-form-item>
            <el-form-item label-width="20px">
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
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
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form-item>

            <el-form-item label="终审人员："></el-form-item>
            <el-form-item label-width="20px">
              <el-form-item label="PMC：" prop="pmcData">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.pmcData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="最终审核：" prop="finalJudgmentData">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.finalJudgmentData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, index) in pmDictListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="0" :span="2"></el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPeopleForm">确 定</el-button>
        <el-button @click="isPeopleManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  trialApplyList,
  trialApplyDelete,
  trialApplyPersonnelEdit,
  trialApplyPersonList,
} from "@/api/third/trialApply";
import { dictUserList } from "@/api/system/user";
import { listDept } from "@/api/system/dept";
import { categoryComputerDict } from "@/api/third/fileConfig";
import FormDialog from "./components/form";
import AuditDialog from "./components/audit";
import DetailDialog from "./components/detail";
import Tooltip from "@/components/Tooltip";
import Pagination from "@/components/Pagination";
import { mapGetters } from "vuex";

export default {
  components: { FormDialog, AuditDialog, DetailDialog, Tooltip, Pagination },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 30,
        ecn: "",
        categoryName: "",
        computerName: "",
      },
      isPeopleManageVisible: false,
      
      pmDictListOptions: [],
      dictList: [],
      computerOptions: [],
      deptOptions: [], // 部门选项数据
      // 会审部门字典
      TriageList: {
        2: "采购",
        3: "品质",
        4: "生产",
        5: "工程",
        6: "研发",
        7: "仓库",
        8: "市场",
      },
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
      peopleManageRules: {},
    };
  },
  computed: {
    ...mapGetters(["nickName"]),
  },
  watch: {
    isPeopleManageVisible(bool) {
      if (bool) {
        this.getTotalPeopleData();
      }
    },
  },
  async mounted() {
    // 获取品类字典数据
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });
    this.getList();
    this.getUserList();
    this.getTreeselect()
  },
  methods: {
    getList() {
      this.loading = true;
      trialApplyList(this.queryParams)
        .then((response) => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((res) => {
        this.deptOptions = res.data;
      });
    },

    reqUnitFormatter(row, column, cellvalue, index) {
      // 添加安全检查，防止deptOptions为undefined
      if (!this.deptOptions || !Array.isArray(this.deptOptions)) {
        return row.reqUnit || '--';
      }
      const dept = this.deptOptions.find((item) => item.deptId === +row.reqUnit);
      return dept ? dept.deptName : (row.reqUnit || '--');
    },
    // 品类变更处理
    changeCategory(categoryName) {
      this.queryParams.computerName = "";
      if (categoryName) {
        this.computerOptions =
          this.dictList.filter((item) => item.name === categoryName)[0]
            ?.computerList || [];
      } else {
        this.computerOptions = [];
      }
      this.getList();
    },
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        p: 1,
        l: 30,
        ecn: "",
        categoryName: "",
        computerName: "",
      };
      this.computerOptions = [];
      this.getList();
    },
    getUserList() {
      dictUserList().then((response) => {
        this.pmDictListOptions = response.data;
      });
    },
    handleAddPeople() {
      this.isPeopleManageVisible = true;
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
    getTotalPeopleData() {
      const requestList = [
        this.getPeopleListData(1),
        this.getPeopleListData(2),
        this.getPeopleListData(3),
        this.getPeopleListData(4),
        this.getPeopleListData(5),
        this.getPeopleListData(6),
        this.getPeopleListData(7),
        this.getPeopleListData(8),
        this.getPeopleListData(9),
        this.getPeopleListData(10),
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
          pmcData,
        };
      });
    },
    getPeopleListData(type) {
      return new Promise((resolve) => {
        try {
          trialApplyPersonList({ type, changeType: 4, p: 1, l: 50 }).then(
            (res) => {
              const { list } = res.data;
              resolve(list.map((item) => item.personnel));
            }
          );
        } catch (error) {
          console.error(error);
          resolve([]);
        }
      });
    },
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
                changeType: 4, // 试产申请类型
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

          trialApplyPersonnelEdit(list).then((res) => {
            if (res.data) {
              this.msgSuccess("操作成功");
              this.isPeopleManageVisible = false;
              this.getList(); // 刷新列表数据
            }
          });
        }
      });
    },
    generateECNString() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

      const dtString = `DT-${String(year).slice(
        -2
      )}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
      return dtString;
    },
    handleAdd() {
      this.$refs.formDialog.reset();
      this.$refs.formDialog.title = "新增试产申请";
      this.$refs.formDialog.form.id = undefined;
      this.$refs.formDialog.form.ecn = this.generateECNString();
      this.$refs.formDialog.dialogVisible = true;
    },
    handleUpdate(row) {
      this.$refs.formDialog.reset();
      this.$refs.formDialog.title = "修改试产申请";
      this.$refs.formDialog.initEditData(row);
      this.$refs.formDialog.dialogVisible = true;
    },
    handleDetail(row) {
      this.$refs.detailDialog.showDetail(row.id);
    },
    handleDelete(row) {
      this.$confirm(
        '是否确认删除试产申请编号为"' + row.ecn + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          trialApplyDelete(row.id).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("删除成功");
              this.getList();
            }
          });
        })
        .catch(() => {});
    },
    handleAuthFlag(row, type) {
      this.$refs.auditDialog.showAudit(row, type);
    },
    handleResetCheck(row, type) {
      this.$refs.auditDialog.resetAudit(row, type);
    },
    isFirstStateFlag(row) {
      return row.firstPerson === this.nickName && row.firstState === 1;
    },
    isThirdStateFlag(row) {
      return row.thirdPerson === this.nickName && row.thirdState === 1;
    },
    isFourthStateFlag(row) {
      return row.finalPerson === this.nickName && this.getFinalState(row) === 1;
    },
    // 判断会审是否全部通过（根据list中所有项的state判断）
    isAllSecondReviewPassed(row) {
      // 如果后端已更新secondState，直接使用
      if (row.secondState === 1) return true;
      // 否则根据list计算
      const list = row.list || [];
      if (list.length === 0) return false;
      return list.every(item => item.state === 1);
    },
    getFinalState(row) {
      return row.secondState; // 默认待审核
    },
    cellClick(row, column, cell, event) {
      // 排除操作列，避免点击操作按钮时触发编辑
      if (
        !["el-table__expand-column", "el-table_column_gutter"].includes(
          column.type
        ) &&
        column.label !== "操作"
      ) {
        this.handleUpdate(row);
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      return "cursor: pointer;";
    },
  },
  created() {
    // 初始化时加载部门数据
    this.getTreeselect();
  },
};
</script>

<style lang="scss" scoped>
.trial-apply-box {
  .check-box {
    padding: 5px 0;
  }
}

.search-form {
  margin-bottom: 16px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  ::v-deep .el-form-item {
    margin-bottom: 0;
    margin-right: 10px;

    .el-form-item__label {
      color: #606266;
      font-weight: 500;
    }

    .el-input__inner {
      border-radius: 4px;
      transition: all 0.3s;

      &:hover,
      &:focus {
        border-color: #409eff;
      }
    }
  }

  .operation-btns {
    margin-left: auto;
    display: flex;
    gap: 10px;

    .el-button {
      padding: 8px 15px;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.table-options-col {
  display: flex;
  flex-wrap: wrap;
    justify-content: center!important;
  gap: 0px;
  > * {
    flex: 0 0 calc(30% - 5px);
    display: flex;
    justify-content: center;
    padding:0
  }
}
</style>
