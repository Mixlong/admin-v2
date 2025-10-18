<template>
  <el-dialog 
    title="编辑包装信息" 
    :visible.sync="dialogVisible" 
    width="98%" 
    top="0vh"
    :close-on-click-modal="false"
    append-to-body
    custom-class="packaging-dialog"
    @close="handleClose"
  >
    <div class="packaging-form">
      <!-- 使用 el-table 标准多级表头 -->
      <el-table 
        :data="tableData" 
        border 
        size="small"
        style="width: 100%"
        class="packaging-table-vertical-top no-hover-table"
        :cell-style="cellStyle"
        :row-style="rowStyle"
        :row-class-name="getRowClassName"
      >
        <!-- 第一大列：附件出库方式（从配置文件读取） -->
        <el-table-column :label="PACKAGING_FIELDS['解件出库方式'].displayName" align="center">
          <!-- 遍历配置生成子列 - 真正的统一管理！ -->
          <el-table-column 
            v-for="(field, fieldKey) in PACKAGING_FIELDS['解件出库方式'].fields"
            :key="fieldKey"
            :label="field.displayName"
            :width="field.width"
            :min-width="field.minWidth"
            header-align="center"
          >
            <template slot-scope="scope">
              <!-- select 类型 -->
              <div v-if="field.formType === 'select'" class="simple-select-cell">
                <el-select 
                  v-model="formData['解件出库方式'][fieldKey]" 
                  placeholder="请选择" 
                  size="small"
                  style="width: 100%"
                >
                  <el-option 
                    v-for="opt in field.options"
                    :key="opt.value"
                    :label="opt.label" 
                    :value="opt.value" 
                  />
                </el-select>
              </div>
              
              <!-- richtext 类型 -->
              <div v-else-if="field.formType === 'richtext'" class="rich-text-cell full-height-cell">
                <Editor 
                  v-model="formData['解件出库方式'][fieldKey]" 
                  :min-height="field.minHeight || 284"
                  placeholder="请输入其它附件要求，可使用工具栏的图片按钮上传图片或文件"
                  :toolbar="customToolbar"
                />
              </div>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- 其他列：附件装箱方式、箱唛要求、检验报告要求（从配置文件读取） -->
        <el-table-column 
          v-for="groupKey in ['附件装箱方式', '箱唛要求', '检验报告要求']"
          :key="groupKey"
          :label="PACKAGING_FIELDS[groupKey].displayName"
          :min-width="PACKAGING_FIELDS[groupKey].minWidth"
          header-align="center"
        >
          <template slot-scope="scope">
            <div class="select-with-rich-cell">
              <!-- 下拉框 -->
              <el-select 
                v-model="formData[groupKey].value" 
                placeholder="请选择" 
                size="small"
                style="width: 100%; margin-bottom: 10px;"
                @change="handleSelectChange(groupKey)"
              >
                <el-option 
                  v-for="opt in PACKAGING_FIELDS[groupKey].fields.value.options"
                  :key="opt.value"
                  :label="opt.label" 
                  :value="opt.value" 
                />
              </el-select>
              
              <!-- 富文本（按配置显示） -->
              <div v-if="shouldShowEditor(groupKey)" class="admin-editor-wrapper">
                <div class="admin-editor-box">
                  <Editor 
                    v-model="formData[groupKey].administrator" 
                    :min-height="PACKAGING_FIELDS[groupKey].fields.administrator.minHeight"
                    placeholder="可使用工具栏的图片按钮上传多张图片或其它文件，支持在线查看和下载"
                    :toolbar="customToolbar"
                  />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">取 消</el-button>
      <el-button type="primary" @click="handleSave" size="small" :loading="saving">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Editor from '@/components/Editor'
import { 
  PACKAGING_FIELDS, 
  getFieldValue, 
  getFieldDefaultValue,
  normalizePackagingData,
  getGroupFieldKeys,
  shouldShowRichtext
} from '@/config/fieldConfigs/packaging'

export default {
  name: 'PackagingInfoEdit',
  components: {
    Editor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    packagingInfo: {
      type: [String, Object, Array],
      default: null
    }
  },
  data() {
    return {
      saving: false,
      tableData: [{}], // 只有一行数据
      // 自定义工具栏：只保留加粗、字体大小、颜色、链接、文件上传
      customToolbar: [
        ['bold'],                                        // 加粗
        [{ size: ['small', false, 'large', 'huge'] }],  // 字体大小
        [{ color: [] }],                                 // 字体颜色
        ['link']                                         // 链接（文件上传按钮会自动添加，支持所有类型包括图片和PDF）
      ],
      // 使用配置文件初始化表单数据 - 集中管理，易于维护
      formData: this.initFormData(),
      // 挂载配置到 data，template 可以使用
      PACKAGING_FIELDS
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
  watch: {
    visible(val) {
      if (val) {
        console.log('👁️ 弹窗打开，准备加载数据')
        // 使用 nextTick 确保 packagingInfo prop 已更新
        this.$nextTick(() => {
          this.loadData()
          this.disableTableHover()
        })
      } else {
        console.log('👁️ 弹窗关闭')
      }
    },
    packagingInfo: {
      handler(newVal, oldVal) {
        console.log('🔔 packagingInfo 发生变化')
        console.log('  - 旧值:', oldVal)
        console.log('  - 新值:', newVal)
        console.log('  - 弹窗可见:', this.visible)
        
        // 当 packagingInfo 变化且弹窗可见时，重新加载数据
        if (this.visible && newVal !== undefined) {
          console.log('🔄 触发重新加载数据')
          this.$nextTick(() => {
            this.loadData()
          })
        }
      },
      immediate: false
    }
  },
  mounted() {
    this.disableTableHover()
  },
  methods: {
    // ========== 数据初始化方法（使用配置文件） ==========
    
    /**
     * 初始化表单数据
     * 从配置文件自动生成，默认值也从配置读取 - 真正的统一管理！
     */
    initFormData() {
      const formData = {}
      
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        formData[groupKey] = {}
        const fields = PACKAGING_FIELDS[groupKey].fields
        
        Object.keys(fields).forEach(fieldKey => {
          // 从配置读取默认值
          formData[groupKey][fieldKey] = getFieldDefaultValue(groupKey, fieldKey)
        })
      })
      
      return formData
    },
    
    // ========== 表格样式方法 ==========
    
    // 表格行样式
    rowStyle() {
      return {
        'background-color': '#ffffff !important'
      }
    },
    
    // 表格单元格样式
    cellStyle() {
      return {
        'vertical-align': 'top',
        'background-color': '#ffffff !important'
      }
    },
    
    // 表格行类名
    getRowClassName() {
      return 'custom-no-hover-row'
    },
    
    // 禁用表格hover效果
    disableTableHover() {
      this.$nextTick(() => {
        const table = this.$el.querySelector('.no-hover-table')
        if (table) {
          const rows = table.querySelectorAll('.el-table__body tr')
          rows.forEach(row => {
            row.addEventListener('mouseenter', (e) => {
              const cells = row.querySelectorAll('td')
              cells.forEach(cell => {
                cell.style.backgroundColor = '#ffffff'
              })
            })
          })
        }
      })
    },
    
    handleSelectChange(fieldName) {
      // 下拉框改变时的回调
      console.log(`${fieldName} 选择了:`, this.formData[fieldName].value)
      
      // 如果切换到不需要附件的选项，清空 administrator 内容
      if (!this.shouldShowEditor(fieldName)) {
        this.formData[fieldName].administrator = ''
      }
    },
    
    // 判断是否应该显示富文本编辑器（从配置读取）
    shouldShowEditor(groupKey) {
      const value = this.formData[groupKey]?.value || ''
      return shouldShowRichtext(groupKey, 'administrator', value)
    },
    
    loadData() {
      console.log('🔄 开始加载包装信息数据...')
      console.log('📦 原始 packagingInfo:', this.packagingInfo)
      
      if (!this.packagingInfo) {
        console.log('⚠️ packagingInfo 为空，重置表单')
        this.resetForm()
        return
      }

      let processedData = this.packagingInfo

      if (typeof this.packagingInfo === 'string' && this.packagingInfo.trim()) {
        console.log('🔍 检测到字符串格式，开始解析...')
        try {
          processedData = JSON.parse(this.packagingInfo)
          console.log('✅ 解析成功:', processedData)
        } catch (error) {
          console.error('❌ 解析包装信息失败:', error)
          this.resetForm()
          return
        }
      }

      if (Array.isArray(processedData)) {
        console.log('📋 检测到旧格式（数组），使用旧格式加载器')
        this.loadOldFormat(processedData)
      } else if (typeof processedData === 'object') {
        console.log('📋 检测到新格式（对象），使用新格式加载器')
        this.loadNewFormat(processedData)
      } else {
        console.error('❌ 未知的数据格式:', typeof processedData)
      }
    },

    loadOldFormat(oldData) {
      console.log('📥 加载旧格式数据:', oldData)
      
      const mapping = {
        'ditaiStandardNoLockAttachment': { group: '解件出库方式', field: '支架螺丝' },
        'accessoryPackingRequirements': { group: '附件装箱方式', field: 'value' },
        'packagingRequirementsCardboardWaterproofBag': { group: '箱唛要求', field: 'value' },
        'boxMarkRequirements': { group: '箱唛要求', field: 'value' },
        'inspectionReportRequirements': { group: '检验报告要求', field: 'value' }
      }

      oldData.forEach(item => {
        const map = mapping[item.checkItemId]
        if (map) {
          if (map.group === '解件出库方式') {
            this.formData[map.group][map.field] = this.convertOldContentId(item.contentId)
          } else {
            this.formData[map.group].value = this.convertOldContentId(item.contentId)
          }
          
          if (item.details && map.group !== '解件出库方式') {
            this.formData[map.group].administrator = item.details
          }
        }
      })
    },

    convertOldContentId(contentId) {
      const mapping = {
        'ditaiStandardNoLockAttachment': '不锁，以附件出货',
        'customerSpecifiedNoLock': '不锁，以附件出货',
        'customerSpecifiedNormalLock': '锁上出货',
        'ditaiStandardAllAccessoriesUnifiedTailNumber': '放置尾数箱',
        'customerSpecified': '客户模板（参考附件，内容根据订单内容做修改）',
        'accordingToBOM': '迪太模板',
        'ditaiTemplate': '迪太模板',
        'ditaiEnglishIndicators': '迪太模板'
      }
      return mapping[contentId] || contentId
    },

    /**
     * 加载新格式数据（使用配置文件自动处理兼容性）
     * 优势：自动处理历史字段名，无需手动写映射代码
     */
    loadNewFormat(newData) {
      console.log('📥 加载新格式数据:', newData)
      
      // 使用配置文件的工具函数自动标准化数据（自动处理历史别名）
      const normalized = normalizePackagingData(newData)
      console.log('🔄 标准化后的数据:', normalized)
      
      // 将标准化后的数据填充到 formData
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        if (!normalized[groupKey]) return
        
        const fieldKeys = getGroupFieldKeys(groupKey)
        
        fieldKeys.forEach(fieldKey => {
          const value = normalized[groupKey][fieldKey]
          if (value !== undefined) {
            this.$set(this.formData[groupKey], fieldKey, value)
          }
        })
        
        console.log(`✅ ${groupKey} 加载完成:`, this.formData[groupKey])
      })
      
      console.log('✅ 所有数据加载完成，当前formData:', JSON.parse(JSON.stringify(this.formData)))
    },

    /**
     * 重置表单（使用配置文件初始化）
     * 优势：字段修改只需改配置文件，这里无需修改
     */
    resetForm() {
      this.formData = this.initFormData()
    },

    handleSave() {
      const newFormatData = this.convertToNewFormat()
      console.log('💾 保存新格式数据:', newFormatData)
      
      this.$emit('save', newFormatData)
      this.dialogVisible = false
    },

    /**
     * 转换为新格式保存（使用配置文件遍历）
     * 优势：新增字段只需修改配置文件，这里自动处理
     */
    convertToNewFormat() {
      const result = {}

      // 遍历所有分组（从配置文件读取）
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        const fieldKeys = getGroupFieldKeys(groupKey)
        const groupData = {}
        
        fieldKeys.forEach(fieldKey => {
          const value = this.formData[groupKey]?.[fieldKey]
          if (value !== undefined && value !== '') {
            groupData[fieldKey] = value
          }
        })
        
        // 只保存有数据的分组
        if (Object.keys(groupData).length > 0) {
          // 对于 value/administrator 结构，统一保存为对象
          if (fieldKeys.includes('value') && fieldKeys.includes('administrator')) {
            result[groupKey] = {
              value: groupData.value || '',
              administrator: groupData.administrator || ''
            }
          } else {
            result[groupKey] = groupData
          }
        }
      })

      return result
    },

    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
.packaging-dialog {
  :deep(.el-dialog__body) {
    padding: 15px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

.packaging-form {
  :deep(.el-table) {
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    overflow: hidden;
    
    .el-table__header {
      th {
        background: linear-gradient(180deg, #F8F9FA 0%, #F0F2F5 100%);
        color: #303133;
        font-weight: 600;
        border-bottom: 2px solid #E4E7ED;
        padding: 14px 10px;
        font-size: 13px;
      }
    }
    
    .el-table__body {
      td {
        padding: 0 !important;
        vertical-align: top !important;
      }
      
      tr:hover > td {
        background-color: transparent !important;
      }
    }
    
    // 确保单元格内容容器也是顶部对齐
    .cell {
      padding: 0 !important;
      line-height: normal;
      vertical-align: top !important;
    }
    
    // 强制所有表格单元格内容顶部对齐
    td {
      vertical-align: top !important;
    }
    
    .el-table__cell {
      vertical-align: top !important;
    }
  }
}

// 针对特定表格的垂直对齐样式
.packaging-dialog {
  background: #F8F9FA;
  
  // 禁用hover背景色 - 终极解决方案
  ::v-deep .no-hover-table {
    .el-table__body {
      tr.custom-no-hover-row {
        &:hover > td,
        &:hover > td.el-table__cell {
          background-color: #ffffff !important;
        }
      }
      
      tr:hover > td,
      tr:hover > td.el-table__cell {
        background-color: #ffffff !important;
      }
    }
    
    &.el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #ffffff !important;
    }
    
    // 确保单元格垂直对齐
    td.el-table__cell {
      vertical-align: top !important;
      background-color: #ffffff !important;
    }
  }
}

// 简单下拉框单元格
.simple-select-cell {
  display: block;
}

// 富文本单元格（直接显示）
.rich-text-cell {
  padding: 8px 10px;
  height: auto;
  min-height: auto;
  
  &.pink-cell {
    background: linear-gradient(135deg, #FFF9FA 0%, #FFEFF5 100%);
  }
  
  // 100%高度占满容器
  &.full-height-cell {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
    
    :deep(.editor) {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .ql-toolbar {
        flex-shrink: 0;
        padding: 6px 8px;
        min-height: 32px;
        border-radius: 0;
        margin: 0;
      }
      
      .ql-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .ql-editor {
          flex: 1;
          min-height: 0 !important;
          padding: 8px 10px;
          font-size: 13px;
          line-height: 1.4;
          overflow-y: auto;
          
          &.ql-blank::before {
            font-size: 12px;
            color: #C0C4CC;
          }
        }
      }
      
      // 工具栏按钮更小
      .ql-toolbar .ql-formats {
        margin-right: 10px;
      }
      
      .ql-toolbar button {
        width: 24px;
        height: 24px;
        padding: 2px;
      }
    }
  }
  
  // 让编辑器更紧凑（非全高度模式）
  :deep(.editor) {
    .ql-toolbar {
      padding: 6px 8px;
      min-height: 32px;
      border-radius: 4px 4px 0 0;
    }
    
    .ql-container {
      .ql-editor {
        min-height: 40px !important;
        padding: 8px 10px;
        font-size: 13px;
        line-height: 1.4;
        
        &.ql-blank::before {
          font-size: 12px;
          color: #C0C4CC;
        }
      }
    }
    
    // 工具栏按钮更小
    .ql-toolbar .ql-formats {
      margin-right: 10px;
    }
    
    .ql-toolbar button {
      width: 24px;
      height: 24px;
      padding: 2px;
    }
  }
}

// 下拉框+富文本单元格
.select-with-rich-cell {
  &.pink-cell {
    background: linear-gradient(135deg, #FFF9FA 0%, #FFEFF5 100%);
  }
  
  :deep(.el-select) {
    width: 100%;
    
    .el-input__inner {
      border-radius: 6px;
      border: 1px solid #DCDFE6;
      transition: all 0.3s;
      height: 32px;
      
      &:hover {
        border-color: #C0C4CC;
      }
      
      &:focus {
        border-color: #409EFF;
      }
    }
  }
  
  .admin-editor-wrapper {
    margin-top: 8px;
  }
  
  .admin-editor-box {
    background: #FFF;
    border-radius: 4px;
    border: 1px solid #E4E7ED;
    
    // 让编辑器更紧凑
    :deep(.editor) {
      .ql-toolbar {
        padding: 6px 8px;
        min-height: 32px;
        border-radius: 4px 4px 0 0;
      }
      
      .ql-container {
        .ql-editor {
          min-height: 40px !important;
          padding: 8px 10px;
          font-size: 13px;
          line-height: 1.4;
          
          &.ql-blank::before {
            font-size: 12px;
            color: #C0C4CC;
          }
        }
      }
      
      // 工具栏按钮更小
      .ql-toolbar .ql-formats {
        margin-right: 10px;
      }
      
      .ql-toolbar button {
        width: 24px;
        height: 24px;
        padding: 2px;
      }
    }
  }
}

// 编辑器标签样式
.editor-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: linear-gradient(180deg, #FF6B9D 0%, #FFA8C5 100%);
    border-radius: 2px;
    margin-right: 6px;
  }
}

.dialog-footer {
  text-align: right;
  border-top: 1px solid #EBEEF5;
  padding-top: 15px;
  margin-top: 20px;
}

:deep(.editor) {
  .ql-toolbar {
    background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
    border: 1px solid #E4E7ED;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    padding: 8px 10px;
    
    .ql-stroke {
      stroke: #606266;
    }
    
    .ql-fill {
      fill: #606266;
    }
    
    button:hover {
      .ql-stroke {
        stroke: #409EFF;
      }
      
      .ql-fill {
        fill: #409EFF;
      }
    }
  }
  
  .ql-container {
    border: 1px solid #E4E7ED;
    border-radius: 0 0 6px 6px;
    font-size: 13px;
    line-height: 1.6;
    
    .ql-editor {
      min-height: 180px;
      padding: 12px 15px;
      
      &.ql-blank::before {
        color: #C0C4CC;
        font-style: normal;
        font-size: 13px;
      }
    }
  }
  
  // 确保编辑器内容区域有足够高度
  .ql-editor {
    overflow-y: auto;
  }
}
</style>

<style lang="scss">
/* 全局样式 - 强制禁用包装信息表格的hover效果 */
.packaging-dialog .no-hover-table.el-table tbody tr:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table.el-table--enable-row-hover tbody tr:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table .custom-no-hover-row:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table .el-table__body tr:hover {
  background-color: #ffffff !important;
}
</style>

