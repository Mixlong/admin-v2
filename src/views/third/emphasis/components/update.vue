<template>
  <!--   -->
  <el-dialog
    :title="title"
    width="750px"
    append-to-body
    :close-on-click-modal="false"
    top="2vh"
    v-bind="$attrs"
    :modal-append-to-body="true"
    v-on="$listeners"
    @open="onOpen"
    @close="onClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="85px"
      :class="{ 'row-label-style': showName }"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="项目名称"
            prop="projectName"
            label-width="85px"
            v-if="!showName">
            <el-input
              v-model="form.projectName"
              placeholder="请输入项目名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="客户"
            prop="customer"
            label-width="85px"
            v-if="!showName">
            <el-input
              v-model="form.customer"
              placeholder="请输入客户"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="类型"
            prop="type"
            v-if="!showName">
            <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
              <el-option
                v-for="(dict, index) in typeOptions"
                :key="index"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="内容" prop="content" style="width: 100%">
        <el-input
          :autosize="{ minRows: 10 }"
          type="textarea"
          v-model="form.content"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="计划" prop="workPlan" style="width: 100%">
        <el-input
          :autosize="{ minRows: 10 }"
          type="textarea"
          v-model="form.workPlan"
          placeholder="请输入"
        ></el-input>
      </el-form-item>

      <el-form-item label="关联人员" prop="userList">
        <el-select
          v-model="form.userList"
          multiple
          clearable
          placeholder="请选择"
          collapse-tags
          style="width: 100%"
        >
          <el-option
            :label="item.dictLabel"
            :value="item.dictValue"
            v-for="(item, index) in pmDictListOptions"
            :key="index"
          >
          </el-option>
        </el-select>
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
import tinymce from "@/views/components/Editor";

export default {
  inheritAttrs: false,
  components: { tinymce },
  props: ["pmDictListOptions", "stateOptions"],
  data() {
    return {
      showName: "",
      typeOptions: [],
      dialogVisible: false,
      // 表单参数
      form: {
        isShow: 0,
        workPlan: ""
      },
      title: "",
      // 表单校验
      rules: {
        projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
        userList: [
          { required: true, message: "请选择关联人员", trigger: "blur" },
        ],
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
  mounted() {
    this.getDicts("emphasis_type").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.typeOptions = res.data;
    });
  },
  methods: {
    onOpen() {
      let { rowUpdate } = this.$attrs;
      if (rowUpdate) {
        let fd = Object.assign({}, rowUpdate);
        fd.userList = fd.userList.map((item) => item.userId);
        this.form = Object.assign({}, fd);
      } else {
        this.reset();
      }
    },
    onClose() {},
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          params.userList = params.userList.map((item) => {
            return { userId: item };
          });
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

<style lang="scss" scope>
</style>

