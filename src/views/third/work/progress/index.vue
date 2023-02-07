<template>
  <div class="app-container">
    <!--   <el-form :model="queryParams" ref="queryForm" :inline="true" @submit.native.prevent>
      <el-form-item label="负责人" prop="principal">
        <el-input
          v-model="queryParams.principal"
          placeholder="请输入负责人"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>-->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-if="checkUser()"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd(undefined)"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-if="checkUser()"
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
      border
      :span-method="objectSpanMethod"
      :data="projectProgressList"
      @selection-change="handleSelectionChange"
      :height="tableHeight()"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="项目名"
        prop="name"
        align="center"
        :show-overflow-tooltip="true"
        width="160px"
      />
      <el-table-column
        label="工作内容"
        align="center"
        :show-overflow-tooltip="true"
        width="80px"
      >
        <template slot-scope="scope">
          <div>{{ getWork(scope.row.workId) }}</div>
        </template>
      </el-table-column>

      <el-table-column label="进展内容" align="center">
        <template slot-scope="scope">
          <div class="item-box">
            {{ "【" + scope.row.createTime + "】：" + scope.row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="180px"
      >
        <template slot-scope="scope">
          <el-button
            v-if="checkUser()"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="checkUser()"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleAdd(scope.row.id)"
            >插入</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="540px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-input
          ref="input"
          v-model="form.content"
          placeholder="请输入进展"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          @keyup.ctrl.enter="lineFeed()"
          @keyup.enter.exact.native.prevent="submitForm"
        />
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
  listProjectProgress,
  addProjectProgress,
  delProjectProgress,
  editProjectProgress,
} from "@/api/third/projectProgress";
import { mapGetters } from "vuex";
import { taskDictDept } from "@/api/third/task";
export default {
  name: "BikeProjectProgress",
  data() {
    return {
      // 遮罩层
      loading: true,
      projectUserId: undefined,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      projectProgressList: [],
      spanArr: [],
      workDictList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      genderOptions: [],
      projectProgressOptions: [],
      // 查询参数
      queryParams: {
        key: undefined,
      },
      // 查询参数
      projectProgressQueryParams: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    taskDictDept().then((response) => {
      this.workDictList = response.data;
    });
  },
  mounted() {
    let data = this.$route.query;
    this.queryParams.workId = data.workId;
    this.queryParams.projectId = data.projectId;
    this.projectUserId = data.projectUserId;
    this.getList();
  },
  computed: {
    ...mapGetters(["userId", "roles"]),
  },
  methods: {
    getList() {
      this.loading = true;
      listProjectProgress(this.queryParams).then((response) => {
        this.projectProgressList = response.data;
        this.loading = false;
      });
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1 || columnIndex === 2) {
        // 当 当前行与上一行内容相同时 返回0 0 意味消除
        if (
          rowIndex > 0 &&
          row[column.workId] ===
            this.projectProgressList[rowIndex - 1][column.workId]
        ) {
          return {
            rowspan: 0,
            colspan: 0,
          };
        } else {
          let rows = 1;
          // 反之 查询相同的内容有多少行 进行合并
          for (let i = rowIndex; i < this.projectProgressList.length - 1; i++) {
            if (
              row[column.workId] ===
              this.projectProgressList[i + 1][column.workId]
            ) {
              rows++;
            }
          }
          // 返回相同内容的行数
          return {
            rowspan: rows,
            colspan: 1,
          };
        }
      }
    },
    handleAdd(id) {
      this.reset();
      if (id !== undefined) {
        // 插入到此条之后
        this.form.id = id;
        this.form.insert = true;
      } else {
        // 新增
        this.form.insert = true;
        this.form.id = undefined;
      }
      this.open = true;
      this.title = "添加进展";

      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    handleDel(status) {
      this.$confirm("确认要删除吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.loading = true;

        let data = [];
        for (let i = 0; i < this.ids.length; i++) {
          data.push(this.ids[i]);
        }
        let jsonDate = {
          ids: data,
          projectId: this.queryParams.projectId,
          projectWorkId: this.queryParams.workId,
        };
        delProjectProgress(jsonDate).then((response) => {
          this.msgSuccess("删除成功");
          this.loading = false;
          this.getList();
        });
      });
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
        l: 50,
        key: undefined,
      };
      this.resetForm("form");
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
    getWork(workId) {
      return this.workDictList.filter((item) => item.dictValue === workId)[0]
        .dictLabel;
    },
    handleUpdate(row) {
      // this.reset();
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改进展";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.insert) {
            // 插入
            this.form.projectId = this.queryParams.projectId;
            this.form.projectWorkId = this.queryParams.workId;
            addProjectProgress(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            // 修改
            let data = {
              id: this.form.id,
              projectId: this.queryParams.projectId,
              projectWorkId: this.queryParams.workId,
              content: this.form.content,
            };
            editProjectProgress(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    lineFeed() {
      this.form.content = this.form.content + "\n";
    },
    checkUser() {
      for (let i = 0; i < this.roles.length; i++) {
        if (this.roles[i] === "admin" || this.roles[i] === "project_manager") {
          return true;
        }
      }
      if (this.projectUserId) {
        if (this.projectUserId == this.userId) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>

<style lang="scss" >
.item-box {
  text-align: left;
}
</style>
