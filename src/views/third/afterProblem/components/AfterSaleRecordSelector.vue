<template>
  <el-dialog
    :title="viewOnly ? '查看售后记录' : '选择售后记录'"
    :visible.sync="dialogVisible"
    width="1200px"
    append-to-body
    top="0vh"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 搜索区域 -->
    <div class="dialog-search-area">
      <el-form :inline="true" :model="searchForm" size="small">
        <el-form-item label="客户名称" label-width="80px">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="产品SN" label-width="70px">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入产品SN"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="客诉日期" label-width="80px">
          <el-date-picker
            v-model="searchForm.returnDate"
            type="date"
            placeholder="请选择日期"
            clearable
            value-format="yyyy-MM-dd"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="问题状态" label-width="80px">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            style="width: 100px"
          >
            <el-option label="OPEN" :value="0" />
            <el-option label="CLOSE" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" size="small" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 已选择的记录 -->
    <div v-if="!viewOnly && selectedRecords.length > 0" class="selected-tags-area">
      <div class="selected-header">已选择: {{ selectedRecords.length }} 条</div>
      <!-- <div class="tags-container">
        <el-tag
          v-for="record in selectedRecords"
          :key="record.id"
          closable
          type="primary"
          size="small"
          @close="handleRemoveTag(record)"
        >
          {{ record.id }}
        </el-tag>
      </div> -->
    </div>

    <!-- 表格区域 -->
    <div class="dialog-table-area">
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        height="400px"
        border
        row-key="id"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
          align="center"
        />
        <el-table-column
          label="产品SN"
          prop="sn"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="客户名称"
          prop="customerName"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="客诉日期"
          prop="returnDate"
          width="110"
          align="center"
        />
        <el-table-column
          label="问题状态"
          prop="status"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }">
            <el-tag v-if="row.status === 0" type="danger" size="small">OPEN</el-tag>
            <el-tag v-else type="success" size="small">CLOSE</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="客退类型"
          prop="afterType"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }">
            <el-tag v-if="row.afterType === 1" type="primary" size="small">大货</el-tag>
            <el-tag v-else-if="row.afterType === 2" type="warning" size="small">样品</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="产品型号"
          prop="computerName"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="!viewOnly"
          label="操作"
          width="80"
          align="center"
          fixed="right"
        >
          <template slot-scope="{ row }">
            <el-button
              v-if="!isSelected(row)"
              type="text"
              size="small"
              @click="handleAdd(row)"
            >
              添加
            </el-button>
            <el-button
              v-else
              type="text"
              size="small"
              style="color: #f56c6c"
              @click="handleRemove(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > 0"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 10px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
      <el-button v-if="!viewOnly" type="primary" @click="handleConfirm">
        确定（已选 {{ selectedRecords.length }} 条）
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { afterList } from "@/api/third/sale";

export default {
  name: "AfterSaleRecordSelector",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedIds: {
      type: Array,
      default: () => []
    },
    viewOnly: {
      type: Boolean,
      default: false
    },
    afterProblemId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchForm: {
        sn: "",
        customerName: "",
        returnDate: "",
        status: ""
      },
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      selectedRecords: []
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initSelectedRecords();
        this.loadData();
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    // 初始化已选记录（用于编辑回显）
    async initSelectedRecords() {
      this.selectedRecords = [];
      
      // 如果有 selectedIds，逐个获取记录详情
      if (this.selectedIds && this.selectedIds.length > 0) {
        console.log('[售后选择器] 初始化已选记录, selectedIds:', this.selectedIds);
        try {
          // 使用 afterInfo 逐个获取记录详情
          const { afterInfo } = await import("@/api/third/sale");
          const promises = this.selectedIds.map(id => afterInfo(id).catch(() => null));
          const results = await Promise.all(promises);
          this.selectedRecords = results
            .filter(res => res && res.code === 200 && res.data)
            .map(res => res.data);
          console.log('[售后选择器] 已选记录加载完成:', this.selectedRecords);
        } catch (error) {
          console.error('[售后选择器] 加载已选记录失败:', error);
        }
      }
    },
    
    loadData() {
      this.loading = true;
      console.log('[售后选择器] 开始加载数据');
      console.log('[售后选择器] afterProblemId:', this.afterProblemId);
      console.log('[售后选择器] selectedIds:', this.selectedIds);
      
      const params = {
        p: this.page,
        l: this.pageSize,
        ...this.searchForm
      };
      
      // 如果传入了 afterProblemId，添加到查询参数中
      if (this.afterProblemId) {
        params.afterProblemId = this.afterProblemId;
        console.log('[售后选择器] 使用 afterProblemId 查询:', params.afterProblemId);
      }
      
      console.log('[售后选择器] 最终请求参数:', params);
      // 添加搜索条件
      if (this.searchForm.sn) {
        params.sn = this.searchForm.sn;
      }
      if (this.searchForm.customerName) {
        params.customerName = this.searchForm.customerName;
      }
      if (this.searchForm.returnDate) {
        params.returnDate = this.searchForm.returnDate;
      }
      if (this.searchForm.status !== "") {
        params.status = this.searchForm.status;
      }
      
      afterList(params).then((res) => {
        this.tableData = res.data.list || [];
        this.total = res.data.total || 0;
      }).catch((error) => {
        console.error("加载售后记录失败:", error);
      }).finally(() => {
        this.loading = false;
      });
    },
    
    handleSearch() {
      this.page = 1;
      this.loadData();
    },
    
    handleReset() {
      this.searchForm = {
        sn: "",
        customerName: "",
        returnDate: "",
        status: ""
      };
      this.page = 1;
      this.loadData();
    },
    
    // 判断是否已选
    isSelected(row) {
      return this.selectedRecords.some(r => r.id === row.id);
    },
    
    // 添加记录
    handleAdd(row) {
      if (!this.isSelected(row)) {
        this.selectedRecords.push(row);
      }
    },
    
    // 移除记录
    handleRemove(row) {
      const index = this.selectedRecords.findIndex(r => r.id === row.id);
      if (index > -1) {
        this.selectedRecords.splice(index, 1);
      }
    },
    
    // 移除Tag
    handleRemoveTag(record) {
      this.handleRemove(record);
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadData();
    },
    
    handlePageChange(val) {
      this.page = val;
      this.loadData();
    },
    
    handleConfirm() {
      if (this.selectedRecords.length === 0) {
        this.$message.warning('请至少选择一条售后记录');
        return;
      }
      this.$emit('confirm', this.selectedRecords);
      this.handleClose();
    },
    
    handleClose() {
      this.dialogVisible = false;
      this.selectedRecords = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-search-area {
  padding: 15px 20px 0px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.selected-tags-area {
  padding: 10px 20px;
  background-color: #f0f9ff;
  border: 1px solid #d1e9ff;
  border-radius: 4px;
  margin: 0 20px 15px;
  
  .selected-header {
    font-size: 14px;
    color: #409EFF;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .el-tag {
      margin: 0;
    }
  }
}

.dialog-table-area {
  padding: 0 20px;
}

.dialog-footer {
  text-align: right;
  padding: 0px 20px 0;
}
</style>
