<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="450px"
      append-to-body
      center
      :close-on-click-modal="false"
    >
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addComputer, editComputer } from "@/api/third/version";
import { typeCategory } from "@/api/third/category";
import mixin from "./export";

export default {
  mixins: [mixin],
  data() {
    return {
      step: 1,
      modelList: [],
      dialogVisible: false,
      // 表单参数
      form: {
        name: "",
        desc: "",
        categoryId: "",
      },
      title: "",
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "产品品类不能为空", trigger: "change" },
        ],
        name: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
        desc: [
          { required: true, message: "版本描述不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    this.getList();
    this.Enter_Fn(this.submitForm);
  },
  methods: {
    getList() {
      typeCategory().then((res) => {
        this.modelList = res.data;
      });
    },
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        name: "",
        desc: "",
        categoryId: "",
      };
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            editComputer(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addComputer(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.dialogVisible = false;
                this.$parent.getList();
                this.open = false;
              }
            });
          }
        }
      });
    },
  },
};
</script>
