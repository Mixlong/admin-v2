<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-06-15 17:20:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/device/jsCode/components/topMain.vue
-->
<template>
  <div>
    <el-dialog
      title="公共函数区"
      :visible.sync="dialogFormVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="95px" :rules="rules" ref="form">
        <el-form-item label="函数名称:" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入函数名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="函数编码:" prop="code">
          <el-input
            v-model="form.code"
            type="textarea"
            :autosize="{ minRows: 10 }"
            placeholder="请输入函数编码"
          ></el-input>
        </el-form-item>
        <el-form-item label="函数描述:">
          <el-input
            v-model="form.desc"
            type="textarea"
            placeholder="请输入函数描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { jsfuncAdd, jsfuncUpdate } from "@/api/js";
export default {
  data() {
    return {
      dialogFormVisible: false,
      form: {},
      rules: {
        title: [{ required: true, message: "请输入函数名称", trigger: "blur" }],
        funcName: [
          { required: true, message: "请输入函数方法", trigger: "blur" },
        ],
        code: [{ required: true, message: "请输入函数编码", trigger: "blur" }],
      },
    };
  },
  methods: {
    submitForm() {
      let fn = this.form.id ? jsfuncUpdate : jsfuncAdd;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let { form } = this;
          form.jsType = 2;
          fn(form).then((res) => {
            if (res.code == 200) {
              this.dialogFormVisible = false;
              this.msgSuccess(form.id ? "修改成功!" : "添加成功!");
              this.$emit("success");
            }
          });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style>
</style>