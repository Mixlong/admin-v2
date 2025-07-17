<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="品类" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入品类"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-input
          v-model="queryParams.computerName"
          placeholder="请输入型号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工单号" prop="orderCode">
        <el-input
          v-model="queryParams.orderCode"
          placeholder="请输入工单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNumber">
        <el-input
          v-model="queryParams.batchNumber"
          placeholder="请输入批次号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排产单号" prop="schedulingId">
        <el-input
          v-model="queryParams.schedulingId"
          placeholder="请输入排产单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['third:materialHouse:export']"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="materialHouseList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品类" align="center" prop="categoryName" />
      <el-table-column label="型号" align="center" prop="computerName" />
      <el-table-column label="工单号" align="center" prop="orderCode" />
      <el-table-column label="批次号" align="center" prop="batchNumber" />
      <el-table-column label="排产单号" align="center" prop="schedulingId" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { materialHouseList, materialHouseExport } from "@/api/third/materialHouse";

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
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: null,
        computerName: null,
        orderCode: null,
        batchNumber: null,
        schedulingId: null
      }
    };
  },
  created() {
    this.getList();
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
      this.single = selection.length!==1
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
    }
  }
};
</script>