<template>
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
      label-width="90px"
      label-position="left"
    >
      <el-form-item label="协议名称" prop="agreementName">
        <el-input
          v-model.trim.lazy="form.agreementName"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="协议版本" prop="agreementVersion">
        <el-input v-model.trim="form.agreementVersion" clearable size="mini" />
      </el-form-item>
      <el-form-item label="脚本文件:" prop="file">
        <DrUpload
          v-model="form.file"
          :limit="1"
          :isOnePic="1"
          :css="{ width: '100%' }"
          accept=".js"
          class="flex-direction align-start"
        >
        </DrUpload>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          clearable
          size="mini"
          placeholder="请输入备注"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm"
        >确 定</el-button
      >
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { scriptAdd, scriptUpdate } from "@/api/third/simulateScript";

export default {
  inheritAttrs: false,
  data() {
    return {
      isSubLoading: false,
      // 表单参数
      form: {
        agreementName: "",
        agreementVersion: "",
        file: "",
        remark: "",
      },
      // 表单校验
      rules: {
        agreementName: [
          { required: true, message: "请输入协议名称", trigger: "blur" },
        ],
        agreementVersion: [
          { required: true, message: "请输入协议版本", trigger: "blur" },
        ],
        file: [
          { required: true, message: "请上传脚本文件", trigger: "change" },
        ],
      },
    };
  },
  watch: {
    "form.file"(file) {
      if (file) {
        this.clearValidateItem("form", "file");
      }
    },
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        agreementName: "",
        agreementVersion: "",
        file: "",
        remark: "",
      };
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          if (this.form.id) {
            scriptUpdate(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.$emit("update:visible", false);
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isSubLoading = false;
              });
          } else {
            scriptAdd(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("创建成功");
                  this.$emit("update:visible", false);
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isSubLoading = false;
              });
          }
        }
      });
    },
  },
};
</script>
