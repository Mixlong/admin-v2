<template>
  <el-dialog
    title="项目公告"
    :visible.sync="open"
    v-if="open"
    top="5vh"
    center
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-form-item label="项目" prop="projectId">
          <el-select
            v-model="form.projectId"
            clearable
            size="small"
            style="width: 185px"
          >
            <el-option
              v-for="dict in nameDictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="标题:" prop="title">
            <el-input
              v-model="form.title"
              v-focus
              placeholder="请输入标题"
              style="width: 185px"
              @keyup.enter.native.prevent="submitForm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型:" prop="tagId">
            <el-select v-model="form.tagId" clearable style="width: 185px">
              <el-option
                v-for="dict in noteTagDict"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="内容:" prop="content">
        <tinymce v-model="form.content" placeholder="请输入内容"></tinymce>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="open = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { taskDictDept } from "@/api/third/task";
import { addProjectNote } from "@/api/third/projectNote";
import { dictNameProject2 } from "@/api/third/project";
import tinymce from "@/views/components/Editor";
export default {
  components: {
    tinymce,
  },
  directives: {
    // 注册一个局部的自定义指令 v-focus
    focus: {
      // 指令的定义
      inserted: function (el) {
        // 聚焦元素
        el.querySelector("input").focus();
      },
    },
  },
  data() {
    return {
      // 是否显示弹出层
      open: false,
      form: {
        projectId: "",
        title: "",
        content: "",
      },
      nameDictMap: [],
      nameDictList: [],
      // 表单校验
      rules: {
        projectId: [
          { required: true, message: "项目不能为空", trigger: "blur" },
        ],
        tagId: [{ required: true, message: "类型不能为空", trigger: "blur" }],
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        content: [{ required: true, message: "内容不能为空", trigger: "blur" }],
      },
    };
  },
  mounted() {
    taskDictDept().then((response) => {
      this.workDictList = response.data;
    });
    this.getDicts("project_note_label").then((response) => {
      this.noteTagDict = response.data;
    });

    dictNameProject2().then((response) => {
      if (response.code === 200) {
        this.nameDictList = response.data;
        this.nameDictList.forEach((n) => {
          this.nameDictMap[n.dictValue] = n.dictLabel;
        });
      }
    });
  },
  methods: {
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editProjectNote(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addProjectNote(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style>
</style>