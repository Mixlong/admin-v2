<template>
  <!-- 添加售后 -->
  <el-dialog class="after-sale-box sop-form-dialog premium-dialog" :title="isTitle" :visible="visible" width="950px"
    append-to-body center top="0vh" :close-on-click-modal="false" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px" label-position="left">
      <el-row :gutter="24" class="form-header-section">
        <el-col :span="12">
          <el-form-item label="品类" prop="categoryId">
            <el-select v-model="form.categoryId" filterable allow-create clearable style="width: 100%"
              placeholder="请选择品类">
              <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="versionCode">
            <el-input v-model="form.versionCode" clearable style="width: 100%" placeholder="请输入版本号" />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="版本描述" prop="desc">
            <el-input v-model="form.desc" type="textarea" clearable :rows="4" style="width: 100%"
              placeholder="请输入版本描述" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="上传历史文件" prop="versionCode" label-width="140px">
        <DrUpload v-model="form.historyFile" :useObjectFormat="true" />
      </el-form-item>
      <el-row class="workspace-files">
        <el-form-item label="添加工位文件：" required label-width="140px" class="add-file-sticky">
          <div class="upload-section">
            <div class="file-upload-area">
              <!-- <el-button
                class="save-btn"
                v-if="form.list.length < 100"
                type="primary"
                icon="el-icon-plus"
                circle
                size="medium"
                @click="onAddStationFile"
              /> -->
              <el-button class="save-btn upload-btn" type="primary" size="medium" :disabled="isSubLoading"
                @click="handlePdfUpload">
                <i v-if="isSubLoading" class="el-icon-loading"></i>

                <i class="el-icon-upload el-icon--left"></i> 上传PDF
              </el-button>

              <input ref="pdfFileInput" type="file" accept="application/pdf" style="display: none"
                @change="onPdfFileSelected">
            </div>
          </div>
        </el-form-item>

        <div ref="stationBoxRef" class="station_box" v-loading="isSubLoading" element-loading-text="处理中..."
          element-loading-spinner="el-icon-loading">
          <transition-group name="fade-transform-sop" tag="div">
            <el-row type="flex" justify="space-between" align="middle" :gutter="5" v-for="(item, index) in form.list"
              :key="index">
              <!-- <el-col :span="1" class="text-center">
                {{ index + 1 }}
              </el-col> -->
              <el-col :span="23">
                <el-row type="flex" :gutter="10" align="middle" class="file_list_box">
                  <el-col :span="3">
                    <el-form-item label="" label-width="0" :prop="`list[${index}].indexNum`" :rules="rules.indexNum">
                      <el-input-number v-model="item.indexNum" clearable :min="0" controls-position="right"
                        style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="14">
                    <el-form-item label="" label-width="0" :prop="`list[${index}].file`" :rules="rules.file"
                      :style="{ marginBottom: item.file ? 0 : '18px' }" class="custom-upload-item">
                      <!-- 使用 draggable 包装每个上传组件，实现跨行拖拽 -->
                      <div class="file-list-container">
                        <draggable :list="getFileList(item.file)" :group="{ name: 'images', pull: true, put: true }"
                          :item-key="getItemKey" animation="300" ghost-class="sortable-ghost"
                          chosen-class="sortable-chosen" drag-class="sortable-drag" @start="onDragStart($event, index)"
                          @end="onDragEnd" @change="onFileListChange($event, index)" class="draggable-container">
                          <div class="file-item" :key="element.id"
                            v-for="(element, fileIndex) in getFileList(item.file)">
                            <el-image :src="element.url"
                              :preview-src-list="getFileList(item.file).map(item => item.url)" class="file-preview"
                              fit="cover">
                            </el-image>
                            <div class="file-info">
                            </div>
                            <div class="file-actions">
                              <el-button type="danger" size="mini" icon="el-icon-delete" circle
                                @click="removeFile(index, fileIndex)" />
                            </div>
                          </div>
                          <div style="width: 100%;height: 98px;flex:1;" v-if="getFileList(item.file).length === 0">
                          </div>
                        </draggable>
                        <!-- 上传按钮 -->
                        <el-upload :action="actionUrl" :show-file-list="false" :accept="accept"
                          :on-success="(response) => onUploadSuccess(response, index)" :before-upload="beforeUpload"
                          class="upload-trigger">
                          <div class="upload-button">
                            <i class="el-icon-plus"></i>
                          </div>
                        </el-upload>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="" label-width="0" :prop="`list[${index}].remark`" :rules="rules.remark">
                      <el-input v-model="item.remark" clearable placeholder="请输入工位文件描述" style="width: 100%"
                        @blur="onSaveItem(item)" />
                    </el-form-item>
                    <!-- 工时输入 -->
                    <el-form-item label="" label-width="0" :prop="`list[${index}].spendTime`" :rules="rules.spendTime">
                      <div class="spend-time-input">
                        <el-input-number v-model="item.spendTime" :min="0" :precision="0" controls-position="right"
                          placeholder="工时(秒)" style="width: 100%" @blur="onSaveItem(item)" />
                        <div class="time-display" v-if="item.spendTime">
                          {{ formatSpendTime(item.spendTime) }}
                        </div>
                      </div>
                    </el-form-item>
                    <!-- 保存 -->
                    <div class="action-buttons">
                      <!-- 复制 -->
                      <el-button type="warning" size="small" class="action-btn"
                        @click="onCopyItem(index)">复制</el-button>
                      <el-button type="danger" size="small" class="action-btn"
                        @click="removeSopData(item)">删除</el-button>
                    </div>
                  </el-col>
                </el-row>
              </el-col>
              <!-- <el-col :span="1" class="text-center">
                <el-button
                  v-if="index !== 0"
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  class="delete-btn"
                  @click="removeSopData(item)"
                />
              </el-col> -->
            </el-row>
          </transition-group>
        </div>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer form-actions">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sopSave, sopUpdate } from "@/api/third/testApi";
import axios from "axios";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";
import draggable from "vuedraggable";
import _ from "lodash";

export default {
  components: {
    draggable,
    ElUploadSortable,
  },
  props: {
    dictList: Array,
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPdfIndex: -1, // 当前处理PDF的索引
      drag: false,
      dragSourceIndex: -1, // 拖拽源行索引
      dragImageIndex: -1, // 拖拽图片索引
      dragOverIndex: -1, // 拖拽目标行索引
      actionUrl: reqUrl + "/oss/batch-upload",
      accept: "image/*",
      // 提交loading
      isSubLoading: false,
      // 表单参数
      form: {
        categoryId: "",
        versionCode: "",
        desc: "",
        historyFile: [], // 历史文件对象数组格式
        list: [
          {
            indexNum: undefined,
            file: "",
            remark: "",
          },
        ],
      },
      cloneForm: {},
      isCLoading: false,
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        versionCode: [
          { required: true, message: "请输入版本号", trigger: "blur" },
        ],
        desc: [{ required: true, message: "请输入版本描述", trigger: "blur" }],
        indexNum: [
          { required: true, message: "请输入序号", trigger: "change" },
        ],
        file: [
          {
            required: false,
            message: "工位文件不能为空",
            trigger: ["change", "blur"],
          },
        ],
        remark: [
          { required: false, message: "工位文件描述为空", trigger: "blur" },
        ],
        spendTime: [
          { required: true, message: "工时不能为空", trigger: "blur" },
          { type: "number", min: 0, message: "工时必须大于等于0秒", trigger: "blur" }
        ]
      },
    };
  },
  computed: {
    isTitle() {
      return this.form.id ? "编辑SOP" : "添加SOP";
    },
  },
  watch: {
    visible(isShow) {
      if (!isShow) {
        this.reset();
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    // 表单重置
    reset() {
      this.form = {
        categoryId: "",
        versionCode: "",
        desc: "",
        historyFile: [],
        list: [
          {
            indexNum: undefined,
            file: "",
            remark: "",
            spendTime: null,
          },
        ],
      };
      this.resetForm("form");
    },
    // 新增工位文件
    onAddStationFile() {
      this.form.list.push({
        indexNum: undefined,
        file: "",
        remark: "",
        spendTime: null,
      });

      this.onSetStationBoxRef();
    },
    onSetStationBoxRef() {
      // 检查 stationBoxRef 是否存在
      if (!this.$refs.stationBoxRef) {
        console.warn('stationBoxRef 不存在，跳过滚动操作');
        return;
      }

      const scrollRef = this.$refs.stationBoxRef.$el;
      if (!scrollRef) {
        console.warn('stationBoxRef.$el 不存在，跳过滚动操作');
        return;
      }

      const scrollHeight = scrollRef.scrollHeight;

      this.$nextTick(() => {
        if (scrollRef && scrollRef.scrollHeight) {
          scrollRef.scrollTop = scrollHeight;
        }
      });
    },
    // 删除物料损耗项
    removeSopData(item) {
      const index = this.form.list.indexOf(item);
      if (index !== -1) {
        this.form.list.splice(index, 1);
      }
    },
    /** 保存 */
    onSaveItem(item) {
      // for (const key in item) {
      //   if (this.Is_Empty(item[key])) {
      //     return this.msgError("请填入必要信息");
      //   }
      // }
      // this.$refs["form"].validate((valid) => {
      //   if (valid) {
      //     if (this.form.id) {
      //       sopUpdate(this.form).then(() => {
      //         this.msgSuccess("保存成功");
      //       });
      //     } else {
      //       sopSave(this.form).then(() => {
      //         this.msgSuccess("保存成功");
      //       });
      //     }
      //   }
      // })
    },
    /** 复制 */
    onCopyItem(index) {
      const item = { ...this.form.list[index], id: "" };
      this.form.list.splice(index + 1, 0, item);
    },
    /** 获取文件列表 - 将字符串转换为对象数组 */
    getFileList(fileString) {
      if (!fileString) return [];
      const urls = fileString.split(',').filter(url => url.trim());
      return urls.map((url, index) => ({
        id: `${Date.now()}_${index}`,
        url: url.trim(),
        name: url.split('/').pop() || `文件${index + 1}`
      }));
    },

    /** 获取项目唯一键 */
    getItemKey(item) {
      return item.id;
    },

    /** 拖拽开始事件 */
    onDragStart(evt, rowIndex) {
      console.log('开始拖拽，行索引:', rowIndex);
      this.dragSourceIndex = rowIndex;
    },

    /** 拖拽结束事件 */
    onDragEnd(evt) {
      console.log('拖拽结束');
      this.dragSourceIndex = -1;
    },

    /** 文件列表变化事件 */
    onFileListChange(evt, rowIndex) {
      console.log('文件列表变化:', evt, '行索引:', rowIndex);

      // 更新对应行的文件字符串
      const fileList = this.getFileList(this.form.list[rowIndex].file);
      const urls = fileList.map(file => file.url);
      this.form.list[rowIndex].file = urls.join(',');

      // 如果是添加操作，更新文件列表
      if (evt.added) {
        const newUrls = [...urls, evt.added.element.url];
        this.form.list[rowIndex].file = newUrls.join(',');
      }

      // 如果是移除操作，从文件列表中删除
      if (evt.removed) {
        const filteredUrls = urls.filter(url => url !== evt.removed.element.url);
        this.form.list[rowIndex].file = filteredUrls.join(',');
      }

      // 如果是移动操作，重新排序
      if (evt.moved) {
        const reorderedUrls = fileList.map(file => file.url);
        this.form.list[rowIndex].file = reorderedUrls.join(',');
      }
    },

    /** 移除文件 */
    removeFile(rowIndex, fileIndex) {
      const fileList = this.getFileList(this.form.list[rowIndex].file);
      fileList.splice(fileIndex, 1);
      const urls = fileList.map(file => file.url);
      this.form.list[rowIndex].file = urls.join(',');
    },

    /** 上传成功处理 */
    onUploadSuccess(response, rowIndex) {
      if (response.code === 200 && response.data) {
        const currentFiles = this.form.list[rowIndex].file;
        const newUrl = response.data[0].url;

        if (currentFiles) {
          this.form.list[rowIndex].file = currentFiles + ',' + newUrl;
        } else {
          this.form.list[rowIndex].file = newUrl;
        }

        this.msgSuccess('文件上传成功');
      } else {
        this.msgError('文件上传失败');
      }
    },

    /** 上传前验证 */
    beforeUpload(file) {
      const isImage = file.type.indexOf('image/') === 0;
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isImage) {
        this.msgError('只能上传图片文件!');
        return false;
      }
      if (!isLt10M) {
        this.msgError('上传文件大小不能超过 10MB!');
        return false;
      }
      return true;
    },



    checkListItem() {
      let arr = [];
      for (const { indexNum } of this.form.list) {
        if (arr.includes(indexNum)) {
          this.msgError("工位序号不能重复");
          return true;
        } else {
          arr.push(indexNum);
        }
      }
    },
    /** 触发PDF文件选择 */
    handlePdfUpload() {
      this.$refs.pdfFileInput.click();
    },

    /** PDF文件选择后的处理 */
    onPdfFileSelected(event) {
      const file = event.target.files[0];
      this.isSubLoading = true;
      if (!file) return;

      if (file.type !== 'application/pdf') {
        this.msgError('请上传PDF格式文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.isSubLoading = true;
      // 调用后端接口转换PDF为图片并上传至OSS
      axios.post(reqUrl + '/file/converterToOss', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(response => {
        this.processPdfResponse(response.data);
      }).catch(error => {
        console.error('PDF转换失败:', error);
        this.msgError('PDF转换上传失败，请重试');
      }).finally(() => {
        this.isSubLoading = false;
        // 重置文件输入框，以便于再次选择同一文件
        this.$refs.pdfFileInput.value = '';
      });
    },

    /** 处理PDF转换响应数据 */
    processPdfResponse(data) {
      if (data.code === 200 && data.data) {
        // 将获取的OSS图片URL数组添加到表单项中
        if (Array.isArray(data.data)) {
          // 查找当前最大序号
          let maxIndexNum = 0;
          this.form.list.forEach(item => {
            if (item.indexNum && parseInt(item.indexNum) > maxIndexNum) {
              maxIndexNum = parseInt(item.indexNum);
            }
          });

          // 处理PDF转换得到的图片
          data.data.forEach((imageData, idx) => {
            // 清理URL中的反引号和空格
            let cleanUrl = imageData.url;
            if (typeof cleanUrl === 'string') {
              cleanUrl = cleanUrl.replace(/`/g, '').trim();
            }

            // 查找空项或添加新项
            const emptyIndex = this.form.list.findIndex(item => !item.file);
            if (emptyIndex !== -1) {
              // 更新空项
              this.form.list[emptyIndex].file = cleanUrl;
              // 如果序号未定义，则自动设置序号
              if (!this.form.list[emptyIndex].indexNum) {
                this.form.list[emptyIndex].indexNum = maxIndexNum + idx + 1;
              }
            } else {
              // 如果没有空项，则添加新项，并设置自增序号
              this.form.list.push({
                indexNum: maxIndexNum + idx + 1, // 从最大序号+1开始
                file: cleanUrl,
                remark: ''
              });
            }
          });
          // 更新站位盒子引用
          this.onSetStationBoxRef();
          this.msgSuccess('PDF转换成功');
        } else {
          // 处理单个URL的情况
          let cleanUrl = data.data;
          if (typeof cleanUrl === 'string') {
            cleanUrl = cleanUrl.replace(/`/g, '').trim();
          }

          const emptyIndex = this.form.list.findIndex(item => !item.file);
          if (emptyIndex !== -1) {
            this.form.list[emptyIndex].file = cleanUrl;
          } else {
            // 如果没有空项，则添加新项
            this.form.list.push({
              indexNum: undefined,
              file: cleanUrl,
              remark: ''
            });
            this.onSetStationBoxRef();
          }
          this.msgSuccess('PDF转换成功');
        }
      } else {
        this.msgError(data.msg || 'PDF转换失败');
      }
    },

    /** 提交按钮 */
    submitForm: function () {
      if (this.checkListItem()) return;

      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;

          // 深拷贝表单数据
          const submitData = _.cloneDeep(this.form);

          // 将 historyFile 对象数组转换为原格式字符串
          if (submitData.historyFile && Array.isArray(submitData.historyFile)) {
            submitData.historyFile = JSON.stringify(submitData.historyFile)
          }
          if (this.form.id) {
            sopUpdate(submitData)
              .then(() => {
                this.msgSuccess("修改成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          } else {
            sopSave(submitData)
              .then(() => {
                this.msgSuccess("创建成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          }
        }
      });
    },

    /** 编辑时数据回显 */
    setFormData(data) {
      let formData = { ...data };
      console.log("🚀 ~ setFormData ~  formData.historyFile:", formData.historyFile)
      formData.historyFile = formData.historyFile ? JSON.parse(formData.historyFile) : [];
      console.log("🚀 ~ setFormData ~ formData.historyFile:", formData.historyFile)
      this.form = formData;
    },

    /** 格式化工时显示 */
    formatSpendTime(seconds) {
      if (!seconds || seconds === 0) return '';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let result = [];
      if (hours > 0) result.push(`${hours}时`);
      if (minutes > 0) result.push(`${minutes}分`);
      if (remainingSeconds > 0 || result.length === 0) result.push(`${remainingSeconds}秒`);

      return result.join('');
    },
  },
};
</script>

<style lang="scss" scoped>
.after-sale-box {
  ::v-deep .el-dialog__body {
    max-height: 80vh;
    overflow: hidden;
    overflow-y: auto;
    padding: 25px 30px;
    background-color: #ffffff;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  }

  .el-dialog__header {
    padding: 18px 25px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(to right, #f8f9fc, #f2f6fc);
    margin-bottom: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    position: relative;
  }

  .el-dialog__title {
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__footer {
    border-top: 1px solid #ebeef5;
    padding: 15px 25px;
    background-color: #f8f9fc;
  }

  .step-wrap {
    .title-top {
      position: absolute;
      top: -38px;
      left: 0;
      width: 100%;
      height: 38px;
    }

    .wrap-click {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 24px;
      z-index: 10;
      // cursor: pointer;
    }

    .el-step__description {
      padding-top: 15px;
    }

    .el-form-item__error {
      min-width: auto;
    }
  }

  .save-btn {
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .file_list_box {
    box-sizing: border-box;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.3s;
    position: relative;

    &:hover {
      background-color: #f8f9fc;
      // box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
    }

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: #409EFF;
      border-radius: 0 3px 3px 0;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover:before {
      opacity: 1;
    }
  }

  .move-tag {
    width: 30px;
    height: 30px;
    cursor: move;
    font-size: 18px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-icon {
    font-size: 18px;
    color: #409EFF;
    background-color: rgba(64, 158, 255, 0.1);
    padding: 8px;
    border-radius: 50%;
  }

  .section-title {
    font-size: 16px;
    color: #409EFF;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .form-header-section {
    margin-bottom: 15px;
  }

  .workspace-files {
    margin-top: 10px;
  }

  .spend-time-input {
    position: relative;

    .time-unit {
      position: absolute;
      right: 35px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #909399;
      pointer-events: none;
      z-index: 1;
    }

    .time-display {
      margin-top: 4px;
      font-size: 12px;
      color: #67c23a;
      text-align: center;
      background: #f0f9ff;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #e1f5fe;
    }
  }

  .upload-section {
    border-radius: 10px;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(to right, #409EFF, #53a8ff);
      border-radius: 10px 10px 0 0;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }

  .upload-btn {
    padding: 10px 22px !important;
    font-size: 14px !important;
    height: auto !important;
    width: fit-content !important;
    transition: all 0.3s;
    border-radius: 8px !important;
    font-weight: 500 !important;
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;
    z-index: 1;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%);
      transition: all 0.4s;
      z-index: -1;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

      &:before {
        left: 100%;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 5px;
  }

  .action-btn {
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 6px;
    letter-spacing: 0.3px;
    font-weight: 500;
    position: relative;
    overflow: hidden;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%);
      transform-origin: 50% 50%;
    }

    &:hover:after {
      animation: ripple 1s ease-out;
    }

    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }

      100% {
        transform: scale(20, 20);
        opacity: 0;
      }
    }
  }

  .delete-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }

  .form-actions {
    text-align: right;
  }

  .el-button.is-circle {
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:hover {
      transform: rotate(5deg);
    }
  }

  .file-upload-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .custom-upload-item {
    margin: 10px 0;
    transition: all 0.3s;

    .file-list-container {
      display: flex;
      align-items: center;
      gap: 20px;
    }
  }

  .enhanced-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 10px;
    padding: 10px;
    background-color: #ffffff;
    transition: all 0.3s;
    display: flex;
    justify-content: flex-start;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
    position: relative;
    overflow: hidden;

    &:after {
      content: '';
      position: absolute;
      top: -100%;
      left: -100%;
      width: 50%;
      height: 50%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%);
      transform: rotate(35deg);
      transition: all 0.55s;
      opacity: 0;
    }
  }

  .enhanced-upload:hover {
    border-color: #409EFF;
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.2);
    transform: translateY(-1px);

    &:after {
      top: 100%;
      left: 100%;
      opacity: 1;
    }
  }

  // .add-file-sticky {
  //   position: sticky;
  //   top: -24px;
  //   z-index: 666;
  //   background: #fff;
  // }

  .fade-transform-sop-leave-to {
    opacity: 0;
    transform: translateX(60px);
  }

  .fade-transform-sop-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .station_box {
    scroll-behavior: smooth;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    position: relative;
    border-radius: 8px;

    &::-webkit-scrollbar {
      width: 4px;
      height: 0;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      transition: all 0.3s;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  // 拖拽相关样式
  .file-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    margin-bottom: 8px;
    transition: all 0.3s;
    cursor: move;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }

    &.sortable-ghost {
      opacity: 0.5;
      background: #f5f7fa;
    }

    &.sortable-chosen {
      border-color: #409eff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
    }

    &.sortable-drag {
      opacity: 0.8;
      transform: rotate(5deg);
    }
  }

  .file-preview {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
    border: 1px solid #e4e7ed;
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-size: 14px;
      color: #303133;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-url {
      font-size: 12px;
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .file-actions {
    display: flex;
    gap: 4px;
  }

  .draggable-container {
    min-height: 60px;
    border: 2px dashed transparent;
    border-radius: 8px;
    padding: 8px;
    transition: all 0.3s;
    display: flex;
    gap: 20px;
    flex: 1;
    flex-wrap: wrap;

    &.drag-over {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
  }

  .upload-button {
    width: 100%;
    height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    background: #fafafa;
    color: #909399;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    min-height: 58px;
    min-width: 58px;
    box-sizing: border-box;

    &:hover {
      border-color: #409eff;
      color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }

    .el-icon {
      font-size: 20px;
    }
  }
}
</style>