<template>
  <!-- 添加售后 -->
  <el-dialog class="after-sale-box sop-form-dialog premium-dialog" :title="isTitle" :visible="visible" width="950px"
    append-to-body center top="2vh" :close-on-click-modal="false" @close="close">
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
        <draggable v-model="form.list" animation="1000" handle=".mover" @start="drag = true" @end="drag = false">
          <transition-group name="fade-transform-sop" tag="div" ref="stationBoxRef" class="station_box" 
            v-loading="isSubLoading" element-loading-text="处理中..." element-loading-spinner="el-icon-loading">
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
                      <el-upload-sortable v-model="item.file" :action="actionUrl" :imgW="100" :imgH="100"
                        class="enhanced-upload" :rowId="index" @drag-start="handleDragStart($event, index)"
                        @drag-end="handleDragEnd" @image-drop="handleImageDrop($event, index)"
                        @cross-row-drop="handleCrossRowDrop" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="" label-width="0" :prop="`list[${index}].remark`" :rules="rules.remark">
                      <el-input v-model="item.remark" clearable placeholder="请输入工位文件描述" style="width: 100%"
                        @blur="onSaveItem(item)" />
                    </el-form-item>
                    <!-- 保存 -->
                    <div class="action-buttons">
                      <!-- 复制 -->
                      <el-button type="warning" size="small" class="action-btn"
                        @click="onCopyItem(index)">复制</el-button>
                      <el-button type="danger" v-if="index !== 0" size="small" class="action-btn"
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
        </draggable>
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
      // 提交loading
      isSubLoading: false,
      // 表单参数
      form: {
        categoryId: "",
        versionCode: "",
        desc: "",
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
        list: [
          {
            indexNum: undefined,
            file: "",
            remark: "",
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
      });

      this.onSetStationBoxRef();
    },
    onSetStationBoxRef() {
      const scrollRef = this.$refs.stationBoxRef.$el;
      const scrollHeight = scrollRef.scrollHeight;

      this.$nextTick(() => {
        scrollRef.scrollTop = scrollHeight;
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
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            sopUpdate(this.form).then(() => {
              this.msgSuccess("保存成功");
            });
          } else {
            sopSave(this.form).then(() => {
              this.msgSuccess("保存成功");
            });
          }
        }
      })
    },
    /** 复制 */
    onCopyItem(index) {
      const item = { ...this.form.list[index], id: "" };
      this.form.list.splice(index + 1, 0, item);
    },
    /** 处理图片拖拽开始 */
    handleDragStart(data, rowIndex) {
      console.log('开始拖拽，源行索引:', rowIndex, '图片索引:', data.index);

      // 清除可能残留的拖拽样式
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });

      // 记录拖拽源信息
      this.dragSourceIndex = rowIndex;
      this.dragImageIndex = data.index;

      // 将拖拽信息保存到全局属性，以确保跨组件传递可靠
      window._sopDragInfo = {
        sourceIndex: rowIndex,
        imageIndex: data.index
      };

      // 添加全局样式类来显示正在拖拽状态
      document.body.classList.add('sop-dragging');
    },

    /** 处理图片拖拽结束 */
    handleDragEnd(evt) {
      console.log('拖拽结束');

      // 清除所有拖拽相关样式
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });

      // 移除拖拽状态类
      document.body.classList.remove('sop-dragging');

      // 不主动清除全局拖拽信息，等待拖放事件触发后处理
    },

    /** 处理跨行拖拽 - 简化版 */
    handleCrossRowDrop(data) {
      console.log('跨行拖拽事件触发', data);

      try {
        // 安全获取行索引
        const sourceRowId = parseInt(data.sourceRowId);
        const targetRowId = parseInt(data.targetRowId);

        // 检查行索引是否有效
        if (isNaN(sourceRowId) || isNaN(targetRowId) ||
          sourceRowId < 0 || sourceRowId >= this.form.list.length ||
          targetRowId < 0 || targetRowId >= this.form.list.length) {
          console.error('无效的行索引');
          return;
        }

        // 获取源行和目标行
        const sourceRow = this.form.list[sourceRowId];
        const targetRow = this.form.list[targetRowId];

        // 安全检查
        if (!sourceRow || !targetRow) {
          console.error('无效的行数据');
          return;
        }

        // 获取拖拽的图片数据
        let draggedImage = '';
        if (data.event && data.event.dataTransfer) {
          try {
            const dragData = data.event.dataTransfer.getData('text/plain');
            const sourceData = JSON.parse(dragData);
            if (sourceData && sourceData.image) {
              draggedImage = sourceData.image;
            }
          } catch (e) {
            console.error('解析拖拽数据出错', e);
          }
        }

        if (!draggedImage) {
          console.error('无法获取拖拽图片数据');
          return;
        }

        // 直接将图片添加到目标行
        let targetImages = targetRow.file ? targetRow.file.split(',') : [];
        targetImages.push(draggedImage);
        targetRow.file = targetImages.join(',');

        console.log('已将图片添加到行:', targetRowId);

        // 更新视图
        this.$forceUpdate();
      } catch (e) {
        console.error('处理跨行拖拽错误:', e);
      }
    },

    /** 处理图片放置 */
    handleImageDrop(data, targetRowIndex) {
      console.log('图片放置事件', data, targetRowIndex);

      // 检查是否是同行内拖拽
      if (data.samelist === true) {
        console.log('同行拖拽，已由组件内部处理');
        return;
      }

      // 如果是跨组件拖拽，直接使用fromUid和toUid来确定行索引
      if (data.fromUid !== undefined && data.toUid !== undefined) {
        console.log('跨组件拖拽检测，fromUid:', data.fromUid, 'toUid:', data.toUid);

        // 尝试根据元素UID找到对应的行索引
        const rowElems = document.querySelectorAll('.upload-queue');
        let sourceRowIndex = -1;
        let targetRowIndex = -1;

        // 遍历查找组件实例的UID匹配
        rowElems.forEach((el, idx) => {
          const vueInstance = el.__vue__;
          if (vueInstance && vueInstance._uid === data.fromUid) {
            sourceRowIndex = idx;
          }
          if (vueInstance && vueInstance._uid === data.toUid) {
            targetRowIndex = idx;
          }
        });

        if (sourceRowIndex !== -1 && targetRowIndex !== -1) {
          console.log('找到对应行：源行', sourceRowIndex, '目标行', targetRowIndex);
          data.sourceIndex = sourceRowIndex;
          data.targetIndex = targetRowIndex;
        }
      }

      // 如果没有全局拖拽信息，尝试今data中提取
      if (!window._sopDragInfo) {
        if (data && data.image) {
          // 可能是原生HTML5拖拽的情况
          console.log('使用原生拖拽数据', data);
          const dragImage = data.image;

          // 先在所有行中找到含有这个图片URL的行
          let dragSourceIndex = -1;
          let dragImageIndex = -1;

          for (let i = 0; i < this.form.list.length; i++) {
            const rowImages = this.form.list[i].file ? this.form.list[i].file.split(',') : [];
            const imgIndex = rowImages.indexOf(dragImage);
            if (imgIndex !== -1) {
              dragSourceIndex = i;
              dragImageIndex = imgIndex;
              break;
            }
          }

          if (dragSourceIndex !== -1 && dragImageIndex !== -1) {
            console.log('找到源图片在行:', dragSourceIndex, '索引:', dragImageIndex);
          } else {
            console.log('无法找到源图片');
            return;
          }

          // 创建一个拥有最小所需信息的对象
          window._sopDragInfo = {
            sourceIndex: dragSourceIndex,
            imageIndex: dragImageIndex,
            image: dragImage
          };
        } else {
          console.log('没有找到拖拽信息');
          return;
        }
      }

      const dragSourceIndex = window._sopDragInfo.sourceIndex;
      const dragImageIndex = window._sopDragInfo.imageIndex;

      console.log('放置到行:', targetRowIndex, '从行:', dragSourceIndex);

      // 如果是同一行内的拖拽，组件内部已处理
      if (dragSourceIndex === targetRowIndex) {
        console.log('同行拖拽，已在组件内部处理');
        window._sopDragInfo = null; // 清除全局信息
        return;
      }

      // 获取源行和目标行
      const sourceRow = this.form.list[dragSourceIndex];
      const targetRow = this.form.list[targetRowIndex];

      // 如果源或目标不存在，则退出
      if (!sourceRow || !targetRow) {
        console.log('源或目标行不存在');
        window._sopDragInfo = null; // 清除全局信息
        return;
      }

      try {
        // 源行的图片列表
        const sourceImages = sourceRow.file ? sourceRow.file.split(',') : [];

        // 如果源行没有图片或索引无效，则退出
        if (sourceImages.length === 0 || dragImageIndex >= sourceImages.length) {
          console.log('源图片或索引无效');
          window._sopDragInfo = null; // 清除全局信息
          return;
        }

        // 获取要移动的图片URL
        const imageToMove = sourceImages[dragImageIndex];
        console.log('移动图片:', imageToMove);

        // 从源行图片列表中删除
        sourceImages.splice(dragImageIndex, 1);
        sourceRow.file = sourceImages.join(',');

        // 添加到目标行图片列表
        const targetImages = targetRow.file ? targetRow.file.split(',') : [];

        // 如果有指定目标位置，则插入，否则添加到末尾
        if (data.targetIndex !== undefined) {
          targetImages.splice(data.targetIndex, 0, imageToMove);
        } else {
          targetImages.push(imageToMove);
        }

        targetRow.file = targetImages.join(',');
        console.log('更新后的目标行图片:', targetRow.file);

        // 移动后执行保存
        this.onSaveItem(sourceRow);
        this.onSaveItem(targetRow);
      } catch (e) {
        console.error('拖拽处理错误', e);
      } finally {
        // 清除全局拖拽信息
        window._sopDragInfo = null;
        this.dragSourceIndex = -1;
        this.dragImageIndex = -1;
        this.dragOverIndex = -1;

        // 移除所有拖拽样式
        document.body.classList.remove('sop-dragging');
        document.querySelectorAll('.drag-over,.dragging').forEach(el => {
          el.classList.remove('drag-over');
          el.classList.remove('dragging');
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
        const { data } = response;
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
              // 查找空项或添加新项
              const emptyIndex = this.form.list.findIndex(item => !item.file);
              if (emptyIndex !== -1) {
                // 更新空项
                this.form.list[emptyIndex].file = imageData.url;
                // 如果序号未定义，则自动设置序号
                if (!this.form.list[emptyIndex].indexNum) {
                  this.form.list[emptyIndex].indexNum = maxIndexNum + idx + 1;
                }
              } else {
                // 如果没有空项，则添加新项，并设置自增序号
                this.form.list.push({
                  indexNum: maxIndexNum + idx + 1, // 从最大序号+1开始
                  file: imageData.url,
                  remark: ''
                });
              }
            });
            // 更新站位盒子引用
            this.onSetStationBoxRef();
            this.msgSuccess('PDF转换成功');
          } else {
            // 处理单个URL的情况
            const emptyIndex = this.form.list.findIndex(item => !item.file);
            if (emptyIndex !== -1) {
              this.form.list[emptyIndex].file = data.data;
            } else {
              // 如果没有空项，则添加新项
              this.form.list.push({
                indexNum: undefined,
                file: data.data,
                remark: ''
              });
              this.onSetStationBoxRef();
            }
            this.msgSuccess('PDF转换成功');
          }
        } else {
          this.msgError(data.msg || 'PDF转换失败');
        }
      }).catch(error => {
        console.error('PDF转换失败:', error);
        this.msgError('PDF转换上传失败，请重试');
      }).finally(() => {
        this.isSubLoading = false;
        // 重置文件输入框，以便于再次选择同一文件
        this.$refs.pdfFileInput.value = '';
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      if (this.checkListItem()) return;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          if (this.form.id) {
            sopUpdate(this.form)
              .then(() => {
                this.msgSuccess("修改成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          } else {
            sopSave(this.form)
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
  },
};
</script>

<style lang="scss" scoped>
.after-sale-box {
  .el-dialog__body {
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
    max-height: 500px;
    overflow: hidden;
    overflow-y: auto;
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
}
</style>