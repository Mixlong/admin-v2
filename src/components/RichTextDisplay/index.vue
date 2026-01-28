<template>
  <div class="rich-text-display" v-if="content">
    <div
      ref="richTextContent"
      v-html="sanitizedContent"
      class="rich-text-content"
      :style="contentStyle"
      @click="handleImageClick"
    ></div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="imageList"
      :initial-index="currentImageIndex"
      :on-close="closeViewer"
      :z-index="9999"
    />
  </div>
  <span v-else class="no-content">{{ placeholder }}</span>
</template>

<script>
import ElImageViewer from "element-ui/packages/image/src/image-viewer";

export default {
  name: "RichTextDisplay",
  components: {
    ElImageViewer,
  },
  props: {
    content: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "-",
    },
    maxHeight: {
      type: String,
      default: "none",
    },
    maxWidth: {
      type: String,
      default: "100%",
    },
    scrollable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showViewer: false,
      imageList: [],
      currentImageIndex: 0,
    };
  },
  computed: {
    sanitizedContent() {
      if (!this.content) return "";

      // 基本的HTML清理，移除潜在的危险标签和属性
      let cleaned = this.content
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
        .replace(/<object[^>]*>.*?<\/object>/gi, "")
        .replace(/<embed[^>]*>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/javascript:/gi, "");

      return cleaned;
    },
    contentStyle() {
      const style = {
        maxWidth: this.maxWidth,
      };

      if (this.maxHeight !== "none") {
        style.maxHeight = this.maxHeight;
        if (this.scrollable) {
          style.overflowY = "auto";
        }
      }

      return style;
    },
  },
  methods: {
    handleImageClick(e) {
      if (e.target.tagName === "IMG") {
        // 获取所有图片的 src
        const images = this.$refs.richTextContent.querySelectorAll("img");
        this.imageList = Array.from(images).map((img) => img.src);

        // 找到点击的是第几张图片
        this.currentImageIndex = Array.from(images).indexOf(e.target);

        // 显示图片预览
        this.showViewer = true;
      }
    },
    closeViewer() {
      this.showViewer = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.rich-text-display {
  .rich-text-content {
    display: block;
    line-height: 1.6;
    min-height: 1em;
    text-align: left;
    color: #303133;
    word-break: break-word;

    ::v-deep {
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 4px 0;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.85;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;

      &:hover {
        background-color: #c0c4cc;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
    }
  }
}

.no-content {
  color: #c0c4cc;
  font-style: italic;
}
</style>

<style lang="scss">
// 全局样式：确保图片预览器在最顶层（不使用 scoped）
.el-image-viewer__wrapper {
  z-index: 9999 !important;
}
</style>
