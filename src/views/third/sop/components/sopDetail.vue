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
      <el-carousel-item v-for="(item, index) in detailInfo" :key="index" :label="index + 1" name="index">
        <el-image class="course-img" :src="item.file" :preview-src-list="[item.file]" fit="cover" />
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
      detailInfo: []
    };
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
  },
};
</script>

<style lang="scss">
.sop-detail-box {
  .el-dialog__header {
    display: none;
  }
  .el-carousel {
    .el-carousel__container {
      height: 500px;
      .el-carousel__arrow {
        background-color: rgb(32,48,65);
        font-size: 16px;
      }
      .el-carousel__item {
        text-align: center;
        padding-bottom: 35px;
        .course-img {
          height: inherit;
        }
        .sop-intro-box {
          .sop-intro {
            color: #666;
          }
        }
      }
    }

    .el-carousel__indicators {
      margin-top: 25px;
    }
  }
}
</style>