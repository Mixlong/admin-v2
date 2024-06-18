<template>
  <el-upload
    ref="upload"
    :style="css"
    class="my-upload-demo style-upload"
    :action="actionUrl"
    :on-success="uploadSuccess"
    :on-remove="removeUpload"
    :before-upload="beforeUpload"
    :file-list="fileList"
    :drag="drag"
    :disabled="disabled"
    :list-type="listType"
    :class="{ hide: fileList.length >= limit }"
    :show-file-list="showFileList"
    :accept="accept"
  >
    <!-- <div v-if="!$slots.default" class="all-img">
      <i class="el-icon-plus avatar-uploader-icon" v-if="limit != 1"></i>
      <div v-else style="background-color: #fbfdff; height: inherit">
        <div v-if="fileList.length > 0">
          <el-image
            v-for="(item, index) in fileList"
            :key="index"
            :src="item.url"
            fit="cover"
          >
            <div slot="placeholder" class="image-slot">
              <i class="el-icon-loading"></i>
            </div>
          </el-image>
        </div>
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </div>
    </div> -->
    <slot></slot>
  </el-upload>
</template>

<script>
import reqUrl from "@/utils/requestUrl";

export default {
  props: {
    value: "",
    limit: "",
    drag: "",
    css: "",
    listType: "",
    pclass: "",
    showFileList: "",
    accept: "",
    disabled: {
      type: Boolean,
      default: false,
    },
    // accept: {
    //   default: "image/jpeg, image/gif, image/png,image/bmp",
    // },
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      fileList: [],
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
      value = value ? value : "";
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
      this.$emit("beforeUpload", file);
    },
    uploadSuccess(response, file, fileList) {
      if (this.limit == 1) {
        this.$refs.upload.clearFiles();
      }
      this.handleReturnData(this.limit == 1 ? [file] : fileList);
      this.$emit("uploadSuccess", response, file, fileList);
    },
    removeUpload(response, file, fileList) {
      this.handleReturnData(file);
      this.$emit("removeUpload", response, file, fileList);
    },
    handleReturnData(file) {
      let currentFill = file.map((item) => {
        if (item.response) {
          return item.response.data[0].url;
        } else {
          return item.url;
        }
      });
      this.$emit("input", currentFill.toString());
    },
    clickInput() {
      this.$refs["upload"].$children[0].$refs.input.click();
    },
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
