<template>
  <el-dialog class="sop-form-dialog" :title="isTitle" :visible="visible" width="1000px" append-to-body center top="0vh"
    :close-on-click-modal="false" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="sop-form" v-form-scroll-error>
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">基本信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品类" prop="categoryId">
                <el-select v-model="form.categoryId" filterable allow-create clearable placeholder="请选择品类">
                  <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="版本号" prop="versionCode">
                <el-input v-model="form.versionCode" clearable placeholder="请输入版本号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="版本描述" prop="desc">
            <el-input v-model="form.desc" type="textarea" clearable :rows="3" placeholder="请输入版本描述" />
          </el-form-item>
        </div>
      </fieldset>

      <!-- 历史文件 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">
          历史文件
          <DrUpload v-model="form.historyFile" :useObjectFormat="true" :showFileList="false" class="legend-upload">
            <el-button size="small" type="text">
              点击上传
            </el-button>
          </DrUpload>
        </legend>
        <div class="fieldset-content">
          <!-- 用表格展示已上传的文件 -->
          <el-table :data="historyFileList" border style="width: 100%" empty-text="暂无历史文件">
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="文件名" min-width="200" align="center">
              <template slot-scope="{ row }">
                <el-link :href="row.url" target="_blank" type="primary" :underline="false">
                  <i class="el-icon-document"></i>
                  {{ row.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" width="160" align="center">
              <template slot-scope="{ row }">
                {{ formatUploadTime(row.uploadTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="{ row, $index }">
                <el-button size="mini" type="text" @click="previewFile(row)">预览</el-button>
                <el-button size="mini" type="text" style="color: #f56c6c;"
                  @click="removeHistoryFile($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </fieldset>
      <!-- 工位文件 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">
          工位文件
          <el-button type="text" size="small" :disabled="isSubLoading" @click="handlePdfUpload" class="legend-upload">
            {{ isSubLoading ? '上传中...' : '上传PDF' }}
          </el-button>
          <input ref="pdfFileInput" type="file" accept="application/pdf" style="display: none"
            @change="onPdfFileSelected">
        </legend>
        <div class="fieldset-content">
          <div ref="stationBoxRef" v-loading="isSubLoading" element-loading-text="处理中...">
            <div v-for="(item, index) in form.list" :key="index" class="workspace-item">
              <div class="item-header">
                <span class="item-number">{{ index + 1 }}</span>

                <div class="item-actions">
                  <el-button type="text" size="small" @click="onCopyItem(index)">复制</el-button>
                  <el-button type="text" size="small" @click="removeSopData(item)"
                    style="color: #f56c6c;">删除</el-button>
                </div>
              </div>

              <el-row :gutter="16" class="workspace-item-content">
                <el-col :span="16">
                  <el-form-item :prop="`list[${index}].file`" :rules="rules.file" label="" label-width="0px">
                    <div class="simple-upload-area">
                      <draggable :list="getFileList(item.file)" :group="{ name: 'images', pull: true, put: true }"
                        :item-key="getItemKey" @start="onDragStart($event, index)" @end="onDragEnd"
                        @change="onFileListChange($event, index)" class="image-list">
                        <div v-for="(element, fileIndex) in getFileList(item.file)" :key="element.id"
                          class="image-item">
                          <!-- 视频文件显示 -->
                          <video v-if="isVideoFile(element.url)" :src="element.url" class="image-preview" controls
                            preload="metadata" @click.stop>
                          </video>
                          <!-- 图片文件显示 -->
                          <el-image v-else :src="element.url" :preview-src-list="getImageUrls(item.file)"
                            class="image-preview" fit="cover" />
                          <el-button type="danger" size="mini" icon="el-icon-delete" circle
                            @click="removeFile(index, fileIndex)" class="delete-btn" />
                        </div>
                      </draggable>
                      <el-upload :action="actionUrl" :show-file-list="false" :accept="accept"
                        :on-success="(response) => onUploadSuccess(response, index)" :before-upload="beforeUpload"
                        :on-progress="(event) => onUploadProgress(event, index)">
                        <div class="upload-btn">
                          <i class="el-icon-plus"></i>
                        </div>
                      </el-upload>

                      <!-- 上传进度显示 -->
                      <div v-if="uploadingItems[index]" class="upload-progress-overlay">
                        <div class="upload-progress-content">
                          <div class="upload-preview" v-if="uploadingItems[index].preview">
                            <!-- 图片预览 -->
                            <img v-if="uploadingItems[index].type === 'image'" :src="uploadingItems[index].preview"
                              class="preview-image" />
                            <!-- 视频预览 -->
                            <video v-else-if="uploadingItems[index].type === 'video'" class="preview-video"
                              :src="uploadingItems[index].preview" muted>
                            </video>
                            <!-- 其他文件显示文件名 -->
                            <div v-else class="preview-file">
                              <i class="el-icon-document"></i>
                              <span>{{ uploadingItems[index].name }}</span>
                            </div>
                          </div>
                          <div class="upload-info">
                            <div class="file-name">{{ uploadingItems[index].name }}</div>
                            <el-progress :percentage="uploadingItems[index].percentage" :show-text="true"></el-progress>
                            <div class="upload-size">
                              {{ formatFileSize(uploadingItems[index].loaded) }} / {{
                                formatFileSize(uploadingItems[index].total) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :prop="`list[${index}].indexNum`" :rules="rules.indexNum" label="序号" label-width="60px">
                    <el-input v-model="item.indexNum" placeholder="序号" size="small" style="width: 100%;"
                      @input="handleIndexNumInput($event, index)" @keypress="handleNumberKeypress" />
                  </el-form-item>
                  <el-form-item label="工时" :prop="`list[${index}].spendTime`" :rules="rules.spendTime"
                    label-width="60px" required>
                    <el-time-picker v-model="item.timeValue" placeholder="请选择工时" format="HH:mm:ss"
                      value-format="HH:mm:ss" style="width: 100%;" @change="(time) => updateSpendTime(index, time)"
                      @blur="onSaveItem(item)" />

                  </el-form-item>
                  <el-form-item label="描述" :prop="`list[${index}].remark`" :rules="rules.remark" label-width="60px">
                    <el-input v-model="item.remark" type="textarea" :rows="2" placeholder="请输入工位文件描述"
                      @blur="onSaveItem(item)" />
                  </el-form-item>

                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </fieldset>
    </el-form>

    <!-- 底部操作区 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        {{ isSubLoading ? '保存中...' : '确定' }}
      </el-button>
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
import DrUpload from "@/components/Upload";

export default {
  components: {
    draggable,
    ElUploadSortable,
    DrUpload,
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
      accept: "image/*,video/*",
      // 提交loading
      isSubLoading: false,
      historyFileList: [], // 历史文件表格数据
      uploadingItems: {}, // 上传中的文件信息 {[index]: {name, type, preview, percentage, loaded, total}}
      pendingUpload: null, // 待上传文件信息
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
            spendTime: null,
            timeValue: "00:00:00", // 默认展示00:00:00
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
          { required: true, message: "请输入版本号", trigger: ["blur", "change"] },
        ],
        desc: [{ required: true, message: "请输入版本描述", trigger: ["blur", "change"] }],
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
          { required: false, message: "工位文件描述为空", trigger: ["blur", "change"] },
        ],
        spendTime: [
          {
            validator: (rule, value, callback) => {
              // 工时必填
              if (value === null || value === undefined || value === '' || value === 0) {
                callback(new Error('请选择工时'));
              } else if (typeof value !== 'number' || value < 0) {
                callback(new Error('工时必须大于0秒'));
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"]
          }
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
  watch: {
    // 监听 form.historyFile 的变化，同步更新表格数据
    'form.historyFile': {
      handler(newFileList) {
        console.log('form.historyFile 变化:', newFileList);
        if (Array.isArray(newFileList)) {
          this.updateHistoryFileList(newFileList);
        }
      },
      deep: true,
      immediate: true
    }
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
            timeValue: "00:00:00", // 默认展示00:00:00
          },
        ],
      };
      this.historyFileList = []; // 重置历史文件表格数据
      // 确保表单引用存在后再重置
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetFields();
        }
      });
    },
    // 新增工位文件
    onAddStationFile() {
      this.form.list.push({
        indexNum: undefined,
        file: "",
        remark: "",
        spendTime: null,
        timeValue: "00:00:00", // 默认展示00:00:00
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
      const item = {
        ...this.form.list[index],
        id: "",
        timeValue: this.form.list[index].timeValue || "00:00:00" // 复制时间选择器值，默认00:00:00
      };
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
      // 清除上传进度信息
      this.$delete(this.uploadingItems, rowIndex);
      this.pendingUpload = null;

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
      const isVideo = file.type.indexOf('video/') === 0;
      const isValidFile = isImage || isVideo;

      // 图片最大10MB，视频最大100MB
      const maxSize = isVideo ? 100 : 10;
      const isValidSize = file.size / 1024 / 1024 < maxSize;

      if (!isValidFile) {
        this.msgError('只能上传图片或视频文件!');
        return false;
      }
      if (!isValidSize) {
        const fileType = isVideo ? '视频' : '图片';
        this.msgError(`上传${fileType}文件大小不能超过 ${maxSize}MB!`);
        return false;
      }

      // 创建文件预览
      this.createFilePreview(file);
      return true;
    },

    /** 创建文件预览 */
    createFilePreview(file) {
      const reader = new FileReader();
      const isImage = file.type.indexOf('image/') === 0;
      const isVideo = file.type.indexOf('video/') === 0;

      reader.onload = (e) => {
        // 存储到当前上传文件信息中，稍后在 onUploadProgress 中使用
        this.pendingUpload = {
          name: file.name,
          type: isImage ? 'image' : isVideo ? 'video' : 'file',
          preview: e.target.result,
          total: file.size
        };
      };

      reader.readAsDataURL(file);
    },

    /** 上传进度 */
    onUploadProgress(event, index) {
      if (this.pendingUpload) {
        this.$set(this.uploadingItems, index, {
          ...this.pendingUpload,
          percentage: Math.round((event.loaded / event.total) * 100),
          loaded: event.loaded,
          total: event.total
        });
      }
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
                remark: '',
                spendTime: null,
                timeValue: "00:00:00" // 默认展示00:00:00
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
              remark: '',
              spendTime: null,
              timeValue: "00:00:00" // 默认展示00:00:00
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
        // 指令会自动处理校验失败时的滚动，这里不需要额外代码
      });
    },

    /** 编辑时数据回显 */
    setFormData(data) {
      let formData = { ...data };
      console.log("🚀 ~ setFormData ~  formData.historyFile:", formData.historyFile)
      formData.historyFile = formData.historyFile ? JSON.parse(formData.historyFile) : [];
      console.log("🚀 ~ setFormData ~ formData.historyFile:", formData.historyFile)

      // 设置历史文件表格数据
      this.historyFileList = formData.historyFile.map((file, index) => ({
        name: file.name,
        url: file.url,
        size: file.size || 0,
        uploadTime: file.uploadTime || new Date(),
        id: file.id || (Date.now() + index)
      }));

      // 初始化时间选择器的值
      if (formData.list && formData.list.length > 0) {
        formData.list.forEach(item => {
          item.timeValue = this.secondsToTime(item.spendTime) || "00:00:00";
        });
      }

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

    /** 将秒数转换为时间格式 HH:mm:ss */
    secondsToTime(seconds) {
      if (!seconds || seconds === 0) return "00:00:00"; // 返回默认时间而不是null

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    /** 将时间格式 HH:mm:ss 转换为秒数 */
    timeToSeconds(timeString) {
      if (!timeString) return null;

      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // 如果总秒数为0，也返回null，因为工时必须大于0
      return totalSeconds === 0 ? null : totalSeconds;
    },

    /** 更新工时数据 */
    updateSpendTime(index, timeString) {
      const seconds = this.timeToSeconds(timeString);
      this.form.list[index].spendTime = seconds;

      // 如果用户清空了时间选择器，设为null触发必填验证
      if (!timeString) {
        this.form.list[index].spendTime = null;
      }
    },

    /** 处理序号输入，只允许数字 */
    handleIndexNumInput(value, index) {
      // 移除非数字字符
      const numericValue = value.replace(/[^\d]/g, '');

      // 转换为数字，如果为空则设为null
      const numberValue = numericValue === '' ? null : parseInt(numericValue, 10);

      // 更新数据
      this.form.list[index].indexNum = numberValue;
    },

    /** 限制只能输入数字 */
    handleNumberKeypress(event) {
      // 允许数字键和一些控制键
      const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];

      if (!allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    },

    /** 更新历史文件表格数据 */
    updateHistoryFileList(fileList) {
      console.log('更新历史文件表格数据:', fileList);

      // 将 DrUpload 组件的文件列表转换为表格数据
      this.historyFileList = (fileList || []).map((file, index) => ({
        name: file.name || file.fileName || file.originalName || '未知文件',
        url: file.url || file.fileUrl || file.downloadUrl,
        size: file.size || file.fileSize || 0,
        uploadTime: file.uploadTime || file.createTime || file.time || new Date(),
        id: file.id || file.fileId || (Date.now() + index)
      }));

      console.log('转换后的表格数据:', this.historyFileList);
    },

    /** 删除历史文件 */
    removeHistoryFile(index) {
      this.historyFileList.splice(index, 1);
      this.form.historyFile.splice(index, 1);
      this.$message.success('删除成功');
    },

    /** 预览文件 */
    previewFile(file) {
      window.open(file.url, '_blank');
    },

    /** 格式化文件大小 */
    formatFileSize(size) {
      if (!size) return '-';
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1048576) {
        return (size / 1024).toFixed(1) + ' KB';
      } else {
        return (size / 1048576).toFixed(1) + ' MB';
      }
    },

    /** 格式化上传时间 */
    formatUploadTime(time) {
      if (!time) return '-';
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    /** 判断是否为视频文件 */
    isVideoFile(url) {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
      const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
      return videoExtensions.includes(extension);
    },

    /** 获取图片URL列表（用于预览，排除视频） */
    getImageUrls(fileString) {
      const fileList = this.getFileList(fileString);
      return fileList.filter(file => !this.isVideoFile(file.url)).map(img => img.url);
    },

  },
};
</script>

<style lang="scss" scoped>
.sop-form-dialog {
  ::v-deep .el-dialog {
    border-radius: 4px;
  }

  ::v-deep .el-dialog__header {
    padding: 16px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;

    .el-dialog__title {
      color: #333333;
      font-size: 16px;
      font-weight: 500;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
    max-height: 75vh;
    overflow-y: auto;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 20px;
    background: #ffffff;
    border-top: 1px solid #e8e8e8;
    text-align: right;
  }
}

// 对话框内容区域
.dialog-content {
  padding: 24px;
  max-height: 75vh;
  overflow-y: auto;
  background: #f8fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;

    &:hover {
      background: #a0aec0;
    }
  }
}

// 简洁表单样式
.sop-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-form-item__label {
    color: #666666;
    font-weight: normal;
  }
}

// 简洁的区块样式
.form-fieldset {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  background: #ffffff;
  position: relative;

  .fieldset-legend {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    padding: 12px 16px;
    background: #fff;

    .legend-upload {
      position: absolute;
      right: 16px;
      top: 12px;
      z-index: 10;
      font-size: 14px;
      padding: 0 20px;
      background: #fff;

      // 覆盖按钮样式，显示为纯文字
      ::v-deep .el-button {
        border: none;
        background: none;
        padding: 0;
        font-size: 14px;
        color: #409EFF;

        &:hover {
          background: none;
          color: #66b1ff;
        }

        &:focus,
        &:active {
          background: none;
          border: none;
          outline: none;
        }

        .el-icon-upload {
          display: none;
        }
      }
    }
  }

  .fieldset-content {
    padding: 16px;
  }
}

// 工位项目样式
.workspace-item {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background: #ffffff;

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;

    .item-number {
      background: #333333;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }
  }

  .workspace-item-content {
    display: flex;
    align-items: center;

    // 检查最后一个表单项，去除其下边距
    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
}

// 简单图片上传区域
.simple-upload-area {
  border-right: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  min-height: 100px;

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .image-item {
      position: relative;

      .image-preview {
        width: 80px;
        height: 80px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        object-fit: cover;
      }

      // 视频元素样式
      video.image-preview {
        width: 80px;
        height: 80px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        object-fit: cover;
        background: #000;
      }

      .delete-btn {
        position: absolute;
        top: -8px;
        right: -8px;
      }
    }
  }

  .upload-btn {
    width: 80px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    i {
      font-size: 20px;
    }
  }

  // 上传进度遮罩层
  .upload-progress-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .upload-progress-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 200px;
      padding: 16px;

      .upload-preview {
        margin-bottom: 12px;

        .preview-image,
        .preview-video {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
        }

        .preview-file {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #606266;

          i {
            font-size: 32px;
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
            text-align: center;
            word-break: break-all;
          }
        }
      }

      .upload-info {
        width: 100%;

        .file-name {
          font-size: 12px;
          color: #303133;
          margin-bottom: 8px;
          text-align: center;
          word-break: break-all;
        }

        .upload-size {
          font-size: 11px;
          color: #909399;
          text-align: center;
          margin-top: 4px;
        }
      }
    }
  }
}

// 时间显示
.time-display {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666666;
  text-align: center;
}

// 响应式布局
@media (max-width: 768px) {
  .form-fieldset {
    margin-bottom: 12px;

    .fieldset-legend {
      font-size: 13px;
      padding: 10px 12px;
    }

    .fieldset-content {
      padding: 12px;
    }
  }

  .workspace-item {
    .item-header {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }

  .simple-upload-area {
    .image-list {
      justify-content: center;
    }
  }
}
</style>