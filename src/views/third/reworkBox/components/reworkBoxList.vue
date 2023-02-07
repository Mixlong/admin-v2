<template>
  <el-dialog
    title="箱号列表"
    :visible.sync="show"
    width="730px"
    :close-on-click-modal="false"
    append-to-body
    center
  >
    <el-form
      ref="queryParams"
      :model="queryParams"
      inline
      @submit.native.prevent
    >
      <el-form-item label="箱号" prop="boxSn">
        <el-input
          v-model.trim="queryParams.boxSn"
          clearable
          placeholder="请输入箱号"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      class="principal-table"
      ref="selectTable"
      max-height="400"
      v-loading="loading"
      :data="dataList"
      border
      row-key="boxSn"
      @select="handleSelection"
    >
      <el-table-column
        type="selection"
        :reserve-selection="true"
        width="65"
        align="center"
      />
      <el-table-column label="箱号" prop="boxSn" align="center" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="isDisabled" @click="submitForm()">
        确 定
      </el-button>
      <el-button @click="show = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { reworkBoxList } from "@/api/third/reworkBox";
export default {
  props: {
    title: String,
    orderNo: String,
    checkId: String,
    single: {
      type: Boolean,
      default: false,
    },
    choosedVal: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      show: false,
      loading: false,
      total: 0,
      selectRows: [],
      dataList: [],
      queryParams: {
        p: 1,
        l: 10,
        orderNo: "",
        boxSn: "",
      },
    };
  },
  computed: {
    isDisabled() {
      return !this.selectRows.length;
    },
  },
  watch: {
    show(val) {
      if (!val) {
        const selectTable = this.$refs.selectTable;
        selectTable.clearSelection();
      } else {
        this.queryParams.p = 1;
        this.getList();
      }
    },
  },
  methods: {
    getList() {
      this.loading = true;
      return new Promise((resolve) => {
        reworkBoxList({ ...this.queryParams, orderNo: this.orderNo }).then(
          (res) => {
            const { list, total } = res.data;
            this.dataList = list;
            this.total = total;
            this.loading = false;
            this.defaultSelected();
            resolve();
          }
        );
      });
    },
    handleQuery() {
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryParams");
      this.handleQuery();
    },
    handleSelection(selection, row) {
      const selectTable = this.$refs.selectTable;
      if (this.single) {
        if (selection.includes(row)) {
          selectTable.clearSelection();
          selectTable.toggleRowSelection(row, true);
          this.selectRows = row;
        }
      } else {
        this.selectRows = selection;
      }
    },
    defaultSelected() {
      this.$nextTick(() => {
        const selectTable = this.$refs.selectTable;
        if (this.selectRows.length) {
          this.selectRows.forEach((item) => {
            this.dataList.forEach((row) => {
              if (row.boxSn === item.boxSn) {
                selectTable.toggleRowSelection(row, true);
              }
            });
          });
        }
      });
    },
    submitForm() {
      this.$emit("choosedItem", this.selectRows);
      this.show = false;
    },
  },
};
</script>

<style lang="scss">
.principal-table {
  thead {
    .el-table-column--selection {
      .cell {
        display: none;
      }
    }
  }
}
</style>