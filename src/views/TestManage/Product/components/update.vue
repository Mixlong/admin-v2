<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="450px"
      append-to-body
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="模块名称：" prop="productType">
          <el-input
            v-model.trim="form.productType"
            placeholder="请输入模块名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序序号：" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :precision="0"
            controls-position="right"
            placeholder="请输入排序序号"
            class="w100 ipt-number"
          />
        </el-form-item>
        <el-form-item label="描述：" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            placeholder="请输入描述"
            clearable
            :autosize="{
              minRows: 3,
              maxRows: 6
            }"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { testProductAdd, testProductEdit } from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  data() {
    return {
      step: 1,
      modelList: [],
      dialogVisible: false,
      // 表单参数
      form: {
        productType: "",
        sort: "",
        desc: "",
      },
      // 表单校验
      rules: {
        productType: [
          { required: true, message: "请输入模块名称", trigger: "change" },
        ],
        sort: [
          { required: true, message: "请输入排序序号", trigger: "change" },
        ],
        desc: [{ required: false, message: "请输入描述", trigger: "blur" }],
      },
    };
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        productType: "",
        desc: "",
      };
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            testProductEdit(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          } else {
            testProductAdd(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.$emit("update:visible", false);
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
  .ipt-number {
    /deep/.el-input__inner {
      text-align: left;
    }
  }
</style>
