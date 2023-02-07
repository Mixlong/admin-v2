<!--
 * @Author: your name
 * @Date: 2021-06-09 16:51:44
 * @LastEditTime: 2021-06-09 18:21:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/emphasis/components/addLog.vue
-->
<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="720px"
      top="5vh"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      v-on="$listeners"
      @open="onOpen"
      title="日志"
    >
<!--      <el-form ref="form" :model="form" :rules="rules" label-width="0">-->
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="90px"
        label-position="top"
        :class="{ 'row-label-style': showName == 'plan' }"
      >
        <el-form-item label="" prop="content" style="width: 100%">
          <tinymce
            v-if="$attrs.visible"
            width="100%"
            v-model="form.note"
            height="180"
          ></tinymce>
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
import { emphasislogUpdate, emphasislogAdd } from "@/api/third/emphasis";
import tinymce from "@/views/components/Editor";

export default {
  inheritAttrs: false,
  components: { tinymce },
  data() {
    return {
      showName: "",
      // 表单参数
      form: {
        isShow: 0,
        note: "",
      },
      // 表单校验
      rules: {
        note: [{ required: true, message: "请输入内容", trigger: "blur" }],
      },
    };
  },

  mounted() {},
  methods: {
    onOpen() {
      let { logRow } = this.$attrs;
      this.reset();
      if (logRow.update) {
        let { id, note } = logRow.update;
        this.form.id = id;
        this.form.note = note;
      }
    },
    // 表单重置
    reset() {
      this.form = {
        isShow: 1,
        note: "",
      };
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          let { logRow } = this.$attrs;
          params.emphasisId = logRow.id;
          if (params.id) {
            emphasislogUpdate(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.$refs.log.onOpen();
              }
            });
          } else {
            emphasislogAdd(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");

                this.$parent.$refs.log.onOpen();
                this.$parent.getList();
                this.$emit("update:visible", false);
              }
            });
          }
        }
      });
    },
  },
};
</script>
