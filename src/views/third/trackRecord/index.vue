<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          filterable
          @change="changeCategory"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          clearable
          filterable
          placeholder="请选择型号"
          @change="getList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="排产单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入排产单号"
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
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="物料类型" prop="type" align="center">
        <template v-slot="{ row }">
          {{ typeList[row.type] }}
        </template>
      </el-table-column>
      <el-table-column label="排产单号" prop="no" align="center" />
      <el-table-column label="批次号" prop="batchNumber" align="center" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { categoryComputerDict, trackLogList } from "@/api/third/fileConfig";

export default {
  name: "BikeFileConfig",
  data() {
    return {
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dictList: [],
      brandList: [],
      computerOptions: [],
      // 物料类型
      typeList: {
        1: "壳料",
        2: "屏幕",
        3: "线缆",
        4: "蓝牙",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        batchNumber: "",
        no: "",
      },
    };
  },
  created() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      trackLogList(this.queryParams)
        .then(({ data }) => {
          const { list, total } = data;
          this.brandList = list;
          this.total = total;
        })
        .finally(() => {
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
  },
};
</script>
