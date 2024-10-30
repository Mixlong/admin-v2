<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          filterable
          style="max-width: 140px"
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
          placeholder="请选择型号"
          @change="getList"
          style="width: 140px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="PCBA SN" prop="pcbaSn">
        <el-input
          v-model="queryParams.pcbaSn"
          placeholder="请输入整机SN"
          clearable
          style="width: 140px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="整机SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入整机SN"
          clearable
          style="width: 140px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="测试环节" prop="processName">
        <el-select
          v-model="queryParams.processName"
          placeholder="请选择测试环节"
          clearable
          style="max-width: 140px"
        >
          <el-option
            v-for="dict in testList"
            :key="dict.dictCode"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="判定结果" prop="result">
        <el-select
          v-model="queryParams.result"
          placeholder="请选择判定结果"
          clearable
          style="max-width: 140px"
        >
          <el-option label="OK" value="OK"></el-option>
          <el-option label="NG" value="NG"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="fr">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
        <el-button
          class="float-right"
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
        >
          导 出
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
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
      <el-table-column label="测试环节" prop="processName" align="center" />
      <el-table-column label="判断结果" prop="result" align="center">
        <span slot-scope="{ row }" :class="stsResultStyle(row.result)">
          {{ row.result }}
        </span>
      </el-table-column>
      <el-table-column label="测试设备SN" prop="equipSn" align="center" />
      <el-table-column label="测试时间" prop="testTime" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.testTime) }}
        </template>
      </el-table-column>
      <el-table-column label="测试详情" align="center">
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
      width="700px"
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
      <el-table :data="stsDetail.detail" bordered height="450">
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
    </el-dialog>
  </div>
</template>

<script>
import { stsTestList, stsTestExport } from "@/api/third/testApi";
import { CategoryMixin } from "@/mixins/common";

export default {
  name: "StsTestResult",
  mixins: [CategoryMixin],
  data() {
    return {
      isStsDetailShow: false,
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        pcbaSn: "",
        sn: "",
        processName: "",
        result: ""
      },
      contentStyle: {
        paddingTop: "20px",
        paddingBottom: "20px"
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
    const { sn, recordId } = this.$route.params;
    this.queryParams.sn = sn;
    this.queryParams.recordId = recordId;

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      stsTestList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 测试详情
    seeDetail(row) {
      this.isStsDetailShow = true;

      this.stsDetail = { ...row, detail: JSON.parse(row.detail) };
    },
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
      this.getList();
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0].computerList;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.sn = "";
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