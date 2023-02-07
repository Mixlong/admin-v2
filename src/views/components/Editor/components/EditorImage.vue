<template>
  <div class="upload-container">
    <el-button
      :style="{ background: color, borderColor: color }"
      icon="el-icon-upload"
      size="mini"
      type="primary"
      @click="dialogVisible = true"
    >
      上传图片
    </el-button>
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
    >
      <el-upload
        :multiple="true"
        :action="actionUrl"
        accept="image/jpeg, image/gif, image/png"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        list-type="picture-card"
      >
        <el-button size="small" type="primary">点击上传图片 </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </el-dialog>
  </div>
</template>

<script>
import reqUrl from "@/utils/requestUrl";
export default {
  name: "EditorSlideUpload",
  props: {
    color: {
      type: String,
      default: "#1890ff",
    },
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      dialogVisible: false,
      listObj: {},
      fileList: [],
    };
  },
  methods: {
    checkAllSuccess() {
      return Object.keys(this.listObj).every(
        (item) => this.listObj[item].hasSuccess
      );
    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map((v) => this.listObj[v]);
      if (!this.checkAllSuccess()) {
        this.$message("请等待图片上传成功后在保存");
        return;
      }
      this.$emit("successCBK", arr);
      this.listObj = {};
      this.fileList = [];
      this.dialogVisible = false;
    },
    handleSuccess(response, file) {
      const uid = file.uid;
      const objKeyArr = Object.keys(this.listObj);
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.data[0].url;
          this.listObj[objKeyArr[i]].hasSuccess = true;
          return;
        }
      }
    },
    handleRemove(file) {
      const uid = file.uid;
      const objKeyArr = Object.keys(this.listObj);
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]];
          return;
        }
      }
    },
    beforeUpload(file) {
      let isJPG = false;
      if (
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg"
      ) {
        isJPG = true;
      }
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isJPG) {
        this.$message.error("上传图片只能是 JPG/JPEG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 5MB!");
      }

      if (isJPG && isLt2M) {
        const _self = this;
        const _URL = window.URL || window.webkitURL;
        const fileName = file.uid;
        this.listObj[fileName] = {};
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = _URL.createObjectURL(file);
          img.onload = function () {
            _self.listObj[fileName] = {
              hasSuccess: false,
              uid: file.uid,
              width: this.width,
              height: this.height,
            };
          };
          resolve(true);
        });
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  ::v-deep .el-upload--picture-card {
    width: 100%;
  }
}
</style>
