<template>
  <div :class="[searchOrderCode ? '' : 'app-container']">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="批次号" prop="batchNumber">
        <el-input v-model="queryParams.batchNumber" placeholder="请输入批次号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="工单号" prop="orderCode">
        <select-loadMore v-model="queryParams.orderCode" :data="orderData.data" :page="orderData.page"
          :hasMore="orderData.more" dictLabel="orderCode" dictValue="orderCode" :request="getProdPlantList"
          placeholder="请选择工单号" style="width: 100%">
        </select-loadMore>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="brandList" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="工单号" prop="orderCode" align="center">
        <span slot-scope="{ row }" v-NoData="row.orderCode"></span>
      </el-table-column>
      <el-table-column label="批次号" prop="batchNumber" align="center" />
      <el-table-column label="物料类型" prop="type" align="center">
        <template v-slot="{ row }">
          {{ typeList[row.type] }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />
  </div>
</template>

<script>
import { trackLogList } from "@/api/third/fileConfig";
import { orderWorkList } from "@/api/third/prodPlant";

export default {
  name: "TrackRecord",
  props: {
    searchOrderCode: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      brandList: [],
      computerOptions: [],
      // 物料类型
      typeList: {
        1: "壳料",
        2: "屏幕",
        3: "线缆",
        4: "蓝牙",
      },
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        batchNumber: "",
        orderCode: "",
      },
    };
  },
  watch: {
    searchOrderCode: {
      handler(val) {
        this.queryParams.orderCode = val;
        this.getList();
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getList();
  },
  activated() {
    const { orderCode } = this.$route.params;
    this.queryParams.orderCode = orderCode;
    if (!this.searchOrderCode) {
      this.getList();
    }
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      this.brandList = []
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
    /** 生产工单 */
    getProdPlantList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        orderWorkList({
          p: page,
          orderCode: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.orderData.data = [...this.orderData.data, ...list];
          } else {
            this.orderData.data = list;
          }
          this.orderData.more = pageNum * pageSize < total;
          this.orderData.page = pageNum;
          resolve();
        });
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
  },
};
</script>
