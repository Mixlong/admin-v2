<template>
  <div class="app-container flex-app-container">
    <IntelligentSearchForm :searchForm="queryParams" :fields="searchFields" @search="handleQuery" @reset="resetQuery"
      :defaultVisibleCount="4" @layout-changed="refreshTableHeight">
      <!-- 品类选择器自定义插槽 -->
      <template #field-categoryName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable filterable style="max-width: 135px"
            @change="changeCategory">
            <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 型号选择器自定义插槽 -->
      <template #field-computerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable filterable @change="getList" style="max-width: 135px">
            <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 工单号选择器自定义插槽 -->
      <template #field-orderCode="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <select-loadMore v-model="searchForm[field.key]" :data="orderData.data" :page="orderData.page"
            :hasMore="orderData.more" dictLabel="orderCode" dictValue="orderCode" :request="getProdPlantList"
            placeholder="请选择">
          </select-loadMore>
        </el-form-item>
      </template>

      <!-- 测试环节选择器自定义插槽 -->
      <template #field-processName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable>
            <el-option v-for="dict in testList" :key="dict.dictCode" :label="dict.dictLabel" :value="dict.dictLabel" />
          </el-select>
        </el-form-item>
      </template>
      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" icon="el-icon-search" @click="handleSurfaceBoard">
          测试详情
        </el-button>
        <el-button type="warning" icon="el-icon-download" @click="handleExport">
          导 出
        </el-button>
      </template>
    </IntelligentSearchForm>

    <el-table v-loading="loading" :data="brandList" height="100%" :cell-class-name="cellClassName" border>
      <el-table-column label="序号" width="58" type="index" align="center" fixed="left">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" width="120" fixed="left" />
      <el-table-column label="型号" prop="computerName" align="center" width="180" fixed="left" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" width="200" />
      <el-table-column label="整机SN" prop="sn" align="center" width="250">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="客户订单号" prop="customerOrderNo" align="center" width="140">
        <span slot-scope="scope" v-NoData="scope.row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column label="迪太订单号" prop="salesOrderNo" align="center" width="140">
        <span slot-scope="scope" v-NoData="scope.row.salesOrderNo"></span>
      </el-table-column>
      <el-table-column label="批次号" prop="batchNo" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.batchNo"></span>
      </el-table-column>
      <el-table-column label="蓝牙地址" prop="mac" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.mac"></span>
      </el-table-column>
      <el-table-column label="生产地点" prop="factory" align="center" width="100">
        <span slot-scope="scope" v-NoData="scope.row.factory"></span>
      </el-table-column>
      <el-table-column label="箱号" prop="boxNo" align="center" width="260">
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" content="点击跳转发货管理" placement="top" :disabled="Is_Empty(row.boxNo)">
            <el-link type="primary" :underline="!Is_Empty(row.boxNo)" :disabled="Is_Empty(row.boxNo)" @click="
              handleNameToPage('Delivery', {
                customerName: row.customerName,
                salesOrderNo: row.salesOrderNo,
                customerOrderNo: row.customerOrderNo,
                categoryName: row.categoryName,
                computerName: row.computerName,
              })
              ">
              {{ Is_Empty(row.boxNo) ? "- - -" : row.boxNo }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="工单号" prop="orderCode" align="center" width="160">
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" content="点击跳转物料追踪" placement="top" :disabled="Is_Empty(row.orderCode)">
            <el-link type="primary" :underline="!Is_Empty(row.orderCode)" :disabled="Is_Empty(row.orderCode)" @click="
              handleNameToPage('TrackRecord', {
                orderCode: row.orderCode,
              })
              ">
              {{ Is_Empty(row.orderCode) ? "- - -" : row.orderCode }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="装箱时间" prop="packingTime" align="center" sortable width="140">
        <span slot-scope="{ row }" v-NoData="parseTime(row.packingTime)"></span>
      </el-table-column>
      <el-table-column label="版本信息" align="center" width="90" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="seeDetail(scope.row)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="物料追溯" align="center" width="90" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="openTrackRecord(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="测试信息" align="center" width="90" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="
            openStsTestResult(row)
            ">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <el-dialog title="版本信息" :visible.sync="isStsDetailShow" center append-to-body top="1vh" width="1300px"
      class=" custom-dialog">
      <el-table :data="stsDetail" bordered height="450">
        <el-table-column label="工序名称" prop="processName" align="center" width="100" />
        <el-table-column label="品类" prop="categoryName" align="center" width="100" />
        <el-table-column label="型号" prop="computerName" align="center" width="140" />
        <el-table-column label="HW版本" prop="hwVersion" align="center" />
        <el-table-column label="UI版本" prop="uiVersion" align="center" />
        <el-table-column label="BOOT版本" prop="bootVersion" align="center" />
        <el-table-column label="APP版本" prop="appVersion" align="center" />
        <!-- <el-table-column label="MAC" prop="mac" align="center" width="130" />
        <el-table-column label="SN" prop="sn" align="center" />
        <el-table-column label="pcbaSn" prop="pcbaSn" align="center" />
        <el-table-column label="生产状态" prop="isRework" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.isRework === 0" type="success">正常生产</el-tag>
            <el-tag v-if="row.isRework === 1" type="danger">返工</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="测试结果" prop="result" align="center" width="80" />
        <el-table-column label="测试时间" prop="testTime" align="center" width="140" sortable>
          <span slot-scope="{ row }" v-NoData="parseTime(row.testTime)"></span>
        </el-table-column> -->
      </el-table>
    </el-dialog>
    <!-- 物料追溯记录弹框 -->
    <MaterialsTrackRecord 
      v-model="materialsTrackRecord" 
      :order-code="queryDialogParams.searchOrderCode"
      :sn="queryDialogParams.sn"
    />
    <el-dialog :visible.sync="stsTestResult" width="90%" append-to-body :title="stsTestResulTtitle" v-if="stsTestResult"
      class="dialog-scroll custom-dialog" :class="{ 'surface-board': stsTestResulTtitle === '通用仪表2' }">
      <StsTestResult :sn="queryDialogParams.sn" :pcbaSn="queryDialogParams.pcbaSn" />
    </el-dialog>
  </div>
</template>

<script>
import {
  recordList,
  recordVersionList,
  stsProductRecordExport,
} from "@/api/third/fileConfig";
import { orderWorkList } from "@/api/third/prodPlant";
import { CategoryMixin } from "@/mixins/common";
import dynamicTableHeightMixin from "@/mixins/dynamicTableHeight";

export default {
  name: "ProductRecord",
  mixins: [CategoryMixin, dynamicTableHeightMixin],
  components: {
    MaterialsTrackRecord: () => import("./components/MaterialsTrackRecord.vue"),
    StsTestResult: () => import("@/views/third/testRecord/index.vue"),
    IntelligentSearchForm: () => import("@/components/IntelligentSearchForm"),

  },
  data() {
    return {
      stsTestResulTtitle: "",
      stsTestResult: false,
      materialsTrackRecord: false,
      isStsDetailShow: false,
      isNoComputerFlag: true,
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      brandList: [],
      testList: [],
      testDetail: [],
      stsDetail: [],
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 40,
        categoryName: "",
        computerName: "",
        sn: "",
        pcbaSn: "",
        processName: "",
        result: "",
        orderCode: "",
        boxNo: "",
        processName: "",
        salesOrderNo: "",
        batchNo: "",
      },
      queryDialogParams: {
        sn: '',
        searchOrderCode: '',
        pcbaSn: ''
      },
      searchFields: [
        { key: 'categoryName', label: '品类', sort: 1, component: 'el-select' },
        { key: 'computerName', label: '型号', sort: 2, component: 'el-select' },
        { key: 'sn', label: '整机SN', sort: 3, placeholder: '请输入整机SN' },
        { key: 'pcbaSn', label: 'PCBA SN', sort: 4, placeholder: '请输入PCBA SN' },
        { key: 'customerOrderNo', label: '客户订单号', sort: 5, placeholder: '请输入客户订单号' },
        { key: 'boxNo', label: '箱号', sort: 6, placeholder: '请输入箱号' },
        { key: 'orderCode', label: '工单号', sort: 7, component: 'select-loadMore' },
        { key: 'salesOrderNo', label: '迪太订单号', sort: 8, placeholder: '请输入迪太订单号' },
        { key: 'batchNo', label: '批次号', sort: 9, placeholder: '请输入批次号' },
        { key: 'processName', label: '测试环节', sort: 10, component: 'el-select' },
      ]
    };
  },
  watch: {
    $route: {
      handler(route) {
        if (route.name !== "ProductRecord") return;
        const { params, query } = route;

        const { type, categoryId, status, model, recordId } = query;

        this.queryParams.type = type ?? "";
        this.queryParams.categoryId = categoryId ?? "";
        this.queryParams.status = status ?? "";
        this.queryParams.computerId = model ?? "";
        this.queryParams.recordId = recordId ?? "";

        const { boxNo } = params;
        this.queryParams.boxNo = boxNo;

        this.getList();
      },
      immediate: true,
    },

  },
  created() {
    this.getDicts("sys_test_session").then((res) => {
      this.testList = res.data;
    });
  },
  methods: {
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
    async seeDetail(row) {
      this.isStsDetailShow = true;
      const result = await recordVersionList({ recordId: row.id, pcbaSn: row.pcbaSn, sn: row.sn });
      this.stsDetail = result.data;
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
        l: 40,
        categoryName: "",
        computerName: "",
        sn: "",
        pcbaSn: "",
        processName: "",
        result: "",
        orderCode: "",
        boxNo: "",
        salesOrderNo: "",
        batchNo: "",
      };
      this.handleQuery();
    },     /**
     * @descr     n: 鼠标移入表格显示小手帕
          ram {*} row
     * @pa     *} column
     * @param {     wIndex
     *      m {*} columnIndex
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
    openTrackRecord(row) {
      if (!row.sn) {
        this.$message.warning("sn为空，无法查看物料追溯记录");
        return;
      }
      
      this.materialsTrackRecord = true;
      this.queryDialogParams.searchOrderCode = row.orderCode;
      this.queryDialogParams.sn = row.sn || '';
    },
    openStsTestResult(row) {
      this.stsTestResult = true;
      this.stsTestResulTtitle = '测试信息'
      this.queryDialogParams.sn = row.sn;
      this.queryDialogParams.pcbaSn = row.pcbaSn;
    },
    handleSurfaceBoard() {
      this.stsTestResult = true;
      this.stsTestResulTtitle = '通用仪表2',
        this.queryDialogParams.sn = '';
      this.queryDialogParams.pcbaSn = '';
    }
  },
};
</script>
<style lang="scss" scoped>
.custom-dialog {
  ::v-deep {

    .el-form,
    .pagination-container {
      display: none;
    }

    .el-dialog__header {
      text-align: center;
      font-weight: 700;
    }

    .el-dialog__body {
      max-height: 95vh;
      overflow-y: auto;
      padding-top: 10px;

      .app-container {
        margin: 0;
        padding: 0;
        height: auto;
      }
    }


  }

  &.surface-board {
    ::v-deep {

      .el-form,
      .pagination-container {
        display: block !important;
      }
    }
  }
}
</style>