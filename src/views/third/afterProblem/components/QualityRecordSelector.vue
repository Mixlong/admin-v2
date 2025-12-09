<template>
  <el-dialog
    :title="viewOnly ? '查看来料记录' : '选择品质记录'"
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
        <el-form-item label="物料编码" label-width="80px">
          <select-loadMore
            v-model="searchForm.invCode"
            style="width: 180px"
            :data="inventoryData.data"
            :page="inventoryData.page"
            :hasMore="inventoryData.more"
            dictLabel="invCode"
            dictValue="invCode"
            :request="getInventoryList"
            placeholder="请选择物料编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="供应商" label-width="70px">
          <select-loadMore
            v-model="searchForm.supplierName"
            style="width: 160px"
            :data="supplierData.data"
            :page="supplierData.page"
            :hasMore="supplierData.more"
            dictLabel="supplierName"
            dictValue="supplierName"
            :request="getSupplierData"
            placeholder="请选择供应商"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleSearch"
          >
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
      <div class="tags-container">
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
      </div>
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
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column
          label="检验日期"
          prop="createTime"
          width="110"
          align="center"
        >
          <template slot-scope="scope">
            {{
              scope.row.createTime
                ? scope.row.createTime.substring(0, 10)
                : "--"
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="物料编码"
          prop="invCode"
          width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="物料名称"
          prop="invName"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="规格"
          prop="englishName"
          width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="供应商"
          prop="invDefine"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="来料记录"
          prop="id"
          width="100"
          align="center"
        />
        <el-table-column
          label="批次号"
          prop="batchNo"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="检验数量"
          prop="samplingQuantity"
          width="90"
          align="center"
        />
        <el-table-column
          label="不良数量"
          prop="defectiveQuantity"
          width="90"
          align="center"
        />
        <el-table-column
          label="不良率"
          prop="defectiveRate"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getDefectRateTagType(scope.row.defectiveRate)"
              size="small"
            >
              {{ scope.row.defectiveRate || "0.00%" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="检验结果"
          prop="testResult"
          width="90"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.testResult === 'OK' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.testResult === "OK" ? "合格" : "不合格" }}
            </el-tag>
          </template>
        </el-table-column>
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
import { getIqcInspectionDataList } from "@/api/iqc/inspectionData";

export default {
  name: "QualityRecordSelector",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    selectedIds: {
      type: Array,
      default: () => [],
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
    afterProblemId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchForm: {
        invCode: "",
        supplierName: "",
      },
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      selectedRecords: [],
      // SelectLoadMore 数据
      inventoryData: {
        data: [],
        page: 1,
        more: true,
      },
      supplierData: {
        data: [],
        page: 1,
        more: false,
      },
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
      this.$emit("update:visible", val);
    },
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
            l: this.selectedIds.length,
          };
          const res = await getIqcInspectionDataList(params);
          if (res.code === 200 && res.data) {
            this.selectedRecords = res.data.list || [];
          }
        } catch (error) {
          console.error('[品质选择器] 加载已选记录失败:', error);
        }
      }
    },
    
    loadData() {
      this.loading = true;
      const params = {
        p: this.page,
        l: this.pageSize,
        ...this.searchForm,
      };

      // 如果传入了 afterProblemId，添加到查询参数中
      if (this.afterProblemId) {
        params.afterProblemId = this.afterProblemId;
      }

      getIqcInspectionDataList(params)
        .then((res) => {
          if (res.code === 200 && res.data) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
          } else {
            this.tableData = [];
            this.total = 0;
          }
        })
        .catch((error) => {
          console.error("加载品质记录失败:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleSearch() {
      this.page = 1;
      this.loadData();
    },

    handleReset() {
      this.searchForm = {
        invCode: "",
        supplierName: "",
      };
      this.page = 1;
      this.loadData();
    },

    // 判断是否已选
    isSelected(row) {
      return this.selectedRecords.some((r) => r.id === row.id);
    },

    // 添加记录
    handleAdd(row) {
      if (!this.isSelected(row)) {
        this.selectedRecords.push(row);
      }
    },

    // 移除记录
    handleRemove(row) {
      const index = this.selectedRecords.findIndex((r) => r.id === row.id);
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

    getDefectRateTagType(rate) {
      if (!rate || rate === "0.00%") return "success";
      const value = parseFloat(rate);
      if (value < 1) return "success";
      if (value < 5) return "warning";
      return "danger";
    },

    handleConfirm() {
      if (this.selectedRecords.length === 0) {
        this.$message.warning("请至少选择一条品质记录");
        return;
      }
      this.$emit("confirm", this.selectedRecords);
      this.handleClose();
    },

    handleClose() {
      this.dialogVisible = false;
      this.selectedRecords = [];
    },

    // 获取物料编码列表
    getInventoryList({ page, keyword, more }) {
      return new Promise((resolve) => {
        import("@/api/base/inventory").then(({ getInventoryList }) => {
          const params = {
            p: page || 1,
            l: 20,
          };
          if (keyword) {
            params.invCode = keyword;
          }

          getInventoryList(params)
            .then((res) => {
              if (res.code === 200 && res.data) {
                const { list = [], total = 0, pageNum, pageSize } = res.data;

                if (more) {
                  this.inventoryData.data = [
                    ...this.inventoryData.data,
                    ...list,
                  ];
                } else {
                  this.inventoryData.data = list;
                }
                this.inventoryData.page = pageNum || page;
                this.inventoryData.more = pageNum * pageSize < total;
                resolve();
              } else {
                this.inventoryData.data = [];
                this.inventoryData.more = false;
                resolve();
              }
            })
            .catch(() => {
              this.inventoryData.data = [];
              this.inventoryData.more = false;
              resolve();
            });
        });
      });
    },

    // 获取供应商列表
    getSupplierData({ page, keyword, more }) {
      return new Promise((resolve) => {
        import("@/api/base/inventory").then(({ getSuppliersList }) => {
          const params = {
            p: page || 1,
            l: 1000,
          };
          if (keyword) {
            params.supplierName = keyword;
          } 

          getSuppliersList(params)
            .then((res) => {
              if (res.code === 200 && res.data && Array.isArray(res.data)) {
                // 后端返回的是字符串数组，需要转换为对象数组
                const list = res.data.map((name) => ({
                  supplierName: name,
                  id: name, // 使用名称作为id
                }));
                this.supplierData.data = list;
                this.supplierData.more = false;
                resolve();
              } else {
                this.supplierData.data = [];
                this.supplierData.more = false;
                resolve();
              }
            })
            .catch(() => {
              this.supplierData.data = [];
              this.supplierData.more = false;
              resolve();
            });
        });
      });
    },
  },
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
    color: #409eff;
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
  padding: 0 20px 0;
}
</style>
