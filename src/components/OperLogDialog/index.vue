<template>
  <el-dialog
    title="操作日志"
    :visible.sync="dialogVisible"
    width="90%"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    top="0vh"
    class="dialog-scroll"
  >
    <el-table
      v-loading="loading"
      :data="logList"
      :height="500"
      border
    >
      <el-table-column
        label="操作日期"
        align="center"
        prop="operTime"
        width="160"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.operTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作人员"
        align="center"
        prop="operName"
        width="120"
      />
      <el-table-column
        label="系统模块"
        align="center"
        prop="title"
        width="140"
      />
      <el-table-column label="操作类型" align="center" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="getBusinessTypeTag(scope.row.businessType)"
            size="small"
          >
            {{ getBusinessTypeText(scope.row.businessType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="变更摘要"
        align="left"
        prop="changeDetails"
        min-width="300"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div v-if="scope.row.changeDetails" class="change-summary">
            {{ scope.row.changeDetails }}
          </div>
          <span v-else class="no-change">-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >
            详细
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 操作日志详细 - 显示字段变更信息 -->
    <el-dialog
      title="操作日志详细"
      :visible.sync="detailVisible"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <div v-if="detailForm.fieldChanges && detailForm.fieldChanges.length > 0" class="detail-table-container">
        <div class="detail-table-title">详细变更信息：</div>
        <el-table
          :data="detailForm.fieldChanges"
          border
          size="medium"
          class="detail-changes-table"
          :height="400"
        >
          <el-table-column label="变更类型" align="center" width="120">
            <template slot-scope="{ row }">
              <el-tag
                :type="getChangeTypeTag(row.changeType)"
                size="medium"
              >
                {{ row.changeTypeName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="字段名称" align="center" width="180">
            <template slot-scope="{ row }">
              <span class="field-label">{{ row.fieldLabel }}</span>
            </template>
          </el-table-column>
          <el-table-column label="原值" align="left" min-width="250">
            <template slot-scope="{ row }">
              <div class="table-cell-content old-value-cell">{{ formatFieldValue(row.oldValue) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="新值" align="left" min-width="250">
            <template slot-scope="{ row }">
              <div class="table-cell-content new-value-cell">{{ formatFieldValue(row.newValue) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else class="detail-no-changes">
        <i class="el-icon-info"></i> 暂无详细变更信息
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getOperLogHistory } from "@/api/monitor/operlog";

export default {
  name: "OperLogDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    recordId: {
      type: [String, Number],
      default: null,
    },
    // 品类列表（用于映射 categoryId）
    dictList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      logList: [],
      detailVisible: false,
      detailForm: {},
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
  watch: {
    visible(val) {
      if (val && this.recordId) {
        this.init();
      }
    },
  },
  methods: {
    init() {
      this.getLogList();
    },
    // 获取操作日志历史
    getLogList() {
      if (!this.recordId) {
        this.$message.warning("缺少业务ID");
        return;
      }
      
      this.loading = true;
      getOperLogHistory(this.recordId)
        .then((response) => {
          if (response.code === 200) {
            this.logList = response.data || [];
          } else {
            this.$message.error(response.msg || "查询失败");
          }
        })
        .catch((error) => {
          console.error("获取操作日志失败:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 获取变更类型标签颜色
    getChangeTypeTag(changeType) {
      const tagMap = {
        1: 'success', // 新增 - 绿色
        2: 'warning', // 修改 - 橙色
        3: 'danger'   // 删除 - 红色
      };
      return tagMap[changeType] || 'info';
    },
    // 获取业务类型标签颜色
    getBusinessTypeTag(businessType) {
      const tagMap = {
        1: 'success', // 新增
        2: 'warning', // 修改
        3: 'danger',  // 删除
        4: 'info',    // 查询
        5: 'primary'  // 其他
      };
      return tagMap[businessType] || 'info';
    },
    // 格式化字段值显示
    formatFieldValue(value) {
      if (value === null || value === undefined || value === "") {
        return "-";
      }
      
      // 如果是对象或数组，格式化为JSON字符串
      if (typeof value === "object") {
        try {
          return JSON.stringify(value, null, 2);
        } catch (e) {
          return String(value);
        }
      }
      
      return String(value);
    },
    // 获取操作类型文本
    getBusinessTypeText(businessType) {
      const typeMap = {
        1: '新增',
        2: '修改', 
        3: '删除',
        4: '查询',
        5: '其他'
      };
      return typeMap[businessType] || '未知';
    },
    handleView(row) {
      this.detailVisible = true;
      this.detailForm = row;
    },
    handleClose() {
      this.dialogVisible = false;
      this.logList = [];
    },
  },
};
</script>

<style lang="scss" scoped>
.change-summary {
  text-align: left;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-change {
  color: #909399;
}

.field-label {
  font-weight: 600;
  color: #606266;
}

// 详细对话框样式优化
::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

// 详情弹窗表格样式
.detail-table-container {
  .detail-table-title {
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    font-size: 16px;
    border-left: 4px solid #409eff;
    padding-left: 12px;
  }
  
  .detail-changes-table {
    width: 100%;
  }
}

.detail-no-changes {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
  
  i {
    margin-right: 8px;
    font-size: 16px;
  }
}

// 表格单元格内容样式
.table-cell-content {
  padding: 4px 0;
  word-break: break-all;
  line-height: 1.5;
}
</style>
