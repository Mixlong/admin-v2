<template>
  <el-dialog
    title="添加新版本"
    :visible.sync="dialogVisible"
    width="700px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-scroll"
  >
    <el-alert
      title=""
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <div>
        当前版本：<strong>{{ firmwareData.versionNumber }}</strong>
      </div>
    </el-alert>

    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="新版本号" prop="versionNumber">
        <el-input
          v-model="form.versionNumber"
          placeholder="请输入新版本号，如：v1.1.0"
        />
      </el-form-item>
      <el-form-item label="固件文件" prop="fileUrl">
         <DrUpload v-model="form.fileUrl" :limit="1" :isOnePic="1">
          <div class="text-left">
            <el-button size="mini" type="primary">点击上传固件文件</el-button>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item label="版本描述" prop="versionDescription">
        <el-input
          v-model="form.versionDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入新版本描述"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading"
        >确 定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { addNewFirmware } from "@/api/third/bluetoothFirmware";
import MyUpload from "@/components/MyUpload";

export default {
  name: "AddNewVersionDialog",
  components: {
    MyUpload,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    firmwareData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitLoading: false,
      form: {
        versionNumber: "",
        versionDescription: "",
        fileUrl: "",
      },
      rules: {
        versionNumber: [
          { required: true, message: "请输入新版本号", trigger: "blur" },
        ],
        fileUrl: [
          { required: true, message: "请输入文件URL", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    handleClose() {
      this.$refs.form.resetFields();
      this.dialogVisible = false;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          addNewFirmware(this.firmwareData.id, this.form)
            .then(() => {
              this.$message.success("新版本添加成功");
              this.$emit("success");
              this.handleClose();
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },
  },
};
</script>
