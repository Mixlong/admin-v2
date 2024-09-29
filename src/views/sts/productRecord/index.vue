<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          filterable
          style="max-width: 160px"
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
          style="max-width: 160px"
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
          placeholder="请输入整机SN"
          clearable
          style="max-width: 160px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          v-model="queryParams.customerOrderNo"
          placeholder="请输入客户订单号"
          clearable
          style="max-width: 160px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="箱号" prop="boxNo">
        <el-input
          v-model="queryParams.boxNo"
          placeholder="请输入箱号"
          clearable
          style="max-width: 160px"
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
          placeholder="请选择工单号"
          style="width: 100%"
        >
        </select-loadMore>
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
      <el-table-column
        label="客户订单号"
        prop="customerOrderNo"
        align="center"
      />
      <el-table-column label="迪太订单号" prop="salesOrderNo" align="center" />
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
      <el-table-column label="装箱时间" prop="packingTime" align="center">
        <span slot-scope="{ row }" v-NoData="parseTime(row.packingTime)"></span>
      </el-table-column>
      <el-table-column label="气密性测试" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="seeGasDetail(scope.row.sn)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="版本信息" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row.id)"
            >查看</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="配件信息" align="center" width="100">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click="$router.push(`/www/PartInfoView/parts?sn=${row.sn}`)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="测试信息" align="center" width="100">
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
      width="1000px"
      center
      append-to-body
      top="1vh"
    >
      <el-table :data="gasDetail" bordered height="450">
        <el-table-column label="迪太SN" prop="dtSn" align="center" />
        <el-table-column
          label="气压校准值"
          prop="calibrationPa"
          align="center"
        />
        <el-table-column
          label="气压校准"
          prop="standardPa"
          align="center"
          width="80"
        />
        <el-table-column
          label="气压波动范围"
          prop="volatilityRange"
          align="center"
          width="110"
        />
        <el-table-column
          label="充气时间"
          prop="inflateTime"
          align="center"
          width="80"
        >
          <span
            slot-scope="{ row }"
            v-NoData="formattedTime(row.inflateTime)"
          />
        </el-table-column>
        <el-table-column
          label="平衡时间"
          prop="balanceTime"
          align="center"
          width="80"
        >
          <span
            slot-scope="{ row }"
            v-NoData="formattedTime(row.balanceTime)"
          />
        </el-table-column>
        <el-table-column
          label="测试时间"
          prop="testTime"
          align="center"
          width="80"
        >
          <span slot-scope="{ row }" v-NoData="formattedTime(row.testTime)" />
        </el-table-column>
        <el-table-column label="测试时间戳" prop="time" align="center" sortable>
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
  categoryComputerDict,
  recordList,
  recordGasList,
  recordVersionList,
} from "@/api/third/fileConfig";
import { orderWorkList } from "@/api/third/prodPlant";

export default {
  name: "ProductRecord",
  data() {
    return {
      isStsDetailShow: false,
      isGasDetailShow: false,
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
      stsDetail: [],
      gasDetail: [],
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
      },
    };
  },
  created() {
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });

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
    });
  },
  activated() {
    this.handleSearchPage();
  },
  methods: {
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
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
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
  },
};
</script>
