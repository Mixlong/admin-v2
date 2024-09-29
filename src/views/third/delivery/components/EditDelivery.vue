<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    top="2vh"
    center
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="110px"
      label-position="right"
      class="input-width"
    >
      <el-row :gutter="10" class="margin-bottom-xs">
        <el-row>
          <el-col :span="14">
            <el-col :sm="24" :md="12" :lg="24">
              <el-form-item label="迪太订单号" prop="salesOrderNo">
                <select-loadMore
                  style="width: 100%"
                  v-model="form.salesOrderNo"
                  :data="salesOrderNoData.data"
                  :page="salesOrderNoData.page"
                  :hasMore="salesOrderNoData.more"
                  dictLabel="salesOrderNo"
                  :moreParams="true"
                  :disabled="!!form.id"
                  :request="getOrderList"
                  @getChange="getOrderData"
                  v-slot="{ proOption }"
                  placeholder="请选择迪太订单号"
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
            <el-col :sm="24" :md="12" :lg="24">
              <el-form-item label="发货单号" prop="orderNumber">
                <el-input
                  v-model="form.orderNumber"
                  clearable
                  placeholder="请输入发货单号"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="24">
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
            <el-col :sm="24" :md="12" :lg="24">
              <el-form-item label="收货人" prop="consignee">
                <el-input
                  v-model="form.consignee"
                  clearable
                  placeholder="请输入收货人"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="24">
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="form.phone"
                  clearable
                  placeholder="请输入手机号码"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="24">
              <el-form-item label="运输方式" prop="transportMode">
                <el-input
                  v-model="form.transportMode"
                  clearable
                  placeholder="请输入运输方式"
                />
              </el-form-item>
            </el-col>
          </el-col>
        </el-row>

        <el-col :sm="24" :md="12" :lg="24">
          <el-form-item label="收货地址" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              clearable
              placeholder="请输入收货地址"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="24" :md="12" :lg="24">
          <el-form-item label="是否需要回单" prop="isReceipt">
            <el-radio-group v-model="form.isReceipt">
              <el-radio :label="0" border>需要</el-radio>
              <el-radio :label="1" border>不需要</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- <el-form-item label="发货图片" prop="shippingPicture" style="width: 100%">
        <el-upload-sortable v-model="form.shippingPicture" :max="6" :multiple="true" />
      </el-form-item> -->

      <el-form-item label="附件" prop="file">
        <DrUpload v-model="form.file" :limit="6" :multiple="true">
          <div class="text-left">
            <el-button size="mini" type="primary">附件上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { orderList } from "@/api/order";
import { addDelivery, updateDelivery } from "@/api/delivery";

export default {
  props: ["classifyList", "involveUnitList"],
  data() {
    return {
      myFileList: "",
      dialogVisible: false,
      title: "",
      // 表单参数
      form: {},
      // 迪太订单号
      salesOrderNoData: {
        data: [],
        page: 1,
        more: true,
      },
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
          { required: true, message: "请输入收货人", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        transportMode: [
          { required: true, message: "请输入运输方式", trigger: "blur" },
        ],
        address: [
          { required: true, message: "请输入收货地址", trigger: "blur" },
        ],
        isReceipt: [{ required: true, message: "请选择", trigger: "change" }],
        file: [{ required: true, message: "请上传附件", trigger: "change" }],
      },
    };
  },
  watch: {
    "form.file"(file) {
      if (file) this.clearValidateItem("form", "file");
    },
  },
  methods: {
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
      console.log(params);
      if (!params) {
        this.form.customerName = "";
        this.form.salesOrderNo = "";
        this.form.customerOrderNo = "";
        this.form.categoryName = "";
        this.form.computerName = "";
        this.form.orderId = "";
        return;
      }
      const {
        customerName,
        salesOrderNo,
        customerOrderNo,
        categoryName,
        computerName,
        id,
      } = JSON.parse(params);
      this.form.customerName = customerName;
      this.form.salesOrderNo = salesOrderNo;
      this.form.customerOrderNo = customerOrderNo;
      this.form.categoryName = categoryName;
      this.form.computerName = computerName;
      this.form.orderId = id;
    },
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
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
            addDelivery(param).then((response) => {
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

