
<template>
  <!--   -->
  <el-dialog :title="title" :visible.sync="dialogVisible" center append-to-body top="1vh" width="900px"
    :close-on-click-modal="false">
    <el-form ref="form" class="form-data-inline" label-width="85px" label-position="left" inline :model="form"
      :rules="rules" @submit.native.prevent>
      <fieldset class="margin-bottom-xs">
        <legend>基本信息</legend>
        <el-row :gutter="20" class="margin-top-xs">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerId" style="width: 100%">
              <el-select v-model="form.customerId" filterable placeholder="请选择客户名称" @change="selectCustomer" clearable
                size="mini">
                <el-option v-for="item in orderCusList" :key="item.id" :label="`${item.no}-${item.name}`"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" " style="width: 100%" label-width="82px">
              <el-button type="primary" size="mini" @click="addCustomer">新增客户</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售订单号" prop="salesOrderNo" style="width: 100%">
              <el-input v-model.trim="form.salesOrderNo" size="mini" clearable placeholder="请输入销售订单号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户订单号" prop="customerOrderNo" style="width: 100%">
              <el-input v-model.trim="form.customerOrderNo" size="mini" clearable placeholder="请输入客户订单号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>
      <fieldset class="products-box margin-bottom-xs">
        <legend>产品信息</legend>
        <div class="flex justify-end margin-bottom-xs add-btn">
          <el-button icon="el-icon-plus" size="mini" type="primary" @click="addDomain"></el-button>
        </div>
        <div v-for="(item, index) in form.products" :key="index" class="product-list-box"
          :class="{ 'margin-bottom-sm': form.products.length > 1 }">
          <el-row :gutter="10">
            <el-col :span="7">
              <el-form-item label="ERP编码" :prop="`products[${index}].computerErp`" :rules="rules.computerErp"
                style="width: 100%">
                <el-select v-model="item.computerErp" size="mini" filterable @change="selectErpManage"
                  placeholder="请选择ERP编码" clearable>
                  <el-option v-for="item in erpList" :key="item.id" :label="item.erp" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="数量" label-width="50px" :prop="`products[${index}].num`" :rules="rules.num"
                style="width: 100%">
                <el-input v-model="item.num" oninput="value=value.replace(/[^0-9]/g,'')" clearable size="mini" 
                  placeholder="请输入数量">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="交期" label-width="50px" :prop="`products[${index}].deliveryDate`"
                :rules="rules.deliveryDate" style="width: 100%">
                <el-date-picker v-model="item.deliveryDate" align="right" size="mini" type="datetime" clearable placeholder="选择日期"
                  value-format="timestamp" :picker-options="pickerOptions" format="yyyy-MM-dd HH:mm:ss" :default-time="defaultTime">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item style="width: 100%" class="margin-left-sm">
                <el-button icon="el-icon-minus" size="mini" type="danger" :disabled="form.products.length === 1"
                  @click="removeDomain(item)"></el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" class="margin-left-xs">
            <el-col :span="6">
              <el-form-item label="产品品类" label-width="70px" style="width: 100%;">
                <el-input v-if="form.id && item.categoryName" v-model="item.categoryName" size="mini" readonly>
                </el-input>
                <el-input v-else v-model="erpManageData.categoryName" size="mini" readonly></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :push="1">
              <el-form-item label="型号" label-width="50px" label-position="right" style="width: 100%;">
                <el-input v-if="form.id && item.computerName" v-model="item.computerName" size="mini" readonly>
                </el-input>
                <el-input v-else v-model="erpManageData.computerName" size="mini" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </fieldset>
      <fieldset class="address-box margin-bottom-xs">
        <legend>收货信息</legend>
        <div class="flex justify-end margin-bottom-xs add-btn">
          <el-button icon="el-icon-plus" size="mini" type="primary" @click="onAddAddress"></el-button>
        </div>
        <div v-for="(item, index) in addressList" :key="index" class="address-list-box pointer"
          :class="{ 'margin-bottom-xs': addressList.length > 1 }" @click="selectDefaultAdd(item)">
          <el-row :gutter="10" type="flex" align="middle">
            <el-col :span="5">
              {{ item.consignee }}
            </el-col>
            <el-col :span="5">
              {{ item.consigneeTel }}
            </el-col>
            <el-col :span="11">
              {{ `${item.province}${item.city}${item.area}${item.consigneeAddress}` }}
            </el-col>
            <el-col :span="3" class="text-center">
              <i :class="['text-green', { 'el-icon-check': form.consigneeId === item.id || item.id === currentSelAdd }]"
                size="small"></i>
            </el-col>
          </el-row>
        </div>
        <p v-if="form.customerId && !Object.keys(addressList).length" class="text-center text-red">当前客户未新增地址</p>
        <p v-if="!form.customerId" class="text-center text-red">请选择客户</p>
      </fieldset>
      <el-form-item label="发货方式" class="margin-bottom-sm" style="width: 50%" prop="deliveryMethod">
        <el-select v-model="form.deliveryMethod" size="mini" filterable placeholder="请选择发货方式" clearable>
          <el-option v-for="item in deliverList" :key="item.id" :label="item.dictLabel"
            :value="item.dictCode.toString()">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单评审表" class="margin-bottom-xs" style="width: 100%">
        <el-row type="flex">
          <el-col :offset="2" :span="17">
            <span>{{ form.orderReviewForm && $transFileUrl(form.orderReviewForm) }}</span>
          </el-col>
          <el-col :offset="1" :push="0" :span="5" class="text-center">
            <DrUpload v-model="form.orderReviewForm" :limit="1" :isOnePic="1" :showFileList="false">
              <div class="text-left">
                <el-button size="mini" type="primary">上传</el-button>
              </div>
            </DrUpload>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <addAddress ref="addAddressRef" :title="addOrCusTitle" :orderCusList="orderCusList" />
  </el-dialog>
</template>

<script>
import { addOrder, updateOrder, addressList, getErpList, getErpManage, getOrderProcess, getOrderDetail } from "@/api/order";

export default {
  props: ["title", "orderCusList"],
  components: {
    addAddress: () => import('./addAddress.vue')
  },
  data() {
    const checkNum = (rule, value, callback) => {
      if (value === '') {
        callback('请输入数量')
      } else if (value <= 0) {
        callback('数量必须大于0')
      } else {
        callback()
      }
    }
    return {
      currentSelAdd: null,
      currentSelItem: {},
      dialogVisible: false,
      addOrCusTitle: '',
      factoryOptions: [],
      computerOptions: [],
      userList: [],
      erpList: [],
      deliverList: [],
      erpManageData: {},
      addressList: [],
      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        products: [
          {
            computerErp: "",
            num: "",
            deliveryDate: ''
          }
        ]
      },
      defaultTime: this.moment().format("HH:mm:ss"),
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
      // 表单校验
      rules: {
        customerId: [
          { required: true, message: "请选择客户名称", trigger: "change" },
        ],
        salesOrderNo: [
          { required: true, message: "请输入销售订单号", trigger: "blur" },
        ],
        customerOrderNo: [
          { required: true, message: "请输入客户订单号", trigger: "blur" },
        ],
        computerErp: [
          { required: true, message: "请选择ERP编码", trigger: "change" },
        ],
        num: [{ required: true, validator: checkNum, trigger: "blur" }],
        deliveryDate: [
          { required: true, message: "请输入期望发货时间 ", trigger: "change" },
        ],
        deliveryMethod: [
          { required: true, message: "请选择发货方式 ", trigger: "change" },
        ],
      },
    };
  },
  provide() {
    return {
      'getAddressList': this.getAddressList
    }
  },
  created() {
    this.getOrderProcessList()
    this.getErpListData()
  },
  methods: {
    selectDefaultAdd(item) {
      this.currentSelAdd = item.id
      this.currentSelItem = item
      if (this.form.id) {
        this.form.consigneeId = item.id
      }
    },
    // 发货方式
    getOrderProcessList() {
      getOrderProcess({ dictType: 'delivery_method' }).then(res => {
        this.deliverList = res.data
      })
    },
    // erp列表
    getErpListData() {
      getErpList().then(res => {
        this.erpList = res.data
      })
    },
    selectErpManage(val) {
      if(val)
      getErpManage(val).then(res => {
        this.erpManageData = res.data
      })
    },
    // 订单详情
    getOrderDetail(id) {
      this.currentSelAdd = null
      getOrderDetail(id).then(res => {
        this.form = res.data
        this.getAddressList(this.form.customerId)
      })
    },
    // 表单重置
    reset() {
      this.addressList = []
      this.erpManageData = {}
      this.form = {
        products: [
          {
            computerErp: "",
            num: "",
            deliveryDate: ''
          }
        ]
      }
      this.resetForm("form");
    },
    changeTargetIdType(val) {
      this.form.targetId = this.form.updateCondition == 4 ? [] : "";
      this.form = Object.assign({}, this.form);
    },
    // 新增
    addDomain() {
      this.form.products.push({
        computerErp: "",
        num: "",
        deliveryDate: ''
      });
    },
    removeDomain(item) {
      var index = this.form.products.indexOf(item)
      if (index !== -1) {
        this.form.products.splice(index, 1)
      }
    },
    selectCustomer(customerId) {
      if (customerId)
        this.getAddressList(customerId)
    },
    // 获取收货地址
    getAddressList(customerId) {
      addressList(customerId).then(res => {
        this.addressList = res.data
      })
    },
    // 新增客户
    addCustomer() {
      this.addOrCusTitle = "新增客户"
      this.$refs.addAddressRef.isCustomer = false
      this.$refs.addAddressRef.dialogVisible = true
    },
    // 添加收获地址
    onAddAddress() {
      this.addOrCusTitle = "新增收货地址"
      this.$refs.addAddressRef.isCustomer = true
      this.$refs.addAddressRef.dialogVisible = true
    },
    /** 提交按钮 */
    submitForm: function () {

      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = null
          if (this.form.id) {
            delete this.currentSelItem.id
            params = Object.assign({}, this.form, this.currentSelItem);
            updateOrder(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            if (!Object.keys(this.currentSelItem).length) {
              return this.msgSuccess("请选择收货地址");
            }
            params = Object.assign({}, this.form, this.currentSelItem);
            params.consigneeId = params.id
            delete params.id
            delete params.createTime
            addOrder(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
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

<style lang="scss">
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}

.products-box,
.address-box {
  max-height: 250px;
  overflow: hidden;
  overflow-y: scroll;

  .add-btn {
    position: sticky;
    top: -6px;
    z-index: 666;
    background: #fff;
    padding: 10px;
  }

  .product-list-box {
    border-bottom: 1px solid #ccc;
  }

  .address-list-box {
    border: 1px solid #ccc;
    padding: 10px 20px;
    border-radius: 3px;

    .el-icon-check {
      font-size: 20px;
    }
  }
}
</style>

