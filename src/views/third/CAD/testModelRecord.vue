<template>
  <div class="app-container">
    <IntelligentSearchForm
      :searchForm="queryParams"
      :fields="searchFields"
      :defaultVisibleCount="5"
      @search="handleQuery"
      @reset="resetQuery"
    >
      <template #field-categoryName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            clearable
            filterable
            :style="{ width: getSearchFieldWidth(searchForm) }"
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
      </template>

      <template #field-computerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            clearable
            filterable
            @change="getList"
            :style="{ width: getSearchFieldWidth(searchForm) }"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
      </template>

      <template #field-mac="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <mac-input v-model="searchForm[field.key]" :style="{ width: getSearchFieldWidth(searchForm) }"></mac-input>
        </el-form-item>
      </template>

      <template #field-processName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            clearable
            :style="{ width: getSearchFieldWidth(searchForm) }"
          >
            <el-option
              v-for="dict in testList"
              :key="dict.dictCode"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
      </template>

      <template #add-search-buttons>
        <el-button icon="el-icon-back" size="mini" @click="handleGoBack">返回</el-button>
      </template>

    </IntelligentSearchForm>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column
        label="序号"
        width="58"
        type="index"
        align="center"
        fixed="left"
      >
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        width="120"
        fixed="left"
      />
      <el-table-column
        label="型号"
        prop="computerName"
        align="center"
        width="140"
        fixed="left"
      />
      <el-table-column
        label="PCBA SN"
        prop="pcbaSn"
        align="center"
        width="140"
      />
      <el-table-column label="整机SN" prop="sn" align="center" width="140">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="箱号" prop="boxNo" align="center" width="140">
        <span slot-scope="scope" v-NoData="scope.row.boxNo"></span>
      </el-table-column>
      <el-table-column
        label="正产/返工"
        prop="isRework"
        align="center"
        width="100"
      >
        <template v-slot="{ row }">
          <el-tag v-if="row.isRework === 0" type="success">正常生产</el-tag>
          <el-tag v-if="row.isRework === 1" type="danger">返工</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="MAC" prop="mac" align="center" width="160">
        <span slot-scope="scope" v-NoData="scope.row.mac"></span>
      </el-table-column>
      <el-table-column
        label="APP版本"
        prop="appVersion"
        align="center"
        width="230"
      >
        <span slot-scope="scope" v-NoData="scope.row.appVersion"></span>
      </el-table-column>
      <el-table-column
        label="BOOT版本"
        prop="bootVersion"
        align="center"
        width="200"
      >
        <span slot-scope="scope" v-NoData="scope.row.bootVersion"></span>
      </el-table-column>
      <el-table-column
        label="hw版本号"
        prop="hwVersion"
        align="center"
        width="200"
      >
        <span slot-scope="scope" v-NoData="scope.row.hwVersion"></span>
      </el-table-column>
      <el-table-column
        label="测试环节"
        prop="processName"
        align="center"
        width="90"
      />
      <el-table-column label="判断结果" prop="result" align="center" width="90">
        <span slot-scope="{ row }" :class="stsResultStyle(row.result)">
          {{ row.result }}
        </span>
      </el-table-column>
      <el-table-column
        label="测试设备SN"
        prop="cpuId"
        align="center"
        width="100"
        show-overflow-tooltip
      >
        <span slot-scope="{ row }" v-NoData="row.cpuId"></span>
      </el-table-column>
      <el-table-column label="测试时长" prop="time" align="center" width="90">
        <template slot-scope="{ row }">
          {{ formattedTime({ time: row.time, timeType: "ms" }) }}
        </template>
      </el-table-column>
      <el-table-column
        label="测试时间"
        prop="testTime"
        align="center"
        sortable
        width="140"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.testTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="测试详情"
        align="center"
        width="90"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row)">查看</el-button>
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

    <el-dialog
      title="测试详情"
      :visible.sync="isStsDetailShow"
      width="800px"
      center
      append-to-body
      top="1vh"
    >
      <el-descriptions direction="vertical" :column="2" border>
        <el-descriptions-item
          label="测试环节"
          label-class-name="text-center"
          content-class-name="text-center font20"
          :contentStyle="contentStyle"
        >
          <span class="text-success">
            {{ stsDetail.processName || "--" }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item
          label="测试结果"
          label-class-name="text-center"
          :content-class-name="['text-center font20']"
          :contentStyle="contentStyle"
        >
          <span :class="stsResultStyle(stsDetail.result)">
            {{ stsDetail.result || "--" }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <p class="margin-top-sm">测试过程</p>

      <el-table
        v-show="stsDetail.processName !== '防水'"
        :data="stsDetail.detail"
        bordered
        height="450"
      >
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="测试项"
          prop="typeName"
          width="120"
          align="center"
        />
        <el-table-column
          label="测试结果"
          prop="testResult"
          width="100"
          align="center"
        />
        <el-table-column label="期望值" prop="desiredValue" align="center" />
        <el-table-column label="实测值" prop="measureValue" align="center" />
      </el-table>

      <el-table
        v-show="stsDetail.processName === '防水'"
        :data="stsDetail.detail"
        border
        default-expand-all
      >
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
                        style="width: 100px"
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
                        <el-input
                          v-model="item.value"
                          readonly
                          style="width: 100px"
                        />
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
                        style="width: 100px"
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
                        style="width: 100px"
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
        <el-table-column
          label="测试时间"
          prop="time"
          align="center"
          sortable
          width="140px"
        >
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
  </div>
</template>
  
<script>
import { testModelRecordList } from "@/api/third/testApi";
import { CategoryMixin } from "@/mixins/common";
import IntelligentSearchForm from "@/components/IntelligentSearchForm";

export default {
  name: "TestModelRecord",
  components: {
    IntelligentSearchForm,
  },
  mixins: [CategoryMixin],
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        pcbaSn: "",
        sn: "",
        mac: "",
        processName: "",
        result: "",
      },
      searchFields: [
        { key: "categoryName", label: "品类", component: "custom", sort: 1 },
        { key: "computerName", label: "型号", component: "custom", sort: 2 },
        { key: "pcbaSn", label: "PCBA SN", component: "el-input", placeholder: "请输入", sort: 3 },
        { key: "sn", label: "整机SN", component: "el-input", placeholder: "请输入", sort: 4 },
        { key: "mac", label: "MAC", component: "custom", sort: 5 },
        { key: "processName", label: "测试环节", component: "custom", sort: 6 },
        {
          key: "result",
          label: "判定结果",
          component: "el-select",
          sort: 7,
          props: {
            options: [
              { label: "OK", value: "OK" },
              { label: "NG", value: "NG" },
            ],
          },
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
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      testModelRecordList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
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
    getSearchFieldWidth(formModel) {
      return formModel === this.queryParams ? "140px" : "100%";
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        pcbaSn: "",
        sn: "",
        mac: "",
        processName: "",
        result: "",
      };
      this.handleQuery();
    },
    handleGoBack() {
      this.$router.go(-1);
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
