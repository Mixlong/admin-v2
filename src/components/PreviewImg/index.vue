<template>
  <!-- 图片暂时及预览 -->
  <el-badge class="el-badge-box" :value="imgLen" :hidden="isBagdeShow || isDisBadge" :max="20">
    <el-image
      :class="{ hoverStyle: isHover }"
      :style="imgStyle"
      :src="previewImgList(1)"
      :fit="fit"
      scroll-container=".el-table__body-wrapper"
      :preview-src-list="previewImgList()"
    >
      <div
        slot="placeholder"
        class="image-slot flex align-center justify-center"
        :style="imgStyle"
      >
        <i class="el-icon-loading"></i>
      </div>
      <div
        slot="error"
        class="image-slot flex align-center justify-center"
        :style="imgStyle"
      >
        暂无
      </div>
    </el-image>
  </el-badge>
</template>

<script>
export default {
  name: "PreviewImg",
  props: {
    width: {
      type: String,
      default: "80px",
    },
    height: {
      type: String,
      default: "80px",
    },
    borderRadius: {
      type: String,
      default: "5px",
    },
    bg: {
      type: String,
      default: "#f5f7fa",
    },
    url: {
      type: String,
    },
    fit: {
      type: String,
      default: "contain",
    },
    isHover: {
      type: Boolean,
      default: false,
    },
    isDisBadge: {
      type: Boolean,
      default: true
    },
    srcList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    previewImgList() {
      return (num) => {
        if (this.url) {
          let imgUrl = this.url;
          const imgList = imgUrl.split(",");
          if (num === 1) {
            return imgList[0];
          } else {
            return imgList;
          }
        } else {
          return num === 1 ? "" : [];
        }
      };
    },
    imgStyle() {
      return {
        width: this.width,
        height: this.height,
        borderRadius: this.borderRadius,
        background: this.bg,
      };
    },
    imgLen() {
      const len = this.previewImgList();
      return len.length;
    },
    isBagdeShow() {
      return this.imgLen <= 1;
    }
  },
};
</script>
<style lang="scss" scoped>
.el-badge-box {
  margin-top: 10px;
  box-sizing: border-box;
}
.hoverStyle {
  transition: 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
}
</style>
