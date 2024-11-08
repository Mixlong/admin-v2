<template>
  <el-drawer
    size="60%"
    :visible="isDrawerShow"
    direction="rtl"
    @close="$emit('update:isDrawerShow', false)"
  >
    <template v-slot:title>
      <span style="font-weight: bold; font-size: 20px">订单列表</span>
    </template>
    <div class="padding-xs">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="90px"
      >
        <el-form-item label="客户名称" prop="customerName">
          <el-input
            v-model="queryParams.customerName"
            readonly
            style="width: 200px"
          ></el-input>
        </el-form-item>
        <el-form-item label="迪太订单号" prop="salesOrderNo">
          <el-input
            v-model="queryParams.salesOrderNo"
            filterable
            placeholder="请输入迪太订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="客户订单号" prop="customerOrderNo">
          <el-input
            v-model="queryParams.customerOrderNo"
            filterable
            placeholder="请输入客户订单号"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="所属品类" prop="categoryName">
          <el-select
            v-model="queryParams.categoryName"
            filterable
            allow-create
            clearable
            :loading="isCateLoading"
            placeholder="请选择所属品类"
            @change="changeCategory"
            style="width: 200px"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerName">
          <el-select
            filterable
            remote
            clearable
            v-model="queryParams.computerName"
            placeholder="请选择仪表型号"
            :remote-method="getComputerNameList"
            style="width: 200px"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出货时间">
          <el-date-picker
            v-model="dateRange"
            style="width: 250px"
            value-format="timestamp"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="tabRef"
        v-loading="loading"
        :height="tableHeight()"
        :row-key="getRowKeys"
        :data="orderList"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          :reserve-selection="true"
        />
        <el-table-column label="客户名称" align="center" prop="customerName">
          <span slot-scope="{ row }" v-NoData="row.customerName"></span>
        </el-table-column>
        <el-table-column
          label="迪太订单号"
          align="center"
          prop="salesOrderNo"
        />
        <el-table-column
          label="客户订单号"
          align="center"
          prop="customerOrderNo"
        >
          <span slot-scope="{ row }" v-NoData="row.customerOrderNo"></span>
        </el-table-column>
        <el-table-column label="品类" align="center" prop="categoryName">
          <span slot-scope="{ row }" v-NoData="row.categoryName"></span>
        </el-table-column>
        <el-table-column label="型号" align="center" prop="computerName">
          <span slot-scope="{ row }" v-NoData="row.computerName"></span>
        </el-table-column>
        <el-table-column
          label="BOM编码"
          align="center"
          prop="bomCode"
          width="100"
        >
          <span slot-scope="{ row }" v-NoData="row.bomCode"></span>
        </el-table-column>
        <el-table-column
          label="芯片版本"
          align="center"
          prop="chipVersion"
          width="100"
        >
          <span slot-scope="{ row }" v-NoData="row.chipVersion"></span>
        </el-table-column>
        <el-table-column
          label="订单数量"
          align="center"
          prop="orderQuantity"
          width="100"
        >
          <span slot-scope="{ row }" v-NoData="row.orderQuantity"></span>
        </el-table-column>
        <el-table-column label="出货日期" align="center" width="100">
          <span
            slot-scope="{ row }"
            v-NoData="parseTime(row.sellTime, '{y}-{m}-{d}')"
          ></span>
        </el-table-column>
      </el-table>
      <el-button
        class="w100"
        type="primary"
        plain
        size="mini"
        @click="handleSubmitOrder"
      >
        确 认
      </el-button>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </div>
  </el-drawer>
</template>

<script>
import { getOrderCusList } from "@/api/order";
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import { orderList } from "@/api/order";

export default {
  props: {
    isDrawerShow: {
      type: Boolean,
      default: false,
    },
    customerOrderData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isCateLoading: false,
      loading: false,
      rowSelectFlag: false,
      total: 0,
      // 客户名称
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      // 品类
      dictList: [],
      // 型号
      computerOptions: [],
      // 订单列表
      orderList: [],
      dateRange: [],
      // 多订单
      moreOrderData: [],
      oldMoreOrderData: [],
      queryParams: {
        p: 1,
        l: 20,
        customerName: undefined,
        salesOrderNo: undefined,
        customerOrderNo: undefined,
        bomCode: undefined,
        categoryName: undefined,
        computerName: undefined,
        status: 1,
      },
    };
  },
  watch: {
    isDrawerShow(bool) {
      if (bool) {
        this.getCategoryComputerDict();
        const { list = [] } = this.customerOrderData;
        this.oldMoreOrderData = list;
        console.log("oldMoreOrderData", this.oldMoreOrderData)
        this.getList();
      } else {
        this.$refs.tabRef.clearSelection();
      }
    },
  },
  methods: {
    getRowKeys(row) {
      return row.id;
    },
    showCheck(selection) {
      if (!this.oldMoreOrderData.length) return;

      setTimeout(() => {
        this.rowSelectFlag = true;
        selection.forEach((row) => {
          const matchedIndex = this.oldMoreOrderData.findIndex(
            (item) => item.orderId === row.id
          );
          this.$refs["tabRef"].toggleRowSelection(row, matchedIndex != -1);
        });
        this.rowSelectFlag = false;
      }, 0);
    },
    /** 客户名称 */
    getCustomerList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getOrderCusList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerData.data = [...this.customerData.data, ...list];
          } else {
            this.customerData.data = list;
          }
          this.customerData.more = pageNum * pageSize < total;
          this.customerData.page = pageNum;
          resolve();
        });
      });
    },
    // 品类
    getCategoryComputerDict() {
      this.isCateLoading = true;
      categoryComputerDict()
        .then((res) => {
          this.dictList = res.data;
          this.isCateLoading = false;
        })
        .catch(() => {
          this.isCateLoading = false;
        });
    },
    changeCategory(categoryName) {
      if (!categoryName) return;

      this.queryParams.computerName = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0]?.computerList;
    },
    // 型号查询
    getComputerNameList(name) {
      if (name) {
        computerNameList({
          name,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    getList() {
      this.loading = true;
      this.queryParams.customerName = this.customerOrderData.customerName;

      orderList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startTime",
          end: "endTime",
        })
      ).then((res) => {
        const { list, total } = res.data;
        // this.orderList = list.filter(
        //   (item) => item.id !== this.customerOrderData.orderId
        // );
        this.orderList = list;
        this.total = total;
        this.loading = false;

        this.showCheck(this.orderList);
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      console.log("selection", selection)
      // if (this.rowSelectFlag) return;
      this.moreOrderData = selection;
    },
    handleSubmitOrder() {
      console.log("this.moreOrderData", this.moreOrderData);
      if (!this.moreOrderData.length) {
        this.msgError("至少选择一项订单");
        return;
      }

      this.$emit("update:isDrawerShow", false);
      this.$emit("sendMoreOrder", this.moreOrderData);
    },
  },
};
</script>

<style></style>