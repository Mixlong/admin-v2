<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="客户名称" prop="customerName">
        <el-select
          v-model="queryParams.customerName"
          filterable
          placeholder="请选择客户名称"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="item in orderCusList"
            :key="item.id"
            :label="`${item.no}-${item.name}`"
            :value="item.name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="迪太订单号" prop="salesOrderNo">
        <el-input
          v-model="queryParams.salesOrderNo"
          filterable
          placeholder="请输入迪太订单号"
          clearable
        />
      </el-form-item>
      <el-form-item label="客户订单号" prop="customerOrderNo">
        <el-input
          v-model="queryParams.customerOrderNo"
          filterable
          placeholder="请输入客户订单号"
          clearable
        />
      </el-form-item>
      <el-form-item label="Bom编号" prop="bomCode">
        <el-input
          v-model="queryParams.bomCode"
          filterable
          placeholder="请输入Bom编号"
          clearable
        />
      </el-form-item>
      <el-form-item label="所属品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          allow-create
          clearable
          :loading="isCateLoading"
          loading-text
          placeholder="请选择所属品类"
          @change="changeCategory"
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
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="(value, index) in statusList"
            :key="index"
            :label="value"
            :value="index"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :height="tableHeight()" :data="list">
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="迪太订单号" align="center" prop="salesOrderNo" />
      <el-table-column
        label="客户订单号"
        align="center"
        prop="customerOrderNo"
      />
      <el-table-column label="品类" align="center" prop="categoryName" />
      <el-table-column label="型号" align="center" prop="computerName" />
      <el-table-column label="BOM编码" align="center" prop="bomCode" />
      <el-table-column label="芯片版本" align="center" prop="chipVersion" />
      <el-table-column label="订单数量" align="center" prop="orderQuantity" />
      <el-table-column label="出货日期" align="center" width="170">
        <template slot-scope="{ row }">
          {{ parseTime(row.sellTime) }}
        </template>
      </el-table-column>
      <el-table-column label="客户要求到货日期" align="center" width="170">
        <template slot-scope="{ row }">
          {{ parseTime(row.arrivalTime) }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" width="100">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="tagType(row.status)">
            {{ statusList[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        label="创建人"
        align="center"
        prop="createBy"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="140"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template slot-scope="{ row }">
          <div class="flex flex-start">
            <el-button
              class="text-green"
              type="text"
              @click="$router.push(`/www/planSchedule?orderId=${row.id}`)"
            >
              排产详情
            </el-button>
            <el-button
              type="text"
              @click="
                $router.push(
                  `/www/PartInfoView/production?orderId=${row.customerOrderNo}`
                )
              "
            >
              生产记录
            </el-button>
            <el-button type="text" @click="seeDetail(row.id)">
              订单详情
            </el-button>
          </div>
          <div class="flex flex-start">
            <el-button
              class="text-red"
              type="text"
              @click="handleUpdate(row.id)"
            >
              修改
            </el-button>
            <!-- 审核 -->
            <el-button
              type="text"
              @click="onOrderAuth(row.id)"
              v-show="row.status === 0"
            >
              审核
            </el-button>
            <el-button
              class="text-gray"
              type="text"
              @click="onOrderCancel(row.id)"
              v-show="row.status !== 2"
            >
              取消
            </el-button>
          </div>
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

    <orderDetail ref="orderDetailRef" :statusList="statusList" />
  </div>
</template>

<script>
import {
  orderList,
  getOrderCusList,
  orderCancel,
  orderAuth,
} from "@/api/order";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import orderDetail from "./components/orderDetail";

export default {
  components: { orderDetail },
  data() {
    return {
      dateRange: [],
      // 品类
      dictList: [],
      // 型号
      computerOptions: [],
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      isCateLoading: false,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      title: "",
      typeCategoryList: [],
      orderCusList: [],
      statusList: {
        0: "待审核",
        1: "正常",
        2: "取消",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        customerName: undefined,
        salesOrderNo: undefined,
        customerOrderNo: undefined,
        bomCode: undefined,
        categoryName: undefined,
        computerName: undefined,
        status: undefined,
      },
    };
  },
  computed: {
    tagType() {
      return (status) => {
        switch (status) {
          case 0:
            return "warning";
          case 1:
            return "success";
          case 2:
            return "info";
        }
      };
    },
  },
  created() {
    this.getCategoryComputerDict();
    this.getList();
    this.getOrderCusListData();
  },
  methods: {
    getList() {
      this.loading = true;
      orderList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startTime",
          end: "endTime",
        })
      ).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
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
    // 型号
    changeCategory(val) {
      if (!val) return;
      this.$set(this.queryParams, "computerName", "");
      this.getList();
      this.computerOptions = this.dictList.filter(
        (item) => item.name === val
      )[0].computerList;
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 获取客户
    getOrderCusListData() {
      getOrderCusList().then((res) => {
        this.orderCusList = res.data;
      });
    },
    // 查看订单详情
    seeDetail(id) {
      this.$refs.orderDetailRef.dialogVisible = true;
      this.$refs.orderDetailRef.getOrderDetail(id);
    },
    // 审核
    onOrderAuth(id) {
      this.$confirm("确定该订单审核通过吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          orderAuth(id).then(() => {
            this.getList();
            this.$message({
              type: "success",
              message: "订单审核通过!",
            });
          });
        })
        .catch(() => {});
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
      this.$router.push({
        path: "/addOrUpdate/CommonPage",
        query: {
          pageName: "AddOrderPage",
          title: "新增订单",
        },
      });
    },
    handleUpdate(id) {
      this.$router.push({
        path: "/addOrUpdate/CommonPage",
        query: {
          pageName: "AddOrderPage",
          title: "修改订单",
          id,
        },
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
  },
};
</script>
