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
          clearable
          v-model="queryParams.title"
          placeholder="请输入标题"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="提醒类型" prop="remindType">
        <el-select
          clearable
          size="small"
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
      <el-form-item label="读取状态" prop="paperStatus">
        <el-select
          clearable
          size="small"
          v-model="queryParams.paperStatus"
          placeholder="请选择"
          @change="getList"
        >
          <el-option
            v-for="dict in paperStatusOptions"
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
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      :row-style="rowStyle"
      :height="tableHeight(-40)"
      :header-cell-style="{ background: '#909399', color: '#000000' }"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="标题" prop="title" align="center" width="330" />

      <el-table-column label="内容" align="center">
        <template slot-scope="scope">
          <div v-html="scope.row.content" class="text-left"></div>
        </template>
      </el-table-column>
      <el-table-column
        label="发送人"
        align="center"
        prop="sendUserName"
        width="120"
      />
      <!-- <el-table-column
        label="完成时间 "
        align="center"
        prop="overTime"
        width="180"
      /> -->
      <el-table-column
        label="发布时间"
        align="center"
        prop="sendTime"
        width="180"
      />
      <el-table-column label="提醒类型" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="getTagType(scope.row.remindType)">
            {{ getTag(scope.row.remindType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <!-- <el-switch
            v-model="scope.row.online"
            :active-value="0"
            active-text="在线"
            inactive-text="离线"
            :inactive-value="1"
            @change="handleOnlineChange(scope.row)"
          ></el-switch> -->
          <span
            :class="[scope.row.paperStatus == 1 ? 'text-green' : 'text-gray']"
            >{{ scope.row.paperStatus == 1 ? "已读" : "未读 " }}</span
          >
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="130"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            class="text-yellow"
            icon="el-icon-bell"
            v-if="scope.row.paperStatus == 0"
            @click="handleRead(scope.row)"
          ></el-button>
          <el-button
            type="text"
            class="text-red"
            icon="el-icon-delete"
            v-if="scope.row.paperStatus == 1"
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
  </div>
</template>

<script>
import {
  listReceive,
  paperRead,
  paperOver,
  authReceive,
} from "@/api/third/project";
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      total: 0,
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

      paperStatusOptions: [
        {
          label: "未读",
          value: 0,
        },
        {
          label: "已读",
          value: 1,
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
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listReceive(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
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
      this.open = true;
      detailSend(row.id).then((res) => {});
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids;
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        authReceive([{ id: row.id, status: 1 }]).then((res) => {
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
    handleRead(row) {
      paperRead([
        {
          id: row.id,
          status: 1,
        },
      ]).then((res) => {
        let { code } = res;
        if (code == 200) {
          this.msgSuccess("已标记为已读！");
          this.getList();
        }
      });
    },
    handleOver(row) {
      this.$confirm("此操作将标记已完成, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          paperOver([
            {
              id: row.id,
              status: 1,
            },
          ]).then((res) => {
            let { code } = res;
            if (code == 200) {
              this.msgSuccess("已标记为完成！");
              this.getList();
            }
          });
        })
        .catch(() => {});
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
    // cellStyle({ row, column, rowIndex, columnIndex }) {
    //   if (row.remindType == 1) {
    //     if (row.paperStatus == 1) {
    //       return "cursor:pointer;padding:0px;background:rgba(141, 198, 63,.4)";
    //     }
    //   } else if (row.remindType == 2) {
    //     if (row.projectStatus == 1) {
    //       return "cursor:pointer;padding:0px;background:rgba(141, 198, 63,.4)";
    //     }
    //   }
    // },
  },
};
</script>

<style></style>
