<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-09-18 20:05:34
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-16 14:05:53
 * @FilePath: \FILECONF-UI\src\views\third\afterSale\components\addSale.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- 添加售后 -->
  <el-dialog
    class="after-sale-box"
    :title="isTitle"
    :visible="visible"
    width="900px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="品类" prop="categoryId">
            <el-select
              v-model="form.categoryId"
              filterable
              allow-create
              clearable
              style="width: 100%"
              placeholder="请选择品类"
            >
              <el-option
                v-for="dict in dictList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="versionCode">
            <el-input
              v-model="form.versionCode"
              clearable
              style="width: 100%"
              placeholder="请输入版本号"
            />
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="版本描述" prop="desc">
            <el-input
              v-model="form.desc"
              type="textarea"
              clearable
              :rows="4"
              style="width: 100%"
              placeholder="请输入版本描述"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="添加工位文件："
          required
          label-width="120px"
          class="add-file-sticky"
        >
          <el-button
            class="save-btn"
            v-if="form.list.length < 100"
            type="primary"
            icon="el-icon-plus"
            circle
            @click="onAddStationFile"
          />
        </el-form-item>
        <draggable
          v-model="form.list"
          animation="1000"
          handle=".mover"
          @start="drag = true"
          @end="drag = false"
        >
          <transition-group
            name="fade-transform-sop"
            tag="div"
            ref="stationBoxRef"
            class="station_box"
          >
            <el-row
              type="flex"
              justify="space-between"
              align="middle"
              :gutter="5"
              v-for="(item, index) in form.list"
              :key="index"
              class="margin-bottom-sm"
            >
              <!-- <el-col :span="1" class="text-center">
                {{ index + 1 }}
              </el-col> -->
              <el-col :span="23">
                <el-row
                  type="flex"
                  :gutter="10"
                  align="middle"
                  class="file_list_box"
                >
                  <el-col :span="1" class="text-center move-tag mover">
                    <i class="el-icon-menu"></i>
                  </el-col>
                  <el-col :span="3">
                    <el-form-item
                      label=""
                      label-width="0"
                      :prop="`list[${index}].indexNum`"
                      :rules="rules.indexNum"
                    >
                      <el-input-number
                        v-model="item.indexNum"
                        clearable
                        :min="0"
                        controls-position="right"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="14">
                    <el-form-item
                      label=""
                      label-width="0"
                      :prop="`list[${index}].file`"
                      :rules="rules.file"
                      :style="{ marginBottom: item.file ? 0 : '18px' }"
                    >
                      <el-upload-sortable
                        v-model="item.file"
                        :action="actionUrl"
                        :imgW="60"
                        :imgH="60"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <div class="flex">
                      <el-form-item
                        label=""
                        label-width="0"
                        :prop="`list[${index}].remark`"
                        :rules="rules.remark"
                      >
                        <el-input
                          v-model="item.remark"
                          clearable
                          placeholder="请输入工位文件描述"
                          style="width: 100%"
                        />
                      </el-form-item>
                      <!-- 保存 -->
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="保存"
                        placement="top-end"
                      >
                        <el-button
                          type="primary"
                          icon="el-icon-check"
                          circle
                          class="margin-left-xs save-btn"
                          @click="onSaveItem(item)"
                        />
                      </el-tooltip>
                      <!-- 复制 -->
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="复制"
                        placement="top-end"
                      >
                        <el-button
                          type="warning"
                          icon="el-icon-copy-document"
                          circle
                          class="margin-left-xs save-btn"
                          @click="onCopyItem(index)"
                        />
                      </el-tooltip>
                    </div>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="1" class="text-center">
                <el-button
                  v-if="index !== 0"
                  type="danger"
                  icon="el-icon-minus"
                  circle
                  class="save-btn"
                  @click="removeSopData(item)"
                  style="margin-top: -6px"
                />
              </el-col>
            </el-row>
          </transition-group>
        </draggable>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>
  

<script>
import { sopSave, sopUpdate } from "@/api/third/testApi";
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
      drag: false,
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
      for (const key in item) {
        if (this.Is_Empty(item[key])) {
          return this.msgError("请填入必要信息");
        }
      }
      if (this.form.id) {
        sopUpdate(this.form).then(() => {
          this.msgSuccess("保存成功");
        });
      } else {
        sopSave(this.form).then(() => {
          this.msgSuccess("保存成功");
        });
      }
    },
    /** 复制 */
    onCopyItem(index) {
      const item = { ...this.form.list[index], id: "" };
      this.form.list.splice(index + 1, 0, item);

      // this.onSetStationBoxRef();
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
    max-height: 90vh;
    overflow: hidden;
    overflow-y: auto;
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
    border-bottom: 1px solid #ddd;
    padding-top: 20px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 3px;
  }

  .move-tag {
    width: 30px;
    height: 30px;
    cursor: move;
    font-size: 18px;
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
    // box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.5);
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background-color: transparent;
    }
  }
}
</style>
  
  