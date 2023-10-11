<template>
  <div>
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="所属模块：" prop="productType">
        <el-select
          v-model="queryParams.productType"
          size="mini"
          filterable
          clearable
          placeholder="请选择所属模块"
          @change="getList"
        >
          <el-option
            v-for="dict in moduleList"
            :key="dict.dictCode"
            :label="dict.dictValue"
            :value="dict.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用例类型：" prop="type">
        <el-select
          v-model="queryParams.type"
          size="mini"
          filterable
          clearable
          style="width: 150px"
          placeholder="请选择用例类型"
          @change="getList"
        >
          <el-option
            v-for="dict in useCaseTypeList"
            :key="dict.dictCode"
            :label="dict.dictValue"
            :value="dict.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      ref="multipleTable"
      :data="testList"
      tooltip-effect="dark"
      row-key="id"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" reserve-selection width="50" />
      <el-table-column label="用例类型" prop="typeName" align="center" />
      <el-table-column label="所属模块" prop="productName" align="center" />
      <el-table-column label="测试项" prop="content" align="center" />
      <el-table-column label="前置条件" prop="preconditions" align="center" />
      <el-table-column label="输入与操作" prop="inter" align="center" />
      <el-table-column label="预期结果" prop="result" align="center" />
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
import { testCaseList } from "@/api/third/testApi";
export default {
  inheritAttrs: false,
  data() {
    return {
      loading: false,
      total: 0,
      testList: [],
      // 模块名称
      moduleList: [],
      // 用例类型
      useCaseTypeList: [],
      mulSelList: [],
      checkList: [],
      queryParams: {
        p: 1,
        l: 10,
        state: 1,
        status: 0,
        productType: "",
        type: "",
      },
    };
  },
  created() {
    this.getDicts("test_moduleName").then((res) => {
      this.moduleList = res.data;
    });
    this.getDicts("useCaseType").then((res) => {
      this.useCaseTypeList = res.data;
    });
    
    this.getList();
  },
  methods: {
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(list) {
      this.mulSelList = list
    },
    getList() {
      this.loading = true;
      testCaseList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.testList = list;
        this.total = total;
        this.loading = false;
        if (this.checkList.length) {
          this.$nextTick(() => {
            this.checkList.forEach((item) => {
              this.testList.forEach((cItem) => {
                if (item.caseId === cItem.id) {
                  this.$refs.multipleTable.toggleRowSelection(cItem, true);
                }
              });
            });
          });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.app-container {
  .elDrawer_box {
    .model_item:not(:last-child) {
      margin-bottom: 5px;
    }
    .el-drawer__body {
      padding-left: 10px;
      padding-right: 10px;
      box-sizing: border-box;
    }
  }
}
</style>