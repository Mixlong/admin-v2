<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="350px"
    append-to-body
    :close-on-click-modal="false"
    top="2vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="90px"
      inline
      :class="{ 'row-label-style': showName == 'plan' }"
    >
      <el-form-item label="名称" prop="name" v-if="!showName">
        <el-input
          v-model="form.name"
          placeholder="请输入名称"
          style="width: 185px"
        />
      </el-form-item>
      <el-form-item label="ip" prop="ip" v-if="!showName">
        <el-input
          v-model="form.ip"
          placeholder="请输入ip"
          style="width: 185px"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { filterIpAdd, filterIpUpdate } from "@/api/system/ip";
export default {
  data() {
    return {
      showName: "",
      dialogVisible: false,
      // 表单参数
      form: {},
      title: "",
      // 表单校验
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        ip: [{ required: true, message: "请输入ip", trigger: "blur" }],
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
      this.form = {
        url: "",
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.status = 0;

          if (this.form.id) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            filterIpUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            filterIpAdd(this.form).then((response) => {
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

