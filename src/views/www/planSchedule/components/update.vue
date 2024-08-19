<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="0vh"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      label-position="left"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="overflow-y"
      style="max-height: 500px"
    >
      <template v-if="!isExcelFile">
        <el-form-item label="迪太订单号:" prop="salesOrderNo">
          <select-loadMore
            style="width: 65%"
            v-model="form.salesOrderNo"
            :data="orderData.data"
            :page="orderData.page"
            :hasMore="orderData.more"
            dictLabel="salesOrderNo"
            :moreParams="true"
            :disabled="!!form.id"
            :request="getOrderList"
            @getChange="getOrderId"
            placeholder="请选择迪太订单号"
          />
        </el-form-item>

        <template
          v-if="form.salesOrderNo && orderInfo.salesOrderNo && dialogVisible"
        >
          <transition name="fade">
            <el-descriptions
              class="margin-top margin-bottom"
              :column="3"
              direction="vertical"
              size="mini"
              border
            >
              <el-descriptions-item label="迪太订单号">
                {{ orderInfo.salesOrderNo }}
              </el-descriptions-item>
              <el-descriptions-item
                label="客户名称"
                v-if="orderInfo.customerName"
              >
                {{ orderInfo.customerName }}
              </el-descriptions-item>
              <el-descriptions-item
                label="客户订单号"
                v-if="orderInfo.customerOrderNo"
              >
                {{ orderInfo.customerOrderNo }}
              </el-descriptions-item>
              <el-descriptions-item label="品类" v-if="orderInfo.categoryName">
                {{ orderInfo.categoryName }}
              </el-descriptions-item>
              <el-descriptions-item label="型号" v-if="orderInfo.computerName">
                {{ orderInfo.computerName }}
              </el-descriptions-item>
              <el-descriptions-item label="BOM编码" v-if="orderInfo.bomCode">
                {{ orderInfo.bomCode }}
              </el-descriptions-item>
              <el-descriptions-item
                label="芯片版本"
                v-if="orderInfo.chipVersion"
              >
                {{ orderInfo.chipVersion }}
              </el-descriptions-item>
              <el-descriptions-item
                label="订单数量"
                v-if="orderInfo.orderQuantity"
              >
                {{ orderInfo.orderQuantity }}
              </el-descriptions-item>
              <el-descriptions-item label="出货日期" v-if="orderInfo.sellTime">
                <span class="text-red">
                  {{ parseTime(orderInfo.sellTime) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item
                label="客户要求到货日期"
                v-if="orderInfo.arrivalTime"
              >
                <span class="text-green">
                  {{ parseTime(orderInfo.arrivalTime) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item
                label="出货地址"
                v-if="orderInfo.consigneeAddress"
              >
                {{ orderInfo.consigneeAddress }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                {{ statusList[orderInfo.status] }}
              </el-descriptions-item>
              <el-descriptions-item label="箱唛" v-if="orderInfo.isMark">
                {{ markList[orderInfo.isMark] }}
              </el-descriptions-item>
              <el-descriptions-item
                label="指定内容"
                v-if="orderInfo.containerMarkInfo"
              >
                {{ orderInfo.containerMarkInfo }}
              </el-descriptions-item>
            </el-descriptions>
          </transition>
        </template>

        <el-form-item label="订单编号" prop="orderCode">
          <select-loadMore
            v-model="form.orderCode"
            :data="prodPlatData.data"
            :page="prodPlatData.page"
            :hasMore="prodPlatData.more"
            dictLabel="orderCode"
            dictValue="orderCode"
            :request="getProdPlantList"
            placeholder="请选择订单编号"
            style="width: 65%"
          >
          </select-loadMore>
        </el-form-item>

        <el-form-item label="生产日期:" prop="date">
          <el-date-picker
            v-model="form.date"
            style="width: 65%"
            :disabled="!form.salesOrderNo"
            type="date"
            :default-time="defaultTime"
            :picker-options="pickerOptions"
            value-format="timestamp"
            placeholder="请选择生产日期"
            @change="selDate"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="生产流程:" prop="process">
          <el-radio-group v-model="form.process" :disabled="!!form.id">
            <el-radio
              v-for="(item, index) in operationList"
              :key="index"
              :label="item.dictLabel"
            >
              {{ item.dictLabel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生产地点:" prop="address">
          <el-radio-group v-model="form.address">
            <el-radio
              v-for="(item, index) in productAddressList"
              :key="index"
              :label="item.dictLabel"
            >
              {{ item.dictLabel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排产数量:" prop="num">
          <el-input
            v-model="form.num"
            clearable
            style="width: 65%"
            placeholder="请输入排产数量"
            v-PreInput:price
          >
            <template slot="append">pcs</template>
          </el-input>
        </el-form-item>
      </template>

      <el-form-item label="资料清单:" prop="excelUrl" v-else>
        <DrUpload class="flex-direction" v-model="form.excelUrl" :isOnePic="1">
          <div class="text-left">
            <el-button size="mini" type="primary">上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isBtnLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  schedulingCreate,
  schedulingEdit,
  scheduleVersion,
} from "@/api/www/planSchedule";
import { schemeTypeList } from "@/api/system/skipType";
import tinymce from "@/views/components/Editor";
import { orderList } from "@/api/order";
import { orderWorkList } from "@/api/third/prodPlant";

export default {
  name: "planScheduleUpdate",
  props: ["title", "dictList", "operationList", "isExcelFile"],
  components: {
    tinymce,
  },
  data() {
    return {
      disabledDate: null,
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
        categoryId: "",
        computerId: "",
        orderCode: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        dateRange: [],
        num: "",
      },
      // 订单数据
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      // 订单编号
      prodPlatData: {
        data: [],
        page: 1,
        more: true,
      },
      orderInfo: {},
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
      // 表单校验
      rules: {
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
        dateRange: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        orderNo: [
          { required: true, message: "请输入客户订单号", trigger: "blur" },
        ],
        excelUrl: [
          { required: true, message: "请上传资料清单", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    pickerOptions() {
      return {
        // disabledDate: this.disabledDate,
        selectableRange: `${this.defaultTime} - 23:59:59`,
      };
    },
  },
  watch: {
    "orderInfo.sellTime"(sellTime) {
      if (sellTime) {
        this.disabledDate = (time) => {
          return (
            time.getTime() > sellTime ||
            time.getTime() < Date.now() - 24 * 3650 * 1000
          );
        };
      } else {
        this.disabledDate = (time) => {
          return time.getTime() < Date.now() - 24 * 3650 * 1000;
        };
      }
    },
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
  },
  created() {
    this.getProductAddress();
    this.getScheduleVersion();
    this.getChipTypeList();
  },
  methods: {
    /** 订单号数据 */
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
    getOrderId(info) {
      if (!info) {
        this.form.orderId = "";
        return;
      }
      this.orderInfo = JSON.parse(info);
      this.form.orderId = this.orderInfo.id;
    },
    getComputerId(id) {
      if (id) {
        this.form.computerId = "";
      }
    },
    getOrderDetail(salesOrderNo) {
      orderList({
        status: 1,
        salesOrderNo,
      }).then((res) => {
        if (res.data.list.length) {
          this.orderInfo = res.data.list[0];
        }
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
    selDate(time) {
      this.form.dateRange = [time, time];
    },
    // 表单重置
    reset() {
      this.form = {
        categoryId: "",
        computerId: "",
        date: "",
        orderCode: "",
        address: "",
        process: "",
        schemeVersion: "",
        dateRange: [],
        num: "",
      };
      this.resetForm("form");
    },
    onAlertReason(params) {
      const { salesOrderNo, date, process, address, num } = params;
      if (
        this.cloneForm.salesOrderNo !== salesOrderNo ||
        this.cloneForm.date !== date ||
        this.cloneForm.process !== process ||
        this.cloneForm.address !== address ||
        this.cloneForm.num !== num
      ) {
        return true;
      } else {
        return false;
      }
    },
    onUpdateOrder(params) {
      schedulingEdit(params)
        .then((res) => {
          if (res.code === 200) {
            this.msgSuccess("编辑成功");
            this.isBtnLoading = false;
            this.dialogVisible = false;
            this.$emit("getData");
          }
        })
        .catch(() => {
          this.isBtnLoading = false;
        });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const data = this.addDateRange(this.form, this.form.dateRange, {
            begin: "startTime",
          });
          this.isBtnLoading = true;
          if (this.form.process !== "SMT") {
            this.form.schemeVersion = "";
          }
          if (this.form.id) {
            if (!this.isExcelFile && this.onAlertReason(this.form)) {
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
                  this.onUpdateOrder({ msg: value, ...this.form });
                })
                .catch(() => {
                  this.isBtnLoading = false;
                });
            } else {
              this.onUpdateOrder(this.form);
            }
          } else {
            schedulingCreate(data)
              .then((res) => {
                if (res.code === 200) {
                  this.msgSuccess("新增成功");
                  this.dialogVisible = false;
                  this.$emit("getData");
                }
              })
              .then(() => {
                this.isBtnLoading = false;
              })
              .finally(() => {
                this.isBtnLoading = false;
              });
          }
        }
      });
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
</style>
