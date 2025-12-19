<template>
  <el-dialog
    :title="isEdit ? '修改固件' : '新增固件'"
    :visible.sync="dialogVisible"
    width="900px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-scroll"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本号" prop="versionNumber">
            <el-input v-model="form.versionNumber" placeholder="请输入版本号，如：v1.0.0" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="芯片平台" prop="chipPlatform">
            <el-input v-model="form.chipPlatform" placeholder="请输入芯片平台，如：Nordic nRF52840" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户" prop="customer">
               <el-input   v-model="form.customer"  placeholder="请输客户" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目" prop="project">
            <el-input v-model="form.project" placeholder="请输入项目名称" clearable />
          </el-form-item>
        </el-col>

 
      </el-row>
            <el-form-item label="版本描述" prop="versionDescription">
        <el-input
          v-model="form.versionDescription"
          type="textarea"
          :rows="4"
          placeholder="请输入版本描述"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">启用</el-radio>
              <el-radio :label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="固件文件" prop="fileUrl">
        <MyUpload
          v-model="form.fileUrl"
          :limit="1"
          btnTitle="点击上传固件文件"
          :file-size="100"
        />
      </el-form-item>
 
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addFirmware, updateFirmware } from "@/api/third/bluetoothFirmware";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";
import MyUpload from "@/components/MyUpload";

export default {
  name: "AddFirmwareDialog",
  components: {
    TypedSelectLoadMore,
    MyUpload,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    firmwareData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitLoading: false,
      form: {
        id: undefined,
        versionNumber: "",
        chipPlatform: "",
        customer: "",
        project: "",
        versionDescription: "",
        fileUrl: "",
        forceUpgrade: 0,
        status: 0,
      },
      rules: {
        versionNumber: [
          { required: true, message: "请输入版本号", trigger: "blur" },
        ],
        chipPlatform: [
          { required: true, message: "请输入芯片平台", trigger: "blur" },
        ],
        customer: [
          { required: true, message: "请输入客户名称", trigger: "blur" },
        ],
        project: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
        ],
        fileUrl: [
          { required: true, message: "请上传固件文件", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    isEdit() {
      return !!this.firmwareData;
    },
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    firmwareData: {
      handler(val) {
        if (val) {
          this.form = {
            id: val.id,
            versionNumber: val.versionNumber,
            chipPlatform: val.chipPlatform,
            customer: val.customer,
            project: val.project,
            versionDescription: val.versionDescription,
            fileUrl: val.fileUrl,
            forceUpgrade: val.forceUpgrade,
            status: val.status,
          };
        }
      },
      immediate: true,
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
          const apiMethod = this.isEdit ? updateFirmware : addFirmware;
          apiMethod(this.form)
            .then(() => {
              this.$message.success(this.isEdit ? "修改成功" : "新增成功");
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
