<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
    top="13vh"
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="95px"
      @submit.native.prevent
      class="form-data-inline"
      inline
    >
      <el-form-item label="系列名称:" prop="name">
        <el-input v-model="form.name" placeholder="请输入pucs类型"></el-input>
      </el-form-item>
      <el-form-item label="pucs型号:" prop="code">
        <el-input v-model="form.code" placeholder="请输入pucs型号"></el-input>
      </el-form-item>

      <el-form-item label="外观照片:" prop="icon">
        <DrUpload
          listType="picture-card"
          pclass="flex"
          :limit="1"
          v-model="form.icon"
        >
        </DrUpload>
      </el-form-item>
      <el-row>
        <el-form-item label="系列配置:">
          <el-button v-if="!form.moduleList.length" icon="el-icon-plus" @click="addDomain">新增系列配置</el-button>
        </el-form-item>
      </el-row>
      <template v-if="form.moduleList.length">
        <el-row v-for="(item, index) in form.moduleList" :key="index">
          <template>
            <el-col :span="7" :offset="2">
              <el-form-item label="模块编码:" style="width: 100%">
                <el-input v-model="item.code" clearable placeholder="请输入模块编码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="模块名称:" style="width: 100%">
                <el-input v-model="item.name" clearable placeholder="请输入模块名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="数量:" style="width: 100%">
                <el-input v-model="item.num" clearable placeholder="请输入数量"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="1">
              <el-button
                @click="removeDomain(item)"
                class="margin-left-xs"
                icon="el-icon-minus"
                circle
                plain
                v-if="
                  index > 0 &&
                  form.moduleList.length > 0 &&
                  index + 1 != form.moduleList.length
                "
                type="primary"
              ></el-button>
              <el-button
                @click="addDomain"
                class="margin-left-xs"
                icon="el-icon-plus"
                circle
                plain
                v-if="index + 1 == form.moduleList.length"
                type="primary"
              ></el-button>
            </el-col>
          </template>
        </el-row>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addType, updateType } from "@/api/pucs/type";

export default {
  props: ["title"],
  data() {
    return {
      dialogVisible: false,
      factoryOptions: [],
      computerOptions: [],

      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        icon: undefined,
        moduleList: [
          {
            code: '',
            name: '',
            num: '',
          },
        ],
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "请输入pucs类型", trigger: "change" },
        ],
        code: [
          { required: true, message: "请输入pucs型号", trigger: "change" },
        ],
        icon: [
          { required: true, message: "请输入pucs图片", trigger: "change" },
        ]
      },
    };
  },
  methods: {
    addDomain() {
      this.form.moduleList.push({
        code: '',
        name: '',
        num: '',
      });
    },
    removeDomain(item) {
      var index = this.form.moduleList.indexOf(item)
      if (index !== -1) {
        this.form.moduleList.splice(index, 1)
      }
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
         moduleList: [
          {
            code: '',
            name: '',
            num: '',
          },
        ]
      };
      this.resetForm("form");
    },
    changeTargetIdType(val) {
      this.form.targetId = this.form.updateCondition == 4 ? [] : "";
      this.form = Object.assign({}, this.form);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          if (this.form.id) {
            updateType(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addType(params).then((response) => {
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

