<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="产品品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          filterable
          clearable
          placeholder="请选择产品品类"
          class="w100"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
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
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="产品型号"
        prop="name"
        align="center"
        width="150"
      />
      <el-table-column label="描述" prop="desc" align="center" />
      <el-table-column label="许可状态" align="center" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isLicense"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作人"
        prop="createBy"
        align="center"
        width="150"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-tickets"
            content="操作记录"
            @click="handleLog(scope.row.id)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 操作记录 -->
    <el-dialog title="操作记录" center :visible.sync="isTask">
      <el-table
        v-loading="loading"
        :data="logList"
        top="1vh"
        border
        height="500"
      >
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="文件名称"
          prop="typeName"
          align="center"
        />
        <el-table-column label="文件key" prop="type" align="center" />
        <el-table-column label="操作内容" prop="msg" align="center" />
        <el-table-column
          label="操作人"
          prop="operationName"
          align="center"
          width="150"
        />
        <el-table-column
          label="创建时间"
          prop="operationTime"
          align="center"
          width="180"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  computerLicenseList,
  computerUpdate,
  computerLogList,
} from "@/api/third/testApi";
import { categoryComputerDict } from "@/api/third/fileConfig";

export default {
  name: 'ProdPermit',
  data() {
    return {
      // 遮罩层
      loading: false,
      list: [],
      // 任务变更
      isTask: false,
      taskForm: {},
      // 品类
      dictList: [],
      // 操作日志
      logList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryId: "",
      },
    };
  },
  created() {
    // 品类
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      computerLicenseList(this.queryParams)
        .then((response) => {
          this.list = response.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 启用、禁用
    handleStatus(row) {
      let text = row.isLicense ? "许可" : "不许可";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return computerUpdate({
            id: row.id,
            isLicense: row.isLicense,
          });
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.isLicense = row.isLicense ? 0 : 1;
        });
    },
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
    // 任务变更
    async handleLog(id) {
      this.isTask = true;

      try {
        const res = await computerLogList({ computerId: id });
        this.logList = res.data;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
