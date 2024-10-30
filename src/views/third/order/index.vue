<template>
  <div class="app-container">
    <transition name="fade-transform-tb">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        v-show="showSearch"
      >
        <el-form-item label="客户名称" prop="customerName">
          <select-loadMore
            style="width: 100%"
            v-model="queryParams.customerName"
            :data="customerData.data"
            :page="customerData.page"
            :hasMore="customerData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerList"
            placeholder="请选择客户名称"
          />
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
          <el-button
            type="primary"
            icon="el-icon-search"
            v-hasPermi="['third:order:query']"
            @click="handleQuery"
          >
            搜索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            v-hasPermi="['third:order:reset']"
            @click="resetQuery"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </transition>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['third:order:add']"
        >
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
      <el-table-column label="客户名称" align="center" prop="customerName">
        <span slot-scope="{ row }" v-NoData="row.customerName"></span>
      </el-table-column>
      <el-table-column label="迪太订单号" align="center" prop="salesOrderNo" />
      <el-table-column label="客户订单号" align="center" prop="customerOrderNo">
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
      <el-table-column label="订单状态" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="tagType(row.status)">
            {{ statusList[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="排产状态" align="center" width="120">
        <template slot-scope="{ row }">
          {{ productStatusList[row.productStatus] }}
        </template>
      </el-table-column> -->
      <el-table-column
        width="90"
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
      <el-table-column label="操作" align="center" width="210">
        <template slot-scope="{ row }">
          <div class="flex flex-start">
            <el-button
              class="text-green"
              type="text"
              v-hasPermi="['third:order:prodSchedule:detail']"
              @click="$router.push(`/www/planSchedule?orderId=${row.id}`)"
            >
              排产详情
            </el-button>

            <el-button
              v-hasPermi="['third:order:prod:record']"
              type="text"
              @click="
                $router.push(
                  `/www/PartInfoView/production?orderId=${row.customerOrderNo}`
                )
              "
            >
              生产记录
            </el-button>

            <el-button
              type="text"
              v-hasPermi="['third:order:detail']"
              @click="seeDetail(row.id)"
            >
              订单详情
            </el-button>
          </div>
          <div class="flex flex-start">
            <el-button
              class="text-red"
              type="text"
              v-hasPermi="['third:order:update']"
              @click="handleUpdate(row.id)"
            >
              编辑
            </el-button>
            <!-- 审核 -->
            <el-button
              type="text"
              @click="onOrderAuth(row.id)"
              v-hasPermi="['third:order:check']"
              v-show="row.status === 0"
            >
              审核
            </el-button>

            <el-button
              class="text-gray"
              type="text"
              @click="onOrderCancel(row.id)"
              v-hasPermi="['third:order:cancel']"
              v-show="row.status !== 2"
            >
              取消
            </el-button>
            <el-button
              type="text"
              v-hasPermi="['third:order:log']"
              @click="onEditLog(row.id)"
            >
              日志
            </el-button>

            <Tooltip
              v-hasPermi="['third:order:copy']"
              icon="el-icon-document-copy"
              content="复制"
              @click="rowDbClick(row)"
            />

            <Tooltip
              v-hasPermi="['third:order:planSchedule']"
              icon="el-icon-position"
              content="排产管理"
              @click="
                handleNameToPage('PlanSchedule', {
                  categoryId: row.categoryId,
                  computerId: row.computerId,
                  salesOrderNo: row.salesOrderNo,
                  orderId: row.id,
                })
              "
            />

            <Tooltip
              icon="el-icon-box"
              content="发货管理"
              @click="
                handleNameToPage('Delivery', {
                  customerName: row.customerName,
                  salesOrderNo: row.salesOrderNo,
                  customerOrderNo: row.customerOrderNo,
                  categoryName: row.categoryName,
                  computerName: row.computerName,
                  orderQuantity: row.orderQuantity,
                  isOrderFlag: true,
                })
              "
            />
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

    <orderDetail
      ref="orderDetailRef"
      :statusList="statusList"
      :productStatusList="productStatusList"
    />
    <edit-log ref="editLogRef" />
  </div>
</template>

<script>
import { orderList, orderCancel, orderAuth } from "@/api/order";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import commomFile from "./mixins";
import { commonJs } from "@/mixins/common";

export default {
  name: "Order",
  mixins: [commomFile, commonJs],
  components: {
    orderDetail: () => import("./components/orderDetail"),
    EditLog: () => import("./components/log.vue"),
  },
  data() {
    return {
      copyRowData: {},
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
      statusList: {
        0: "待审核",
        1: "正常",
        2: "取消",
      },
      productStatusList: {
        0: "未排产",
        1: "smt已排产、包装未排产",
        2: "smt已排产、包装已排产",
        3: "smt部分排产、包装部分排产",
        4: "smt已排产、包装部分排产",
        5: "smt部分排产、包装已排产",
        6: "smt部分排产、包装未排产",
        7: "smt未排产、包装部分排产",
        8: "smt未排产、包装已排产",
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getCategoryComputerDict();
    });
  },
  created() {
    this.getList();
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
      )[0]?.computerList;
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
    // 复制
    rowDbClick(row) {
      this.$copyText(row).then(
        () => {
          this.copyRowData = Object.assign({}, row);
          this.warningMessage("复制成功", 1);
        },
        () => {
          this.warningMessage("复制失败", 3);
        }
      );
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
      if (this.copyRowData.id) {
        sessionStorage.setItem("copyRowData", JSON.stringify(this.copyRowData));
      }
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
    /** 修改日志 */
    onEditLog(id) {
      this.$refs.editLogRef.dialogVisible = true;
      this.$refs.editLogRef.getList(id);
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
