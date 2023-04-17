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
        label-width="90px"
      >
        <el-tabs type="border-card" v-model="form.type">
          <el-tab-pane label="送样需求" name="0">
            <el-col :span="8" style="min-height: calc(100vh - 400px)">
              <el-form-item label="客户名称" prop="customerName">
              </el-form-item>
            </el-col>
          </el-tab-pane>
          <el-tab-pane label="新增需求" name="1">
            <el-row
              type="flex"
              justify="space-between"
              :gutter="20"
              style="min-height: calc(100vh - 400px)"
            >
              <el-col :span="8">
                <el-form-item label="客户" prop="customerName">
                  <el-input
                    v-model.trim="form.customerName"
                    clearable
                    placeholder="请输入客户"
                  />
                </el-form-item>
                <el-form-item label="产品品类" prop="categoryName">
                  <el-input
                    v-model.trim="form.categoryName"
                    clearable
                    placeholder="请输入产品品类"
                  />
                </el-form-item>
                <el-form-item label="产品型号" prop="computerName">
                  <el-input
                    v-model.trim="form.computerName"
                    clearable
                    placeholder="请输入产品型号"
                  />
                </el-form-item>
                <el-form-item label="软件版本" prop="softVersion">
                  <el-input
                    v-model.trim="form.softVersion"
                    clearable
                    placeholder="请输入软件版本"
                  />
                </el-form-item>
                <el-form-item label="硬件版本" prop="hardVersion">
                  <el-input
                    v-model.trim="form.hardVersion"
                    clearable
                    placeholder="请输入硬件版本"
                  />
                </el-form-item>
                <el-form-item label="需求总表" prop="needInfo">
                  <DrUpload
                    class="flex flex-direction"
                    v-model="form.needInfo"
                    :limit="1"
                    :isOnePic="1"
                  >
                  <div class="text-left">
                    <el-button size="mini" type="primary"> 附件上传 </el-button>
                  </div> 
                  </DrUpload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
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
  getOrderDetail,
  getOrderProcess,
} from "@/api/order";
import { sampleList } from "@/api/third/sample";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import commomFile from "../mixins";

export default {
  mixins: [commomFile],
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
      // 芯片版本
      chipVersionList: [],
      form: {},
      cloneForm: {},
      // defaultTime: this.moment().format("HH:mm:ss"),
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
        customerName: [
          { required: false, message: "请选择客户名称", trigger: "blur" },
        ],
        categoryName: [
          { required: false, message: "请输入产品品类", trigger: "blur" },
        ],
        computerName: [
          { required: false, message: "请输入产品型号", trigger: "blur" },
        ],
        softVersion: [
          { required: false, message: "请输入软件版本", trigger: "blur" },
        ],
        hardVersion: [
          { required: false, message: "请输入硬件版本", trigger: "blur" },
        ],
        needInfo: [
          { required: false, message: "请上传需求总表", trigger: "change" },
        ]
      },
    };
  },
  created() {
    this.getCategoryComputerDict();
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
          // if (this.form.id) {
          this.computerOptions = this.dictList.filter(
            (item) => item.id === this.form.categoryId
          )[0].computerList;
          // }

          this.isCateLoading = false;
        })
        .catch(() => {
          this.isCateLoading = false;
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
    getCustomerId(customerId) {
      this.form.customerId = customerId;
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
    onAlertReason(params) {
      const {
        salesOrderNo,
        customerName,
        customerOrderNo,
        categoryId,
        computerId,
        chipVersion,
        bomCode,
        orderQuantity,
        sellTime,
        arrivalTime,
        consigneeAddress,
        isMark,
        containerMarkInfo,
        bomInfo,
        remark,
      } = params;
      if (
        this.cloneForm.salesOrderNo !== salesOrderNo ||
        this.cloneForm.customerName !== customerName ||
        this.cloneForm.customerOrderNo !== customerOrderNo ||
        this.cloneForm.categoryId !== categoryId ||
        this.cloneForm.computerId !== computerId ||
        this.cloneForm.chipVersion !== chipVersion ||
        this.cloneForm.bomCode !== bomCode ||
        this.cloneForm.orderQuantity !== orderQuantity ||
        this.cloneForm.sellTime !== sellTime ||
        this.cloneForm.arrivalTime !== arrivalTime ||
        this.cloneForm.consigneeAddress !== consigneeAddress ||
        this.cloneForm.isMark !== isMark ||
        this.cloneForm.containerMarkInfo !== containerMarkInfo ||
        this.cloneForm.bomInfo !== bomInfo ||
        this.cloneForm.remark !== remark
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
          if (this.form.id) {
            if (this.onAlertReason(this.form)) {
              this.$prompt(
                "请输入修改原因",
                `${
                  this.checkRule(this.form)
                    ? "若“品类”、“型号”、“芯片版本”改变，该排产将被取消?"
                    : ""
                }`,
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  inputValidator: (value) => {
                    if (value === null || value === "") {
                      return false;
                    }
                  },
                  inputErrorMessage: "修改原因不能为空",
                  customClass: "orderReason_style",
                }
              )
                .then(({ value }) => {
                  this.onUpdateOrder({ msg: value, ...this.form });
                })
                .catch(() => {});
            } else {
              this.onUpdateOrder(this.form);
            }
          } else {
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

<style lang="scss">
.orderReason_style {
  .el-message-box__title {
    padding-right: 15px;
    line-height: 20px;
  }
}
</style>

<style lang="scss" scoped>
.el_divider_line {
  height: inherit;
}
</style>
