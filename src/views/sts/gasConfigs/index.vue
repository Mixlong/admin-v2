<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryName">
        <el-select v-model="queryParams.categoryName" filterable clearable>
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable>
          <el-option label="启用" :value="0"></el-option>
          <el-option label="禁用" :value="1"></el-option>
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

      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        class="fr"
        v-hasPermi="['gasConfig:add:btn']"
      >
        新增
      </el-button>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        width="200"
      />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="状态" align="center" width="140">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建|修改人"
        prop="createBy"
        align="center"
        width="140"
      >
        <span
          slot-scope="{ row }"
          v-NoData="row.updateBy || row.createBy"
        ></span>
      </el-table-column>
      <el-table-column
        label="创建|修改时间"
        prop="createTime"
        align="center"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.updateTime || row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{ row }">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(row)"
            v-hasPermi="['gasConfig:edit:btn']"
          />

          <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(row)" v-hasPermi="['gasConfig:delete:btn']">
            <Tooltip
              style="margin: 0 10px"
              slot="reference"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
            />
          </el-popconfirm>
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

    <CompUpdate
      ref="compUpdate"
      :visible.sync="dialogVisible"
      :title="title"
      :dictList="dictList"
    />
  </div>
</template>

<script>
import {
  gasConfigList,
  gasConfigAuth,
  gasConfigDelete,
} from "@/api/third/testApi";
import { commonStatusList } from "@/utils/commonData";
import { categoryComputerDict } from "@/api/third/fileConfig";

export default {
  name: "StsDevice",
  components: {
    CompUpdate: () => import("./components/update"),
  },
  data() {
    return {
      isMyDialog: false,
      lovingVue: true,
      commonStatusList,
      // 遮罩层
      loading: false,
      dialogVisible: false,
      title: "",
      // 总条数
      total: 0,
      dictList: [],
      list: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: "",
      },
    };
  },
  created() {
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      gasConfigList(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.list = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "新增气密性参数";
    },
    handleUpdate(row) {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.title = "修改气密性参数";
    },
    // 删除
    handleDelete(row) {
      gasConfigDelete([row.id]).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      });
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm(`确认要${text}吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return gasConfigAuth([{ id: row.id, status: row.status }]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
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
  },
};
</script>