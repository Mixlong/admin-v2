<template>
  <div class="app-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span class="text-blue font20">{{ commonObj.title }}</span>
      </div>
      <el-form
        ref="form"
        label-position="left"
        :model="form"
        :rules="rules"
        label-width="135px"
      >
        <el-row type="flex" justify="space-between" :gutter="20">
          <el-col :span="8">
            <el-col>
              <el-form-item label="迪太订单号" prop="salesOrderNo">
                <el-input
                  v-model.trim="form.salesOrderNo"
                  clearable
                  placeholder="请输入迪太订单号"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="客户名称" prop="customerId">
                <el-select
                  v-model="form.customerId"
                  filterable
                  clearable
                  class="w100"
                  placeholder="请选择客户名称"
                >
                  <el-option
                    v-for="item in orderCusList"
                    :key="item.id"
                    :label="`${item.no}-${item.name}`"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="客户订单号" prop="customerOrderNo">
                <el-input
                  v-model.trim="form.customerOrderNo"
                  clearable
                  placeholder="请输入客户订单号"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="品类" prop="categoryId">
                <el-select
                  v-model="form.categoryId"
                  class="w100"
                  filterable
                  allow-create
                  clearable
                  placeholder="请选择所属品类"
                  @change="changeCategory"
                >
                  <el-option
                    v-for="dict in dictList"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="型号" prop="computerId">
                <el-select
                  v-model="form.computerId"
                  filterable
                  remote
                  clearable
                  class="w100"
                  placeholder="请选择仪表型号"
                  :remote-method="getComputerNameList"
                >
                  <el-option
                    v-for="dict in computerOptions"
                    :key="dict.model"
                    :label="dict.name"
                    :value="dict.model"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="芯片版本" prop="chipVersion">
                <el-select
                  v-model="form.chipVersion"
                  clearable
                  class="w100"
                  placeholder="请选择芯片版本"
                >
                  <el-option
                    v-for="dict in chipVersionList"
                    :key="dict.dictCode"
                    :label="dict.dictLabel"
                    :value="dict.dictLabel"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="BOM编码" prop="bomCode">
                <el-input
                  v-model.trim="form.bomCode"
                  clearable
                  placeholder="请选择BOM编码"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="订单数量" prop="orderQuantity">
                <el-input
                  v-model.trim="form.orderQuantity"
                  clearable
                  onkeyup="value=value.replace(/[^\d0]/g, '')"
                  placeholder="请输入订单数量"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="出货日期" prop="sellTime">
                <el-date-picker
                  v-model="form.sellTime"
                  style="width: 100%"
                  align="right"
                  type="datetime"
                  clearable
                  placeholder="请选择出货日期"
                  value-format="timestamp"
                  :picker-options="pickerOptions"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="defaultTime"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="客户要求到货日期" prop="arrivalTime">
                <el-date-picker
                  v-model="form.arrivalTime"
                  style="width: 100%"
                  align="right"
                  type="datetime"
                  clearable
                  placeholder="请选择客户要求到货日期"
                  value-format="timestamp"
                  :picker-options="pickerOptions"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="defaultTime"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="出货地址" prop="consigneeAddress">
                <el-input
                  v-model.trim="form.consigneeAddress"
                  type="textarea"
                  clearable
                  placeholder="请输入出货地址"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="箱唛" prop="isMark">
                <el-select
                  v-model="form.isMark"
                  class="w100"
                  clearable
                  placeholder="请选择箱唛"
                >
                  <el-option label="否" value="0" />
                  <el-option label="是" value="1" />
                  <el-option label="待确认" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="form.isMark === '1'">
              <el-form-item label="指定内容" prop="containerMarkInfo">
                <el-row>
                  <el-col>
                    <DrUpload
                      v-model="form.containerMarkInfo"
                      :limit="1"
                      :isOnePic="1"
                      :showFileList="false"
                    >
                      <div class="text-left">
                        <el-button size="mini" type="primary">上传</el-button>
                      </div>
                    </DrUpload>
                  </el-col>
                  <el-col>
                    <span style="word-break: break-all">
                      {{ form.containerMarkInfo }}
                    </span>
                    <!-- <el-input type="text" v-model="form.containerMarkInfo"></el-input> -->
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-col>
          <el-divider direction="vertical" class="el_divider_line" />
          <el-col :span="16">
            <el-col>
              <el-form-item label="BOM选配信息" prop="boxInfo">
                <tinymce
                  v-model="form.boxInfo"
                  placeholder="请输入BOM选配信息"
                  height="300"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="备注">
                <tinymce
                  v-model="form.sellInfo"
                  placeholder="请输入备注"
                  height="300"
                />
              </el-form-item>
            </el-col>
          </el-col>
        </el-row>
      </el-form>
      <div class="text-center margin-top-lg">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$router.push('/www/order')">取 消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  addOrder,
  updateOrder,
  getOrderCusList,
  getOrderDetail,
  getOrderProcess,
} from "@/api/order";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";

export default {
  props: ["commonObj"],
  components: {
    tinymce: () => import("@/views/components/Editor"),
  },
  data() {
    return {
      isCateLoading: false,
      // 品类
      dictList: [],
      // 型号
      computerOptions: [],
      // 客户
      orderCusList: [],
      // 芯片版本
      chipVersionList: [],
      form: {},
      cloneForm: {},
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
        salesOrderNo: [
          { required: true, message: "请输入销售订单号", trigger: "blur" },
        ],
        customerId: [
          { required: false, message: "请选择客户名称", trigger: "change" },
        ],
        customerOrderNo: [
          { required: false, message: "请输入客户订单号", trigger: "blur" },
        ],
        categoryId: [
          { required: false, message: "请选择所属品类", trigger: "change" },
        ],
        computerId: [
          { required: false, message: "请选择所属型号", trigger: "change" },
        ],
        chipVersion: [
          { required: false, message: "请选择芯片版本", trigger: "change" },
        ],
        bomCode: [
          { required: false, message: "请选择BOM编码", trigger: "change" },
        ],
        orderQuantity: [
          { required: false, message: "请输入订单数量", trigger: "change" },
        ],
        sellTime: [
          { required: false, message: "请选择出货日期", trigger: "change" },
        ],
        arrivalTime: [
          { required: false, message: "客户要求到货日期", trigger: "change" },
        ],
        consigneeAddress: [
          { required: false, message: "请输入出货地址", trigger: "blur" },
        ],
        isMark: [{ required: false, message: "请选择箱唛", trigger: "change" }],
        orderReviewForm: [
          { required: false, message: "请选择箱唛", trigger: "change" },
        ],
        containerMarkInfo: [
          { required: false, message: "请选择指定内容 ", trigger: "change" },
        ],
        boxInfo: [
          { required: false, message: "请输入BOM选配信息 ", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getCategoryComputerDict();
    this.getOrderCusListData();
    this.getUpdateDetail();
    this.getOrderProcessData();
  },
  methods: {
    // 详情
    getUpdateDetail() {
      if (this.commonObj.id) {
        getOrderDetail(this.commonObj.id).then((res) => {
          this.form = res.data;
          this.cloneForm = { ...res.data };
        });
      }
    },
    // 品类
    getCategoryComputerDict() {
      this.isCateLoading = true;
      categoryComputerDict()
        .then((res) => {
          this.dictList = res.data;

          // 编辑
          if (this.form.id) {
            this.computerOptions = this.dictList.filter(
              (item) => item.id === this.form.categoryId
            )[0].computerList;
          }

          this.isCateLoading = false;
        })
        .catch(() => {
          this.isCateLoading = false;
        });
    },
    // 获取客户
    getOrderCusListData() {
      getOrderCusList().then((res) => {
        this.orderCusList = res.data;
      });
    },
    // 型号列表
    changeCategory(val) {
      if (!val) return;
      this.$set(this.form, "computerId", "");
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    getComputerNameList(name) {
      if (name) {
        computerNameList({
          name,
          categoryId: this.form.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 芯片版本
    getOrderProcessData() {
      getOrderProcess({ dictType: "scheme_version" }).then((res) => {
        this.chipVersionList = res.data;
      });
    },
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    checkRule(params) {
      const { categoryId, computerId, chipVersion } = params;
      if (
        this.cloneForm.categoryId !== categoryId ||
        this.cloneForm.computerId !== computerId ||
        this.cloneForm.chipVersion !== chipVersion
      ) {
        return true;
      } else {
        return false;
      }
    },
    onUpdateOrder(params) {
      updateOrder(params).then((res) => {
        if (res.code === 200) {
          this.msgSuccess("更新成功");
          this.$router.push("/www/order");
        }
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = null;
          if (this.form.id) {
            params = Object.assign({}, this.form);
            if (this.checkRule(params)) {
              this.$confirm(
                "若“品类”、“型号”、“芯片版本”改变，该排产将被取消?",
                "警告",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                }
              )
                .then(() => {
                  this.onUpdateOrder(params);
                })
                .catch(() => {});
            } else {
              this.onUpdateOrder(params);
            }
          } else {
            params = Object.assign({}, this.form);
            addOrder(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.$router.push("/www/order");
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
.el_divider_line {
  height: inherit;
}
</style>
