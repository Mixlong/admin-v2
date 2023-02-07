<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="1020px"
    append-to-body
    :close-on-click-modal="false"
    top="2vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="90px"
      class="input-width"
      :class="{ 'row-label-style': showName == 'plan' }"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="ECN编号:" prop="ecn">
            {{ form.ecn }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目名称:" prop="projectName">
            {{ form.projectName }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品代号:" prop="productCode">
            {{ form.productCode }}
          </el-form-item></el-col
        >
        <el-col :span="12">
          <el-form-item label="申请单位:" prop="reqUnit">
            {{ form.reqUnit }}
          </el-form-item>
        </el-col>
      </el-row>

      <div class="mask-layer">
        <el-form-item label="分类:" prop="changeCause">
          <el-checkbox-group v-model="form.changeCause">
            <el-checkbox
              v-for="(item, index) in classifyList"
              :label="item.dictValue"
              :key="index"
              >{{ item.dictLabel }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </div>
      <div class="mask-layer">
        <el-form-item label="涉及领域:" prop="involveUnit">
          <el-checkbox-group v-model="form.involveUnit">
            <el-checkbox
              v-for="(item, index) in involveUnitList"
              :label="item.dictValue"
              :key="index"
              >{{ item.dictLabel }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </div>
      <div class="flex mask-layer">
        <el-form-item label="导入方式:" prop="importType">
          <el-radio-group v-model="form.importType">
            <el-radio :label="1">立即导入</el-radio>
            <el-radio :label="2">自然导入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          style="margin-left: 48px:"
          label=""
          prop="importTime"
        
        >
           {{form.importTime}}
        </el-form-item>
      </div>
      <el-row>
        <el-col :span="24">
          <el-form-item label="BOM版本:" prop="beforeVersion">
            <el-card shadow="never">
              {{ form.beforeVersion }}
            </el-card>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="变更原因:" prop="changeCauseNote">
            <el-card shadow="never">
              {{ form.changeCauseNote }}
            </el-card>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="变更内容:" prop="changeContent">
            <el-card shadow="never">
              {{ form.changeContent }}
            </el-card>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="变更结果" prop="afterVersion">
            <el-card shadow="never">
              {{ form.afterVersion }}
            </el-card>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { bomAdd, bomUpdate } from "@/api/third/ecn";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["classifyList", "involveUnitList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      // 表单参数
      form: {
        isShow: 0,
      },
      title: "",
      // 表单校验
      rules: {
        ecn: [{ required: true, message: "请输入ECN编号", trigger: "blur" }],
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
        ],
        productCode: [
          { required: true, message: "请输入产品代号", trigger: "blur" },
        ],
        reqUnit: [
          { required: true, message: "请输入申请单位", trigger: "blur" },
        ],
        beforeVersion: [
          { required: true, message: "请输入变更前BOM版本", trigger: "blur" },
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
        importType: 1,
        changeCause: [],
        involveUnit: [],
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = Object.assign({}, this.form);
          param.changeCause = param.changeCause.toString();
          param.involveUnit = param.involveUnit.toString();
          if (param.id) {
            bomUpdate(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            bomAdd(param).then((response) => {
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

