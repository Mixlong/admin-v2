<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="产品品类" prop="categoryId">
        <TypedSelectLoadMore
          v-model="queryParams.categoryId"
          type="category"
          customStyle="width: 150px"
          size="mini"
        />
      </el-form-item>
      <el-form-item label="版本号" prop="versionCode">
        <el-input v-model.trim="queryParams.versionCode" clearable style="width: 140px" placeholder="请输入版本号"></el-input>
      </el-form-item>
      <el-form-item label="ECN编号" prop="ecn">
        <el-input v-model.trim="queryParams.ecn" clearable style="width: 140px" placeholder="请输入ECN编号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 审核列表 -->
    <el-table 
      v-loading="loading" 
      :data="auditList" 
      :height="tableHeight()" 
      border
      :row-class-name="rowClassName">
      <el-table-column label="序号" type="index" width="60" align="center" />
      
      <el-table-column label="品类名称" prop="categoryName" min-width="120" align="center" show-overflow-tooltip />
      
      <el-table-column label="版本号" prop="versionCode" min-width="100" align="center" show-overflow-tooltip />
      
      <el-table-column label="ECN编号" prop="ecn" min-width="120" align="center" show-overflow-tooltip />
      
      <el-table-column label="申请人" prop="applicant" min-width="100" align="center" show-overflow-tooltip />
      
      <!-- 会审状态 -->
      <el-table-column label="会审状态" min-width="120" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.list && scope.row.list.length > 0">
            <el-tag 
              v-for="(item, index) in scope.row.list" 
              :key="index"
              :type="getAuditTagType(item.state)"
              size="mini"
              style="margin: 2px;">
              {{ getFieldName(item.field) }}: {{ getAuditStateName(item.state) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <!-- 工程审状态 -->
      <el-table-column label="工程审" min-width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getAuditTagType(scope.row.engineeringState)" size="small">
            {{ getAuditStateName(scope.row.engineeringState) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 终审状态 -->
      <el-table-column label="终审" min-width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getAuditTagType(scope.row.secondState)" size="small">
            {{ getAuditStateName(scope.row.secondState) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" prop="createTime" min-width="160" align="center" show-overflow-tooltip />
      
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button 
            type="text" 
            size="small" 
            icon="el-icon-view"
            @click="handleViewDetail(scope.row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
import { sopAuditList } from "@/api/third/testApi";

export default {
  name: "SopAuditList",
  data() {
    return {
      loading: false,
      auditList: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 10,
        categoryId: '',
        versionCode: '',
        ecn: '',
        sopId: '' // 从路由参数获取
      }
    };
  },
  created() {
    // 从路由参数获取查询条件
    if (this.$route.query.sopId) {
      this.queryParams.sopId = this.$route.query.sopId;
    }
    if (this.$route.query.categoryId) {
      this.queryParams.categoryId = this.$route.query.categoryId;
    }
    if (this.$route.query.versionCode) {
      this.queryParams.versionCode = this.$route.query.versionCode;
    }
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      sopAuditList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.auditList = res.data.list || [];
          this.total = res.data.total || 0;
        }
      }).finally(() => {
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
      // 保留从路由获取的参数
      const sopId = this.queryParams.sopId;
      const categoryId = this.$route.query.categoryId || '';
      const versionCode = this.$route.query.versionCode || '';
      this.queryParams = {
        p: 1,
        l: 10,
        categoryId: categoryId,
        versionCode: versionCode,
        ecn: '',
        sopId: sopId
      };
      this.handleQuery();
    },
    
    /** 查看详情 */
    handleViewDetail(row) {
      this.$router.push({
        path: '/sop/audit/detail',
        query: { id: row.id }
      });
    },
    
    /** 获取审核状态标签类型 */
    getAuditTagType(state) {
      const typeMap = {
        0: 'warning', // 待审核
        1: 'success', // 通过
        2: 'danger'   // 驳回
      };
      return typeMap[state] || 'info';
    },
    
    /** 获取审核状态名称 */
    getAuditStateName(state) {
      const nameMap = {
        0: '待审核',
        1: '已通过',
        2: '已驳回'
      };
      return nameMap[state] || '-';
    },
    
    /** 获取领域名称 */
    getFieldName(field) {
      const fieldMap = {
        2: '采购',
        3: '品质',
        4: '生产',
        5: '工程',
        6: '研发',
        7: '仓库',
        8: '市场'
      };
      return fieldMap[field] || '';
    },
    
    /** 行样式 */
    rowClassName({ row }) {
      // 全部通过显示绿色
      const allPassed = row.list && row.list.every(item => item.state === 1) 
        && row.engineeringState === 1 
        && row.secondState === 1;
      if (allPassed) return 'success-row';
      
      // 有驳回显示红色
      const hasReject = (row.list && row.list.some(item => item.state === 2))
        || row.engineeringState === 2
        || row.secondState === 2;
      if (hasReject) return 'danger-row';
      
      return '';
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .success-row {
  background-color: rgba(103, 194, 58, 0.1) !important;
}

::v-deep .danger-row {
  background-color: rgba(245, 108, 108, 0.1) !important;
}
</style>
