<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
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
          placeholder="请选择型号"
          @change="getList"
          style="width: 160px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入SN"
          clearable
          style="max-width: 130px"
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
            :label="dict.dictValue"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="判定结果" prop="result">
        <el-select
          v-model="queryParams.result"
          placeholder="请选择判定结果 "
          clearable
          style="max-width: 140px"
        >
          <el-option label="OK" value="OK"></el-option>
          <el-option label="NG" value="NG"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
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
      <el-table-column label="整机SN" prop="sn" align="center" />
      <el-table-column label="测试环节" prop="sn" align="center" />
      <el-table-column label="判定结果" prop="sn" align="center" />
      <el-table-column label="测试时间" prop="sn" align="center" />
      <el-table-column label="测试设备SN" prop="pcbaSn" align="center" />
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
      :visible.sync="ditailShow"
      width="540px"
      center
      append-to-body
      top="1vh"
    >
      <!-- <div class="test_box flex">
        <div class="flex flex-sub flex-direction align-center border">
          <span>测试环节</span>
          <span>FCT</span>
        </div>
        <div class="flex flex-sub flex-direction align-center border">
          <span>测试结果</span>
          <span>OK</span>
        </div>
      </div> -->
      <el-descriptions direction="vertical" :column="2" border>
        <el-descriptions-item
          label="测试环节"
          label-class-name="text-center"
          content-class-name="text-center font20"
          :contentStyle="contentStyle"
        >
          FCT
        </el-descriptions-item>
        <el-descriptions-item
          label="测试结果"
          label-class-name="text-center"
          :content-class-name="['text-center font20']"
          :contentStyle="contentStyle"
        >
          OK
        </el-descriptions-item>
      </el-descriptions>
      <p class="margin-top-sm">测试过程</p>
      <el-table :data="testDetail" bordered>
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="测试项" prop="appVersion" />
        <el-table-column label="测试值" prop="uiVersion" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { categoryComputerDict, testList } from "@/api/third/fileConfig";

export default {
  name: "BikeFileConfig",
  data() {
    return {
      ditailShow: false,
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        processName: "",
        result: "",
      },
      contentStyle: {
        paddingTop: '20px',
        paddingBottom: '20px'
      }
    };
  },
  created() {
    const { recordId } = this.$route.query;
    if (recordId) {
      this.queryParams.recordId = recordId;
    }
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerId = this.$route.query.model;
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
      this.getList();
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      testList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 测试详情
    seeDetail(row) {
      console.log(row);
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
      this.queryParams.recordId = "";
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>