<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="客户" prop="key">
        <el-autocomplete
          size="small"
          clearable
          v-model="queryParams.key"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入客户"
          @select="handleQuery"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="产品型号" prop="baseModel">
        <el-input
          size="small"
          clearable
          v-model="queryParams.baseModel"
          placeholder="请输入产品型号"
          @keyup.enter.native="handleQuery"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="需求" prop="demand">
        <el-input
          size="small"
          clearable
          v-model="queryParams.demand"
          placeholder="请输入需求"
          @keyup.enter.native="handleQuery"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="送样时间" prop="sendTime">
        <el-date-picker
          ref="datePicker"
          size="small"
          clearable
          v-model="queryParams.sendTime"
          type="date"
          placeholder="选择日期时间"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          @change="handleQuery"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="searchState">
        <el-select
          style="width: 130px"
          size="small"
          clearable
          v-model="queryParams.searchState"
          placeholder="请选择状态"
          @change="handleQuery"
        >
          <el-option
            v-for="(item, key) in pmList"
            :key="key"
            :label="item"
            :value="key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row
        :gutter="15"
        class="margin-bottom-xs"
        type="flex"
        justify="space-between"
        align="middle"
      >
        <div class="flex align-center">
          <el-col :span="1.5">
            <el-checkbox
              v-model="queryParams.myself"
              @change="handleQuery"
              false-label="0"
              true-label="1"
            >
              查看我的
            </el-checkbox>
          </el-col>
          <el-col :span="1.5">
            <el-checkbox v-model="queryParams.state" @change="handleQuery">
              显示已完成
            </el-checkbox>
          </el-col>
        </div>

        <div>
          <el-col v-if="checkRole(['sale', 'admin'])" :span="1.5">
            <el-badge :value="applyTotal > 0 ? applyTotal : ''" class="item">
              <el-button size="mini" @click="showApply">申请列表</el-button>
            </el-badge>
          </el-col>
          <el-col :span="1.5">
            <el-button
              part="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-if="checkRole(['sale', 'admin'])"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
            :columns="columns"
          ></right-toolbar>
        </div>
      </el-row>
    </el-form>

    <el-table
      :row-class-name="rowName"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      :cell-class-name="cellClassName"
      @cell-click="cellClick"
      border
    >
      <el-table-column
        label="基本信息"
        align="left"
        header-align="center"
        width="220"
        v-if="columns[0].visible"
      >
        <template slot-scope="{ row }">
          <p v-if="row.number">送样单号: {{ row.number }}</p>
          <p>客户：{{ row.customerName }}</p>
          <div class="tag-box" :key="tag" v-for="tag in row.baseModel">
            产品品类：
            <el-tag style="margin: 5px 0 0 0" size="small">{{ tag }}</el-tag>
          </div>
          <p>数量：{{ row.sendNum }}</p>
          <p v-show="row.harkVersion">硬件版本号：{{ row.harkVersion }}</p>
          <p v-show="row.bootVersion">Boot版本号：{{ row.bootVersion }}</p>
          <p v-show="row.appVersion">APP版本号：{{ row.appVersion }}</p>
          <p v-show="row.uiVersion">UI版本号：{{ row.uiVersion }}</p>
        </template>
      </el-table-column>

      <el-table-column
        label="详细需求"
        prop="demand"
        align="center"
        v-if="columns[1].visible"
      >
        <template slot-scope="{ row }">
          <div
            v-show="!Is_Empty(row.demand)"
            class="text-left"
            v-html="row.demand"
          ></div>
          <el-tag v-show="Is_Empty(row.demand)" type="danger">
            暂无数据
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="配置需求表"
        width="200"
        align="center"
        v-if="columns[2].visible"
      >
        <template slot-scope="{ row }">
          <el-link
            v-show="row.demandObject"
            type="primary"
            @click="toGoodPage(row)"
          >
            样品需求单
          </el-link>
          <el-tag v-show="Is_Empty(row.checklist)" type="danger">
            暂无数据
          </el-tag>
          <div
            v-for="(item, index) in checkListArr(row.checklist)"
            :key="index"
            :class="['flex', 'flex-direction', 'align-center', 'normal-wrap']"
          >
            <preview-img :url="item" :srcList="[item]" />
            <p style="white-space: break-spaces; color: blue; margin-top: 2px">
              {{ transImg(item) }}
            </p>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="当前进展"
        prop="progress"
        align="center"
        width="300"
        v-if="columns[3].visible"
      >
        <template slot-scope="{ row }">
          <div
            v-show="!Is_Empty(row.progress)"
            class="text-left"
            v-html="row.progress"
          ></div>
          <el-tag v-show="Is_Empty(row.progress)" type="danger">
            暂无数据
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="责任人&状态"
        align="center"
        width="100"
        v-if="columns[4].visible"
      >
        <template slot-scope="{ row }">
          <span :class="[auditProcessTitleColor[row.state]]">
            {{ auditProcessTitleData[row.state] }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        label="时间管理"
        align="center"
        prop="sendTime"
        width="170"
        v-if="columns[5].visible"
      >
        <template slot-scope="scope">
          <template v-if="scope.row.state !== 6">
            <div class="text-shadow mb5 text-left">
              下单时间: {{ scope.row.orderTime }}
            </div>
            <div
              class="text-shadow mb5 text-left"
              :class="[difference(scope.row.sendTime)]"
            >
              计划送样时间: {{ scope.row.sendTime }}
            </div>
            <div
              class="flex justify-center align-center"
              style="transform: scale(0.8)"
            >
              <FlipDown
                :endDate="new Date(scope.row.sendTime + ' 20:00:00').getTime()"
                :type="4"
                :theme="1"
                :timeUnit="['天', ':', ':']"
                class="flip-down-style text-center"
              />
            </div>
          </template>

          <template v-else>
            <div class="text-shadow mb5 text-left">
              下单时间: {{ scope.row.orderTime }}
            </div>
            <div
              class="text-shadow mb5 text-left"
              :class="[difference(scope.row.actualTime)]"
            >
              实际送样时间: {{ scope.row.actualTime }}
            </div>
            <div class="text-left">用时天数: {{ scope.row.dateDiff }}</div>
          </template>
        </template>
      </el-table-column>

      <el-table-column
        label="评审表"
        width="160"
        align="center"
        v-if="columns[6].visible"
      >
        <template slot-scope="{ row }">
          <div
            v-for="(item, index) in checkListArr(row.reviewer)"
            :key="index"
            :class="['flex', 'flex-direction', 'align-center', 'normal-wrap']"
          >
            <preview-img :url="item" :srcList="[item]" />
            <p style="white-space: break-spaces; color: blue; margin-top: 2px">
              {{ transImg(item) }}
            </p>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="80"
        v-if="columns[7].visible"
      >
        <template slot-scope="scope">
          <div class="flex flex-direction align-center">
            <Tooltip
              v-if="scope.row.state === item.state"
              v-for="item in authData"
              :key="item.value"
              class="mlZero"
              icon="el-icon-check"
              :content="item.content"
              @click="handleAuthChange(scope.row, item.value)"
            />

            <Tooltip
              class="mlZero"
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-edit"
              content="编辑"
              @click="handleSampleUpdate(scope.row)"
            />

            <Tooltip
              class="mlZero"
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-copy-document"
              content="复制"
              @click="handleCopy(scope.row)"
            />

            <Tooltip
              class="mlZero"
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
              @click="handleDelete(scope.row)"
            />

            <Tooltip
              class="mlZero"
              v-show="scope.row.attachment"
              icon="el-icon-download"
              :className="['text-green']"
              content="附件"
              @click="handleDownload(scope.row)"
            />

            <Tooltip
              class="mlZero"
              icon="el-icon-position"
              content="软件发布"
              @click="
                handleNameToPage('CadFileConfig', { number: scope.row.number })
              "
            />

            <Tooltip
              class="mlZero"
              v-if="checkRole(['admin']) && scope.row.state == 6"
              icon="el-icon-box"
              content="转生产"
              @click="handleProd(scope.row)"
            />
          </div>
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

    <el-dialog
      :close-on-click-modal="false"
      title="请确认是否删除"
      :visible.sync="open"
      width="310px"
    >
      <div class="padding-bottom-xl custom-code">
        <Verify
          v-if="open"
          :codeLength="4"
          @success="codeSuccess"
          @error="codeError"
          :type="1"
          height="40px"
        ></Verify>
      </div>
    </el-dialog>

    <!-- 转生产 -->
    <el-dialog
      title="样品转生产"
      :visible.sync="isSampleProd"
      width="400px"
      center
      :close-on-click-modal="false"
    >
      <el-form
        ref="formProd"
        :model="formProd"
        :rules="prodRules"
        label-width="80px"
      >
        <el-form-item label="转产品类" prop="categoryName">
          <el-select
            v-model="formProd.categoryName"
            clearable
            placeholder="请选择转产品类"
            style="width: 100%"
            @change="getSampleCategoryName"
          >
            <el-option
              v-for="item in sampleProdData.baseModel"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转产型号" prop="computerName">
          <el-radio-group
            v-model="formProd.type"
            size="mini"
            class="flex justify-between"
            style="margin-bottom: 10px; width: 100%"
            @change="formProd.computerName = ''"
          >
            <el-radio :label="0" border>已有型号</el-radio>
            <el-radio :label="1" border>新增型号</el-radio>
          </el-radio-group>

          <el-select
            v-if="formProd.type === 0"
            v-model="formProd.computerName"
            filterable
            clearable
            placeholder="请选择转产型号"
            style="width: 100%"
          >
            <el-option
              v-for="item in computerNameList"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
          <el-input
            v-else
            v-model="formProd.computerName"
            clearable
            placeholder="请输入转产型号"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          :loading="isProdLoading"
          type="primary"
          @click="submitProdForm"
        >
          确 定
        </el-button>
        <el-button @click="resetProdForm('formProd')">取 消</el-button>
      </div>
    </el-dialog>

    <CompUpdate ref="compUpdate" :pmDictListOptions="pmDictListOptions" />
    <CompApply ref="compApply" @applyTotal="applyTotalFn" />
  </div>
</template>

<script>
import {
  sampleList,
  sampleAuth,
  sampleState,
  listCustomer,
  sampleCategoryName,
  sampleConvertProd,
} from "@/api/third/sample";
import { mapGetters } from "vuex";
import CompUpdate from "./components/update";
import CompApply from "./components/apply";
import axios from "axios";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import Verify from "vue2-verify";
import { pmList } from "@/utils/commonData";

export default {
  name: "Sample",
  components: {
    CompUpdate,
    FlipDown,
    Verify,
    CompApply,
  },
  data() {
    return {
      pmList,
      isSampleProd: false,
      isProdLoading: false,
      open: false,
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
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      brandList: [],
      pmDictListOptions: [],
      authData: [
        {
          state: 0,
          value: 1,
          content: "需求确认中",
        },
        {
          state: 1,
          value: 2,
          content: "软件开发中",
        },
        {
          state: 2,
          value: 3,
          content: "测试中",
        },
        {
          state: 3,
          value: 4,
          content: "组装",
        },
        {
          state: 4,
          value: 5,
          content: "评审",
        },
        {
          state: 5,
          value: 6,
          content: "完成",
        },
      ],
      // 审核流程列表
      auditProcessTitleData: {
        0: "需求确认中",
        1: "软件开发中",
        2: "测试中",
        3: "组装",
        4: "评审",
        5: "完成中",
        6: "已完成",
      },
      auditProcessTitleColor: {
        0: "text-blue",
        1: "text-red",
        2: "text-gray",
        3: "text-orange",
        4: "text-yellow",
        5: "text-cyan",
        6: "text-green",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        key: undefined,
        baseModel: undefined,
        demand: "",
        state: true,
        myself: "0",
        sendTime: undefined,
      },
      queryParamsApply: {
        p: 1,
        l: 20,
      },
      applyTotal: 0,
      sampleProdData: {},
      computerNameList: [],
      formProd: {
        categoryName: "",
        computerName: "",
        type: 0,
      },
      prodRules: {
        categoryName: [
          { required: true, message: "请选择转产品类", trigger: "change" },
        ],
        computerName: [
          { required: true, message: "请选择转产型号", trigger: "change" },
        ],
      },
      // 列表显隐信息
      columns: [
        { key: 0, label: "基本信息", visible: true },
        { key: 1, label: "详细需求", visible: true },
        { key: 2, label: "配置需求表", visible: true },
        { key: 3, label: "当前进展", visible: true },
        { key: 4, label: "责任人&状态", visible: true },
        { key: 5, label: "时间管理", visible: true },
        { key: 6, label: "评审表", visible: true },
        { key: 7, label: "操作", visible: true },
      ],
    };
  },
  computed: {
    ...mapGetters(["userId"]),
    checkListArr() {
      return (list, type) => {
        if (list) {
          let listArr = list.split(",");
          return type === 1 ? listArr[0] : listArr;
        }
      };
    },
    transImg() {
      return (item) => {
        if (item) {
          const one = item.lastIndexOf("/") + 1;
          const last = item.lastIndexOf(".");
          return item.substring(one, last);
        }
      };
    },
  },
  mounted() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.key = name;
    }
    let sampleCheck = sessionStorage.getItem("sampleCheck");
    if (sampleCheck) {
      this.queryParams.state = sampleCheck == "false" ? false : true;
    }
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
    // 转生产
    handleProd(row) {
      this.resetProd();
      this.sampleProdData = row;
      this.computerNameList = [];
      this.isSampleProd = true;
    },
    getSampleCategoryName(categoryName) {
      this.computerNameList = [];
      this.formProd.computerName = "";
      sampleCategoryName({ categoryName }).then((res) => {
        this.computerNameList = res.data;
      });
    },
    submitProdForm() {
      this.$refs["formProd"].validate((valid) => {
        if (valid) {
          this.isProdLoading = true;

          sampleConvertProd({
            number: this.sampleProdData.number,
            ...this.formProd,
          })
            .then((res) => {
              this.msgSuccess("操作成功");
            })
            .finally(() => {
              this.isSampleProd = false;
              this.isProdLoading = false;
            });
        }
      });
    },
    resetProd() {
      this.formProd = {
        categoryName: "",
        computerName: "",
        type: 0,
      };
      this.resetForm("formProd");
    },
    resetProdForm(formName) {
      this.isSampleProd = false;
      this.resetProd();
    },
    toGoodPage(row) {
      window.open(
        window.location.origin + "/survey?row=" + JSON.stringify(row)
      );
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      sessionStorage.setItem("sampleCheck", this.queryParams.state);
      params.state = params.state ? "123" : "";
      sampleList(params).then((response) => {
        let list = response.data.list;
        for (let key of list) {
          key.baseModel = key.baseModel
            ? key.baseModel.split(",")
            : key.baseModel;
        }
        this.brandList = list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    querySearchAsync(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createStateFilter(queryString))
        : restaurants;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 3000 * Math.random());
    },
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
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

    /**
     * @description: 责任人名称回显
     * @param {*} principal 责任id
     * @return {*}
     */
    principalName(principal) {
      let { pmDictListOptions } = this;
      let name = "";
      pmDictListOptions.forEach((item) => {
        if (item.dictValue == principal) {
          name = item.dictLabel;
        }
      });
      return name;
    },
    /** 导出按钮操作 */
    handleExport() {
      // const queryParams = this.addDateRange(this.queryParams, this.dateRange);
      let _this = this;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(function () {
        import("./js/Export2Excel").then((excel) => {
          const tHeader = [
            "客户",
            "产品型号",
            "数量",
            "详细需求",
            "当前进展",
            "责任人",
            "时间管理",
            "状态",
          ];
          const filterVal = [
            "customerName",
            "baseModel",
            "sendNum",
            "demand",
            "progress",
            "responsible",
            "sendTime",
            "stateName",
          ];

          const list = _this.brandList;
          const data = _this.formatJson(filterVal, list);
          excel.export_json_to_excel({
            header: tHeader, //表头 必填
            data, //具体数据 必填
            oldData: list,
            filename: "送样管理", //非必填
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
          if (j === "responsible") {
            let name = "";
            switch (v["state"]) {
              case 0:
                name = v["se"];
                break;
              case 1:
                name = v["follow"];
                break;
              case 2:
                name = v["test"];
                break;
              case 3:
                name = v["sell"];
                break;
            }
            return this.principalName(name);
          } else if (j === "progress" || j === "demand") {
            if (v[j]) {
              // v[j].replace(/<[^<>]+>/g, "\n")
              return v[j].replace(/<[^<>]+>/g, "\n").replace(/&nbsp;/gi, "");
            } else {
              return "";
            }
          } else if (j === "sendTime") {
            let name =
              new Date(v["sendTime"]).getTime() < new Date().getTime() &&
              v["state"] != 5
                ? "\n已逾期"
                : "";
            if (name) {
              v["sendTimeColor"] = "e54d42";
            } else if (v["state"] == 5) {
              v["sendTimeColor"] = "";
            } else {
              let color = "";
              let returnClass = this.difference(v["sendTime"]);
              if (returnClass.indexOf("text-red") > -1) {
                color = "e54d42";
              } else if (returnClass.indexOf("text-orange") > -1) {
                color = "f37b1d";
              }

              v["sendTimeColor"] = color;
            }
            return `${v[j]}${name}`;
          } else if (j === "createTime") {
            return v[j] ? v[j].slice(0, 11) : "";
          } else if (j === "stateName") {
            let name = "";
            switch (v["state"]) {
              case 0:
                name = "SE确认中";
                break;
              case 1:
                name = "样品加工中";
                break;
              case 2:
                name = "测试中";
                break;
              case 3:
                name = "销售验收";
                break;
              case 4:
                name = "完成中";
                break;
              case 5:
                name = "已完成";
                break;
            }
            return name;
          } else {
            return v[j];
          }
        })
      );
    },
    /**
     * @description: 下载文件
     * @param {*} row 点击对象
     * @return {*}
     */
    handleDownload(row) {
      this.zipFile(row.attachment, row.customerName + "-" + row.baseModel);
    },
    applyTotalFn(data) {
      this.applyTotal = data;
    },
    handleAdd() {
      this.$refs.compUpdate.isCopyFlag = false;
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.isActural = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加送样";
      this.$refs.compUpdate.isTop = true;
    },
    getSampleState(params) {
      sampleState(params).then((res) => {
        if (res.code == 200) {
          this.getList();
          this.$refs.compUpdate.dialogVisible = false;
        }
      });
    },
    handleAuthChange(row, type) {
      let params = {};
      params.state = type;
      params.id = row.id;
      if (type === 6) {
        this.handleUpdate(row, "actualTime");
        this.$refs.compUpdate.isType = type;
        this.$refs.compUpdate.isParams = params;
        this.$refs.compUpdate.isActural = false;
      } else if (type === 4) {
        // 测试
        this.handleUpdate(row, "isVersion");
        this.$refs.compUpdate.isType = type;
        this.$refs.compUpdate.isParams = params;
      } else {
        sampleState(params).then((res) => {
          if (res.code == 200) {
            this.msgSuccess("确认成功！");
            this.getList();
          }
        });
      }
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
    handleCopy(row) {
      this.$refs.compUpdate.isCopyFlag = true;
      const { number, ...rowData } = row;
      this.handleUpdate(rowData);
    },
    handleSampleUpdate(row) {
      this.$refs.compUpdate.isCopyFlag = false;
      this.handleUpdate(row);
    },
    handleUpdate(row, name) {
      let currentData = Object.assign({}, row);
      if (name === "progress" && currentData.progress === null) {
        currentData.progress = `
          <p><strong>一、备料阶段</strong>：<strong><span style="color: #008000;">【</span><span style="color: #339966;"><span style="color: #008000;">6/29 李博 】</span>已完成备料；</span></strong></p>
          <p>1、PCBA：已有--（V3.2）+（AT芯片）+（RC6621P）&nbsp;&nbsp;&nbsp;</p>
          <p>2、屏幕：&nbsp; 已有--</p>
          <p>3、上壳+下壳+盖板：已有--（丝印定制盖板）&nbsp;&nbsp;</p>
          <p>4、线缆： 已有--客供中控线</p>
          <p>5、按键：已有</p>
          <p>6、其它特殊物料：无</p>
          <p><strong>二、软件程序烧录：</strong><strong><span style="color: #008000;">【6/30 饶祖锋</span></strong><span style="color: #008000;">】 已完成软件开发；</span></p>
          <p><strong>三、组装阶段：</strong><strong>&nbsp;</strong></p>
          <p>1、半成品 ：<span style="color: #008000;"><strong>【6/29 李博</strong>】&nbsp;已完成半成品组装；</span></p>
          <p>2、成品： <strong><span style="color: #008000;">【6/31周荣幸</span></strong><span style="color: #008000;">】&nbsp;&nbsp;已完成成品组装；</span></p>
          <p><strong>四、测试阶段 ：<span style="color: #008000;">【6/30 陈明彬】</span></strong><span style="color: #008000;">&nbsp;已完成测试；</span></p>
          <p><strong>五、超声阶段：<span style="color: #008000;">【 6/31周荣幸】已完成超声；</span></strong></p>
          <p><strong>六</strong><strong>、验收送样阶段： </strong>&nbsp;</p>
        `;
      } else if (name === "demand") {
        this.$refs.compUpdate.isCopyFlag = false;
      }

      let title = "";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = currentData;
      this.$refs.compUpdate.showName = name;
      this.$refs.compUpdate.isType = -1;

      if (!name) {
        this.$refs.compUpdate.isActural = false;
      } else {
        this.$refs.compUpdate.isActural = true;
      }

      if (name === "sendTime" || name === "actualTime") {
        this.$refs.compUpdate.datePickerFocus();
      }

      // dialog 标题
      const dialogTitleList = {
        demand: "详细需求",
        progress: "当前进展",
        step: "责任人&状态",
        isVersion: "版本信息",
      };

      title = dialogTitleList[name];

      this.$refs.compUpdate.title = name ? title : "送样信息";
    },
    showApply() {
      this.$refs.compApply.dialogVisible = true;
    },
    codeError() {
      this.msgError("验证码错误");
    },
    /**
     * @description: 删除送样
     * @param {*}
     * @return {*}
     */
    codeSuccess() {
      let row = this.deleteRow;
      sampleAuth([{ id: row.id, status: 1 }]).then((res) => {
        if (res.code == 200) {
          this.getList();
          this.msgSuccess("删除成功");
          this.open = false;
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.open = true;
      this.deleteRow = row;
    },
    //下载文件并压缩zip下载

    getFile(url) {
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url,
          responseType: "arraybuffer",
          onDownloadProgress: function (progressEvent) {},
        })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error.toString());
          });
      });
    },
    rowName({ row }) {
      let styleJson = " ";
      if (row.state == 6) {
        return "finish-row";
      }
      return styleJson;
    },
    /**
     * @description: 鼠标移入表格显示小手帕
     * @param {*} row
     * @param {*} column
     * @param {*} rowIndex
     * @param {*} columnIndex
     * @return {*}
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      const columnIndexData = [1, 3, 4, 5];

      if (columnIndexData.includes(columnIndex)) {
        return "pointer";
      } else {
        return "";
      }
    },
    /**
     * @description: 表格点击对应修改内容
     * @param {*} row
     * @param {*} column
     * @param {*} cell
     * @param {*} event
     * @return {*}
     */
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "详细需求":
          this.handleUpdate(row, "demand");
          break;
        case "当前进展":
          this.handleUpdate(row, "progress");
          break;
        case "责任人&状态":
          let name = "step";
          this.handleUpdate(row, name);
          break;
        case "时间管理":
          this.handleUpdate(row, "sendTime");
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style lang="scss" scope>
.custom-code {
  .cerify-code-panel {
    display: flex;
    flex-direction: row-reverse;

    .verify-input-area {
      width: 100%;
    }

    .verify-change-area {
      display: none;
    }

    .varify-input-code {
      background-color: #ffffff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      height: 40px;
      line-height: 40px;
      outline: none;
      padding: 0 15px;
    }
  }

  .verify-btn {
    width: 270px;
    color: #ffffff;
    background-color: #0098f7;
    border-color: #0098f7;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    height: 34px;
    border-radius: 5px;
  }

  .verify-btn:hover,
  .everify-btn:focus {
    background: #33adf9;
    border-color: #33adf9;
    color: #ffffff;
  }
}

.auth {
  text-align: center;
  margin-bottom: 10px;
}

.finish-row td,
.finish-row:hover td {
  background-color: rgba(119, 176, 113, 0.3) !important;
}

.demo-table-expand {
  .tag-box {
    display: flex;
  }
}

.demo-table-expand label {
  width: 82px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  display: flex;
  margin-bottom: 0;
}

.app-container {
  .el-table__body {
    td {
      .cell {
        max-height: 317px;
        overflow: auto;
      }
    }
  }
}

.contentOverflow {
  max-height: 450px;
  overflow: auto;
}
</style>
