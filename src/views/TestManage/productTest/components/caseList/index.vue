<template>
  <div>
    <el-table
      v-loading="loading"
      ref="multipleTable"
      :data="testList"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
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
  data() {
    return {
      loading: false,
      total: 0,
      testList: [],
      queryParams: {
        p: 1,
        l: 10,
        state: 1,
        status: 0,
      },
    };
  },
  created() {
    console.log(this.$attrs.multipleSelection);
    this.getList();
  },
  methods: {
    handleSelectionChange(list) {
      //   this.multipleSelection = list;
      this.$emit("update:multipleSelection", list);
    },
    getList() {
      this.loading = true;
      testCaseList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.testList = list;
        this.total = total;
        this.loading = false;

        const testList = this.$attrs.multipleSelection;
        console.log(1111, testList);
        if (testList.length) {
          this.$nextTick(() => {
            testList.forEach((item) => {
              this.testList.forEach((cItem) => {
                if (item.id === cItem.id) {
                  this.$refs.multipleTable.toggleRowSelection(cItem);
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