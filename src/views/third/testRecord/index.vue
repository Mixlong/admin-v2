<template>
  <div class="app-container">
    <!-- 智能搜索表单 -->
    <IntelligentSearchForm
      :searchForm="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      :defaultVisibleCount="5"
      @reset="resetQuery"
      @field-change="handleFieldChange">
      
      <!-- 自定义品类字段 -->
      <template #field-categoryName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable filterable style="width: 200px"
            @change="changeCategory">
            <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义型号字段 -->
      <template #field-computerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable filterable @change="getList" style="width: 200px">
            <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义测试环节字段 -->
      <template #field-processName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable style="width: 200px">
            <el-option v-for="dict in testList" :key="dict.dictCode" :label="dict.dictLabel" :value="dict.dictLabel" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义测试时间字段 -->
      <template #field-testTimeRange="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker
            v-model="testTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px"
            @change="handleTestTimeChange">
          </el-date-picker>
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="warning" icon="el-icon-download" @click="handleExport">
          导出
        </el-button>
      </template>
    </IntelligentSearchForm>

    <el-table v-loading="loading" :data="brandList" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center" fixed="left">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" width="120" fixed="left" />
      <el-table-column label="型号" prop="computerName" align="center" width="140" fixed="left" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" width="190" />
      <el-table-column label="整机SN" prop="sn" align="center" width="190">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="箱号" prop="boxNo" align="center" width="190">
        <span slot-scope="scope" v-NoData="scope.row.boxNo"></span>
      </el-table-column>
      <el-table-column label="销售订单号" prop="salesOrderNo" align="center" width="150">
        <span slot-scope="scope" v-NoData="scope.row.salesOrderNo"></span>
      </el-table-column>
      <el-table-column label="工单号" prop="orderCode" align="center" width="150">
        <span slot-scope="scope" v-NoData="scope.row.orderCode"></span>
      </el-table-column>
      <el-table-column label="测试环节" prop="processName" align="center" width="100" />
      <el-table-column label="判断结果" prop="result" align="center" width="100">
        <span slot-scope="{ row }" :class="stsResultStyle(row.result)">
          {{ row.result }}
        </span>
      </el-table-column>
      <el-table-column label="测试设备SN" prop="cpuId" align="center" width="120">
        <span slot-scope="{ row }" v-NoData="row.cpuId"></span>
      </el-table-column>
      <el-table-column label="测试时长" prop="time" align="center" width="100">
        <template slot-scope="{ row }">
          {{ formattedTime({ time: row.time, timeType: "ms" }) }}
        </template>
      </el-table-column>
      <el-table-column label="测试时间" prop="testTime" align="center" width="150" sortable>
        <template slot-scope="{ row }">
          {{ parseTime(row.testTime) }}
        </template>
      </el-table-column>
      <el-table-column label="测试详情" align="center" width="100" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <el-dialog title="测试详情" :visible.sync="isStsDetailShow" width="800px" center append-to-body top="1vh">
      <el-descriptions direction="vertical" :column="2" border>
        <el-descriptions-item label="测试环节" label-class-name="text-center" content-class-name="text-center font20"
          :contentStyle="contentStyle">
          <span class="text-success">
            {{ stsDetail.processName || "--" }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="测试结果" label-class-name="text-center" :content-class-name="['text-center font20']"
          :contentStyle="contentStyle">
          <span :class="stsResultStyle(stsDetail.result)">
            {{ stsDetail.result || "--" }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <p class="margin-top-sm">测试过程</p>

      <el-table v-show="stsDetail.processName !== '防水'" :data="stsDetail.detail" bordered height="450">
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="测试项" prop="typeName" width="120" align="center" />
        <el-table-column label="测试结果" prop="testResult" width="100" align="center" />
        <el-table-column label="期望值" prop="desiredValue" align="center" />
        <el-table-column label="实测值" prop="measureValue" align="center" />
      </el-table>

      <el-table v-show="stsDetail.processName === '防水'" :data="stsDetail.detail" border default-expand-all>
        <el-table-column type="expand">
          <div slot-scope="{ row }">
            <template v-if="row.tightnessJson">
              <p>
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
                    <div class="flex align-center justify-between" v-for="(item, index) in testTimeData" :key="index">
                      <el-tag color="#00aadc" effect="dark" size="medium"
                        style="border: none; display: flex; align-items: center">
                        {{ item.label }}
                      </el-tag>
                      <el-input v-model="item.value" readonly style="width: 100px" />
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="10">
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试压力参数</span>
                    </div>
                    <div class="flex align-center justify-between" v-for="(item, index) in testPressureData"
                      :key="index">
                      <el-tag color="#00aadc" effect="dark" size="medium"
                        style="border: none; display: flex; align-items: center">
                        {{ item.label }}
                      </el-tag>
                      <div class="flex align-center space-between">
                        <el-input v-model="item.value" readonly style="width: 100px" />
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
                    <div class="flex align-center justify-between" v-for="(item, index) in testFrongData" :key="index">
                      <el-tag type="warning" effect="dark" size="medium" style="width: 70px; text-align: center">
                        {{ item.label }}
                      </el-tag>
                      <el-input v-model="item.value" readonly style="width: 100px" />
                    </div>
                  </el-card>
                  <el-card shadow="nerver" class="el-card-box">
                    <div slot="header">
                      <span>测试后外部输出状态(S)</span>
                    </div>
                    <div class="flex align-center justify-between" v-for="(item, index) in testEndData" :key="index">
                      <el-tag type="success" effect="dark" size="medium" style="width: 70px; text-align: center">
                        {{ item.label }}
                      </el-tag>
                      <el-input v-model="item.value" readonly style="width: 100px" />
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
        <el-table-column label="测试压力(KPa)" prop="testPressure" align="center" />
        <el-table-column label="小泄漏(KPa)" prop="leakValue" align="center" />
        <el-table-column label="耗时" prop="consumeTime" align="center" sortable>
          <span slot-scope="{ row }" v-NoData="formattedTime({ time: row.consumeTime, timeType: 'ms' })" />
        </el-table-column>
        <el-table-column label="测试时间" prop="time" align="center" sortable width="140px">
          <span slot-scope="{ row }" v-NoData="parseTime(row.time)" />
        </el-table-column>
        <el-table-column label="测试结果" prop="testResult" align="center" width="100">
          <el-tag :type="gasTestResultTag[row.testResult]" slot-scope="{ row }">
            {{ gasTestResultData[row.testResult] }}
          </el-tag>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { stsTestList, stsTestExport } from "@/api/third/testApi";
import { CategoryMixin } from "@/mixins/common";
import IntelligentSearchForm from "@/components/IntelligentSearchForm";

export default {
  name: "StsTestResult",
  components: {
    IntelligentSearchForm
  },
  mixins: [CategoryMixin],
  props: {
    sn: {
      type: String,
      default: "",
    },
    pcbaSn: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isStsDetailShow: false,
      isNoComputerFlag: true,
      // 防水测试标准
      waterproofingTestStandard: "",
      // 备注
      gasCopnfigRemark: "",
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dictList: [],
      brandList: [],
      testList: [],
      computerOptions: [],
      testDetail: [],
      stsDetail: {},
      gasDetail: [],
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
      // 时间范围
      testTimeRange: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 40,
        categoryName: "",
        computerName: "",
        pcbaSn: "",
        sn: "",
        processName: "",
        result: "",
        boxNo: "",
        salesOrderNo: "",
        orderCode: "",
        cpuId: "",
        startTime: "",
        endTime: "",
        recordId: "",
      },
      // 搜索字段配置
      searchFields: [
        {
          key: 'categoryName',
          label: '品类',
          component: 'custom',
          sort: 1
        },
        {
          key: 'computerName',
          label: '型号',
          component: 'custom',
          sort: 2
        },
        {
          key: 'pcbaSn',
          label: 'PCBA SN',
          component: 'el-input',
          placeholder: '请输入PCBA SN',
          sort: 3
        },
        {
          key: 'sn',
          label: '整机SN',
          component: 'el-input',
          placeholder: '请输入整机SN',
          sort: 4
        },
        {
          key: 'processName',
          label: '测试环节',
          component: 'custom',
          sort: 5
        },
        {
          key: 'result',
          label: '判定结果',
          component: 'el-select',
          type: 'select',
          props: {
            options: [
              { label: 'OK', value: 'OK' },
              { label: 'NG', value: 'NG' }
            ]
          },
          placeholder: '请选择判定结果',
          sort: 6
        },
        {
          key: 'boxNo',
          label: '箱号',
          component: 'el-input',
          placeholder: '请输入箱号',
          sort: 7
        },
        {
          key: 'salesOrderNo',
          label: '销售订单号',
          component: 'el-input',
          placeholder: '请输入销售订单号',
          sort: 8
        },
        {
          key: 'orderCode',
          label: '工单号',
          component: 'el-input',
          placeholder: '请输入工单号',
          sort: 9
        },
        {
          key: 'cpuId',
          label: '测试设备SN',
          component: 'el-input',
          placeholder: '请输入测试设备SN',
          sort: 10
        },
      ],
      contentStyle: {
        paddingTop: "20px",
        paddingBottom: "20px",
      },
    };
  },
  computed: {
    stsResultStyle() {
      return (stsResult) => {
        switch (stsResult) {
          case "OK":
            return "text-navy";
          case "NG":
            return "text-red";
        }
      };
    },
  },
  created() {
    // 处理路由参数
    if (this.$route.name === "StsTestResult") {
      const { params } = this.$route;
      const { sn, recordId } = params;
      
      // 只设置 queryParams 中已定义的字段
      if (sn) this.queryParams.sn = sn;
      if (recordId) this.queryParams.recordId = recordId;
    } else {
      // 从 props 中获取参数
      if (this.sn) this.queryParams.sn = this.sn;
      if (this.pcbaSn) this.queryParams.pcbaSn = this.pcbaSn;
    }
    
    this.getCategoryData();
    this.getList();
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      stsTestList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
      }).finally(() => {
        this.loading = false;
      });
    },
    // 测试详情
    seeDetail(row) {
      this.isStsDetailShow = true;

      this.stsDetail = { ...row, detail: JSON.parse(row.detail) };

      if (this.stsDetail.processName === "防水") {
        this.handleExpandChange(this.stsDetail.detail);
        this.stsDetail = { ...row, detail: [JSON.parse(row.detail)] };
      }
    },
    handleExpandChange(row) {
      if (row.tightnessJson) {
        this.setGasConfigParams(row.tightnessJson);
      }
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
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
      this.getList();
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0].computerList;
    },
    // 字段变化处理
    handleFieldChange(field, value) {
      console.log('字段变化:', field, value);
    },
    // 处理测试时间范围变化
    handleTestTimeChange(timeRange) {
      if (timeRange && timeRange.length === 2) {
        this.queryParams.startTime = timeRange[0];
        this.queryParams.endTime = timeRange[1];
      } else {
        this.queryParams.startTime = "";
        this.queryParams.endTime = "";
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.queryParams.recordId = "";

      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.testTimeRange = [];
      this.queryParams = {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        pcbaSn: "",
        sn: "",
        processName: "",
        result: "",
        boxNo: "",
        cpuId: "",
        startTime: "",
        endTime: "",
        recordId: "",
      };

      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出测试记录数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return stsTestExport(queryParams);
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