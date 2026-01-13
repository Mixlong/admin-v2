<template>

  <div>
    <el-dialog class="fixed_bottom_dialog" :title="title" :visible.sync="dialogVisible" center append-to-body top="0vh"
      fullscreen :close-on-click-modal="false">
      <el-form ref="form" label-position="top" :model="form" :rules="rules" label-width="100px">
        <template v-if="!isExcelFile">
          <el-row :gutter="30">
            <el-col :span="4">
              <el-form-item label="迪太订单号:" prop="salesOrderNo">
                <select-loadMore v-model="form.salesOrderNo" :data="orderCodeData.data" :page="orderCodeData.page"
                  :hasMore="orderCodeData.more" dictLabel="salesOrderNo" dictValue="salesOrderNo" :disabled="!!form.id"
                  :request="getCustomerOrderList" @getChange="getOrderNo" placeholder="请选择迪太订单号" style="width: 100%" />
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="订单编号" prop="orderCode">
                <select-loadMore v-model="form.orderCode" :data="prodPlatData.data" :page="prodPlatData.page"
                  :hasMore="prodPlatData.more" dictLabel="orderCode" dictValue="orderCode" :request="getProdPlantList"
                  placeholder="请选择订单编号" style="width: 100%">
                </select-loadMore>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="生产流程:" prop="process">
                <el-select v-model="form.process"  style="width: 100%">
                  <el-option v-for="(item, index) in operationList" :key="index" :label="item.dictLabel"
                    :value="item.dictLabel"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="生产地点:" prop="address">
                <el-select v-model="form.address" style="width: 100%">
                  <el-option v-for="(item, index) in productAddressList" :key="index" :label="item.dictLabel"
                    :value="item.dictLabel"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <!-- <el-col :span="4">
              <el-form-item label="生产日期:" prop="date">
                <el-date-picker v-model="form.date" type="date" placeholder="请选择生产日期" 
                  value-format="yyyy-MM-dd" format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col> -->

            <el-col :span="4">
              <el-form-item label="备注:" prop="remark">
                <el-input v-model="form.remark" clearable placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="采购单号:" prop="purchaseOrderCode">
                <el-input v-model="form.purchaseOrderCode" clearable placeholder="请输入采购单号"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="客户订单信息:" required>
            <el-table ref="customerOrderRef" :data="orderData" border row-key="id" :height="tableHeight(-50)"
              class="margin-bottom-sm" @selection-change="handleSelectionChange" :row-class-name="tableRowClassName">
              <el-table-column v-if="!form.id" type="selection" width="55" align="center" :reserve-selection="true" />
              <el-table-column label="客户订单号" align="center" prop="customerOrderNo" />
              <el-table-column label="客户名称" align="center" prop="customerName" />
              <el-table-column label="品类" align="center" prop="categoryName" />
              <el-table-column label="型号" align="center" prop="computerName" />
              <el-table-column label="BOM编码" align="center" prop="bomCode">
                <template slot-scope="scope">
                  <span v-NoData="scope.row.bomCode"></span>
                </template>
              </el-table-column>
              <el-table-column label="芯片版本" align="center" prop="chipVersion" />
              <el-table-column label="订单数量" align="center" prop="orderQuantity" />
              <el-table-column label="出货日期" align="center" prop="sellTime">
                <template slot-scope="scope">
                  <span v-NoData="parseTime(scope.row.sellTime, '{y}-{m}-{d}')" class="text-red"></span>
                </template>
              </el-table-column>
              <!-- <el-table-column
              label="客户要求到货日期"
              align="center"
              prop="arrivalTime"
            >
              <template slot-scope="scope">
                <span
                  v-NoData="parseTime(scope.row.arrivalTime)"
                  class="text-green"
                ></span>
              </template>
            </el-table-column> -->
              <!-- <el-table-column
              label="出货地址"
              align="center"
              prop="consigneeAddress"
            /> -->
              <!-- <el-table-column label="箱唛" align="center" prop="isMark">
              <template slot-scope="scope">
                {{ markList[scope.row.isMark] }}
              </template>
            </el-table-column> -->
              <el-table-column label="生产日期范围" align="center" prop="dateRange" width="280">
                <template slot-scope="scope">
                  <el-date-picker v-model="scope.row.dateRange" type="datetimerange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"
                    format="yyyy-MM-dd" :default-time="['00:00:00', '00:00:00']" style="width: 100%"
                    @change="onDateRangeChange(scope.$index, scope.row)" />
                </template>
              </el-table-column>
              <el-table-column label="批次号" align="center" prop="batchNo">
                <template slot-scope="scope">
                  <el-input v-model.trim="scope.row.batchNo" placeholder="请输入批次号" clearable />
                </template>
              </el-table-column>
              <el-table-column label="批次数量" align="center" prop="batchNum">
                <template slot-scope="scope">
                  <el-input-number v-model="scope.row.batchNum" controls-position="right" :min="1" :precision="0" />
                </template>
              </el-table-column>
              <el-table-column label="排产数量" align="center" prop="num">
                <template slot-scope="scope">
                  <div class="schedule-num-container"
                    @click="showDailySchedulePopover(scope.$index, scope.row, $event)">
                    <el-input v-model="scope.row.num" readonly class="readonly-input" placeholder="点击设置排产计划" />
                    <el-button size="mini" type="text" icon="el-icon-calendar" title="每日排产计划"></el-button>
                  </div>
                </template>
              </el-table-column>

            </el-table>
          </el-form-item>
        </template>


        <template v-if="isExcelFile">
          <el-form-item label="资料清单:" prop="excelUrl">
            <DrUpload class="flex-direction" v-model="form.excelUrl" :isOnePic="1">
              <div class="text-left">
                <el-button size="mini" type="primary">上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isBtnLoading" @click="submitForm">
          确 定
        </el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 每日排产浮层 - 移到对话框外部 -->
    <div v-if="dailySchedulePopover.visible" ref="dailySchedulePopover" class="daily-schedule-popover"
      :style="dailySchedulePopover.style" @keydown="handlePopoverKeydown">
      <div class="popover-header">
        <span class="header-title">每日排产计划</span>
        <div class="header-actions">
          <div class="distribute-controls">
            <el-input-number v-model="distributeAmount" size="mini" :min="0" :precision="0" placeholder="分配数量"
              :controls="false" style="width: 120px; margin-right: 8px;" />
            <el-button size="mini" @click="autoDistributeSchedule" type="primary">智能分配</el-button>
          </div>
          <el-button size="mini" type="text" @click="closeDailySchedulePopover" class="close-btn">×</el-button>
        </div>
      </div>

      <div class="popover-content">
        <el-table :data="dailyScheduleList" size="mini" max-height="300" :show-header="true"
          class="daily-schedule-table">
          <el-table-column label="日期" prop="date" width="120" align="center">
            <template slot-scope="scope">
              <span class="weekday-text" :class="{ 'weekend': scope.row.isWeekend }">
                {{ parseTime(scope.row.date, '{y}-{m}-{d}') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="星期" width="60" align="center">
            <template slot-scope="scope">
              <span class="weekday-text" :class="{ 'weekend': scope.row.isWeekend }">
                {{ getWeekdayText(scope.row.date) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="工作状态" width="120" align="center">
            <template slot-scope="scope">
              <el-select v-model="scope.row.workStatus" size="mini" @change="updateWorkStatus(scope.row)"
                style="width: 100%;" popper-class="work-status-dropdown">
                <el-option label=" 工作日" value="working"/>
                <el-option label="休息日" value="rest" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="计划数量" width="120" align="center">
            <template slot-scope="scope">
              <el-input-number :controls="false" v-model="scope.row.plannedNum" :min="0" :precision="0"
                :disabled="scope.row.workStatus === 'rest'" size="mini" controls-position="right"
                @change="updateTotalScheduleNum" style="width: 100%" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="popover-footer">
        <div class="total-info">
          <span>总排产数量：{{ totalScheduleNum }}</span>
          <span class="working-days-info">（{{ workingDaysCount }}个工作日）</span>
        </div>
        <div class="footer-actions">
          <el-button size="mini" @click="closeDailySchedulePopover">取消</el-button>
          <el-button size="mini" @click="confirmDailySchedule" type="primary">确定</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  schedulingCreate,
  schedulingEdit,
  scheduleVersion,
} from "@/api/www/planSchedule";
import { schemeTypeList } from "@/api/system/skipType";
import tinymce from "@/views/components/Editor";
import { orderList, orderManagementList } from "@/api/order";
import { orderWorkList } from "@/api/third/prodPlant";

export default {
  name: "planScheduleUpdate",
  props: ["title", "dictList", "operationList", "isExcelFile"],
  components: {
    tinymce,
  },
  data() {
    return {
      isBtnLoading: false,
      dialogVisible: false,
      // 生产地点
      productAddressList: [],
      // 方案版本字典
      versionList: [],
      // 芯片列表
      chipList: [],
      cloneForm: {},
      // 表单参数
      form: {
        id: "",
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        orderCode: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        batchNo: "",
        batchNum: 1,
        remark: "",
        purchaseOrderCode: "",
        list: [],
      },
      selOrderData: [],
      // 订单id
      orderCodeData: {
        data: [],
        page: 1,
        more: true,
      },
      // 订单数据
      orderData: [],
      // 订单编号
      prodPlatData: {
        data: [],
        page: 1,
        more: true,
      },
      statusList: {
        0: "待审核",
        1: "正常",
        2: "取消",
      },
      markList: {
        0: "否",
        1: "是",
        2: "待确认",
      },
      defaultTime: this.moment().format("HH:mm:ss"),
      // 每日排产浮层相关数据
      dailySchedulePopover: {
        visible: false,
        style: {
          left: '200px',
          top: '200px',
          position: 'fixed',
          zIndex: 99999
        },
        currentRowIndex: -1,
        currentRowData: null
      },
      dailyScheduleList: [], // 每日排产数据
      dailyScheduleData: {}, // 存储所有行的每日排产数据
      distributeAmount: 0, // 智能分配的数量
      // 表单校验
      rules: {
        address: [
          { required: true, message: "请选择生产地点", trigger: "change" },
        ],
        salesOrderNo: [
          { required: true, message: "请选择迪太订单号", trigger: "change" },
        ],
        orderCode: [
          { required: true, message: "请选择订单编号", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "请选择产品型号", trigger: "change" },
        ],
        chipVersion: [
          { required: true, message: "请选择芯片版本", trigger: "change" },
        ],
        date: [
          { required: true, message: "请选择生产日期", trigger: "change" },
        ],
        process: [
          { required: true, message: "请选择生产流程", trigger: "change" },
        ],
        schemeVersion: [
          { required: true, message: "请选择方案版本", trigger: "change" },
        ],
        orderNo: [
          { required: true, message: "请输入客户订单号", trigger: "blur" },
        ],
        excelUrl: [
          { required: true, message: "请上传资料清单", trigger: "change" },
        ],
        batchNo: [
          { required: false, message: "请输入批次号", trigger: "change" },
        ],
        batchNum: [
          { required: false, message: "请输入批次数量", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    // 当前每日排产总数量（只计算工作日）
    totalScheduleNum() {
      return this.dailyScheduleList.reduce((sum, day) => {
        // 只计算工作日和特殊排班的数量
        if (day.workStatus === 'working' || day.workStatus === 'special') {
          return sum + (day.plannedNum || 0);
        }
        return sum;
      }, 0);
    },
    // 工作日数量
    workingDaysCount() {
      return this.dailyScheduleList.filter(day =>
        day.workStatus === 'working' || day.workStatus === 'special'
      ).length;
    }
  },
  watch: {
    "form.excelUrl"(excelUrl) {
      if (excelUrl) {
        this.clearValidateItem("form", "excelUrl");
      }
    },
    dialogVisible(bool) {
      if (!bool) {
        this.$emit("update:isExcelFile", false);
      }
    },
    // 移除复杂的watcher，改用直接的@change事件处理
  },
  created() {
    this.getProductAddress();
    this.getScheduleVersion();
    this.getChipTypeList();
  },
  methods: {
    getCustomerOrderList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        orderManagementList({
          p: page,
          status: 1,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.orderCodeData.data = [...this.orderCodeData.data, ...list];
          } else {
            this.orderCodeData.data = list;
          }
          this.orderCodeData.more = pageNum * pageSize < total;
          this.orderCodeData.page = pageNum;
          resolve();
        });
      });
    },
    getOrderNo(salesOrderNo) {
      // ✅ 编辑模式下不重新加载订单数据，避免覆盖回显数据
      if (salesOrderNo && !this.form.id) {
        this.getOrderList(salesOrderNo);
      }
    },
    /** 订单号数据 */
    getOrderList(salesOrderNo) {
      orderList({
        p: 1,
        l: 100,
        status: 1,
        salesOrderNo,
      }).then((res) => {
        this.orderData = res.data.list ?? [];
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
            this.prodPlatData.data = [...this.prodPlatData.data, ...list];
          } else {
            this.prodPlatData.data = list;
          }
          this.prodPlatData.more = pageNum * pageSize < total;
          this.prodPlatData.page = pageNum;
          resolve();
        });
      });
    },
    // 芯片类型
    getChipTypeList() {
      schemeTypeList({ p: 1, l: 10 }).then((res) => {
        const { list } = res.data;
        this.chipList = list;
      });
    },
    // 方案版本字典
    getScheduleVersion() {
      scheduleVersion().then((res) => {
        this.versionList = res.data;
      });
    },
    // 生产地点
    getProductAddress() {
      this.getDicts("product_address").then((response) => {
        this.productAddressList = response.data;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: "",
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        orderCode: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        batchNo: "",
        batchNum: 1,
        list: [],
        remark: "",
        purchaseOrderCode: ""
      };
      this.orderData = [];
      this.selOrderData = [];
      // 清理每日排产数据
      this.dailyScheduleData = {};
      this.dailyScheduleList = [];
      this.closeDailySchedulePopover();

      this.resetForm("form");
      this.$nextTick(() => {
        this.$refs.customerOrderRef.clearSelection();
      })
    },

    // 数据回显 - 将API数据转换为组件数据格式
    loadScheduleData(scheduleData) {
      if (!scheduleData) return;

      console.log('🔄 开始回显排产数据:', scheduleData);

      // 根据实际API响应格式处理数据
      // API返回的是单个对象，包含detailList数组
      if (scheduleData.detailList) {
        // 处理单个订单的编辑数据
        this.loadSingleOrderData(scheduleData);
      } else if (scheduleData.list) {
        // 处理多个订单的列表数据（兼容旧格式）
        this.loadMultipleOrdersData(scheduleData);
      }
    },

    // 处理单个订单编辑数据
    loadSingleOrderData(orderData) {
      // ✅ 首先加载下拉数据源，确保编辑时选项可用
      this.loadDropdownData(orderData);

      // 设置表单基础数据 - 根据API响应格式映射字段
      this.form = {
        ...this.form,
        id: orderData.id || '', // ✅ 重要：设置ID用于判断编辑模式
        salesOrderNo: orderData.salesOrderNo || '',
        orderCode: orderData.orderCode || '',
        categoryId: orderData.categoryId || '',
        computerId: orderData.computerId || '',
        address: orderData.address || '',
        process: orderData.process || '',
        schemeVersion: orderData.schemeVersion || '',
        batchNo: orderData.batchNo || '',
        batchNum: orderData.batchNum || 1,
        remark: orderData.remark || '',
        purchaseOrderCode: orderData.purchaseOrderCode || '',
        date: orderData.date ? this.formatDateOnly(orderData.date) : '', // 转换为日期字符串，统一为00:00:00
      };

      // 构建日期范围 - 优先从 detailList 获取实际的开始和结束日期
      let dateRange = null;
      if (orderData.detailList && orderData.detailList.length > 0) {
        // 从 detailList 中获取最小和最大日期
        const dates = orderData.detailList.map(detail => detail.date).sort((a, b) => a - b);
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        dateRange = [
          this.formatTimestamp(startDate),
          this.formatTimestamp(endDate)
        ];
      } else if (orderData.date && orderData.endDate) {
        // 降级方案：使用主记录的日期
        dateRange = [
          this.formatTimestamp(orderData.date),
          this.formatTimestamp(orderData.endDate)
        ];
      }

      // 构建订单行数据 - 使用主记录的字段
      const orderRow = {
        id: orderData.id,
        customerOrderNo: orderData.customerOrderNo,
        batchNo: orderData.batchNo,
        batchNum: orderData.batchNum,
        num: orderData.num,
        dateRange: dateRange,
        // 使用主记录的字段
        categoryId: orderData.categoryId || '',
        computerId: orderData.computerId || '',
        // 保留其他必要字段用于显示
        customerName: orderData.customerName || '',
        categoryName: orderData.categoryName || '',
        computerName: orderData.computerName || '',
        orderId: orderData.orderId || '',
        // ✅ 添加缺失的字段
        bomCode: orderData.bomCode || '',
        chipVersion: orderData.chipVersion || '',
        orderQuantity: orderData.orderQuantity || 0,
        sellTime: orderData.sellTime || null,
      };

      // 转换 detailList 为每日排产数据
      if (orderData.detailList && orderData.detailList.length > 0) {
        const rowKey = `${orderData.id || orderData.customerOrderNo}_0`;

        // 生成完整的日期范围（包括周日）
        let fullDailySchedules = [];
        if (dateRange && dateRange.length === 2) {
          // 基于日期范围生成完整的每日列表
          fullDailySchedules = this.generateFullDateRange(dateRange[0], dateRange[1]);
        }

        // 将 detailList 的数据映射到完整的日期列表中
        if (fullDailySchedules.length > 0) {
          orderData.detailList.forEach(detail => {
            const detailDateStr = this.formatTimestamp(detail.date);
            const matchingDay = fullDailySchedules.find(day => day.date === detailDateStr);
            if (matchingDay) {
              matchingDay.plannedNum = detail.num;
              // 只有周日在有排产数据时才设置为特殊排班，周六是默认上班
              const dayOfWeek = new Date(detail.date).getDay();
              if (dayOfWeek === 0 && detail.num > 0) { // 只有周日才需要特殊处理
                matchingDay.workStatus = 'working';
              }
            }
          });
        } else {
          // 降级方案：直接使用 detailList 数据
          fullDailySchedules = orderData.detailList.map(detail => {
            const dayOfWeek = new Date(detail.date).getDay();
            return {
              date: this.formatTimestamp(detail.date),
              plannedNum: detail.num,
              actualNum: 0,
              isWeekend: this.isWeekend(detail.date),
              workStatus: (dayOfWeek === 0 && detail.num > 0) ? 'working' : (dayOfWeek === 0 ? 'rest' : 'working'),
              status: 'pending'
            };
          });
        }

        // 计算总排产数量
        const totalNum = fullDailySchedules.reduce((sum, schedule) => sum + schedule.plannedNum, 0);
        orderRow.num = totalNum;

        // 存储每日排产数据
        this.$set(this.dailyScheduleData, rowKey, fullDailySchedules);

        console.log('✅ 单个订单每日排产数据已设置:', rowKey, fullDailySchedules);
        console.log('✅ 计算总排产数量:', totalNum);
      }

      // 设置订单数据
      this.orderData = [orderRow];
      console.log('✅ 单个订单数据回显完成:', orderRow);
      console.log('📋 字段映射检查:', {
        bomCode: orderRow.bomCode,
        chipVersion: orderRow.chipVersion,
        orderQuantity: orderRow.orderQuantity,
        sellTime: orderRow.sellTime
      });
    },

    // 处理多个订单列表数据（兼容旧格式）
    loadMultipleOrdersData(scheduleData) {
      // 设置表单基础数据
      this.form = {
        ...this.form,
        ...scheduleData,
        purchaseOrderCode: scheduleData.purchaseOrderCode || '',
        date: scheduleData.date ? this.formatDateOnly(scheduleData.date) : '', // 转换为日期字符串，统一为00:00:00
      };

      // 处理订单列表数据
      this.orderData = scheduleData.list.map((batchItem, index) => {
        // 构建日期范围 - 优先从 detailList 获取实际的开始和结束日期
        let dateRange = null;
        if (batchItem.detailList && batchItem.detailList.length > 0) {
          // 从 detailList 中获取最小和最大日期
          const dates = batchItem.detailList.map(detail => detail.date).sort((a, b) => a - b);
          const startDate = dates[0];
          const endDate = dates[dates.length - 1];
          dateRange = [
            this.formatTimestamp(startDate),
            this.formatTimestamp(endDate)
          ];
        } else if (batchItem.date && batchItem.endDate) {
          // 降级方案：使用主记录的日期
          dateRange = [
            this.formatTimestamp(batchItem.date),
            this.formatTimestamp(batchItem.endDate)
          ];
        }

        // 构建订单行数据
        const orderRow = {
          id: batchItem.orderId,
          customerOrderNo: batchItem.orderNo,
          batchNo: batchItem.batchNo,
          batchNum: batchItem.batchNum,
          num: batchItem.num,
          dateRange: dateRange,
          // 从 detailList 中获取其他字段
          categoryId: batchItem.detailList?.[0]?.categoryId || '',
          computerId: batchItem.detailList?.[0]?.computerId || '',
          // ✅ 添加缺失的字段
          bomCode: batchItem.bomCode || '',
          chipVersion: batchItem.chipVersion || '',
          orderQuantity: batchItem.orderQuantity || 0,
          sellTime: batchItem.sellTime || null,
          customerName: batchItem.customerName || '',
          categoryName: batchItem.categoryName || '',
          computerName: batchItem.computerName || '',
        };

        // 如果有详细排产数据，转换为每日排产格式
        if (batchItem.detailList && batchItem.detailList.length > 0) {
          const rowKey = `${batchItem.orderId || batchItem.orderNo}_${index}`;

          // 生成完整的日期范围（包括周日）
          let fullDailySchedules = [];
          if (dateRange && dateRange.length === 2) {
            // 基于日期范围生成完整的每日列表
            fullDailySchedules = this.generateFullDateRange(dateRange[0], dateRange[1]);
          }

          // 将 detailList 的数据映射到完整的日期列表中
          if (fullDailySchedules.length > 0) {
            batchItem.detailList.forEach(detail => {
              const detailDateStr = this.formatTimestamp(detail.date);
              const matchingDay = fullDailySchedules.find(day => day.date === detailDateStr);
              if (matchingDay) {
                matchingDay.plannedNum = detail.num;
                // 只有周日在有排产数据时才设置为特殊排班，周六是默认上班
                const dayOfWeek = new Date(detail.date).getDay();
                if (dayOfWeek === 0 && detail.num > 0) { // 只有周日才需要特殊处理
                  matchingDay.workStatus = 'working';
                }
              }
            });
          } else {
            // 降级方案：直接使用 detailList 数据
            fullDailySchedules = batchItem.detailList.map(detail => {
              const dayOfWeek = new Date(detail.date).getDay();
              return {
                date: this.formatTimestamp(detail.date),
                plannedNum: detail.num,
                actualNum: 0,
                isWeekend: this.isWeekend(detail.date),
                workStatus: (dayOfWeek === 0 && detail.num > 0) ? 'working' : (dayOfWeek === 0 ? 'rest' : 'working'),
                status: 'pending'
              };
            });
          }

          // 计算总排产数量
          const totalNum = fullDailySchedules.reduce((sum, schedule) => sum + schedule.plannedNum, 0);
          orderRow.num = totalNum;

          // 存储每日排产数据
          this.$set(this.dailyScheduleData, rowKey, fullDailySchedules);

          console.log(`📅 回显第 ${index} 行每日排产数据:`, fullDailySchedules);
          console.log(`📊 计算第 ${index} 行总排产数量:`, totalNum);
        }

        return orderRow;
      });

      console.log('✅ 多个订单排产数据回显完成:', {
        orderData: this.orderData,
        dailyScheduleData: this.dailyScheduleData
      });
    },

    // ✅ 新增：加载下拉数据源方法
    loadDropdownData(orderData) {
      // 加载迪太订单号数据
      if (orderData.salesOrderNo && this.orderCodeData.data.length === 0) {
        this.getCustomerOrderList({ keyword: orderData.salesOrderNo }).then(() => {
          // 确保当前值在选项中
          const exists = this.orderCodeData.data.some(item => item.salesOrderNo === orderData.salesOrderNo);
          if (!exists && orderData.salesOrderNo) {
            this.orderCodeData.data.unshift({ salesOrderNo: orderData.salesOrderNo });
          }
        });
      }

      // 加载订单编号数据
      if (orderData.orderCode && this.prodPlatData.data.length === 0) {
        this.getProdPlantList({ keyword: orderData.orderCode }).then(() => {
          // 确保当前值在选项中
          const exists = this.prodPlatData.data.some(item => item.orderCode === orderData.orderCode);
          if (!exists && orderData.orderCode) {
            this.prodPlatData.data.unshift({ orderCode: orderData.orderCode });
          }
        });
      }

      // ✅ 编辑模式下不需要预加载订单数据，避免覆盖已经设置好的回显数据
      // 注释掉此行防止覆盖回显数据
      // if (orderData.salesOrderNo) {
      //   this.getOrderList(orderData.salesOrderNo);
      // }
    },

    // 时间戳转日期字符串
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return this.formatDate(date, 'yyyy-MM-dd') + ' 00:00:00';
    },

    // ✅ 新增：时间戳转日期字符串，专用于表单日期字段（只要日期部分）
    formatDateOnly(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return this.formatDate(date, 'yyyy-MM-dd');
    },

    // ✅ 新增：获取有效日期，优先使用表单日期，否则使用 dateRange 的开始日期
    getValidDate(formDate, dateRange) {
      console.log('🔍 getValidDate 调用:', { formDate, dateRange });

      // 1. 优先使用表单日期（检查非空字符串）
      if (formDate && typeof formDate === 'string' && formDate.trim() !== '') {
        const timestamp = this.convertToTimestamp(formDate);
        console.log('📅 表单日期转换结果:', timestamp);
        if (timestamp && !isNaN(timestamp)) return timestamp;
      }

      // 2. 降级使用 dateRange 的开始日期
      if (dateRange && Array.isArray(dateRange) && dateRange.length >= 2 && dateRange[0]) {
        const startTimestamp = new Date(dateRange[0]).getTime();
        console.log('📅 dateRange开始日期转换结果:', startTimestamp);
        if (!isNaN(startTimestamp)) return startTimestamp;
      }

      // 3. 最后降级使用当前日期
      const fallbackDate = new Date().setHours(0, 0, 0, 0);
      console.log('📅 使用当前日期作为兜底:', fallbackDate);
      return fallbackDate;
    },

    // ✅ 转换为时间戳格式 - 后端已修改支持 Long 类型
    convertToTimestamp(dateValue) {
      if (!dateValue) return null;

      // 如果已经是数字（时间戳），直接返回
      if (typeof dateValue === 'number') {
        return dateValue;
      }

      // 如果是Date对象，转换为时间戳
      if (dateValue instanceof Date) {
        return dateValue.getTime();
      }

      // 如果是字符串，尝试解析为时间戳
      if (typeof dateValue === 'string') {
        const timestamp = new Date(dateValue).getTime();
        return isNaN(timestamp) ? null : timestamp;
      }

      return null;
    },

    // 判断是否为周末
    isWeekend(timestamp) {
      if (!timestamp) return false;
      const date = new Date(timestamp);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },
    onAlertReason(params) {
      const { salesOrderNo, date, process, address } = params;

      console.log('🔍 检查修改原因:', {
        cloneForm: this.cloneForm,
        params: { salesOrderNo, date, process, address }
      });

      // 如果没有 cloneForm 数据，说明是新增，不需要修改原因
      if (!this.cloneForm || Object.keys(this.cloneForm).length === 0) {
        return false;
      }

      // 日期需要特殊处理，因为可能是时间戳或Date对象
      const cloneDate = this.cloneForm.date instanceof Date ? this.cloneForm.date.getTime() : this.cloneForm.date;
      const currentDate = date instanceof Date ? date.getTime() : date;

      if (
        this.cloneForm.salesOrderNo !== salesOrderNo ||
        cloneDate !== currentDate ||
        this.cloneForm.process !== process ||
        this.cloneForm.address !== address
      ) {
        return true;
      } else {
        return false;
      }
    },
    onUpdateOrder(params) {
      console.log("🚀 ~ file: update.vue:735 ~ params:", params)
      schedulingEdit(params)
        .then((res) => {
          if (res.code === 200) {
            this.msgSuccess("编辑成功");
            this.isBtnLoading = false;
            this.dialogVisible = false;
            this.$emit("getData");
          }
        })
        .finally(() => {
          this.isBtnLoading = false;
        });
    },
    // 选择客户订单号
    handleSelectionChange(selection) {
      this.selOrderData = selection;
    },
    checkDeliverOrderData(data, param) {
      const flag = data.some((item) => this.Is_Empty(item[param]));
      return flag;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let data = Object.assign({}, this.form);

          console.log('🚀 submitForm - 检查编辑模式:', {
            'form.id': this.form.id,
            'data.id': data.id,
            'isEdit': !!data.id,
            'dailyScheduleData': this.dailyScheduleData,
            'orderData': this.orderData,
            ...data
          });

          if (this.form.process !== "SMT") {
            this.form.schemeVersion = "";
          }

          if (data.id) {
            console.log('✅ 进入编辑逻辑，data.id =', data.id);
            const { batchNo, batchNum, num } = this.orderData[0];

            if (!batchNum) {
              this.msgWarning("批次数量不能为空");
              return;
            }

            if (!num || num <= 0) {
              this.msgWarning("排产数量必须大于0");
              return;
            }

            // 编辑时也需要组装每日排产数据
            const item = this.orderData[0];
            const rowKey = `${item.id || item.customerOrderNo}_0`;
            const dailySchedules = this.dailyScheduleData[rowKey] || [];

            console.log('🔍 编辑时获取每日排产数据:', {
              item: item,
              rowKey: rowKey,
              dailySchedules: dailySchedules,
              dailyScheduleDataKeys: Object.keys(this.dailyScheduleData)
            });

            // 转换每日排产数据为 detailList 格式
            let detailList = [];
            if (dailySchedules && dailySchedules.length > 0) {
              detailList = dailySchedules
                .filter(day =>
                  (day.workStatus === 'working' || day.workStatus === 'special') &&
                  day.plannedNum > 0
                )
                .map(day => ({
                  // ✅ 根据 TProductionSchedulingDetail 对象字段调整
                  batchNo: batchNo,
                  categoryId: item.categoryId || '',
                  computerId: item.computerId || '',
                  date: new Date(day.date).getTime(), // day.date 已经包含时间，不需要再拼接
                  num: day.plannedNum,
                  orderCode: this.form.orderCode || '',
                  schedulingId: data.id // 编辑时使用当前排产单ID
                }));
            } else {
              // 如果没有每日排产数据，使用批次的整体日期范围创建单条记录
              console.warn('⚠️ 没有找到每日排产数据，使用整体日期范围');
              console.log('🔍 item.dateRange:', item.dateRange, 'item.num:', item.num);

              if (item.dateRange && item.dateRange.length === 2 && item.num > 0) {
                // 将总数量平均分配到两个日期
                const halfNum = Math.ceil(item.num / 2);
                detailList = [
                  {
                    batchNo: batchNo,
                    categoryId: item.categoryId || '',
                    computerId: item.computerId || '',
                    date: new Date(item.dateRange[0]).getTime(),
                    num: halfNum,
                    orderCode: this.form.orderCode || '',
                    schedulingId: data.id
                  },
                  {
                    batchNo: batchNo,
                    categoryId: item.categoryId || '',
                    computerId: item.computerId || '',
                    date: new Date(item.dateRange[1]).getTime(),
                    num: item.num - halfNum,
                    orderCode: this.form.orderCode || '',
                    schedulingId: data.id
                  }
                ];
              } else {
                // 兜底方案：使用当前日期
                console.warn('⚠️ dateRange无效，使用当前日期');
                detailList = [{
                  batchNo: batchNo,
                  categoryId: item.categoryId || '',
                  computerId: item.computerId || '',
                  date: new Date().setHours(0, 0, 0, 0),
                  num: item.num || 0,
                  orderCode: this.form.orderCode || '',
                  schedulingId: data.id
                }];
              }
            }

            // ✅ 编辑时数据格式：直接在主 VO 对象上设置字段（不需要 list 数组）
            data = {
              ...data,
              // 批次相关字段
              batchNo,
              batchNum,
              num,
              orderNo: item.customerOrderNo,
              // 日期相关字段 - 从 dateRange 获取日期或使用表单日期
              date: this.getValidDate(this.form.date, item.dateRange),
              endDate: item.dateRange && item.dateRange.length === 2 ? new Date(item.dateRange[1]).getTime() : new Date().setHours(0, 0, 0, 0),
              // 排产详情
              detailList: detailList
            };

            console.log('📦 编辑时单个任务令数据结构:', {
              detailList: detailList,
              mainData: {
                id: data.id,
                batchNo: data.batchNo,
                num: data.num,
                orderNo: data.orderNo,
                date: data.date,
                endDate: data.endDate
              },
              dateDebug: {
                'form.date': this.form.date,
                'item.dateRange': item.dateRange,
                'getValidDate_result': this.getValidDate(this.form.date, item.dateRange)
              }
            });

            this.isBtnLoading = true;
            if (!this.isExcelFile && this.onAlertReason(data)) {
              this.$prompt("请输入修改原因", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                inputValidator: (value) => {
                  if (value === null || value === "") {
                    return false;
                  }
                },
                inputErrorMessage: "修改原因不能为空",
              })
                .then(({ value }) => {
                  this.onUpdateOrder({ msg: value, ...data });
                })
                .finally(() => {
                  this.isBtnLoading = false;
                });
            } else {
              this.onUpdateOrder(data);
            }
          } else {
            console.log('❌ 进入创建逻辑，data.id 为空');
            if (!this.selOrderData.length) {
              return this.msgWarning("请选择客户订单");
            }

            // if (this.checkDeliverOrderData(this.selOrderData, "batchNo")) {
            //   this.msgWarning("批次号不能为空");
            //   return;
            // }

            if (this.checkDeliverOrderData(this.selOrderData, "batchNum")) {
              this.msgWarning("批次数量不能为空");
              return;
            }

            if (this.checkDeliverOrderData(this.selOrderData, "num") || this.selOrderData.some(item => item.num <= 0)) {
              this.msgWarning("排产数量必须大于0");
              return;
            }

            // ✅ 确保主表单的日期字段是时间戳格式
            data.date = this.convertToTimestamp(this.form.date);

            data.list = this.selOrderData.map((item, index) => {
              // 获取该行的每日排产数据
              const rowKey = `${item.id || item.customerOrderNo}_${index}`;
              const dailySchedules = this.dailyScheduleData[rowKey] || [];

              // 转换每日排产数据为 detailList 格式
              const detailList = dailySchedules
                .filter(day =>
                  (day.workStatus === 'working' || day.workStatus === 'special') &&
                  day.plannedNum > 0
                )
                .map(day => ({
                  categoryId: item.categoryId || '',
                  computerId: item.computerId || '',
                  date: new Date(day.date).getTime(), // day.date 已经包含时间，不需要再拼接
                  num: day.plannedNum,
                  orderCode: this.form.orderCode || '',
                  schedulingId: '', // 创建时为空，编辑时会有值
                  // ✅ 在 detailList 中添加批次号相关数据
                  batchNo: item.batchNo,
                  batchNum: item.batchNum,
                  customerOrderNo: item.customerOrderNo,
                  bomCode: item.bomCode || '',
                  chipVersion: item.chipVersion || '',
                  orderQuantity: item.orderQuantity || 0
                }));

              return {
                batchNo: item.batchNo,
                batchNum: item.batchNum,
                orderNo: item.customerOrderNo,
                orderId: item.id, // ✅ 添加缺失的orderId字段
                num: item.num,
                date: item.dateRange ? new Date(item.dateRange[0]).getTime() : null,
                endDate: item.dateRange ? new Date(item.dateRange[1]).getTime() : null,
                detailList: detailList
              };
            });

            console.log('📦 创建时第一个 detailList 包含批次数据:', data.list[0]?.detailList?.[0]);
            console.log('🔍 创建时orderId字段检查:', {
              firstItemOrderId: data.list[0]?.orderId,
              firstItemOrderNo: data.list[0]?.orderNo,
              hasOrderId: !!data.list[0]?.orderId
            });
            console.log('📅 创建时日期格式检查:', {
              originalDate: this.form.date,
              convertedDate: data.date,
              dateType: typeof data.date
            });

            this.isBtnLoading = true;
            schedulingCreate(data)
              .then((res) => {
                if (res.code === 200) {
                  this.msgSuccess("创建成功");
                  this.dialogVisible = false;
                  this.$emit("getData");
                }
              })
              .finally(() => {
                this.isBtnLoading = false;
              });
          }
        }
      });
    },

    // ==================== 日期变化处理 ====================

    // 处理日期范围变化
    onDateRangeChange(rowIndex, rowData) {
      console.log('📅 onDateRangeChange 触发:', {
        rowIndex,
        dateRange: rowData.dateRange,
        customerOrderNo: rowData.customerOrderNo
      });

      // 检查日期范围是否有效
      if (!rowData.dateRange || rowData.dateRange.length !== 2) {
        console.log('⚠️ 日期范围无效，跳过处理');
        return;
      }

      // ✅ 编辑修改时：将生产日期范围的起始时间同步到主表单 date 字段
      // dateRange 的 value-format 是 "yyyy-MM-dd HH:mm:ss"，这里取开始日期并只保留 yyyy-MM-dd
      if (this.form && this.form.id && rowData.dateRange[0]) {
        const startDateOnly = String(rowData.dateRange[0]).split(' ')[0];
        if (startDateOnly) {
          this.form.date = startDateOnly;
        }
      }

      console.log('🎯 日期范围有效，开始处理...');

      // 清除该行的旧排产数据
      const rowKey = `${rowData.id || rowData.customerOrderNo}_${rowIndex}`;
      if (this.dailyScheduleData[rowKey]) {
        delete this.dailyScheduleData[rowKey];
        console.log(`🗑️ 清除第 ${rowIndex} 行的旧排产数据`);
      }

      // 重置该行的排产数量为0
      this.$set(rowData, 'num', 0);
      console.log(`♻️ 重置第 ${rowIndex} 行排产数量为 0`);

      // 显示用户提示
      this.$message.success(`第 ${rowIndex + 1} 行日期已更新，正在生成新的排班表...`);

      // 延迟自动显示排产浮层
      this.$nextTick(() => {
        setTimeout(() => {
          console.log(`🚀 准备显示第 ${rowIndex} 行的排产浮层`);

          // 查找正确的触发元素（排产数量列的容器）
          let triggerElement = null;

          // 方法1: 通过表格行索引和类名查找
          const tableBody = this.$refs.customerOrderRef?.$el?.querySelector('.el-table__body tbody');
          if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            if (rows[rowIndex]) {
              triggerElement = rows[rowIndex].querySelector('.schedule-num-container');
              console.log(`📍 通过表格行索引找到触发元素:`, triggerElement);
            }
          }

          // 方法2: 通过data-row-index属性查找
          if (!triggerElement) {
            triggerElement = document.querySelector(`[data-row-index="${rowIndex}"] .schedule-num-container`);
            console.log(`📍 通过data-row-index找到触发元素:`, triggerElement);
          }

          // 方法3: 如果还是找不到，尝试直接查找所有排产容器
          if (!triggerElement) {
            const allContainers = document.querySelectorAll('.schedule-num-container');
            if (allContainers[rowIndex]) {
              triggerElement = allContainers[rowIndex];
              console.log(`📍 通过索引位置找到触发元素:`, triggerElement);
            }
          }

          // 兜底方案：使用表格行作为参考位置
          if (!triggerElement) {
            const tableBody = this.$refs.customerOrderRef?.$el?.querySelector('.el-table__body tbody');
            if (tableBody) {
              const rows = tableBody.querySelectorAll('tr');
              if (rows[rowIndex]) {
                triggerElement = rows[rowIndex];
                console.log(`📍 使用表格行作为定位参考:`, triggerElement);
              }
            }
          }

          // 最终兜底：使用null，让定位方法使用屏幕中央
          if (!triggerElement) {
            console.warn(`⚠️ 未找到第 ${rowIndex} 行的任何元素，将使用屏幕中央定位`);
            triggerElement = null;
          }

          // 创建模拟事件
          const mockEvent = {
            target: triggerElement,
            currentTarget: triggerElement,
            stopPropagation: () => { },
            preventDefault: () => { }
          };

          console.log(`🎯 使用触发元素:`, triggerElement);

          // 调用显示方法
          this.showDailySchedulePopover(rowIndex, rowData, mockEvent);
        }, 500); // 延迟500ms确保DOM完全渲染
      });
    },

    // ==================== 每日排产浮层相关方法 ====================

    // 显示每日排产浮层
    showDailySchedulePopover(rowIndex, rowData, event) {
      console.log('🚀 showDailySchedulePopover 被调用:', {
        rowIndex,
        dateRange: rowData.dateRange,
        dateRangeLength: rowData.dateRange?.length,
        event: event.type || 'mock'
      });

      // 阻止事件冒泡
      if (event.stopPropagation) {
        event.stopPropagation();
      }

      // 检查是否有生产日期范围
      if (!rowData.dateRange || rowData.dateRange.length !== 2) {
        console.log('❌ 日期范围检查失败:', rowData.dateRange);
        this.$message.warning('请先选择生产日期范围');
        return;
      }

      console.log('✅ 日期范围检查通过，继续执行...');

      // 如果浮层已经显示且是同一行，则关闭
      if (this.dailySchedulePopover.visible && this.dailySchedulePopover.currentRowIndex === rowIndex) {
        this.closeDailySchedulePopover();
        return;
      }

      // 设置当前行数据
      this.dailySchedulePopover.currentRowIndex = rowIndex;
      this.dailySchedulePopover.currentRowData = rowData;

      // 设置智能分配数量的默认值为当前行的订单数量
      this.distributeAmount = rowData.orderQuantity || 0;

      // 生成每日排产数据
      this.generateDailyScheduleList(rowData);

      console.log('🔍 生成每日数据完成，dailyScheduleList长度:', this.dailyScheduleList.length);

      // 计算浮层位置
      const triggerElement = event.target.closest('.schedule-num-container') || event.currentTarget;
      this.calculatePopoverPosition(triggerElement);

      console.log('🔍 计算位置完成，准备显示浮层');

      // 显示浮层
      this.dailySchedulePopover.visible = true;

      console.log('✅ 浮层已设置为显示:', this.dailySchedulePopover.visible);

      // 延迟添加外部点击监听，避免立即触发
      this.$nextTick(() => {
        setTimeout(() => {
          document.addEventListener('click', this.handleOutsideClick);
        }, 200);
      });
    },

    // 关闭每日排产浮层
    closeDailySchedulePopover() {
      this.dailySchedulePopover.visible = false;
      this.dailySchedulePopover.currentRowIndex = -1;
      this.dailySchedulePopover.currentRowData = null;
      this.dailyScheduleList = [];
      document.removeEventListener('click', this.handleOutsideClick);
    },

    // 生成完整日期范围的方法（用于编辑回显）
    generateFullDateRange(startDateStr, endDateStr) {
      const dailyList = [];
      let currentDate = new Date(startDateStr);
      const endDateTime = new Date(endDateStr);

      while (currentDate <= endDateTime) {
        const dayOfWeek = currentDate.getDay();
        const isRestDay = dayOfWeek === 0; // 只有周日是休息日，周六是正常工作日

        // 包含所有日期，但设置默认工作状态（周六为正常工作日）
        dailyList.push({
          date: this.formatDate(currentDate, 'yyyy-MM-dd') + ' 00:00:00',
          plannedNum: 0,
          actualNum: 0,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6, // 保留周末标识用于显示样式
          workStatus: isRestDay ? 'rest' : 'working', // 只有周日默认休息，周六为工作日
          status: 'pending'
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dailyList;
    },

    // 生成每日排产数据列表
    generateDailyScheduleList(rowData) {
      const { dateRange } = rowData;
      const [startDate, endDate] = dateRange;

      const dailyList = [];
      let currentDate = new Date(startDate);
      const endDateTime = new Date(endDate);

      while (currentDate <= endDateTime) {
        const dayOfWeek = currentDate.getDay();
        const isRestDay = dayOfWeek === 0; // 只有周日是休息日，周六是正常工作日

        // 包含所有日期，但设置默认工作状态（周六为正常工作日）
        dailyList.push({
          date: this.formatDate(currentDate, 'yyyy-MM-dd'),
          plannedNum: 0,
          actualNum: 0,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6, // 保留周末标识用于显示样式
          workStatus: isRestDay ? 'rest' : 'working', // 只有周日默认休息，周六为工作日
          status: 'pending'
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 如果有存储的数据，恢复之前的设置
      const rowKey = `${rowData.id || rowData.customerOrderNo}_${this.dailySchedulePopover.currentRowIndex}`;
      if (this.dailyScheduleData[rowKey]) {
        this.dailyScheduleList = [...this.dailyScheduleData[rowKey]];
      } else {
        this.dailyScheduleList = dailyList;
        // 不自动分配数量，让用户手动设置
      }
    },

    // 智能分配排产数量
    autoDistributeSchedule() {
      // 获取工作日（工作状态为 working 或 special）
      const workingDays = this.dailyScheduleList.filter(day =>
        day.workStatus === 'working' || day.workStatus === 'special'
      );
      const dayCount = workingDays.length;

      if (dayCount === 0) {
        this.$message.warning('没有工作日可以分配排产数量');
        return;
      }

      if (!this.distributeAmount || this.distributeAmount <= 0) {
        this.$message.warning('请输入要分配的数量');
        return;
      }

      // 平均分配用户输入的数量
      const baseNum = Math.floor(this.distributeAmount / dayCount);
      const remainder = this.distributeAmount % dayCount;

      // 分配数量
      workingDays.forEach((day, index) => {
        day.plannedNum = baseNum;
        // 余数分配给前几个工作日
        if (index < remainder) {
          day.plannedNum += 1;
        }
      });

      this.$message.success(`已智能分配排产数量：总计${this.distributeAmount}，平均分配到${workingDays.length}个工作日`);
    },

    // 更新工作状态
    updateWorkStatus(row) {
      if (row.workStatus === 'rest') {
        // 休息日清零计划数量
        row.plannedNum = 0;
      }
      this.updateTotalScheduleNum();
    },

    // 确认每日排产计划
    confirmDailySchedule() {
      // 检查是否有工作日设置了排产数量
      const workingDaysWithPlan = this.dailyScheduleList.filter(day =>
        (day.workStatus === 'working' || day.workStatus === 'special') && day.plannedNum > 0
      );

      if (workingDaysWithPlan.length === 0) {
        this.$message.warning('请至少为一个工作日设置排产数量');
        return;
      }

      // 检查总排产数量是否大于0
      if (this.totalScheduleNum <= 0) {
        this.$message.warning('总排产数量必须大于0');
        return;
      }

      this.saveDailyScheduleData();
    },

    // 保存每日排产数据
    saveDailyScheduleData() {
      const rowKey = `${this.dailySchedulePopover.currentRowData.id || this.dailySchedulePopover.currentRowData.customerOrderNo}_${this.dailySchedulePopover.currentRowIndex}`;

      // 保存数据
      this.$set(this.dailyScheduleData, rowKey, [...this.dailyScheduleList]);

      // 更新主表格的排产数量（由每日产能总和自动计算）
      if (this.dailySchedulePopover.currentRowData) {
        this.$set(this.dailySchedulePopover.currentRowData, 'num', this.totalScheduleNum);
      }

      this.$message.success(`每日排产计划已保存，总排产数量：${this.totalScheduleNum}`);
      this.closeDailySchedulePopover();
    },

    // 计算浮层位置
    calculatePopoverPosition(triggerElement) {
      console.log('🔍 计算浮层位置，triggerElement:', triggerElement);

      if (!triggerElement || triggerElement === document.body) {
        console.log('⚠️ 触发元素不存在或为body，使用屏幕中央位置');
        const centerLeft = Math.max(10, (window.innerWidth - 450) / 2);
        const centerTop = Math.max(10, (window.innerHeight - 400) / 2);

        this.dailySchedulePopover.style = {
          left: `${centerLeft}px`,
          top: `${centerTop}px`,
          position: 'fixed',
          zIndex: 99999
        };
        return;
      }

      const rect = triggerElement.getBoundingClientRect();
      const popoverWidth = 450;
      const popoverHeight = 400;
      const margin = 15;
      const minMargin = 10;

      // 获取可视区域尺寸
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right + margin;
      let top = rect.top - 50;

      // 水平位置边界检测和调整
      if (left + popoverWidth > viewportWidth - minMargin) {
        // 尝试在左侧显示
        left = rect.left - popoverWidth - margin;
        
        // 如果左侧也超出边界，则居中显示
        if (left < minMargin) {
          left = Math.max(minMargin, (viewportWidth - popoverWidth) / 2);
        }
      }

      // 确保左边界不超出
      if (left < minMargin) {
        left = minMargin;
      }

      // 垂直位置边界检测和调整
      if (top + popoverHeight > viewportHeight - minMargin) {
        // 尝试在下方显示
        top = rect.bottom + minMargin;
        
        // 如果下方也超出边界，则调整到合适位置
        if (top + popoverHeight > viewportHeight - minMargin) {
          top = Math.max(minMargin, viewportHeight - popoverHeight - minMargin);
        }
      }

      // 确保顶部边界不超出
      if (top < minMargin) {
        top = minMargin;
      }

      // 最终边界检查，确保弹窗完全在可视区域内
      left = Math.min(left, viewportWidth - popoverWidth - minMargin);
      top = Math.min(top, viewportHeight - popoverHeight - minMargin);
      left = Math.max(left, minMargin);
      top = Math.max(top, minMargin);

      this.dailySchedulePopover.style = {
        left: `${left}px`,
        top: `${top}px`,
        position: 'fixed',
        zIndex: 99999
      };

      console.log('✅ 浮层位置已设置:', this.dailySchedulePopover.style);
    },

    // 处理外部点击
    handleOutsideClick(event) {
      const popoverEl = this.$refs.dailySchedulePopover;
      if (popoverEl && !popoverEl.contains(event.target)) {
        this.closeDailySchedulePopover();
      }
    },

    // 键盘事件处理
    handlePopoverKeydown(event) {
      switch (event.key) {
        case 'Escape':
          this.closeDailySchedulePopover();
          break;
        case 'Enter':
          if (event.ctrlKey || event.metaKey) {
            this.confirmDailySchedule();
          }
          break;
      }
    },

    // 更新总数量（响应每日数量变化）
    updateTotalScheduleNum() {
      // 自动触发计算属性更新
      this.$forceUpdate();
    },

    // 获取星期文本
    getWeekdayText(date) {
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const dateObj = new Date(date);
      return weekdays[dateObj.getDay()];
    },

    // 表格行样式名称设置（用于添加data属性）
    tableRowClassName({ rowIndex }) {
      // 使用nextTick确保DOM更新后添加data属性
      this.$nextTick(() => {
        const rowElement = this.$refs.customerOrderRef?.$el?.querySelector(`.el-table__body tr:nth-child(${rowIndex + 1})`);
        if (rowElement) {
          rowElement.setAttribute('data-row-index', rowIndex);
        }
      });
      return '';
    },

    // 获取排产状态类型
    getScheduleStatusType(status) {
      const statusMap = {
        'pending': '',
        'processing': 'warning',
        'completed': 'success'
      };
      return statusMap[status] || '';
    },

    // 获取排产状态文本
    getScheduleStatusText(status) {
      const statusMap = {
        'pending': '待排产',
        'processing': '进行中',
        'completed': '已完成'
      };
      return statusMap[status] || '待排产';
    },

    // 格式化日期
    formatDate(date, format) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return format
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day);
    },
  },
};
</script>

<style lang="scss" scoped>
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}

.products-box {
  max-height: 400px;
  overflow: auto;
  overflow-x: hidden;

  .add-btn {
    position: sticky;
    top: -6px;
    z-index: 666;
    background: #fff;
    padding: 10px;
  }

  .product-list-box {
    border-radius: 3px;
  }
}

// ==================== 排产数量容器样式 ====================
.schedule-num-container {
  display: flex;
  align-items: center;
  gap: 5px;

  .readonly-input {
    cursor: pointer;

    ::v-deep .el-input__inner {
      cursor: pointer;
      border: 1px dashed #dcdfe6;
      text-align: center;

      &:hover {
        border-color: #409EFF;
      }

      &:focus {
        border-color: #409EFF;
      }
    }
  }

  .el-button {
    padding: 5px 8px;
    margin: 0;

    &:hover {
      color: #409EFF;
    }
  }
}

// ==================== 工作状态下拉框样式 ====================
.work-status-dropdown {
  z-index: 99998 !important;
}

// ==================== 每日排产浮层样式 ====================
.daily-schedule-popover {
  position: fixed !important;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 99999 !important;
  min-width: 420px;

  // 确保显示
  display: block !important;

  // 浮层头部
  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;
    border-radius: 6px 6px 0 0;

    .header-title {
      font-weight: 500;
      font-size: 14px;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .distribute-controls {
        display: flex;
        align-items: center;
      }

      .close-btn {
        font-size: 18px;
        font-weight: bold;
        color: #909399;
        padding: 0;
        width: 20px;
        height: 20px;

        &:hover {
          color: #409EFF;
        }
      }
    }
  }

  // 浮层内容
  .popover-content {
    padding: 12px;
    max-height: 500px;
    overflow-y: auto;

    .daily-schedule-table {
      .weekday-text {
        font-size: 12px;
        color: #909399;

        &.weekend {
          color: #f56c6c;
          font-weight: 500;
        }
      }

      .el-table__row:nth-child(odd) {
        background-color: #fafafa;
      }

      .el-input-number {
        width: 100%;

        ::v-deep .el-input__inner {
          text-align: center;
        }
      }
    }
  }

  // 浮层底部
  .popover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
    background: #f8f9fa;
    border-radius: 0 0 6px 6px;

    .total-info {
      font-size: 13px;
      color: #606266;

      .working-days-info {
        font-size: 12px;
        color: #909399;
        margin-left: 8px;
      }
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }

  // 动画效果
  animation: popoverFadeIn 0.2s ease-out;
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .daily-schedule-popover {
    min-width: 320px;

    .popover-header {
      padding: 10px 12px;

      .header-title {
        font-size: 13px;
      }
    }

    .popover-content {
      padding: 8px;

      .daily-schedule-table {
        font-size: 12px;
      }
    }

    .popover-footer {
      padding: 10px 12px;

      .total-info {
        font-size: 12px;
      }
    }
  }
}
</style>
