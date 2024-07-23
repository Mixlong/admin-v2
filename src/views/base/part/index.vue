<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
        />
      </el-form-item>
      <el-form-item label="sn、箱号" prop="key">
        <el-input
          v-model="queryParams.key"
          clearable
          placeholder="请输入sn、箱号"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>

      <el-button
        class="fr"
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
      >
        导出
      </el-button>
    </el-form>

    <el-table
      v-loading="loading"
      :data="partList"
      :height="tableHeight(38)"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column label="SN" prop="sn" align="center" />
      <el-table-column label="DT SN" prop="dtSn" align="center" width="100" />
      <el-table-column label="Model" prop="model" align="center" />
      <el-table-column
        label="Manufacturer"
        prop="manufacturer"
        align="center"
      />
      <el-table-column label="Batch No" prop="batchNo" align="center" />
      <el-table-column
        label="Batch Qty"
        prop="batchQty"
        align="center"
        width="90"
      />
      <el-table-column label="Version" prop="version" align="center" />
      <el-table-column label="Spec" prop="spec" align="center" width="300" />
      <el-table-column label="Other" prop="other" align="center" width="80" />
      <el-table-column label="Box Sn" prop="boxSn" align="center" />
      <el-table-column
        label="Line Sn"
        prop="lineSn"
        align="center"
        width="80"
      />
      <el-table-column label="HardwareVer" prop="hardwareVer" align="center" />
      <el-table-column label="AppVer" prop="appVer" align="center" />
      <el-table-column label="BootVer" prop="bootVer" align="center" />
      <el-table-column label="UiVer" prop="uiVer" align="center" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listPartInfo, exportPartInfo } from "@/api/base/part";

export default {
  name: "PartInfo",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户表格数据
      partList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: undefined,
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listPartInfo(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.partList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
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

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.addDateRange(this.queryParams, this.dateRange);

      this.downloadFile({
        aFn: exportPartInfo,
        queryParams,
      });
    },
  },
};
</script>
