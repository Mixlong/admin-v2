<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2024-01-15 18:25:26
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-23 10:49:59
 * @FilePath: \FILECONF-UI\src\views\pdfToImg.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-container>
    <el-header>PDF转图片</el-header>
    <el-main class="text-center">
      <el-upload
        class="upload-demo"
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
        <div class="el-upload__tip" slot="tip">只能上传<em>pdf</em>文件</div>
      </el-upload>

      <el-button
        class="margin-top-sm"
        type="primary"
        :loading="isUploadLoading"
        @click="submitUpload"
      >
        转 化 {{ isUploadLoading ? "中..." : "" }}
      </el-button>
      <el-button icon="el-icon-download" type="success" @click="onDownload" :disabled="isDownload">下载</el-button>
    </el-main>
  </el-container>
</template>

<script>
import { fileConverter } from "@/api/third/testApi";
export default {
  data() {
    return {
      isUploadLoading: false,
      isUploading: false,
      isDownload: true,
      fileUrl: "",
      fileList: [],
    };
  },
  computed: {
    isUploadIcon() {
      return this.isUploadLoading
        ? "el-icon-loading loading-style"
        : "el-icon-upload";
    },
  },
  methods: {
    onChange(file, fileList) {
      console.log(file, fileList);
      this.$refs.uploadPDF.clearFiles();
      this.fileList = fileList.slice(-1);
    },
    async handleFileUpload(file) {
      try {
        this.isUploadLoading = true;
        const formData = new FormData();
        formData.append("file", file.file);
        const { data } = await fileConverter(formData);
        if (data) {
          this.isUploadLoading = false;
          this.isDownload = false;
          this.fileUrl = data;
          this.msgSuccess("文件转化成功");
        }
      } catch (error) {
        this.isUploadLoading = false;
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
      const link = document.createElement("a");
      link.href = this.fileUrl;
      const fileName = this.fileUrl;
      link.download = fileName.slice(fileName.lastIndexOf('/')+1, fileName.lastIndexOf(".rar"));
      link.click();
    },
    submitUpload() {
      if (this.fileList.length === 0) {
        return this.msgError("请上传文件");
      } else {
        this.$refs.uploadPDF.submit();
      }
    },
  },
};
</script> 

<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
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
}
</style>