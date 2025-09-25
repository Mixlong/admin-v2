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
    <el-carousel
      v-if="visible"
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
    };
  },
  watch: {
    detailId: {
      immediate: true,
      handler(newId) {
        if (newId && this.visible) {
          this.getSopInfo(newId);
        }
      }
    },
    visible(newVal) {
      if (newVal && this.detailId) {
        this.getSopInfo(this.detailId);
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    async getSopInfo(detailId) {
      try {
        const { data } = await sopInfo(detailId);
        this.detailInfo = data;
      } catch (error) {
        console.error(error);
      }
    },
    /** 判断是否为视频文件 */
    isVideoFile(url) {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
      const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
      return videoExtensions.includes(extension);
    },
    /** 获取图片文件列表（用于预览） */
    getImageUrls() {
      return this.detailInfo
        .filter(item => item.file && !this.isVideoFile(item.file))
        .map(item => item.file);
    },
  },
};
</script>

<style lang="scss">
.sop-detail-box {
  .el-dialog__header {
    display: none;
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