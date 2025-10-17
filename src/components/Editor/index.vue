<template>
  <div>
    <!-- 图片上传 -->
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
      ref="upload"
      v-if="this.type == 'url'"
    >
    </el-upload>
    <!-- 文件上传 -->
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUploadFile"
      :on-success="handleUploadFileSuccess"
      :on-error="handleUploadFileError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
      ref="fileUpload"
      v-if="this.type == 'url'"
    >
    </el-upload>
    <div class="editor" ref="editor" :style="styles"></div>
  </div>
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import reqUrl from "@/utils/requestUrl";
import uploadIcon from "@/assets/image/358.gif";

export default {
  name: "Editor",
  props: {
    /* 编辑器的内容 */
    value: {
      type: String,
      default: "",
    },
    /* 高度 */
    height: {
      type: Number,
      default: null,
    },
    /* 最小高度 */
    minHeight: {
      type: Number,
      default: null,
    },
    /* 只读 */
    readOnly: {
      type: Boolean,
      default: false,
    },
    // 上传文件大小限制(MB)
    fileSize: {
      type: Number,
      default: 5,
    },
    /* 类型（base64格式、url格式） */
    type: {
      type: String,
      default: "url",
    },
    /* 上传请求头 */
    headers: {
      type: Object,
      default: () => ({})
    },
    /* placeholder 提示文字 */
    placeholder: {
      type: String,
      default: "请输入内容"
    },
    /* 自定义工具栏配置 */
    toolbar: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      uploadUrl: reqUrl + "/oss/batch-upload", // 上传的图片服务器地址
      Quill: null,
      currentValue: "",
      options: {
        theme: "snow",
        bounds: document.body,
        debug: "warn",
        modules: {
          // 工具栏配置
          toolbar: this.toolbar || [
            ["bold", "italic", "underline", "strike"],       // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"],                    // 引用  代码块
            [{ list: "ordered" }, { list: "bullet" }],       // 有序、无序列表
            [{ indent: "-1" }, { indent: "+1" }],            // 缩进
            [{ size: ["small", false, "large", "huge"] }],   // 字体大小
            [{ header: [1, 2, 3, 4, 5, 6, false] }],         // 标题
            [{ color: [] }, { background: [] }],             // 字体颜色、字体背景颜色
            [{ align: [] }],                                 // 对齐方式
            ["clean"],                                       // 清除文本格式
            ["link", "image", "video"]                       // 链接、图片、视频
          ]
        },
        placeholder: this.placeholder,
        readOnly: this.readOnly,
      },
    };
  },
  computed: {
    styles() {
      let style = {};
      if (this.minHeight) {
        style.minHeight = `${this.minHeight}px`;
      }
      if (this.height) {
        style.height = `${this.height}px`;
      }
      return style;
    },
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          this.currentValue = val === null ? "" : val;
          if (this.Quill) {
            this.Quill.pasteHTML(this.currentValue);
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.Quill = null;
  },
  methods: {
    init() {
      const editor = this.$refs.editor;
      this.Quill = new Quill(editor, this.options);
      // 如果设置了上传地址则自定义图片上传事件
      if (this.type == 'url') {
        let toolbar = this.Quill.getModule("toolbar");
        toolbar.addHandler("image", (value) => {
          this.uploadType = "image";
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click();
          } else {
            this.quill.format("image", false);
          }
        });
      }
      
      // 添加自定义文件上传按钮
      this.$nextTick(() => {
        const toolbarContainer = this.$refs.editor.previousSibling;
        if (toolbarContainer && toolbarContainer.classList.contains('ql-toolbar')) {
          // 创建文件上传按钮
          const fileButton = document.createElement('button');
          fileButton.type = 'button';
          fileButton.className = 'ql-file';
          fileButton.innerHTML = `<img src="${uploadIcon}" style="width: 14px; height: 14px; display: block;" alt="上传" />`;
          fileButton.title = '上传文件（图片、PDF、Word、Excel等）';
          
          // 绑定点击事件
          fileButton.addEventListener('click', () => {
            console.log('文件上传按钮被点击');
            if (this.$refs.fileUpload) {
              // 触发隐藏的文件上传输入框
              const input = this.$refs.fileUpload.$el.querySelector('input[type="file"]');
              if (input) {
                input.click();
              } else {
                console.error('找不到文件上传输入框');
              }
            }
          });
          
          // 将按钮添加到工具栏
          toolbarContainer.appendChild(fileButton);
        }
      });
      
      this.Quill.pasteHTML(this.currentValue);
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        const html = this.$refs.editor.children[0].innerHTML;
        const text = this.Quill.getText();
        const quill = this.Quill;
        this.currentValue = html;
        this.$emit("input", html);
        this.$emit("on-change", { html, text, quill });
      });
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        this.$emit("on-text-change", delta, oldDelta, source);
      });
      this.Quill.on("selection-change", (range, oldRange, source) => {
        this.$emit("on-selection-change", range, oldRange, source);
      });
      this.Quill.on("editor-change", (eventName, ...args) => {
        this.$emit("on-editor-change", eventName, ...args);
      });
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$message.error(`上传文件大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      return true;
    },
    handleUploadSuccess(res, file) {
      // 获取富文本组件实例
      let quill = this.Quill;
      // 如果上传成功
      if (res.code == 200 || res.code == 0) {
        // 获取光标所在位置
        let length = quill.getSelection().index;
        // 获取图片URL - 兼容不同的返回格式
        let imageUrl = '';
        if (Array.isArray(res.data)) {
          // 数组格式：res.data[0].url
          imageUrl = res.data[0]?.url;
        } else if (res.data?.url) {
          // 对象格式：res.data.url
          imageUrl = res.data.url;
        } else if (res.url) {
          // 直接返回url：res.url
          imageUrl = res.url;
        }
        
        if (imageUrl) {
          // 插入图片
          quill.insertEmbed(length, "image", imageUrl);
          // 调整光标到最后
          quill.setSelection(length + 1);
          this.$message.success('图片上传成功');
        } else {
          this.$message.error('获取图片地址失败');
          console.error('上传响应数据格式异常:', res);
        }
      } else {
        this.$message.error(res.msg || '图片上传失败');
      }
    },
    handleUploadError() {
      this.$message.error("图片插入失败");
    },
    
    // 文件上传前校检
    handleBeforeUploadFile(file) {
      // 校检文件大小（默认50MB）
      const maxSize = 50;
      const isLt = file.size / 1024 / 1024 < maxSize;
      if (!isLt) {
        this.$message.error(`上传文件大小不能超过 ${maxSize} MB!`);
        return false;
      }
      
      // 获取文件扩展名
      const fileName = file.name;
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      
      // 支持的文件类型
      const allowedTypes = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'zip', 'rar', '7z',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'
      ];
      
      if (!allowedTypes.includes(fileExt)) {
        this.$message.warning(`不支持上传 .${fileExt} 格式的文件`);
      }
      
      return true;
    },
    
    // 文件上传成功
    handleUploadFileSuccess(res, file) {
      let quill = this.Quill;
      
      if (res.code == 200 || res.code == 0) {
        let length = quill.getSelection()?.index || 0;
        
        // 获取文件URL
        let fileUrl = '';
        if (Array.isArray(res.data)) {
          fileUrl = res.data[0]?.url;
        } else if (res.data?.url) {
          fileUrl = res.data.url;
        } else if (res.url) {
          fileUrl = res.url;
        }
        
        if (fileUrl) {
          // 获取文件名
          const fileName = file.name;
          const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
          
          // 判断是否为图片
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
          
          if (imageExts.includes(fileExt)) {
            // 图片直接插入
            quill.insertEmbed(length, "image", fileUrl);
            quill.setSelection(length + 1);
          } else {
            // 其他文件插入为链接
            quill.insertText(length, fileName, 'link', fileUrl);
            quill.setSelection(length + fileName.length);
          }
          
          this.$message.success(`文件上传成功：${fileName}`);
        } else {
          this.$message.error('获取文件地址失败');
          console.error('上传响应数据格式异常:', res);
        }
      } else {
        this.$message.error(res.msg || '文件上传失败');
      }
    },
    
    // 文件上传失败
    handleUploadFileError(err) {
      this.$message.error("文件上传失败");
      console.error('文件上传失败:', err);
    },
  },
};
</script>

<style>
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}

/* 文件上传按钮样式 */
.ql-snow .ql-toolbar button.ql-file {
  width: 28px;
  height: 28px;
}

.ql-snow .ql-toolbar button.ql-file svg {
  width: 18px;
  height: 18px;
}

.ql-snow .ql-toolbar button.ql-file:hover {
  color: #06c;
}

.ql-snow .ql-toolbar button.ql-file .ql-stroke {
  stroke: #444;
}

.ql-snow .ql-toolbar button.ql-file:hover .ql-stroke {
  stroke: #06c;
}

.ql-snow .ql-toolbar button.ql-file .ql-fill {
  fill: #444;
}

.ql-snow .ql-toolbar button.ql-file:hover .ql-fill {
  fill: #06c;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
</style>
