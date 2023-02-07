<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
    top="2vh"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="品类" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          clearable
          size="small"
          style="width: 185px"
        >
          <el-option
            v-for="dict in categoryOptions"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入仪表型号"
          style="width: 185px"
          @keyup.enter.native.prevent="submitForm"
        />
      </el-form-item>
      <el-form-item label="型号编码:" prop="model">
        <el-input
          v-model="form.model"
          placeholder="请输入仪表型号"
          maxlength="3"
          style="width: 185px"
        />
      </el-form-item>
      <el-form-item label="ERP编码:" prop="erp">
        <el-input
          v-model="form.erp"
          placeholder="请输入ERP编码"
          style="width: 185px"
        />
      </el-form-item>
      <el-form-item label="描述:" prop="desc">
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          v-model="form.desc"
          placeholder="请输入仪表描述"
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
import { instrumentAdd, instrumentUpdate } from "@/api/third/instrument";
import { selectComputer } from "@/api/third/computer";
import { typeCategory } from "@/api/third/category";

export default {
  data() {
    return {
      modelList: [],
      dialogVisible: false,
      fileTypeList: [],
      computerFormOptions: [],
      // 表单参数
      form: {},
      title: "",
      // 表单校验
      rules: {
        computerModel: [
          { required: true, message: "所属仪表不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "文件类型不能为空", trigger: "blur" },
        ],
      },
      cidOptions: [],
      splitCidOptions: [],
      typeOptions: [],
      voltageOptions: [],
      midOptions: [],
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        typeCategory().then((res) => {
          this.modelList = res.data;
        });
      }
    },
    form: {
      handler: function (nowVal, oldVal) {
        selectComputer(this.form).then((res) => {});
      },
      deep: true,
    },
  },
  mounted() {},
  methods: {
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    handleFleetnessAdd() {
      this.$prompt("请输入产品型号", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {})
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });
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
            instrumentUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            instrumentAdd(this.form).then((response) => {
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
.form-data-ss {
  .el-form-item {
    width: 341px;
  }
}
</style>

