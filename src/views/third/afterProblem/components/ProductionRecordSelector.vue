<template>
  <el-dialog
    :title="viewOnly ? '查看制程记录' : '选择维修记录'"
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
        <el-form-item label="PCBA SN" label-width="80px">
          <el-input
            v-model="searchForm.pcbaSn"
            placeholder="请输入PCBA SN"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="机型" label-width="60px">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择机型"
            clearable
            filterable
            style="width: 140px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修员" label-width="70px">
          <el-select
            v-model="searchForm.repairPerson"
            placeholder="请选择维修员"
            clearable
            filterable
            style="width: 120px"
          >
            <el-option
              v-for="item in repairPersonOptions"
              :key="item.userId"
              :label="item.userName"
              :value="item.userName"
            />
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
        height="412"
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
          label="日期"
          prop="createTime"
          width="110"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.createTime ? scope.row.createTime.substring(0, 10) : '--' }}
          </template>
        </el-table-column>
        <el-table-column
          label="排产单号"
          prop="schedulingNo"
          width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="PCBA SN"
          prop="pcbaSn"
          min-width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="机型"
          prop="categoryName"
          width="120"
          align="center"
        />
        <el-table-column
          label="不良描述"
          prop="defectReason"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="维修结果"
          prop="repairTestResult"
          width="100"
          align="center"
        />
        <el-table-column
          label="责任判定"
          prop="responsibilityResult"
          width="100"
          align="center"
        />
        <el-table-column
          label="维修员"
          prop="createBy"
          width="100"
          align="center"
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
import { getMaintenanceRecordList } from "@/api/maintenance/record";

export default {
  name: "ProductionRecordSelector",
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
        pcbaSn: "",
        category: "",
        repairPerson: ""
      },
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      selectedRecords: [],
      // 下拉选项
      categoryOptions: [],
      repairPersonOptions: []
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        // 初始化已选记录
        this.initSelectedRecords();
        // 加载下拉选项
        if (this.categoryOptions.length === 0) {
          this.loadCategoryOptions();
        }
        if (this.repairPersonOptions.length === 0) {
          this.loadRepairPersonOptions();
        }
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
      
      // 如果有 selectedIds，直接调用API获取这些记录的完整数据
      if (this.selectedIds && this.selectedIds.length > 0) {
        try {
          const params = {
            ids: this.selectedIds.join(','),
            p: 1,
            l: this.selectedIds.length
          };
          const res = await getMaintenanceRecordList(params);
          if (res.code === 200 && res.data) {
            this.selectedRecords = res.data.list || [];
          }
        } catch (error) {
          console.error('[制程选择器] 加载已选记录失败:', error);
        }
      }
    },
    
    loadData() {
      this.loading = true;
      const params = {
        p: this.page,
        l: this.pageSize,
        ...this.searchForm
      };
      
      // 如果传入了 afterProblemId，添加到查询参数中
      if (this.afterProblemId) {
        params.afterProblemId = this.afterProblemId;
      }
      // 添加搜索条件
      if (this.searchForm.pcbaSn) {
        params.pcbaSn = this.searchForm.pcbaSn;
      }
      if (this.searchForm.category) {
        params.category = this.searchForm.category;
      }
      if (this.searchForm.repairPerson) {
        params.repairPerson = this.searchForm.repairPerson;
      }
      
      getMaintenanceRecordList(params).then((res) => {
        if (res.code === 200 && res.data) {
          this.tableData = res.data.list || [];
          this.total = res.data.total || 0;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      }).catch((error) => {
        console.error("加载生产记录失败:", error);
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
        pcbaSn: "",
        category: "",
        repairPerson: ""
      };
      this.page = 1;
      this.loadData();
    },
    
    // 加载机型选项
    loadCategoryOptions() {
      // 使用维修记录页面的API
      import('@/api/third/fileConfig').then(({ categoryComputerDict }) => {
        categoryComputerDict().then(res => {
          if (res.code === 200 && res.data) {
            this.categoryOptions = res.data;
          }
        }).catch(error => {
          console.error('获取机型数据失败:', error);
        });
      });
    },
    
    // 加载维修员选项
    loadRepairPersonOptions() {
      import('@/api/system/user').then(({ dictUserList }) => {
        dictUserList().then(res => {
          if (res && res.data) {
            // 去重处理
            const uniqueUsers = [];
            const userMap = new Map();
            res.data.forEach(user => {
              if (!userMap.has(user.userId)) {
                userMap.set(user.userId, user);
                uniqueUsers.push(user);
              }
            });
            this.repairPersonOptions = uniqueUsers;
          }
        }).catch(error => {
          console.error('获取维修员列表失败:', error);
        });
      });
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
        this.$message.warning('请至少选择一条维修记录');
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
