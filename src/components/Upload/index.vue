<template>
  <el-upload
    ref="upload"
    :style="css"
    class="my-upload-demo style-upload"
    :action="actionUrl"
    :on-success="uploadSuccess"
    :on-remove="removeUpload"
    :on-exceed="handleExceed"
    :before-upload="beforeUpload"
    :on-change="handleChange"
    :file-list="fileList"
    :drag="drag"
    :limit="limit"
    :disabled="disabled"
    :multiple="multiple"
    :list-type="listType"
    :accept="accept"
    :show-file-list="showFileList"
  >
    <slot v-bind:uploadStatus="isUploadStatus"></slot>
  </el-upload>
</template>

<script>
import reqUrl from "@/utils/requestUrl";

export default {
  name: "DrUpload",
  props: {
    value: "",
    limit: "",
    drag: "",
    css: "",
    listType: "",
    pclass: "",
    showFileList: {
      type: Boolean,
      default: true,
    },
    accept: "",
    disabled: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    isExceedTip: {
      type: Boolean,
      default: true
    }
    // accept: {
    //   default: "image/jpeg, image/gif, image/png,image/bmp",
    // },
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      fileList: [],
      isUploadStatus: 0, // 文件上传状态  0：点击上传 1： 上传中
    };
  },
  watch: {
    value(value) {
      this.transImgVal(value);
    },
  },
  mounted() {
    let value = this.value;
    this.transImgVal(value);
  },
  methods: {
    transImgVal(value) {
      value = value ?? "";
      let fileList = value.split(",").map((item) => {
        return {
          name: item.slice(item.lastIndexOf("/") + 1),
          url: item,
        };
      });

      this.fileList = fileList.filter((item) => {
        return item.url != "";
      });
    },
    beforeUpload(file) {
      if (file?.name.indexOf("+") !== -1) {
        this.msgError("上传的文件名称不能包含‘+’字符");
        return false;
      }

      this.isUploadStatus = 1;
    },
    uploadSuccess(response, file, fileList) {
      if (this.limit == 1) {
        this.$refs.upload.clearFiles();
      }

      this.isUploadStatus = 0;
      this.handleReturnData(this.limit === 1 ? [file] : fileList);
    },
    handleExceed(files, fileList) {
      if(!this.isExceedTip) return;
      this.msgWarning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    removeUpload(response, file, fileList) {
      this.handleReturnData(file);
    },
    handleReturnData(file) {
      if (file.every((item) => item.status === "success")) {
        let currentFill = file.map((item) => {
          if (item.response) {
            return item.response.data[0].url;
          } else {
            return item.url;
          }
        });

        this.$emit("input", currentFill.toString());
      }
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1); 
    }
  },
};
</script>

<style lang="scss">
.my-upload-demo {
  .el-upload {
    height: inherit;
    .all-img {
      height: inherit !important;
      line-height: inherit !important;
      .el-image {
        height: inherit !important;
        line-height: inherit !important;
      }
    }
  }
  .el-upload-list {
    display: flex;
    flex-wrap: wrap;
  }
  .el-upload-dragger {
    width: 100%;
  }
  .el-upload--picture-card {
    width: 100px !important;
    height: 100px !important;
    line-height: 100px !important;
    .all-img {
      height: inherit !important;
      line-height: inherit !important;
    }
  }
}
</style>
