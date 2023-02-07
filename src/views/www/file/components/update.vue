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
      label-width="120px"
      @submit.native.prevent
      class="form-data-inline"
      inline
    >
      <el-form-item label="中文仪表名:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入仪表名称"
          style="width: 100%"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="英文仪表名:" prop="enName">
        <el-input
          v-model="form.enName"
          placeholder="请输入仪表名称"
          style="width: 100%"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="分类:" prop="dirId">
        <el-select
          v-model="form.dirId"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属类型:" prop="type">
        <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文件:" prop="url">
        <DrUpload :limit="1" v-model="form.url" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">点击上传</el-button>
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
import { fileAdd, fileUpdate } from "@/api/home/file";
import reqUrl from "@/utils/requestUrl";
export default {
  props: ["title", "classOptions", "typeOptions"],
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      dialogVisible: false,
      zhSpecArr: [{ key: "", value: "" }],
      enSpecArr: [{ key: "", value: "" }],

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        fileUrl: "",
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "请输入仪表名", trigger: "change" }],
        enName: [
          { required: true, message: "请输入仪表名", trigger: "change" },
        ],
        dirId: [{ required: true, message: "请选择分类", trigger: "change" }],
        url: [{ required: true, message: "请选择文件", trigger: "change" }],
        type: [{ required: true, message: "请选择分类", trigger: "change" }],
      },
    };
  },
  mounted() {},
  methods: {
    addKey(arr) {
      let num = 0;
      for (let key of arr) {
        if (!key.value && !key.key) {
          num += 1;
        }
      }

      if (num == 0) {
        arr.push({
          key: "",
          value: "",
        });
      }
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        fileUrl: "",
        forceUpdate: 1,
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          let { zhSpecArr } = this;
          let arr = [];
          for (let key of zhSpecArr) {
            if (key.value && key.key) {
              arr.push(key);
            }
          }
          params.specification = JSON.stringify(arr);
          if (params.id) {
            fileUpdate(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            fileAdd(params).then((response) => {
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

