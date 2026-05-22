<template>
  <div class="file-display">
    <!-- 单个文件模式 -->
    <template v-if="!parsedFileList">
      <div v-if="fileUrl" class="file-wrapper">
        <div class="file-row">
          <i :class="getFileIcon(fileUrl)"></i>
          <span class="file-name">{{ displayFileName }}</span>
          <div class="file-actions">
            <el-link v-if="showPreview" type="primary" :underline="false" @click="handlePreview(fileUrl, displayFileName)" style="font-size: 12px;">
              <i class="el-icon-view"></i> 预览
            </el-link>
            <el-link type="primary" :underline="false" :style="{ marginLeft: showPreview ? '10px' : '0', fontSize: '12px' }" @click="handleDownload(fileUrl)">
              <i class="el-icon-download"></i> 下载
            </el-link>
          </div>
        </div>
      </div>
      <span v-else class="no-file">{{ emptyText }}</span>
    </template>

    <!-- 文件列表模式 -->
    <template v-else>
      <div class="file-wrapper">
        <div v-for="(file, index) in parsedFileList" :key="index" class="file-row" :class="{ 'border-bottom': index < parsedFileList.length - 1 }">
          <i :class="getFileIcon(file.url)"></i>
          <span class="file-name">{{ file.name || getFileNameFromUrl(file.url) }}</span>
          <div class="file-actions">
            <el-link v-if="showPreview" type="primary" :underline="false" @click="handlePreview(file.url, file.name)" style="font-size: 12px;">
              <i class="el-icon-view"></i> 预览
            </el-link>
            <el-link type="primary" :underline="false" :style="{ marginLeft: showPreview ? '10px' : '0', fontSize: '12px' }" @click="handleDownload(file.url)">
              <i class="el-icon-download"></i> 下载
            </el-link>
          </div>
        </div>
      </div>
    </template>

    <!-- 图片预览（使用el-image的预览功能） -->
    <el-image
      v-show="false"
      ref="imagePreview"
      :src="currentPreviewUrl"
      :preview-src-list="currentImageList"
    />

    <!-- 非图片文件预览对话框 -->
    <FilePreview :visible.sync="previewVisible" :file-url="currentPreviewUrl" :file-name="currentPreviewName" />
  </div>
</template>

<script>
export default {
  name: "FileDisplay",
  components: {
    FilePreview: () => import(/* webpackChunkName: "file-preview" */ "@/components/FilePreview")
  },
  props: {
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileList: { type: Array, default: null },
    showPreview: { type: Boolean, default: true },
    emptyText: { type: String, default: "暂无文件" },
  },
  data() {
    return {
      previewVisible: false,
      currentPreviewUrl: "",
      currentPreviewName: "",
      currentImageList: [],
    };
  },
  computed: {
    displayFileName() {
      return this.fileName || this.getFileNameFromUrl(this.fileUrl);
    },
    parsedFileList() {
      if (this.fileList && this.fileList.length > 0) return this.fileList;
      if (this.fileUrl) {
        const urls = this.fileUrl.split(',').map(url => url.trim()).filter(url => url);
        if (urls.length > 1) return urls.map(url => ({ url }));
      }
      return null;
    },
    imagePreviewList() {
      if (!this.parsedFileList) return this.isImage(this.fileUrl) ? [this.fileUrl] : [];
      return this.parsedFileList.filter(f => this.isImage(f.url)).map(f => f.url);
    },
  },
  methods: {
    isImage(url) {
      if (!url) return false;
      const ext = url.split('?')[0].split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
    },
    getFileIcon(url) {
      if (this.isImage(url)) return 'el-icon-picture-outline';
      return 'el-icon-document';
    },
    getFileNameFromUrl(url) {
      if (!url) return "文件";
      try {
        const pathname = new URL(url).pathname;
        return decodeURIComponent(pathname.substring(pathname.lastIndexOf("/") + 1)) || "文件";
      } catch {
        const parts = url.split("/");
        return parts[parts.length - 1] || "文件";
      }
    },
    handlePreview(url, name) {
      if (!url) return this.$message.warning("文件地址不存在");
      
      // 图片使用el-image预览
      if (this.isImage(url)) {
        this.currentPreviewUrl = url;
        this.currentImageList = this.imagePreviewList.length > 0 ? this.imagePreviewList : [url];
        this.$nextTick(() => {
          this.$refs.imagePreview.clickHandler();
        });
        this.$emit("preview", url);
        return;
      }
      
      // 非图片使用弹窗预览
      this.currentPreviewUrl = url;
      this.currentPreviewName = name || this.getFileNameFromUrl(url);
      this.previewVisible = true;
      this.$emit("preview", url);
    },
    handleDownload(url) {
      if (!url) return this.$message.warning("文件地址不存在");
      this.urlDownload(url);
    },
  },
};
</script>

<style lang="scss" scoped>
.file-display {
  .file-wrapper {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f5f7fa;

    .file-row {
      display: flex;
      align-items: center;
      padding: 8px 12px;

      &.border-bottom {
        border-bottom: 1px solid #e4e7ed;
      }

      .el-icon-document,
      .el-icon-picture-outline {
        font-size: 18px;
        color: #409eff;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .file-name {
        flex: 1;
        font-size: 14px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-actions {
        display: flex;
        align-items: center;
        margin-left: 10px;
        flex-shrink: 0;
      }
    }
  }

  .no-file {
    color: #909399;
    font-size: 14px;
  }
}
</style>
