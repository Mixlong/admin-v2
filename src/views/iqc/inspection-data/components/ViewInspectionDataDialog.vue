<template>
  <el-dialog 
    title="查看检验数据"
    :visible.sync="dialogVisible" 
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleDialogOpen"
    top="0"
    class="view-inspection-data-dialog">
    
    <div class="dialog-content">
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>日期：</label>
              <span>{{ viewData.inventoryCreateTime || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>机型：</label>
              <span>{{ viewData.categoryName || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>物料编码：</label>
              <span>{{ viewData.invCode || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>物料名称：</label>
              <span>{{ viewData.invName || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>规格1：</label>
              <span>{{ viewData.englishName || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
  
            <div class="info-item">
              <label>供应商：</label>
              <span>{{ viewData.invDefine || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>规格2：</label>
              <span>{{ viewData.invStd || '--' }}</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 检验数据 -->
      <fieldset class="form-fieldset">
        <legend>检测数据</legend>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>到料数量：</label>
              <span>{{ viewData.arrivalQuantity || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>抽检数量：</label>
              <span>{{ viewData.samplingQuantity || 0 }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>不良数量：</label>
              <span>{{ viewData.defectiveQuantity || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>不良率：</label>
              <el-tag :type="getDefectRateTagType(viewData.defectiveRate)">
                {{ viewData.defectiveRate || '0.00%' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="info-item">
              <label>检验结果：</label>
              <el-tag :type="getResultType(viewData.inspectionResult)">
                {{viewData.inspectionResult}}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </fieldset>
      
      <!-- 详细信息 -->
      <fieldset class="form-fieldset">
        <legend>详细信息</legend>
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="info-item">
              <label>测量数据：</label>
              <div class="rich-text-content" v-if="viewData.testInfo" v-html="viewData.testInfo"></div>
              <span v-else class="no-data">--</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="info-item">
              <label>不良描述：</label>
              <div class="rich-text-content" v-if="viewData.defectiveDesc" v-html="viewData.defectiveDesc"></div>
              <span v-else class="no-data">--</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 系统信息 -->
      <fieldset class="form-fieldset">
        <legend>系统信息</legend>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>创建人：</label>
              <span>{{ viewData.createBy || '系统' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDateTime(viewData.createTime) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="hasUpdateInfo">
          <el-col :span="12">
            <div class="info-item">
              <label>更新人：</label>
              <span>{{ viewData.updateBy || '系统' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDateTime(viewData.updateTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ViewInspectionDataDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    viewData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: this.visible
    }
  },
  computed: {
    // 判断是否有更新信息
    hasUpdateInfo() {
      return this.viewData.updateBy || this.viewData.updateTime
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 弹窗打开时重置滚动条
    handleDialogOpen() {
      this.$nextTick(() => {
        const dialogBody = document.querySelector('.view-inspection-data-dialog .el-dialog__body')
        if (dialogBody) {
          dialogBody.scrollTop = 0
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
    },

    // 编辑按钮
    handleEdit() {
      this.$emit('edit', this.viewData)
      this.handleClose()
    },

    // 获取结果类型
    getResultType(result) {
      const resultMap = {
        'PASS': 'success',
        'NG': 'danger',
        'FAIL': 'danger',
        'PENDING': 'warning'
      }
      return resultMap[result] || 'info'
    },

 

    // 获取不良率标签类型
    getDefectRateTagType(defectiveRate) {
      if (!defectiveRate) return 'info'
      const rate = parseFloat(defectiveRate.replace('%', ''))
      if (rate === 0) return 'success'
      if (rate <= 5) return 'warning'
      return 'danger'
    },

    // 计算不良率
    calculateDefectRate(defectiveQuantity, samplingQuantity) {
      const defective = defectiveQuantity || 0
      const sampling = samplingQuantity || 0
      
      if (sampling > 0) {
        const rate = (defective / sampling * 100).toFixed(2)
        return rate + '%'
      }
      return '0.00%'
    },

    // 格式化日期时间
    formatDateTime(datetime) {
      if (!datetime) return '--'
      return datetime.replace('T', ' ').substring(0, 19)
    }
  }
}
</script>

<style scoped>
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding: 0 10px;
  border: none;
  width: auto;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 120px;
  margin-right: 10px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
  word-break: break-all;
}

.no-data {
  color: #C0C4CC;
  font-style: italic;
}

.rich-text-content {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background-color: #fafafa;
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
}

.rich-text-content p {
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.rich-text-content ul,
.rich-text-content ol {
  margin: 0 0 10px 0;
  padding-left: 20px;
}

.rich-text-content li {
  margin-bottom: 5px;
  line-height: 1.6;
}

.rich-text-content strong {
  font-weight: bold;
}

.rich-text-content em {
  font-style: italic;
}

.dialog-footer {
  text-align: right;
  padding: 15px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
}

.record-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  word-break: break-all;
}
</style>

<style>
/* 对话框全局样式 */
.view-inspection-data-dialog {
  .el-dialog__body {
    padding: 20px;
    max-height: 75vh;
    overflow-y: auto;
  }
}
</style>
