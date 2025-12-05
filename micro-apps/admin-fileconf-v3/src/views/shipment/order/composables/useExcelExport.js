/**
 * Excel导出功能 Composable
 * 
 * 核心功能：
 * 1. 二级表头支持（分组列合并）
 * 2. HTML富文本转Excel Rich Text（保留颜色、加粗、斜体等）
 * 3. 动态列配置（根据用户自定义列顺序导出）
 * 4. 字段变更检测（标红显示）
 * 5. 条件格式（未发货量、订单耗时等）
 * 
 * 技术方案：
 * - 使用浏览器原生 DOMParser 解析 HTML
 * - ExcelJS Rich Text 格式输出
 * - 支持所有 CSS 颜色格式（命名颜色、HEX、RGB）
 * - 无需第三方颜色库（tinycolor2等）
 */
import { ElMessage } from 'element-plus'
import { getShipmentOrderList } from '@/api/shipment/order'
import { initOriginalValues, isFieldChanged } from './useFieldControl'
import { parseTime } from '@/utils/ruoyi'

/**
 * 提取单元格值（处理富文本）
 */
function extractCellValue(row, col) {
  const value = row[col.field]
  
  // 空值处理（0是有效值）
  if (value === null || value === undefined || value === '') return ''
  
  // 多选字段
  if (col.type === 'multi-select' && Array.isArray(value)) {
    return value.join(', ')
  }
  
  // 日期字段
  if (col.type === 'date' && value) {
    return parseTime(value, '{y}-{m}-{d}')
  }
  
  // 字符串类型
  if (typeof value !== 'string') return value
  
  // 富文本字段：去除HTML标签
  const richTextFields = ['pmcDate', 'deliveryChangeLog', 'specialRemark', 'customerMaterial', 'customerMaterialArrival']
  const isRichText = col.type === 'richtext' || richTextFields.includes(col.field)
  const hasHtmlTags = value.includes('<')
  
  if (isRichText || hasHtmlTags) {
    return value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/<em[^>]*>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<u[^>]*>/gi, '')
      .replace(/<\/u>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }
  
  return value
}

/**
 * HTML转Excel Rich Text
 */
function convertHtmlToRichText(htmlString) {
  if (!htmlString || typeof htmlString !== 'string' || !htmlString.includes('<')) {
    return null
  }
  
  const richText = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  
  // CSS颜色转ARGB
  const cssColorToArgb = (color) => {
    if (!color) return null
    color = color.trim().toLowerCase()
    
    // 命名颜色
    const namedColors = {
      'red': 'FFF56C6C', 'green': 'FF67C23A', 'blue': 'FF409EFF',
      'orange': 'FFE6A23C', 'yellow': 'FFE6A23C', 'black': 'FF000000',
      'white': 'FFFFFFFF', 'gray': 'FF909399', 'grey': 'FF909399'
    }
    if (namedColors[color]) return namedColors[color]
    
    // 十六进制 #RGB 或 #RRGGBB
    if (color.startsWith('#')) {
      let hex = color.substring(1)
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
      }
      if (hex.length === 6) {
        return 'FF' + hex.toUpperCase()
      }
    }
    
    // RGB/RGBA
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      return ('FF' + r + g + b).toUpperCase()
    }
    
    return null
  }
  
  // 获取元素样式
  const getCurrentStyle = (element) => {
    if (!element) return {}
    
    const style = {}
    
    // 颜色
    const styleColor = element.style.color
    if (styleColor) {
      const argb = cssColorToArgb(styleColor)
      if (argb) style.color = { argb }
    }
    
    // 加粗
    if (element.tagName === 'STRONG' || element.tagName === 'B' || 
        element.style.fontWeight === 'bold') {
      style.bold = true
    }
    
    // 斜体
    if (element.tagName === 'EM' || element.tagName === 'I' || 
        element.style.fontStyle === 'italic') {
      style.italic = true
    }
    
    // 下划线
    if (element.tagName === 'U' || element.style.textDecoration === 'underline') {
      style.underline = true
    }
    
    // 递归父元素
    if (element.parentElement && element.parentElement.tagName !== 'BODY') {
      const parentStyle = getCurrentStyle(element.parentElement)
      return { ...parentStyle, ...style }
    }
    
    return style
  }
  
  // 递归解析节点
  const parseNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (text) {
        richText.push({
          text: text,
          font: getCurrentStyle(node.parentElement)
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 换行标签
      if (node.tagName === 'BR') {
        richText.push({ text: '\n', font: {} })
      }
      
      // 递归子节点
      node.childNodes.forEach(child => parseNode(child))
      
      // 段落结束换行
      if (node.tagName === 'P' || node.tagName === 'DIV') {
        richText.push({ text: '\n', font: {} })
      }
    }
  }
  
  parseNode(doc.body)
  
  return richText.length > 0 ? { richText } : null
}

/**
 * 应用单元格样式
 */
function applyCellStyle(cell, row, col) {
  // 字段变更检测
  const changeCheckFields = ['u8OrderNo', 'bomCode', 'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderQty']
  if (changeCheckFields.includes(col.field)) {
    if (isFieldChanged(row, col.field)) {
      cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
      return
    }
  }
  
  // 未发货量
  if (col.field === 'unshippedQty' && row.unshippedQty > 0) {
    cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
    return
  }
  
  // 订单耗时
  if (col.field === 'orderDays' && row.orderDays > 60) {
    cell.font = { color: { argb: 'FFF56C6C' }, bold: true }
    return
  }
  
  // 已发货量
  if (col.field === 'shippedQty' && row.shippedQty > 0) {
    cell.font = { color: { argb: 'FF67C23A' } }
    return
  }
}

/**
 * 设置单元格值
 */
function setCellValue(cell, row, col) {
  const richTextFields = ['pmcDate', 'deliveryChangeLog', 'specialRemark', 'customerMaterial', 'customerMaterialArrival']
  const isRichTextField = col.type === 'richtext' || richTextFields.includes(col.field)
  const value = row[col.field]
  
  // 富文本字段：尝试转换为 Rich Text
  if (isRichTextField && value) {
    const richTextValue = convertHtmlToRichText(value)
    if (richTextValue) {
      cell.value = richTextValue
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    } else {
      cell.value = extractCellValue(row, col)
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    }
  } else {
    cell.value = extractCellValue(row, col)
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  }
  
  // 边框
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
  
  // 条件样式
  applyCellStyle(cell, row, col)
}

/**
 * Excel导出 Composable
 */
export function useExcelExport() {
  
  /**
   * 导出Excel
   */
  const exportToExcel = async (searchForm, visibleColumns) => {
    try {
      ElMessage.info('正在导出，请稍候...')
      
      // 1. 获取全量数据
      const res = await getShipmentOrderList({
        pageNum: 1,
        pageSize: 100000,
        ...searchForm
      })
      
      if (!res || !res.rows) {
        ElMessage.error('获取数据失败')
        return
      }
      
      // 2. 初始化原始值
      const monitorFields = ['u8OrderNo', 'bomCode', 'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderQty']
      res.rows.forEach(row => {
        initOriginalValues(row, monitorFields)
      })
      
      const exportData = res.rows
      
      // 3. 构建Excel
      const ExcelJS = await import('exceljs')
      const { saveAs } = await import('file-saver')
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('订单列表')
      
      // 4. 构建二级表头
      const headerRow1 = ['序号']
      const headerRow2 = ['序号']
      let colIndex = 1
      
      visibleColumns.forEach(col => {
        if (col.children && col.children.length > 0) {
          col.children.forEach(child => {
            headerRow1.push(col.title)
            headerRow2.push(child.title)
            colIndex++
          })
        } else {
          headerRow1.push(col.title)
          headerRow2.push(col.title)
          colIndex++
        }
      })
      
      // 5. 添加表头
      const row1 = worksheet.addRow(headerRow1)
      row1.font = { bold: true, size: 11 }
      row1.alignment = { horizontal: 'center', vertical: 'middle' }
      row1.height = 25
      row1.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      const row2 = worksheet.addRow(headerRow2)
      row2.font = { bold: true, size: 10 }
      row2.alignment = { horizontal: 'center', vertical: 'middle' }
      row2.height = 22
      row2.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      // 6. 合并单元格
      colIndex = 1
      visibleColumns.forEach(col => {
        if (col.children && col.children.length > 0) {
          const startCol = colIndex + 1
          const endCol = colIndex + col.children.length
          worksheet.mergeCells(1, startCol, 1, endCol)
          colIndex += col.children.length
        } else {
          worksheet.mergeCells(1, colIndex + 1, 2, colIndex + 1)
          colIndex++
        }
      })
      worksheet.mergeCells(1, 1, 2, 1)
      
      // 7. 添加数据行
      exportData.forEach((row, index) => {
        const excelRow = worksheet.addRow([])
        excelRow.height = 20
        
        // 序号
        const seqCell = excelRow.getCell(1)
        seqCell.value = index + 1
        seqCell.alignment = { horizontal: 'center', vertical: 'middle' }
        seqCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        // 数据列
        let cellIndex = 1
        visibleColumns.forEach(col => {
          if (col.children && col.children.length > 0) {
            col.children.forEach(child => {
              cellIndex++
              setCellValue(excelRow.getCell(cellIndex), row, child)
            })
          } else {
            cellIndex++
            setCellValue(excelRow.getCell(cellIndex), row, col)
          }
        })
      })
      
      // 8. 设置列宽
      worksheet.columns = [
        { width: 6 },
        ...visibleColumns.flatMap(col => {
          if (col.children && col.children.length > 0) {
            return col.children.map(child => ({ width: (child.width || 120) / 7 }))
          } else {
            return [{ width: (col.width || 120) / 7 }]
          }
        })
      ]
      
      // 9. 冻结表头
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }]
      
      // 10. 下载文件
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `出货订单_${new Date().toISOString().split('T')[0]}.xlsx`)
      ElMessage.success(`导出成功！共 ${exportData.length} 条数据`)
      
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败: ' + error.message)
    }
  }
  
  return {
    exportToExcel
  }
}
