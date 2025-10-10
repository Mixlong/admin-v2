<template>
  <el-dialog
    title="客户要求详情"
    :visible.sync="dialogVisible"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
    top="2vh"
    class="view-requirement-dialog">
    
    <div class="view-content" v-loading="loading">
      <!-- 基本信息 -->
      <fieldset class="info-section">
        <legend><i class="el-icon-info"></i> 基本信息</legend>
        <el-row :gutter="30">
          <el-col :span="8">
            <div class="info-item">
              <label>客户名称：</label>
              <span class="info-value">{{ formData.customer || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>类别：</label>
              <el-tag :type="getClassTagType(getCustomerTypeLabel(formData.customerClass))" size="small">
                {{ getCustomerTypeLabel(formData.customerClass) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 机型配置 -->
      <fieldset class="info-section">
        <legend><i class="el-icon-setting"></i> 机型配置</legend>
        <div v-if="formData.requirementInfoList && formData.requirementInfoList.length > 0" class="model-config-list">
          <div class="config-table">
            <div class="config-row config-header">
              <div class="config-col">序号</div>
              <div class="config-col">机型型号</div>
              <div class="config-col">机型配置</div>
            </div>
            <div v-for="(item, index) in formData.requirementInfoList" :key="index" class="config-row">
              <div class="config-col config-index">{{ index + 1 }}</div>
              <div class="config-col">{{ getCategoryName(item.category) }}</div>
              <div class="config-col">{{ item.modelConfig || '--' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-model-config">
          <span>暂无机型配置信息</span>
        </div>
      </fieldset>

      <!-- 负责人信息 -->
      <fieldset class="info-section">
        <legend><i class="el-icon-user"></i> 负责人信息</legend>
        <el-row :gutter="30">
          <el-col :span="8">
            <div class="info-item">
              <label>项目负责人：</label>
              <span class="info-value">{{ formData.projectManager || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>市场负责人：</label>
              <span class="info-value">{{ formData.marketManager || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>质量负责人：</label>
              <span class="info-value">{{ formData.qualityManager || '--' }}</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>

 
      <!-- 客户要求详情 -->
      <fieldset class="info-section">
        <legend><i class="el-icon-document"></i> 客户要求详情</legend>
        
        <!-- 校验标准 -->
        <div class="requirement-item">
          <h4><i class="el-icon-s-check"></i> 校验标准</h4>
          <div class="requirement-content">
            <div v-if="formData.validationStandard" v-html="formData.validationStandard" class="rich-text-display"></div>
            <div v-else class="no-content">暂无内容</div>
          </div>
          <div v-if="formData.validationAttachment" class="attachment-section">
            <h5><i class="el-icon-paperclip"></i> 相关附件</h5>
            <AttachmentPreview :attachment-urls="formData.validationAttachment" />
          </div>
        </div>

        <!-- 产品认证 -->
        <div class="requirement-item">
          <h4><i class="el-icon-medal"></i> 产品认证</h4>
          <div class="requirement-content">
            <div v-if="formData.productCertification" v-html="formData.productCertification" class="rich-text-display"></div>
            <div v-else class="no-content">暂无内容</div>
          </div>
          <div v-if="formData.certificationAttachment" class="attachment-section">
            <h5><i class="el-icon-paperclip"></i> 相关附件</h5>
            <AttachmentPreview :attachment-urls="formData.certificationAttachment" />
          </div>
        </div>

        <!-- 环保要求 -->
        <div class="requirement-item">
          <h4><i class="el-icon-s-opportunity"></i> 环保要求</h4>
          <div class="requirement-content">
            <div v-if="formData.environmentalRequirements" v-html="formData.environmentalRequirements" class="rich-text-display"></div>
            <div v-else class="no-content">暂无内容</div>
          </div>
          <div v-if="formData.environmentalAttachment" class="attachment-section">
            <h5><i class="el-icon-paperclip"></i> 相关附件</h5>
            <AttachmentPreview :attachment-urls="formData.environmentalAttachment" />
          </div>
        </div>

        <!-- AQL标准 -->
        <div class="requirement-item">
          <h4><i class="el-icon-s-data"></i> AQL标准</h4>
          <div class="requirement-content">
            <div v-if="formData.aqlStandard" v-html="formData.aqlStandard" class="rich-text-display"></div>
            <div v-else class="no-content">暂无内容</div>
          </div>
          <div v-if="formData.aqlAttachment" class="attachment-section">
            <h5><i class="el-icon-paperclip"></i> 相关附件</h5>
            <AttachmentPreview :attachment-urls="formData.aqlAttachment" />
          </div>
        </div>
      </fieldset>

      <!-- 操作记录 -->
      <fieldset class="info-section" v-if="formData.createTime || formData.updateTime">
        <legend><i class="el-icon-time"></i> 操作记录</legend>
        <el-row :gutter="30">
          <el-col :span="12" v-if="formData.createTime">
            <div class="info-item">
              <label>创建时间：</label>
              <span class="info-value">{{ formatDateTime(formData.createTime) }}</span>
            </div>
            <div class="info-item" v-if="formData.createBy">
              <label>创建人：</label>
              <span class="info-value">{{ formData.createBy }}</span>
            </div>
          </el-col>
          <el-col :span="12" v-if="formData.updateTime">
            <div class="info-item">
              <label>更新时间：</label>
              <span class="info-value">{{ formatDateTime(formData.updateTime) }}</span>
            </div>
            <div class="info-item" v-if="formData.updateBy">
              <label>更新人：</label>
              <span class="info-value">{{ formData.updateBy }}</span>
            </div>
          </el-col>
        </el-row>
      </fieldset>
    </div>
  </el-dialog>
</template>

<script>
import AttachmentPreview from './AttachmentPreview'
import { getDicts } from '@/api/system/dict/data'
import { listCategory } from '@/api/third/category'

export default {
  name: 'ViewRequirementDialog',
  components: {
    AttachmentPreview
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      customerTypeDict: [], // 客户类型字典
      categoryOptions: [] // 品类选项
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  created() {
    this.loadCustomerTypeDict()
    this.loadCategoryOptions()
  },
  methods: {
    // 加载客户类型字典
    async loadCustomerTypeDict() {
      try {
        const res = await getDicts('customer_type_enum')
        if (res.code === 200 && res.data) {
          this.customerTypeDict = res.data.filter(item => item.status === '0')
        }
      } catch (error) {
        console.error('获取客户类型字典失败:', error)
      }
    },

    // 加载品类选项
    async loadCategoryOptions() {
      try {
        // 使用与 AddRequirementDialog 相同的 API 确保数据一致性
        const res = await listCategory({ p: 1, l: 100 })
        console.log('ViewRequirementDialog 品类API响应:', res)
        
        if (res.code === 200 && res.data) {
          const list = res.data.list || []
          // 确保数据格式一致，包含 id 和 name 字段
          this.categoryOptions = list.map(item => ({
            id: item.id,
            name: item.name || item.categoryName || item.label,
            ...item // 保留其他字段
          }))
          console.log('品类选项加载成功:', this.categoryOptions.length, '条', this.categoryOptions)
        } else {
          console.error('品类API返回错误:', res.msg)
          this.categoryOptions = []
        }
      } catch (error) {
        console.error('获取品类数据失败:', error)
        this.categoryOptions = []
      }
    },
    
    // 获取客户类型标签文本
    getCustomerTypeLabel(value) {
      if (!value) return '--'
      const dictItem = this.customerTypeDict.find(item => item.dictValue === value)
      return dictItem ? dictItem.dictLabel : value
    },

    // 根据品类ID获取品类名称
    getCategoryName(categoryId) {
      if (!categoryId) return '--'
      
      console.log('查找品类ID:', categoryId, '类型:', typeof categoryId)
      console.log('可用品类选项:', this.categoryOptions.map(item => ({ id: item.id, name: item.name, type: typeof item.id })))
      
      // 使用宽松比较处理类型不一致问题（字符串 vs 数字）
      const category = this.categoryOptions.find(item => item.id == categoryId)
      
      if (category) {
        console.log('找到匹配的品类:', category)
        return category.name || category.categoryName || category.label || '--'
      } else {
        console.warn('未找到品类ID对应的名称:', categoryId)
        return '--'
      }
    },
    
    // 获取类别标签类型
    getClassTagType(classType) {
      const typeMap = {
        'A类': 'success',
        'B类': 'warning', 
        'C类': 'info',
        'A': 'success',
        'B': 'warning',
        'C': 'info'
      }
      return typeMap[classType] || 'info'
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString('zh-CN')
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      return new Date(dateTime).toLocaleString('zh-CN')
    },
    
    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false)
    },
    
    // 编辑
    handleEdit() {
      this.$emit('edit', this.formData)
      this.handleClose()
    }
  }
}
</script>

<style scoped>  

.view-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}

/* 信息区域样式 */
.info-section {
  background: white;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.info-section legend {
  color: #111;
  font-weight: bold;
  font-size: 16px;
  padding: 0 10px;
  border: none;
  margin-bottom: 0;
}

.info-section legend i {
  margin-right: 5px;
}

/* 信息项样式 */
.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  margin-right: 10px;
}

.info-value {
  color: #303133;
  flex: 1;
}

/* 要求项样式 */
.requirement-item {
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.requirement-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.requirement-item h4 {
  color: #111;
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.requirement-item h4 i {
  margin-right: 8px;
  font-size: 18px;
}

.requirement-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  min-height: 60px;
}

.no-content {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 富文本显示样式 */
.rich-text-display {
  line-height: 1.6;
  color: #303133;
}

.rich-text-display p {
  margin: 8px 0;
}

.rich-text-display ul, .rich-text-display ol {
  margin: 10px 0;
  padding-left: 20px;
}

.rich-text-display li {
  margin: 5px 0;
}

.rich-text-display strong {
  font-weight: bold;
}

.rich-text-display em {
  font-style: italic;
}

/* 附件区域样式 */
.attachment-section {
  background: #fafbfc;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 15px;
}

.attachment-section h5 {
  color: #586069;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.attachment-section h5 i {
  margin-right: 6px;
}

/* 对话框底部 */
.dialog-footer {
  text-align: right;
  padding: 15px 0 0;
  border-top: 1px solid #e4e7ed;
}

 

/* 滚动条样式 */
.view-content::-webkit-scrollbar {
  width: 6px;
}

.view-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.view-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.view-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 机型配置区域样式 - 紧凑表格样式 */
.model-config-list {
  margin: 10px 0;
}

.config-table {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.config-row {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
}

.config-row:last-child {
  border-bottom: none;
}

.config-header {
  background: #f5f7fa;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
}

.config-col {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
}

.config-col:first-child {
  flex: 0 0 60px;
  border-right: 1px solid #e4e7ed;
}

.config-col:nth-child(2) {
  flex: 1.2;
  border-right: 1px solid #e4e7ed;
}

.config-col:last-child {
  flex: 1.5;
}

.config-index {
  background: #fafbfc;
  color: #909399;
  font-weight: 500;
}

.config-row:not(.config-header):hover {
  background: #f5f7fa;
}

.no-model-config {
  text-align: center;
  color: #909399;
  padding: 20px;
  background: #f8f9fa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-col {
    padding: 6px 8px;
    font-size: 12px;
  }

  .config-col:first-child {
    flex: 0 0 50px;
  }
}
</style>
