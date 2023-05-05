 <template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="450px"
      append-to-body
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="芯片版本:" prop="schemeVersion">
          <el-select
            v-model="form.schemeVersion"
            clearable
            size="mini"
            placeholder="请选择芯片版本"
            style="width: 100%"
          >
            <el-option
              v-for="(dict, index) in cidOptions"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="协议版本:" prop="agreementVersion">
          <el-select
            v-model="form.agreementVersion"
            clearable
            size="mini"
            placeholder="请选择协议版本"
            style="width: 100%"
          >
            <el-option
              v-for="(dict, index) in testAgreementList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="测试工序:" prop="processesId">
          <el-select
            v-model="form.processesId"
            clearable
            size="mini"
            placeholder="请选择测试工序"
            style="width: 100%"
          >
            <el-option
              v-for="(dict, index) in processesList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文件包:" prop="file">
          <DrUpload
            v-model="form.file"
            :limit="1"
            :isOnePic="1"
            :css="{ width: '100%' }"
            class="flex-direction align-start"
          >
            <div>
              <el-button size="small" type="primary">点击上传</el-button>
            </div>
          </DrUpload>
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
import { stsWebSave, stsWebUpdate } from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  props: ["cidOptions", "testAgreementList", "processesList"],
  data() {
    return {
      step: 1,
      modelList: [],
      dialogVisible: false,
      // 表单参数
      form: {
        schemeVersion: "",
        agreementVersion: "",
        processesId: "",
        file: "",
      },
      // 表单校验
      rules: {
        schemeVersion: [
          { required: true, message: "请选择芯片版本", trigger: "change" },
        ],
        agreementVersion: [
          { required: true, message: "请选择协议版本", trigger: "change" },
        ],
        processesId: [
          { required: true, message: "请选择测试工序", trigger: "change" },
        ],
        file: [{ required: true, message: "请上传文件", trigger: "change" }],
      },
    };
  },
  watch: {
    "form.file"(file) {
      if (file) {
        this.clearValidateItem("form", "file");
      }
    },
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        schemeVersion: "",
        agreementVersion: "",
        processesId: "",
        file: "",
      };
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            stsWebUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          } else {
            stsWebSave(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("创建成功");
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
