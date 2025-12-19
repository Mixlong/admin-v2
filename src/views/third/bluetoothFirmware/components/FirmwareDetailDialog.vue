<template>
  <el-dialog
    title="固件详情"
    :visible.sync="dialogVisible"
    width="1000px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-scroll"
  >
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本号">
          {{ detail.versionNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="芯片平台">
          {{ detail.chipPlatform }}
        </el-descriptions-item>
        <el-descriptions-item label="客户">
          {{ detail.customer }}
        </el-descriptions-item>
        <el-descriptions-item label="项目">
          {{ detail.project }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 0 ? 'success' : 'info'" size="small">
            {{ detail.statusName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="版本描述" :span="2">
          {{ detail.versionDescription }}
        </el-descriptions-item>
        <el-descriptions-item label="固件文件" :span="2">
          <FileDisplay :file-url="detail.fileUrl" />
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ detail.createBy }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detail.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="修改人">
          {{ detail.updateBy }}
        </el-descriptions-item>
        <el-descriptions-item label="修改时间">
          {{ detail.updateTime }}
        </el-descriptions-item>
      </el-descriptions>


    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FileDisplay from "@/components/FileDisplay";

export default {
  name: "FirmwareDetailDialog",
  components: {
    FileDisplay,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    firmwareId: {
      type: String,
      default: "",
    },
    // 新增：直接接收列表数据
    firmwareData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      detail: {},
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val && this.firmwareData) {
        // 直接使用列表传入的数据
        this.detail = { ...this.firmwareData };
      }
    },
    firmwareData: {
      handler(val) {
        if (val && this.visible) {
          this.detail = { ...val };
        }
      },
      immediate: true,
      deep: true
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.detail = {};
    },
  },
};
</script>

<style scoped>
::v-deep .el-descriptions__label {
  width: 120px;
}
</style>
