<template>
  <div class="app-container order-review-page">
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="order-review-query">
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model.trim="queryParams.customerName" clearable @keyup.native.enter="handleQuery"
          placeholder="请输入" />
      </el-form-item>

      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input v-model.trim="queryParams.customerOrderNo" clearable @keyup.native.enter="handleQuery"
          placeholder="请输入" />
      </el-form-item>

      <el-form-item label="型号名称" prop="computerName">
        <el-input v-model.trim="queryParams.computerName" clearable @keyup.native.enter="handleQuery"
          placeholder="请输入" />
      </el-form-item>

      <el-form-item label="订单类型" prop="orderType">
        <el-select v-model="queryParams.orderType" filterable clearable placeholder="请选择">
          <el-option v-for="(label, value) in orderTypeList" :key="label" :label="label" :value="String(value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">
          搜 索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" v-hasPermi="['third:orderReview:add']"
          @click="handleAdd">
          新 增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="orderReviewTable" v-loading="loading" :max-height="orderReviewTableHeight" :data="dataList" border>
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="customerName" width="100" />
      <el-table-column label="客户订单号" align="center" prop="customerOrderNo" width="150" />
      <el-table-column label="型号名称" align="center" min-width="140">
        <template slot-scope="{ row }">
          {{ isComputerList(row.list) }}
        </template>
      </el-table-column>
      <el-table-column label="下单日期" align="center" prop="orderDate" width="100">
        <template slot-scope="{ row }">
          <span v-NoData="parseTime(row.orderDate, '{y}-{m}-{d}')"></span>
        </template>
      </el-table-column>
      <el-table-column label="期望交期" align="center" prop="expectedDate" width="100">
        <template slot-scope="{ row }">
          <span v-NoData="parseTime(row.expectedDate, '{y}-{m}-{d}')"></span>
        </template>
      </el-table-column>
      <el-table-column label="订单类型" align="center" prop="orderType" width="90">
        <template slot-scope="{ row }">
          <el-tag v-if="row.orderType === 0" type="primary">首次订单</el-tag>
          <el-tag v-if="row.orderType === 1" type="success">新增订单</el-tag>
          <el-tag v-if="row.orderType === 2" type="warning">其他</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" prop="file" width="80">
        <template slot-scope="{ row }">
          <preview-img :url="row.file" :srcList="[row.file]" width="45px" height="45px" :isDisBadge="false" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="200">
        <template slot-scope="{ row }">
          <span v-NoData="row.remark"></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" sortable width="130">
        <template slot-scope="{ row }">
          <span>
            {{ parseTime(row.createTime, "{y}-{m}-{d} {h}:{i}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template slot-scope="{ row }">
          <Tooltip icon="el-icon-edit" content="编辑" v-hasPermi="['third:orderReview:update']"
            @click="handleUpdate(row)" />

          <Tooltip icon="el-icon-tickets" content="查看详情" v-hasPermi="['third:orderReview:review']"
            @click="handleReview(row)" />

          <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(row)" v-hasPermi="['third:orderReview:delete']">
            <Tooltip style="margin: 0 10px" slot="reference" icon="el-icon-delete" :className="['text-red']"
              content="删除" />
          </el-popconfirm>
          <!-- <Tooltip
            icon="el-icon-coordinate"
            content="审核"
            v-hasPermi="['third:orderReview:check']"
            @click="handleAuthChange(row)"
          /> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <order-review-create-update ref="orderReviewRef"></order-review-create-update>
  </div>
</template>

<script>
import { judgeOrderList, judgeDeleteOrder } from "@/api/third/orderReview.js";
import OrderReviewCreateUpdate from "./orderReviewCreateUpdate.vue";
import { resultList as resultListData } from "./JsonData";

export default {
  name: "OrderReview",
  components: {
    OrderReviewCreateUpdate,
  },
  data() {
    return {
      loading: false,
      total: 0,
      dataList: [],
      orderReviewTableHeight: 400,
      orderTypeList: {
        0: "首次订单",
        1: "新增订单",
        2: "其他",
      },
      queryParams: {
        p: 1,
        l: 20,
        customerName: "",
        customerOrderNo: "",
        computerName: "",
        orderType: "",
      },
    };
  },
  computed: {
    isComputerList() {
      return (list) => {
        if (list.length) {
          const computerData = list.map((item) => item.computerName);
          return computerData.join("，");
        }
      };
    },
  },
  created() {
    this.getList();
  },
  mounted() {
    this.updateTableHeight();
    window.addEventListener("resize", this.updateTableHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateTableHeight);
  },
  watch: {
    total() {
      this.$nextTick(this.updateTableHeight);
    },
  },
  methods: {
    getList() {
      this.loading = true;
      judgeOrderList(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.dataList = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
          this.$nextTick(this.updateTableHeight);
        });
    },
    updateTableHeight() {
      this.$nextTick(() => {
        if (!this.$refs.orderReviewTable) {
          return;
        }

        let clientHeight = document.documentElement.clientHeight;
        if (window.__POWERED_BY_WUJIE__) {
          try {
            clientHeight = window.parent.document.documentElement.clientHeight;
          } catch (e) {
            clientHeight = document.documentElement.clientHeight;
          }
        }

        const tableTop =
          this.$refs.orderReviewTable.$el.getBoundingClientRect().top;
        const containerStyle = window.getComputedStyle(this.$el);
        const containerBottom =
          parseFloat(containerStyle.paddingBottom || 0) +
          parseFloat(containerStyle.marginBottom || 0);
        this.orderReviewTableHeight = Math.max(
          clientHeight - tableTop - containerBottom - 44,
          260
        );
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.p = 1;
      this.handleQuery();
    },
    handleAdd() {
      this.$refs.orderReviewRef.dialogVisible = true;
      this.$refs.orderReviewRef.form = {
        customerName: "",
        customerOrderNo: "",
        orderDate: "",
        expectedDate: "",
        orderType: 2,
        list: [
          {
            computerName: "",
            description: "",
            num: "",
            material: "",
            remark: "",
          },
        ],
        resultList: this.lodash.cloneDeep(resultListData),
      };
    },
    handleUpdate(row) {
      const { orderExcelJson, id } = row;
      this.$refs.orderReviewRef.dialogVisible = true;
      this.$refs.orderReviewRef.form = {
        id,
        ...JSON.parse(orderExcelJson),
      };
    },
    handleReview(row) {
      const { orderExcelJson, id } = row;
      this.$refs.orderReviewRef.dialogVisible = true;
      this.$refs.orderReviewRef.isReadonly = true;
      this.$refs.orderReviewRef.form = {
        id,
        ...JSON.parse(orderExcelJson),
      };
    },
    // 删除
    handleDelete(row) {
      judgeDeleteOrder(row.id).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      });
    },
    // 审核
    handleAuthChange(row) {
      let text = row.status === 0 ? "启用" : "停用";
      this.$confirm("确认要" + text + "吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const authData = { id: row.id, status: row.status };

          judgeOrderAuth(authData).then(() => {
            this.msgSuccess(text + "成功");
          });
        })
        .catch(() => {
          row.status = row.status === 0 ? 1 : 0;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.order-review-page {
  padding-top: 20px;
  padding-bottom: 16px;
}

.order-review-query {
  margin-bottom: 10px;

  ::v-deep .el-form-item {
    margin-bottom: 0;
  }
}

::v-deep .pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: auto;
  margin: 6px 0 0;
  padding: 0 16px !important;
  background: #fff;
}

::v-deep .pagination-container .el-pagination {
  position: static;
}
</style>
