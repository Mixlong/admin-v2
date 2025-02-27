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
            style="width: 120px"
            v-model="queryParams.customerName"
            :data="customerData.data"
            :page="customerData.page"
            :hasMore="customerData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerList"
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="迪太订单号" prop="salesOrderNo">
          <el-input
            v-model="queryParams.salesOrderNo"
            filterable
            placeholder="请输入"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="客户订单号" prop="customerOrderNo">
          <el-input
            v-model="queryParams.customerOrderNo"
            filterable
            placeholder="请输入"
            clearable
            style="width: 120px"
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
            @change="changeCategory"
            style="width: 120px"
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
            :remote-method="getComputerNameList"
            style="width: 120px"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发货时间">
          <el-date-picker
            v-model="dateRange"
            value-format="timestamp"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleQuery"
            style="width: 240px"
          />
        </el-form-item>
        <!-- <el-form-item label="发货状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择发货状态"
            clearable
            @change="handleQuery"
          >
            <el-option
              v-for="(label, value) in statusList"
              :key="value"
              :label="label"
              :value="value"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>

        <el-row :gutter="10" class="mb8 fr">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              @click="handleAdd"
              v-hasPermi="['delivery:add:btn']"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" @click="toggleAllRows">
              全部{{ expandAll ? "展开" : "收缩" }}
            </el-button>
          </el-col>
          <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" /> -->
        </el-row>
      </el-form>
    </transition>

    <el-alert
      title="表格可通过按住Ctrl + 鼠标左键左右拖动"
      type="success"
      show-icon
    ></el-alert>

    <el-table
      ref="expandTableRef"
      id="drag_table"
      v-loading="loading"
      :height="tableHeight()"
      :data="dataList"
      border
    >
      <el-table-column type="expand" fixed>
        <div slot-scope="{ row }">
          <template v-if="row.list.length > 1">
            <el-table
              :max-height="400"
              :data="row.list.slice(1)"
              :header-cell-style="{ background: '#c0c0f4 !important' }"
              border
            >
              <el-table-column
                label="序号"
                width="58"
                type="index"
                align="center"
              ></el-table-column>
              <el-table-column
                label="客户名称"
                align="center"
                prop="customerName"
              >
                <span slot-scope="{ row }" v-NoData="row.customerName"></span>
              </el-table-column>
              <el-table-column
                label="客户订单号"
                align="center"
                prop="customerOrderNo"
              >
                <span
                  slot-scope="{ row }"
                  v-NoData="row.customerOrderNo"
                ></span>
              </el-table-column>
              <el-table-column
                label="计划发货数量"
                align="center"
                prop="shippingNumber"
              >
                <span slot-scope="{ row }" v-NoData="row.shippingNumber"></span>
              </el-table-column>
              <el-table-column
                label="送货单号"
                align="center"
                prop="oddNumbers"
              >
                <span slot-scope="{ row }" v-NoData="row.oddNumbers"></span>
              </el-table-column>
              <el-table-column label="操作时间" align="center">
                <template slot-scope="{ row }">
                  <div v-show="!Is_Empty(row.operationTime)">
                    <div>{{ parseTime(row.operationTime, "{y}-{m}-{d}") }}</div>
                    <span>{{
                      parseTime(row.operationTime, "{h}:{i}:{s}")
                    }}</span>
                  </div>
                  <div v-show="Is_Empty(row.operationTime)">- - -</div>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <!-- <template v-else>
            <el-empty description="暂无子单"></el-empty>
          </template> -->
        </div>
      </el-table-column>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="customerName">
        <span slot-scope="{ row }" v-NoData="row.customerName"></span>
      </el-table-column>
      <el-table-column
        label="迪太订单号"
        align="center"
        prop="salesOrderNo"
        width="140"
      />
      <el-table-column
        label="客户订单号"
        align="center"
        prop="customerOrderNo"
        width="150"
      >
        <span slot-scope="{ row }" v-NoData="row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column
        label="品类"
        align="center"
        prop="categoryName"
        width="120"
      >
        <span slot-scope="{ row }" v-NoData="row.categoryName"></span>
      </el-table-column>
      <el-table-column
        label="型号"
        align="center"
        prop="computerName"
        width="120"
      >
        <span slot-scope="{ row }" v-NoData="row.computerName"></span>
      </el-table-column>
      <el-table-column
        label="发货方式"
        align="center"
        prop="transportMode"
        width="100"
      >
        <span slot-scope="{ row }" v-NoData="row.transportMode"></span>
      </el-table-column>
      <el-table-column
        label="发货单号"
        align="center"
        prop="orderNumber"
        width="140"
      >
        <span slot-scope="{ row }" v-NoData="row.orderNumber"></span>
      </el-table-column>
      <el-table-column
        label="发货图片"
        align="center"
        prop="shippingPicture"
        width="100"
      >
        <template slot-scope="{ row }">
          <preview-img
            width="45px"
            height="45px"
            :isDisBadge="false"
            :url="row.shippingPicture"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="发货数量"
        align="center"
        prop="shippingNumber"
        width="100"
      >
        <span slot-scope="{ row }" v-NoData="row.shippingNumber"></span>
      </el-table-column>
      <el-table-column label="发货状态" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="tagType(row.status)">
            {{ statusList[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="收货人"
        align="center"
        prop="consignee"
        width="100"
      >
        <span slot-scope="{ row }" v-NoData="row.consignee"></span>
      </el-table-column>
      <el-table-column
        label="发货时间"
        align="center"
        prop="shippingTime"
        width="140"
        sortable
      >
        <template slot-scope="{ row }">
          <div v-show="!Is_Empty(row.shippingTime)">
            <div>{{ parseTime(row.shippingTime, "{y}-{m}-{d}") }}</div>
          </div>
          <div v-show="Is_Empty(row.shippingTime)">- - -</div>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        label="创建|更新人"
        align="center"
        prop="createBy"
      >
        <span
          slot-scope="{ row }"
          v-NoData="row.updateBy || row.createBy"
        ></span>
      </el-table-column>
      <el-table-column
        label="创建|更新时间"
        align="center"
        prop="createTime"
        width="140"
        sortable
      >
        <template slot-scope="{ row }">
          <div v-show="!Is_Empty(row.updateTime || row.createTime)">
            <div>
              {{
                parseTime(
                  row.updateTime || row.createTime,
                  "{y}-{m}-{d} {h}:{i}:{s}"
                )
              }}
            </div>
          </div>
          <div v-show="Is_Empty(row.updateTime || row.createTime)">- - -</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template slot-scope="{ row }">
          <Tooltip
            v-if="row.status === 1 || row.status === 3"
            v-hasPermi="['delivery:edit:btn']"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(row)"
          />

          <Tooltip
            v-hasPermi="['delivery:cancel:btn']"
            v-show="row.status !== 2 && row.status !== 4"
            icon="el-icon-close"
            content="取消"
            @click="handleCancel(row)"
          />

          <el-popconfirm
            title="确定要删除吗？"
            @confirm="handleDelete(row)"
            v-hasPermi="['delivery:delete:btn']"
          >
            <Tooltip
              style="margin: 0 10px"
              slot="reference"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
            />
          </el-popconfirm>

          <Tooltip
            v-hasPermi="['delivery:detail:btn']"
            icon="el-icon-tickets"
            content="发货详情"
            @click="seeDetail(row.id)"
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

    <edit-delivery
      ref="compUpdate"
      :isOrderFlag="isOrderFlag"
      v-bind="editParams"
    ></edit-delivery>

    <orderDetail
      ref="orderDetailRef"
      :statusList="statusList"
      :tagType="tagType"
    />
  </div>
</template>

<script>
import { deliveryList, cancelDelivery, deleteDelivery } from "@/api/delivery";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import commomFile from "./mixins";
import { commonJs, dragTableFn } from "@/mixins/common";

export default {
  name: "Delivery",
  mixins: [commomFile, commonJs, dragTableFn],
  components: {
    orderDetail: () => import("./components/orderDetail"),
    EditDelivery: () => import("./components/EditDelivery.vue"),
  },
  data() {
    return {
      isOrderFlag: false,
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
      dataList: [],
      expandAll: true, // 控制是否展开所有行
      title: "",
      typeCategoryList: [],
      statusList: {
        1: "待发货",
        2: "已取消",
        3: "未完成",
        4: "已出货",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        customerName: undefined,
        salesOrderNo: undefined,
        customerOrderNo: undefined,
        categoryName: undefined,
        computerName: undefined,
        status: undefined,
      },
      editParams: {},
    };
  },
  computed: {
    tagType() {
      return (status) => {
        switch (status) {
          case 1:
            return "warning";
          case 2:
            return "danger";
          case 3:
            return "info";
          case 4:
            return "success";
        }
      };
    },
  },
  created() {
    this.getParams();
    this.getCategoryComputerDict();
  },
  activated() {
    this.getParams();
  },
  methods: {
    // 展开、收起所有行
    toggleAllRows() {
      this.dataList.forEach((item) => {
        this.$refs.expandTableRef.toggleRowExpansion(item, this.expandAll);
      });

      this.expandAll = !this.expandAll;
    },
    getParams() {
      const {
        customerName,
        salesOrderNo,
        customerOrderNo,
        categoryName,
        computerName,
        isOrderFlag,
      } = this.$route.params;

      this.queryParams.customerName = customerName;
      this.queryParams.salesOrderNo = salesOrderNo;
      this.queryParams.customerOrderNo = customerOrderNo;
      this.queryParams.categoryName = categoryName;
      this.queryParams.computerName = computerName;
      this.isOrderFlag = isOrderFlag;

      this.getList();
    },
    getList() {
      this.loading = true;
      deliveryList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "beginTime",
          end: "endTime",
        })
      ).then((response) => {
        this.dataList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 删除
    handleDelete(row) {
      deleteDelivery([row.id]).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      });
    },
    // 取消
    handleCancel(row) {
      this.$confirm(
        '是否确认取消发货单号为"' + row.orderNumber + '"项吗?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return cancelDelivery(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("取消成功");
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
    // 查看详情
    seeDetail(id) {
      this.$refs.orderDetailRef.dialogVisible = true;
      this.$refs.orderDetailRef.getDetail(id);
    },
    handleAdd() {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;

      this.$refs.compUpdate.title = "新增发货计划";
      // if (this.isOrderFlag) {
      //   const { salesOrderNo, orderQuantity } = this.$route.params;
      //   this.editParams = {
      //     salesOrderNo,
      //     orderQuantity,
      //   };
      // }
    },
    handleUpdate(row) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      let params = Object.assign({}, row);
      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.title = "编辑发货计划";
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.isOrderFlag = false;
      this.editParams = {};
      this.dateRange = [];
      this.queryParams = {
        p: 1,
        l: 20,
        customerName: undefined,
        salesOrderNo: undefined,
        customerOrderNo: undefined,
        categoryName: undefined,
        computerName: undefined,
        status: undefined,
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>
