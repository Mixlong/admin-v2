<template>
  <div class="app-container">
    <transition name="fade-transform-tb">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
      >
        <el-form-item label="客户名称" prop="customerName">
          <el-input
            v-model.trim="queryParams.customerName"
            clearable
            @keyup.native.enter="handleQuery"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="客户订单号" prop="customerOrderNo">
          <el-input
            v-model.trim="queryParams.customerOrderNo"
            clearable
            @keyup.native.enter="handleQuery"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="型号名称" prop="computerName">
          <el-input
            v-model.trim="queryParams.computerName"
            clearable
            @keyup.native.enter="handleQuery"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="订单类型" prop="orderType">
          <el-select
            v-model="queryParams.orderType"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(label, value) in orderTypeList"
              :key="label"
              :label="label"
              :value="String(value)"
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
            搜 索
          </el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
            重 置
          </el-button>
        </el-form-item>
      </el-form>
    </transition>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          v-hasPermi="['third:orderReview:add']"
          @click="handleAdd"
        >
          新 增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :height="tableHeight()"
      :data="dataList"
      border
    >
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="客户名称"
        align="center"
        prop="customerName"
        width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="客户订单号"
        align="center"
        prop="customerOrderNo"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column label="型号名称" align="center" min-width="140">
        <template slot-scope="{ row }">
          {{ isComputerList(row.list) }}
        </template>
      </el-table-column>
      <el-table-column
        label="下单日期"
        align="center"
        prop="orderDate"
        width="100"
      >
        <template slot-scope="{ row }">
          <span v-NoData="parseTime(row.orderDate, '{y}-{m}-{d}')"></span>
        </template>
      </el-table-column>
      <el-table-column
        label="期望日期"
        align="center"
        prop="expectedDate"
        width="100"
      >
        <template slot-scope="{ row }">
          <span v-NoData="parseTime(row.expectedDate, '{y}-{m}-{d}')"></span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单类型"
        align="center"
        prop="orderType"
        width="90"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.orderType === 0" type="primary">首次订单</el-tag>
          <el-tag v-if="row.orderType === 1" type="success">新增订单</el-tag>
          <el-tag v-if="row.orderType === 2" type="warning">其他</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" prop="file" width="80">
        <template slot-scope="{ row }">
          <preview-img
            :url="row.file"
            :srcList="[row.file]"
            width="45px"
            height="45px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="200"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <span v-NoData="row.remark"></span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable
        width="130"
      >
        <template slot-scope="{ row }">
          <span>
            {{ parseTime(row.createTime, "{y}-{m}-{d} {h}:{i}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template slot-scope="{ row }">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            v-hasPermi="['third:orderReview:update']"
            @click="handleUpdate(row)"
          />

          <Tooltip
            icon="el-icon-tickets"
            content="查看详情"
            v-hasPermi="['third:orderReview:review']"
            @click="handleReview(row)"
          />

          <el-popconfirm
            title="确定要删除吗？"
            @confirm="handleDelete(row)"
            v-hasPermi="['third:orderReview:delete']"
          >
            <Tooltip
              style="margin: 0 10px"
              slot="reference"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
            />
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

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <order-review-create-update
      ref="orderReviewRef"
    ></order-review-create-update>
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
      showSearch: true,
      loading: false,
      total: 0,
      dataList: [],
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
</style>