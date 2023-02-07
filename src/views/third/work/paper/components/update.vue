<template>
  <div class="post-form">
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      top="3vh"
      append-to-body
      width="750px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item label="标题:" prop="name" style="width: 100%">
          <el-input
            style="width: 300px"
            v-model="form.title"
            placeholder="请输入标题"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item
          label="接收人:"
          prop="recipientUserList"
          style="width: 100%"
        >
          <el-select
            v-model="form.recipientUserList"
            multiple
            placeholder="请选择"
            style="width: 480px"
            ref="selectUserList"
            @change="changeSelectUser"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId + 'mm'"
              :label="item.userName"
              :value="item.userId"
            >
            </el-option>
          </el-select>

          <el-checkbox
            class="margin-left-sm"
            v-model="checked"
            @change="selectAll"
            >选择所有人</el-checkbox
          >
        </el-form-item>
        <el-form-item label="类型:" prop="remindType">
          <el-radio-group v-model="form.remindType">
            <el-radio :label="1">
              <el-tag type="warning"> 提示 </el-tag>
            </el-radio>
            <el-radio :label="2">
              <el-tag type="warning"> 催办 </el-tag>
            </el-radio>
            <el-radio :label="3">
              <el-tag type="danger"> 紧急 </el-tag>
            </el-radio>
            <el-radio :label="4"
              ><el-tag type="danger"> 风险 </el-tag>
            </el-radio>
            <el-radio :label="5"><el-tag type="info"> 备忘 </el-tag> </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="任务时间:" prop="overTime">
          <el-date-picker
            ref="datePicker"
            :picker-options="pickerOptions"
            style="width: 300px"
            v-model="form.overTime"
            type="datetime"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format=" yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="内容类型:" prop="content" class="style-flex">
          <div>
            <el-radio-group v-model="type" @change="changeType">
              <el-radio :label="2">自定义内容</el-radio>
              <el-radio :label="1">推荐内容</el-radio>
            </el-radio-group>
          </div>
          <div>
            <div v-if="type == 1">
              <el-radio-group v-model="form.content" class="style-radios">
                <el-radio
                  border
                  :label="item.dictLabel"
                  v-for="(item, index) in contentList"
                  :key="index + 'cv'"
                >
                  {{ item.dictLabel }}</el-radio
                >
              </el-radio-group>
            </div>
          </div>
          <div v-if="type == 2" class="margin-top-xs">
            <tinymce
              height="220px"
              @input="clickText"
              v-model="form.content"
              v-if="dialogVisible"
            />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addProjectPaper,
  updateProjectPaper,
  projectListUrser,
} from "@/api/third/project";
import { dictUserList } from "@/api/system/user";
import tinymce from "@/views/components/Editor";
export default {
  components: {
    tinymce,
  },
  props: ["compData", "title"],

  data() {
    return {
      checked: false,
      pickerOptions: {
        // 限制收货时间不让选择今天以前的
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        },
      },
      dialogVisible: false,
      form: {},
      userList: [],
      contentList: [],
      type: 2,
      // 表单校验
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        recipientUserList: [
          { required: true, message: "请选择接收人", trigger: "blur" },
        ],
        remindType: [
          { required: true, message: "请选择类型", trigger: "blur" },
        ],
        overTime: [{ required: true, message: "请输入时间", trigger: "blur" }],
        content: [
          {
            required: true,
            message: "内容信息不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        if (this.form.projectId) {
          projectListUrser(this.form.projectId).then((res) => {
            this.userList = res.data;
          });
          this.type =
            this.contentList.findIndex(
              (item) => item.dictLabel == this.form.content
            ) > -1
              ? 1
              : 2;
        } else {
          dictUserList().then((res) => {
            this.userList = res.data;
          });
        }
      }
    },
  },
  mounted() {
    this.getDicts("sys_paper_content").then((res) => {
      this.contentList = res.data;
    });
  },
  methods: {
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        remindType: 1,
        content: "",
      };
      this.checked = false;
      this.type = 2;
      this.resetForm("form");
    },
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            updateProjectPaper(this.form).then((res) => {
              let { code } = res;
              if (code == 200) {
                this.msgSuccess("修改成功！");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addProjectPaper(this.form).then((res) => {
              let { code } = res;
              if (code == 200) {
                this.msgSuccess("新增成功！");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },

    changeType() {
      this.form.content = "";
    },
    changeSelectUser(val) {
      this.checked = val.length >= this.userList.length;
    },
    selectAll(val) {
      if (val) {
        this.form.recipientUserList = this.userList.map((item) => item.userId);
      } else {
        this.form.recipientUserList = [];
      }
    },
    // 取消按钮
    cancel() {
      this.dialogVisible = false;
    },
    clickText() {
      let _this = this;
      setTimeout(function () {
        _this.$refs.selectUserList.blur();
        _this.$refs.datePicker.handleClose();
      }, 50);
    },
  },
};
</script>

<style lang='scss'>
.style-form-word {
  .el-form-item__label {
    min-width: 100px;
  }
  .style-flex {
    display: flex;
    white-space: normal;
    .el-form-item {
      white-space: normal;
    }
  }
}
.style-radios {
  margin-top: 10px;
  .el-radio {
    // display: block;
    white-space: normal;
    height: auto;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  .el-radio__input {
    display: none;
  }
  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0;
  }
}
</style>