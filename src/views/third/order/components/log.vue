<template>
  <div>
    <el-dialog
      title="日志"
      class="orderDetail"
      :visible.sync="dialogVisible"
      center
      append-to-body
      top="1vh"
      width="800px"
      :close-on-click-modal="true"
    >
      <el-table
        v-loading="loading"
        :height="tableHeight()"
        :data="list"
        max-height="600"
      >
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="原因"
          align="center"
          prop="msg"
          show-overflow-tooltip
        />
        <el-table-column label="创建时间" align="center" width="140">
          <template slot-scope="{ row }">
            {{ parseTime(row.createTime) }}
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
  </div>
</template>

<script>
import { orderEditLog } from "@/api/order";
export default {
  name: "EditLog",

  data() {
    return {
      dialogVisible: false,
      loading: true,
      queryParams: {
        p: 1,
        l: 20,
      },
      total: 0,
      // 表格数据
      list: [],
    };
  },
  methods: {
    getList(id) {
      this.loading = true;
      orderEditLog({ id, ...this.queryParams }).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
  },
};
</script>
