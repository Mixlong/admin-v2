<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="品类" prop="categoryName">
        <el-select v-model="queryParams.categoryName" placeholder="请选择品类" clearable style="max-width: 140px"
          @change="changeCategory">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select v-model="queryParams.computerName" clearable placeholder="请选择型号" @change="getList"
          style="width: 160px">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="工单号" prop="orderCode">
        <el-input v-model="queryParams.orderCode" placeholder="请输入工单号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNumber">
        <el-input v-model="queryParams.batchNumber" placeholder="请输入批次号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="排产单号" prop="schedulingId">
        <el-input v-model="queryParams.schedulingId" placeholder="请输入排产单号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="备料状态" prop="materialState">
        <el-select v-model="queryParams.materialState" placeholder="请选择备料状态" clearable style="max-width: 140px">
          <el-option label="未备料" value="0" />
          <el-option label="备料中" value="1" />
          <el-option label="已完成" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['third:materialHouse:export']">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="materialHouseList" border :height="tableHeight()">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品类" align="center" prop="categoryName" />
      <el-table-column label="型号" align="center" prop="computerName" />
      <el-table-column label="工单号" align="center" prop="orderCode" />
      <el-table-column label="批次号" align="center" prop="batchNumber" />
      <el-table-column label="排产单号" align="center" prop="schedulingId" />
      <el-table-column label="备料状态" align="center" prop="materialStateStr" width="100">
        <template slot-scope="scope">
          <el-tag :type="getMaterialStateType(scope.row.materialState)" size="small">
            {{ scope.row.materialStateStr || getMaterialStateText(scope.row.materialState) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdateStatus(scope.row)"
            v-hasPermi="['third:materialHouse:edit']">修改状态</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 修改状态对话框 -->
    <el-dialog title="修改备料状态" :visible.sync="statusDialog.open" width="500px" append-to-body top="0">
      <el-form ref="statusForm" :model="statusDialog.form" :rules="statusDialog.rules" label-width="80px">
        <el-form-item label="当前状态">
          <el-tag :type="getMaterialStateType(statusDialog.form.currentStatus)" size="small">
            {{ getMaterialStateText(statusDialog.form.currentStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="status">
          <el-select v-model="statusDialog.form.status" placeholder="请选择新状态" style="width: 100%">
            <el-option label="未备料" :value="0" />
            <el-option label="备料中" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelStatusDialog">取 消</el-button>
        <el-button type="primary" @click="submitStatusChange" :loading="statusDialog.loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { materialHouseList, materialHouseExport, editMaterialState } from "@/api/third/materialHouse";
import { categoryComputerDict, } from "@/api/third/fileConfig";
export default {
  name: "MaterialHouse",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 出库料记录表格数据
      materialHouseList: [],
      dictList: [],
      computerOptions: [],
      // 修改状态对话框
      statusDialog: {
        open: false,
        loading: false,
        form: {
          id: null,
          currentStatus: null,
          status: null,
          why: ''
        },
        rules: {
          status: [
            { required: true, message: "请选择新状态", trigger: "change" }
          ],
          why: [
            { required: true, message: "请输入修改原因", trigger: "blur" },
            { min: 2, max: 200, message: "修改原因长度在 2 到 200 个字符", trigger: "blur" }
          ]
        }
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: null,
        computerName: null,
        orderCode: null,
        batchNumber: null,
        schedulingId: null,
        materialState: null
      },
      // 高级搜索展开状态
      isAdvancedExpanded: false
    };
  },
  created() {
    this.getList();

    // 加载高级搜索展开状态偏好
    try {
      const key = 'materialHouse-search-expanded';
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        this.isAdvancedExpanded = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('加载展开状态失败:', error);
    }

    categoryComputerDict().then((response) => {
      this.dictList = response.data;
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerId = this.$route.query.model;
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
    });
  },
  methods: {
    /** 查询出库料记录列表 */
    getList() {
      this.loading = true;
      materialHouseList(this.queryParams).then(response => {
        this.materialHouseList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
      this.getList();
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0].computerList;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出所有出库料记录数据项?').then(() => {
        this.loading = true;
        return materialHouseExport(this.queryParams);
      }).then(response => {
        if (response.code === 200 && response.msg) {
          this.download(response.msg);
        } else {
          this.$message.error('导出失败');
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 获取备料状态标签类型
    getMaterialStateType(state) {
      const typeMap = {
        0: 'info',    // 未备料 - 灰色
        1: 'warning', // 备料中 - 橙色  
        2: 'success'  // 已完成 - 绿色
      };
      return typeMap[state] || 'info';
    },
    // 获取备料状态文本
    getMaterialStateText(state) {
      const textMap = {
        0: '未备料',
        1: '备料中',
        2: '已完成'
      };
      return textMap[state] || '未知';
    },
    // 处理修改状态
    handleUpdateStatus(row) {
      this.statusDialog.form = {
        id: row.id,
        currentStatus: row.materialState,
        status: null,
        why: ''
      };
      this.statusDialog.open = true;
      this.$nextTick(() => {
        this.$refs["statusForm"].resetFields();
      });
    },
    // 取消状态修改
    cancelStatusDialog() {
      this.statusDialog.open = false;
      this.statusDialog.form = {
        id: null,
        currentStatus: null,
        status: null,
        why: ''
      };
    },
    // 提交状态修改
    submitStatusChange() {
      this.$refs["statusForm"].validate(valid => {
        if (valid) {
          // 检查新状态是否与当前状态相同
          if (this.statusDialog.form.status === this.statusDialog.form.currentStatus) {
            this.$modal.msgWarning("新状态与当前状态相同，无需修改");
            return;
          }

          this.statusDialog.loading = true;
          const submitData = [{
            id: this.statusDialog.form.id,
            status: this.statusDialog.form.status,
            why: this.statusDialog.form.why
          }];

          editMaterialState(submitData).then(response => {
            this.statusDialog.loading = false;
            if (response.code === 200) {
              this.$modal.msgSuccess("修改成功");
              this.statusDialog.open = false;
              this.getList();
            } else {
              this.$modal.msgError(response.msg || "修改失败");
            }
          }).catch(() => {
            this.statusDialog.loading = false;
            this.$modal.msgError("修改失败");
          });
        }
      });
    },
    // 切换高级搜索展开状态
    toggleAdvanced() {
      this.isAdvancedExpanded = !this.isAdvancedExpanded;

      // 保存用户偏好
      try {
        const key = 'materialHouse-search-expanded';
        localStorage.setItem(key, JSON.stringify(this.isAdvancedExpanded));
      } catch (error) {
        console.warn('保存展开状态失败:', error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.search-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .search-form {
    .search-row {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;

      &.primary-row {
        justify-content: space-between;

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-left: auto;

          .toggle-button {
            color: #606266;
            padding: 7px 8px;

            &:hover {
              color: #409EFF;
              background-color: #ecf5ff;
            }
          }
        }
      }

      &.advanced-row {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
      }
    }

    ::v-deep .el-form-item {
      margin-bottom: 8px;
      margin-right: 12px;

      .el-form-item__label {
        padding-right: 8px;
        font-size: 13px;
        color: #606266;
      }

      .el-input,
      .el-select {

        &.el-input--mini,
        &.el-select--mini {
          .el-input__inner {
            height: 32px;
            line-height: 32px;
            font-size: 13px;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .search-row.primary-row {
      flex-direction: column;
      align-items: stretch;

      .action-buttons {
        margin-left: 0;
        margin-top: 8px;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;

    ::v-deep .el-form-item {
      width: 100%;
      margin-right: 0;

      .el-input,
      .el-select {
        width: 100% !important;
      }
    }

    .action-buttons {
      width: 100%;
      justify-content: space-between;

      .el-button {
        flex: 1;
        margin: 0 4px;
        max-width: 80px;

        &.toggle-button {
          flex: 0 0 auto;
          max-width: none;
          padding: 7px 12px;
        }
      }
    }
  }
}
</style>