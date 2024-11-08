<template>
  <div>
    <el-dialog
      class="fixed_bottom_dialog"
      :title="title"
      :visible.sync="dialogVisible"
      top="2vh"
      center
      append-to-body
      :close-on-click-modal="false"
      fullscreen
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="110px"
        label-position="top"
        class="input-width"
      >
        <el-row :gutter="30" class="margin-bottom-xs">
          <el-col :span="4">
            <el-form-item prop="salesOrderNo" class="sales-order-no">
              <template v-slot:label>
                <span class="flex justify-between w100">
                  <span>客户采购单号</span>
                  <span v-show="form.customerName"
                    >客户名称: {{ form.customerName }}</span
                  >
                </span>
              </template>
              <select-loadMore
                style="width: 100%"
                v-model="form.salesOrderNo"
                :data="salesOrderNoData.data"
                :page="salesOrderNoData.page"
                :hasMore="salesOrderNoData.more"
                dictLabel="salesOrderNo"
                :moreParams="true"
                :disabled="!!form.id || isOrderFlag"
                :request="getOrderList"
                @getChange="getOrderData"
                v-slot="{ proOption }"
                placeholder="请选择客户采购单号"
              >
                <template>
                  <span style="float: left">
                    {{ proOption.customerName }}
                  </span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ proOption.salesOrderNo }}
                  </span>
                </template>
              </select-loadMore>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="发货单号" prop="orderNumber">
              <el-input
                v-model="form.orderNumber"
                clearable
                placeholder="请输入发货单号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="发货数量" prop="shippingNumber">
              <el-input-number
                v-model="form.shippingNumber"
                controls-position="right"
                :min="1"
                :precision="0"
                style="width: 100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="运输方式" prop="transportMode">
              <el-select
                v-model="form.transportMode"
                filterable
                allow-create
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in deliveryType"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="收货人" prop="consignee">
              <select-loadMore
                style="width: 100%"
                v-model="form.consignee"
                :data="addressData.data"
                :page="addressData.page"
                :hasMore="addressData.more"
                :moreParams="true"
                v-slot="{ proOption }"
                :request="getDeliveryAddress"
                @getChange="getDeliveryId"
                placeholder="请选择收货人"
              >
                <template>
                  <span style="float: left">
                    {{ proOption.consignee }}
                  </span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="proOption.address"
                    placement="right"
                  >
                    <span style="float: right; color: #8492a6; font-size: 13px">
                      {{ proOption.address }}
                    </span>
                  </el-tooltip>
                </template>
              </select-loadMore>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="form.phone" clearable readonly />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="收货地址" prop="address">
              <el-input v-model="form.address" type="textarea" readonly />
            </el-form-item>
          </el-col>
          <el-col>
            <template>
              <div class="flex justify-between margin-bottom-xs">
                <span>客户订单</span>
                <el-button
                  v-show="
                    form.salesOrderNo &&
                    (!form.id || form.status === 1 || form.status === 3)
                  "
                  type="primary"
                  plain
                  size="mini"
                  @click="handleMoreOrder"
                >
                  多单新增
                </el-button>
              </div>
              <el-table :data="form.list" border :height="500">
                <el-table-column
                  label="客户订单号"
                  prop="customerOrderNo"
                  align="center"
                >
                  <span
                    slot-scope="{ row }"
                    v-NoData="row.customerOrderNo"
                  ></span>
                </el-table-column>
                <el-table-column
                  label="送货单号"
                  prop="oddNumbers"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-model.lazy.trim="scope.row.oddNumbers"
                      clearable
                      placeholder="请输入"
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column
                  label="计划发货数量"
                  prop="shippingNumber"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.shippingNumber"
                      :min="1"
                      style="width: 100%"
                    ></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column
                  label="计划发货时间"
                  prop="shippingTime"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-date-picker
                      v-model="scope.row.shippingTime"
                      align="right"
                      type="date"
                      clearable
                      placeholder="请选择"
                      value-format="timestamp"
                      :picker-options="pickerOptions"
                      format="yyyy-MM-dd"
                      style="width: 100%;"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="remark" align="center">
                  <template slot-scope="scope">
                    <el-input
                      v-model.lazy.trim="scope.row.remark"
                      clearable
                      placeholder="请输入"
                    ></el-input>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <SelectMoreOrder
      :isDrawerShow.sync="isDrawerShow"
      :customerOrderData="customerOrderData"
      @sendMoreOrder="getMoreOrder"
    />
  </div>
</template>

<script>
import { orderList } from "@/api/order";
import { addDelivery, updateDelivery, deliveryAddress } from "@/api/delivery";
import SelectMoreOrder from "./selectMoreOrder.vue";

export default {
  props: [
    "classifyList",
    "involveUnitList",
    "isOrderFlag",
    "salesOrderNo",
    "orderQuantity",
  ],
  components: {
    SelectMoreOrder,
  },
  data() {
    return {
      myFileList: "",
      dialogVisible: false,
      isDrawerShow: false,
      title: "",
      // 表单参数
      form: {},
      // 迪太订单号
      salesOrderNoData: {
        data: [],
        page: 1,
        more: true,
      },
      // 发货地址
      addressData: {
        data: [],
        page: 1,
        more: true,
      },
      // 运输方式
      deliveryType: [],
      // 多订单
      moreOrderData: [],
      customerOrderData: {},
      // 表单校验
      rules: {
        salesOrderNo: [
          { required: true, message: "请输入迪太订单号", trigger: "change" },
        ],
        orderNumber: [
          { required: true, message: "请输入发货单号", trigger: "blur" },
        ],
        shippingNumber: [
          {
            required: true,
            message: "请输入发货数量",
            trigger: ["blur", "change"],
          },
        ],
        consignee: [
          { required: true, message: "请输入收货人", trigger: "change" },
        ],
        // phone: [
        //   { required: false, message: "请输入手机号码", trigger: "blur" },
        //   {
        //     pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        //     message: "请输入正确的手机号码",
        //     trigger: "blur",
        //   },
        // ],
        transportMode: [
          { required: true, message: "请输入运输方式", trigger: "change" },
        ],
        // address: [
        //   { required: false, message: "请输入收货地址", trigger: "blur" },
        // ],
        isReceipt: [{ required: true, message: "请选择", trigger: "change" }],
        // file: [{ required: true, message: "请上传附件", trigger: "change" }],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 24 * 3600 * 1000;
        },
        shortcuts: [
          {
            text: "一天后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一个月后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit("pick", date);
            },
          },
        ],
      },
    };
  },
  watch: {
    dialogVisible(show) {
      if (show) {
        this.getDeliveryType();
      }
      if (show && this.isOrderFlag) {
        this.form.salesOrderNo = this.salesOrderNo;
        this.form.shippingNumber = this.orderQuantity;

        this.getOrderList({ keyword: this.salesOrderNo }).then(() => {
          const params = this.salesOrderNoData.data[0];
          this.getOrderData(JSON.stringify(params));
        });
      }
    },
  },
  methods: {
    // 运输方式
    getDeliveryType() {
      this.getDicts("sys_delivery_type").then((res) => {
        this.deliveryType = res.data;
      });
    },
    // 迪太订单号
    getOrderList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        orderList({
          p: page,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.salesOrderNoData.data = [
              ...this.salesOrderNoData.data,
              ...list,
            ];
          } else {
            this.salesOrderNoData.data = list;
          }
          this.salesOrderNoData.more = pageNum * pageSize < total;
          this.salesOrderNoData.page = pageNum;
          resolve();
        });
      });
    },
    getOrderData(params) {
      if (!params) {
        this.form.customerName = "";
        this.form.salesOrderNo = "";
        this.form.customerOrderNo = "";
        this.form.categoryName = "";
        this.form.computerName = "";
        this.form.orderId = "";
        this.form.shippingNumber = "";
        return;
      }
      const {
        customerName,
        salesOrderNo,
        customerOrderNo,
        categoryName,
        computerName,
        orderQuantity,
        id,
      } = JSON.parse(params);
      this.form.customerName = customerName;
      this.form.salesOrderNo = salesOrderNo;
      this.form.customerOrderNo = customerOrderNo;
      this.form.categoryName = categoryName;
      this.form.computerName = computerName;
      this.form.shippingNumber = orderQuantity;
      this.form.orderId = id;
    },
    getDeliveryAddress({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        deliveryAddress({
          p: page,
          consignee: keyword
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.addressData.data = [...this.addressData.data, ...list];
          } else {
            this.addressData.data = list;
          }
          this.addressData.more = pageNum * pageSize < total;
          this.addressData.page = pageNum;
          resolve();
        });
      });
    },
    getDeliveryId(params) {
      if (!params) {
        this.form.phone = "";
        this.form.address = "";
        this.form.consignee = "";
        return;
      }

      const { phone, address, consignee, id } = JSON.parse(params);

      this.form.phone = phone;
      this.form.address = address;
      this.form.consignee = consignee;
      this.form.addressId = id;
    },
    // 表单重置
    reset() {
      this.form = {
        list: [],
      };
      this.resetForm("form");
    },
    // 多单新增
    handleMoreOrder() {
      this.isDrawerShow = true;
      const { customerName, orderId, list } = this.form;
      this.customerOrderData = {
        customerName,
        orderId,
        list,
      };
      console.log("handleMoreOrder", this.customerOrderData);
    },
    // 多订单数据
    getMoreOrder(data) {
      this.moreOrderData = data;

      this.form.list = this.indMatchingAndNewItems(this.customerOrderData.list, this.moreOrderData, 'orderId', 'id');
    },
    indMatchingAndNewItems(a, b, keyA, keyB) {
      // 创建以a数组的keyA属性为键的映射
      const mapA = new Map(a.map((item) => [item[keyA], item]));

      // 用于存储匹配项和新增项的结果数组
      const result = [];

      // 遍历数组b，找出匹配项和新增项
      b.forEach((itemB) => {
        const orderId = itemB[keyB];
        const itemA = mapA.get(orderId);

        if (itemA) {
          // 如果在a中找到了匹配的orderId，添加到结果数组
          result.push(itemA);
        } else {
          // 如果在a中没有找到匹配的orderId，视为新增项，添加到结果数组
          const data = {
            customerName: itemB.customerName,
            customerOrderNo: itemB.customerOrderNo,
            orderId: itemB.id,
            shippingNumber: itemB.orderQuantity,
            shippingTime: itemB.sellTime
          }
          result.push(data);
        }
      });

      return result;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = JSON.parse(JSON.stringify(this.form));

          if (param.id) {
            updateDelivery(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addDelivery({ ...param }).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("创建成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.sales-order-no {
  /deep/ .el-form-item__label {
    display: flex;
  }
}
</style>
