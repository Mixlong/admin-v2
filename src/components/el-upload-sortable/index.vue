<style lang="scss">
@import "./index.scss";
</style>

<template>
  <div class="upload-queue">
    <draggable
      v-model="imgList"
      :disabled="isDisabled"
      @start="drag = true"
      @end="drag = false"
      @update="updateList(imgList)"
      class="el-upload-list el-upload-list--picture-card"
    >
      <transition-group>
        <div
          class="el-upload-list__item"
          :style="imgListStyle"
          v-for="(item, index) in imgList"
          :key="index"
        >
          <video class="video-box" v-if="isVideo" :src="item"></video>
          <el-image
            v-else
            :src="item"
            fit="contain"
            class="el-upload-list__item-thumbnail"
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePreview(item)"
            >
              <i class="el-icon-zoom-in"></i>
            </span>
            <span
              v-if="!isDisabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(item, index)"
            >
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </transition-group>
    </draggable>

    <el-upload
      :style="imgListStyle"
      class="el-upload el-upload--picture-card"
      :multiple="multiple"
      v-if="imgList.length < max"
      :action="action"
      :accept="accept"
      :disabled="isDisabled"
      :limit="isLimit"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
    >
      <i :class="isUploadIcon"></i>
    </el-upload>
    <el-dialog
      class="el-upload-video-img-box"
      :visible.sync="dialogVisible"
      append-to-body
      top="2vh"
    >
      <video
        style="object-fit: fill"
        controls
        class="w100"
        v-if="isVideo"
        :src="dialogImageUrl"
      />
      <img v-else width="100%" :src="dialogImageUrl" style="max-height: 80vh" />
    </el-dialog>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import reqUrl from "@/utils/requestUrl";

export default {
  name: "ElUploadSortable",
  components: { draggable },
  props: {
    imgW: {
      type: Number,
      default: 148,
    },
    imgH: {
      type: Number,
      default: 148,
    },
    max: {
      type: Number,
      default: 15,
    },
    action: {
      type: String,
      default: reqUrl + "/oss/batch-upload",
    },
    value: {
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    param: {
      type: String,
      default: "",
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isLimit: {
      type: Number,
      required: false,
    },
    accept: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      imgList: [],
      isLoading: false,
      drag: false,
      dragOptions: {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      },
      dialogImageUrl: "",
      dialogVisible: false,
    };
  },
  computed: {
    imgListStyle() {
      return {
        width: this.imgW + "px",
        height: this.imgH + "px",
      };
    },
    isUploadIcon() {
      return this.isLoading ? "el-icon-loading" : "el-icon-plus";
    },
  },
  watch: {
    value(value) {
      this.transImgVal(value);
    },
  },
  mounted() {
    this.transImgVal(this.value);
  },
  methods: {
    transImgVal(value) {
      this.imgList = value ? value.split(",") : [];
    },
    updateList(list) {
      this.$emit("input", list.toString());
    },
    beforeUpload(file) {
      if (this.isVideo) {
        return true;
      }

      // const isValidFormat = ["image/jpeg", "image/png"].indexOf(file.type) > -1;
      // const isLt50M = file.size / 1024 / 1024 < 50; // 50M

      // if (!isValidFormat) {
      //   this.$message.error("图片只能是 JPG或PNG 格式!");
      // } else if (!isLt50M) {
      //   this.$message.error("图片大小不能超过 2MB!");
      // }

      const maxLt = this.max === 1 && this.imgList.length > 0;
      if (maxLt) {
        this.$message.error("只能上传一张图片，请删除后再上传!");
      }

      this.isLoading = true;

      // return isValidFormat && isLt50M && !maxLt;
      return !maxLt;
    },

    handleSuccess(res) {
      this.isLoading = false;
      this.imgList.push(res.data[0].url);
      this.$emit("input", this.imgList.toString());
    },

    handleError() {
      this.isLoading = false;
      this.$message.error("上传失败!");
    },

    handleRemove(file, index) {
      this.imgList.splice(index, 1);
      this.$emit("input", this.imgList.toString());
    },

    handlePreview(url) {
      this.dialogImageUrl = url;
      this.dialogVisible = true;
    },
  },
};
</script>
