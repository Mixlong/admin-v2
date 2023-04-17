<template>
  <el-dialog
    :title="title"
    width="750px"
    append-to-body
    top="2vh"
    v-bind="$attrs"
    :close-on-click-modal="false"
    :modal-append-to-body="true"
    @close="$emit('update:visible', false)"
    center
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="事项" prop="item">
        <el-input
          v-model="form.item"
          placeholder="请输入事项"
          style="width: 65%"
        />
      </el-form-item>
      <el-form-item label="责任人" prop="createUser">
        <el-select
          v-model="form.createUser"
          clearable
          placeholder="请选择责任人"
          collapse-tags
          style="width: 65%"
        >
          <el-option
            v-for="(item, index) in pmDictListOptions"
            :label="item.userName"
            :value="+item.userId"
            :key="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划完成时间" prop="planTime">
        <el-date-picker
          v-model="form.planTime"
          type="datetime"
          value-format="timestamp"
          :picker-options="pickerOptions"
          placeholder="请选择计划完成时间"
          style="width: 65%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="内容及要求" prop="content">
        <tinymce
          v-if="$attrs.visible"
          v-model="form.content"
          height="250"
          placeholder="请输入内容及要求"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { emphasisAdd, emphasisUpdate } from "@/api/third/emphasis";

export default {
  inheritAttrs: false,
  components: { tinymce: () => import("@/views/components/Editor") },
  props: ["pmDictListOptions"],
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 3600 * 1000;
        },
      },
      // 表单参数
      form: {
        item: "",
        content: "",
        planTime: "",
        createUser: "",
      },
      title: "",
      // 表单校验
      rules: {
        item: [{ required: true, message: "请输入事项", trigger: "blur" }],
        content: [
          { required: true, message: "请输入内容及要求", trigger: "blur" },
        ],
        planTime: [
          { required: true, message: "请选择计划完成时间", trigger: "change" },
        ],
        createUser: [
          { required: true, message: "请选择责任人", trigger: "change" },
        ],
      },
    };
  },
  watch: {
    "form.content"(val) {
      if (val) {
        this.clearValidateItem("form", "content");
      }
    },
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        item: "",
        content: "",
        planTime: "",
        createUser: "",
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          if (params.id) {
            emphasisUpdate(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$parent.getList();
                this.$emit("update:visible", false);
              }
            });
          } else {
            emphasisAdd(params).then((response) => {
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
