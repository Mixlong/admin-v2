<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="this.form.action == 1 ? '入库' : '出库'"
    :visible.sync="dialogVisible"
    width="25%"
    top="5vh"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="数量:" prop="num">
        <el-input
          v-model.number="form.num"
          oninput="value=value.replace(/[^0-9]/g,'')"
          placeholder="请输入数量"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="备注:" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :autosize="{ minRows: 4 }"
          placeholder="请输入备注"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sampleParts_action } from "@/api/third/sample";

export default {
  data() {
    return {
      dialogVisible: false,

      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        num: [{ required: true, message: "请输入数量", trigger: "change" }],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.resetForm("form");
      }
    },
  },

  methods: {
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let msg = this.form.action == 1 ? "入库" : "出库";
          sampleParts_action(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(msg + "成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
  },
};
</script>
