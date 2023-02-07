<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="710px"
    append-to-body
    top="13vh"
    :close-on-click-modal="false"
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
      <el-form-item label="DUT编码:" prop="dutCode">
        <!-- <el-select
          v-model="form.dutCode"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in dutOptions"
            :key="item.value"
            :label="item.name"
            :value="item.model"
          >
          </el-option>
        </el-select> -->

        <el-cascader
          v-model="form.dutCode"
          :options="dutOptions"
          style="width: 100%"
          :props="{
            expandTrigger: 'hover',
            label: 'name',
            value: 'model',
            children: 'computerList',
          }"
        ></el-cascader>
      </el-form-item>

      <el-form-item label="工序:" prop="processId">
        <el-select style="width: 100%" v-model="form.processId">
          <el-option
            v-for="item in processOptions"
            :key="item.value"
            :label="item.dictLabel"
            :value="item.dictCode"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="测试说明:" class="form-textarea">
        <el-input
          v-model="form.explain"
          type="textarea"
          placeholder="请输入测试说明"
          :autosize="{ minRows: 4, maxRows: 8 }"
        ></el-input>
      </el-form-item>
      <el-form-item label="文件上传:" prop="fileUrl" style="width: 100%">
        <DrUpload :limit="1" v-model="form.fileUrl" :isOnePic="1">
          <div class="text-left">
            <el-button type="primary" size="small">点击上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item
        label="接线文件:"
        prop="connectionFileUrl"
        style="width: 100%"
      >
        <DrUpload :limit="1" v-model="form.connectionFileUrl" :isOnePic="1">
          <div class="text-left">
            <el-button type="primary" size="small">点击上传</el-button>
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
import { addDut, updateDut } from "@/api/dut";
export default {
  props: ["title", "processOptions", "dutOptions"],
  data() {
    return {
      dialogVisible: false,
      factoryOptions: [],
      computerOptions: [],
      // 表单参数
      form: {
        fileUrl: "",
      },
      // 表单校验
      rules: {
        dutId: [
          { required: true, message: "请选择DUT编码", trigger: "change" },
        ],
        fileUrl: [{ required: true, message: "请上传文件", trigger: "change" }],
        processId: [
          { required: true, message: "请选择工序", trigger: "change" },
        ],
      },
    };
  },

  methods: {
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        fileUrl: "",
      };
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          params.status = 0;
          if (this.form.dutCode && this.form.dutCode.length) {
            params.dutCode = this.form.dutCode[1];
          }
          if (params.id) {
            updateDut(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addDut(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
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

<style lang="scss">
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}
</style>

