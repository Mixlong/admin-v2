<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="客户：" prop="customerName">
        <el-input
          v-model.trim="queryParams.customerName"
          clearable
          placeholder="请输入客户"
        />
      </el-form-item>
      <el-form-item label="产品品类：" prop="categoryName">
        <el-input
          v-model.trim="queryParams.categoryName"
          clearable
          placeholder="请输入产品品类"
        />
      </el-form-item>
      <el-form-item label="产品型号：" prop="computerName">
        <el-input
          v-model.trim="queryParams.computerName"
          clearable
          placeholder="请输入产品型号"
        />
      </el-form-item>
      <!-- <el-form-item label="状态：" prop="computerStatus">
        <el-select
          v-model="queryParams.computerStatus"
          clearable
          placeholder="请选择状态"
          @change="getList"
          style="width: 140px"
        >
          <el-option
            v-for="(value, key) in commonStatusList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item> -->
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
        v-if="checkRole(['test', 'admin'])"
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        class="fr"
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
      <el-table-column label="产品品类" prop="categoryName" align="center" />
      <el-table-column label="产品型号" prop="computerName" align="center" />
      <el-table-column label="客户" prop="customerName" align="center" />
      <el-table-column label="软件版本信息" align="center">
        <template slot-scope="{row}">
          <span>软件版本: {{ row.softVersion }}</span>
          <br>
          <span>硬件版本: {{ row.hardVersion }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细需求" prop="desc" align="center" />
      <el-table-column label="配置需求表" prop="desc" align="center" />
      <el-table-column label="状态" align="center" width="120">
        <!-- <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          ></el-switch>
        </template> -->
      </el-table-column>
      <el-table-column
        label="当前负责人"
        prop="createBy"
        align="center"
        width="120"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{row}">
          <Tooltip icon="el-icon-edit" content="修复中" @click="handleUpdate(row)" />
          <Tooltip icon="el-icon-check" content="复测中" />
          <Tooltip v-if="row.isComplete === 1" icon="el-icon-s-check" content="测试完毕" />
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

    <CompUpdate ref="compUpdate" />
  </div>
</template>

<script>
import { taskList, authComputer, changeStatus } from "@/api/third/testApi"; 
import { commonStatusList } from "@/utils/commonData";

export default {
  components: {
    CompUpdate: () => import('./components/addOrUpdate'),
  },
  filters: {},
  data() {
    return {
      commonStatusList,
      form: {},
      // 遮罩层
      loading: false,
      authDialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        key: "",
        computerStatus: "",
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      taskList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form.categoryId = this.queryParams.key;
      this.$refs.compUpdate.title = "新增版本";

      this.$router.push({
        path: "/addOrUpdate/CommonPage",
        query: {
          pageName: "AddDemandPage",
          title: "新增测试需求",
        },
      });
    },
    handleUpdate(row) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.title = "修改版本";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return changeStatus([{ id: row.id, status: row.status }]);
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
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除产品类型为"' + row.name + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return authComputer({ id: row.id, status: 1 });
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch();
    },
  },
};
</script>
