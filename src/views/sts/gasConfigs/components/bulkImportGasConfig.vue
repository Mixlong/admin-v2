<template>
  <el-dialog
    v-bind="$attrs"
    append-to-body
    center
    :close-on-click-modal="false"
    @close="$emit('update:visible', false)"
    top="-5vh"
  >
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="dataList"
      :row-key="getRowKeys"
      height="420"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :reserve-selection="true"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="备注" prop="remark" align="center">
        <template v-slot="{ row }">
            <span v-NoData="row.remark"></span>    
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { gasBulkConfigList, gasBulkConfigAuth } from "@/api/third/testApi";

export default {
  data() {
    return {
      isSubLoading: false,
      loading: true,
      dataList: [],
      ids: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        categoryId: "",
        id: "",
      },
    };
  },
  watch: {
    "$attrs.visible"(visible) {
      if (!visible) {
        this.ids = [];
        this.$refs.multipleTable.clearSelection();
      }
    },
  },
  methods: {
    getList() {
      this.loading = true;
      gasBulkConfigList(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.dataList = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submitForm() {
      if (!this.ids.length) {
        return this.msgWarning("请选择批量同步项！");
      }

      const list = this.ids.map(item => item.computerId);
      const data = {
        id: this.queryParams.id,
        list
      };

      this.isSubLoading = true;
      gasBulkConfigAuth(data).then(() => {
        this.msgSuccess("批量配置成功");
        this.$emit("update:visible", false);
      }).finally(() => {
        this.isSubLoading = false;
      })
    },
    checkSelectable(row) {
        return row.configId !== this.queryParams.id
    },
    getRowKeys(row) {
      return row.computerId;
    },
    handleSelectionChange(selection) {
      this.ids = selection;
    },
  },
};
</script>

<style>
</style>