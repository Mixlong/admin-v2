<template>
  <div class="app-container font12">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="客户：" prop="customerName">
        <el-input
          v-model.trim="queryParams.customerName"
          clearable
          placeholder="请输入客户"
        />
      </el-form-item>
      <el-form-item label="产品型号：" prop="computerName">
        <el-input
          v-model.trim="queryParams.computerName"
          clearable
          placeholder="请输入产品型号"
        />
      </el-form-item>
      <el-form-item label="是否已修复：" prop="status">
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择是否已修复"
        >
          <el-option label="已修复" value="1"></el-option>
          <el-option label="未修复" value="2"></el-option>
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
      <el-table-column label="客户" prop="customerName" align="center" width="120" />
      <el-table-column label="产品型号" prop="computerName" align="center">
        <template slot-scope="{ row }">
          <template v-if="row.computerName">
            <el-tag
              class="margin-right-noLast"
              v-for="(item, key) in computerList(row.computerName)"
              :key="key"
            >
              {{ item }}
            </el-tag>
          </template>
          <template v-else>---</template>
        </template>
      </el-table-column>
      <el-table-column label="模块" prop="typeName" align="center" width="120" />
      <el-table-column label="测试项" prop="content" align="center" />
      <el-table-column label="预期结果" prop="result" align="center" />
      <el-table-column label="BUG内容（失败原因）" prop="msg" align="center" />
      <el-table-column label="回归周期(天)" prop="solveNum" align="center" width="120" />
      <el-table-column label="新增/解决时间" align="center" width="140">
        <template slot-scope="{ row }">
          <span class="text-green" v-show="row.status === 1">
            {{ parseTime(row.updateTime) }}
          </span>
          <span class="text-red" v-show="row.status === 2">
            {{ parseTime(row.createTime) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="是否已修复" prop="status" align="center" width="100">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1" type="success">已修复</el-tag>
          <el-tag v-if="row.status === 2" type="danger">未修复</el-tag>
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
import { testBugList } from "@/api/third/testApi";

export default {
  name: 'BugList',
  data() {
    return {
      form: {},
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      list: [],
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        customerName: "",
        computerName: "",
        status: undefined,
      },
    };
  },
  computed: {
    computerList() {
      return (computerName) => {
        return computerName && computerName.split(",");
      };
    },
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      testBugList(this.queryParams).then((response) => {
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>
