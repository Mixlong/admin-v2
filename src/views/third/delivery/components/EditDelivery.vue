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
            <el-form-item label="客户名称" prop="customerName">
              <select-loadMore
                v-model="form.customerName"
                :data="customerNameData.data"
                :page="customerNameData.page"
                :hasMore="customerNameData.more"
                dictLabel="name"
                dictValue="name"
                :request="getCustomerNameList"
                @getChange="handleResetConsignee"
                class="w100"
              />
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
                    class="item margin-left-lg"
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
          <el-col :span="4">
            <el-form-item label="计划发货时间" prop="shippingTime">
              <el-date-picker
                v-model="form.shippingTime"
                type="date"
                clearable
                placeholder="请选择"
                value-format="timestamp"
                :picker-options="pickerOptions"
                class="w100"
              />
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
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                ></el-option>
              </el-select>
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
                    form.customerName &&
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
                  label="客户采购单号"
                  prop="customerOrderNo"
                  align="center"
                >
                  <span
                    slot-scope="{ row }"
                    v-NoData="row.customerOrderNo"
                  ></span>
                </el-table-column>
                <el-table-column prop="oddNumbers" align="center">
                  <template v-slot:header>
                    <span class="text-red">*</span>
                    送货单号
                  </template>
                  <template slot-scope="scope">
                    <el-input
                      v-model.lazy.trim="scope.row.oddNumbers"
                      clearable
                      placeholder="请输入"
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="shippingNumber" align="center">
                  <template v-slot:header>
                    <span class="text-red">*</span>
                    计划发货数量
                  </template>
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.shippingNumber"
                      :min="0"
                      :precision="0"
                      style="width: 100%"
                    ></el-input-number>
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
import { addDelivery, updateDelivery, deliveryAddress } from "@/api/delivery";
import SelectMoreOrder from "./selectMoreOrder.vue";
import { getCustomerList } from "@/api/order";

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
      form: {
        list: [],
        consignee: "",
        phone: "",
        address: "",
        shippingTime: "",
        transportMode: "",
        customerName: "",
      },
      // 发货地址
      addressData: {
        data: [],
        page: 1,
        more: true,
      },
      // 客户名称
      customerNameData: {
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
        customerName: [
          { required: true, message: "请选择客户名称", trigger: "change" },
        ],
        salesOrderNo: [
          { required: true, message: "请输入迪太订单号", trigger: "change" },
        ],
        shippingTime: [
          { required: true, message: "请选择发货时间", trigger: "change" },
        ],
        consignee: [
          { required: true, message: "请输入收货人", trigger: "change" },
        ],
        transportMode: [
          { required: true, message: "请输入运输方式", trigger: "change" },
        ],
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

        // if (this.isOrderFlag) {
        //   this.form.salesOrderNo = this.salesOrderNo;
        //   this.form.shippingNumber = this.orderQuantity;
        // }
      }
    },
  },
  methods: {
    // 客户名称
    getCustomerNameList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerNameData.data = [
              ...this.customerNameData.data,
              ...list,
            ];
          } else {
            this.customerNameData.data = list;
          }
          this.customerNameData.more = pageNum * pageSize < total;
          this.customerNameData.page = pageNum;
          resolve();
        });
      });
    },
    handleResetConsignee() {
      this.addressData.data = [];
      this.form.consignee = "";
      this.form.phone = "";
      this.form.address = "";
    },
    // 运输方式
    getDeliveryType() {
      this.getDicts("sys_delivery_type").then((res) => {
        this.deliveryType = res.data;
      });
    },
    getDeliveryAddress({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        deliveryAddress({
          p: page,
          consignee: keyword,
          customerName: this.form.customerName,
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
        consignee: "",
        phone: "",
        address: "",
        shippingTime: "",
        transportMode: "",
        customerName: "",
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
    },
    // 多订单数据
    getMoreOrder(moreOrderData) {
      this.form.list = this.indMatchingAndNewItems(
        this.customerOrderData.list,
        moreOrderData,
        "orderId",
        "id"
      );

      // 将原始第一项改为默认项
      if (moreOrderData.length > 1) {
        const { orderId: firstOrderId } = this.customerOrderData.list[0];
        this.handleSetDefaultItem(firstOrderId);
      }
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
            shippingTime: itemB.sellTime,
            ...itemB,
          };
          result.push(data);
        }
      });

      return result;
    },
    handleSetDefaultItem(firstOrderId) {
      const orderData = [];

      this.form.list.forEach((item) => {
        if (item.orderId === firstOrderId) {
          orderData.unshift(item);
        } else {
          orderData.push(item);
        }
      });

      this.form.list = orderData;
    },
    checkDeliverOrderData(data, param) {
      const flag = data.some((item) => this.Is_Empty(item[param]));
      return flag;
    },

    setCustomerFirstOrder(firstOrderData, param) {
      param.orderNumber = firstOrderData.oddNumbers;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = JSON.parse(JSON.stringify(this.form));

          const { list } = param;
          if (!list.length) {
            this.msgWarning("请选择客户订单");
            return;
          }

          if (this.checkDeliverOrderData(list, "oddNumbers")) {
            this.msgWarning("送货单号不能为空");
            return;
          }

          if (this.checkDeliverOrderData(list, "shippingNumber")) {
            this.msgWarning("计划发货数量不能为空");
            return;
          }

          // 默认客户订单第一项为主单
          const {
            salesOrderNo,
            customerOrderNo,
            categoryName,
            computerName,
            id,
            oddNumbers,
            shippingNumber,
          } = list[0];

          param.salesOrderNo = salesOrderNo;
          param.customerOrderNo = customerOrderNo;
          param.categoryName = categoryName;
          param.computerName = computerName;
          param.orderId = id;
          param.orderNumber = oddNumbers;
          param.shippingNumber = shippingNumber;

          param.list = list.map(({ id, ...paramsData }) => paramsData);

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
