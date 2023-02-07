<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="
      showName == 'principal' || showName == 'doneTime' ? '350px' : '710px'
    "
    append-to-body
    top="10vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="82px"
      @submit.native.prevent
      v-if="dialogVisible"
      class="padding-right-xs"
      :class="{ 'row-label-style': showName }"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="showName ? 24 : 12">
            <el-form-item
              label="项目名称"
              prop="projectId"
              v-if="
                (showName == 'projectId' || !showName) && !hideObj['projectId']
              "
            >
              <el-select
                v-if="disableObj['projectId']"
                style="width: 100%"
                v-model="form.projectId"
                :disabled="disableObj['projectId']"
              >
                <el-option
                  placeholder="请选择"
                  :label="dept.dictLabel"
                  :value="dept.dictValue"
                  v-for="(dept, index) in projectListOptions"
                  :key="index"
                ></el-option>
              </el-select>

              <el-autocomplete
                v-else
                style="width: 100%"
                v-model="form.projectName"
                :fetch-suggestions="querySearchAsync"
                placeholder="请输入"
                @select="handleSelect"
              ></el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="showName ? 24 : 12">
            <el-form-item
              label="领域"
              prop="workId"
              v-if="(showName == 'workId' || !showName) && !hideObj['workId']"
            >
              <el-select
                style="width: 100%"
                v-model="form.workId"
                :disabled="disableObj['workId']"
              >
                <el-option
                  placeholder="请选择领域"
                  :label="dept.dictLabel"
                  :value="dept.dictValue"
                  v-for="(dept, index) in worKListOptions"
                  :disabled="dept.disabled"
                  :key="index"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="showName ? 24 : 12">
            <el-form-item
              label="责任人"
              prop="principal"
              v-if="showName == 'principal' || !showName"
            >
              <el-select
                style="width: 100%"
                v-model="form.principal"
                @change="$forceUpdate()"
              >
                <el-option
                  placeholder="请选择责任人"
                  :label="dept.dictLabel"
                  :value="dept.dictValue"
                  v-for="(dept, index) in taskMemberOptions"
                  :key="index"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="showName ? 24 : 12">
            <el-form-item
              label="完成时间"
              prop="doneTime"
              v-if="showName == 'doneTime' || !showName"
            >
              <div class="flex">
                <el-date-picker
                  ref="datePicker"
                  style="width: 100%"
                  v-model="form.doneTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm:ss"
                >
                </el-date-picker>
                <!-- <el-time-picker
            popper-class="time-picker"
            v-model="form.doneTime2"
            ref="timePicker"
            placeholder="任意时间点"
          >
          </el-time-picker> -->
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <div class=" " v-if="showName != 'principal'">
          <el-form-item
            label="项目任务"
            prop="content"
            v-if="showName == 'content' || !showName"
          >
            <!-- <el-input
              type="textarea"
              v-model="form.content"
              :autosize="{ minRows: 6.5 }"
              placeholder="请输入项目任务"
              show-word-limit
            ></el-input> -->
            <tinymce
              v-if="dialogVisible"
              v-model="form.content"
              placeholder="请输入"
              height="150"
            ></tinymce>
          </el-form-item>
          <el-form-item
            label="进展&问题点"
            prop="problem"
            v-if="
              (showName == 'problem' || !showName) &&
              form.id &&
              !disableObj['problem']
            "
          >
            <el-input
              type="textarea"
              placeholder="请输入内容"
              v-model="form.problem"
              :autosize="{ minRows: 6.5 }"
            >
            </el-input>
          </el-form-item>
          <el-form-item
            label="附件"
            style="width: 100%"
            prop="fileUrl"
            v-if="
              (showName == 'fileUrl' || !showName) && !disableObj['fileUrl']
            "
          >
            <DrUpload
              :limit="1"
              :isOnePic="1"
              v-model="form.fileUrl"
              class="style-width-upload el-upload-style"
            >
              <div class="text-left">
                <el-button size="small" type="primary">点击上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  taskManage,
  manageMember,
  taskManageLogAdd,
  taskManageLogUpdate,
} from "@/api/third/task";
import { mapGetters } from "vuex";
import tinymce from "@/views/components/Editor";
import { memberDictUser } from "@/api/system/user";
import { dictNameProject2 } from "@/api/third/project";
export default {
  components: { tinymce },
  props: ["title", "worKListOptions", "taskDeptOptions"],
  data() {
    return {
      hideObj: {},
      dialogVisible: false,
      taskMemberOptions: [],
      projectListOptions: [],
      disableObj: {},
      showName: "",
      // 是否显示弹出层
      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        workId: undefined,
        content: "",
      },
      // 表单校验
      rules: {
        projectId: [
          { required: true, message: "请选择项目", trigger: "change" },
        ],
        workId: [{ required: true, message: "请选择部门", trigger: "change" }],

        principal: [
          { required: true, message: "请选择责任人", trigger: "blur" },
        ],
        content: [{ required: true, message: "请输入内容", trigger: "change" }],
        doneTime: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        problem: [
          { required: true, message: "请输入问题点", trigger: "change" },
        ],
        progress: [
          { required: true, message: "请输入进展", trigger: "change" },
        ],
      },
      fnApi: "",
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
    };
  },
  mounted() {
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.taskMemberOptions = response.data;
        this.$emit("returnTaskMemberOptions", this.taskMemberOptions);
      }
    });
    this.getProjectName();
  },
  watch: {
    "form.content"(newVal) {
      let val = "";
      if (newVal) {
        val = newVal.replace(/<br\/\>/g, "\n");
        this.form.content = val;
      }
    },
    dialogVisible(val) {
      this.$nextTick(() => {
        if (val == false) {
          if (val == "doneTime") {
            this.$refs.datePicker.blur();
          }
        } else if (this.showName == "doneTime") {
          setTimeout(
            function () {
              this.$refs.datePicker.focus();
            }.bind(this),
            200
          );
        }
      });
    },
  },
  computed: {
    ...mapGetters(["userId"]),
  },

  methods: {
    getProjectName(key) {
      return new Promise((resove) => {
        dictNameProject2({ key }).then((response) => {
          if (response.code === 200) {
            this.projectListOptions = response.data;
            resove(response);
          }
        });
      });
    },
    handleSelect(e) {
      this.form.projectId = e.dictValue;
    },
    // 表单重置
    reset() {
      this.form = { content: "" };
      this.resetForm("form");
    },
    querySearchAsync(queryString, cb) {
      this.getProjectName(queryString).then((res) => {
        for (let key of res.data) {
          key.value = key.dictLabel;
        }
        cb(res.data);
      });
    },
    changeTargetIdType(val) {
      this.form.targetId = this.form.updateCondition == 4 ? [] : "";
      this.form = Object.assign({}, this.form);
    },
    preText(pretext) {
      return pretext.replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let { showName, hideObj } = this;
          let params = {};
          //私有项目和项目类型判断

          this.form.type = hideObj["projectId"] ? 2 : 1;

          //单个修改
          if (showName) {
            params[showName] = this.form[showName];
            params.id = this.form.id;
          } else {
            params = this.form;
          }
          if (params.content) {
            params.content = this.preText(params.content);
          }
          if (this.form.id) {
            //进展&问题修改单独调接口  list 中problem是JSON，新增添这赋值空字符串
            //修改前端是点击单个修改，把点击的内容复制给 problem ，并且把id追加到form字段中problemId
            if (showName == "problem") {
              let fnApi = this.form.problemId
                ? taskManageLogUpdate
                : taskManageLogAdd;
              fnApi({
                content: params[showName],
                id: this.form.problemId,
                taskManageId: params.id,
              }).then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("更新成功");
                  this.dialogVisible = false;
                  this.$parent.getList();
                  this.$emit("progressChange");
                }
              });
            } else {
              manageMember(params).then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("更新成功");
                  this.dialogVisible = false;
                  this.$parent.getList();
                }
              });
            }
          } else {
            params.accept = hideObj["projectId"] ? 0 : 1;
            taskManage(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.style-width-upload {
  .el-upload {
    width: 100%;
  }
}
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}

.el-upload-style .el-upload-list__item-name {
  white-space: normal;
}
// .el-popper {
// }
</style>

