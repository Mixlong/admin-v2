<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="90%" top="2vh" append-to-body :close-on-click-modal="false">
    <div class="detail-container" v-loading="loading">
      <!-- 基本信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">基本信息</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>ECN编号：</label>
              <span>{{ detailData.ecn }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>产品品类：</label>
              <span>{{ detailData.categoryName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>产品型号：</label>
              <span>{{ detailData.computerName }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>申请部门：</label>
              <span>{{ detailData.reqUnit }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>申请人：</label>
              <span>{{ detailData.applicant }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>申请时间：</label>
              <span>{{ detailData.createTime }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 审核流程 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">审核流程</span>
        </div>
        
        <!-- 初审 -->
        <div class="audit-section">
          <div class="audit-header">
            <h4>初审</h4>
            <el-tag :type="getStateType(detailData.firstState)">
              {{ getStateText(detailData.firstState) }}
            </el-tag>
          </div>
          <div class="audit-content">
            <div class="detail-item">
              <label>审核人：</label>
              <span>{{ detailData.firstPerson || '未指定' }}</span>
            </div>
            <div class="detail-item" v-if="detailData.firstRemark">
              <label>备注：</label>
              <span>{{ detailData.firstRemark }}</span>
            </div>
            <div class="detail-item" v-if="detailData.firstResult">
              <label>拒绝原因：</label>
              <span class="reject-reason">{{ detailData.firstResult }}</span>
            </div>
          </div>
        </div>

        <!-- 会审 -->
        <div class="audit-section">
          <div class="audit-header">
            <h4>会审</h4>
            <el-tag :type="getStateType(detailData.secondState)">
              {{ getStateText(detailData.secondState) }}
            </el-tag>
          </div>
          <div class="audit-content">
            <div class="second-audit-list">
              <div v-for="item in detailData.list" :key="item.id" class="second-audit-item">
                <div class="audit-item-header">
                  <span class="department-name">{{ TriageList[item.field] }}</span>
                  <el-tag size="small" :type="getStateType(item.state)">
                    {{ getStateText(item.state) }}
                  </el-tag>
                </div>
                <div class="audit-item-content">
                  <div class="detail-item">
                    <label>审核人：</label>
                    <span>{{ item.fieldName || '未指定' }}</span>
                  </div>
                  <div class="detail-item" v-if="item.remark">
                    <label>备注：</label>
                    <span>{{ item.remark }}</span>
                  </div>
                  <div class="detail-item" v-if="item.result">
                    <label>拒绝原因：</label>
                    <span class="reject-reason">{{ item.result }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PMC审 -->
        <div class="audit-section">
          <div class="audit-header">
            <h4>PMC审</h4>
            <el-tag :type="getStateType(detailData.thirdState)">
              {{ getStateText(detailData.thirdState) }}
            </el-tag>
          </div>
          <div class="audit-content">
            <div class="detail-item">
              <label>审核人：</label>
              <span>{{ detailData.thirdPerson || '未指定' }}</span>
            </div>
            <div class="detail-item" v-if="detailData.thirdRemark">
              <label>备注：</label>
              <span>{{ detailData.thirdRemark }}</span>
            </div>
            <div class="detail-item" v-if="detailData.thirdResult">
              <label>拒绝原因：</label>
              <span class="reject-reason">{{ detailData.thirdResult }}</span>
            </div>
          </div>
        </div>

        <!-- 终审 -->
        <div class="audit-section">
          <div class="audit-header">
            <h4>终审</h4>
            <el-tag :type="getStateType(getFinalState())">
              {{ getStateText(getFinalState()) }}
            </el-tag>
          </div>
          <div class="audit-content">
            <div class="detail-item">
              <label>审核人：</label>
              <span>{{ detailData.finalPerson || '未指定' }}</span>
            </div>
            <div class="detail-item" v-if="detailData.finalRemark">
              <label>备注：</label>
              <span>{{ detailData.finalRemark }}</span>
            </div>
            <div class="detail-item" v-if="detailData.finalResult">
              <label>拒绝原因：</label>
              <span class="reject-reason">{{ detailData.finalResult }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 申请内容 -->
      <el-card class="detail-card" shadow="never" v-if="detailData.content">
        <div slot="header" class="card-header">
          <span class="card-title">申请内容</span>
        </div>
        <div class="content-section">
          <div v-html="detailData.content"></div>
        </div>
      </el-card>

      <!-- 附件信息 -->
      <el-card class="detail-card" shadow="never" v-if="detailData.annexUrl">
        <div slot="header" class="card-header">
          <span class="card-title">附件信息</span>
        </div>
        <div class="attachment-section">
          <el-link :href="detailData.annexUrl" target="_blank" type="primary">
            <i class="el-icon-download"></i>
            下载附件
          </el-link>
        </div>
      </el-card>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { trialApplyDetail } from '@/api/third/trialApply'

export default {
  name: 'TrialApplyDetail',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      title: '试产申请详情',
      detailData: {
        list: []
      },
      // 会审部门字典
      TriageList: {
        2: '采购',
        3: '品质',
        4: '生产',
        5: '工程',
        6: '研发',
        7: '仓库',
        8: '市场'
      }
    }
  },
  methods: {
    showDetail(id) {
      this.dialogVisible = true
      this.loading = true
      this.getDetailData(id)
    },
    getDetailData(id) {
      trialApplyDetail(id).then((response) => {
        if (response.code === 200) {
          this.detailData = response.data || { list: [] }
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getStateType(state) {
      switch (state) {
        case 0: return 'warning'  // 待审核
        case 1: return 'success'  // 已审核
        case 2: return 'danger'   // 已驳回
        default: return 'info'
      }
    },
    getStateText(state) {
      switch (state) {
        case 0: return '待审核'
        case 1: return '已审核'
        case 2: return '已驳回'
        default: return '未知'
      }
    },
    getFinalState() {
      // 根据终审相关字段推断状态
      if (this.detailData.finalResult) {
        return 2 // 有拒绝原因说明被驳回
      }
      if (this.detailData.finalRemark) {
        return 1 // 有备注说明已审核
      }
      return 0 // 默认待审核
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  .detail-card {
    margin-bottom: 16px;
    border: 1px solid #E4E7ED;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .detail-item {
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    label {
      min-width: 90px;
      color: #909399;
      font-weight: normal;
      margin-right: 12px;
      font-size: 14px;
    }
    
    span {
      color: #303133;
      flex: 1;
      word-break: break-all;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .reject-reason {
      color: #F56C6C;
      font-weight: normal;
    }
  }
  
  .audit-section {
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 0;
    padding-bottom: 24px;
    margin-top: 24px;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .audit-header {
      background: transparent;
      padding: 0 0 16px 0;
      border-bottom: 2px solid #409EFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .audit-content {
      padding: 0;
      background: transparent;
    }
  }
  
  .second-audit-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .second-audit-item {
      border: 1px solid #E4E7ED;
      border-radius: 4px;
      overflow: hidden;
      background: #FFFFFF;
      
      .audit-item-header {
        background: #F5F7FA;
        padding: 10px 16px;
        border-bottom: 1px solid #E4E7ED;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .department-name {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }
      }
      
      .audit-item-content {
        padding: 16px;
        
        .detail-item {
          margin-bottom: 10px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          label {
            min-width: 80px;
            font-size: 13px;
            color: #909399;
          }
          
          span {
            font-size: 13px;
            color: #303133;
          }
        }
      }
    }
  }
  
  .content-section {
    padding: 16px;
    background: #FAFAFA;
    border-radius: 4px;
    min-height: 100px;
    
    ::v-deep {
      p {
        margin: 0 0 8px 0;
        line-height: 1.6;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
    }
  }
  
  .attachment-section {
    padding: 16px;
    text-align: center;
    
    .el-link {
      font-size: 14px;
      
      i {
        margin-right: 4px;
      }
    }
  }
}

::v-deep .el-dialog__body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

::v-deep .el-card__header {
  padding: 16px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E4E7ED;
}

::v-deep .el-card__body {
  padding: 24px;
}
</style>
