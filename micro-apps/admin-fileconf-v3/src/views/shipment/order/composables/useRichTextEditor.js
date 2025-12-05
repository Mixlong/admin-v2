/**
 * 富文本编辑器 Composable
 * 处理富文本弹窗编辑逻辑
 */
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { richTextFieldTitles, richTextFieldPlaceholders } from '../config/columns'
import { isCellDisabled } from './useFieldControl'

export function useRichTextEditor(optionsOrIsColumnEditable, hasEditPermissionParam) {
  // 兼容两种调用方式
  let onSave = null
  let isColumnEditable = null
  let hasEditPermission = null
  
  if (typeof optionsOrIsColumnEditable === 'function') {
    // 新方式：传递两个参数
    isColumnEditable = optionsOrIsColumnEditable
    hasEditPermission = hasEditPermissionParam
  } else if (typeof optionsOrIsColumnEditable === 'object') {
    // 旧方式：传递一个对象
    onSave = optionsOrIsColumnEditable.onSave
  }
  
  // 富文本编辑对话框状态
  const richTextDialog = reactive({
    visible: false,
    content: '',
    originalContent: '',
    row: null,
    field: '',
    readonly: false
  })

  /**
   * 获取富文本字段标题
   */
  const getRichTextFieldTitle = (field) => {
    return richTextFieldTitles[field] || ''
  }

  /**
   * 获取富文本字段占位符
   */
  const getRichTextFieldPlaceholder = (field) => {
    return richTextFieldPlaceholders[field] || '请输入内容'
  }

  /**
   * 打开富文本编辑对话框
   */
  const openRichTextDialog = (row, field) => {
    // 检查单元格是否被冻结
    const isFrozen = isCellDisabled(row, field)
    
    // 检查是否有编辑权限（兼容两种方式）
    let canEdit = true
    if (hasEditPermission && isColumnEditable) {
      canEdit = hasEditPermission.value && isColumnEditable(field)
    }
    
    // 冻结的单元格以只读模式打开
    richTextDialog.readonly = isFrozen || !canEdit
    
    richTextDialog.row = row
    richTextDialog.field = field
    richTextDialog.content = row[field] || ''
    richTextDialog.originalContent = row[field] || ''
    richTextDialog.visible = true
  }

  /**
   * 保存富文本
   */
  const handleRichTextSave = () => {
    if (!richTextDialog.row || !richTextDialog.field) return
    
    const row = richTextDialog.row
    const field = richTextDialog.field
    const newValue = richTextDialog.content
    const oldValue = richTextDialog.originalContent
    
    // 只有值真正改变了才更新和标记
    if (newValue !== oldValue) {
      // 先更新行数据
      row[field] = newValue
      
      // 标记编辑过的字段（非新增行）
      if (!row._isNew) {
        if (!row._editedFields) row._editedFields = {}
        row._editedFields[field] = true
      }
      
      // 如果有 onSave 回调（旧方式），调用它进行额外处理（如刷新表格）
      if (onSave) {
        onSave(field, newValue)
      }
    }
    
    richTextDialog.visible = false
    ElMessage.success('保存成功')
  }

  /**
   * 关闭对话框
   */
  const closeRichTextDialog = () => {
    richTextDialog.visible = false
  }

  return {
    richTextDialog,
    getRichTextFieldTitle,
    getRichTextFieldPlaceholder,
    openRichTextDialog,
    handleRichTextSave,
    saveRichText: handleRichTextSave, // 别名，兼容旧代码
    closeRichTextDialog
  }
}
