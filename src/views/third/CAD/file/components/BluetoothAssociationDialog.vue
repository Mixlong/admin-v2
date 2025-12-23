<template>
  <el-dialog
    title="蓝牙固件关联"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    top='0vh'
    class="dialog-scroll"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px" v-loading="initLoading" element-loading-text="加载已关联固件信息...">
      <el-form-item label="关联类型" prop="associationType">
        <el-radio-group v-model="form.associationType">
          <el-radio :label="1">临时关联</el-radio>
          <el-radio :label="2">永久关联</el-radio>
        </el-radio-group>
        <div class="tip-text">
          <span v-if="form.associationType === 1">临时关联：仅本次使用，不保存关联关系</span>
          <span v-if="form.associationType === 2">永久关联：保存关联关系，后续自动关联</span>
        </div>
      </el-form-item>

      <el-form-item label="蓝牙固件" prop="firmwareId">
        <el-button type="primary" plain icon="el-icon-search" @click="showFirmwareSelector">
          {{ selectedFirmware ? '重新选择' : '选择固件' }}
        </el-button>
        <el-button v-if="selectedFirmware" type="danger" plain icon="el-icon-delete" @click="handleClearFirmware">
          清除关联
        </el-button>
      </el-form-item>

      <el-form-item label="" v-if="selectedFirmware">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="版本号">
            {{ selectedFirmware.versionNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="芯片平台">
            {{ selectedFirmware.chipPlatform }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商">
            {{ selectedFirmware.customer }}
          </el-descriptions-item>
          <el-descriptions-item label="项目">
            {{ selectedFirmware.project }}
          </el-descriptions-item>
          <el-descriptions-item label="版本描述" :span="2">
            {{ selectedFirmware.versionDescription }}
          </el-descriptions-item>
        </el-descriptions>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="submitting">
        确 定
      </el-button>
    </div>

    <!-- 蓝牙固件选择器对话框 -->
    <el-dialog
      title="选择蓝牙固件"
      :visible.sync="selectorVisible"
      width="900px"
      append-to-body
      top='0'
      class="dialog-scroll"
      :close-on-click-modal="false"
    >
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入版本号搜索"
          clearable
          style="width: 300px"
          @keyup.enter.native="loadFirmwareList"
        >
          <el-button slot="append" icon="el-icon-search" @click="loadFirmwareList"></el-button>
        </el-input>
      </div>

      <el-table
        :data="firmwareList"
        v-loading="loading"
        highlight-current-row
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName"
        height="350"
        border
        style="width: 100%"
      >
        <el-table-column width="55" align="center" label="选择">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id" v-model="tempSelectedId" class="radio-no-label"><i></i></el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="versionNumber" label="版本号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="chipPlatform" label="芯片平台" min-width="140" show-overflow-tooltip />
        <el-table-column prop="customer" label="供应商" min-width="100" show-overflow-tooltip />
        <el-table-column prop="project" label="项目" min-width="140" show-overflow-tooltip />
        <el-table-column prop="versionDescription" label="版本描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'" size="mini">
              {{ scope.row.status === 0 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="queryParams.p"
        :page-sizes="[10, 20, 50]"
        :page-size="queryParams.l"
        :total="total"
        layout="total, sizes, prev, pager, next"
        class="pagination-container"
      />

      <div slot="footer" class="dialog-footer">
        <el-button @click="selectorVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="!tempSelectedId">确 定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { getFirmwareList, getFirmwareDetail } from "@/api/third/bluetoothFirmware";

export default {
  name: "BluetoothAssociationDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    fileConfigData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      selectorVisible: false,
      loading: false,
      submitting: false,
      initLoading: false,
      firmwareList: [],
      selectedFirmware: null,
      tempSelectedFirmware: null,
      tempSelectedId: null,
      searchKeyword: "",
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        versionNumber: "",
      },
      form: {
        associationType: 1,
        firmwareId: undefined,
      },
      rules: {
        associationType: [
          { required: true, message: "请选择关联类型", trigger: "change" },
        ],
        firmwareId: [
          { required: false, message: "请选择蓝牙固件", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    selectedFirmwareDisplay() {
      if (this.selectedFirmware) {
        return `${this.selectedFirmware.versionNumber} - ${this.selectedFirmware.chipPlatform || ''} - ${this.selectedFirmware.customer || ''}`;
      }
      return "";
    },
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initData();
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  mounted() {
    // 组件挂载后初始化数据，确保 props 已经传递
    this.$nextTick(() => {
      this.initData();
    });
  },
  methods: {
    // 初始化数据 - 回显已关联的蓝牙固件
    async initData() {
      const bluetoothFirmwareId = this.fileConfigData?.bluetoothFirmwareId;
      
      console.log("initData 执行, fileConfigData:", this.fileConfigData);
      console.log("bluetoothFirmwareId:", bluetoothFirmwareId);
      
      if (bluetoothFirmwareId) {
        // 有已关联的蓝牙固件，设置为永久关联并查询详情
        this.form.associationType = 2;
        this.initLoading = true;
        
        try {
          const response = await getFirmwareDetail(bluetoothFirmwareId);
          console.log("蓝牙固件详情响应：", response);
          
          if (response.code === 200) {
            // 兼容不同的数据结构
            const firmwareData = response.data || response;
            this.selectedFirmware = firmwareData;
            this.form.firmwareId = bluetoothFirmwareId;
            console.log("回显成功, selectedFirmware:", this.selectedFirmware);
          }
        } catch (error) {
          console.error("获取蓝牙固件详情失败:", error);
          this.$message.error("获取已关联固件信息失败");
        } finally {
          this.initLoading = false;
        }
      }
    },
    // 显示固件选择器
    showFirmwareSelector() {
      console.log("点击选择按钮，打开选择器");
      this.selectorVisible = true;
      this.tempSelectedId = this.form.firmwareId || null;
      this.tempSelectedFirmware = this.selectedFirmware;
      // 打开选择器时加载数据
      this.$nextTick(() => {
        this.loadFirmwareList();
      });
    },
    // 加载蓝牙固件列表
    loadFirmwareList() {
      this.loading = true;
      const params = {
        p: this.queryParams.p,
        l: this.queryParams.l,
        versionNumber: this.searchKeyword || undefined,
      };

      console.log("加载蓝牙固件列表，参数：", params);

      getFirmwareList(params)
        .then((response) => {
          console.log("蓝牙固件列表响应：", response);
          if (response.code === 200 && response.data) {
            this.firmwareList = response.data.list || response.data.content || [];
            this.total = response.data.total || 0;
            console.log("固件列表：", this.firmwareList, "总数：", this.total);
          }
        })
        .catch((error) => {
          console.error("加载蓝牙固件列表失败:", error);
          this.$message.error("加载固件列表失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 点击表格行
    handleRowClick(row) {
      this.tempSelectedId = row.id;
      this.tempSelectedFirmware = row;
    },
    // 表格行样式
    tableRowClassName({ row }) {
      if (this.tempSelectedId === row.id) {
        return 'selected-row';
      }
      return '';
    },
    // 确认选择
    confirmSelection() {
      if (this.tempSelectedFirmware) {
        this.selectedFirmware = this.tempSelectedFirmware;
        this.form.firmwareId = this.tempSelectedId;
        this.selectorVisible = false;
      } else {
        this.$message.warning("请选择一个蓝牙固件");
      }
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.queryParams.l = size;
      this.loadFirmwareList();
    },
    // 页码变化
    handlePageChange(page) {
      this.queryParams.p = page;
      this.loadFirmwareList();
    },
    // 清除已选固件
    handleClearFirmware() {
      this.$confirm('确定要清除蓝牙固件关联吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedFirmware = null;
        this.form.firmwareId = undefined;
      }).catch(() => {});
    },
    // 确认关联
    handleConfirm() {
      // 如果没有选择固件，表示要清除关联
      if (!this.selectedFirmware) {
        const data = {
          associationType: this.form.associationType,
          firmwareInfo: null,
          fileConfigId: this.fileConfigData.id,
          isDelete: true, // 标记为删除操作
        };
        this.$emit("confirm", data);
        this.handleClose();
        return;
      }
      
      this.$refs.form.validate((valid) => {
        if (valid) {
          const data = {
            associationType: this.form.associationType,
            firmwareInfo: this.selectedFirmware,
            fileConfigId: this.fileConfigData.id,
          };
          this.$emit("confirm", data);
          this.handleClose();
        }
      });
    },
    // 关闭对话框
    handleClose() {
      this.selectedFirmware = null;
      this.tempSelectedFirmware = null;
      this.tempSelectedId = null;
      this.searchKeyword = "";
      this.firmwareList = [];
      this.queryParams.p = 1;
      this.selectorVisible = false;
      this.dialogVisible = false;
      this.form = {
        associationType: 1,
        firmwareId: undefined,
      };
    },
  },
};
</script>

<style scoped lang="scss">
.tip-text {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.selected-firmware-text {
  margin-left: 10px;
  color: #67c23a;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

::v-deep .el-descriptions {
  .el-descriptions-item__label {
    width: 100px;
  }
}

::v-deep .el-table {
  .el-radio {
    margin-right: 0;
  }
  
  .radio-no-label {
    .el-radio__label {
      display: none;
    }
  }
  
  .el-table__row {
    cursor: pointer;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
  
  .selected-row {
    background-color: #ecf5ff !important;
  }
}
</style>
