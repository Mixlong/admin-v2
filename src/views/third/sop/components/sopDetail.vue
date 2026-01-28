<template>
  <el-dialog
    class="sop-detail-box"
    :visible="visible"
    width="1000px"
    append-to-body
    center
    top="0vh"
    :show-close="false"
    @close="close"
  >
    <!-- 封面展示区域 -->
    <div v-if="topImgList.length > 0" class="top-img-section">
      <div class="top-img-header">
        <i class="el-icon-picture-outline"></i>
        <span>封面</span>
      </div>
      <div class="top-img-content">
        <el-image
          v-for="(img, idx) in topImgList"
          :key="idx"
          :src="img"
          :preview-src-list="topImgList"
          fit="contain"
          class="top-img"
        />
      </div>
    </div>

    <!-- 排拉图展示区域 -->
    <div v-if="sortImgList.length > 0" class="sort-img-section">
      <div class="sort-img-header">
        <i class="el-icon-s-grid"></i>
        <span>排拉图</span>
      </div>
      <div class="sort-img-content">
        <el-image
          v-for="(img, idx) in sortImgList"
          :key="idx"
          :src="img"
          :preview-src-list="sortImgList"
          fit="contain"
          class="sort-img"
        />
      </div>
    </div>

    <!-- 工位轮播 -->
    <el-carousel
      v-if="visible && detailInfo.length > 0"
      ref="carousel"
      arrow="always"
      trigger="click"
      :autoplay="false"
      indicator-position="outside"
    >
      <el-carousel-item
        v-for="(item, index) in detailInfo"
        :key="index"
        :label="index + 1"
        name="index"
      >
        <!-- 视频文件显示 -->
        <video
          v-if="item.file && isVideoFile(item.file)"
          :src="item.file"
          class="course-video"
          controls
          preload="metadata"
          @click.stop
        >
          您的浏览器不支持视频播放
        </video>
        <!-- 图片文件显示 -->
        <el-image
          v-else-if="item.file && !isVideoFile(item.file)"
          class="course-img"
          :src="item.file"
          :preview-src-list="getImageUrls()"
          fit="cover"
        />
        <div class="sop-intro-box">
          <p class="sop-intro">{{ item.remark }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>
  </el-dialog>
</template>

<script>
import { sopInfo } from "@/api/third/testApi";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    detailId: {
      type: String,
      default: "",
    },
    rootClassify: Array,
    directionLabel: Function,
  },
  data() {
    return {
      flag: true,
      detailInfo: [],
      topImgList: [], // 封面图列表
      sortImgList: [], // 排拉图列表
    };
  },
  watch: {
    detailId: {
      immediate: true,
      handler(newId) {
        if (newId && this.visible) {
          this.getSopInfo(newId);
        }
      },
    },
    visible(newVal) {
      if (newVal && this.detailId) {
        this.getSopInfo(this.detailId);
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
      this.topImgList = [];
      this.sortImgList = [];
    },
    async getSopInfo(detailId, rowData) {
      try {
        const { data } = await sopInfo(detailId);
        this.detailInfo = data;
        // 如果传入了rowData，从中获取封面和排拉图（逗号分隔的多图）
        if (rowData && rowData.topImg) {
          this.topImgList = rowData.topImg
            .split(",")
            .filter((url) => url.trim());
        } else {
          this.topImgList = [];
        }

        if (rowData && rowData.sortImg) {
          this.sortImgList = rowData.sortImg
            .split(",")
            .filter((url) => url.trim());
        } else {
          this.sortImgList = [];
        }
      } catch (error) {
        console.error(error);
      }
    },
    /** 判断是否为视频文件 */
    isVideoFile(url) {
      if (!url) return false;
      const videoExtensions = [
        ".mp4",
        ".avi",
        ".mov",
        ".wmv",
        ".flv",
        ".webm",
        ".mkv",
        ".m4v",
      ];
      const extension = url.toLowerCase().substring(url.lastIndexOf("."));
      return videoExtensions.includes(extension);
    },
    /** 获取图片文件列表（用于预览） */
    getImageUrls() {
      return this.detailInfo
        .filter((item) => item.file && !this.isVideoFile(item.file))
        .map((item) => item.file);
    },
  },
};
</script>

<style lang="scss">
.sop-detail-box {
  .el-dialog__header {
    display: none;
  }

  // 封面区域样式
  .top-img-section {
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;

    .top-img-header {
      background: #f5f7fa;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }

    .top-img-content {
      padding: 15px;
      background: #fff;
      display: flex;
      gap: 10px;
      overflow-x: auto;
      white-space: nowrap;

      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-track {
        background: #f5f7fa;
      }

      .top-img {
        flex-shrink: 0;
        width: 200px;
        height: 150px;
        cursor: pointer;
        border: 1px solid #eee;
        border-radius: 4px;
      }
    }
  }

  // 排拉图区域样式
  .sort-img-section {
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;

    .sort-img-header {
      background: #f5f7fa;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }

    .sort-img-content {
      padding: 15px;
      background: #fff;
      display: flex;
      gap: 10px;
      overflow-x: auto;
      white-space: nowrap;

      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-track {
        background: #f5f7fa;
      }

      .sort-img {
        flex-shrink: 0;
        width: 150px;
        height: 150px;
        cursor: pointer;
        border: 1px solid #eee;
        border-radius: 4px;
      }
    }
  }

  .el-carousel {
    display: flex;
    flex-direction: column;
    .el-carousel__container {
      height: 500px;
      .el-carousel__arrow {
        background-color: rgb(32, 48, 65);
        font-size: 16px;
      }
      .el-carousel__item {
        text-align: center;
        padding-bottom: 35px;
        .course-img {
          height: inherit;
          max-width: 100%;
          object-fit: contain;
        }
        .course-video {
          height: inherit;
          max-width: 100%;
          max-height: 450px;
          object-fit: contain;
          border-radius: 4px;
          background: #000;
        }
        .sop-intro-box {
          .sop-intro {
            color: #666;
            margin-top: 15px;
            padding: 0 20px;
            line-height: 1.6;
          }
        }
      }
    }

    // .el-carousel__indicators {
    //   margin: 25px auto 0;
    //   display: flex;
    //   max-width: 500px;
    //   overflow: hidden;
    //   overflow-x: auto;
    //   scroll-behavior: smooth;
    //   &::-webkit-scrollbar {
    //     height: 0;
    //   }

    //   &:hover {
    //     &::-webkit-scrollbar {
    //       height: 8px;
    //     }
    //   }
    //   .el-carousel__indicator {
    //     .el-carousel__button {
    //       width: 60px;
    //       white-space: nowrap;
    //     }
    //   }
    // }
  }
}
</style>
