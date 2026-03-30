<template>
  <div class="app-container">
    <!-- 智能搜索表单 -->
    <IntelligentSearchForm
      :searchForm="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      :defaultVisibleCount="4"
      :maxVisibleCount="6"
      @reset="resetQuery"
    >
      <!-- 自定义字段：时间点范围 -->
      <template #field-problemTime="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px"
          /> 
        </el-form-item>
      </template>

      <!-- 自定义字段：责任人 -->
      <template #field-responsiblePerson="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <TypedSelectLoadMore
            v-model="searchForm[field.key]"
            type="user"
            :return-label="true"
            placeholder="请选择责任人"
            clearable
            :custom-style="{ width: '200px' }"
            @change="handleQuery"
          />
        </el-form-item>
      </template>

      <!-- 操作按钮区域 -->
      <template #page-actions>
        <el-button
          v-hasPermi="['third:afterProblem:add']"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 虚拟表格 -->
    <VirtualAfterProblemTable
      ref="afterProblemTable"
      :data="problemList"
      :loading="loading"
      :height="tableHeight(60)"
      :problem-source-filters="problemSourceFilters"
      :problem-manager-filters="problemManagerFilters"
      @detail="handleDetail"
      @module-edit="handleModuleEdit"
      @view-business-records="handleViewBusinessRecords"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
    />

    <div v-show="total > 0" class="after-problem-pagination">
      <pagination
        :total="total"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <problem-form
      ref="problemFormRef"
      :visible.sync="formVisible"
      @success="getList"
    />

    <!-- 详情对话框 -->
    <problem-detail ref="problemDetailRef" :visible.sync="detailVisible" />

    <!-- 模块编辑对话框（复用 ProblemForm） -->
    <problem-form
      ref="moduleFormRef"
      :visible.sync="moduleEditorVisible"
      :module-type="currentModuleType"
      @success="getList"
    />

    <!-- 售后记录查看器 -->
    <after-sale-record-selector
      :visible.sync="afterSaleDialogVisible"
      :selected-ids="currentBusinessIds"
      :after-problem-id="currentProblemId"
      :view-only="true"
    />

    <!-- 生产记录查看器 -->
    <production-record-selector
      :visible.sync="productionDialogVisible"
      :selected-ids="currentBusinessIds"
      :after-problem-id="currentProblemId"
      :view-only="true"
    />

    <!-- 品质记录查看器 -->
    <quality-record-selector
      :visible.sync="qualityDialogVisible"
      :selected-ids="currentBusinessIds"
      :after-problem-id="currentProblemId"
      :view-only="true"
    />

    <!-- 操作日志对话框 -->
    <oper-log-dialog
      :visible.sync="operLogVisible"
      :record-id="currentRecordId"
    />

    <!-- 修改责任人弹窗 -->
    <el-dialog
      :title="getResponsibleDialogTitle"
      :visible.sync="editResponsibleVisible"
      width="400px"
      append-to-body
      top='0vh'
      :close-on-click-modal="false"
      class="dialog-scroll"
    >
      <el-form label-width="80px">
        <el-form-item label="责任人">
          <TypedSelectLoadMore
            v-model="editResponsibleValue"
            type="user"
            :return-label="true"
            placeholder="请选择责任人"
            clearable
            :custom-style="{ width: '100%' }"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editResponsibleVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveResponsible">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改所有责任人弹窗 -->
    <el-dialog
      title="修改责任人"
      :visible.sync="changeAllResponsibleVisible"
      width="500px"
      append-to-body
      top='0vh'
      :close-on-click-modal="false"
      class="dialog-scroll"
    >
      <el-form label-width="140px">
        <el-form-item label="分析责任人">
          <TypedSelectLoadMore
            v-model="changeAllResponsibleForm.analysisResponsible"
            type="user"
            :return-label="true"
            placeholder="请选择分析责任人"
            clearable
            :custom-style="{ width: '100%' }"
          />
        </el-form-item>
        <el-form-item label="对策责任人">
          <TypedSelectLoadMore
            v-model="changeAllResponsibleForm.countermeasureResponsible"
            type="user"
            :return-label="true"
            placeholder="请选择对策责任人"
            clearable
            :custom-style="{ width: '100%' }"
          />
        </el-form-item>
        <el-form-item label="改善跟踪责任人">
          <TypedSelectLoadMore
            v-model="changeAllResponsibleForm.responsiblePerson"
            type="user"
            :return-label="true"
            placeholder="请选择改善跟踪责任人"
            clearable
            :custom-style="{ width: '100%' }"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="changeAllResponsibleVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveAllResponsible">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { afterProblemList, afterProblemDelete, afterProblemUpdate } from "@/api/third/afterProblem";
import { checkPermi } from "@/utils/permission";
import ProblemForm from "./components/ProblemForm";
import ProblemDetail from "./components/ProblemDetail";
import AfterSaleRecordSelector from "./components/AfterSaleRecordSelector";
import ProductionRecordSelector from "./components/ProductionRecordSelector";
import QualityRecordSelector from "./components/QualityRecordSelector";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";
import OperLogDialog from "@/components/OperLogDialog";
import VirtualAfterProblemTable from "./components/VirtualAfterProblemTable";
import digiSmartJumpMixin from "@/mixins/digiSmartJump";
export default {
  name: "AfterProblem",
  components: {
    ProblemForm,
    ProblemDetail,
    AfterSaleRecordSelector,
    ProductionRecordSelector,
    QualityRecordSelector,
    TypedSelectLoadMore,
    OperLogDialog,
    VirtualAfterProblemTable,
  },
  mixins: [digiSmartJumpMixin],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 问题处理列表
      problemList: [],
      // 日期范围
      dateRange: [],
      // 表单对话框
      formVisible: false,
      // 详情对话框
      detailVisible: false,
      // 模块编辑对话框
      moduleEditorVisible: false,
      currentModuleType: "problem",
      // 业务记录选择器
      afterSaleDialogVisible: false,
      productionDialogVisible: false,
      qualityDialogVisible: false,
      // 当前查看的记录IDs
      currentBusinessIds: [],
      // 当前问题处理记录ID
      currentProblemId: null,
      // 操作日志对话框
      operLogVisible: false,
      // 当前查看日志的记录ID
      currentRecordId: null,
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        problemSource: undefined,
        problemDescription: undefined,
        responsiblePerson: undefined,
        startTime: undefined,
        endTime: undefined,
      },
      // 搜索字段配置
      searchFields: [
        {
          key: "problemSource",
          label: "问题来源",
          component: "el-select",
          componentProps: {
            placeholder: "请选择问题来源",
            clearable: true,
            style: "width: 200px",
          },
          props: {
            options: [
              { label: "客户反馈", value: 1 },
              { label: "生产反馈", value: 2 },
              { label: "品质反馈", value: 3 },
            ],
          },
          sort: 1,
        },
        {
          key: "problemDescription",
          label: "问题描述",
          component: "el-input",
          componentProps: {
            placeholder: "请输入问题描述",
            clearable: true,
            style: "width: 200px",
          },
          sort: 2,
        },
        {
          key: "responsiblePerson",
          label: "责任人",
          component: "custom",
          sort: 3,
        },
        {
          key: "problemTime",
          label: "时间点",
          component: "custom",
          sort: 4,
        },
      ],
      // 修改责任人弹窗
      editResponsibleVisible: false,
      editResponsibleType: '', // problemManager, analysisResponsible, countermeasureResponsible, responsiblePerson
      editResponsibleRow: null,
      editResponsibleValue: '',
      // 修改所有责任人弹窗
      changeAllResponsibleVisible: false,
      changeAllResponsibleRow: null,
      changeAllResponsibleForm: {
        analysisResponsible: '',
        countermeasureResponsible: '',
        responsiblePerson: ''
      }
    };
  },
  computed: {
    ...mapGetters(["nickName"]),
    // 修改责任人弹窗标题
    getResponsibleDialogTitle() {
      const titleMap = {
        problemManager: '修改问追踪人',
        analysisResponsible: '修改分析责任人',
        countermeasureResponsible: '修改对策责任人',
        responsiblePerson: '修改改善跟踪责任人'
      };
      return titleMap[this.editResponsibleType] || '修改责任人';
    },
    // 问题来源筛选器
    problemSourceFilters() {
      return [
        { label: "客户反馈", value: 1 },
        { label: "生产反馈", value: 2 },
        { label: "品质反馈", value: 3 },
      ];
    },
    // 问题追踪人筛选器（从数据中提取）
    problemManagerFilters() {
      if (!this.problemList || this.problemList.length === 0) return [];
      
      const managers = new Set();
      this.problemList.forEach(item => {
        if (item.problemManager) {
          managers.add(item.problemManager);
        }
      });
      
      return Array.from(managers).map(name => ({
        label: name,
        value: name
      }));
    },
  },
  created() {
    this.getList();
  },
  methods: {
    checkPermi,

    /** 查询列表 */
    getList() {
      this.loading = true;

      // 处理日期范围
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.startTime = undefined;
        this.queryParams.endTime = undefined;
      }

      afterProblemList(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.problemList = list || [];
          this.total = total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        p: 1,
        l: 50,
        problemSource: undefined,
        problemDescription: undefined,
        responsiblePerson: undefined,
        startTime: undefined,
        endTime: undefined,
      };
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.problemFormRef.reset();
      });
    },

    /** 编辑按钮操作（全部编辑） */
    handleUpdate(row) {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.problemFormRef.setFormData(row);
      });
    },

    /** 模块编辑操作 */
    handleModuleEdit(moduleType, row) {
      if (moduleType === "log") {
        // 关闭操作
        this.handleOperLog(row);
      } else if (moduleType === "delete") {
        // 删除操作
        this.handleDelete(row);
      } else if (moduleType === "changeResponsible") {
        // 修改责任人
        this.handleChangeAllResponsible(row);
      } else if (moduleType === "all") {
        // 全部编辑，打开完整表单
        this.handleUpdate(row);
      } else {
        // 单独模块编辑，复用 ProblemForm
        this.currentModuleType = moduleType;
        this.moduleEditorVisible = true;
        this.$nextTick(() => {
          this.$refs.moduleFormRef.setFormData(row);
        });
      }
    },

    /** 详情按钮操作 */
    handleDetail(row) {
      this.detailVisible = true;
      this.$nextTick(() => {
        this.$refs.problemDetailRef.open(row);
      });
    },

	    /** 获取问题来源文本 */
	    getProblemSourceText(source) {
	      const sourceMap = {
	        1: "客户反馈",
	        2: "生产反馈",
	        3: "品质反馈",
	        1: "客户反馈",
	        2: "生产反馈",
	        3: "品质反馈",
	      };
	      return sourceMap[source] || source || "-";
	    },

	    /** 效果确认显示文本 */
	    getEffectivenessConfirmationText(value) {
	      if (value === null || value === undefined || value === "") return "-";
	      const text = String(value).trim();
	      const upper = text.toUpperCase();
	      if (upper === "NG") return "NG";
	      if (upper === "PASS") return "PASS";
	      return text;
	    },

	    /** 效果确认颜色（NG 红 / PASS 绿） */
	    getEffectivenessConfirmationClass(value) {
	      if (value === null || value === undefined || value === "") return "";
	      const upper = String(value).trim().toUpperCase();
	      if (upper === "NG") return "text-red";
	      if (upper === "PASS") return "text-green";
	      return "";
	    },
	
	    /** 获取业务记录链接文本 */
	    getBusinessLinkText(source) {
	      const linkMap = {
	        1: "查看售后记录",
        2: "查看制程记录",
        3: "查看来料记录",
        1: "查看售后记录",
        2: "查看制程记录",
        3: "查看来料记录",
      };
      return linkMap[source] || "查看记录";
    },

    /** 查看业务记录 */
    handleViewBusinessRecords(row) {
      // 处理 businessIds （可能是字符串或数组）
      let businessIds = [];
      if (row.businessIds) {
        if (typeof row.businessIds === "string") {
          businessIds = row.businessIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
        } else if (Array.isArray(row.businessIds)) {
          businessIds = row.businessIds;
        }
      } else if (row.businessIdList && Array.isArray(row.businessIdList)) {
        businessIds = row.businessIdList;
      }

      this.currentBusinessIds = businessIds;
      // 保存当前问题处理记录ID
      this.currentProblemId = row.id;

      // 根据问题来源打开对应的对话框
      const source = String(row.problemSource);
      if (source === "1") {
        this.afterSaleDialogVisible = true;
      } else if (source === "2") {
        this.productionDialogVisible = true;
      } else if (source === "3") {
        this.qualityDialogVisible = true;
      }
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        `是否确认删除问题来源为"${row.problemSource}"的数据项?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return afterProblemDelete(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    /** 操作日志按钮操作 */
    handleOperLog(row) {
      this.currentRecordId = row.id;
      this.operLogVisible = true;
    },

    /** 打开修改责任人弹窗 */
    handleEditResponsible(row, type) {
      this.editResponsibleRow = row;
      this.editResponsibleType = type;
      this.editResponsibleValue = row[type] || '';
      this.editResponsibleVisible = true;
    },

    /** 保存修改责任人 */
    handleSaveResponsible() {
      if (!this.editResponsibleValue) {
        this.msgWarning('请选择责任人');
        return;
      }
      const submitData = {
        id: this.editResponsibleRow.id,
        [this.editResponsibleType]: this.editResponsibleValue
      };
      afterProblemUpdate(submitData).then(res => {
        if (res.code === 200) {
          this.msgSuccess('修改成功');
          this.editResponsibleVisible = false;
          this.getList();
        }
      });
    },

    /** 修改所有责任人（从操作栏触发） */
    handleChangeAllResponsible(row) {
      this.changeAllResponsibleVisible = true;
      this.changeAllResponsibleRow = row;
      // 初始化当前值
      this.changeAllResponsibleForm = {
        analysisResponsible: row.analysisResponsible || '',
        countermeasureResponsible: row.countermeasureResponsible || '',
        responsiblePerson: row.responsiblePerson || ''
      };
    },

    /** 保存所有责任人修改 */
    handleSaveAllResponsible() {
      const submitData = {
        id: this.changeAllResponsibleRow.id,
        analysisResponsible: this.changeAllResponsibleForm.analysisResponsible,
        countermeasureResponsible: this.changeAllResponsibleForm.countermeasureResponsible,
        responsiblePerson: this.changeAllResponsibleForm.responsiblePerson
      };
      
      afterProblemUpdate(submitData).then(res => {
        if (res.code === 200) {
          this.msgSuccess('修改成功');
          this.changeAllResponsibleVisible = false;
          this.getList();
        }
      });
    },

    /** 处理表格筛选变化 */
    handleFilterChange(params) {
      console.log('筛选变化:', params);
      // 虚拟表格内部已处理筛选，无需额外操作
    },

    /** 处理表格排序变化 */
    handleSortChange(params) {
      console.log('排序变化:', params);
      // TODO: 如需服务端排序，可在此处理
    }
  }
}
       
</script>

<style lang="scss" scoped>
.text-blue {
  color: #409eff;
}

.text-green {
  color: #67c23a;
}

.text-red {
  color: #f56c6c;
}

.after-problem-pagination {
  position: fixed;
  right: 20px;
  bottom: 25px;
  z-index: 100;
  display: inline-flex;
  align-items: center;
}

.after-problem-pagination :deep(.pagination-container) {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: inline-flex;
  align-items: center;
}
</style>
