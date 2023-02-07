<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-13 16:02:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/testTool/components/DReturn.vue
-->
<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    title="归还"
    :visible.sync="dialogVisible"
    width="750px"
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
      <el-form-item label="备注:" prop="remark">
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
import { toolReturn } from "@/api/third/tool";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["title", "pmDictListOptions"],
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
        remark: [{ required: true, message: "请输入备注", trigger: "change" }],
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
          toolReturn(this.form).then((response) => {
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
