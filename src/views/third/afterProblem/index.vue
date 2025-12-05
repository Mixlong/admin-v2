<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="问题来源" prop="problemSource">
        <el-input
          v-model="queryParams.problemSource"
          placeholder="请输入问题来源"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题描述" prop="problemDescription">
        <el-input
          v-model="queryParams.problemDescription"
          placeholder="请输入问题描述"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="责任人" prop="responsiblePerson">
        <el-input
          v-model="queryParams.responsiblePerson"
          placeholder="请输入责任人"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间点" prop="problemTime">
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="problemList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" type="index" width="60" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="问题来源"
        prop="problemSource"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="问题描述"
        prop="problemDescription"
        align="center"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="时间点"
        prop="problemTime"
        align="center"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.problemTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="责任人"
        prop="responsiblePerson"
        align="center"
        width="120"
      />
      <el-table-column
        label="影响面"
        prop="impactScope"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="分析结果"
        prop="analysisResult"
        align="center"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="完成时间"
        prop="completionTime"
        align="center"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.completionTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            class="text-blue"
            type="text"
            size="small"
            @click="handleDetail(row)"
          >
            详情
          </el-button>
          <el-button
            class="text-green"
            type="text"
            size="small"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
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
  </div>
</template>

<script>
import {
  afterProblemList,
  afterProblemDelete
} from "@/api/third/afterProblem";
import ProblemForm from "./components/ProblemForm";
import ProblemDetail from "./components/ProblemDetail";

export default {
  name: "AfterProblem",
  components: {
    ProblemForm,
    ProblemDetail
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        problemSource: undefined,
        problemDescription: undefined,
        responsiblePerson: undefined,
        startTime: undefined,
        endTime: undefined
      }
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
      this.resetForm("queryForm");
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
        this.$refs.problemDetailRef.open(row.id);
      });
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
</style>
