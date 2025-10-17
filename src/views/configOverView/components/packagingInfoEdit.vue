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
        <!-- 第一大列：附件出库方式（包含4个子列） -->
        <el-table-column label="附件出库方式" align="center">
          <!-- 支架螺丝 -->
          <el-table-column label="支架螺丝" width="230" header-align="center">
            <template slot-scope="scope">
              <div class="simple-select-cell" style="vertical-align: top !important; align-items: flex-start; display: flex; flex-direction: column;">
                <el-select 
                  v-model="formData.解件出库方式.支架螺丝" 
                  placeholder="请选择" 
                  size="small"
                  style="width: 100%"
                >
                  <el-option label="锁上出货" value="锁上出货" />
                  <el-option label="不锁，以附件出货" value="不锁，以附件出货" />
                  <el-option label="不涉及" value="不涉及" />
                </el-select>
              </div>
            </template>
          </el-table-column>
          
          <!-- 按栓螺丝 -->
          <el-table-column label="按栓螺丝" width="230" header-align="center">
            <template slot-scope="scope">
              <div class="simple-select-cell">
                <el-select 
                  v-model="formData.解件出库方式.按栓螺丝" 
                  placeholder="请选择" 
                  size="small"
                  style="width: 100%"
                >
                  <el-option label="锁上出货" value="锁上出货" />
                  <el-option label="不锁，以附件出货" value="不锁，以附件出货" />
                  <el-option label="不涉及" value="不涉及" />
                </el-select>
              </div>
            </template>
          </el-table-column>
          
          <!-- 硅胶垫片 -->
          <el-table-column label="硅胶垫片" width="230" header-align="center">
            <template slot-scope="scope">
              <div class="simple-select-cell">
                <el-select 
                  v-model="formData.解件出库方式.硅胶垫片" 
                  placeholder="请选择" 
                  size="small"
                  style="width: 100%"
                >
                  <el-option label="粘贴出货" value="粘贴出货" />
                  <el-option label="不锁，以附件出货" value="不锁，以附件出货" />
                  <el-option label="不涉及" value="不涉及" />
                </el-select>
              </div>
            </template>
          </el-table-column>
          
          <!-- 其它附件要求 -->
          <el-table-column label="其它附件要求" min-width="250" header-align="center">
            <template slot-scope="scope">
              <div class="rich-text-cell full-height-cell">
                <Editor 
                  v-model="formData.解件出库方式.其它附件要求" 
                  :min-height="284"
                  placeholder="请输入其它附件要求，可使用工具栏的图片按钮上传图片或文件"
                  :toolbar="customToolbar"
                />
              </div>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- 附件装箱方式 -->
        <el-table-column label="附件装箱方式" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="select-with-rich-cell">
              <el-select 
                v-model="formData.附件装箱方式.value" 
                placeholder="请选择" 
                size="small"
                style="width: 100%; margin-bottom: 10px;"
                @change="handleSelectChange('附件装箱方式')"
              >
                <el-option label="其它装箱方式（参考附件）" value="其它装箱方式（参考附件）" />
                <el-option label="放置每箱内" value="放置每箱内" />
                <el-option label="放置尾数箱" value="放置尾数箱" />
              </el-select>
              
              <div v-if="shouldShowEditor('附件装箱方式')" class="admin-editor-wrapper">
                <div class="admin-editor-box">
                  <Editor 
                    v-model="formData.附件装箱方式.administrator" 
                    :min-height="230"
                    placeholder="可使用工具栏的图片按钮上传多张图片或其它文件，支持在线查看和下载"
                    :toolbar="customToolbar"
                  />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 箱唛要求 -->
        <el-table-column label="箱唛要求" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="select-with-rich-cell">
              <el-select 
                v-model="formData.箱唛要求.value" 
                placeholder="请选择" 
                size="small"
                style="width: 100%; margin-bottom: 10px;"
                @change="handleSelectChange('箱唛要求')"
              >
                <el-option label="迪太模板" value="迪太模板" />
                <el-option label="客户模板（参考附件，内容根据订单内容做修改）" value="客户模板（参考附件，内容根据订单内容做修改）" />
                <el-option label="客户系统模板（等出货时，随送货单一起下发）" value="客户系统模板（等出货时，随送货单一起下发）" />
              </el-select>
              
              <div v-if="shouldShowEditor('箱唛要求')" class="admin-editor-wrapper">
                <div class="admin-editor-box">
                  <Editor 
                    v-model="formData.箱唛要求.administrator" 
                    :min-height="230"
                    placeholder="可使用工具栏的图片按钮上传多张图片或其它文件，支持在线查看和下载"
                    :toolbar="customToolbar"
                  />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 检验报告要求 -->
        <el-table-column label="检验报告要求" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="select-with-rich-cell">
              <el-select 
                v-model="formData.检验报告要求.value" 
                placeholder="请选择" 
                size="small"
                style="width: 100%; margin-bottom: 10px;"
                @change="handleSelectChange('检验报告要求')"
              >
                <el-option label="迪太模板" value="迪太模板" />
                <el-option label="客户模板（参考附件，内容根据订单内容做修改）" value="客户模板（参考附件，内容根据订单内容做修改）" />
                <el-option label="客户系统模板（等出货时，随送货单一起下发）" value="客户系统模板（等出货时，随送货单一起下发）" />
              </el-select>
              
              <div v-if="shouldShowEditor('检验报告要求')" class="admin-editor-wrapper">
                <div class="admin-editor-box">
                  <Editor 
                    v-model="formData.检验报告要求.administrator" 
                    :min-height="230"
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
      formData: {
        解件出库方式: {
          支架螺丝: '锁上出货',
          按栓螺丝: '锁上出货',
          硅胶垫片: '粘贴出货',
          其它附件要求: ''
        },
        附件装箱方式: {
          value: '其它装箱方式（参考附件）',
          administrator: ''
        },
        箱唛要求: {
          value: '迪太模板',
          administrator: ''
        },
        检验报告要求: {
          value: '迪太模板',
          administrator: ''
        }
      }
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
    
    // 判断是否应该显示富文本编辑器（只有特定完整选项才显示）
    shouldShowEditor(fieldName) {
      const value = this.formData[fieldName]?.value || ''
      // 只有这些完整的选项才显示富文本编辑器
      const showEditorOptions = [
        '其它装箱方式（参考附件）',
        '客户模板（参考附件，内容根据订单内容做修改）'
      ]
      return showEditorOptions.includes(value)
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

    loadNewFormat(newData) {
      console.log('📥 加载新格式数据:', newData)
      
      // 处理"解件出库方式"分组
      if (newData['解件出库方式']) {
        Object.keys(newData['解件出库方式']).forEach(key => {
          const value = newData['解件出库方式'][key]
          if (typeof value === 'object' && value.value !== undefined) {
            this.$set(this.formData.解件出库方式, key, value.value)
          } else {
            this.$set(this.formData.解件出库方式, key, value)
          }
        })
        console.log('✅ 解件出库方式加载完成:', this.formData.解件出库方式)
      }

      // 处理其他分组（附件装箱方式、箱唛要求、检验报告要求）
      ['附件装箱方式', '箱唛要求', '检验报告要求'].forEach(groupName => {
        if (newData[groupName]) {
          if (typeof newData[groupName] === 'object') {
            this.$set(this.formData[groupName], 'value', newData[groupName].value || '')
            this.$set(this.formData[groupName], 'administrator', newData[groupName].administrator || '')
          } else {
            this.$set(this.formData[groupName], 'value', newData[groupName])
            this.$set(this.formData[groupName], 'administrator', '')
          }
          console.log(`✅ ${groupName}加载完成:`, this.formData[groupName])
        }
      })
      
      console.log('✅ 所有数据加载完成，当前formData:', JSON.parse(JSON.stringify(this.formData)))
    },

    resetForm() {
      this.formData = {
        解件出库方式: {
          支架螺丝: '锁上出货',
          按栓螺丝: '锁上出货',
          硅胶垫片: '粘贴出货',
          其它附件要求: ''
        },
        附件装箱方式: {
          value: '其它装箱方式（参考附件）',
          administrator: ''
        },
        箱唛要求: {
          value: '迪太模板',
          administrator: ''
        },
        检验报告要求: {
          value: '迪太模板',
          administrator: ''
        }
      }
    },

    handleSave() {
      const newFormatData = this.convertToNewFormat()
      console.log('💾 保存新格式数据:', newFormatData)
      
      this.$emit('save', newFormatData)
      this.dialogVisible = false
    },

    convertToNewFormat() {
      const result = {}

      const group1 = {}
      const items1 = ['支架螺丝', '按栓螺丝', '硅胶垫片', '其它附件要求']
      items1.forEach(item => {
        const value = this.formData.解件出库方式[item]
        if (value) {
          group1[item] = value
        }
      })
      if (Object.keys(group1).length > 0) {
        result['解件出库方式'] = group1
      }

      ['附件装箱方式', '箱唛要求', '检验报告要求'].forEach(groupName => {
        const group = this.formData[groupName]
        // 只要有 value 就保存，统一保存为对象格式
        if (group.value) {
          result[groupName] = {
            value: group.value,
            administrator: group.administrator || ''
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
  padding: 10px 12px;
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

