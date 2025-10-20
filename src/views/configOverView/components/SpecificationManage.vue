<template>
  <el-dialog 
    :title="viewOnly ? '产品图纸查看' : '产品图纸管理'" 
    :visible.sync="dialogVisible" 
    width="800px"
    :close-on-click-modal="false"
    append-to-body
    top="0vh"
    custom-class="specification-manage-dialog"
  >
    <div class="specification-manage">
      <!-- 图片列表 -->
      <div v-if="imageList.length > 0" class="image-list">
        <div 
          v-for="(image, index) in imageList" 
          :key="index" 
          class="image-item"
        >
          <!-- 删除按钮 - 右上角X (仅编辑模式显示) -->
          <div v-if="!viewOnly" class="delete-icon" @click="handleDeleteImage(index)">
            <i class="el-icon-close"></i>
          </div>
          
          <div class="image-wrapper">
            <el-image 
              :src="image" 
              fit="contain"
              :preview-src-list="imageList"
              :initial-index="index"
            >
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="el-icon-picture-outline"></i>
        <p>暂无产品图纸</p>
      </div>
      
      <!-- 上传区域 (仅编辑模式显示) -->
      <div v-if="!viewOnly" class="upload-area">
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*,application/pdf" 
          style="display: none"
          multiple
          @change="handleFileSelect"
        />
        <el-button 
          type="primary" 
          icon="el-icon-upload" 
          :loading="uploading"
          @click="$refs.fileInput.click()"
        >
          {{ uploading ? '上传中...' : '上传图纸' }}
        </el-button>
        <div class="upload-tip">
          支持上传图片（JPG、PNG、GIF、BMP、WebP、SVG）或PDF文件，单个文件不超过50MB
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ viewOnly ? '关 闭' : '取 消' }}</el-button>
      <el-button 
        v-if="!viewOnly"
        type="primary" 
        @click="handleSave" 
        :loading="saving"
        :disabled="!hasChanges"
      >
        保 存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SpecificationManage',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentRow: {
      type: Object,
      default: null
    },
    // 接收父组件传入的上传方法
    uploadImageMethod: {
      type: Function,
      default: null
    },
    uploadPdfMethod: {
      type: Function,
      default: null
    },
    // 查看模式（只读）
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploading: false,
      saving: false,
      imageList: [], // 当前图片列表
      originalImageList: [] // 原始图片列表（用于对比是否有更改）
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    // 判断是否有更改
    hasChanges() {
      return JSON.stringify(this.imageList) !== JSON.stringify(this.originalImageList);
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadImages();
      }
    }
  },
  methods: {
    // 加载图片列表
    loadImages() {
      if (!this.currentRow || !this.currentRow.specification) {
        this.imageList = [];
        this.originalImageList = [];
        return;
      }
      
      // 解析图片URL（可能是逗号分隔的多个URL）
      const specStr = this.currentRow.specification;
      const cleanStr = specStr.replace(/`/g, '').trim();
      
      if (cleanStr.includes(',')) {
        this.imageList = cleanStr.split(',').map(url => url.trim()).filter(url => url);
      } else if (cleanStr) {
        this.imageList = [cleanStr];
      } else {
        this.imageList = [];
      }
      
      // 保存原始列表
      this.originalImageList = [...this.imageList];
      
      console.log('📷 加载图片列表:', this.imageList);
    },
    
    // 删除图片
    handleDeleteImage(index) {
      this.imageList.splice(index, 1);
      this.$message.success('删除成功，请点击保存按钮确认更改');
    },
    
    // 处理文件选择
    async handleFileSelect(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      this.uploading = true;
      
      try {
        for (const file of files) {
          await this.uploadSingleFile(file);
        }
      } finally {
        this.uploading = false;
        // 清空文件输入
        event.target.value = '';
      }
    },
    
    // 上传单个文件
    async uploadSingleFile(file) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      // 支持的图片格式
      const supportedImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
        'image/bmp', 'image/webp', 'image/svg+xml'
      ];
      
      // 检查文件大小（限制为50MB）
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$message.error(`${file.name} 文件大小不能超过50MB`);
        return;
      }
      
      try {
        let imageUrl = '';
        
        // 判断是PDF还是图片
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          // PDF文件：调用父组件的PDF上传方法
          if (this.uploadPdfMethod) {
            imageUrl = await this.uploadPdfMethod(file);
          } else {
            this.$message.error('PDF上传方法未定义');
            return;
          }
        } else if (supportedImageTypes.includes(fileType) || 
                   ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].some(ext => fileName.endsWith(ext))) {
          // 图片文件：调用父组件的图片上传方法
          if (this.uploadImageMethod) {
            imageUrl = await this.uploadImageMethod(file);
          } else {
            this.$message.error('图片上传方法未定义');
            return;
          }
        } else {
          this.$message.error(`${file.name} 不支持的文件格式`);
          return;
        }
        
        // 处理返回的URL
        if (imageUrl) {
          // 可能返回多个URL（逗号分隔）
          const urls = imageUrl.split(',').map(url => url.trim()).filter(url => url);
          this.imageList.push(...urls);
          
          if (urls.length > 1) {
            this.$message.success(`${file.name} 上传成功，共生成${urls.length}张图片`);
          } else {
            this.$message.success(`${file.name} 上传成功`);
          }
        } else {
          this.$message.error(`${file.name} 上传失败：未返回图片地址`);
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.$message.error(`${file.name} 上传失败: ` + (error.message || '未知错误'));
      }
    },
    
    // 保存
    handleSave() {
      if (!this.hasChanges) {
        this.$message.info('没有更改');
        return;
      }
      
      if (this.imageList.length === 0) {
        this.$confirm('确定要删除所有图片吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doSave();
        }).catch(() => {});
      } else {
        this.doSave();
      }
    },
    
    // 执行保存
    doSave() {
      const imageUrl = this.imageList.join(',');
      this.$emit('save', imageUrl);
      this.dialogVisible = false;
    },
    
    // 关闭
    handleClose() {
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.specification-manage {
  display: flex;
  flex-direction: column;
  max-height: calc(80vh - 120px); /* 限制最大高度 */
  
  .image-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 一行4个 */
    gap: 16px;
    margin-bottom: 20px;
    max-height: calc(80vh - 240px); /* 为上传区域和空状态预留空间 */
    overflow-y: auto; /* 允许垂直滚动 */
    padding-right: 8px; /* 为滚动条留出空间 */
    
    .image-item {
      border: 1px solid #EBEEF5;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s;
      position: relative; /* 为右上角X定位 */
      
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
      
      /* 右上角删除X */
      .delete-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        background: #F56C6C; /* 红色背景 */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s;
        
        i {
          color: #FFF;
          font-size: 14px;
          font-weight: bold;
        }
        
        &:hover {
          background: #F78989; /* hover时变浅一点 */
          transform: scale(1.1);
        }
      }
      
      .image-wrapper {
        width: 100%;
        height: 160px; /* 调整高度适应4列布局 */
        background: #F5F7FA;
        display: flex;
        align-items: center;
        justify-content: center;
        
        ::v-deep .el-image {
          width: 100%;
          height: 100%;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
        
        .image-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #C0C4CC;
          font-size: 40px;
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    flex-shrink: 0; /* 防止被压缩 */
    
    i {
      font-size: 60px;
      margin-bottom: 16px;
      display: block;
    }
    
    p {
      font-size: 14px;
      margin: 0;
    }
  }
  
  .upload-area {
    border-top: 1px dashed #DCDFE6;
    padding-top: 20px;
    text-align: center;
    flex-shrink: 0; /* 防止被压缩 */
    margin-top: auto; /* 自动推到底部 */
    
    .upload-tip {
      margin-top: 10px;
      font-size: 12px;
      color: #909399;
    }
  }
}

/* 对话框整体样式优化 */
::v-deep .specification-manage-dialog {
  .el-dialog__body {
    max-height: 80vh;
    overflow: hidden; /* 防止对话框body滚动，让内部元素自己滚动 */
    padding: 20px;
  }
}

/* 自定义滚动条样式 */
.image-list {
  /* WebKit浏览器滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>

