<template>
  <el-dialog
    title="选择视觉版本"
    :visible.sync="visible"
    width="900px"
    append-to-body
    :close-on-click-modal="false"
    class="dialog-scroll"
  >
    <el-form :inline="true" :model="queryParams" size="small" v-if="false">
      <el-form-item label="版本名称">
        <el-input
          v-model="queryParams.version"
          placeholder="请输入版本名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" @current-change="handleCurrentChange" highlight-current-row border height="450px">
      <el-table-column label="选择" width="55" align="center">
        <template slot-scope="scope">
          <el-radio v-model="selectedId" :label="scope.row.id"><i></i></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="版本名称" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
    </el-table>

    <div style="text-align: right; margin-top: 20px;">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            :current-page="queryParams.p"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="queryParams.l"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirmSelect" :disabled="!selectedRow">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getVisionVersionList } from "@/api/third/vision";

export default {
  name: "VisionVersionSelector",
  data() {
    return {
      visible: false,
      loading: false,
      dataList: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        version: undefined, // 对应接口查询参数
        key: undefined // categoryId
      },
      selectedId: null,
      selectedRow: null
    };
  },
  methods: {
    init(categoryId, modelName = '') {
      this.queryParams.key = categoryId;
      this.queryParams.p = 1;
      this.queryParams.version = modelName;
      this.selectedId = null;
      this.selectedRow = null;
      this.visible = true;
      this.getList();
    },
    getList() {
      this.loading = true;
      getVisionVersionList(this.queryParams).then(response => {
        this.dataList = response.data.list;
        this.total = response.data.total;
      }).finally(() => {
        this.loading = false
      });
    },
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams.version = '';
      this.handleQuery();
    },
    handleCurrentChange(currentRow) {
       if (currentRow) {
        this.selectedRow = currentRow;
        this.selectedId = currentRow.id;
       }
    },
    handleSizeChange(val) {
      this.queryParams.l = val;
      this.getList();
    },
    handlePageChange(val) {
      this.queryParams.p = val;
      this.getList();
    },
    confirmSelect() {
      if (this.selectedRow) {
        this.$emit("success", this.selectedRow);
        this.visible = false;
      }
    }
  }
};
</script>
