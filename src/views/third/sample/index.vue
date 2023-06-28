<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="客户" prop="key">
        <el-autocomplete size="small" clearable v-model="queryParams.key" :fetch-suggestions="querySearchAsync"
          placeholder="请输入客户" @select="handleQuery"></el-autocomplete>
      </el-form-item>
      <el-form-item label="产品型号" prop="baseModel">
        <el-input size="small" clearable v-model="queryParams.baseModel" placeholder="请输入产品型号"
          @keyup.enter.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="需求" prop="demand">
        <el-input size="small" clearable v-model="queryParams.demand" placeholder="请输入需求"
          @keyup.enter.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="送样时间" prop="sendTime">
        <el-date-picker ref="datePicker" size="small" clearable v-model="queryParams.sendTime" type="date"
          placeholder="选择日期时间" format="yyyy-MM-dd" value-format="yyyy-MM-dd" @change="handleQuery">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="searchState">
        <el-select style="width: 130px" size="small" clearable v-model="queryParams.searchState" placeholder="请选择状态"
          @change="handleQuery">
          <el-option v-for="(item, key) in pmList" :key="key" :label="item" :value="key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="20" type="flex" align="middle" justify="start" class="mt5 mb10" style="width: 300px">
        <el-col>
          <el-checkbox v-model="queryParams.myself" @change="handleQuery" false-label="0" true-label="1">
            查看我的
          </el-checkbox>
        </el-col>
        <el-col>
          <el-checkbox v-model="viewParams.state" @change="simpleView">
            简略信息
          </el-checkbox>
        </el-col>
        <el-col>
          <el-checkbox v-model="queryParams.state" @change="handleQuery">
            显示已完成
          </el-checkbox>
        </el-col>
        <el-col v-if="checkRole(['sale', 'admin'])">
          <el-badge :value="applyTotal > 0 ? applyTotal : ''" class="item">
            <el-button size="mini" @click="showApply">申请列表</el-button>
          </el-badge>
        </el-col>
        <el-col>
          <el-button part="warning" icon="el-icon-download" size="mini" @click="handleExport">
            导出
          </el-button>
        </el-col>
        <el-col>
          <el-button v-if="checkRole(['sale', 'admin'])" type="primary" icon="el-icon-plus" size="mini"
            @click="handleAdd">
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table :row-class-name="rowName" v-loading="loading" :data="brandList" :height="tableHeight()"
      :cell-style="cellStyle" @cell-click="cellClick" border>
      <el-table-column label="基本信息" align="left" header-align="center" width="220">
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
      <el-table-column label="详细需求" prop="demand" align="center" v-if="viewParams.simple">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.demand"></div>
        </template>
      </el-table-column>
      <el-table-column label="配置需求表" width="200" align="center">
        <template slot-scope="{ row }">
          <el-link v-show="row.demandObject" type="primary" @click="toGoodPage(row)">
            样品需求单
          </el-link>
          <div v-for="(item, index) in checkListArr(row.checklist)" :key="index"
            :class="['flex', 'flex-direction', 'align-center', 'normal-wrap']">
            <preview-img :url="item" :srcList="[item]" />
            <p style="white-space: break-spaces; color: blue; margin-top: 2px">
              {{ transImg(item) }}
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当前进展" prop="progress" align="center" width="300" v-if="viewParams.simple">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.progress"></div>
        </template>
      </el-table-column>
      <el-table-column label="责任人&状态" align="center" width="100">
        <template slot-scope="scope">
          <div>
            <!-- 责任人 -->
            <span v-if="scope.row.state == 0">
              {{ principalName(scope.row.pm) }}
            </span>
            <span v-if="scope.row.state == 1">
              {{ principalName(scope.row.se) }}
            </span>
            <span v-if="scope.row.state == 2">
              {{ principalName(scope.row.follow) }}
            </span>
            <span v-if="scope.row.state == 3">
              {{ principalName(scope.row.test) }}
            </span>
            <span v-if="scope.row.state == 4">
              {{ principalName(scope.row.sell) }}
            </span>
          </div>
          <div>
            <!-- 状态 -->
            <span v-if="scope.row.state == 0" class="text-blue">产品经理确认中</span>
            <span v-if="scope.row.state == 1" class="text-green">SE确认中</span>
            <span v-if="scope.row.state == 2" class="text-gray">样品加工中</span>
            <span v-if="scope.row.state == 3" class="text-orange">测试中</span>
            <span v-if="scope.row.state == 4" class="text-yellow">销售<br />验收</span>
            <span v-if="scope.row.state == 5" class="text-cyan">完成中</span>
            <span v-if="scope.row.state == 6" class="text-green">已完成</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间管理" align="center" prop="sendTime" width="160">
        <template slot-scope="scope">
          <span>送样时间</span>
          <div v-if="new Date(scope.row.sendTime + ' 20:00:00').getTime() >
            new Date().getTime() && scope.row.state != 5
            ">
            <div class="text-shadow mb5" :class="[
              difference(
                scope.row.state === 6
                  ? scope.row.actualTime
                  : scope.row.sendTime
              ),
            ]">
              {{
                scope.row.state === 6
                ? scope.row.actualTime
                : scope.row.sendTime
              }}
            </div>
            <div class="flex justify-center align-center" style="transform: scale(0.8)">
              <FlipDown :endDate="new Date(scope.row.sendTime + ' 20:00:00').getTime()" :type="4" :theme="1"
                :timeUnit="['天', ':', ':']" class="flip-down-style text-center" />
            </div>
          </div>
          <div v-else>
            <div class="text-shadow" :class="[
              scope.row.state == 5 ? 'text-green' : 'text-red text-bold',
            ]">
              {{ scope.row.actualTime }}
            </div>
            <!-- <span v-if="scope.row.state != 5" class="text-red text-shadow">已逾期</span> -->
            <!-- <span v-else class="text-green text-shadow">已完成</span> -->
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评审表" width="160" align="center">
        <template slot-scope="{ row }">
          <div v-for="(item, index) in checkListArr(row.reviewer)" :key="index"
            :class="['flex', 'flex-direction', 'align-center', 'normal-wrap']">
            <preview-img :url="item" :srcList="[item]" />
            <p style="white-space: break-spaces; color: blue; margin-top: 2px">
              {{ transImg(item) }}
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80">
        <template slot-scope="scope">
          <div class="flex flex-direction align-center">
            <div class="iflex" style="padding-left: 8px; height: 5px"></div>
            <el-tooltip class="item font16" effect="dark" content="产品经理确认中" placement="top-end" v-if="(checkRole(['admin']) || scope.row.pm == userId) &&
              scope.row.state == 0
              ">
              <el-button icon="el-icon-check" type="text" class="text-green" @click="handleAuthChange(scope.row, 1)">
              </el-button>
            </el-tooltip>
            <el-tooltip class="item font16" effect="dark" content="SE确认中" placement="top-end" v-if="(checkRole(['admin']) || scope.row.se == userId) &&
              scope.row.state == 1
              ">
              <el-button icon="el-icon-check" type="text" class="text-green" @click="handleAuthChange(scope.row, 2)">
              </el-button>
            </el-tooltip>
            <el-tooltip class="item font16" effect="dark" content="样品加工" placement="top-end" v-if="(checkRole(['admin']) || scope.row.follow == userId) &&
              scope.row.state == 2
              ">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green"
                @click="handleAuthChange(scope.row, 3)"></el-button>
            </el-tooltip>
            <el-tooltip class="item font16" effect="dark" content="测试" placement="top-end" v-if="(checkRole(['admin']) || scope.row.test == userId) &&
              scope.row.state == 3
              ">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green"
                @click="handleAuthChange(scope.row, 4)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="销售" placement="top-end" v-if="(checkRole(['admin']) || scope.row.sell == userId) &&
              scope.row.state == 4
              ">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green font16"
                @click="handleAuthChange(scope.row, 5)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="完成" placement="top-end"
              v-if="checkRole(['admin']) && scope.row.state == 5">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green font16"
                @click="handleAuthChange(scope.row, 6)"></el-button>
            </el-tooltip>

            <Tooltip v-if="checkRole(['sale', 'admin'])" icon="el-icon-edit" content="编辑"
              @click="handleSampleUpdate(scope.row)" />
            <Tooltip v-if="checkRole(['sale', 'admin'])" icon="el-icon-copy-document" content="复制"
              @click="handleCopy(scope.row)" />
            <Tooltip v-if="checkRole(['sale', 'admin'])" icon="el-icon-delete" :className="['text-red']" content="删除"
              @click="handleDelete(scope.row)" />
            <el-tooltip class="item" effect="dark" content="附件" placement="top-end" v-if="scope.row.attachment">
              <el-button size="small" icon="el-icon-download" type="text" class="text-green font16"
                @click="handleDownload(scope.row)"></el-button>
            </el-tooltip>
            <Tooltip icon="el-icon-position" content="软件发布"
              @click="$router.push(`/device/fileConfig?number=${scope.row.number}&`)" />
            <Tooltip v-if="checkRole(['admin']) && scope.row.state == 6" icon="el-icon-box" content="转生产"
              @click="handleProd(scope.row)" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />
    <el-dialog :close-on-click-modal="false" title="请确认是否删除" :visible.sync="open" width="310px">
      <div class="padding-bottom-xl custom-code">
        <Verify v-if="open" :codeLength="4" @success="codeSuccess" @error="codeError" :type="1" height="40px"></Verify>
      </div>
    </el-dialog>

    <!-- 转生产 -->
    <el-dialog :close-on-click-modal="false" title="样品转生产" :visible.sync="isSampleProd" width="400px">
      <el-form ref="formProd" :model="formProd" :rules="prodRules" label-width="80px">
        <el-form-item label="转产品类" prop="categoryName">
          <el-select v-model="formProd.categoryName" clearable placeholder="请选择转产品类" style="width: 100%" @change="getSampleCategoryName">
            <el-option v-for="item in sampleProdData.baseModel" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转产型号" prop="computerName">
          <el-radio-group v-model="formProd.type" size="mini" style="margin-bottom: 10px;">
            <el-radio :label="0" border>已有型号</el-radio>
            <el-radio :label="1" border>新增型号</el-radio>
          </el-radio-group>
          <el-select v-if="formProd.type === 0" v-model="formProd.computerName" filterable clearable placeholder="请选择转产型号" style="width: 100%">
            <el-option v-for="item in computerNameList" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
          <el-input v-else v-model="formProd.computerName" clearable placeholder="请输入转产型号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="isProdLoading" type="primary" @click="submitProdForm">
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
  sampleConvertProd
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
      // 总条数
      total: 0,

      brandList: [],

      pmDictListOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
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
      viewParams: {
        state: false,
        simple: true,
      },
      sampleProdData: {},
      computerNameList: [],
      formProd: {
        categoryName: "",
        computerName: "",
        type: 0  
      },
      prodRules: {
        categoryName: [
          { required: true, message: "请选择转产品类", trigger: "change" }
        ],
        computerName : [
          { required: true, message: "请选择转产型号", trigger: "change" }
        ],
      }
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
      this.sampleProdData = row;
      this.computerNameList = [];
      this.isSampleProd = true;
    },
    getSampleCategoryName(name) {
      this.computerNameList = [];
      this.formProd.computerName = "";
      sampleCategoryName(name).then(res => {  
        this.computerNameList = res.data;   
      })
    },
    submitProdForm() {
      this.$refs["formProd"].validate((valid) => {
        if(valid) {
          this.isProdLoading = true;
          console.log(this.sampleProdData)
          sampleConvertProd({ number: this.sampleProdData.number, ...this.formProd }).then(res => {
            this.msgSuccess("操作成功");
            this.isSampleProd = false;
          }).finally(() => {
            this.isProdLoading = false;
          })
        }
      })
    },
    resetProdForm(formName) {
      this.isSampleProd = false;
      this.$refs[formName].resetFields();
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
      const queryParams = this.addDateRange(this.queryParams, this.dateRange);
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
    /** 简介按钮操作 */
    simpleView() {
      this.viewParams.simple = !this.viewParams.simple;
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleCopy(row) {
      this.$refs.compUpdate.isCopyFlag = true;
      this.handleUpdate(row)
    },
    handleSampleUpdate(row) {
      this.$refs.compUpdate.isCopyFlag = false;
      this.handleUpdate(row)
    },
    handleUpdate(row, name) {
      let title = "";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.showName = name;
      this.$refs.compUpdate.isType = -1;
      if (!name) {
        this.$refs.compUpdate.isActural = false;
      } else {
        this.$refs.compUpdate.isActural = true;
      }
      if (name === "sendTime" || name === "actualTime") {
        name === "actualTime" && (title = "请选择实际送样时间");
        this.$refs.compUpdate.datePickerFocus();
      }
      name === "isVersion" && (title = "版本信息");
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
      let that = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url,
          responseType: "arraybuffer",
          onDownloadProgress: function (progressEvent) { },
        })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error.toString());
          });
      });
    },
    rowName({ row, rowIndex }) {
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
    cellStyle({ row, column, rowIndex, columnIndex }) {
      let currentName = "";
      let { state } = row;
      if (state == 0) {
        currentName = row.se;
      } else if (state == 1) {
        currentName = row.follow;
      } else if (state == 2) {
        currentName = row.test;
      } else if (state == 3) {
        currentName = row.sell;
      }

      if (
        (columnIndex == 1 ||
          columnIndex == 2 ||
          columnIndex == 3 ||
          columnIndex == 4 ||
          columnIndex == 5 ||
          columnIndex == 6 ||
          columnIndex == 7) &&
        (this.checkRole(["sale", "admin"]) ||
          (this.userId == currentName && column.label == "详细需求"))
      ) {
        return `cursor: pointer;`;
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
      let currentName = "";
      let { state } = row;
      this.$refs.compUpdate.isTop = false;
      // if (state == 0) {
      //   currentName = row.se;
      // } else if (state == 1) {
      //   currentName = row.follow;
      // } else if (state == 2) {
      //   currentName = row.test;
      // } else if (state == 3) {
      //   currentName = row.sell;
      // }

      if (state == 0) {
        currentName = row.pm;
      } else if (state == 6) {
        currentName = row.se;
      } else if (state == 1) {
        currentName = row.follow;
      } else if (state == 2) {
        currentName = row.test;
      } else if (state == 3) {
        currentName = row.sell;
      }

      if (
        this.checkRole(["sale", "admin"]) ||
        (this.userId == currentName && column.label == "详细需求")
      ) {
        switch (column.label) {
          case "客户":
            this.handleUpdate(row, "customerName");
            break;
          case "产品型号":
            this.handleUpdate(row, "baseModel");
            break;
          case "数量":
            this.handleUpdate(row, "sendNum");
            break;
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
  background-color: rgba(155, 216, 148, 0.3) !important;
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
