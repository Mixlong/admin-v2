<template>
  <el-upload
    ref="MyUploadRef"
    :value="value"
    class="upload-demo"
    :action="actionUrl"
    :multiple="multiple"
    :limit="limit"
    :file-list="fileList"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-exceed="handleExceed"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :disabled="!hasPermission"
  >
    <slot>
      <el-button 
        v-hasPermi="[permission]" 
        size="mini" 
        type="primary"
      >
        {{ btnTitle }}
      </el-button>
    </slot>
    <div slot="tip" class="el-upload__tip">
      {{ tipValue }}
    </div>
  </el-upload>
</template>

<script>
import reqUrl from "@/utils/requestUrl";
export default {
  name: "MyUpload",
  props: {
    value: {
      required: true,
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
    },
    btnTitle: {
      type: String,
      default: "点击上传",
    },
    tipValue: {
      type: String,
      default: "",
    },
    // 权限标识
    permission: {
      type: String,
      default: "",
    },
  },
  computed: {
    hasPermission() {
      // 如果没有设置权限，默认允许
      if (!this.permission) {
        return true;
      }
      // 检查用户是否有该权限
      return this.checkPermi([this.permission]);
    },
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      fileList: [],
    };
  },
  watch: {
    value(data) {
      this.transImg(data);
    },
  },
  mounted() {
    this.transImg(this.value);
  },
  methods: {
    checkPermi(value) {
      // 检查权限的方法
      if (value && value instanceof Array && value.length > 0) {
        const permissions = this.$store && this.$store.getters && this.$store.getters.permissions;
        const permissionFlag = value[0];
        const hasPermissions = permissions && permissions.some(permission => {
          return permissionFlag === permission;
        });
        return hasPermissions;
      } else {
        return false;
      }
    },
    beforeUpload(file) {
      // 检查文件名是否包含逗号
      if (file.name.includes(',')) {
        this.$message.error(`文件名不能包含逗号，请重命名后再上传: ${file.name}`);
        return false;
      }
      return true;
    },
    transImg(value) {
      value = value ?? "";
      
      // 尝试解析为JSON数组格式
      let urls = [];
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          urls = JSON.parse(value);
        } catch (e) {
          console.warn('JSON解析失败，使用逗号分隔:', e);
          urls = value.split(",");
        }
      } else {
        urls = value.split(",");
      }
      
      let fileList = urls.map((item) => {
        return {
          name: item.slice(item.lastIndexOf("/") + 1),
          url: item,
        };
      });

      this.fileList = fileList.filter((item) => {
        return item.url != "";
      });
    },
    handleSuccess(response, file, fileList) {
      if (this.limit === 1) {
        this.$refs.MyUploadRef.clearFiles();
      }

      this.handleTransImg(this.limit === 1 ? [file] : fileList);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    handleRemove(file, fileList) {
      this.handleTransImg(fileList);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    handleTransImg(file) {
      if (file.every((item) => item.status === "success")) {
        const newImgFile = file.map((item) => {
          if (item.response) {
            return item.response.data[0].url;
          } else {
            return item.url;
          }
        });

        this.$emit("input", newImgFile.toString());
      }
    },
  },
};
</script>