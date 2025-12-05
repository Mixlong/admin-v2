/**
 * 表格列生成 Composable
 * 根据配置数据动态生成 VXE Table 列配置
 */
import { computed, h } from 'vue'
import { getColumnConfigData } from '../config/columns'
import { customerMaterialTagTypeMap, etreeBomAuditedTagMap } from '../config/options'
import { isCellDisabled } from './useFieldControl'

export function useTableColumns({ 
  customerNameOptions, 
  customerMaterialOptions, 
  isColumnEditable, 
  openRichTextDialog 
}) {
  
  /**
   * 通用表头渲染函数 - 自动根据权限显示编辑图标
   */
  const renderHeader = (field, title) => {
    return () => [
      isColumnEditable(field) ? h('i', { 
        class: 'vxe-cell--edit-icon vxe-icon-edit',
        style: 'margin-right: 4px;'
      }) : null,
      h('span', {}, title)
    ]
  }

  /**
   * 列生成器 - 根据配置自动生成完整的 VXE 列配置
   */
  const generateColumn = (config) => {
    const { field, title, width, type, options, selectProps, cellClass, warnCondition } = config
    const editable = isColumnEditable(field)
    
    const column = { 
      field, 
      width, 
      align: 'center'
    }
    
    switch (type) {
      case 'input':
        column.title = title
        if (editable) column.editRender = { name: 'input' }
        // 添加文本筛选
        column.filters = [{ data: '' }]
        column.filterRender = { name: 'input', attrs: { placeholder: '搜索' } }
        if (cellClass) {
          column.slots = { 
            default: ({ row }) => [h('span', { class: cellClass }, row[field] || '-')] 
          }
        }
        break
        
      case 'select':
        column.title = title
        if (editable) {
          column.editRender = { 
            name: 'VxeSelect', 
            options: typeof options === 'function' ? options() : options,
            props: selectProps || { clearable: true }
          }
        }
        // 添加筛选下拉
        const selectOptions = typeof options === 'function' ? options() : options
        if (selectOptions && selectOptions.length > 0) {
          column.filters = selectOptions.map(opt => ({ 
            label: opt.label || opt.dictLabel || opt.name, 
            value: opt.value || opt.dictValue || opt.id 
          }))
          column.filterMultiple = true
        }
        break
        
      case 'multi-select':
        column.title = title
        column.showOverflow = false
        if (editable) {
          column.editRender = { 
            name: 'VxeSelect', 
            options: typeof options === 'function' ? options() : options,
            props: { multiple: true, clearable: true, placeholder: '请选择' }
          }
        }
        column.slots = {
          default: ({ row }) => {
            const value = row[field]
            if (!value || value === '/' || (Array.isArray(value) && value.length === 0)) {
              return [h('span', {}, '/')]
            }
            const values = Array.isArray(value) ? value : [value]
            return values.filter(v => v && v !== '/').map(v => 
              h('span', { 
                class: `el-tag el-tag--${customerMaterialTagTypeMap[v] || 'info'} el-tag--small`, 
                style: 'margin: 2px;' 
              }, v)
            )
          }
        }
        break
        
      case 'tag-select':
        column.title = title
        if (editable) {
          column.editRender = { 
            name: 'VxeSelect', 
            options: typeof options === 'function' ? options() : options
          }
        }
        // 添加筛选下拉
        const tagOptions = typeof options === 'function' ? options() : options
        if (tagOptions && tagOptions.length > 0) {
          column.filters = tagOptions.map(opt => ({ 
            label: opt.label || opt.dictLabel || opt.name, 
            value: opt.value || opt.dictValue || opt.id 
          }))
          column.filterMultiple = true
        }
        column.slots = {
          default: ({ row }) => {
            const val = row[field]
            if (etreeBomAuditedTagMap[val]) {
              return [h('span', { class: `el-tag el-tag--${etreeBomAuditedTagMap[val]} el-tag--small` }, val)]
            }
            return [h('span', {}, '-')]
          }
        }
        break
        
      case 'date':
        column.title = title
        if (editable) {
          column.editRender = { 
            name: 'VxeDatePicker', 
            props: { type: 'date', valueFormat: 'yyyy-MM-dd', clearable: true, placeholder: '请选择日期' }
          }
        }
        // 添加日期筛选
        column.filters = [{ data: '' }]
        column.filterRender = { 
          name: 'VxeDatePicker', 
          props: { type: 'date', valueFormat: 'yyyy-MM-dd', placeholder: '选择日期' } 
        }
        break
        
      case 'number':
        column.title = title
        if (editable) {
          column.editRender = { name: 'VxeNumberInput', props: { min: 0, controls: false } }
        }
        // 添加数字筛选
        column.filters = [{ data: '' }]
        column.filterRender = { name: 'input', attrs: { type: 'number', placeholder: '搜索' } }
        column.slots = {
          default: ({ row }) => {
            const classes = [cellClass]
            if (warnCondition && warnCondition(row)) classes.push('has-unshipped')
            return [h('span', { class: classes }, String(row[field] ?? 0))]
          }
        }
        break
        
      case 'richtext':
        column.headerAlign = 'center'
        column.align = 'left'
        column.slots = {
          header: renderHeader(field, title),
          default: ({ row }) => {
            // 检查单元格是否被冻结
            const isFrozen = isCellDisabled(row, field)
            
            // 富文本单元格始终可点击（冻结时以只读模式打开）
            const classes = ['rich-text-cell', 'rich-text-left', 'clickable-cell']
            
            return [
              h('div', {
                class: classes.join(' '),
                innerHTML: row[field] || '-',
                onClick: () => openRichTextDialog(row, field)
              })
            ]
          }
        }
        break
        
      case 'readonly':
        column.title = title
        column.slots = {
          default: ({ row }) => {
            const classes = ['days-text']
            if (warnCondition && warnCondition(row)) classes.push('warning-days')
            return [h('span', { class: classes }, row[field] || 0)]
          }
        }
        break
        
      default:
        column.title = title
    }
    
    return column
  }

  /**
   * 将列配置按分组整理
   */
  const buildGroupedColumns = (columnConfigData) => {
    // 序号列固定在左侧，确保展示顺序和配置顺序一致
    const result = [{ type: 'seq', title: '序号', width: 60, align: 'center', fixed: 'left' }]
    const groups = {}
    
    columnConfigData.forEach(config => {
      const column = generateColumn(config)
      
      if (config.group) {
        if (!groups[config.group]) {
          groups[config.group] = { title: config.group, align: 'center', children: [] }
          result.push(groups[config.group])
        }
        groups[config.group].children.push(column)
      } else {
        result.push(column)
      }
    })
    
    return result
  }

  /**
   * 计算列配置（根据角色动态生成）
   */
  const tableColumns = computed(() => {
    const columnConfigData = getColumnConfigData({ 
      customerNameOptions, 
      customerMaterialOptions 
    })
    return buildGroupedColumns(columnConfigData)
  })

  return {
    tableColumns,
    renderHeader,
    generateColumn,
    buildGroupedColumns
  }
}
