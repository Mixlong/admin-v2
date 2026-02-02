<template>
  <el-dialog
    :title="title"
    :visible="visible"
    width="90%"
    top="0vh"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="dialog-scroll"
  >
    <div v-loading="loading" class="preview-container">
      <!-- PDF预览 -->
      <iframe
        v-if="isPDF"
        :src="fileUrl"
        class="preview-iframe"
        frameborder="0"
      ></iframe>

      <!-- 图片预览 -->
      <div v-else-if="isImage" class="image-preview">
        <el-image
          :src="fileUrl"
          fit="contain"
          :preview-src-list="[fileUrl]"
        >
          <div slot="error" class="image-error">
            <i class="el-icon-picture-outline"></i>
            <p>图片加载失败</p>
          </div>
        </el-image>
      </div>

      <!-- Excel预览 -->
      <div v-else-if="isExcel" class="excel-preview">
        <vue-office-excel
          :src="fileUrl"
          style="height: 70vh; width: 100%;"
          @rendered="handleRendered"
          @error="handleError"
        />
      </div>

      <!-- 文本文件预览 -->
      <div v-else-if="isTextFile" class="text-preview">
        <pre>{{ textContent }}</pre>
      </div>

      <!-- 不支持预览的文件类型 -->
      <div v-else class="unsupported-preview">
        <i class="el-icon-document"></i>
        <p>该文件类型（{{ fileExtension }}）暂不支持在线预览</p>
        <el-button type="primary" @click="handleDownload">
          <i class="el-icon-download"></i> 下载文件
        </el-button>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleDownload">
        <i class="el-icon-download"></i> 下载
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import VueOfficeExcel from "@vue-office/excel";
// import "@vue-office/excel/lib/index.css"; // CSS file not available in current version

export default {
  name: "FilePreview",
  components: {
    VueOfficeExcel
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fileUrl: {
      type: String,
      default: ""
    },
    fileName: {
      type: String,
      default: "文件预览"
    }
  },
  data() {
    return {
      loading: false,
      textContent: ""
    };
  },
  computed: {
    title() {
      return this.fileName || "文件预览";
    },
    fileExtension() {
      if (!this.fileUrl) return "";
      const url = this.fileUrl.split("?")[0];
      const parts = url.split(".");
      return parts.length > 1 ? parts.pop().toLowerCase() : "";
    },
    isPDF() {
      return this.fileExtension === "pdf";
    },
    isImage() {
      const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
      return imageExts.includes(this.fileExtension);
    },
    isExcel() {
      const excelExts = ["xls", "xlsx"];
      return excelExts.includes(this.fileExtension);
    },
    isTextFile() {
      const textExts = ["txt", "json", "xml", "csv", "log", "md"];
      return textExts.includes(this.fileExtension);
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loading = true;
        if (this.isTextFile) {
          this.loadTextContent();
        } else if (!this.isExcel) {
          // 非 Excel 文件直接关闭 loading
          this.loading = false;
        }
      }
    }
  },
  methods: {
    async loadTextContent() {
      try {
        const response = await fetch(this.fileUrl);
        this.textContent = await response.text();
      } catch (error) {
        this.$message.error("文件加载失败");
        console.error("加载文本文件失败:", error);
      } finally {
        this.loading = false;
      }
    },
    handleRendered() {
      this.loading = false;
    },
    handleError(error) {
      this.loading = false;
      console.error("Excel 预览失败:", error);
      this.$message.error("Excel 文件预览失败，请尝试下载后查看");
    },
    handleDownload() {
      const link = document.createElement("a");
      link.href = this.fileUrl;
      link.download = this.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.textContent = "";
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-container {
  min-height: 500px;
  max-height: 80vh;
  overflow: auto;
}

.preview-iframe {
  width: 100%;
  height: 80vh;
  border: none;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;

  ::v-deep .el-image {
    max-width: 100%;
    max-height: 70vh;
  }

  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;

    i {
      font-size: 48px;
      margin-bottom: 10px;
    }
  }
}

.excel-preview {
  min-height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.text-preview {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: 70vh;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.6;
  }
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  color: #909399;

  i {
    font-size: 64px;
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
