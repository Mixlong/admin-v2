<template>
  <el-upload
    ref="MyUploadRef"
    :value="value"
    class="upload-demo"
    :action="actionUrl"
    :multiple="multiple"
    :limit="limit"
    :file-list="fileList"
    :on-success="handleSuccess"
    :on-exceed="handleExceed"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
  >
    <slot>
      <el-button size="mini" type="primary">{{ btnTitle }}</el-button>
    </slot>
    <div slot="tip" class="el-upload__tip">
      {{ tipValue }}
    </div>
  </el-upload>
</template>

<script>
const uploadUrl = process.env.VUE_APP_UPLOAD_URL;

export default {
  name: "MyUpload",
  props: {
    value: {
      required: true,
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
    },
    btnTitle: {
      type: String,
      default: "点击上传",
    },
    tipValue: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      actionUrl: uploadUrl + "/oss/batch-upload",
      fileList: [],
    };
  },
  watch: {
    value(data) {
      this.transImg(data);
    },
  },
  mounted() {
    this.transImg(this.value);
  },
  methods: {
    transImg(value) {
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
    handleSuccess(response, file, fileList) {
      if (this.limit === 1) {
        this.$refs.MyUploadRef.clearFiles();
      }

      this.handleTransImg(this.limit === 1 ? [file] : fileList);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    handleRemove(file, fileList) {
      this.handleTransImg(fileList);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    handleTransImg(file) {
      if (file.every((item) => item.status === "success")) {
        const newImgFile = file.map((item) => {
          if (item.response) {
            return item.response.data[0].url;
          } else {
            return item.url;
          }
        });

        this.$emit("input", newImgFile.toString());
      }
    },
  },
};
</script>