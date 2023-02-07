<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="920px"
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
      <el-form-item label="来源" prop="source" v-if="!showName">
        <el-input
          v-model="form.source"
          placeholder="请输入产品"
          style="width: 185px"
        />
      </el-form-item>
      <el-form-item label="所属版块" prop="plate" v-if="!showName">
        <el-select
          v-model="form.plate"
          placeholder="请选择"
          style="width: 185px"
        >
          <el-option
            v-for="(item, index) in plateOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="责任人:" prop="principal" v-if="!showName">
        <el-select
          v-model="form.principal"
          placeholder="请选择"
          style="width: 185px"
        >
          <el-option
            v-for="(item, index) in pmDictListOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="需求详情"
        prop="detail"
        style="width: 100%"
        v-if="!showName"
      >
        <tinymce
          width="760px"
          v-if="dialogVisible"
          v-model="form.detail"
          height="210"
        ></tinymce>
      </el-form-item>
      <el-form-item
        label="导入计划"
        prop="plan"
        style="width: 100%"
        v-if="showName == 'plan'"
      >
        <tinymce
          width="878px"
          v-if="dialogVisible"
          v-model="form.plan"
          height="210"
        ></tinymce>
      </el-form-item>
      <el-form-item
        label=""
        prop="scheme"
        style="width: 100%"
        v-if="showName == 'scheme'"
      >
        <tinymce
          width="878px"
          v-if="dialogVisible"
          v-model="form.scheme"
          height="210"
        ></tinymce>
      </el-form-item>
      <el-form-item
        label=""
        prop="schemeAtt"
        v-if="showName == 'scheme'"
        label-width="50px"
      >
        <DrUpload v-model="form.schemeAtt" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">附件上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { demandAdd, demandUpdate } from "@/api/third/demand";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["pmDictListOptions", "plateOptions"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      // 表单参数
      form: {},
      title: "",
      // 表单校验
      rules: {
        source: [{ required: true, message: "请输入来源", trigger: "blur" }],
        plate: [{ required: true, message: "请选择", trigger: "blur" }],

        principal: [
          { required: true, message: "请选择责任人", trigger: "blur" },
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
            demandUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            demandAdd(this.form).then((response) => {
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

