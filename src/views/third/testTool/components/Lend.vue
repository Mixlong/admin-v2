<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    title="借出"
    :visible.sync="dialogVisible"
    width="745px"
    top="5vh"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.native.prevent
      class="form-data-inline"
      inline
    >
      <el-form-item label="借调地址:" prop="lendAddr">
        <el-input v-model="form.lendAddr" placeholder="请输入借调地址">
        </el-input>
      </el-form-item>

      <el-form-item label="责任人:" prop="principal">
        <el-select
          v-model="form.principal"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in pmDictListOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注:" prop="remark" class="form-textarea">
        <tinymce
          v-if="dialogVisible"
          v-model="form.remark"
          placeholder="请输入"
          :width="showName == 'remark' ? '100%' : '585px'"
          height="210"
        ></tinymce>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { toolLend } from "@/api/third/tool";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["pmDictListOptions"],
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
        lendAddr: [
          { required: true, message: "请输入借调地址", trigger: "change" },
        ],
        principal: [{ required: true, message: "请选择", trigger: "change" }],
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
          toolLend(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("借出成功");
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
