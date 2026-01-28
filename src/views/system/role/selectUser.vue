<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="800px"
    append-to-body
  >
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
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

    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="用户名称"
        prop="userName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="用户昵称"
        prop="nickName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="邮箱"
        prop="email"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="手机"
        prop="phonenumber"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.sys_normal_disable"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { unallocatedUserList, authUserSelectAll } from "@/api/system/role";

export default {
  name: "SelectUser",
  dicts: ["sys_normal_disable"],
  props: {
    roleId: {
      type: [Number, String],
      default: undefined,
    },
  },
  data() {
    return {
      title: "选择用户",
      visible: false,
      loading: true,
      total: 0,
      userList: [],
      userIds: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
        phonenumber: undefined,
      },
    };
  },
  watch: {
    roleId: {
      handler(val) {
        this.queryParams.roleId = val;
      },
      immediate: true,
    },
  },
  methods: {
    show() {
      this.visible = true;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      unallocatedUserList(this.queryParams).then((response) => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map((item) => item.userId);
    },
    /** 提交按钮 */
    submitForm() {
      if (!this.userIds.length) {
        this.$modal.msgWarning("请选择用户");
        return;
      }
      const roleId = this.queryParams.roleId;
      const userIds = this.userIds.join(",");
      this.$modal
        .confirm("确认选择已选用户授权吗？")
        .then(function () {
          return authUserSelectAll({ roleId: roleId, userIds: userIds });
        })
        .then(() => {
          this.$modal.msgSuccess("授权成功");
          this.visible = false;
          this.userIds = [];
          this.$emit("ok");
        })
        .catch(() => {});
    },
    /** 关闭按钮 */
    close() {
      this.visible = false;
      this.userIds = [];
    },
  },
};
</script>
