<template>
  <div class="app-container">
    <!-- 智能搜索表单 -->
    <IntelligentSearchForm
      :searchForm="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      :defaultVisibleCount="4"
      :maxVisibleCount="8"
      @reset="resetQuery"
    >
      <!-- 自定义字段：日期类型 -->
      <template #field-type="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            filterable
            clearable
            style="width: 110px"
            @change="handleDateTypeChange"
          >
            <el-option
              v-for="(label, value) in typeDateList"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义字段：客退日期 -->
      <template #field-returnDate="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <!-- 当选择"日"时，显示日期范围选择器 -->
          <el-date-picker
            v-if="queryParams.type === '3'"
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px"
            clearable
            @change="handleDateRangeChange"
          />
          <!-- 其他类型显示单个日期选择器 -->
          <el-date-picker
            v-else
            v-model="searchForm[field.key]"
            :type="datePickerType"
            placeholder="请选择"
            clearable
            value-format="yyyy-MM-dd"
            style="width: 140px"
          />
        </el-form-item>
      </template>

      <!-- 自定义字段：一级问题 -->
      <template #field-confirmMajorClass="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="queryParams.confirmMajorClass"
            placeholder="请选择一级问题"
            clearable
            style="width: 140px"
            @change="handleMajorClassChange"
          >
            <el-option
              v-for="dict in dict.type.after_problem_major_class"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义字段：二级问题 -->
      <template #field-confirmMinorClass="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="queryParams.confirmMinorClass"
            placeholder="请选择二级问题"
            clearable
            style="width: 140px"
            :disabled="!searchForm.confirmMajorClass"
            @change="handleQuery"
          >
            <el-option
              v-for="dict in filteredMinorOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义字段：客户名称 -->
      <template #field-customerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <select-loadMore
            v-model="queryParams.customerName"
            style="width: 100%"
            :data="customerNameData.data"
            :page="customerNameData.page"
            :hasMore="customerNameData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerNameList"
            placeholder="请选择客户名称"
            @getChange="handleQuery"
          />
        </el-form-item>
      </template>

      <!-- 自定义字段：一级责任 -->
      <template #field-parentResponsibilityPerson="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="queryParams.parentResponsibilityPerson"
            placeholder="请选择一级责任"
            clearable
            style="width: 100%"
            @change="handleParentResponsibilityChange"
          >
            <el-option
              v-for="dict in dict.type.responsibility_group"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义字段：二级责任 -->
      <template #field-responsibilityPerson="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="queryParams.responsibilityPerson"
            placeholder="请选择二级责任"
            clearable
            style="width: 100%"
            :disabled="!queryParams.parentResponsibilityPerson"
            @change="handleQuery"
          >
            <el-option
              v-for="dict in filteredResponsibilityOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义字段：品类 -->
      <template #field-categoryName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            filterable
            clearable
            style="width: 100%"
            @change="handleCategoryChange"
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

      <!-- 自定义字段：型号 -->
      <template #field-computerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="queryParams.computerName"
            filterable
            clearable
            style="width: 100%"
            @change="handleQuery"
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

      <!-- 操作按钮区域 -->
      <template #page-actions>
        <el-button type="danger" @click="clearFilter">
          清除所有过滤器
        </el-button>
        <el-button
          v-hasPermi="['third:afterSale:export']"
          type="success"
          icon="el-icon-download"
          @click="handleMultipleExport"
        >
          导出
        </el-button>
        <el-button
          v-hasPermi="['third:afterSale:add']"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </template>
    </IntelligentSearchForm>

    <el-alert
      title="表格可通过按住Ctrl + 鼠标左键左右拖动"
      type="success"
      show-icon
    ></el-alert>
    <el-table
      id="drag_table"
      ref="afterSaleRef"
      class="afterSaleBox"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight(-50)"
      @row-click="handleRowClick"
      @cell-click="cellClick"
      :cell-style="cellStyle"
      row-key="id"
      @selection-change="handleSelectionChange"
      border
    >
      <!-- 1. 客退日期 -->
      <el-table-column
        type="selection"
        width="55"
        :reserve-selection="true"
        align="center"
        fixed
      />
      <el-table-column
        label="客退日期"
        prop="returnDate"
        align="center"
        width="100"
        column-key="returnDate"
        :filters="getFiltersData('returnDate')"
        :filter-method="filterHandler"
        filter-placement="bottom"
        fixed
      />

      <!-- 2. 客退类型 -->
      <el-table-column
        label="客退类型"
        prop="afterType"
        align="center"
        width="90"
        column-key="afterType"
        :filters="handleDataFilter({ 1: '大货', 2: '样品' })"
        :filter-method="filterHandler"
        filter-placement="bottom"
        fixed
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.afterType === 1" type="primary">大货</el-tag>
          <el-tag v-else-if="row.afterType === 2" type="warning">样品</el-tag>
          <span v-else v-NoData="row.afterType"></span>
        </template>
      </el-table-column>

      <!-- 3. 发生阶段 -->
      <el-table-column
        label="发生阶段"
        prop="generatorStage"
        align="center"
        width="100"
        column-key="generatorStage"
        :filters="happenStageFilters"
        :filter-method="filterHandler"
        filter-placement="bottom"
        fixed
      >
        <span slot-scope="{ row }" v-NoData="row.generatorStage"></span>
      </el-table-column>

      <!-- 4. 问题状态 -->
      <el-table-column
        label="问题状态"
        prop="status"
        align="center"
        width="90"
        column-key="status"
        :filters="handleDataFilter({ '0': 'OPEN', '1': 'CLOSE' })"
        :filter-method="filterHandler"
        filter-placement="bottom"
        fixed
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 0" type="danger">OPEN</el-tag>
          <el-tag v-else type="success">CLOSE</el-tag>
        </template>
      </el-table-column>

      <!-- 5. 处理时效(h) -->
      <el-table-column
        label="处理时效(h)"
        prop="handleTime"
        align="center"
        width="110"
      >
        <template slot-scope="{ row }">
           <span>
            {{ row.processingTime }}
           </span>
        </template>
      </el-table-column>

      <!-- 6. 客户名称 -->
      <el-table-column
        label="客户名称"
        prop="customerName"
        align="center"
        width="140"
        column-key="customerName"
        :filters="getFiltersData('customerName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />

      <!-- 7. 客退方 -->
      <el-table-column
        label="客退方"
        prop="returnParty"
        align="center"
        width="120"
        column-key="returnParty"
        :filters="getFiltersData('returnParty')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />

      <!-- 8. 品类 -->
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        width="120"
        column-key="categoryName"
        :filters="getFiltersData('categoryName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />

      <!-- 9. 仪表型号 -->
      <el-table-column
        label="仪表型号"
        prop="computerName"
        align="center"
        width="140"
        column-key="computerName"
        :filters="getFiltersData('computerName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="{ row }" v-NoData="row.computerName"></span>
      </el-table-column>

      <!-- 10. 产品SN -->
      <el-table-column
        label="产品SN"
        prop="sn"
        align="center"
        width="140"
        column-key="sn"
        :filters="getFiltersData('sn')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <el-link @click.stop="toPage(row.sn)">{{ row.sn }}</el-link>
        </template>
      </el-table-column>

      <!-- 11. 客诉现象 -->
      <el-table-column
        label="客诉现象"
        prop="result"
        align="center"
        width="150"
        column-key="result"
        :filters="getFiltersData('result')"
        :filter-method="filterHandler"
        filter-placement="bottom"
        show-overflow-tooltip
      />

      <!-- 13. 一级问题 -->
      <el-table-column
        label="一级问题"
        prop="confirmMajorClass"
        align="center"
        width="120"
        column-key="confirmMajorClass"
        :filters="dictFilterOptions('after_problem_major_class')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="{ row }" v-NoData="row.confirmMajorClass"></span>
      </el-table-column>

      <!-- 14. 二级问题 -->
      <el-table-column
        label="二级问题"
        prop="confirmMinorClass"
        align="center"
        width="120"
        column-key="confirmMinorClass"
        :filters="dictFilterOptions('after_problem_minor_class')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="{ row }" v-NoData="row.confirmMinorClass"></span>
      </el-table-column>
      <el-table-column
        label="分析负责人"
        prop="locationAnalyst"
        align="center"
        width="120"
        column-key="locationAnalyst"
        :filters="getFiltersData('locationAnalyst')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="{ row }" v-NoData="row.locationAnalyst"></span>
      </el-table-column>
      <!-- 15. 发生原因 -->
      <el-table-column
        label="发生原因"
        prop="analysisCause"
        align="center"
        width="200"
      >
        <template slot-scope="{ row }">
          <RichTextDisplay
            :content="row.analysisCause"
            max-height="120px"
            placeholder="-"
          />
        </template>
      </el-table-column>

      <!-- 16. 流出原因 -->
      <el-table-column
        label="流出原因"
        prop="analysisOutflowCause"
        align="center"
        width="200"
      >
        <template slot-scope="{ row }">
          <RichTextDisplay
            :content="row.analysisOutflowCause"
            max-height="120px"
            placeholder="-"
          />
        </template>
      </el-table-column>

      <!-- 17. 责任判定 -->
      <el-table-column
        label="一级责任"
        prop="parentResponsibilityPerson"
        align="center"
        width="180"
        column-key="parentResponsibilityPerson"
        :filters="dictFilterOptions('responsibility_group')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          {{  row.parentResponsibilityPerson }}
        </template>
      </el-table-column>
      <!-- 17. 责任判定 -->
      <el-table-column
        label="二级责任"
        prop="responsibilityPerson"
        align="center"
        width="180"
        column-key="responsibilityPerson"
        :filters="dictFilterOptions('responsibility_determination')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          {{ row.responsibilityPerson}}
        </template>
      </el-table-column>

      <!-- 18. 内部对策 -->
      <el-table-column
        label="内部对策"
        prop="internalMeasures"
        align="center"
        width="150"
        show-overflow-tooltip
      >
        <span slot-scope="{ row }" v-NoData="row.internalMeasures"></span>
      </el-table-column>

      <!-- 19. 外部对策 -->
      <el-table-column
        label="外部对策"
        prop="externalMeasures"
        align="center"
        width="150"
        show-overflow-tooltip
      >
        <span slot-scope="{ row }" v-NoData="row.externalMeasures"></span>
      </el-table-column>

      <!-- 20. 改善责任人 -->
      <el-table-column
        label="改善责任人"
        prop="problemResponsiblePerson"
        align="center"
        width="120"
      >
        <span
          slot-scope="{ row }"
          v-NoData="row.problemResponsiblePerson"
        ></span>
      </el-table-column>

      <!-- 21. 返回日期 -->
      <el-table-column
        label="返回日期"
        prop="logistics.returnDate"
        align="center"
        width="100"
      >
        <span
          slot-scope="{ row }"
          v-NoData="row.logistics && row.logistics.returnDate"
        ></span>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="{ row }">
          <div class="flex justify-center align-center">
            <el-button
              v-hasPermi="['third:afterSale:edit']"
              class="text-blue"
              type="text"
              @click="handleUpdate(row)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['third:afterSale:analysis']"
              class="text-orange"
              type="text"
              @click="handleAnalysis(row)"
            >
              售后分析
            </el-button>
            <el-dropdown
              size="mini"
              class="margin-left-xs"
              trigger="click"
              placement="bottom"
            >
              <span class="el-dropdown-link pointer">
                <span class="text-green" style="font-size: 12px">更多操作</span
                ><i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-hasPermi="['third:afterSale:query']">
                  <el-button
                    class="w100"
                    type="text"
                    @click="handleDetail(row)"
                  >
                    详情
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-hasPermi="['third:afterSale:remove']">
                  <el-button
                    class="w100"
                    type="text"
                    @click="handleDelete(row)"
                  >
                    删除
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="row.video">
                  <el-button
                    class="w100"
                    type="text"
                    @click="urlDownload(row.video)"
                  >
                    视频下载
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="!Is_Empty(row.rootMatter)">
                  <el-button class="w100" type="text" @click="handleClose(row)">
                    {{ isStatusTxt(row.status) }}
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :ls="[50, 100, 200]"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 新增、修改 -->
    <AddSale
      ref="isAddSaleRef"
      :visible.sync="isSaleAddDia"
      :dictList="dictList"
      :modelDirList="modelDirList"
      :pmDictListOptions="pmDictListOptions"
      :rootClassify="rootClassify"
    />

    <!-- 详情 -->
    <after-detail
      ref="isAfterDetailRef"
      :visible.sync="isAfterDetailDia"
      :rootClassify="rootClassify"
      :directionLabel="directionLabel"
    />

    <!-- 处理 -->
    <handle-problem
      ref="isHandleProblemRef"
      :visible.sync="isHandleProblemDia"
      :handleProblemData="handleProblemData"
      @clearSaleSelection="clearSaleSelection"
    />

    <!-- 批量物流录入 -->
    <sale-info
      :visible.sync="isSaleInfoFlag"
      :saleIdList="saleIdList"
      :modelDirList="modelDirList"
      @clearSaleSelection="clearSaleSelection"
    />
    <!-- 当前处理进展 -->
    <deal-progress ref="isDealProgressRef" :visible.sync="isDealProgressDia" />

    <!-- 售后分析弹窗 -->
    <after-analysis
      :visible.sync="analysisDialogVisible"
      :row-data="currentAnalysisRow"
      @refresh="getList"
    />
  </div>
</template>

<script>
import {
  afterList,
  saleDelete,
  saleOperation,
  saleExport,
  afterMultipleDownload,
} from "@/api/third/sale";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import commonData from "@/mixins/commonData";
import { dragTableFn } from "@/mixins/common";
import globalData from "./mixins/global";
import { getCustomerList } from "@/api/order";

export default {
  name: "AfterSale",
  mixins: [commonData, dragTableFn, globalData],
  components: {
    FlipDown,
    AddSale: () => import("./components/addSale"),
    AfterDetail: () => import("./components/afterDetail"),
    HandleProblem: () => import("./components/handleProblem"),
    DealProgress: () => import("./components/dealProgress"),
    SaleInfo: () => import("./components/saleInfo"),
    AfterAnalysis: () => import("./components/AfterAnalysis"),
  },
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 新增、修改弹窗
      isSaleAddDia: false,
      // 详情弹窗
      isAfterDetailDia: false,
      // 处理
      isHandleProblemDia: false,
      handleProblemData: {},
      // 当前处理进展
      isDealProgressDia: false,
      // 售后分析弹窗
      analysisDialogVisible: false,
      currentAnalysisRow: null,
      // 待处理 、 全部
      isWaitDispose: true,
      //
      isSaleInfoFlag: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      isSaleIdFlag: false,
      // 总条数
      total: 0,
      brandList: [],
      // 品类
      dictList: [],
      // 仪表去向
      modelDirList: [],
      // 根因分类
      rootClassify: [],
      // 售后ID
      saleIdList: [],
      uploadIds: [],
      multipleList: [],
      // 批量处理ID
      multipleDealIds: [],
      // 客户数据
      customerNameData: {
        data: [],
        page: 1,
        more: true,
      },
      typeDateList: {
        1: "年",
        2: "月",
        3: "日",
      },
      happenStageFilters: [
        { text: "组装厂", value: "组装厂" },
        { text: "用户", value: "用户" },
      ],
      // 处理进展
      stateList: {
        1: "处理类型",
        2: "现象复测",
        3: "分类处理",
        4: "问题处理",
        5: "维修处理",
        6: "返厂处理",
        7: "处理完成",
      },
      options: [
        {
          label: "待处理",
          value: 0,
        },
        {
          label: "处理中",
          value: 1,
        },
        {
          label: "已处理",
          value: 2,
        },
        {
          label: "已驳回",
          value: 3,
        },
      ],
      pmDictListOptions: [],
      // 日期选择器类型
      datePickerType: "date",
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        type: undefined,
        returnDate: undefined,
        returnEndDate: undefined, // 客诉结束日期（仅当type=3时生效）
        confirmMajorClass: undefined, // 一级问题
        confirmMinorClass: undefined, // 二级问题
        customerName: undefined,
        parentResponsibilityPerson: undefined, // 一级责任
        responsibilityPerson: undefined, // 二级责任
        categoryName: undefined,
        computerName: undefined,
        status: undefined,
      },
      // 日期范围（用于type=3时的双向绑定）
      dateRange: [],
      // 搜索字段配置
      searchFields: [
        {
          key: "type",
          label: "日期类型",
          component: "custom",
          sort: 1,
        },
        {
          key: "returnDate",
          label: "客退日期",
          component: "custom",
          sort: 2,
        },
        {
          key: "confirmMajorClass",
          label: "一级问题",
          component: "custom",
          sort: 3,
        },
        {
          key: "confirmMinorClass",
          label: "二级问题",
          component: "custom",
          sort: 4,
        },
        {
          key: "customerName",
          label: "客户名称",
          component: "custom",
          sort: 2,
        },
        {
          key: "parentResponsibilityPerson",
          label: "一级责任",
          component: "custom",
          sort: 6,
        },
        {
          key: "responsibilityPerson",
          label: "二级责任",
          component: "custom",
          sort: 7,
        },
        {
          key: "categoryName",
          label: "品类",
          component: "custom",
          sort: 8,
        },
        {
          key: "computerName",
          label: "仪表型号",
          component: "custom",
          sort: 9,
        },
        {
          key: "status",
          label: "问题状态",
          component: "el-select",
          componentProps: {
            placeholder: "请选择",
            clearable: true,
            style: "width: 120px",
          },
          props: {
            options: [
              { label: "OPEN", value: "0" },
              { label: "CLOSE", value: "1" },
            ],
          },
          sort: 2,
        },
      ],
    };
  },
  dicts: [
    "after_problem_major_class",
    "after_problem_minor_class",
    "responsibility_group",
    "responsibility_determination",
  ],
  computed: {
    ...mapGetters(["userId", "nickName"]),
    // 过滤后的二级问题选项（根据一级问题）
    filteredMinorOptions() {
      const majorDict = this.dict.type.after_problem_major_class || [];
      const minorDict = this.dict.type.after_problem_minor_class || [];
      const normalize = (val) =>
        val === undefined || val === null
          ? ""
          : String(val).trim().toLowerCase();

      if (!this.queryParams.confirmMajorClass) {
        return [];
      }

      const selectedMajorNormalized = normalize(this.queryParams.confirmMajorClass);
      const selectedMajor =
        majorDict.find(
          (item) =>
            normalize(item.label) === selectedMajorNormalized ||
            normalize(item.value) === selectedMajorNormalized
        ) || {};
      const selectedMajorLabel = normalize(
        selectedMajor.label || this.queryParams.confirmMajorClass
      );
      const selectedMajorValue = normalize(selectedMajor.value);

      return minorDict.filter((item) => {
        const remarkRaw =
          item.raw?.remark ?? item.raw?.dictRemark ?? item.remark ?? "";
        const remarkList = remarkRaw
          .split(/[,，]/)
          .map((v) => normalize(v))
          .filter(Boolean);

        if (remarkList.length === 0) {
          return false;
        }

        return remarkList.some(
          (remark) =>
            remark === selectedMajorLabel ||
            (selectedMajorValue && remark === selectedMajorValue)
        );
      });
    },
    // 过滤后的二级责任选项（根据一级责任）
    filteredResponsibilityOptions() {
      const groupDict = this.dict.type.responsibility_group || [];
      const determinationDict = this.dict.type.responsibility_determination || [];
      const normalize = (val) =>
        val === undefined || val === null
          ? ""
          : String(val).trim().toLowerCase();

      if (!this.queryParams.parentResponsibilityPerson) {
        return [];
      }

      const selectedGroupNormalized = normalize(this.queryParams.parentResponsibilityPerson);
      const selectedGroup =
        groupDict.find(
          (item) =>
            normalize(item.label) === selectedGroupNormalized ||
            normalize(item.value) === selectedGroupNormalized
        ) || {};
      const selectedGroupLabel = normalize(
        selectedGroup.label || this.queryParams.parentResponsibilityPerson
      );
      const selectedGroupValue = normalize(selectedGroup.value);

      return determinationDict.filter((item) => {
        const remarkRaw =
          item.raw?.remark ?? item.raw?.dictRemark ?? item.remark ?? "";
        const remarkList = remarkRaw
          .split(/[,，]/)
          .map((v) => normalize(v))
          .filter(Boolean);

        if (remarkList.length === 0) {
          return false;
        }

        return remarkList.some(
          (remark) =>
            remark === selectedGroupLabel ||
            (selectedGroupValue && remark === selectedGroupValue)
        );
      });
    },
    // 根据字典生成表格筛选项
    dictFilterOptions() {
      return (dictKey) => {
        const dictList = this.dict.type[dictKey] || [];
        return dictList.map((item) => ({
          text: item.label,
          value: item.label,
        }));
      };
    },
    setInventory() {
      return (inventory) => {
        if (inventory) {
          return JSON.parse(inventory);
        }
      };
    },
    directionDir() {
      return (dataList, direction) => {
        return (
          dataList.length &&
          dataList.filter((item) => +item.dictValue === +direction)
        );
      };
    },
    directionLabel() {
      return (dataList, direction) => {
        if (!this.Is_Empty(direction)) {
          const directionData = this.directionDir(dataList, direction);
          return directionData[0] && directionData[0].dictLabel;
        }
      };
    },
    directionListClass() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        const tagType = directionData[0] && directionData[0].listClass;
        return tagType === "primary" ? "" : tagType;
      };
    },
    isStatusTxt() {
      return (status) => {
        return status === 0 ? "关闭" : "打开";
      };
    },
    isWaitOrAllTxt() {
      return this.isWaitDispose ? "待处理" : "全部";
    },
    isWaitOrAllType() {
      return this.isWaitDispose ? "danger" : "success";
    },
    // 处理类型人员确认中
    isHandlerType() {
      return ({ handlerType, state }) => {
        return +handlerType === this.userId && state === 1;
      };
    },
    // 现象复测人员确认中
    isRetester() {
      return ({ retester, state }) => {
        return +retester === this.userId && state === 2;
      };
    },
    // 分类处理人员确认中
    isClassifiedBy() {
      return ({ classifiedBy, state }) => {
        return +classifiedBy === this.userId && state === 3;
      };
    },
    // 问题处理人员确认中
    isHandlerBy() {
      return ({ handlerBy, state }) => {
        return +handlerBy === this.userId && state === 4;
      };
    },
    // 维修处理人员确认中
    isServiceBy() {
      return ({ serviceBy, state }) => {
        return +serviceBy === this.userId && state === 5;
      };
    },
    // 返厂处理人员确认中
    isWarehousingBy() {
      return ({ warehousing, state }) => {
        return +warehousing === this.userId && state === 6;
      };
    },
    // 协议查询条件
    handleDataFilter() {
      return (data) => {
        try {
          if (data instanceof Object) {
            if (Array.isArray(data)) {
              return data.map(({ dictLabel, dictValue }) => {
                return { text: dictLabel, value: +dictValue };
              });
            } else {
              return Object.entries(data)
                .map(([key, value]) => {
                  return { text: value, value: +key };
                })
                .sort((a, b) => a.text - b.text);
            }
          } else {
            throw new Error("传的值类型必须是对象或数组");
          }
        } catch (error) {
          console.error(error);
        }
      };
    },
    // 获取每项的筛选值
    getFiltersData() {
      return (key) => {
        let newList = [];
        let filterList = [];
        this.brandList?.forEach((item) => {
          if (!this.Is_Empty(item[key]) && !filterList.includes(item[key])) {
            filterList.push(item[key]);
            newList.push({
              text: item[key],
              value: item[key],
            });
          }
        });

        return newList.sort((a, b) => a.text - b.text);
      };
    },
  },
  watch: {
    // 监听queryParams中的日期字段，同步到dateRange（用于回显）
    'queryParams.returnDate': {
      handler(newVal) {
        if (this.queryParams.type === '3') {
          this.syncDateRange();
        }
      },
    },
    'queryParams.returnEndDate': {
      handler(newVal) {
        if (this.queryParams.type === '3') {
          this.syncDateRange();
        }
      },
    },
  },
  created() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    this.getMemberDictUser();
    this.getModelDirData();
    this.getRootClassifyData();
    this.getList();
  },
  methods: {
    // 格式化责任判定显示（一级 / 二级）
    formatResponsibility(group, determination) {
      if (!group && !determination) return '-';
      if (group && determination) {
        return `${group} / ${determination}`;
      }
      return group || determination;
    },
    
    // 一级问题变化处理
    handleMajorClassChange() {
      // 清空二级问题
      this.queryParams.confirmMinorClass = undefined;
      this.handleQuery();
    },
    
    // 一级责任变化处理
    handleParentResponsibilityChange() {
      // 清空二级责任
      this.queryParams.responsibilityPerson = undefined;
      this.handleQuery();
    },
    
    // 日期类型变化处理
    handleDateTypeChange(type) {
      // 清空日期
      this.queryParams.returnDate = undefined;
      this.queryParams.returnEndDate = undefined;
      this.dateRange = [];

      // 根据类型设置日期选择器类型
      if (type === "1") {
        // 年
        this.datePickerType = "year";
      } else if (type === "2") {
        // 月
        this.datePickerType = "month";
      } else if (type === "3") {
        // 日 - 使用日期范围选择器
        this.datePickerType = "date";
      } else {
        // 默认按天
        this.datePickerType = "date";
      }
    },
    // 日期范围变化处理
    handleDateRangeChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.queryParams.returnDate = dateRange[0];
        this.queryParams.returnEndDate = dateRange[1];
      } else {
        this.queryParams.returnDate = undefined;
        this.queryParams.returnEndDate = undefined;
      }
    },
    // 同步日期范围（用于回显）
    syncDateRange() {
      const { returnDate, returnEndDate } = this.queryParams;
      if (returnDate && returnEndDate) {
        this.dateRange = [returnDate, returnEndDate];
      } else if (returnDate) {
        this.dateRange = [returnDate, returnDate];
      } else {
        this.dateRange = [];
      }
    },
    // 品类变化处理 - 清空型号并从 dictList 中加载型号列表
    handleCategoryChange(categoryName) {
      // 清空型号
      this.queryParams.computerName = undefined;

      // 根据品类从 dictList 中加载对应的型号列表
      if (categoryName) {
        const data = this.dictList.filter((item) => item.name === categoryName);
        this.computerOptions = data[0]?.computerList || [];
      } else {
        this.computerOptions = [];
      }

      // 触发查询（IntelligentSearchForm 组件已自动同步 categoryName 到 queryParams）
      this.$nextTick(() => {
        this.handleQuery();
      });
    },
    async getMemberDictUser() {
      try {
        const { data } = await memberDictUser();
        this.pmDictListOptions = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 不良仪表去向
    async getModelDirData() {
      try {
        const { data } = await this.getDicts("sys_model_direction");
        this.modelDirList = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 根因分类
    async getRootClassifyData() {
      try {
        const { data } = await this.getDicts("sys_root_classify");
        this.rootClassify = data;
      } catch (error) {
        console.error(error);
      }
    },
    handleSelectionChange(selection) {
      this.multipleList = selection;
      this.saleIdList = selection.map((item) => item.id);
      this.uploadIds = selection.map((item) => item.id);
    },
    clearSaleSelection() {
      this.$refs.afterSaleRef.clearSelection();
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      const dataInfo = {
        ...this.queryParams,
        my: this.isWaitDispose ? "" : this.nickName,
      };
      afterList(dataInfo)
        .then((res) => {
          const { list, total } = res.data;
          // 兼容后端字段仍为 happenStage 的情况
          this.brandList = (list || []).map((item) => ({
            ...item,
            generatorStage:
              item.generatorStage !== undefined
                ? item.generatorStage
                : item.happenStage,
          }));
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 新增
    handleAdd() {
      this.isSaleAddDia = true;
    },
    // 修改
    handleUpdate(row) {
      this.isSaleAddDia = true;
      let {
        logisticsEntity,
        inventory,
        categoryId,
        computerId,
        sn,
        file,
        video,
      } = row;
      const defaultLogistics = {
        id: "",
        afterId: "",
        returnDate: "",
        sender: "",
        mailingDepartment: "",
        mailingNumber: "",
        recipient: "",
        phone: "",
        address: "",
        isPay: "",
      };
      let dataCopy;
      if (this.Is_Empty(logisticsEntity)) {
        dataCopy = {
          ...row,
          logisticsEntity: {},
          inventory: JSON.parse(inventory),
        };
      } else {
        dataCopy = { ...row, inventory: JSON.parse(inventory) };
      }
      // 兼容字段重命名：编辑时将 happenStage 映射为 generatorStage
      if (
        dataCopy &&
        dataCopy.happenStage !== undefined &&
        dataCopy.generatorStage === undefined
      ) {
        dataCopy.generatorStage = dataCopy.happenStage;
      }

      // 处理图片和视频回显：逗号分隔字符串转数组
      if (file && typeof file === "string") {
        dataCopy.file = file.split(",").filter((item) => item);
      }
      if (video && typeof video === "string") {
        dataCopy.video = video.split(",").filter((item) => item);
      }

      const list = [
        {
          categoryId,
          computerId,
          sn,
        },
      ];
      this.$refs.isAddSaleRef.form = {
        ...dataCopy,
        list,
        // 确保 logistics 不是 null
        logistics: {
          ...defaultLogistics,
          ...(dataCopy.logistics || dataCopy.logisticsEntity || {}),
        },
      };
      console.log(
        "🚀 ~ file: index.vue:1122 ~ this.$refs.isAddSaleRef.form :",
        this.$refs.isAddSaleRef.form
      );
      this.$refs.isAddSaleRef.active =
        dataCopy.state === 7 ? 7 : dataCopy.state - 1;
    },
    // 打开售后分析弹窗
    handleAnalysis(row) {
      this.currentAnalysisRow = row;
      this.analysisDialogVisible = true;
    },
    // 详情
    handleDetail(row) {
      this.isAfterDetailDia = true;
      this.$refs.isAfterDetailRef.getAfterInfo(row.id,row);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删产品SN为"' + row.sn + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleDelete(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    // 关闭问题
    handleClose(row) {
      const { status } = row;
      this.$confirm(`是否${this.isStatusTxt(status)}该问题?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleOperation({ id: row.id, status: status === 0 ? 1 : 0 });
        })
        .then(() => {
          this.getList();
          this.msgSuccess(`问题${this.isStatusTxt(status)}成功`);
        });
    },

    // 处理问题
    handleProblem(row) {
      this.isHandleProblemDia = true;
      this.$refs.isHandleProblemRef.isMultipleDeal = false;
      if (row.state === 5) {
        this.handleProblemData = {
          ...row,
          materialLossList: [
            {
              materialName: "",
              materialCode: "",
              materialNum: "",
            },
          ],
        };
      } else {
        this.handleProblemData = { ...row };
      }
    },
    // 查看处理进展
    seeDealProgress({ id, state }) {
      this.isDealProgressDia = true;
      this.$refs.isDealProgressRef.getAfterHandleDetail(id, state);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.datePickerType = "date";
      this.dateRange = [];
      this.queryParams = {
        p: 1,
        l: 50,
        type: undefined,
        returnDate: undefined,
        returnEndDate: undefined,
        confirmMajorClass: undefined,
        customerName: undefined,
        responsibilityPerson: undefined,
        categoryName: undefined,
        computerName: undefined,
        status: undefined,
      };
      this.handleQuery();
    },
    toPage(sn) {
      this.$router.push(
        `/afterSaleSupport/material/PartInfoView/productRecord?sn=${sn}`
      );
    },
    // 点击行打开详情
    handleRowClick(row, column, event) {
      // 排除特殊列的点击（这些列有自己的点击逻辑）
      const excludeColumns = ['操作', '产品SN', '处理进展'];
      if (column && excludeColumns.includes(column.label)) {
        return;
      }
      // 打开详情弹窗
      this.handleDetail(row);
    },
    
    cellClick(row, column, cell, event) {
      const { label } = column;
      switch (label) {
        case "处理进展":
          this.seeDealProgress(row);
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      const { label } = column;
      // 特殊列显示手型光标
      if (label === "产品SN" || label === "处理进展") {
        return `cursor: pointer;`;
      }
      // 其他列显示默认光标（行点击）
      if (label && label !== '操作') {
        return `cursor: pointer;`;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = {
        ...this.queryParams,
        my: this.isWaitDispose ? "" : this.nickName,
      };
      this.$confirm("是否确认导出所有售后支持数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return saleExport(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 批量导出按钮操作 */
    handleMultipleExport() {
      if (!this.uploadIds.length) return this.msgError("请选择导出项");

      this.downloadFile({
        aFn: afterMultipleDownload,
        queryParams: this.uploadIds,
      });
    },
    /** 每项筛选方法 */
    filterHandler(value, row, column) {
      const property = column["property"];

      return row[property] == value;
    },
    /** 清除所有过滤器  */
    clearFilter() {
      this.$refs.afterSaleRef.clearFilter();
    },
    /** 客户名称列表 */
    getCustomerNameList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerNameData.data = [
              ...this.customerNameData.data,
              ...list,
            ];
          } else {
            this.customerNameData.data = list;
          }
          this.customerNameData.more = pageNum * pageSize < total;
          this.customerNameData.page = pageNum;
          resolve();
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.inventory-box {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 5px;
  justify-content: center;
}

// 修复固定列遮挡滚动条的问题
.afterSaleBox {
  // 固定列右侧不遮挡滚动条
  /deep/ .el-table__fixed-right {
    height: calc(100% - 13px) !important;
    z-index: 15 !important;
    box-shadow: -1px 0 8px rgba(0, 0, 0, 0.12) !important;
  }
  
  // 固定列左侧不遮挡滚动条
  /deep/ .el-table__fixed-left {
    height: calc(100% - 13px) !important;
    z-index: 15 !important;
    box-shadow: 1px 0 8px rgba(0, 0, 0, 0.12) !important;
  }
  
  // 确保固定列背景色正确
  /deep/ .el-table__fixed-left .el-table__cell,
  /deep/ .el-table__fixed-right .el-table__cell {
    background-color: #fff !important;
    z-index: 1;
    position: relative;
  }
  
  // 确保滚动条可见且可以交互
  /deep/ .el-table__body-wrapper {
    &::-webkit-scrollbar {
      height: 12px;
      width: 12px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 6px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style>
