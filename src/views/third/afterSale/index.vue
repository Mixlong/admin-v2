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
          v-hasPermi="['third:afterSale:export']"
          type="warning"
          icon="el-icon-download"
          @click="handleExportAll"
        >
          全部导出
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
    <VirtualTable
      id="drag_table"
      ref="afterSaleRef"
      class="afterSaleBox"
      :loading="loading"
      :data="brandList"
      :height="tableHeight(-10)"
      :virtual-enabled="true"
      :row-height="56"
      :virtual-threshold="100"
      :row-config="{ keyField: 'id', isHover: true, height: 56 }"
      :column-config="{ resizable: false }"
      :checkbox-config="{ reserve: true }"
      show-overflow="ellipsis"
      show-header-overflow="tooltip"
      @row-click="handleRowClick"
      @cell-click="cellClick"
      :cell-style="cellStyle"
      :row-class-name="tableRowClassName"
      @checkbox-change="handleSelectionChange"
      @checkbox-all="handleSelectionChange"
    >
      <!-- 1. 客退日期 -->
      <vxe-column
        type="checkbox"
        width="55"
        align="center"
        fixed="left"
      />
      <vxe-column
        title="客退日期"
        field="returnDate"
        align="center"
        width="88"
        :filters="getFiltersData('returnDate')"
        :filter-method="filterHandler"
        fixed="left"
      />
        <!-- :filters="handleDataFilter({ 1: '大货', 2: '样品' })" -->
      <!-- 2. 客退类型 -->
      <vxe-column
        title="客退类型"
        field="afterType"
        align="center"
        width="65"
        :filter-method="filterHandler"
        fixed="left"
      >
        <template #default="{ row }">
          <el-tag v-if="row.afterType === 1" type="primary">大货</el-tag>
          <el-tag v-else-if="row.afterType === 2" type="warning">样品</el-tag>
          <span v-else v-NoData="row.afterType"></span>
        </template>
      </vxe-column>

      <!-- 3. 发生阶段 -->
      <vxe-column
        title="发生阶段"
        field="generatorStage"
        align="center"
        width="78"
        :filters="happenStageFilters"
        :filter-method="filterHandler"
        fixed="left"
      >
        <template #default="{ row }">
          <span v-NoData="row.generatorStage"></span>
        </template>
      </vxe-column>

      <!-- 4. 问题状态 -->
      <vxe-column
        title="问题状态"
        field="status"
        align="center"
        width="78"
        :filters="handleDataFilter({ '0': 'OPEN', '1': 'CLOSE' })"
        :filter-method="filterHandler"
        fixed="left"
      >
        <template #default="{ row }">
          <el-tag v-if="row.status === 0" type="danger">OPEN</el-tag>
          <el-tag v-else type="success">CLOSE</el-tag>
        </template>
      </vxe-column>

      <!-- 5. 处理时效(h) -->
      <vxe-column
        title="处理时效(h)"
        field="handleTime"
        align="center"
        width="80"
      >
        <template #default="{ row }">
          <span>
            {{ row.processingTime }}
          </span>
        </template>
      </vxe-column>

      <!-- 6. 客户名称 -->
      <vxe-column
        title="客户名称"
        field="customerName"
        align="center"
        width="90"
        :filters="getFiltersData('customerName')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.customerName)"
            :title="getTextValue(row.customerName)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.customerName) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 7. 客退方 -->
      <vxe-column
        title="客退方"
        field="returnParty"
        align="center"
        width="90"
        :filters="getFiltersData('returnParty')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.returnParty)"
            :title="getTextValue(row.returnParty)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.returnParty) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 8. 品类 -->
      <vxe-column
        title="品类"
        field="categoryName"
        align="center"
        width="70"
        :filters="getFiltersData('categoryName')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.categoryName)"
            :title="getTextValue(row.categoryName)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.categoryName) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 9. 仪表型号 -->
      <vxe-column
        title="仪表型号"
        field="computerName"
        align="center"
        width="140"
        :filters="getFiltersData('computerName')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.computerName)"
            :title="getTextValue(row.computerName)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.computerName) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 10. 产品SN -->
      <vxe-column
        title="产品SN"
        field="sn"
        align="center"
        width="110"
        :filters="getFiltersData('sn')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-link
            v-if="!Is_Empty(row.sn)"
            :title="getTextValue(row.sn)"
            class="text-clamp-2 text-clamp-center text-link-clamp"
            @click.stop="toPage(row.sn)"
          >
            {{ getTextValue(row.sn) }}
          </el-link>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 11. 客诉现象 -->
      <vxe-column
        title="客诉现象"
        field="result"
        align="center"
        width="150"
        class-name="rich-text-column"
        :filters="getFiltersData('result')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-popover
            v-if="row.result"
            placement="top-start"
            trigger="hover"
            width="420"
            popper-class="after-sale-rich-popover"
          >
            <RichTextDisplay
              :content="row.result"
              max-height="320px"
              placeholder="-"
            />
            <div slot="reference" class="rich-preview-trigger">
              <span class="rich-preview-text">{{
                getHtmlPreviewText(row.result)
              }}</span>
            </div>
          </el-popover>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 13. 一级问题 -->
      <vxe-column
        title="一级问题"
        field="confirmMajorClass"
        align="center"
        width="90"
        :filters="dictFilterOptions('after_problem_major_class')"
        :filter-method="filterHandler"
      >
        <template #default="{ row }">
          <span v-NoData="row.confirmMajorClass"></span>
        </template>
      </vxe-column>

      <!-- 14. 二级问题 -->
      <vxe-column
        title="二级问题"
        field="confirmMinorClass"
        align="center"
        width="100"
        :filters="dictFilterOptions('after_problem_minor_class')"
        :filter-method="filterHandler"
      >
        <template #default="{ row }">
          <span v-NoData="row.confirmMinorClass"></span>
        </template>
      </vxe-column>
      <vxe-column
        title="分析负责人"
        field="locationAnalyst"
        align="center"
        width="90"
        :filters="getFiltersData('locationAnalyst')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.locationAnalyst)"
            :title="getTextValue(row.locationAnalyst)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.locationAnalyst) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>
      <!-- 15. 发生原因 -->
      <vxe-column
        title="发生原因"
        field="analysisCause"
        align="center"
        width="200"
        class-name="rich-text-column"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-popover
            v-if="row.analysisCause"
            placement="top-start"
            trigger="hover"
            width="420"
            popper-class="after-sale-rich-popover"
          >
            <RichTextDisplay
              :content="row.analysisCause"
              max-height="320px"
              placeholder="-"
            />
            <div slot="reference" class="rich-preview-trigger">
              <span class="rich-preview-text">{{
                getHtmlPreviewText(row.analysisCause)
              }}</span>
            </div>
          </el-popover>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 16. 流出原因 -->
      <vxe-column
        title="流出原因"
        field="analysisOutflowCause"
        align="center"
        width="200"
        class-name="rich-text-column"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-popover
            v-if="row.analysisOutflowCause"
            placement="top-start"
            trigger="hover"
            width="420"
            popper-class="after-sale-rich-popover"
          >
            <RichTextDisplay
              :content="row.analysisOutflowCause"
              max-height="320px"
              placeholder="-"
            />
            <div slot="reference" class="rich-preview-trigger">
              <span class="rich-preview-text">{{
                getHtmlPreviewText(row.analysisOutflowCause)
              }}</span>
            </div>
          </el-popover>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 17. 责任判定 -->
      <vxe-column
        title="一级责任"
        field="parentResponsibilityPerson"
        align="center"
        width="90"
        :filters="dictFilterOptions('responsibility_group')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.parentResponsibilityPerson)"
            :title="getTextValue(row.parentResponsibilityPerson)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.parentResponsibilityPerson) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>
      <!-- 17. 责任判定 -->
      <vxe-column
        title="二级责任"
        field="responsibilityPerson"
        align="center"
        width="90"
        :filters="dictFilterOptions('responsibility_determination')"
        :filter-method="filterHandler"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.responsibilityPerson)"
            :title="getTextValue(row.responsibilityPerson)"
            class="text-clamp-2 text-clamp-center"
          >
            {{ getTextValue(row.responsibilityPerson) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 18. 内部对策 -->
      <vxe-column
        title="短期对策"
        field="internalMeasures"
        align="center"
        width="150"
        class-name="rich-text-column"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-popover
            v-if="row.internalMeasures"
            placement="top-start"
            trigger="hover"
            width="420"
            popper-class="after-sale-rich-popover"
          >
            <RichTextDisplay
              :content="row.internalMeasures"
              max-height="320px"
              placeholder="-"
            />
            <div slot="reference" class="rich-preview-trigger">
              <span class="rich-preview-text">{{
                getHtmlPreviewText(row.internalMeasures)
              }}</span>
            </div>
          </el-popover>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 19. 外部对策 -->
      <vxe-column
        title="长期对策"
        field="externalMeasures"
        align="center"
        width="150"
        class-name="rich-text-column"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <el-popover
            v-if="row.externalMeasures"
            placement="top-start"
            trigger="hover"
            width="420"
            popper-class="after-sale-rich-popover"
          >
            <RichTextDisplay
              :content="row.externalMeasures"
              max-height="320px"
              placeholder="-"
            />
            <div slot="reference" class="rich-preview-trigger">
              <span class="rich-preview-text">{{
                getHtmlPreviewText(row.externalMeasures)
              }}</span>
            </div>
          </el-popover>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 20. 改善责任人 -->
      <vxe-column
        title="改善责任人"
        field="problemResponsiblePerson"
        align="center"
        width="80"
        :show-overflow="false"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.problemResponsiblePerson)"
            :title="getTextValue(row.problemResponsiblePerson)"
            class="text-clamp-2"
          >
            {{ getTextValue(row.problemResponsiblePerson) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>

      <!-- 21. 返回日期 -->
      <vxe-column
        title="返回日期"
        field="logistics.returnDate"
        align="center"
        width="90"
      >
        <template #default="{ row }">
          <span v-NoData="row.logistics && row.logistics.returnDate"></span>
        </template>
      </vxe-column>
      <vxe-column
        title="处理类型"
        field="processType"
        align="center"
        width="100"
        :filters="getFiltersData('processType')"
        :filter-method="filterHandler"
      >
        <template #default="{ row }">
          <span
            v-if="!Is_Empty(row.processType)"
            :title="getTextValue(row.processType)"
            class="text-clamp-2"
          >
            {{ getTextValue(row.processType) }}
          </span>
          <span v-else>-</span>
        </template>
      </vxe-column>
      <vxe-column
        title="跟踪状态"
        field="afterProblemId"
        align="center"
        width="75"
      >
        <template #default="{ row }">
          <el-tag :type="row.afterProblemId ? 'success' : 'info'">
            {{ row.afterProblemId ? "已跟踪" : "未跟踪" }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" align="center" width="120" fixed="right">
        <template #default="{ row }">
          <div class="op-actions">
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
              trigger="click"
              placement="bottom"
              @visible-change="
                (visible) => visible && (currentDropdownRow = row)
              "
              @command="handleDropdownCommand"
            >
              <span class="op-more pointer">
                ...
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-hasPermi="['third:afterSale:query']"
                  command="detail"
                  class="text-center"
                >
                  详情
                </el-dropdown-item>
                <el-dropdown-item
                  v-hasPermi="['third:afterProblem:add']"
                  command="createProblem"
                  class="text-center"
                >
                  问题跟踪
                </el-dropdown-item>
                <el-dropdown-item
                  v-hasPermi="['third:afterSale:log']"
                  command="viewLog"
                  class="text-center"
                >
                  日志
                </el-dropdown-item>
                <el-dropdown-item
                  v-hasPermi="['third:afterSale:remove']"
                  command="delete"
                  class="text-red text-center"
                >
                  删除
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="row.video"
                  command="downloadVideo"
                  class="text-center"
                >
                  视频下载
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="!Is_Empty(row.rootMatter)"
                  command="toggleStatus"
                >
                  {{ isStatusTxt(row.status) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </vxe-column>
    </VirtualTable>

    <pagination
      v-show="total > 0"
      :total="total"
      :ls="[30, 50, 100, 200]"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      style="margin:0"
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

    <!-- 问题处理弹窗 -->
    <problem-form
      ref="problemFormRef"
      :visible.sync="problemFormVisible"
      @success="handleProblemFormSuccess"
    />

    <!-- 操作日志弹窗 -->
    <oper-log-dialog
      :visible.sync="operLogVisible"
      :record-id="currentLogRecordId"
      :dict-list="dictList"
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
import RichTextDisplay from "@/components/RichTextDisplay";
import VirtualTable from "@/components/VirtualTable";
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
    ProblemForm: () =>
      import("@/views/third/afterProblem/components/ProblemForm"),
    OperLogDialog: () => import("@/components/OperLogDialog"),
    RichTextDisplay,
    VirtualTable,
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
      // 问题处理弹窗
      problemFormVisible: false,
      // 操作日志弹窗
      operLogVisible: false,
      currentLogRecordId: null,
      // 当前下拉菜单操作的行
      currentDropdownRow: null,
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
        { label: "组装厂", text: "组装厂", value: "组装厂", data: "组装厂" },
        { label: "用户", text: "用户", value: "用户", data: "用户" },
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
        l: 30,
        type: undefined,
        returnDate: undefined,
        returnEndDate: undefined, // 客诉结束日期（仅当type=3时生效）
        afterType: undefined, // 客退类型
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
          key: "afterType",
          label: "客退类型",
          component: "el-select",
          componentProps: {
            placeholder: "请选择",
            clearable: true,
            style: "width: 120px",
          },
          props: {
            options: [
              { label: "大货", value: "1" },
              { label: "样品", value: "2" },
            ],
          },
          sort: 3,
        },
        {
          key: "customerName",
          label: "客户名称",
          component: "custom",
          sort: 3,
        },
        {
          key: "confirmMajorClass",
          label: "一级问题",
          component: "custom",
          sort: 4,
        },
        {
          key: "confirmMinorClass",
          label: "二级问题",
          component: "custom",
          sort: 5,
        },

        {
          key: "parentResponsibilityPerson",
          label: "一级责任",
          component: "custom",
          sort: 7,
        },
        {
          key: "responsibilityPerson",
          label: "二级责任",
          component: "custom",
          sort: 8,
        },
        {
          key: "categoryName",
          label: "品类",
          component: "custom",
          sort: 9,
        },
        {
          key: "computerName",
          label: "仪表型号",
          component: "custom",
          sort: 10,
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
          sort: 11,
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

      const selectedMajorNormalized = normalize(
        this.queryParams.confirmMajorClass
      );
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
      const determinationDict =
        this.dict.type.responsibility_determination || [];
      const normalize = (val) =>
        val === undefined || val === null
          ? ""
          : String(val).trim().toLowerCase();

      if (!this.queryParams.parentResponsibilityPerson) {
        return [];
      }

      const selectedGroupNormalized = normalize(
        this.queryParams.parentResponsibilityPerson
      );
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
          label: item.label,
          text: item.label,
          value: item.label,
          data: item.label,
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
                return {
                  label: dictLabel,
                  text: dictLabel,
                  value: +dictValue,
                  data: +dictValue,
                };
              });
            } else {
              return Object.entries(data)
                .map(([key, value]) => {
                  return {
                    label: value,
                    text: value,
                    value: +key,
                    data: +key,
                  };
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
              label: item[key],
              text: item[key],
              value: item[key],
              data: item[key],
            });
          }
        });

        return newList.sort((a, b) => a.text - b.text);
      };
    },
  },
  watch: {
    // 监听queryParams中的日期字段，同步到dateRange（用于回显）
    "queryParams.returnDate": {
      handler(newVal) {
        if (this.queryParams.type === "3") {
          this.syncDateRange();
        }
      },
    },
    "queryParams.returnEndDate": {
      handler(newVal) {
        if (this.queryParams.type === "3") {
          this.syncDateRange();
        }
      },
    },
  },
  created() {
    let { name, afterType } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    // 处理客退类型参数
    if (afterType) {
      this.queryParams.afterType = afterType;
    }
    this.getMemberDictUser();
    this.getModelDirData();
    this.getRootClassifyData();
    this.getList();
  },
  methods: {
    // 格式化责任判定显示（一级 / 二级）
    formatResponsibility(group, determination) {
      if (!group && !determination) return "-";
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
      const records = Array.isArray(selection)
        ? selection
        : this.getSelectedRecords();
      this.multipleList = records;
      this.saleIdList = records.map((item) => item.id);
      this.uploadIds = records.map((item) => item.id);
    },
    getSelectedRecords() {
      const table = this.$refs.afterSaleRef?.getVxeTable?.();
      if (table && typeof table.getCheckboxRecords === "function") {
        return table.getCheckboxRecords();
      }
      return [];
    },
    getTextValue(value) {
      return this.Is_Empty(value) ? '-' : String(value);
    },
    getHtmlPreviewText(content) {
      if (!content) return '-';
      const div = document.createElement('div');
      div.innerHTML = content;
      const text = (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
      return text || '-';
    },
    clearSaleSelection() {
      const table = this.$refs.afterSaleRef?.getVxeTable?.();
      if (table && typeof table.clearCheckboxRow === "function") {
        table.clearCheckboxRow();
      }
      this.handleSelectionChange([]);
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
    normalizeRichTextContent(content) {
      if (content === null || content === undefined) {
        return "";
      }
      const html = String(content).trim();
      if (!html) {
        return "";
      }

      const plainText = html
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, "")
        .replace(/\s+/g, "");

      return plainText ? html : "";
    },
    // 打开问题处理弹窗（从售后记录创建问题处理）
    handleCreateProblem(row) {
      this.problemFormVisible = true;
      this.$nextTick(() => {
        // 重置表单
        this.$refs.problemFormRef.reset();
        // 等待 reset 完成后再设置数据
        this.$nextTick(() => {
          // 映射售后记录数据到问题处理表单
          // 完成时间 -> 时间点
          // 当前行问题描述 -> 问题描述
          // 当前id -> 关联业务
          // 问题来源默认客户反馈(1)
          this.$refs.problemFormRef.form.problemSource = 1; // 客户反馈
          this.$refs.problemFormRef.form.problemTime =
            row.locationHandleTime || ""; // 完成时间 -> 时间点
          this.$refs.problemFormRef.form.problemDescription =
            this.normalizeRichTextContent(row.problemDescription);
          this.$refs.problemFormRef.form.businessIdList = row.id
            ? [row.id]
            : []; // 当前id -> 关联业务
          // 保存来源SN用于显示
          this.$refs.problemFormRef.form.problemSourceSn = row.sn || "";
          // 根据大货类型设置问题管理员：大货->余美君，样品->袁祥
          this.$refs.problemFormRef.form.problemManager =
            row.afterType === 1 ? "余美君" : "袁祥";
          console.log(
            "设置后的 businessIdList:",
            this.$refs.problemFormRef.form.businessIdList
          );
        });
      });
    },
    // 问题处理表单提交成功
    handleProblemFormSuccess() {},
    // 处理下拉菜单命令
    handleDropdownCommand(command) {
      const row = this.currentDropdownRow;
      if (!row) return;
      switch (command) {
        case "detail":
          this.handleDetail(row);
          break;
        case "createProblem":
          this.handleCreateProblem(row);
          break;
        case "viewLog":
          this.handleViewLog(row);
          break;
        case "delete":
          this.handleDelete(row);
          break;
        case "downloadVideo":
          this.urlDownload(row.video);
          break;
        case "toggleStatus":
          this.handleClose(row);
          break;
      }
    },
    // 查看日志
    handleViewLog(row) {
      this.currentLogRecordId = row.id;
      this.operLogVisible = true;
    },
    // 详情
    handleDetail(row) {
      this.isAfterDetailDia = true;
      this.$refs.isAfterDetailRef.getAfterInfo(row.id, row);
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
        l: 30,
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
    getColumnLabel(column) {
      return column?.title || column?.label || column?.own?.title || "";
    },
    // 点击行打开详情
    handleRowClick(row, column, event) {
      if (row && row.row) {
        event = row.$event;
        column = row.column;
        row = row.row;
      }
      if (column?.type === "checkbox" || column?.own?.type === "checkbox") {
        return;
      }
      // 排除特殊列的点击（这些列有自己的点击逻辑）
      const excludeColumns = ["操作", "产品SN", "处理进展"];
      const label = this.getColumnLabel(column);
      if (label && excludeColumns.includes(label)) {
        return;
      }
      // 打开详情弹窗
      this.handleDetail(row);
    },

    cellClick(row, column, cell, event) {
      if (row && row.row) {
        event = row.$event;
        column = row.column;
        row = row.row;
      }
      const label = this.getColumnLabel(column);
      switch (label) {
        case "处理进展":
          this.seeDealProgress(row);
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      const label = this.getColumnLabel(column);
      // 特殊列显示手型光标
      if (label === "产品SN" || label === "处理进展") {
        return `cursor: pointer;`;
      }
      // 其他列显示默认光标（行点击）
      if (label && label !== "操作") {
        return `cursor: pointer;`;
      }
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.afterProblemId) {
        return "tracked-problem-row";
      }
      if (row.isProgressBoard === 1) {
        return "progress-board-row";
      }
      return "";
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
    /** 全部导出按钮操作 */
    handleExportAll() {
      if (this.total === 0) return this.msgError("没有可导出的数据");
      this.$confirm(`是否确认全部导出共 ${this.total} 条数据项?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const dataInfo = {
            ...this.queryParams,
            p: 1,
            l: this.total,
            my: this.isWaitDispose ? "" : this.nickName,
          };
          const loading = this.$loading({
            lock: true,
            text: "正在获取全部数据...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          afterList(dataInfo)
            .then((res) => {
              loading.close();
              const list = res.data.list || [];
              const ids = list.map((item) => item.id);
              if (!ids.length) {
                return this.msgError("没有查询到数据");
              }
              this.downloadFile({
                aFn: afterMultipleDownload,
                queryParams: ids,
              });
            })
            .catch(() => {
              loading.close();
            });
        })
        .catch(() => {});
    },
    /** 每项筛选方法 */
    filterHandler(value, row, column) {
      if (arguments.length === 1 && value && value.option) {
        const { option, row: currentRow, column: currentColumn } = value;
        const property = currentColumn.property || currentColumn.field;
        const filterValue =
          option.data !== undefined ? option.data : option.value;
        return currentRow[property] == filterValue;
      }
      const property = column["property"] || column["field"];
      return row[property] == value;
    },
    /** 清除所有过滤器  */
    clearFilter() {
      if (this.$refs.afterSaleRef?.clearAllFilters) {
        this.$refs.afterSaleRef.clearAllFilters();
        return;
      }
      const table = this.$refs.afterSaleRef?.getVxeTable?.();
      if (table && typeof table.clearFilter === "function") {
        table.clearFilter();
      }
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

.op-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  /deep/ .el-button.el-button--text,
  /deep/ .el-button.el-button--text.el-button--mini {
    margin-left: 0 !important;
    padding: 0 !important;
    min-height: auto;
    line-height: 1.2;
  }
}

.op-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  font-size: 14px;
  line-height: 1;
  color: #67c23a;
}

.rich-preview-trigger {
  display: block;
  width: 100%;
  cursor: pointer;
}

.text-clamp-2,
.rich-preview-text {
  display: block;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
  word-break: break-word;
  line-height: 20px;
  text-align: left;
  max-height: 40px;
}

.text-link-clamp {
  text-align: left;
  font-size: inherit;
  font-weight: 400;
  color: inherit;

  /deep/ span {
    display: inherit;
    width: 100%;
    overflow: inherit;
    -webkit-box-orient: inherit;
    -webkit-line-clamp: inherit;
    white-space: inherit;
    word-break: inherit;
    line-height: inherit;
    max-height: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
  }
}

.text-clamp-center {
  text-align: center;
}

.text-link-clamp.text-clamp-center {
  text-align: center;
}

.afterSaleBox {
  /deep/ .text-link-clamp.el-link,
  /deep/ .text-link-clamp.el-link--default {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
    text-decoration: none;
  }

  /deep/ .text-link-clamp .el-link--inner {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
  }
}

// 修复固定列遮挡滚动条的问题
.afterSaleBox {
  /deep/ .vxe-header--column {
    background-color: #cfd8e6 !important;
    color: #4a5568;
    font-weight: 600;
  }

  /deep/ .vxe-table--body .vxe-body--row,
  /deep/ .vxe-table--fixed-left-body-wrapper .vxe-body--row,
  /deep/ .vxe-table--fixed-right-body-wrapper .vxe-body--row {
    height: 56px !important;
  }

  /deep/ .vxe-body--column {
    height: 56px !important;
    vertical-align: middle;
  }

  /deep/ .vxe-body--row.tracked-problem-row .vxe-body--column,
  /deep/ .vxe-body--row.progress-board-row .vxe-body--column,
  /deep/ .vxe-table--fixed-left-wrapper
    .vxe-body--row.tracked-problem-row
    .vxe-body--column,
  /deep/ .vxe-table--fixed-right-wrapper
    .vxe-body--row.tracked-problem-row
    .vxe-body--column,
  /deep/ .vxe-table--fixed-left-wrapper
    .vxe-body--row.progress-board-row
    .vxe-body--column,
  /deep/ .vxe-table--fixed-right-wrapper
    .vxe-body--row.progress-board-row
    .vxe-body--column {
    background-color: #f0f9eb !important;
  }

  /deep/ .vxe-cell {
    line-height: 1.5;
    max-height: none !important;
    height: 56px !important;
    white-space: normal;
    overflow: hidden;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  /deep/ .vxe-body--column.rich-text-column {
    vertical-align: top;
  }

  /deep/ .vxe-body--column.rich-text-column .vxe-cell {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  /deep/ .vxe-body--column {
    .cell,
    .vxe-cell {
      overflow: hidden;
    }
  }

  /deep/ .vxe-body--column .el-button {
    margin-left: 0 !important;
  }

  /deep/ .vxe-table--body-wrapper,
  /deep/ .vxe-table--fixed-left-body-wrapper,
  /deep/ .vxe-table--fixed-right-body-wrapper {
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

/deep/ .after-sale-rich-popover {
  max-width: 460px;

  .rich-text-content {
    max-height: 320px;
    overflow-y: auto;
    white-space: normal;
    word-break: break-word;
  }
}

// 售后统计报表弹窗样式
.report-dialog {
  /deep/ .el-dialog {
    margin: 0 auto;
    border-radius: 8px;

    .el-dialog__header {
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-dialog__body {
      padding: 0;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }
  }
}
</style>
