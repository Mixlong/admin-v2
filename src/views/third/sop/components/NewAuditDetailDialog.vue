<template>
  <el-dialog 
    title="审核详情" 
    :visible.sync="visible" 
    width="900px" 
    append-to-body
    :close-on-click-modal="false"
    top="0vh"
    @close="handleClose">
    
    <div v-loading="loading" class="audit-detail-container">
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border class="detail-section" :label-style="{ width: '120px' }">
        <el-descriptions-item label="ECN编号">{{ detailData.ecn || '-' }}</el-descriptions-item>
        <el-descriptions-item label="品类名称">{{ detailData.categoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ detailData.versionCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.applicant || '-' }}</el-descriptions-item>
        <el-descriptions-item label="抄送人员">{{ detailData.ccPersons || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 旧版SOP：只显示工程审 -->
      <template v-if="isOldSop">
        <div v-if="detailData.engineeringPerson" class="audit-stage-section">
          <div class="section-title">
            <i class="el-icon-setting"></i>
            <span>工程审信息</span>
          </div>
          
          <el-descriptions :column="1" border style="margin-top: 10px;" :label-style="{ width: '120px' }">
            <el-descriptions-item label="工程审人员">
              <span>{{ detailData.engineeringPerson || '-' }}</span>
              <el-tag :type="getAuditTagType(detailData.state)" size="small" style="margin-left: 10px">
                {{ getAuditStateName(detailData.state) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核备注">
              {{ detailData.auditRemark || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <el-empty v-else description="暂无审核信息" :image-size="100"></el-empty>
      </template>

      <!-- 新版SOP：显示完整4阶段审核流程 -->
      <template v-else>
        <!-- 会审信息 -->
      <div class="audit-stage-section">
        <div class="section-title">
          <i class="el-icon-user"></i>
          <span>会审信息</span>
          <span class="section-badge">三部门联审</span>
        </div>
        
        <el-table 
          :data="jointAuditList" 
          border 
          :row-class-name="tableRowClassName"
          style="margin-top: 10px;">
          <el-table-column label="部门" width="100" align="center">
            <template slot-scope="scope">
              <el-tag type="info" size="small">
                {{ getFieldName(scope.row.field) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核人" prop="fieldName" width="120" align="center" />
          <el-table-column label="审核状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getAuditTagType(scope.row.state)" size="small">
                {{ getAuditStateName(scope.row.state) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核备注" prop="remark" min-width="200" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.remark || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 工程审信息 -->
      <div class="audit-stage-section">
        <div class="section-title">
          <i class="el-icon-setting"></i>
          <span>工程审信息</span>
        </div>
        
        <el-descriptions :column="1" border style="margin-top: 10px;" :label-style="{ width: '120px' }">
          <el-descriptions-item label="工程审人员">
            <span>{{ detailData.engineeringPerson || '-' }}</span>
            <el-tag :type="getAuditTagType(detailData.engineeringState)" size="small" style="margin-left: 10px">
              {{ getAuditStateName(detailData.engineeringState) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核备注">
            {{ detailData.engineeringRemark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 项目审信息 -->
      <div v-if="detailData.projectPerson" class="audit-stage-section">
        <div class="section-title">
          <i class="el-icon-user-solid"></i>
          <span>项目审信息</span>
        </div>
        
        <el-descriptions :column="1" border style="margin-top: 10px;" :label-style="{ width: '120px' }">
          <el-descriptions-item label="项目审人员">
            <span>{{ detailData.projectPerson || '-' }}</span>
            <el-tag :type="getAuditTagType(detailData.projectState)" size="small" style="margin-left: 10px">
              {{ getAuditStateName(detailData.projectState) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核备注">
            {{ detailData.projectRemark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

        <!-- 终审信息 -->
        <div class="audit-stage-section">
          <div class="section-title">
            <i class="el-icon-finished"></i>
            <span>终审信息</span>
          </div>
          
          <el-descriptions :column="1" border style="margin-top: 10px;" :label-style="{ width: '120px' }">
            <el-descriptions-item label="终审人员">
              <span>{{ detailData.secondPerson || '-' }}</span>
              <el-tag :type="getAuditTagType(detailData.secondState)" size="small" style="margin-left: 10px">
                {{ getAuditStateName(detailData.secondState) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核备注">
              {{ detailData.finalRemark || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AuditDetailDialog',
  data() {
    return {
      visible: false,
      loading: false,
      detailData: {},
      jointAuditList: []
    };
  },
  computed: {
    // 判断是否为旧版SOP（没有list数据说明是旧版）
    isOldSop() {
      return !this.detailData.list || this.detailData.list.length === 0;
    }
  },
  methods: {
    /** 打开对话框 */
    open(row) {
      this.visible = true;
      this.detailData = { ...row };
      this.jointAuditList = row.list || [];
    },
    
    /** 关闭对话框 */
    handleClose() {
      this.visible = false;
      this.detailData = {};
      this.jointAuditList = [];
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
    
    /** 获取部门名称 */
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
    
    /** 表格行样式 */
    tableRowClassName({ row }) {
      if (row.state === 1) return 'success-row';
      if (row.state === 2) return 'danger-row';
      return '';
    }
  }
};
</script>

<style lang="scss" scoped>
.audit-detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.audit-stage-section {
  margin-top: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    padding: 10px 0;
    border-bottom: 2px solid #DCDFE6;
    
    i {
      margin-right: 8px;
      font-size: 18px;
      color: #409EFF;
    }
    
    .section-badge {
      margin-left: 10px;
      font-size: 12px;
      color: #909399;
      background: #F4F4F5;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: normal;
    }
  }
}

::v-deep .success-row {
  background-color: rgba(103, 194, 58, 0.1) !important;
}

::v-deep .danger-row {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

::v-deep .el-descriptions__label {
  font-weight: 600;
  background-color: #F5F7FA;
}

.dialog-footer {
  text-align: center;
}
</style>
