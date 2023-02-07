<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="项目名" prop="key">
        <el-select
          v-model="queryParams.key"
          placeholder="请选择"
          @change="changeState"
          size="small"
        >
          <el-option
            v-for="dict in nameDictList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="tagId">
        <el-select
          v-model="queryParams.tagId"
          placeholder="请选择"
          @change="changeState"
          size="small"
        >
          <el-option
            v-for="dict in noteTagDict"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasRole="['admin', 'project_manager', 'sale']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasRole="['admin', 'project_manager', 'sale']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleDel(1)"
          >删除</el-button
        >
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="projectNoteList"
      @selection-change="handleSelectionChange"
      :height="tableHeight()"
      border
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column align="center" label="项目名称" width="150px">
        <template slot-scope="scope">
          <div class="flex align-center">
            <div v-show="scope.row.read == 0" class="circle-tip"></div>
            <div>
              {{ getProjectName(scope.row.projectId) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="公告标题"
        prop="title"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        align="center"
        label="公告类型"
        :show-overflow-tooltip="true"
        width="80px"
      >
        <template slot-scope="scope">
          <el-tag :type="getTagType(scope.row.tagId)">
            {{ getTag(scope.row.tagId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="发布人"
        prop="createBy"
        :show-overflow-tooltip="true"
        width="80px"
      />
      <el-table-column
        align="center"
        label="发布时间"
        prop="createTime"
        :show-overflow-tooltip="true"
        width="180px"
      />
      <!--      <el-table-column  align="center" label="阅读状态" prop="customerName" :show-overflow-tooltip="true"  />-->
      <el-table-column
        align="center"
        label="操作"
        class-name="small-padding fixed-width"
        width="200px"
      >
        <template slot-scope="scope">
          <el-button
            v-hasRole="['admin', 'project_manager', 'sale']"
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleCheckReadNote(scope.row)"
            >查看已读情况
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleCheck(scope.row)"
            >详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      v-if="open"
      center
      append-to-body
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
                placeholder="请输入标题"
                style="width: 185px"
                @keyup.enter.native.prevent="submitForm"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型:" prop="tagId">
              <el-select
                v-model="form.tagId"
                clearable
                size="small"
                style="width: 185px"
              >
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
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="contentDialog"
      center
      append-to-body
    >
      <div>
        <div v-html="noteContent"></div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="noteContentSub">确 认</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="checkReadNoteDialog"
      center
      append-to-body
    >
      <div>
        <el-table v-loading="loading" :data="checkReadNoteList">
          <el-table-column
            align="center"
            label="姓名"
            prop="nickName"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            align="center"
            label="工作内容"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div>{{ getWork(scope.row.workId) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="阅读状态"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div>{{ scope.row.read == 1 ? "已读" : "未读" }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="checkReadNoteDialogSub"
          >确 认</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      title="请确认是否删除"
      :visible.sync="delDialogVisible"
      width="30%"
      center
    >
      <el-row style="display: flex">
        <el-input
          auto-complete="off"
          placeholder="验证码"
          v-model="auth.code"
          style="width: 60%; margin-right: 20px"
        >
        </el-input>
        <img @click="getCode" :src="codeUrl" />
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDelSub(0)">取 消</el-button>
        <el-button type="primary" @click="handleDelSub(1)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listProjectNote,
  delProjectNote,
  addProjectNote,
  checkReadProjectNote,
  editProjectNote,
  readProjectNote,
} from "@/api/third/projectNote";
import { dictNameProject2 } from "@/api/third/project";
import tinymce from "@/views/components/Editor";
import { getCodeImg } from "@/api/base/code";
import { mapState } from "vuex";
import store from "@/store";
import { taskDictDept } from "@/api/third/task";
export default {
  name: "ProjectNote",
  components: {
    tinymce,
  },
  computed: {
    ...mapState(["user"]),
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      contentDialog: false,
      checkReadNoteDialog: false,
      delDialogVisible: false,
      // 选中数组
      ids: [],
      workDictList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      projectNoteList: [],
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      noteTagDict: [],
      codeUrl: "",
      // 弹出层标题
      title: "",
      noteContent: undefined,
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      checkReadNoteList: [],
      nameDictList: [],
      nameDictMap: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        key: undefined,
      },
      // 表单参数
      form: {},
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
  created() {},
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

    this.getList();
  },
  methods: {
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.auth.uuid = res.uuid;
      });
    },
    handleDel() {
      this.getCode();
      this.delDialogVisible = true;
      this.auth.code = undefined;
    },
    getProjectName(id) {
      return this.nameDictMap[id];
    },
    changeState() {
      this.getList();
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listProjectNote(this.queryParams).then((response) => {
        this.projectNoteList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    getWork(workId) {
      if (workId) {
        return this.workDictList.filter((item) => item.dictValue == workId)[0]
          .dictLabel;
      } else {
        return "";
      }
    },
    getTag(tagId) {
      if (tagId) {
        return this.noteTagDict.filter((item) => item.dictValue == tagId)[0]
          .dictLabel;
      } else {
        return "";
      }
    },
    getTagType(tagId) {
      switch (tagId) {
        case "1":
          return "warning";
        case "2":
          return "warning";
        case "3":
          return "danger";
        case "4":
          return "danger";
      }
    },
    // 用户状态修改
    handleStatusChange(row) {
      this.$confirm("确认要删除吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let authData = { id: row.id, status: 1 };
          let data = [];
          data.push(authData);
          delProjectNote(data).then((response) => {
            this.msgSuccess("删除成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {});
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        id: undefined,
        p: 1,
        l: 20,
      };
      this.resetForm("form");
    },
    handleDelSub(status) {
      if (status === 1) {
        if (this.auth.code) {
          let data = [];
          for (let i = 0; i < this.ids.length; i++) {
            let authData = {
              id: this.ids[i],
              code: this.auth.code,
              uuid: this.auth.uuid,
              status: status,
            };
            data.push(authData);
          }
          delProjectNote(data).then((response) => {
            this.msgSuccess("删除成功");
            this.loading = false;
            this.delDialogVisible = false;
            this.getList();
          });
        } else {
          this.msgError("验证码不能为空");
        }
      } else {
        this.delDialogVisible = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    handleUpdate(row) {
      // this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改";
    },
    handleCheck(row) {
      // this.reset();
      this.noteContent = row.content;
      this.contentDialog = true;
      this.title = "详情";
      let data = { noteId: row.id };
      readProjectNote(data).then((response) => {
        row.read = 1;
        store.commit("SET_READ_NUM", response.data);
      });
    },
    handleCheckReadNote(row) {
      // this.reset();
      this.checkReadNoteList = [];
      this.checkReadNoteDialog = true;
      this.title = "查看已读情况";

      let data = { noteId: row.id };
      checkReadProjectNote(data).then((response) => {
        this.checkReadNoteList = response.data;
      });
    },
    noteContentSub(row) {
      this.contentDialog = false;
    },
    checkReadNoteDialogSub(row) {
      this.checkReadNoteDialog = false;
    },
    /** 提交按钮 */
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

<style lang="scss" scoped>
.circle-tip {
  display: inline-block;
  border-radius: 50%;
  min-width: 10px;
  height: 10px;
  background: red;
  margin-right: 5px;
  /* 宽度和高度需要相等 */
}
</style>
