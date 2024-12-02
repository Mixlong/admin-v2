<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          clearable
          filterable
          style="max-width: 135px"
          @change="changeCategory"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          clearable
          filterable
          @change="getList"
          style="max-width: 135px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="整机SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入"
          clearable
          style="max-width: 135px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          v-model="queryParams.customerOrderNo"
          placeholder="请输入"
          clearable
          style="max-width: 135px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="箱号" prop="boxNo">
        <el-input
          v-model="queryParams.boxNo"
          placeholder="请输入"
          clearable
          style="max-width: 135px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工单号" prop="orderCode">
        <select-loadMore
          v-model="queryParams.orderCode"
          :data="orderData.data"
          :page="orderData.page"
          :hasMore="orderData.more"
          dictLabel="orderCode"
          dictValue="orderCode"
          :request="getProdPlantList"
          style="max-width: 135px"
          placeholder="请选择"
        >
        </select-loadMore>
      </el-form-item>
      <el-form-item label="迪太订单号" prop="salesOrderNo">
        <el-input
          v-model="queryParams.salesOrderNo"
          placeholder="请输入"
          clearable
          style="width: 135px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="测试环节" prop="processName">
        <el-select
          v-model="queryParams.processName"
          clearable
          style="max-width: 110px"
        >
          <el-option
            v-for="dict in testList"
            :key="dict.dictCode"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="fr">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
        <el-button type="warning" icon="el-icon-download" @click="handleExport">
          导 出
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      :cell-class-name="cellClassName"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" />
      <el-table-column label="整机SN" prop="sn" align="center">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="客户订单号" prop="customerOrderNo" align="center">
        <span slot-scope="scope" v-NoData="scope.row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column label="迪太订单号" prop="salesOrderNo" align="center">
        <span slot-scope="scope" v-NoData="scope.row.salesOrderNo"></span>
      </el-table-column>
      <el-table-column label="蓝牙地址" prop="mac" align="center">
        <span slot-scope="scope" v-NoData="scope.row.mac"></span>
      </el-table-column>
      <el-table-column label="生产地点" prop="factory" align="center">
        <span slot-scope="scope" v-NoData="scope.row.factory"></span>
      </el-table-column>
      <el-table-column label="箱号" prop="boxNo" align="center">
        <template slot-scope="{ row }">
          <el-tooltip
            effect="dark"
            content="点击跳转发货管理"
            placement="top"
            :disabled="Is_Empty(row.boxNo)"
          >
            <el-link
              type="primary"
              :underline="!Is_Empty(row.boxNo)"
              :disabled="Is_Empty(row.boxNo)"
              @click="
                handleNameToPage('Delivery', {
                  customerName: row.customerName,
                  salesOrderNo: row.salesOrderNo,
                  customerOrderNo: row.customerOrderNo,
                  categoryName: row.categoryName,
                  computerName: row.computerName,
                })
              "
            >
              {{ Is_Empty(row.boxNo) ? "- - -" : row.boxNo }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="工单号" prop="orderCode" align="center">
        <template slot-scope="{ row }">
          <el-tooltip
            effect="dark"
            content="点击跳转物料追踪"
            placement="top"
            :disabled="Is_Empty(row.orderCode)"
          >
            <el-link
              type="primary"
              :underline="!Is_Empty(row.orderCode)"
              :disabled="Is_Empty(row.orderCode)"
              @click="
                handleNameToPage('TrackRecord', {
                  orderCode: row.orderCode,
                })
              "
            >
              {{ Is_Empty(row.orderCode) ? "- - -" : row.orderCode }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="装箱时间"
        prop="packingTime"
        align="center"
        sortable
      >
        <span slot-scope="{ row }" v-NoData="parseTime(row.packingTime)"></span>
      </el-table-column>
      <el-table-column label="气密性测试" align="center" width="90">
        <template slot-scope="scope">
          <el-button type="text" @click="seeGasDetail(scope.row.sn)" :disabled="!scope.row.sn">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="版本信息" align="center" width="85">
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row.id)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="配件信息" align="center" width="85">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click="$router.push(`/www/PartInfoView/parts?sn=${row.sn}`)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="测试信息" align="center" width="85">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click="
              handleNameToPage('StsTestResult', {
                sn: row.sn,
                recordId: row.id,
              })
            "
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 气密性测试 -->
    <el-dialog
      title="气密性测试"
      :visible.sync="isGasDetailShow"
      width="50%"
      center
      append-to-body
      top="1vh"
      :close-on-click-modal="false"
    >
      <el-table
        ref="gasTabRef"
        :data="gasDetail"
        border
        height="600"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" fixed>
          <div slot-scope="{ row }">
            <template v-if="row.tightnessJson">
              <p class="margin-left">
                <span>
                  <b>防水测试标准：</b> {{ waterproofingTestStandard }}
                </span>
                <span class="margin-left-lg">
                  <b>备注：</b> {{ gasCopnfigRemark }}
                </span>
              </p>
              <el-row :gutter="10" class="gas-config-box">
                <el-col :span="7">
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试时间参数(S)</span>
                    </div>
                    <div
                      class="flex align-center justify-between"
                      v-for="(item, index) in testTimeData"
                      :key="index"
                    >
                      <el-tag
                        color="#00aadc"
                        effect="dark"
                        size="medium"
                        style="border: none; display: flex; align-items: center"
                      >
                        {{ item.label }}
                      </el-tag>
                      <el-input
                        v-model="item.value"
                        readonly
                        style="width: 120px"
                      />
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="10">
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试压力参数</span>
                    </div>
                    <div
                      class="flex align-center justify-between"
                      v-for="(item, index) in testPressureData"
                      :key="index"
                    >
                      <el-tag
                        color="#00aadc"
                        effect="dark"
                        size="medium"
                        style="border: none; display: flex; align-items: center"
                      >
                        {{ item.label }}
                      </el-tag>
                      <div class="flex align-center space-between">
                        <el-input v-model="item.value" readonly />
                        <div class="unit-box">{{ item.unit }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="7" class="test-front-end-box">
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试前外部输出状态(S)</span>
                    </div>
                    <div
                      class="flex align-center justify-between"
                      v-for="(item, index) in testFrongData"
                      :key="index"
                    >
                      <el-tag
                        type="warning"
                        effect="dark"
                        size="medium"
                        style="width: 70px; text-align: center"
                      >
                        {{ item.label }}
                      </el-tag>
                      <el-input
                        v-model="item.value"
                        readonly
                        style="width: 120px"
                      />
                    </div>
                  </el-card>
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试后外部输出状态(S)</span>
                    </div>
                    <div
                      class="flex align-center justify-between"
                      v-for="(item, index) in testEndData"
                      :key="index"
                    >
                      <el-tag
                        type="success"
                        effect="dark"
                        size="medium"
                        style="width: 70px; text-align: center"
                      >
                        {{ item.label }}
                      </el-tag>
                      <el-input
                        v-model="item.value"
                        readonly
                        style="width: 120px"
                      />
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </template>
            <template v-else>
              <el-empty description="暂无数据"></el-empty>
            </template>
          </div>
        </el-table-column>
        <el-table-column label="迪太SN" prop="dtSn" align="center" />
        <el-table-column
          label="测试压力(KPa)"
          prop="testPressure"
          align="center"
        />
        <el-table-column label="小泄漏(KPa)" prop="leakValue" align="center" />
        <el-table-column
          label="耗时"
          prop="consumeTime"
          align="center"
          sortable
        >
          <span
            slot-scope="{ row }"
            v-NoData="formattedTime({ time: row.consumeTime, timeType: 'ms' })"
          />
        </el-table-column>
        <el-table-column label="测试时间" prop="time" align="center" sortable>
          <span slot-scope="{ row }" v-NoData="parseTime(row.time)" />
        </el-table-column>
        <el-table-column
          label="测试结果"
          prop="testResult"
          align="center"
          width="100"
        >
          <el-tag :type="gasTestResultTag[row.testResult]" slot-scope="{ row }">
            {{ gasTestResultData[row.testResult] }}
          </el-tag>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog
      title="版本信息"
      :visible.sync="isStsDetailShow"
      center
      append-to-body
      top="1vh"
      width="80%"
    >
      <el-table :data="stsDetail" bordered height="450">
        <el-table-column
          label="工序名称"
          prop="processName"
          align="center"
          width="100"
        />
        <el-table-column label="品类" prop="categoryName" align="center" />
        <el-table-column label="型号" prop="computerName" align="center" />
        <el-table-column label="HW版本" prop="hwVersion" align="center" />
        <el-table-column label="UI版本" prop="uiVersion" align="center" />
        <el-table-column label="BOOT版本" prop="bootVersion" align="center" />
        <el-table-column label="APP版本" prop="appVersion" align="center" />
        <el-table-column label="MAC" prop="mac" align="center" width="130" />
        <el-table-column label="SN" prop="sn" align="center" />
        <el-table-column label="pcbaSn" prop="pcbaSn" align="center" />
        <el-table-column label="生产状态" prop="isRework" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.isRework === 0" type="success">正常生产</el-tag>
            <el-tag v-if="row.isRework === 1" type="danger">返工</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="测试结果"
          prop="result"
          align="center"
          width="80"
        />
        <el-table-column
          label="测试时间"
          prop="testTime"
          align="center"
          width="140"
          sortable
        >
          <span slot-scope="{ row }" v-NoData="parseTime(row.testTime)"></span>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  recordList,
  recordGasList,
  recordVersionList,
  stsProductRecordExport,
} from "@/api/third/fileConfig";
import { orderWorkList } from "@/api/third/prodPlant";
import { CategoryMixin } from "@/mixins/common";

export default {
  name: "ProductRecord",
  mixins: [CategoryMixin],
  data() {
    return {
      isStsDetailShow: false,
      isGasDetailShow: false,
      // 防水测试标准
      waterproofingTestStandard: "",
      // 备注
      gasCopnfigRemark: "",
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      brandList: [],
      testList: [],
      testDetail: [],
      stsDetail: [],
      gasDetail: [],
      testTimeData: [
        {
          label: "充气时间",
          value: undefined,
          key: "inflationTime",
        },
        {
          label: "稳压时间",
          value: undefined,
          key: "stablePressureTime",
        },
        {
          label: "测试时间",
          value: undefined,
          key: "testTime",
        },
        {
          label: "放气时间",
          value: undefined,
          key: "deflationTime",
        },
        {
          label: "定量进气",
          value: undefined,
          key: "quantitativeInflationTime",
        },
        // {
        //   label: "分压时间",
        //   value: undefined,
        //   key: "PartialPressureTime",
        // },
        // {
        //   label: "下一程序",
        //   value: undefined,
        //   key: "NextProcedure",
        // },
      ],
      testPressureData: [
        {
          label: "进气压力",
          value: undefined,
          unit: "KPa",
          key: "intakePressure",
        },
        {
          label: "进气上限",
          value: undefined,
          unit: "KPa",
          key: "upperIntakeLimit",
        },
        {
          label: "进气下限",
          value: undefined,
          unit: "KPa",
          key: "lowerIntakeLimit",
        },
        {
          label: "泄漏上限",
          value: undefined,
          unit: "KPa",
          key: "upperLeakageLimit",
        },
        {
          label: "泄漏下限",
          value: undefined,
          unit: "KPa",
          key: "lowerLeakageLimit",
        },
        // {
        //   label: "泄漏偏移",
        //   value: undefined,
        //   unit: "Pa",
        //   key: "LeakageMigration",
        // },
        // {
        //   label: "大漏上限",
        //   value: undefined,
        //   key: "LargeLeakLimit",
        // },
        // {
        //   label: "大漏下限",
        //   value: undefined,
        //   key: "LargeLeakLowLimite",
        // },
        // {
        //   label: "工件容积",
        //   value: undefined,
        //   unit: "ml",
        //   key: "workVolume",
        // },
      ],
      testFrongData: [
        {
          label: "延时1",
          value: undefined,
          key: "beforeTestOutputDelay1",
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "beforeTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "beforeTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "beforeTestOutputDelay4",
        // },
      ],
      testEndData: [
        {
          label: "延时1",
          value: undefined,
          key: "afterTestOutputDelay1",
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "afterTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "afterTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "afterTestOutputDelay4",
        // },
      ],
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      gasTestResultData: {
        1: "测试通过",
        2: "测试NG",
        3: "测试超时",
      },
      gasTestResultTag: {
        1: "success",
        2: "danger",
        3: "warning",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        processName: "",
        result: "",
        orderCode: "",
        boxNo: "",
        processName: "",
        salesOrderNo: "",
      },
    };
  },
  // watch: {
  //   isGasDetailShow(show) {
  //     console.log("show", show)
  //     if(!show && this.gasDetail.length) {
  //       this.gasDetail.forEach(row => {
  //         this.$refs.gasTabRef.toggleRowExpansion(row, false);
  //       })
  //     }
  //   }
  // },
  created() {
    const { type, categoryId, status, model } = this.$route.query;
    this.queryParams.type = type ?? "";
    this.queryParams.categoryId = categoryId ?? "";
    this.queryParams.status = status ?? "";
    this.queryParams.computerId = model ?? "";

    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });

    this.getList();
  },
  activated() {
    this.handleSearchPage();
  },
  methods: {
    setConfigDefaultVal() {
      this.testTimeData = [
        {
          label: "充气时间",
          value: undefined,
          key: "inflationTime",
        },
        {
          label: "稳压时间",
          value: undefined,
          key: "stablePressureTime",
        },
        {
          label: "测试时间",
          value: undefined,
          key: "testTime",
        },
        {
          label: "放气时间",
          value: undefined,
          key: "deflationTime",
        },
        {
          label: "定量进气",
          value: undefined,
          key: "quantitativeInflationTime",
        },
        // {
        //   label: "分压时间",
        //   value: undefined,
        //   key: "PartialPressureTime",
        // },
        // {
        //   label: "下一程序",
        //   value: undefined,
        //   key: "NextProcedure",
        // },
      ];

      this.testPressureData = [
        {
          label: "进气压力",
          value: undefined,
          unit: "KPa",
          key: "intakePressure",
        },
        {
          label: "进气上限",
          value: undefined,
          unit: "KPa",
          key: "upperIntakeLimit",
        },
        {
          label: "进气下限",
          value: undefined,
          unit: "KPa",
          key: "lowerIntakeLimit",
        },
        {
          label: "泄漏上限",
          value: undefined,
          unit: "Pa",
          key: "upperLeakageLimit",
        },
        {
          label: "泄漏下限",
          value: undefined,
          unit: "Pa",
          key: "lowerLeakageLimit",
        },
        // {
        //   label: "泄漏偏移",
        //   value: undefined,
        //   unit: "Pa",
        //   key: "LeakageMigration",
        // },
        // {
        //   label: "大漏上限",
        //   value: undefined,
        //   key: "LargeLeakLimit",
        // },
        // {
        //   label: "大漏下限",
        //   value: undefined,
        //   key: "LargeLeakLowLimite",
        // },
        // {
        //   label: "工件容积",
        //   value: undefined,
        //   unit: "ml",
        //   key: "workVolume",
        // },
      ];

      this.testFrongData = [
        {
          label: "延时1",
          value: undefined,
          key: "beforeTestOutputDelay1",
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "beforeTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "beforeTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "beforeTestOutputDelay4",
        // },
      ];

      this.testEndData = [
        {
          label: "延时1",
          value: undefined,
          key: "afterTestOutputDelay1",
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "afterTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "afterTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "afterTestOutputDelay4",
        // },
      ];
    },
    setGasConfigParams(json) {
      const jsonData = JSON.parse(json);

      const { waterproofingTestStandard, remark } = jsonData;
      this.waterproofingTestStandard = waterproofingTestStandard;
      this.gasCopnfigRemark = remark;

      const gasConfigList = [
        "testTimeData",
        "testPressureData",
        "testFrongData",
        "testEndData",
      ];

      gasConfigList.forEach((name) => {
        this[name].forEach((item) => {
          if (jsonData[item.key] || jsonData[item.key] === 0) {
            item.value = jsonData[item.key];
          }
        });
      });
    },
    handleExpandChange(row) {
      if (row.tightnessJson) {
        this.setGasConfigParams(row.tightnessJson);
      }
    },
    handleSearchPage() {
      const { boxNo } = this.$route.params;
      const { recordId } = this.$route.query;

      if (boxNo) {
        this.queryParams.boxNo = boxNo;
      }

      if (recordId) {
        this.queryParams.recordId = recordId;
      }
      this.handleQuery();
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      recordList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 生产工单 */
    getProdPlantList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        orderWorkList({
          p: page,
          orderCode: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.orderData.data = [...this.orderData.data, ...list];
          } else {
            this.orderData.data = list;
          }
          this.orderData.more = pageNum * pageSize < total;
          this.orderData.page = pageNum;
          resolve();
        });
      });
    },
    // 测试详情
    async seeDetail(recordId) {
      this.isStsDetailShow = true;
      const result = await recordVersionList({ recordId });
      this.stsDetail = result.data;
    },
    // 气密性测试
    seeGasDetail(sn) {
      this.isGasDetailShow = true;
      recordGasList({ sn }).then((res) => {
        this.gasDetail = res.data;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.recordId = "";
      this.queryParams = {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        processName: "",
        result: "",
        orderCode: "",
        boxNo: "",
      };
      this.resetForm("queryForm");
      this.handleQuery();
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
      const columnIndexData = [7];
      if (this.Is_Empty(row.boxNo)) {
        return;
      }

      if (columnIndexData.includes(columnIndex)) {
        return "pointer";
      } else {
        return "";
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出产品记录数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return stsProductRecordExport(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.gas-config-box {
  /* height: 440px; */
  height: 240px;
  margin-bottom: 20px;
  .el-col {
    height: 100%;
    .el-card-box {
      height: 100%;
      /deep/ .el-card__header {
        background: #00aaaa;
        color: #fff;
        text-align: center;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      /deep/ .el-card__body {
        padding: 10px;
        height: calc(100% - 40px);
        display: grid;
        /* align-content: space-between; */
      }
    }
  }

  .test-front-end-box {
    display: grid;
    row-gap: 10px;
  }

  .unit-box {
    width: 30px;
    text-align: left;
    margin-left: 5px;
  }
}
</style>