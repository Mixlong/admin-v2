<template>
  <div class="app-container">
    <IntelligentSearchForm
      :searchForm="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      :defaultVisibleCount="4"
      @reset="handleReset"
    >
      <!-- 自定义客户名称选择器 -->
      <template #field-customerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore
            v-model="searchForm.customerName"
            :data="customerData.data"
            :page="customerData.page"
            :hasMore="customerData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerData"
            size="mini"
            placeholder="请选择客户"
            clearable
            @getChange="handleCustomerChange"
          />
        </el-form-item>
      </template>

      <!-- 自定义品类选择器 -->
      <template #field-categoryId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <CategorySelect
            v-model="searchForm.categoryId"
            placeholder="请选择产品品类"
            :returnId="true"
            clearable
            @change="handleCategoryChange"
          />
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          v-hasPermi="['order:forecast:add']"
          @click="handleAdd"
        >
          新 增
        </el-button>
      </template>
    </IntelligentSearchForm>

    <el-table
      v-loading="loading"
      :height="tableHeight(20)"
      :data="dataList"
      border
    >
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (pagination.p - 1) * pagination.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="客户名称"
        align="center"
        prop="customerName"
        width="120"
      />
      <el-table-column
        label="产品品类"
        align="center"
        prop="categoryName"
        width="100"
      />
      <el-table-column
        label="预测数量"
        align="center"
        prop="forecastQuantity"
        width="80"
      />
      <el-table-column
        label="预计下单日期"
        align="center"
        prop="expectedOrderDate"
        width="110"
      >
        <template slot-scope="{ row }">
          <span
            v-NoData="parseTime(row.expectedOrderDate, '{y}-{m}-{d}')"
          ></span>
        </template>
      </el-table-column>
      <el-table-column
        label="期望交货日期"
        align="center"
        prop="expectedDeliveryDate"
        width="110"
      >
        <template slot-scope="{ row }">
          <span
            v-NoData="parseTime(row.expectedDeliveryDate, '{y}-{m}-{d}')"
          ></span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="rdRiskCountermeasure"
        min-width="150"
      >
        <template slot="header">
          <span>研发关键风险&对策<br/>(项目经理)</span>
        </template>
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div
              class="rich-text-cell"
              style="flex: 1; text-align: left;"
              v-if="row.rdRiskCountermeasure"
              v-html="row.rdRiskCountermeasure"
            ></div>
            <span v-else style="flex: 1;">-</span>
            <div style="display: flex;  ">
              <Tooltip
                v-if="row.rdRiskCountermeasure"
                icon="el-icon-zoom-in"
                content="查看"
                @click="handleViewRiskContent(row, 'rd')"
                :className="['text-info']"
              />
              <Tooltip
                v-if="canEditRdRisk"
                icon="el-icon-edit-outline"
                content="编辑"
                @click="handleRdRisk(row)"
                :className="['text-blue']"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="procurementRiskCountermeasure"
        width="200"
      >
        <template slot="header">
          <span>关键物料采购风险&备货对策<br/>(采购)</span>
        </template>
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div
              class="rich-text-cell"
              style="flex: 1; text-align: left;"
              v-if="row.procurementRiskCountermeasure"
              v-html="row.procurementRiskCountermeasure"
            ></div>
            <span v-else style="flex: 1;">-</span>
            <div style="display: flex;  ">
              <Tooltip
                v-if="row.procurementRiskCountermeasure"
                icon="el-icon-zoom-in"
                content="查看"
                @click="handleViewRiskContent(row, 'procurement')"
                :className="['text-info']"
              />
              <Tooltip
                v-if="canEditProcurementRisk"
                icon="el-icon-edit-outline"
                content="编辑"
                @click="handleProcurementRisk(row)"
                :className="['text-orange']"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="productionRiskCountermeasure"
        min-width="130"
      >
        <template slot="header">
          <span>生产计划风险&对策<br/>(PMC)</span>
        </template>
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div
              class="rich-text-cell"
              style="flex: 1; text-align: left;"
              v-if="row.productionRiskCountermeasure"
              v-html="row.productionRiskCountermeasure"
            ></div>
            <span v-else style="flex: 1;">-</span>
            <div style="display: flex;  ">
              <Tooltip
                v-if="row.productionRiskCountermeasure"
                icon="el-icon-zoom-in"
                content="查看"
                @click="handleViewRiskContent(row, 'production')"
                :className="['text-info']"
              />
              <Tooltip
                v-if="canEditProductionRisk"
                icon="el-icon-edit-outline"
                content="编辑"
                @click="handleProductionRisk(row)"
                :className="['text-green']"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="decisionRemark"
        min-width="130"
      >
        <template slot="header">
          <span>相关决策意见备注<br/>(市场)</span>
        </template>
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div
              class="rich-text-cell"
              style="flex: 1; text-align: left;"
              v-if="row.decisionRemark"
              v-html="row.decisionRemark"
            ></div>
            <span v-else style="flex: 1;">-</span>
            <div style="display: flex;  ">
              <Tooltip
                v-if="row.decisionRemark"
                icon="el-icon-zoom-in"
                content="查看"
                @click="handleViewRiskContent(row, 'decision')"
                :className="['text-info']"
              />
              <Tooltip
                v-if="canEditDecisionRemark"
                icon="el-icon-edit-outline"
                content="编辑"
                @click="handleDecisionRemark(row)"
                :className="['text-purple']"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="订单取消"
        align="center"
        prop="orderCancel"
        width="100"
        header-align="center"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.orderCancel === 0" type="success">否</el-tag>
          <el-tag v-else-if="row.orderCancel === 1" type="danger">是</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="转正式订单"
        align="center"
        prop="convertToFormal"
        width="110"
        header-align="center"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.convertToFormal === 0" type="info">否</el-tag>
          <el-tag v-else-if="row.convertToFormal === 1" type="success"
            >是</el-tag
          >
        </template>
      </el-table-column> -->
      <!-- <el-table-column
        label="正式订单录入时间"
        align ="center"
        prop="formalOrderTime"
        width="150"
        header-align="center"
      >
        <template slot-scope="{ row }">
          <span
            v-NoData="parseTime(row.formalOrderTime, '{y}-{m}-{d} {h}:{i}')"
          ></span>
        </template>
      </el-table-column> -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="100"
      >
        <template slot-scope="{ row }">
          <span>
            {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="{ row }">
          <Tooltip
            icon="el-icon-view"
            content="详情"
            @click="handleView(row)"
          />

          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            v-hasPermi="['order:forecast:update']"
            @click="handleUpdate(row)"
          />

          <el-popconfirm
            title="确定要删除吗？"
            @confirm="handleDelete(row)"
            v-hasPermi="['order:forecast:delete']"
          >
            <Tooltip
              style="margin: 0 10px"
              slot="reference"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
            />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total > 0"
      :current-page.sync="pagination.p"
      :page-size.sync="pagination.l"
      :total="total"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePagination"
      @current-change="handlePagination"
    />

    <add-forecast-dialog
      ref="addForecastDialogRef"
      @refresh="getList"
    />

    <risk-countermeasure-dialog
      ref="riskCountermeasureDialogRef"
      @refresh="getList"
    />

    <forecast-detail-dialog ref="forecastDetailDialogRef" />

    <!-- 风险内容预览对话框 -->
    <el-dialog
      :title="riskViewDialog.title"
      :visible.sync="riskViewDialog.visible"
      width="800px"
      top="0vh"
      class="dialog-scroll"
    >
      <div
        class="risk-content-view"
        v-html="riskViewDialog.content"
      ></div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getForecastList, deleteForecast } from "@/api/order/forecast.js";
import { getSoCustomerList } from "@/api/crm/soCustomer";
import CategorySelect from "@/components/CategorySelect/index.vue";
import SelectLoadMore from "@/components/selectLoadMore/index.vue";
import AddForecastDialog from "./components/AddForecastDialog.vue";
import RiskCountermeasureDialog from "./components/RiskCountermeasureDialog.vue";
import ForecastDetailDialog from "./components/ForecastDetailDialog.vue";

export default {
  name: "OrderForecast",
  components: {
    CategorySelect,
    SelectLoadMore,
    AddForecastDialog,
    RiskCountermeasureDialog,
    ForecastDetailDialog,
  },
  computed: {
    ...mapGetters(["roles"]),
    canEditRdRisk() {
      return this.checkRole(["project_manager", "admin"]);
    },
    canEditProcurementRisk() {
      return this.checkRole(["buyer", "admin"]);
    },
    canEditProductionRisk() {
      return this.checkRole(["pmc", "admin"]);
    },
    canEditDecisionRemark() {
      return this.checkRole(["ms", "admin"]);
    },
  },
  data() {
    return {
      loading: false,
      total: 0,
      dataList: [],
      pagination: {
        p: 1,
        l: 20,
      },
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      // 风险内容预览对话框
      riskViewDialog: {
        visible: false,
        title: "",
        content: "",
      },
      searchForm: {
        customerName: "",
        categoryId: "",
        orderCancel: "",
        convertToFormal: "",
        formalOrderStartTime: "",
        formalOrderEndTime: "",
      },
      searchFields: [
        {
          key: "customerName",
          label: "客户名称",
          component: "custom",
          sort: 1,
        },
        {
          key: "categoryId",
          label: "产品品类",
          component: "custom",
          sort: 2,
        },
        // {
        //   key: "orderCancel",
        //   label: "订单取消",
        //   component: "el-select",
        //   props: {
        //     options: [
        //       { label: "否", value: 0 },
        //       { label: "是", value: 1 },
        //     ],
        //   },
        //   sort: 4,
        // },
        // {
        //   key: "convertToFormal",
        //   label: "转正式订单",
        //   component: "el-select",
        //   props: {
        //     options: [
        //       { label: "否", value: 0 },
        //       { label: "是", value: 1 },
        //     ],
        //   },
        //   sort: 5,
        // },
        // {
        //   key: "formalOrderTime",
        //   label: "正式订单录入时间",
        //   component: "el-date-range",
        //   startKey: "formalOrderStartTime",
        //   endKey: "formalOrderEndTime",
        //   sort: 6,
        // },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      const queryParams = {
        ...this.pagination,
        ...this.searchForm,
      };

      getForecastList(queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.dataList = list || [];
          this.total = total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 搜索
    handleSearch(searchForm) {
      this.searchForm = { ...searchForm };
      this.pagination.p = 1;
      this.getList();
    },
    // 客户选择变化时立即搜索
    handleCustomerChange() {
      this.pagination.p = 1;
      this.getList();
    },
    // 品类选择变化时立即搜索
    handleCategoryChange() {
      this.pagination.p = 1;
      this.getList();
    },
    // 重置
    handleReset() {
      this.searchForm = {
        customerName: "",
        categoryName: "",
        orderCancel: "",
        convertToFormal: "",
        formalOrderStartTime: "",
        formalOrderEndTime: "",
      };
      // 重置客户数据
      this.customerData = {
        data: [],
        page: 1,
        more: true,
      };
      this.pagination.p = 1;
      this.getList();
    },
    // 分页
    handlePagination() {
      this.getList();
    },
    handleAdd() {
      this.$refs.addForecastDialogRef.open();
    },
    handleView(row) {
      this.$refs.forecastDetailDialogRef.open(row);
    },
    handleUpdate(row) {
      this.$refs.addForecastDialogRef.open(row);
    },
    // 复制
    handleCopy(row) {
      this.$refs.addForecastDialogRef.open(row, true);
    },
    // 删除
    handleDelete(row) {
      deleteForecast(row.id).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      });
    },
    // 填写研发关键风险&对策（项目经理）
    handleRdRisk(row) {
      this.$refs.riskCountermeasureDialogRef.open(row, "rd");
    },
    // 填写关键物料采购风险&备货对策（采购）
    handleProcurementRisk(row) {
      this.$refs.riskCountermeasureDialogRef.open(row, "procurement");
    },
    // 填写生产计划风险&对策（PMC）
    handleProductionRisk(row) {
      this.$refs.riskCountermeasureDialogRef.open(row, "production");
    },
    // 填写相关决策意见备注（市场）
    handleDecisionRemark(row) {
      this.$refs.riskCountermeasureDialogRef.open(row, "decision");
    },
    // 查看风险内容
    handleViewRiskContent(row, type) {
      const titleMap = {
        rd: "研发关键风险&对策(项目经理)",
        procurement: "关键物料采购风险&备货对策(采购)",
        production: "生产计划风险&对策(PMC)",
        decision: "相关决策意见备注(市场)",
      };
      const contentMap = {
        rd: row.rdRiskCountermeasure,
        procurement: row.procurementRiskCountermeasure,
        production: row.productionRiskCountermeasure,
        decision: row.decisionRemark,
      };
      
      this.riskViewDialog.title = titleMap[type] || "查看内容";
      this.riskViewDialog.content = contentMap[type] || "";
      this.riskViewDialog.visible = true;
    },
    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          name: keyword,
        })
          .then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total, pageNum } = res.data;
              const filteredList = list || [];

              if (more) {
                this.customerData.data = [...this.customerData.data, ...filteredList];
              } else {
                this.customerData.data = filteredList;
              }

              this.customerData.page = pageNum;
              this.customerData.more = this.customerData.data.length < total;
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },
    checkRole(roleKeys = []) {
      const requiredRoles = Array.isArray(roleKeys) ? roleKeys : [roleKeys];
      if (requiredRoles.length === 0) {
        return false;
      }
      const userRoles = Array.isArray(this.roles) ? this.roles : [];
      return requiredRoles.some((role) => userRoles.includes(role));
    },
  },
};
</script>

<style lang="scss" scoped>
// 分页样式
.el-pagination {
  margin-top: 20px;
  text-align: right;
}

// 蓝色背景列样式（订单取消、转正式订单、正式订单录入时间）
::v-deep .el-table th.el-table__cell:nth-child(n + 11):nth-child(-n + 13) {
  //   background-color: #409eff !important;
  //   color: #fff !important;
}

// 富文本单元格样式
.rich-text-cell {
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
  line-height: 1.6;

  ::v-deep {
    p {
      margin: 5px 0;
      line-height: 1.6;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 5px 0;
      border-radius: 4px;
    }

    ul,
    ol {
      padding-left: 20px;
      margin: 5px 0;
    }

    strong {
      font-weight: 600;
    }
  }
}

</style>
