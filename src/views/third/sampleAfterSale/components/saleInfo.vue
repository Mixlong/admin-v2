<template>
  <el-dialog
    class="after-sale-box"
    title="添加售后"
    :visible="visible"
    width="800px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="返回日期" prop="logisticsEntity.returnDate">
            <el-date-picker
              v-model="form.logisticsEntity.returnDate"
              clearable
              type="date"
              style="width: 100%"
              placeholder="请选择返回日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="寄件单号" prop="logisticsEntity.mailingNumber">
            <el-input
              v-model="form.logisticsEntity.mailingNumber"
              clearable
              style="width: 100%"
              placeholder="请输入寄件单号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="寄件部门"
            prop="logisticsEntity.mailingDepartment"
          >
            <el-input
              v-model="form.logisticsEntity.mailingDepartment"
              clearable
              style="width: 100%"
              placeholder="请输入寄件部门"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="寄件人" prop="logisticsEntity.sender">
            <el-input
              v-model="form.logisticsEntity.sender"
              clearable
              style="width: 100%"
              placeholder="请输入寄件人"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收件人" prop="logisticsEntity.recipient">
            <el-input
              v-model="form.logisticsEntity.recipient"
              clearable
              style="width: 100%"
              placeholder="请输入收件人"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="联系电话" prop="logisticsEntity.phone">
            <el-input
              v-model="form.logisticsEntity.phone"
              clearable
              style="width: 100%"
              placeholder="请输入联系电话"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物流付款方式" prop="logisticsEntity.isPay">
            <el-select
              v-model="form.logisticsEntity.isPay"
              placeholder="请选择物流付款方式"
              clearable
              style="width: 100%"
            >
              <el-option label="月结" :value="0" />
              <el-option label="到付" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仪表去向" prop="logisticsEntity.direction">
            <el-select
              v-model="form.logisticsEntity.direction"
              filterable
              allow-create
              clearable
              style="width: 100%"
              placeholder="请选择仪表去向"
            >
              <el-option
                v-for="dict in modelDirList"
                :key="dict.dictCode"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货地址" prop="logisticsEntity.address">
            <el-input
              v-model="form.logisticsEntity.address"
              type="textarea"
              style="width: 100%"
              placeholder="请输入收货地址"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { afterLogistics } from "@/api/third/sampleSale";
export default {
  props: {
    modelDirList: Array,
    visible: {
      type: Boolean,
      default: false,
    },
    saleIdList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isSubLoading: false,
      form: {
        logisticsEntity: {},
      },
      rules: {
        "logisticsEntity.returnDate": [
          {
            required: false,
            message: "请选择返回日期",
            trigger: ["change", "blur"],
          },
        ],
        "logisticsEntity.mailingNumber": [
          {
            required: false,
            message: "请输入寄件单号",
            trigger: ["change", "blur"],
          },
        ],
        "logisticsEntity.mailingDepartment": [
          {
            required: false,
            message: "请输入寄件部门",
            trigger: ["change", "blur"],
          },
        ],
        "logisticsEntity.sender": [
          {
            required: false,
            message: "请输入寄件人",
            trigger: ["change", "blur"],
          },
        ],
      },
    };
  },
  watch: {
    visible(isShow) {
      if(!isShow) {
        this.reset();
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    reset() {
      this.form = {
        logisticsEntity: {},
      };
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          let params = JSON.parse(JSON.stringify(this.form));
          afterLogistics({ ...params, idList: this.saleIdList })
            .then(() => {
              this.msgSuccess("操作成功");
              this.$parent.getList();
            })
            .finally(() => {
              this.isSubLoading = false;
              this.$emit("clearSaleSelection");
              this.close();
            });
        }
      });
    },
  },
};
</script>