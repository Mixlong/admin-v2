<template>
  <el-dialog
    v-bind="$attrs"
    width="800px"
    top="-2vh"
    append-to-body
    center
    :close-on-click-modal="false"
    @close="$emit('update:visible', false)"
  >
    <el-table v-loading="loading" :data="dataList" max-height="450" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime, '{y}/{m}/{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="100"
      />
      <el-table-column label="操作" align="center" width="60">
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-download"
            content="下载"
            @click="urlDownload(scope.row.file)"
          />
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
  </el-dialog>
</template>

<script>
import { scriptUpdateLog } from "@/api/third/simulateScript";

export default {
  data() {
    return {
      dataList: [],
      total: 0,
      loading: false,
      queryParams: {
        p: 1,
        l: 10,
        scriptId: "",
      },
    };
  },
  methods: {
    getList() {
      this.loading = true;
      scriptUpdateLog(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.dataList = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style>
</style>