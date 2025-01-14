<template>
  <el-dialog
    class="fixed_bottom_dialog"
    :title="title"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="0vh"
    fullscreen
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      label-position="top"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <template v-if="!isExcelFile">
        <el-row :gutter="30">
          <el-col :span="4">
            <el-form-item label="迪太订单号:" prop="salesOrderNo">
              <select-loadMore
                v-model="form.salesOrderNo"
                :data="orderCodeData.data"
                :page="orderCodeData.page"
                :hasMore="orderCodeData.more"
                dictLabel="salesOrderNo"
                dictValue="salesOrderNo"
                :disabled="!!form.id"
                :request="getCustomerOrderList"
                @getChange="getOrderNo"
                placeholder="请选择迪太订单号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="4">
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
                style="width: 100%"
              >
              </select-loadMore>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="生产日期:" prop="date">
              <el-date-picker
                v-model="form.date"
                :disabled="!form.salesOrderNo"
                type="date"
                value-format="timestamp"
                placeholder="请选择生产日期"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="生产流程:" prop="process">
              <el-select
                v-model="form.process"
                :disabled="!!form.id"
                style="width: 100%"
              >
                <el-option
                  v-for="(item, index) in operationList"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictLabel"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="4">
            <el-form-item label="生产地点:" prop="address">
              <el-select v-model="form.address" style="width: 100%">
                <el-option
                  v-for="(item, index) in productAddressList"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictLabel"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="客户订单信息:" required>
          <el-table
            :data="orderData"
            border
            row-key="id"
            :height="tableHeight(-50)"
            class="margin-top-sm margin-bottom-sm"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              v-if="!form.id"
              type="selection"
              width="55"
              align="center"
              :reserve-selection="true"
            />
            <el-table-column
              label="客户订单号"
              align="center"
              prop="customerOrderNo"
            />
            <el-table-column
              label="客户名称"
              align="center"
              prop="customerName"
            />
            <el-table-column label="品类" align="center" prop="categoryName" />
            <el-table-column label="型号" align="center" prop="computerName" />
            <el-table-column label="BOM编码" align="center" prop="bomCode">
              <template slot-scope="scope">
                <span v-NoData="scope.row.bomCode"></span>
              </template>
            </el-table-column>
            <el-table-column
              label="芯片版本"
              align="center"
              prop="chipVersion"
            />
            <el-table-column
              label="订单数量"
              align="center"
              prop="orderQuantity"
            />
            <el-table-column label="出货日期" align="center" prop="sellTime">
              <template slot-scope="scope">
                <span
                  v-NoData="parseTime(scope.row.sellTime, '{y}-{m}-{d}')"
                  class="text-red"
                ></span>
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
            <el-table-column label="批次号" align="center" prop="batchNo">
              <template slot-scope="scope">
                <el-input
                  v-model.trim="scope.row.batchNo"
                  placeholder="请输入批次号"
                  clearable
                />
              </template>
            </el-table-column>
            <el-table-column label="批次数量" align="center" prop="batchNum">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.batchNum"
                  controls-position="right"
                  :min="1"
                  :precision="0"
                />
              </template>
            </el-table-column>
            <el-table-column label="排产数量" align="center" prop="num">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.num"
                  controls-position="right"
                  :min="1"
                  :precision="0"
                />
              </template>
            </el-table-column>
          </el-table>
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
        categoryId: "",
        computerId: "",
        orderCode: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        batchNo: "",
        batchNum: 1,
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
      if (salesOrderNo) {
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
        categoryId: "",
        computerId: "",
        date: "",
        orderCode: "",
        address: "",
        process: "",
        schemeVersion: "",
        batchNo: "",
        batchNum: 1,
        list: [],
      };
      this.orderData = [];
      this.selOrderData = [];
      this.resetForm("form");
    },
    onAlertReason(params) {
      const { salesOrderNo, date, process, address } = params;
      if (
        this.cloneForm.salesOrderNo !== salesOrderNo ||
        this.cloneForm.date !== date ||
        this.cloneForm.process !== process ||
        this.cloneForm.address !== address
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

          if (this.form.process !== "SMT") {
            this.form.schemeVersion = "";
          }

          if (data.id) {
            const { batchNo, batchNum, num } = this.orderData[0];

            if (!batchNo) {
              this.msgWarning("批次号不能为空");
              return;
            }

            if (!batchNum) {
              this.msgWarning("批次数量不能为空");
              return;
            }

            if (!num) {
              this.msgWarning("排产数量不能为空");
              return;
            }

            data = { ...data, batchNo, batchNum, num };

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
            if (!this.selOrderData.length) {
              return this.msgWarning("请选择客户订单");
            }

            if (this.checkDeliverOrderData(this.selOrderData, "batchNo")) {
              this.msgWarning("批次号不能为空");
              return;
            }

            if (this.checkDeliverOrderData(this.selOrderData, "batchNum")) {
              this.msgWarning("批次数量不能为空");
              return;
            }

            if (this.checkDeliverOrderData(this.selOrderData, "num")) {
              this.msgWarning("排产数量不能为空");
              return;
            }

            data.list = this.selOrderData.map((item) => {
              return {
                batchNo: item.batchNo,
                batchNum: item.batchNum,
                orderId: item.id,
                orderNo: item.customerOrderNo,
                num: item.num
              };
            });

            this.isBtnLoading = true;
            schedulingCreate(data)
              .then((res) => {
                if (res.code === 200) {
                  this.msgSuccess("新增成功");
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
