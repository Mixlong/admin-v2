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

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="problemList"
      :height="tableHeight()"
      border
    >
      <!-- 序号列 -->
      <el-table-column label="序号" type="index" width="60" align="center" fixed>
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>

      <!-- 一级表头：问题点 -->
      <el-table-column label="问题点" align="center" header-align="center" class-name="group-problem">
        <el-table-column
          label="问题来源"
          prop="problemSource"
          align="center"
          width="110"
          show-overflow-tooltip
          class-name="col-problem"
        >
          <template slot-scope="{ row }">
            {{ getProblemSourceText(row.problemSource) }}
          </template>
        </el-table-column>
        <el-table-column
          label="时间点"
          prop="problemTime"
          align="center"
          width="150"
          class-name="col-problem"
        >
          <template slot-scope="{ row }">
            {{ parseTime(row.problemTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="问题描述"
          prop="problemDescription"
          align="center"
          min-width="200"
          class-name="col-problem"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.problemDescription"></div>
            <el-link 
              v-if="row.businessIds || row.businessIdList"
              type="primary" 
              :underline="false"
              @click="handleViewBusinessRecords(row)"
              style="margin-top: 5px; font-size: 12px;"
            >
              {{ getBusinessLinkText(row.problemSource) }}
            </el-link>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 一级表头：迪太研发&品质 -->
      <el-table-column label="迪太研发&品质" align="center" header-align="center" class-name="group-research">
        <el-table-column
          label="问题分析（过程）"
          prop="problemAnalysis"
          align="center"
          min-width="180"
          show-overflow-tooltip
          class-name="col-research"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.problemAnalysis"></div>
          </template>
        </el-table-column>
        <el-table-column
          label="分析结果"
          prop="analysisResult"
          align="center"
          min-width="180"
          show-overflow-tooltip
          class-name="col-research"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.analysisResult"></div>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 一级表头：对策 -->
      <el-table-column label="对策" align="center" header-align="center" class-name="group-solution">
        <el-table-column
          label="影响面"
          prop="impactScope"
          align="center"
          min-width="150"
          show-overflow-tooltip
          class-name="col-solution"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.impactScope"></div>
          </template>
        </el-table-column>
        <el-table-column
          label="短期对策"
          prop="internalMeasures"
          align="center"
          min-width="150"
          show-overflow-tooltip
          class-name="col-solution"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.internalMeasures"></div>
          </template>
        </el-table-column>
        <el-table-column
          label="长期对策"
          prop="externalMeasures"
          align="center"
          min-width="150"
          show-overflow-tooltip
          class-name="col-solution"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.externalMeasures"></div>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 一级表头：改善跟踪 -->
      <el-table-column label="改善跟踪" align="center" header-align="center" class-name="group-tracking">
        <el-table-column
          label="责任人"
          prop="responsiblePerson"
          align="center"
          width="90"
          class-name="col-tracking"
        />
        <el-table-column
          label="完成时间"
          prop="completionTime"
          align="center"
          width="160"
          class-name="col-tracking"
        >
          <template slot-scope="{ row }">
            {{ parseTime(row.completionTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="效果确认"
          prop="effectivenessConfirmation"
          align="center"
          min-width="150"
          show-overflow-tooltip
          class-name="col-tracking"
        >
          <template slot-scope="{ row }">
            <div class="html-content" v-html="row.effectivenessConfirmation"></div>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" align="center" width="140" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            v-hasPermi="['third:afterProblem:query']"
            class="text-green"
            type="text"
            size="small"
            @click="handleDetail(row)"
          >
            详情
          </el-button>
          <el-button
            v-hasPermi="['third:afterProblem:edit']"
            type="text"
            size="small"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['third:afterProblem:remove']"
            class="text-red"
            type="text"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <problem-form
      ref="problemFormRef"
      :visible.sync="formVisible"
      @success="getList"
    />

    <!-- 详情对话框 -->
    <problem-detail
      ref="problemDetailRef"
      :visible.sync="detailVisible"
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
  </div>
</template>

<script>
import {
  afterProblemList,
  afterProblemDelete
} from "@/api/third/afterProblem";
import ProblemForm from "./components/ProblemForm";
import ProblemDetail from "./components/ProblemDetail";
import AfterSaleRecordSelector from "./components/AfterSaleRecordSelector";
import ProductionRecordSelector from "./components/ProductionRecordSelector";
import QualityRecordSelector from "./components/QualityRecordSelector";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";

export default {
  name: "AfterProblem",
  components: {
    ProblemForm,
    ProblemDetail,
    AfterSaleRecordSelector,
    ProductionRecordSelector,
    QualityRecordSelector,
    TypedSelectLoadMore
  },
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
      // 业务记录选择器
      afterSaleDialogVisible: false,
      productionDialogVisible: false,
      qualityDialogVisible: false,
      // 当前查看的记录IDs
      currentBusinessIds: [],
      // 当前问题处理记录ID
      currentProblemId: null,
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        problemSource: undefined,
        problemDescription: undefined,
        responsiblePerson: undefined,
        startTime: undefined,
        endTime: undefined
      },
      // 搜索字段配置
      searchFields: [
        {
          key: 'problemSource',
          label: '问题来源',
          component: 'el-select',
          componentProps: {
            placeholder: '请选择问题来源',
            clearable: true,
            style: 'width: 200px'
          },
          props:{
                 options: [
            { label: '客户反馈', value: 1 },
            { label: '生产反馈', value: 2 },
            { label: '品质反馈', value: 3 }
          ],
          },
          sort: 1
        },
        {
          key: 'problemDescription',
          label: '问题描述',
          component: 'el-input',
          componentProps: {
            placeholder: '请输入问题描述',
            clearable: true,
            style: 'width: 200px'
          },
          sort: 2
        },
        {
          key: 'responsiblePerson',
          label: '责任人',
          component: 'custom',
          sort: 3
        },
        {
          key: 'problemTime',
          label: '时间点',
          component: 'custom',
          sort: 4
        }
      ]
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
        l: 20,
        problemSource: undefined,
        problemDescription: undefined,
        responsiblePerson: undefined,
        startTime: undefined,
        endTime: undefined
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
    
    /** 编辑按钮操作 */
    handleUpdate(row) {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.problemFormRef.setFormData(row);
      });
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
        '1': '客户反馈',
        '2': '生产反馈',
        '3': '品质反馈',
        1: '客户反馈',
        2: '生产反馈',
        3: '品质反馈'
      };
      return sourceMap[source] || source || '-';
    },

    /** 获取业务记录链接文本 */
    getBusinessLinkText(source) {
      const linkMap = {
        '1': '查看售后记录',
        '2': '查看制程记录',
        '3': '查看来料记录',
        1: '查看售后记录',
        2: '查看制程记录',
        3: '查看来料记录'
      };
      return linkMap[source] || '查看记录';
    },

    /** 查看业务记录 */
    handleViewBusinessRecords(row) {
      // 处理 businessIds （可能是字符串或数组）
      let businessIds = [];
      if (row.businessIds) {
        if (typeof row.businessIds === 'string') {
          businessIds = row.businessIds.split(',').map(id => id.trim()).filter(Boolean);
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
      if (source === '1') {
        this.afterSaleDialogVisible = true;
      } else if (source === '2') {
        this.productionDialogVisible = true;
      } else if (source === '3') {
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
          type: "warning"
        }
      )
        .then(() => {
          return afterProblemDelete(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    }
  }
};
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

// 富文本内容显示样式
.html-content {
  text-align: left;
  word-break: break-word;
  line-height: 1.5;
  
  // 限制显示行数
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  
  // 清除富文本编辑器的默认样式
  ::v-deep p {
    margin: 0;
    padding: 0;
  }
  
  ::v-deep ul, ::v-deep ol {
    margin: 0;
    padding-left: 20px;
  }
}

// 表格样式优化
::v-deep .el-table {
  // 一级表头样式
  .el-table__header-wrapper {
    .el-table__header {
      thead {
        tr:first-child {
          th {
            font-weight: 600;
            font-size: 14px;
            color: #303133;
            
            // 默认背景色
            background-color: #f0f2f5;
            
            // 问题点 - 蓝色系
            &.group-problem {
              background-color: #e3f2fd;
              color: #1976d2;
            }
            
            // 迪太研发&品质 - 绿色系
            &.group-research {
              background-color: #e8f5e9;
              color: #388e3c;
            }
            
            // 对策 - 橙色系
            &.group-solution {
              background-color: #fff3e0;
              color: #f57c00;
            }
            
            // 改善跟踪 - 紫色系
            &.group-tracking {
              background-color: #f3e5f5;
              color: #7b1fa2;
            }
          }
        }
        
        tr:last-child {
          th {
            font-weight: 500;
            font-size: 13px;
            
            // 默认背景色
            background-color: #fafafa;
            
            // 问题点二级表头 - 浅蓝色
            &.col-problem {
              background-color: #f1f8ff;
            }
            
            // 迪太研发&品质二级表头 - 浅绿色
            &.col-research {
              background-color: #f4faf4;
            }
            
            // 对策二级表头 - 浅橙色
            &.col-solution {
              background-color: #fff9f0;
            }
            
            // 改善跟踪二级表头 - 浅紫色
            &.col-tracking {
              background-color: #faf5fb;
            }
          }
        }
      }
    }
  }
  
  // 表格内容行样式
  .el-table__body-wrapper {
    .el-table__body {
      tbody {
        tr {
          td {
            // 问题点列 - 浅蓝色背景
            &.col-problem {
              background-color: #fafcff;
            }
            
            // 迪太研发&品质列 - 浅绿色背景
            &.col-research {
              background-color: #fafdfb;
            }
            
            // 对策列 - 浅橙色背景
            &.col-solution {
              background-color: #fffdfb;
            }
            
            // 改善跟踪列 - 浅紫色背景
            &.col-tracking {
              background-color: #fdfafd;
            }
          }
          
          // 鼠标悬停时保持颜色区分
          &:hover {
            td.col-problem {
              background-color: #f0f7ff !important;
            }
            
            td.col-research {
              background-color: #f0f9f0 !important;
            }
            
            td.col-solution {
              background-color: #fff8f0 !important;
            }
            
            td.col-tracking {
              background-color: #f8f0f8 !important;
            }
          }
        }
      }
    }
  }
}
</style>
