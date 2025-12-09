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
      <!-- <el-form-item label="流程ID" prop="id">
        <el-input v-model.trim="queryParams.id" clearable style="width: 140px" placeholder="请输入ID"></el-input>
      </el-form-item> -->
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
      
      <el-table-column label="ECN编号" prop="ecn"  align="center"  />
      
      
      
      <!-- 会审状态 -->
      <el-table-column label="会审状态" width="170" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.list && scope.row.list.length > 0">
            <div 
              v-for="(item, index) in scope.row.list" 
              :key="index"
              style="margin: 4px 0;">
              <el-tag 
                type="info"
                size="mini">
                {{ getFieldName(item.field) }}
              </el-tag>
              <span style="margin: 0 4px;">{{ item.fieldName }}</span>
              <el-tag 
                :type="getAuditTagType(item.state)"
                size="mini">
                {{ getAuditStateName(item.state) }}
              </el-tag>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
   
            <!-- 终审状态 -->
      <el-table-column label="终审" width="120" align="center">
        <template slot-scope="scope">
          <div>
            <div style="margin-bottom: 4px;">{{ scope.row.secondPerson || '-' }}</div>
            <el-tag :type="getAuditTagType(scope.row.secondState)" size="small">
              {{ getAuditStateName(scope.row.secondState) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
     
      
      <!-- 项目审状态 -->
      <el-table-column label="项目审" width="120" align="center">
        <template slot-scope="scope">
          <div>
            <div style="margin-bottom: 4px;">{{ scope.row.projectPerson || '-' }}</div>
            <el-tag :type="getAuditTagType(scope.row.projectState)" size="small">
              {{ getAuditStateName(scope.row.projectState) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
          
   <!-- 工程审状态 -->
      <el-table-column label="工程审" width="120" align="center">
        <template slot-scope="scope">
          <div>
            <div style="margin-bottom: 4px;">{{ scope.row.engineeringPerson || '-' }}</div>
            <el-tag :type="getAuditTagType(scope.row.engineeringState)" size="small">
              {{ getAuditStateName(scope.row.engineeringState) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="120" align="center" />
      <el-table-column label="申请人" prop="applicant" width="100" align="center" />
      <el-table-column label="抄送人员" prop="ccPersons" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.ccPersons || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button 
            type="text" 
            size="small" 
            icon="el-icon-view"
            @click="handleViewDetail(scope.row)">
            详情
          </el-button>
          <el-button 
            v-if="canAudit(scope.row)"
            type="text" 
            size="small" 
            icon="el-icon-edit"
            @click="handleAudit(scope.row)">
            审核
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
    
    <!-- 审核弹窗 -->
    <AuditDialog ref="auditDialog" @success="getList" />
    
    <!-- 详情对话框 -->
    <NewAuditDetailDialog ref="auditDetailDialog" />
  </div>
</template>

<script>
import { sopAuditList, sopDelete } from "@/api/third/testApi";
import { parseTime, resetForm } from "@/utils/ruoyi";
import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar";
import AuditDialog from "./components/AuditDialog";
import NewAuditDetailDialog from "./components/NewAuditDetailDialog";
import { mapGetters } from "vuex";
import digiSmartJumpMixin from "@/mixins/digiSmartJump";

export default {
  name: "AuditList",
  components: {
    Pagination,
    RightToolbar,
    AuditDialog,
    NewAuditDetailDialog
  },
  mixins: [digiSmartJumpMixin],
  computed: {
    ...mapGetters(["nickName"])
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      detailLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 审核列表数据
      auditList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 30,
        ecn: null,
        categoryId: null,
        versionCode: null,
        id: null
      },
      // 对话框标题
      detailTitle: "审核详情",
      // 是否显示对话框
      open: false,
      // 详情数据
      detailData: {},
      // 会审人员数据
      jointAuditors: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询审核列表 */
    getList() {
      this.loading = true;
      sopAuditList(this.queryParams).then(response => {
        this.auditList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
        // 查询完成后清除 DigiSmart 跳转ID
        this.clearDigiSmartId();
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      resetForm.call(this, "queryForm");
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 获取会审状态 */
    getJointAuditStatus(list) {
      if (!list || list.length === 0) return 0;
      
      const pending = list.filter(item => item.state === 0).length;
      const approved = list.filter(item => item.state === 1).length;
      const rejected = list.filter(item => item.state === 2).length;
      
      if (rejected > 0) return 2; // 拒绝
      if (pending === 0 && approved > 0) return 1; // 全部通过
      if (pending > 0 && (approved > 0 || rejected > 0)) return 3; // 部分完成
      return 0; // 待审核
    },
    /** 查看详情按钮操作 */
    handleView(row) {
      this.detailLoading = true;
      this.open = true;
      this.detailData = { ...row };
      this.jointAuditors = row.list || [];
      this.detailLoading = false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除审核编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return sopDelete(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 获取审核状态标签类型 */
    getAuditTagType(state) {
      // null 或 undefined 默认为待审核
      if (state === null || state === undefined) {
        return 'warning';
      }
      const typeMap = {
        0: 'warning',  // 待审核 - 橙色
        1: 'success',  // 已通过 - 绿色
        2: 'danger'    // 已驳回 - 红色
      };
      return typeMap[state] || 'warning';
    },
    /** 获取审核状态名称 */
    getAuditStateName(state) {
      // null 或 undefined 默认为待审核
      if (state === null || state === undefined) {
        return '待审核';
      }
      const nameMap = {
        0: '待审核',
        1: '已通过',
        2: '已驳回'
      };
      return nameMap[state] || '待审核';
    },
    /** 获取字段名称（部门类型映射） */
    getFieldName(field) {
      // type: 2品质 3生产 5研发 8终审 9工程审
      const fieldMap = {
        2: '品质',
        3: '生产',
        5: '研发',
        8: '终审',
        9: '工程审',
        '2': '品质',
        '3': '生产',
        '5': '研发',
        '8': '终审',
        '9': '工程审'
      };
      return fieldMap[field] || field;
    },
    /** 判断是否可以审核 */
    canAudit(row) {
      // 获取当前用户信息
      const currentUser = this.nickName || '';
      
      // 检查是否有会审被驳回
      const hasJointAuditRejected = row.list && row.list.length > 0 
        ? row.list.some(item => item.state === 2)
        : false;
      
      // 如果有会审被驳回，后续流程都不能进行
      if (hasJointAuditRejected) {
        // 只有待审核的会审人员可以继续审核
        if (row.list && row.list.length > 0) {
          const myAudit = row.list.find(item => item.fieldName === currentUser && item.state === 0);
          if (myAudit) return true;
        }
        return false;
      }
      
      // 1. 检查会审状态（第一阶段，可以并行审核）
      if (row.list && row.list.length > 0) {
        const myAudit = row.list.find(item => item.fieldName === currentUser && item.state === 0);
        if (myAudit) return true;
      }
      
      // 2. 检查工程审状态（第二阶段，需要所有会审都通过）
      if (row.engineeringPerson === currentUser && row.engineeringState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = row.list && row.list.length > 0 
          ? row.list.every(item => item.state === 1)
          : false;
        
        // 只有会审全部通过后，才能工程审
        if (allJointAuditPassed) {
          return true;
        }
      }
      
      // 3. 检查项目审状态（第三阶段，需要工程审通过）
      if (row.projectPerson === currentUser && row.projectState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = row.list && row.list.length > 0 
          ? row.list.every(item => item.state === 1)
          : false;
        
        // 检查工程审是否已通过
        const engineeringPassed = row.engineeringState === 1;
        
        // 只有会审全部通过且工程审通过后，才能项目审
        if (allJointAuditPassed && engineeringPassed) {
          return true;
        }
      }
      
      // 4. 检查终审状态（第四阶段，需要项目审通过）
      if (row.secondPerson === currentUser && row.secondState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = row.list && row.list.length > 0 
          ? row.list.every(item => item.state === 1)
          : false;
        
        // 检查工程审是否已通过
        const engineeringPassed = row.engineeringState === 1;
        
        // 检查项目审是否已通过（如果有项目人员）
        const projectPassed = !row.projectPerson || row.projectState === 1;
        
        // 只有会审全部通过、工程审通过、项目审通过后，才能终审
        if (allJointAuditPassed && engineeringPassed && projectPassed) {
          return true;
        }
      }
      
      return false;
    },
    /** 审核按钮操作 */
    handleAudit(row) {
      const currentUser = this.nickName || '';
      
      // 判断当前用户的审核类型
      // 1. 检查是否是会审人员（第一阶段）
      if (row.list && row.list.length > 0) {
        const myAudit = row.list.find(item => item.fieldName === currentUser && item.state === 0);
        if (myAudit) {
          this.$refs.auditDialog.open('field', row, myAudit);
          return;
        }
      }
      
      // 2. 检查是否是工程审人员（第二阶段）
      if (row.engineeringPerson === currentUser && row.engineeringState === 0) {
        this.$refs.auditDialog.open('engineering', row);
        return;
      }
      
      // 3. 检查是否是项目审人员（第三阶段）
      if (row.projectPerson === currentUser && row.projectState === 0) {
        this.$refs.auditDialog.open('project', row);
        return;
      }
      
      // 4. 检查是否是终审人员（第四阶段）
      if (row.secondPerson === currentUser && row.secondState === 0) {
        this.$refs.auditDialog.open('final', row);
        return;
      }
    },
    /** 查看详情按钮操作 */
    handleViewDetail(row) {
      this.$refs.auditDetailDialog.open(row);
    },
    /** 表格行样式 */
    rowClassName({ row }) {
      // 全部通过 - 绿色背景（会审、工程审、项目审、终审都通过）
      const allJointAuditPassed = !row.list || row.list.every(item => item.state === 1);
      const engineeringPassed = row.engineeringState === 1;
      const projectPassed = !row.projectPerson || row.projectState === 1; // 如果没有项目人员，视为通过
      const finalPassed = row.secondState === 1;
      
      if (allJointAuditPassed && engineeringPassed && projectPassed && finalPassed) {
        return 'success-row';
      }
      
      // 有驳回 - 红色背景
      const hasRejected = row.engineeringState === 2 || 
                         row.secondState === 2 || 
                         row.projectState === 2 ||
                         (row.list && row.list.some(item => item.state === 2));
      if (hasRejected) return 'danger-row';
      
      return '';
    },
    /** 计算表格高度 */
    tableHeight() {
      return window.innerHeight - 280;
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
