<template>
  <el-dialog
    title="历史版本"
    :visible.sync="dialogVisible"
    width="1200px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    append-to-body
    top="5vh"
  >
    <div v-loading="loading" style="max-height: 70vh; overflow-y: auto;">
      <el-table
        v-if="historyList.length > 0"
        :data="historyList"
        border
        style="width: 100%"
        height="500px"
      >
        <el-table-column label="序号" type="index" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="版本号" prop="versionNumber" width="150" align="center">
          <template slot-scope="scope">
            <div>
              <span style="font-weight: 600;">{{ scope.row.versionNumber }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="版本描述" prop="versionDescription"  >
          <template slot-scope="scope">
            {{ scope.row.versionDescription || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="createBy" width="100" align="center" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" >
          <template slot-scope="scope">
            {{ parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}") }}
          </template>
        </el-table-column>
        <el-table-column label="固件文件"  align="center"  show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.fileUrl"
              type="text"
              size="small"
              icon="el-icon-download"
              @click="handleDownload(scope.row.fileUrl)"
            >
            {{ getFileName(scope.row.fileUrl) }}
            </el-button>
            <span v-else style="color: #c0c4cc; font-size: 12px;">无文件</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">
        <i class="el-icon-info"></i>
        <p>暂无历史版本</p>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "HistoryDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 直接接收历史版本列表数据
    historyData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      historyList: [],
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    historyData: {
      handler(val) {
        if (val && Array.isArray(val)) {
          this.historyList = val;
        }
      },
      immediate: true,
      deep: true,
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    // 从URL中提取文件名
    getFileName(url) {
      if (!url) return '';
      const parts = url.split('/');
      return parts[parts.length - 1];
    },
    // 下载文件
    handleDownload(url) {
      if (!url) {
        this.$message.warning("文件地址不存在");
        return;
      }
      this.urlDownload(url);
    },
    handleClose() {
      this.dialogVisible = false;
      this.historyList = [];
    },
  },
};
</script>

<style scoped lang="scss">
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;

  i {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

::v-deep .el-table {
  th {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #606266;
  }

  .el-button--text {
    padding: 0;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
