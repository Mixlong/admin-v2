<template>
  <div>
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="标题" prop="title">
        <el-input
          size="small"
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="提醒类型" prop="remindType">
        <el-select
          size="small"
          clearable
          v-model="queryParams.remindType"
          placeholder="请选择"
          @change="getList"
        >
          <el-option
            v-for="dict in options"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :row-style="rowStyle"
      :data="list"
      :height="tableHeight(-55)"
      border
      :header-cell-style="{ background: '#909399', color: '#000000' }"
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="标题" prop="title" align="center" />

      <el-table-column label="内容" align="center" width="480px">
        <template slot-scope="scope">
          <div v-html="scope.row.content" class="text-left"></div>
        </template>
      </el-table-column>
      <el-table-column label="收信人" align="center">
        <template slot-scope="scope">
          <div class="text-left padding-bottom-xs">
            <el-link
              :underline="false"
              class="margin-lr-xs margin-top-xs"
              :type="item.paperStatus == 0 ? 'info' : 'success'"
              v-for="(item, index) in scope.row.recipientList"
              :key="index"
            >
              {{ fnProjectUserName(item) }}
            </el-link>
          </div>
        </template>
      </el-table-column>

      <!-- <el-table-column label="完成时间 " align="center" prop="overTime" /> -->
      <el-table-column label="发布时间" align="center" prop="sendTime" />

      <el-table-column label="提醒类型" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="getTagType(scope.row.remindType)">
            {{ getTag(scope.row.remindType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="85"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          ></el-button>

          <el-button
            type="text"
            size="mini"
            icon="el-icon-delete"
            class="margin-right-xs text-red"
            @click="handleDelete(scope.row)"
          ></el-button>
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

    <CompUpdate title="修改纸条" ref="compUpdate" />
  </div>
</template>

<script>
import { listSend, detailSend, paperAuth } from "@/api/third/project";
import CompUpdate from "./update";
import CompReadList from "./readList";
import { dictUserList } from "@/api/system/user";
import { mapGetters } from "vuex";
export default {
  components: {
    CompUpdate,
    CompReadList,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      total: 0,
      memberDictMap: {},
      options: [
        {
          label: "提示",
          value: 1,
        },
        {
          label: "催办",
          value: 2,
        },
        {
          label: "紧急",
          value: 3,
        },
        {
          label: "风险",
          value: 4,
        },
        {
          label: "备忘",
          value: 5,
        },
      ],
      open: false,
      // 用户表格数据
      list: [],
      queryParams: {
        p: 1,
        l: 50,
        projectName: undefined,
        remindType: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["nickName"]),
  },
  mounted() {
    dictUserList().then((response) => {
      if (response.code === 200) {
        for (let key of response.data) {
          this.memberDictMap[key.userId] = key.userName;
        }
        this.getList();
      }
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listSend(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    fnProjectUserName(row) {
      return this.memberDictMap[row.recipientUser];
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
    handleCheckRead(row) {
      this.$refs.compReadList.dialogVisible = true;
      this.$refs.compReadList.list = row.recipientList;
      this.$refs.compReadList.remindType = row.remindType;
      // detailSend(row.id).then((res) => {});
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids;
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        paperAuth([{ id: row.id, status: 1 }]).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    rowStyle({ row, rowIndex }) {
      let styleJson = {};
      styleJson.borderRight = "#1px solid red";
      if (rowIndex % 2 != 0) {
        styleJson.background = "#E0E0E0";
      } else {
        styleJson.background = "#ffffff";
      }
      return styleJson;
    },
    handleAdd() {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form.paperType = 1;
    },
    getTagType(tagId) {
      switch (tagId) {
        case 1:
          return "warning";
        case 2:
          return "warning";
        case 3:
          return "danger";
        case 4:
          return "danger";
        case 5:
          return "info";
      }
    },
    getTag(tagId) {
      if (tagId) {
        return this.options.filter((item) => item.value == tagId)[0].label;
      } else {
        return "";
      }
    },
    handleUpdate(row) {
      this.$refs.compUpdate.dialogVisible = true;
      let data = Object.assign({}, row);
      data.recipientUserList = data.recipientList.map(
        (item) => item.recipientUser
      );
      this.$refs.compUpdate.changeSelectUser(data.recipientUserList);
      this.$refs.compUpdate.form = data;
    },
  },
};
</script>

<style lang="scss">
.custom-style.el-popover {
  box-shadow: 12px 12px 2px 0 rgba(0, 0, 0, 0.3);
}
</style>
