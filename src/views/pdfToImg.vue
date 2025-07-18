<template>
  <el-container class="pdf-trans-box">
    <el-header>PDF转图片</el-header>
    <el-main class="text-center">
      <el-upload
        class="upload-pdf-demo"
        ref="uploadPDF"
        action="#"
        :on-change="onChange"
        :http-request="handleFileUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :auto-upload="false"
        accept=".pdf"
        :file-list="fileList"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-red" slot="tip">
          只能上传<em>pdf</em>文件
        </div>
      </el-upload>

      <div class="flex align-center justify-center">
        <el-button
          icon="el-icon-refresh"
          type="primary"
          @click="submitUpload"
        >
          转 化
        </el-button>
        <el-button
          icon="el-icon-download"
          type="success"
          @click="onDownload"
          :disabled="isDownload"
        >
          下载
        </el-button>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { fileConverter } from "@/api/third/testApi";
export default {
  data() {
    return {
      isUploading: false,
      isDownload: true,
      fileUrl: "",
      fileList: [],
      downloadLoadingInstance: null
    };
  },
  methods: {
    onChange(file, fileList) {
      this.$refs.uploadPDF.clearFiles();
      this.fileList = fileList.slice(-1);
    },
    async handleFileUpload(file) {
      try {
        const formData = new FormData();
        formData.append("file", file.file);
        const { data } = await fileConverter(formData);
        if (data) {
          this.isDownload = false;
          this.fileUrl = data;
          this.downloadLoadingInstance.close();
          this.msgSuccess("文件转化成功");
        }
      } catch (error) {
        this.downloadLoadingInstance.close();
        this.msgError("文件转化失败");
        console.error(error);
      }
    }, 
    handleSuccess(response, file) {
      // 上传成功的回调处理
      this.isUploading = false;
    },
    handleError(error, file) {
      // 上传失败的回调处理
      this.isUploading = false;
    },
    onDownload() {
      this.download(this.fileUrl)
    },
    submitUpload() {
      if (this.fileList.length === 0) {
        return this.msgWarning("请上传文件!");
      } else {
        this.downloadLoadingInstance = this.$loading({
          lock: true,
          text: '正在转化中，请稍后',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        this.$refs.uploadPDF.submit();
      }
    },
  },
  beforeDestroy() {
    this.downloadLoadingInstance = null;
  }
};
</script> 

<style lang="scss" scoped>
.el-container.pdf-trans-box {
  height: 100vh;
  background: #fff;

  .el-header {
    font-size: 20px;
    font-weight: bold;
  }

  .el-header,
  .el-footer {
    line-height: 60px;
    text-align: center;
  }

  .loading-style {
    font-size: 67px;
    color: #c0c4cc;
    margin: 40px 0 16px;
    line-height: 50px;
  }

  .el-main {
    display: grid;
    grid-template-rows: 1fr 100px;

    .upload-pdf-demo {
      /deep/ .el-upload-dragger {
        height: 70vh;
        width: 80vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
}
</style>