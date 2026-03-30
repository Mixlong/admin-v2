<style lang="scss">
@import "./index.scss";
</style>

<template>
  <div class="upload-queue">
    <draggable
      v-model="imgList"
      :disabled="isDisabled"
      :group="dragGroup"
      @start="onDragStart"
      @end="onDragEnd"
      @update="updateList(imgList)"
      @add="handleDragAdd"
      @remove="handleDragRemove"
      class="el-upload-list el-upload-list--picture-card"
      :class="{ 'empty-list': imgList.length === 0 && sortable, 'sortable-enabled': sortable }"
      :style="imgList.length === 0 && sortable ? { width: '120px', height: '120px', display: 'flex' } : {}"
      tag="div"
    >
      <transition-group>
        <div
          class="el-upload-list__item"
          :style="imgListStyle"
          v-for="(item, index) in imgList"
          :key="`${item}-${index}`"
        >
          <video class="video-box" v-if="isVideo" :src="item"></video>
          <el-image
            v-else
            :ref="`previewImage-${index}`"
            :src="item"
            :preview-src-list="imgList"
            :initial-index="index"
            fit="contain"
            class="el-upload-list__item-thumbnail"
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePreview(item, index)"
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
        <!-- 空状态占位元素，确保拖拽区域可见 -->
        <div
          v-if="imgList.length === 0 && sortable"
          key="empty-placeholder"
          class="empty-drop-zone"
          :style="{ minHeight: Math.max(imgH, 80) + 'px', width: '100%' }"
        >
        </div>
      </transition-group>
    </draggable>

    <el-upload
      v-if="imgList.length < max"
      :style="imgListStyle"
      class="el-upload el-upload--picture-card"
      :multiple="multiple"
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

    <el-dialog class="video-box" :visible.sync="dialogVisible" top="0" append-to-body>
      <video
        ref="videoRef"
        controls
        :controlslist="controlslist"
        disablePictureInPicture
        :src="dialogImageUrl"
      />
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
      default: 80,
    },
    imgH: {
      type: Number,
      default: 80,
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
      type: [String, Array],
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
      default: "",
    },
    sortable: {
      type: Boolean,
      default: false,
    },
    dragGroup: {
      type: [String, Object],
      default: () => ({
        name: "upload-sortable",
        pull: true,
        put: true,
        revertClone: false
      })
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
      controlslist: "nodownload",
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
    dialogVisible(dialogVisible) {
      if (!dialogVisible) {
        this.$refs.videoRef.pause();
      }
    },
  },
  mounted() {
    this.transImgVal(this.value);
  },
  methods: {
    transImgVal(value) {
      if (Array.isArray(value)) {
        this.imgList = value.filter(url => url);
      } else {
        this.imgList = value ? value.split(",").filter(url => url.trim()) : [];
      }
    },
    updateList(list) {
      this.$emit("input", list.toString());
    },
    onDragStart(evt) {
      this.drag = true;
      this.$emit('dragstart', evt);
    },
    onDragEnd(evt) {
      this.drag = false;
      this.$emit('dragend', evt);
    },
    handleDragAdd(evt) {
      // 跨组件拖拽添加文件时触发
      this.$nextTick(() => {
        this.$emit("input", this.imgList.toString());
        this.$emit("drag-add", evt);
      });
    },
    handleDragRemove(evt) {
      // 跨组件拖拽移除文件时触发
      this.$nextTick(() => {
        this.$emit("input", this.imgList.toString());
        this.$emit("drag-remove", evt);
      });
    },
    beforeUpload(file) {
      if (file?.name.indexOf("+") !== -1) {
        this.msgError("上传的文件名称不能包含‘+’字符");
        return false;
      }
      
      if (this.isVideo) {
        return this.handleCheckVideo(file);
      } else {
        return this.handleCheckImage(file);
      }
    },
    handleCheckVideo(file) {
      const isValidFormat = file.type.indexOf("video") !== -1;
      const isLt100 = file.size / 1024 / 1024 < 100;
      if (!isValidFormat) {
        this.msgError("视频格式不正确!");
        return false;
      } else if (!isLt100) {
        this.msgError("视频大小不能超过 100MB!");
        return false;
      } else {
        this.isLoading = true;
        return true;
      }
    },
    handleCheckImage(file) {
      const isValidFormat = file.type.indexOf("image") !== -1;
      const isLt50M = file.size / 1024 / 1024 < 50;
      const maxLt = this.max === 1 && this.imgList.length > 0;

      if (!isValidFormat) {
        this.msgError("图片格式不正确!");
        return false;
      } else if (!isLt50M) {
        this.msgError("图片大小不能超过 50MB!");
        return false;
      } else if (maxLt) {
        this.msgError("只能上传一张图片，请删除后再上传!");
        return false;
      } else {
        this.isLoading = true;
        return isValidFormat && isLt50M && !maxLt;
      }
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

    handlePreview(url, index) {
      if (this.isVideo) {
        this.dialogImageUrl = url;
        this.dialogVisible = true;
      } else {
        this.$nextTick(() => {
          let imageRef = this.$refs[`previewImage-${index}`];
          if (Array.isArray(imageRef)) {
            imageRef = imageRef[0];
          }
          const targetImg = imageRef && imageRef.$el
            ? imageRef.$el.querySelector('img')
            : null;
          if (targetImg) {
            targetImg.click();
          }
        });
      }
    },
  },
};
</script>
