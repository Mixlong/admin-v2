<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <!-- <el-form-item label="装备系列" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          clearable
          placeholder="请选择装备系列"
        >
          <el-option
            v-for="dict in processesList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="装备型号" prop="processesId">
        <el-select
          v-model="queryParams.processesId"
          clearable
          size="mini"
          placeholder="请选择装备型号"
        >
          <el-option
            v-for="(dict, index) in processesList"
            :key="index"
            :label="dict.dictLabel"
            :value="String(dict.dictCode)"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="装备ID" prop="cpuId">
        <el-input
          v-model="queryParams.cpuId"
          clearable
          size="mini"
          placeholder="请输入装备ID"
        ></el-input>
      </el-form-item>
      <el-form-item label="部署工厂" prop="factoryName">
        <el-select
          v-model="queryParams.factoryName"
          clearable
          size="mini"
          placeholder="请选择部署工厂"
        >
          <el-option
            v-for="(dict, index) in factoryList"
            :key="index"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
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
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="装备ID" prop="cpuId" align="center" />
      <el-table-column label="系统版本" prop="sysVersion" align="center" />
      <el-table-column label="部署工厂" prop="factoryName" align="center" />
      <el-table-column label="线号" prop="line" align="center" />
      <el-table-column label="本地IP" prop="domainIp" align="center" />
      <el-table-column label="在测订单号" prop="orderNo" align="center" />
      <el-table-column label="在测排产单号" prop="productNo" align="center" />
      <el-table-column label="在测工序" prop="processName" align="center" />
      <el-table-column label="在测DUT" prop="dutName" align="center" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-tickets"
            content="任务变更"
            @click="handleTask(scope.row)"
          />
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-paperclip"
            content="设备迁移"
            @click="handleDevice(scope.row)"
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

    <!-- 任务变更 -->
    <el-dialog title="任务变更" width="450px" :visible.sync="isTask">
      <el-form
        ref="taskForm"
        :model="taskForm"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="装备ID" prop="categoryId">
          {{ taskForm.cpuId }}
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <select-loadMore
            v-model="taskForm.orderNo"
            :data="orderData.data"
            :page="orderData.page"
            :hasMore="orderData.more"
            dictLabel="salesOrderNo"
            dictValue="salesOrderNo"
            :request="getOrderList"
            placeholder="请选择订单号"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排产单号" prop="productNo">
          <select-loadMore
            v-model="taskForm.productNo"
            :data="scheduleOrderData.data"
            :page="scheduleOrderData.page"
            :hasMore="scheduleOrderData.more"
            :moreParams="true"
            dictLabel="salesOrderNo"
            dictValue="id"
            v-slot="{ proOption }"
            :request="getScheduleOrderList"
            @getChange="getProductId"
            placeholder="请选择排产单号"
            style="width: 100%"
          >
            <template>
              <span style="float: left">{{ proOption.salesOrderNo }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ proOption.categoryName }}
              </span>
            </template>
          </select-loadMore>
        </el-form-item>
        <el-form-item label="测试工序" prop="processName">
          <el-select
            v-model="taskForm.processName"
            clearable
            size="mini"
            placeholder="请选择测试工序"
            style="width: 100%"
          >
            <el-option
              v-for="(dict, index) in processesList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="isTask = false">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="isTaskLoading"
          @click="submitTaskForm()"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 设备迁移 -->
    <el-dialog title="设备迁移" width="450px" :visible.sync="isDeviceMove">
      <el-form
        ref="deviceForm"
        :model="deviceForm"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="装备ID" prop="categoryId">
          {{ deviceForm.cpuId }}
        </el-form-item>
        <el-form-item label="部署工厂" prop="factoryName">
          <el-select
            v-model="deviceForm.factoryName"
            clearable
            size="mini"
            placeholder="请选择部署工厂"
          >
            <el-option
              v-for="(dict, index) in factoryList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="线号" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            placeholder="请选择线号"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="isDeviceMove = false">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="isDeviceLoading"
          @click="submitDeviceForm()"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  stsWebAuth,
  stsDeviceList,
  stsEquipUpdate,
  stsTaskUpdate,
} from "@/api/third/testApi";
import { orderList } from "@/api/order";
import { schedulingList } from "@/api/www/planSchedule";

export default {
  components: {
    CompUpdate: () => import("./components/update"),
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      list: [],
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      scheduleOrderData: {
        data: [],
        page: 1,
        more: true,
      },
      // 任务变更
      isTask: false,
      isTaskLoading: false,
      taskForm: {},
      // 表单校验
      rules: {
        orderNo: [
          { required: true, message: "请选择订单号", trigger: "change" },
        ],
        productNo: [
          { required: true, message: "请选择排产单号", trigger: "change" },
        ],
        processName: [
          { required: true, message: "请选择排产单号", trigger: "change" },
        ],
        factoryName: [
          { required: true, message: "请选择排产单号", trigger: "change" },
        ],
        line: [
          { required: true, message: "请选择排产单号", trigger: "change" },
        ],
      },
      // 设备迁移
      isDeviceMove: false,
      isDeviceLoading: false,
      deviceForm: {},
      // 测试工序
      processesList: [],
      // 部署工厂
      factoryList: [],
      // 线号
      testLineList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: "",
        processesId: "",
        version: "",
      },
    };
  },
  created() {
    this.getDicts("pucs_process_label").then((res) => {
      this.processesList = res.data;
    });

    // 部署工厂
    this.getDicts("product_address").then((res) => {
      this.factoryList = res.data;
    });
    // 线号
    this.getDicts("sts_test_line").then((res) => {
      this.testLineList = res.data;
    });
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      stsDeviceList(this.queryParams)
        .then((response) => {
          this.list = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return stsWebAuth([{ id: row.id, status: row.status }]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
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
    /** 迪太订单号 */
    getOrderList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        orderList({
          p: page,
          status: 1,
          salesOrderNo: keyword,
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
    /** 迪太排产单号 */
    getScheduleOrderList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        schedulingList({
          p: page,
          productStatus: 0,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.scheduleOrderData.data = [
              ...this.scheduleOrderData.data,
              ...list,
            ];
          } else {
            this.scheduleOrderData.data = list;
          }
          this.scheduleOrderData.more = pageNum * pageSize < total;
          this.scheduleOrderData.page = pageNum;
          resolve();
        });
      });
    },
    getProductId(info) {
      if (!info) {
        this.taskForm.schedulingId = "";
        return;
      }
      const { id, salesOrderNo } = JSON.parse(info);
      this.taskForm.schedulingId = id;
      this.taskForm.productNo = salesOrderNo;
    },
    // 任务变更
    handleTask(row) {
      this.isTask = true;
      this.taskForm = { ...row };
    },
    submitTaskForm() {
      this.$refs["taskForm"].validate((valid) => {
        if (valid) {
          if (this.taskForm.id) {
            this.isTaskLoading = true;
            stsTaskUpdate(this.taskForm)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("操作成功");
                  this.isTask = false;
                  this.getList();
                }
              })
              .finally(() => (this.isTaskLoading = false));
          }
        }
      });
    },

    // 设备迁移
    handleDevice(row) {
      this.isDeviceMove = true;
      this.deviceForm = { ...row };
    },
    submitDeviceForm() {
      this.$refs["deviceForm"].validate((valid) => {
        if (valid) {
          if (this.deviceForm.id) {
            this.isDeviceLoading = true;
            stsEquipUpdate(this.deviceForm)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("操作成功");
                  this.isDeviceMove = false;
                  this.getList();
                }
              })
              .finally(() => (this.isDeviceLoading = false));
          }
        }
      });
    },
  },
};
</script>
