<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="责任人" prop="createUser">
        <el-select
          v-model="queryParams.createUser"
          clearable
          placeholder="请选择责任人"
        >
          <el-option
            v-for="(item, index) in pmDictListOptions"
            :label="item.userName"
            :value="+item.userId"
            :key="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="完成状态：" prop="state">
        <el-select
          v-model="queryParams.state"
          size="mini"
          clearable
          placeholder="请选择完成状态"
        >
          <el-option label="未完成" value="0" />
          <el-option label="已完成" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
        <el-form-item prop="isMy">
          <el-checkbox
            class="margin-left-sm"
            v-model="queryParams.isMy"
            true-label="1"
            false-label="0"
            @change="handleQuery"
          >
            只看我的
          </el-checkbox>
        </el-form-item>
      </el-form-item>
      <el-button
        class="fr"
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
      >
        新增
      </el-button>
    </el-form>

    <el-table
      v-loading="loading"
      ref="elTable"
      class="sort-table"
      :data="homeEmphasisLists"
      border
    >
      <el-table-column prop="item" label="事项" align="center" width="160" fixed="left" />
      <el-table-column
        prop="content"
        label="具体工作内容及要求"
        header-align="center"
      >
        <template slot-scope="scope">
          <div class="content_style" v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="完成结果" header-align="center">
        <span slot-scope="scope" v-html="scope.row.result"></span>
      </el-table-column>  
      <el-table-column
        prop="planTime"
        label="计划完成时间"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.planTime, "{y}-{m}-{d} {h}:{i}:{s}") }}
        </template>
      </el-table-column>
      <el-table-column
        prop="completeTime"
        label="实际完成时间"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.completeTime, "{y}-{m}-{d} {h}:{i}:{s}") }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="完成状态" align="center" width="80">
        <template slot-scope="scope">
          <div class="flex flex-direction align-center">
            <el-tag
              class="margin-bottom-xs"
              type="danger"
              v-if="!isPostpone(scope.row.planTime) && scope.row.state === 0"
            >
              未完成
            </el-tag>
            <el-tag
              class="margin-bottom-xs"
              type="success"
              v-if="scope.row.state === 1"
              >已完成</el-tag
            >
            <el-tag
              type="danger"
              v-if="isPostpone(scope.row.planTime) && scope.row.state === 0"
            >
              已延期
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="nickName" label="责任人" align="center" width="120">
        <template slot-scope="scope">
          <el-tag>
            {{ scope.row.nickName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="配合责任人" align="center" width="100">
        <template slot-scope="scope">
          <div :style="tagStyle">
            <el-tag v-for="item in scope.row.list" :key="item.id">
              {{ item.nickName }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="抄送人员" align="center" width="100">
        <template slot-scope="scope">
          <div :style="tagStyle">
            <el-tag v-for="item in scope.row.copyList" :key="item.id">
              {{ item.nickName }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="createBy"
        label="创建人"
        align="center"
        width="70"
      />
      <el-table-column
        prop="createTime"
        label="创建时间"
        align="center"
        width="150"
        sortable
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}") }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="60" fixed="right">
        <template slot-scope="scope">
          <div class="flex flex-direction align-center">
            <template v-if="scope.row.state === 0">
              <Tooltip
                v-if="scope.row.createBy === nickName"
                icon="el-icon-edit"
                content="编辑"
                @click="handleUpdate(scope.row)"
              />
              <Tooltip
                class="mlZero"
                v-if="+scope.row.createUser === userId"
                icon="el-icon-check"
                content="完成任务"
                @click="handleComplete(scope.row)"
              />
            </template>
            <Tooltip
              v-if="scope.row.createBy === nickName"
              icon="el-icon-delete"
              :class="['text-red', 'mlZero']"
              content="删除"
              @click="handleDelete(scope.row)"
            />
          </div>
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

    <Update
      ref="Update"
      :visible.sync="openUpdate"
      :pmDictListOptions="pmDictListOptions"
    />

    <el-dialog
      title="确定该任务完成吗？"
      width="600px"
      :visible.sync="isResultVisible"
      center
    >
      <el-form
        ref="resForm"
        :model="resForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="完成结果" prop="result">
          <tinymce
            v-if="isResultVisible"
            v-model="resForm.result"
            height="250"
            placeholder="请输入完成结果"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="isResultVisible = false">
          取 消
        </el-button>
        <el-button
          size="small"
          type="primary"
          :loading="isResLoading"
          @click="onSubmit"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  emphasisList,
  emphasisDel,
  emphasislogComplete,
} from "@/api/third/emphasis";
import Sortable from "sortablejs";
import { mapGetters } from "vuex";
import { dutyUserList } from "@/api/system/user";

import Update from "@/views/third/emphasis/components/update";

export default {
  name: 'Emphasis',
  components: {
    Update,
    Sortable,
    tinymce: () => import("@/views/components/Editor"),
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      isResultVisible: false,
      // 总条数
      total: 0,
      homeEmphasisLists: [],
      pmDictListOptions: [],
      openUpdate: false,
      isResLoading: false,
      resForm: {
        result: "",
      },
      rules: {
        result: [
          { required: true, message: "请输入完成结果", trigger: "blur" },
        ],
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        state: "",
        isMy: 0,
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "nickName"]),
    isPostpone() {
      return (planTime) => {
        return planTime < +new Date();
      };
    },
    tagStyle() {
      return {
        display: "grid",
        "grid-template-columns": "1fr",
        "grid-row-gap": "5px",
      };
    },
  },
  watch: {
    "resForm.result"(val) {
      if (val) {
        this.clearValidateItem("resForm", "result");
      }
    },
  },
  mounted() {
    dutyUserList().then((res) => {
      this.pmDictListOptions = res.data;
    });
    this.getList();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    getList() {
      this.loading = true;
      emphasisList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.homeEmphasisLists = list;
        this.total = total;
        this.loading = false;
      });
    },
    // 完成任务
    handleComplete(row) {
      this.isResultVisible = true;
      this.resForm.result = "";
      this.resForm = { ...this.resForm, ...row };
    },
    onSubmit() {
      this.$refs["resForm"].validate((valid) => {
        if (valid) {
          this.isResLoading = true;
          emphasislogComplete(this.resForm)
            .then(() => {
              this.getList();
              this.msgSuccess("操作成功");
            })
            .finally(() => {
              this.isResultVisible = false;
              this.isResLoading = false;
            });
        }
      });
    },
    handleAdd() {
      this.openUpdate = true;
      this.$refs.Update.reset();
      this.$refs.Update.title = "新增重点事项";
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        "是否删除" + '"' + +row.projectName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return emphasisDel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    handleUpdate(row) {
      this.openUpdate = true;
      this.$refs.Update.reset();
      const copyRow = Object.assign({}, row);
      const { list, copyList } = row;
      if (list && list.length) {
        copyRow.list = list.map((item) => item.userId);
      }
      if (copyList && copyList.length) {
        copyRow.copyList = copyList.map((item) => item.userId);
      }
      this.$refs.Update.form = copyRow;
      this.$refs.Update.title = "修改重点事项";
    },
  },
};
</script>
<style lang="scss" scoped>
.sort-table {
  .content_style {
    max-height: 350px;
    overflow-y: auto;
  }
}
</style>
