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
      <el-table-column prop="item" label="事项" align="center" width="160" />
      <el-table-column
        prop="content"
        label="具体工作内容及要求"
        header-align="center"
      >
        <template slot-scope="scope">
          <div class="content_style" v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column
        prop="planTime"
        label="计划完成时间"
        align="center"
        width="160"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.planTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="completeTime"
        label="实际完成时间"
        align="center"
        width="160"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.completeTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="完成状态" align="center" width="140">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.state === 0">未完成</el-tag>
          <el-tag type="success" v-if="scope.row.state === 1">已完成</el-tag>
          <el-tag
            class="margin-left-xs"
            type="danger"
            v-if="isPostpone(scope.row.planTime) && scope.row.state === 0"
          >
            已延期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="责任人"
        align="center"
        width="160"
      />
      <el-table-column
        prop="createBy"
        label="创建人"
        align="center"
        width="160"
      />
      <el-table-column
        prop="createTime"
        label="创建时间"
        align="center"
        width="160"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template slot-scope="scope">
          <template v-if="scope.row.state === 0">
            <Tooltip
              v-if="scope.row.createBy === nickName"
              icon="el-icon-edit"
              content="编辑"
              @click="handleUpdate(scope.row)"
            />
            <Tooltip
              v-if="+scope.row.createUser === userId"
              icon="el-icon-news"
              content="完成任务"
              @click="handleComplete(scope.row.id)"
            />
          </template>
          <Tooltip
            v-if="scope.row.createBy === nickName"
            icon="el-icon-delete"
            :class="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
          />
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
  components: {
    Update,
    Sortable,
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      homeEmphasisLists: [],
      pmDictListOptions: [],
      openUpdate: false,
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
    handleComplete(id) {
      this.$confirm("确定该任务完成吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return emphasislogComplete(id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("操作成功");
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
      this.$refs.Update.form = Object.assign({}, row);
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
