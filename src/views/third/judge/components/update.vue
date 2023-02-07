<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="1020px"
    append-to-body
    :close-on-click-modal="false"
    top="2vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="110px"
      class="input-width"
      :class="{ 'row-label-style': showName == 'plan' }"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="客户名称" prop="customerName">
            <el-input
              placeholder="请输入客户名称"
              v-model="form.customerName"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户订单号" prop="customerOrderNo">
            <el-input
              placeholder="请输入客户订单号"
              v-model="form.customerOrderNo"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户料号" prop="customerGoodsNo">
            <el-input
              placeholder="请输入客户料号"
              v-model="form.customerGoodsNo"
            ></el-input> </el-form-item
        ></el-col>
        <el-col :span="8">
          <el-form-item label="迪太料号" prop="dtGoodsNo">
            <el-input
              placeholder="请输入迪太料号"
              v-model="form.dtGoodsNo"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="迪太订单号" prop="dtOrderNo">
            <el-input
              placeholder="请输入迪太订单号"
              v-model="form.dtOrderNo"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="型号" prop="model">
            <el-input placeholder="请输入型号" v-model="form.model"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="配置版本" prop="configVersion">
            <el-input
              placeholder="请输入配置版本"
              v-model="form.configVersion"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="数量" prop="quantity">
            <el-input
              type="number"
              placeholder="请输入数量"
              v-model="form.quantity"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="交付时间" prop="deliveryTime">
            <el-date-picker
              ref="datePicker"
              v-model="form.deliveryTime"
              type="date"
              placeholder="选择日期时间"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item
            label="订单需求"
            label-width="108px"
            prop="orderDemand"
            style="width: 100%; max-height: 326px"
          >
            <tinymce
              v-if="dialogVisible"
              v-model="form.orderDemand"
              placeholder="请输入"
              height="150"
            ></tinymce>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { judgeAdd, judgeUpdate } from "@/api/third/judge";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["classifyList", "involveUnitList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      // 表单参数
      form: {
        isShow: 0,
      },
      title: "",
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "请输入客户名称", trigger: "blur" },
        ],
        customerOrderNo: [
          { required: true, message: "请输入客户订单号", trigger: "blur" },
        ],
        customerGoodsNo: [
          { required: true, message: "请输入客户料号", trigger: "blur" },
        ],
        quantity: [{ required: true, message: "请输入数量", trigger: "blur" }],
        deliveryTime: [
          { required: true, message: "请输入交付时间", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      // if (!val) {
      //   this.form = {};
      // }
    },
  },
  mounted() {},
  methods: {
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = Object.assign({}, this.form);
          if (param.id) {
            judgeUpdate(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            judgeAdd(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
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

<style lang="scss" scope>
</style>

