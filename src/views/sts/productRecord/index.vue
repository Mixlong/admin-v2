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
        <el-button v-hasPermi="['sts:productRecord:viewBox']" type="success" icon="el-icon-box" @click="handleViewBoxList">
          查看箱子
        </el-button>
        <el-button v-hasPermi="['sts:productRecord:packingRecord']" type="danger" icon="el-icon-delete" @click="handleDeletePackingRecords">
          装箱记录
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
              handleNameToPage('Parts', {
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
    <MaterialsTrackRecord v-model="materialsTrackRecord" :order-code="queryDialogParams.searchOrderCode"
      :sn="queryDialogParams.sn" />
    <el-dialog :visible.sync="stsTestResult" width="90%" append-to-body :title="stsTestResulTtitle" v-if="stsTestResult"
      class="dialog-scroll custom-dialog" :class="{ 'surface-board': stsTestResulTtitle === '通用仪表2' }">
      <StsTestResult :sn="queryDialogParams.sn" :pcbaSn="queryDialogParams.pcbaSn" />
    </el-dialog>

    <!-- 箱子列表对话框 -->
    <el-dialog title="箱子列表" :visible.sync="boxListDialogVisible" width="1280px" top="0vh" :close-on-click-modal="false">
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="boxListQueryParams" size="mini">
        <el-form-item label="排产单号">
          <el-input v-model.trim="boxListQueryParams.schedulingNo" clearable placeholder="请输入排产单号" style="width: 140px" />
        </el-form-item>
        <el-form-item label="箱号">
          <el-input v-model.trim="boxListQueryParams.boxNo" clearable placeholder="请输入箱号" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleBoxListSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleBoxListReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table border v-loading="boxListLoading" :data="boxListData" height="450">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template slot-scope="scope">
            {{ (boxListQueryParams.p - 1) * boxListQueryParams.l + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="设备名称" align="center" prop="equipName" width="150" />
        <el-table-column label="箱号" align="center" prop="boxNo" width="250" />
        <el-table-column label="箱子序号" align="center" prop="no" />
        <el-table-column label="应装数量" align="center" prop="num" />
        <el-table-column label="实装数量" align="center" prop="actualNum">
          <template slot-scope="{row}">
            <span :class="{'text-red': row.actualNum < row.num}">{{ row.actualNum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="箱子重量" align="center" prop="weight" width="110" />
        <el-table-column label="是否尾箱" align="center" prop="isEnd" width="100">
          <template slot-scope="{ row }">
            <el-tag v-if="row.isEnd === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="150">
          <template slot-scope="{ row }">
            <span>{{ parseTime(row.createTime, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="handleViewPackingRecords(row)">
              查看
            </el-button>
            <el-button 
              class="text-red" 
              type="text" 
              @click="handleDeleteBoxItem(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="boxListTotal > 0" :total="boxListTotal" :page.sync="boxListQueryParams.p"
        :limit.sync="boxListQueryParams.l" @pagination="getBoxListData" />
    </el-dialog>

    <!-- 装箱记录查看对话框 -->
    <el-dialog title="装箱记录详情" :visible.sync="packingRecordsDialogVisible" width="80%" top="0vh" class="dialog-scroll" :close-on-click-modal="false" @close="handlePackingRecordsDialogClose">
      <el-table 
        ref="packingRecordsTable"
        v-loading="packingRecordsLoading" 
        :data="packingRecordsList" 
        height="500" 
        border
        @selection-change="handlePackingRecordsSelectionChange"
        @row-click="handlePackingRecordRowClick">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="箱号" align="center" prop="boxNo" min-width="200" />
        <el-table-column label="批次号" align="center" prop="batchNo" width="150" />
        <el-table-column label="品类" align="center" prop="categoryName" width="100" />
        <el-table-column label="型号" align="center" prop="computerName" min-width="150" />
        <el-table-column label="整机SN" align="center" prop="sn" min-width="200" />
        <el-table-column label="PCBA SN" align="center" prop="pcbaSn" min-width="200" />
        <el-table-column label="蓝牙地址" align="center" prop="mac" min-width="150" />
        <el-table-column label="客户订单号" align="center" prop="customerOrderNo" min-width="150" />
        <el-table-column label="迪太订单号" align="center" prop="salesOrderNo" min-width="150" />
        <el-table-column label="工单号" align="center" prop="orderCode" min-width="150" />
        <el-table-column label="生产工厂" align="center" prop="factory" width="100" />
        <el-table-column label="装箱时间" align="center" prop="packingTime" width="150">
          <template slot-scope="{ row }">
            <span>{{ parseTime(row.packingTime, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="packingRecordsTotal > 0" :total="packingRecordsTotal" :page.sync="packingRecordsQueryParams.p"
        :limit.sync="packingRecordsQueryParams.l" @pagination="getPackingRecordsData" />

      <div slot="footer" class="dialog-footer">
        <el-button 
          type="danger" 
          :disabled="selectedPackingRecords.length === 0"
          @click="handleBatchCancelPacking">
          批量取消装箱 ({{ selectedPackingRecords.length }})
        </el-button>
        <el-button @click="packingRecordsDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 删除箱子（全部装箱记录）对话框 -->
    <el-dialog title="装箱记录" :visible.sync="deletePackingDialogVisible" width="80%" top="0vh" class="dialog-scroll" :close-on-click-modal="false" @close="handleDeletePackingDialogClose">
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="deletePackingQueryParams" size="mini">
        <el-form-item label="箱号">
          <el-input v-model.trim="deletePackingQueryParams.boxNo" clearable placeholder="请输入箱号" style="width: 180px" />
        </el-form-item>
        <el-form-item label="整机SN">
          <el-input v-model.trim="deletePackingQueryParams.sn" clearable placeholder="请输入整机SN" style="width: 180px" />
        </el-form-item>
        <el-form-item label="PCBA SN">
          <el-input v-model.trim="deletePackingQueryParams.pcbaSn" clearable placeholder="请输入PCBA SN" style="width: 180px" />
        </el-form-item>
        <el-form-item label="装箱时间">
          <el-date-picker
            v-model="deletePackingDateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleDeletePackingDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleDeletePackingSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleDeletePackingReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        ref="deletePackingTable"
        v-loading="deletePackingLoading" 
        :data="deletePackingList" 
        height="450" 
        border
        @selection-change="handleDeletePackingSelectionChange"
        @row-click="handleDeletePackingRowClick">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="箱号" align="center" prop="boxNo" min-width="200" />
        <el-table-column label="批次号" align="center" prop="batchNo" width="150" />
        <el-table-column label="品类" align="center" prop="categoryName" width="100" />
        <el-table-column label="型号" align="center" prop="computerName" min-width="150" />
        <el-table-column label="整机SN" align="center" prop="sn" min-width="200" />
        <el-table-column label="PCBA SN" align="center" prop="pcbaSn" min-width="200" />
        <el-table-column label="蓝牙地址" align="center" prop="mac" min-width="150" />
        <el-table-column label="客户订单号" align="center" prop="customerOrderNo" min-width="150" />
        <el-table-column label="迪太订单号" align="center" prop="salesOrderNo" min-width="150" />
        <el-table-column label="工单号" align="center" prop="orderCode" min-width="150" />
        <el-table-column label="生产工厂" align="center" prop="factory" width="100" />
        <el-table-column label="装箱时间" align="center" prop="packingTime" width="150">
          <template slot-scope="{ row }">
            <span>{{ parseTime(row.packingTime, "{y}-{m}-{d} {h}:{i}") }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="deletePackingTotal > 0" :total="deletePackingTotal" :page.sync="deletePackingQueryParams.p"
        :limit.sync="deletePackingQueryParams.l" @pagination="getDeletePackingData" />

      <div slot="footer" class="dialog-footer">
        <el-button 
          type="danger" 
          :disabled="selectedDeletePackingRecords.length === 0"
          @click="handleDeletePackingBatchCancel">
          批量取消装箱 ({{ selectedDeletePackingRecords.length }})
        </el-button>
        <el-button @click="deletePackingDialogVisible = false">关 闭</el-button>
      </div>
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
import { getBoxPageList, deleteBox, getPackingRecords, cancelPacking } from "@/api/www/planSchedule";
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
        categoryId: "",
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
        { key: 'processName', label: '测试环节', sort: 10, component: 'el-select' },
      ],
      // 箱子列表对话框
      boxListDialogVisible: false,
      boxListLoading: false,
      boxListData: [],
      boxListTotal: 0,
      boxListQueryParams: {
        p: 1,
        l: 10,
        schedulingNo: "",
        boxNo: ""
      },
      // 装箱记录对话框
      packingRecordsDialogVisible: false,
      packingRecordsLoading: false,
      packingRecordsList: [],
      packingRecordsTotal: 0,
      packingRecordsQueryParams: {
        p: 1,
        l: 10,
        boxNo: ""
      },
      currentBoxNo: "",
      selectedPackingRecords: [],
      hasCancelledPacking: false,
      // 删除箱子（全部装箱记录）对话框
      deletePackingDialogVisible: false,
      deletePackingLoading: false,
      deletePackingList: [],
      deletePackingTotal: 0,
      deletePackingQueryParams: {
        p: 1,
        l: 10,
        boxNo: "",
        sn: "",
        pcbaSn: "",
        startTime: "",
        endTime: ""
      },
      selectedDeletePackingRecords: [],
      deletePackingDateRange: []
    };
  },
  watch: {
    $route: {
      handler(route) {
        if (route.name !== "ProductRecord") return;
        const { params, query } = route;

        const { type, categoryId, status, model, recordId, sn,salesOrderNo,categoryName,computerName } = query;

        this.queryParams.type = type ?? "";
        this.queryParams.categoryId = categoryId ?? "";
        this.queryParams.status = status ?? "";
        this.queryParams.computerId = model ?? "";
        this.queryParams.recordId = recordId ?? "";
        this.queryParams.sn = sn ?? "";
        this.queryParams.salesOrderNo = salesOrderNo ?? "";
        this.queryParams.categoryName = categoryName;
        this.queryParams.computerName = computerName;
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
    },

    // ==================== 箱子列表功能相关方法 ====================

    /** 打开箱子列表对话框 */
    handleViewBoxList() {
      this.boxListDialogVisible = true;
      this.boxListQueryParams.p = 1;
      this.getBoxListData();
    },

    /** 获取箱子列表数据 */
    getBoxListData() {
      this.boxListLoading = true;
      getBoxPageList(this.boxListQueryParams)
        .then((res) => {
          if (res.code === 200) {
            this.boxListData = res.data.list || [];
            this.boxListTotal = res.data.total || 0;
          } else {
            this.$message.error(res.msg || '获取箱子列表失败');
          }
        })
        .catch((error) => {
          console.error('获取箱子列表失败:', error);
          this.$message.error('获取箱子列表失败');
        })
        .finally(() => {
          this.boxListLoading = false;
        });
    },

    /** 箱子列表搜索 */
    handleBoxListSearch() {
      this.boxListQueryParams.p = 1;
      this.getBoxListData();
    },

    /** 箱子列表重置 */
    handleBoxListReset() {
      this.boxListQueryParams = {
        p: 1,
        l: 10,
        schedulingNo: "",
        boxNo: ""
      };
      this.getBoxListData();
    },

    /** 判断是否可以删除箱子（创建时间小于15天） */
    canDeleteBox(createTime) {
      if (!createTime) return false;
      
      const now = new Date().getTime();
      let create;
      
      if (typeof createTime === 'number') {
        create = createTime;
      } else {
        create = new Date(createTime).getTime();
      }
      
      if (isNaN(create)) return false;
      
      const diffDays = (now - create) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 15;
    },

    /** 删除箱子 */
    handleDeleteBoxItem(row) {
      this.$confirm(`确定要删除箱子 "${row.boxNo}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return deleteBox(row.id);
        })
        .then((res) => {
          if (res.code === 200) {
            this.$message.success('删除箱子成功');
            this.getBoxListData();
          }
        })
        .catch((error) => {
          if (error !== 'cancel') {
            console.error('删除箱子失败:', error);
          }
        });
    },

    // ==================== 装箱记录功能相关方法 ====================

    /** 查看装箱记录 */
    handleViewPackingRecords(row) {
      this.currentBoxNo = row.boxNo;
      this.packingRecordsQueryParams.boxNo = row.boxNo;
      this.packingRecordsQueryParams.p = 1;
      this.packingRecordsDialogVisible = true;
      this.getPackingRecordsData();
    },

    /** 获取装箱记录数据 */
    getPackingRecordsData() {
      this.packingRecordsLoading = true;
      getPackingRecords(this.packingRecordsQueryParams)
        .then((res) => {
          if (res.code === 200) {
            const { list, total, pageNum, pageSize } = res.data;
            this.packingRecordsList = list || [];
            this.packingRecordsTotal = total || 0;
            this.packingRecordsQueryParams.p = pageNum || 1;
            this.packingRecordsQueryParams.l = pageSize || 10;
          } else {
            this.$message.error(res.msg || '获取装箱记录失败');
          }
        })
        .catch((error) => {
          console.error('获取装箱记录失败:', error);
          this.$message.error('获取装箱记录失败');
        })
        .finally(() => {
          this.packingRecordsLoading = false;
        });
    },

    /** 装箱记录选择变化 */
    handlePackingRecordsSelectionChange(selection) {
      this.selectedPackingRecords = selection;
    },

    /** 点击行选中/取消选中 */
    handlePackingRecordRowClick(row) {
      this.$refs.packingRecordsTable.toggleRowSelection(row);
    },

    /** 批量取消装箱 */
    handleBatchCancelPacking() {
      if (this.selectedPackingRecords.length === 0) {
        this.$message.warning('请选择要取消装箱的记录');
        return;
      }

      const recordIds = this.selectedPackingRecords.map(item => item.id);
      const count = this.selectedPackingRecords.length;

      this.$confirm(`确定要取消装箱 ${count} 条记录吗？`, '批量取消装箱', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return cancelPacking(recordIds);
        })
        .then((res) => {
          if (res.code === 200) {
            this.$message.success(`成功取消装箱 ${count} 条记录`);
            this.getPackingRecordsData();
            this.selectedPackingRecords = [];
            this.hasCancelledPacking = true;
          } else {
            this.$message.error(res.msg || '批量取消装箱失败');
          }
        })
        .catch((error) => {
          if (error !== 'cancel') {
            console.error('批量取消装箱失败:', error);
            this.$message.error('批量取消装箱失败');
          }
        });
    },

    /** 装箱记录对话框关闭处理 */
    handlePackingRecordsDialogClose() {
      if (this.hasCancelledPacking) {
        this.getBoxListData();
        this.hasCancelledPacking = false;
      }
      this.packingRecordsQueryParams.p = 1;
      this.packingRecordsQueryParams.l = 10;
      this.packingRecordsQueryParams.boxNo = "";
      this.packingRecordsList = [];
      this.packingRecordsTotal = 0;
      this.currentBoxNo = "";
      this.selectedPackingRecords = [];
    },

    // ==================== 删除箱子（全部装箱记录）功能相关方法 ====================

    /** 打开删除箱子对话框 */
    handleDeletePackingRecords() {
      this.deletePackingDialogVisible = true;
      this.deletePackingQueryParams.p = 1;
      // 设置默认半年内的时间范围
      this.initDeletePackingDateRange();
      this.getDeletePackingData();
    },

    /** 初始化默认半年内的时间范围 */
    initDeletePackingDateRange() {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      this.deletePackingDateRange = [formatDate(start), formatDate(end)];
      this.deletePackingQueryParams.startTime = formatDate(start);
      this.deletePackingQueryParams.endTime = formatDate(end);
    },

    /** 获取全部装箱记录数据 */
    getDeletePackingData() {
      this.deletePackingLoading = true;
      getPackingRecords(this.deletePackingQueryParams)
        .then((res) => {
          if (res.code === 200) {
            const { list, total, pageNum, pageSize } = res.data;
            this.deletePackingList = list || [];
            this.deletePackingTotal = total || 0;
            this.deletePackingQueryParams.p = pageNum || 1;
            this.deletePackingQueryParams.l = pageSize || 10;
          } else {
            this.$message.error(res.msg || '获取装箱记录失败');
          }
        })
        .catch((error) => {
          console.error('获取装箱记录失败:', error);
          this.$message.error('获取装箱记录失败');
        })
        .finally(() => {
          this.deletePackingLoading = false;
        });
    },

    /** 删除箱子搜索 */
    handleDeletePackingSearch() {
      this.deletePackingQueryParams.p = 1;
      this.getDeletePackingData();
    },

    /** 删除箱子重置 */
    handleDeletePackingReset() {
      this.deletePackingQueryParams = {
        p: 1,
        l: 10,
        boxNo: "",
        sn: "",
        pcbaSn: "",
        startTime: "",
        endTime: ""
      };
      this.deletePackingDateRange = [];
      this.getDeletePackingData();
    },

    /** 装箱时间范围变化 */
    handleDeletePackingDateChange(val) {
      if (val && val.length === 2) {
        this.deletePackingQueryParams.startTime = val[0];
        this.deletePackingQueryParams.endTime = val[1];
      } else {
        this.deletePackingQueryParams.startTime = "";
        this.deletePackingQueryParams.endTime = "";
      }
    },

    /** 删除箱子选择变化 */
    handleDeletePackingSelectionChange(selection) {
      this.selectedDeletePackingRecords = selection;
    },

    /** 点击行选中/取消选中（删除箱子） */
    handleDeletePackingRowClick(row) {
      this.$refs.deletePackingTable.toggleRowSelection(row);
    },

    /** 批量取消装箱（删除箱子对话框） */
    handleDeletePackingBatchCancel() {
      if (this.selectedDeletePackingRecords.length === 0) {
        this.$message.warning('请选择要取消装箱的记录');
        return;
      }

      const recordIds = this.selectedDeletePackingRecords.map(item => item.id);
      const count = this.selectedDeletePackingRecords.length;

      this.$confirm(`确定要取消装箱 ${count} 条记录吗？`, '批量取消装箱', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return cancelPacking(recordIds);
        })
        .then((res) => {
          if (res.code === 200) {
            this.$message.success(`成功取消装箱 ${count} 条记录`);
            this.getDeletePackingData();
            this.selectedDeletePackingRecords = [];
          } else {
            this.$message.error(res.msg || '批量取消装箱失败');
          }
        })
        .catch((error) => {
          if (error !== 'cancel') {
            console.error('批量取消装箱失败:', error);
            this.$message.error('批量取消装箱失败');
          }
        });
    },

    /** 删除箱子对话框关闭处理 */
    handleDeletePackingDialogClose() {
      this.deletePackingQueryParams = {
        p: 1,
        l: 10,
        boxNo: "",
        sn: "",
        pcbaSn: "",
        startTime: "",
        endTime: ""
      };
      this.deletePackingDateRange = [];
      this.deletePackingList = [];
      this.deletePackingTotal = 0;
      this.selectedDeletePackingRecords = [];
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