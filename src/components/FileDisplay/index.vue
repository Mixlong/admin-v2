<template>
  <div class="file-display">
    <!-- 单个文件模式 -->
    <template v-if="!fileList || fileList.length === 0">
      <div v-if="fileUrl" class="file-item">
        <i class="el-icon-document"></i>
        <span class="file-name">{{ displayFileName }}</span>
        <div class="file-actions">
          <el-link 
            v-if="showPreview"
            type="primary"
            :underline="false"
            @click="handlePreview(fileUrl, displayFileName)"
            style="font-size: 12px;"
          >
            <i class="el-icon-view"></i> 预览
          </el-link>
          <el-link 
            type="primary"
            :underline="false"
            :style="{ marginLeft: showPreview ? '10px' : '0', fontSize: '12px' }"
            @click="handleDownload(fileUrl)"
          >
            <i class="el-icon-download"></i> 下载
          </el-link>
        </div>
      </div>
      <span v-else class="no-file">{{ emptyText }}</span>
    </template>

    <!-- 文件列表模式 -->
    <template v-else>
      <div v-for="(file, index) in fileList" :key="index" class="file-item">
        <i class="el-icon-document"></i>
        <span class="file-name">{{ file.name || getFileNameFromUrl(file.url) }}</span>
        <div class="file-actions">
          <el-link 
            v-if="showPreview"
            type="primary"
            :underline="false"
            @click="handlePreview(file.url, file.name)"
            style="font-size: 12px;"
          >
            <i class="el-icon-view"></i> 预览
          </el-link>
          <el-link 
            type="primary"
            :underline="false"
            :style="{ marginLeft: showPreview ? '10px' : '0', fontSize: '12px' }"
            @click="handleDownload(file.url)"
          >
            <i class="el-icon-download"></i> 下载
          </el-link>
        </div>
      </div>
    </template>

    <!-- 文件预览对话框 -->
    <FilePreview
      :visible.sync="previewVisible"
      :file-url="currentPreviewUrl"
      :file-name="currentPreviewName"
    />
  </div>
</template>

<script>
import FilePreview from "@/components/FilePreview";

export default {
  name: "FileDisplay",
  components: {
    FilePreview,
  },
  props: {
    // 文件 URL（单个文件模式）
    fileUrl: {
      type: String,
      default: "",
    },
    // 文件名（可选，如果不提供则从 URL 中提取）
    fileName: {
      type: String,
      default: "",
    },
    // 文件列表（多文件模式）格式：[{ url: '', name: '' }]
    fileList: {
      type: Array,
      default: null,
    },
    // 是否显示预览按钮
    showPreview: {
      type: Boolean,
      default: true,
    },
    // 空状态文本
    emptyText: {
      type: String,
      default: "暂无文件",
    },
  },
  data() {
    return {
      previewVisible: false,
      currentPreviewUrl: "",
      currentPreviewName: "",
    };
  },
  computed: {
    // 显示的文件名
    displayFileName() {
      if (this.fileName) {
        return this.fileName;
      }
      return this.getFileNameFromUrl(this.fileUrl);
    },
  },
  methods: {
    // 从 URL 中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return "文件";
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = pathname.substring(pathname.lastIndexOf("/") + 1);
        return decodeURIComponent(fileName) || "文件";
      } catch (e) {
        // 如果不是完整 URL，直接从路径提取
        const parts = url.split("/");
        return parts[parts.length - 1] || "文件";
      }
    },
    // 预览文件
    handlePreview(url, name) {
      if (!url) {
        this.$message.warning("文件地址不存在");
        return;
      }
      this.currentPreviewUrl = url;
      this.currentPreviewName = name || this.getFileNameFromUrl(url);
      this.previewVisible = true;
      this.$emit("preview", url);
    },
    // 下载文件
    handleDownload(url) {
      if (!url) {
        this.$message.warning("文件地址不存在");
        return;
      }
      this.urlDownload(url);
    },
  },
};
</script>

<style lang="scss" scoped>
.file-display {
  .file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #ecf5ff;
      border-color: #b3d8ff;
    }

    .el-icon-document {
      font-size: 18px;
      color: #409eff;
      margin-right: 8px;
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
    }
  }

  .no-file {
    color: #909399;
    font-size: 14px;
  }
}
</style>
