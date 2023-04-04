<template>
  <div class="post-form">
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      top="5vh"
      append-to-body
      :width="width"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        :inline="inline"
        label-width="85px"
        @submit.native.prevent
      >
        <el-form-item
          label="项目名:"
          prop="name"
          v-if="keyName == 'name' || keyName == ''"
        >
          <el-input
            v-model="form.name"
            ref="name"
            placeholder="请输入项目名"
            v-focus
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>

        <el-form-item
          label="项目经理:"
          prop="pm"
          v-if="keyName == 'pm' || keyName == ''"
        >
          <el-select v-model="form.pm" placeholder="请选择">
            <el-option
              v-for="dict in compData.pmDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="项目状态"
          prop="state"
          v-if="keyName == 'state' || keyName == ''"
        >
          <el-select v-model="form.state" placeholder="请选择">
            <el-option
              v-for="dict in compData.stateDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="工作内容"
          prop="state"
          v-if="keyName == 'name' || keyName == ''"
        >
          <el-checkbox
            v-model="item.check"
            v-for="(item, index) in workDictList"
            :label="item.name"
            :key="index"
            >{{ item.name }}</el-checkbox
          >
        </el-form-item>
        <el-form-item label="责任人:" v-if="keyName == 'userId'">
          <el-select
            v-model="form.userId"
            clearable
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="dict in compData.memberDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-row v-if="keyName == 'desc' || keyName == ''">
          <el-form-item label="项目说明:" prop="desc" style="width: 100%">
            <tinymce
              v-if="dialogVisible && checkRole(['admin', 'project_manager'])"
              v-model="form.desc"
              placeholder="请输入项目说明"
              style="width: 750px"
            />
            <div v-else v-html="form.desc"></div>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pucsDetail } from "@/api/pucs";
import tinymce from "@/views/components/Editor";
import { checkRole } from "@/utils/permission";
import {
  editProject,
  addProject,
  getWorkList,
  editProjectPlan,
} from "@/api/third/project";
// import mixins from "@/mixins";
export default {
  // mixins: [mixins],
  props: ["compData"],
  components: {
    tinymce,
  },
  data() {
    return {
      width: "900px",
      inline: true,
      dialogVisible: false,
      form: {},
      title: "",
      keyName: "",
      workDictList: [],
      // 表单校验
      rules: {
        name: [{ required: true, message: "项目名", trigger: "blur" }],
        pm: [{ required: true, message: "请选择项目经理", trigger: "blur" }],
      },
    };
  },
  directives: {
    focus: {
      // 指令的定义
      update: function (el) {
        if (el) {
          el.focus();
        }
      },
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.workDictList = this.compData.workDictList.map((item) => {
          return {
            id: item.dictValue,
            status: 1,
            name: item.dictLabel,
            check: false,
          };
        });
        if (this.form.id) {
          getWorkList({ projectId: this.form.id }).then((res) => {
            for (let key of res.data) {
              for (let keys of this.workDictList) {
                if (key.id == keys.id) {
                  keys.status = key.status;
                  keys.check = key.status == 0;
                }
              }
            }
          });
        }

        this.$nextTick(() => {
          if (this.keyName == "name") {
            this.$refs.name.focus();
          }
        });
      } else {
        this.form = {};
      }
    },
  },
  methods: {
    checkRole,
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.keyName == "userId") {
            this.updateUser(this.form);
          } else {
            this.form.workIdList = this.workDictList.map((item) => {
              return { id: item.id, status: item.check ? 0 : 1 };
            });
            if (this.form.id) {
              this.postEdit(this.form);
            } else {
              this.postAdd(this.form);
            }
          }
        }
      });
    },
    updateUser(params) {
      editProjectPlan(params).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$parent.getList();
        }
      });
      addProject;
    },
    postEdit(params) {
      editProject(params).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$parent.getList();
        }
      });
    },
    postAdd(params) {
      addProject(params).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$parent.getList();
        }
      });
    },
    // 取消按钮
    cancel() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style></style>
