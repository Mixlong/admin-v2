<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="id">
        <el-select v-model="queryParams.id" filterable v-loadMore="loadMore" placeholder="请选择订单编号" clearable
          @change="handleQuery">
          <el-option v-for="item in typeCategoryList" :key="item.id" :label="item.salesOrderNo" :value="item.salesOrderNo">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-select v-model="queryParams.customerName" filterable placeholder="请选择客户名称" clearable @change="handleQuery">
          <el-option v-for="item in orderCusList" :key="item.id" :label="`${item.no}-${item.name}`" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable @change="handleQuery">
          <el-option v-for="(value, index) in statusList" :key="index" :label="value" :value="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table border v-loading="loading" :height="tableHeight()" :data="list">
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
              (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户订单号" align="center" prop="customerOrderNo" />
      <el-table-column label="销售订单号" align="center" prop="salesOrderNo" />
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="评审表" align="center" width="200">
        <template slot-scope="{row}">
          <preview-img v-if="row.orderReviewForm" :url="row.orderReviewForm" :srcList="[row.orderReviewForm]" />
        </template>
      </el-table-column>
      <el-table-column label="订单总数量" align="center" prop="orderNum" />
      <el-table-column label="已出货率" align="center" width="120">
        <template slot-scope="{row}">{{ row.shipmentRate + '%' }}</template>
      </el-table-column>
      <el-table-column label="排产状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag size="mini" :type="tagType(row.schedulingStatus )">{{ statusList[row.schedulingStatus ] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" width="170">
        <template slot-scope="{row}">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column width="100" label="销售人员" align="center" prop="createBy" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button class="text-green" size="mini" type="text"
            @click="$router.push(`/www/planSchedule?id=${row.salesOrderNo}`)">排产计划</el-button>
          <el-button size="mini" type="text" @click="seeDetail(row.id)">订单详情</el-button>
          <el-button class="text-red" size="mini" type="text" @click="handleUpdate(row.id)">修改</el-button>
          <el-button v-if="row.schedulingStatus  === 1" class="text-gray" size="mini" type="text" @click="onOrderCancel(row.id)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />
    <CompUpdate ref="compUpdate" :title="title" :orderCusList="orderCusList" />
    <orderDetail ref="orderDetailRef" />
  </div>
</template>

<script>
import { orderList, getOrderCusList, orderCancel } from "@/api/order";
import { listCustomer } from "@/api/third/sample";
import CompUpdate from "./components/update";
import orderDetail from "./components/orderDetail"

export default {
  components: { CompUpdate, orderDetail },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      title: "",
      typeCategoryList: [],
      typeListTotal: 0,
      orderCusList: [],
      statusList: {
        0: '已取消',
        1: '正常排单',
        2: '已完成',
        3: '部分排单'
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        id: null,
        customerName: null,
        status: null
      },
      pageData: {
        p: 1,
        l: 10
      }
    };
  },
  computed: {
    tagType() {
      return status => {
        switch (status) {
          case 0: return 'info';
          case 1: return 'primary';
          case 2: return 'success';
          case 3: return 'warning'
        }
      }
    }
  },
  provide() {
    return {
      'getOrderCusListData': this.getOrderCusListData
    }
  },
  created() {
    this.getList();
    this.getOrderCusListData()
    this.getTypeCateList()
  },
  methods: {
    getList() {
      this.loading = true;
      orderList(this.queryParams).then(
        (response) => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    loadMore() {
      if(this.typeCategoryList.length < this.typeListTotal) {
        this.pageData.p ++
        this.getTypeCateList()
      }
    },
    getTypeCateList() {
      orderList(this.pageData).then(
        (res) => {
          const { list, total } = res.data
          this.typeCategoryList = this.typeCategoryList.concat(list)
          this.typeListTotal = total;
        }
      )
    },
    // 获取客户
    getOrderCusListData() {
      getOrderCusList().then(res => {
        this.orderCusList = res.data
      })
    },
    // 查看订单详情
    seeDetail(id) {
      this.$refs.orderDetailRef.dialogVisible = true
      this.$refs.orderDetailRef.getOrderDetail(id)
    },
    // 取消
    onOrderCancel(id) {
      this.$confirm("确定要取消订单吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        orderCancel(id).then(() => {
          this.getList();
          this.$message({
            type: "success",
            message: "订单取消成功!",
          });
        });
      });
    },
    handleAdd() {
      this.title = "新增订单";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleUpdate(id) {
      this.$refs.compUpdate.dialogVisible = true;
      this.title = "修改订单";
      this.$refs.compUpdate.getOrderDetail(id)
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
    }
  },
};
</script>

<style>
</style>